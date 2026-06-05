using MediatR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Queries.GetPlayersByClubId.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Queries.GetPlayersByClubId;

/// <summary>
/// Query to get a paged, filtered list of players for a specific club
/// </summary>
public record GetPlayersByClubIdQuery(
    Guid ClubId,
    bool IncludeArchived = false,
    string? Search = null,
    Guid? AgeGroupId = null,
    Guid? TeamId = null,
    string? Position = null,
    string? Band = null,
    int Page = 1,
    int PageSize = 20
) : IQuery<PagedResponse<ClubPlayerDto>>;

/// <summary>
/// Handler for GetPlayersByClubIdQuery
/// </summary>
public class GetPlayersByClubIdHandler : IRequestHandler<GetPlayersByClubIdQuery, PagedResponse<ClubPlayerDto>>
{
    private readonly OurGameContext _db;

    public GetPlayersByClubIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<PagedResponse<ClubPlayerDto>> Handle(GetPlayersByClubIdQuery query, CancellationToken cancellationToken)
    {
        var (whereClause, _) = BuildFilter(query);

        // COUNT with same filters
        var countSql = $"SELECT COUNT(*) AS Value FROM Players p WHERE {whereClause}";
        var (_, countParams) = BuildFilter(query);
        var totalCount = (await _db.Database
            .SqlQueryRaw<int>(countSql, countParams)
            .ToListAsync(cancellationToken))[0];

        if (totalCount == 0)
            return PagedResponse<ClubPlayerDto>.Create(new List<ClubPlayerDto>(), query.Page, query.PageSize, 0);

        // Paged player query
        var skip = (query.Page - 1) * query.PageSize;
        var (_, mainFilterParams) = BuildFilter(query);
        var mainParams = new List<object>(mainFilterParams)
        {
            new SqlParameter("@skip", skip),
            new SqlParameter("@pageSize", query.PageSize)
        };

        var mainSql = $@"
            SELECT
                p.Id,
                p.ClubId,
                p.FirstName,
                p.LastName,
                p.Nickname,
                p.DateOfBirth,
                p.Photo,
                p.AssociationId,
                p.PreferredPositions,
                p.OverallRating,
                p.OverallBand,
                p.IsArchived
            FROM Players p
            WHERE {whereClause}
            ORDER BY p.FirstName, p.LastName
            OFFSET @skip ROWS FETCH NEXT @pageSize ROWS ONLY";

        var playerData = await _db.Database
            .SqlQueryRaw<PlayerRawDto>(mainSql, mainParams.ToArray())
            .ToListAsync(cancellationToken);

        if (playerData.Count == 0)
            return PagedResponse<ClubPlayerDto>.Create(new List<ClubPlayerDto>(), query.Page, query.PageSize, totalCount);

        // Fetch related data for the current page's player IDs only
        var playerIds = playerData.Select(p => p.Id).ToList();
        var batchParams = playerIds.Select((id, i) => new SqlParameter($"@p{i}", id)).ToArray();
        var paramNames = string.Join(", ", batchParams.Select(p => p.ParameterName));

        var ageGroupSql = $@"
            SELECT
                pag.PlayerId,
                ag.Id,
                ag.Name
            FROM PlayerAgeGroups pag
            INNER JOIN AgeGroups ag ON pag.AgeGroupId = ag.Id
            WHERE pag.PlayerId IN ({paramNames})
            ORDER BY ag.Name";

        var ageGroupData = await _db.Database
            .SqlQueryRaw<PlayerAgeGroupRawDto>(ageGroupSql, batchParams)
            .ToListAsync(cancellationToken);

        var batchParams2 = playerIds.Select((id, i) => new SqlParameter($"@p{i}", id)).ToArray();

        var teamSql = $@"
            SELECT
                pt.PlayerId,
                t.Id,
                t.AgeGroupId,
                t.Name,
                ag.Name AS AgeGroupName
            FROM PlayerTeams pt
            INNER JOIN Teams t ON pt.TeamId = t.Id
            LEFT JOIN AgeGroups ag ON t.AgeGroupId = ag.Id
            WHERE pt.PlayerId IN ({paramNames})
            ORDER BY ag.Name, t.Name";

        var teamData = await _db.Database
            .SqlQueryRaw<PlayerTeamRawDto>(teamSql, batchParams2)
            .ToListAsync(cancellationToken);

        var ageGroupsByPlayer = ageGroupData
            .GroupBy(ag => ag.PlayerId)
            .ToDictionary(
                g => g.Key,
                g => g.Select(ag => new ClubPlayerAgeGroupDto
                {
                    Id = ag.Id,
                    Name = ag.Name ?? string.Empty
                }).ToList()
            );

        var teamsByPlayer = teamData
            .GroupBy(t => t.PlayerId)
            .ToDictionary(
                g => g.Key,
                g => g.Select(t => new ClubPlayerTeamDto
                {
                    Id = t.Id,
                    AgeGroupId = t.AgeGroupId,
                    Name = t.Name ?? string.Empty,
                    AgeGroupName = t.AgeGroupName
                }).ToList()
            );

        var items = playerData
            .Select(p => new ClubPlayerDto
            {
                Id = p.Id,
                ClubId = p.ClubId,
                FirstName = p.FirstName ?? string.Empty,
                LastName = p.LastName ?? string.Empty,
                Nickname = p.Nickname,
                DateOfBirth = p.DateOfBirth,
                Photo = p.Photo,
                AssociationId = p.AssociationId,
                PreferredPositions = ParsePositions(p.PreferredPositions),
                OverallRating = p.OverallRating,
                OverallBand = p.OverallBand,
                IsArchived = p.IsArchived,
                AgeGroups = ageGroupsByPlayer.TryGetValue(p.Id, out var ageGroups) ? ageGroups : new(),
                Teams = teamsByPlayer.TryGetValue(p.Id, out var teams) ? teams : new()
            })
            .ToList();

        return PagedResponse<ClubPlayerDto>.Create(items, query.Page, query.PageSize, totalCount);
    }

    private static (string WhereClause, object[] Parameters) BuildFilter(GetPlayersByClubIdQuery query)
    {
        var conditions = new List<string> { "p.ClubId = @clubId" };
        var parameters = new List<SqlParameter> { new("@clubId", query.ClubId) };

        if (!query.IncludeArchived)
            conditions.Add("p.IsArchived = 0");

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            conditions.Add("(p.FirstName + ' ' + p.LastName LIKE '%' + @search + '%')");
            parameters.Add(new("@search", query.Search.Trim()));
        }

        if (query.AgeGroupId.HasValue)
        {
            conditions.Add("EXISTS (SELECT 1 FROM PlayerAgeGroups pag WHERE pag.PlayerId = p.Id AND pag.AgeGroupId = @ageGroupId)");
            parameters.Add(new("@ageGroupId", query.AgeGroupId.Value));
        }

        if (query.TeamId.HasValue)
        {
            conditions.Add("EXISTS (SELECT 1 FROM PlayerTeams pt WHERE pt.PlayerId = p.Id AND pt.TeamId = @teamId)");
            parameters.Add(new("@teamId", query.TeamId.Value));
        }

        if (!string.IsNullOrWhiteSpace(query.Position))
        {
            conditions.Add("EXISTS (SELECT 1 FROM OPENJSON(p.PreferredPositions) pos WHERE pos.value = @position)");
            parameters.Add(new("@position", query.Position.Trim()));
        }

        if (!string.IsNullOrWhiteSpace(query.Band) && Enum.TryParse<CompetencyBand>(query.Band, out var band))
        {
            conditions.Add("p.OverallBand = @band");
            parameters.Add(new("@band", (int)band));
        }

        return (string.Join(" AND ", conditions), parameters.Cast<object>().ToArray());
    }

    private static List<string> ParsePositions(string? positions)
    {
        if (string.IsNullOrWhiteSpace(positions))
            return new List<string>();

        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<List<string>>(positions) ?? new List<string>();
        }
        catch (System.Text.Json.JsonException)
        {
            return positions
                .Split(new[] { ',', '|', ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(p => p.Trim())
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .ToList();
        }
    }
}

class PlayerRawDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Nickname { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Photo { get; set; }
    public string? AssociationId { get; set; }
    public string? PreferredPositions { get; set; }
    public int? OverallRating { get; set; }
    public CompetencyBand? OverallBand { get; set; }
    public bool IsArchived { get; set; }
}

class PlayerAgeGroupRawDto
{
    public Guid PlayerId { get; set; }
    public Guid Id { get; set; }
    public string? Name { get; set; }
}

class PlayerTeamRawDto
{
    public Guid PlayerId { get; set; }
    public Guid Id { get; set; }
    public Guid AgeGroupId { get; set; }
    public string? Name { get; set; }
    public string? AgeGroupName { get; set; }
}

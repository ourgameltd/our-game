using MediatR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachesByClubId.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Coaches.Queries.GetCoachesByClubId;

/// <summary>
/// Query to get a paged, filtered list of coaches for a specific club
/// </summary>
public record GetCoachesByClubIdQuery(
    Guid ClubId,
    bool IncludeArchived = false,
    string? Search = null,
    Guid? AgeGroupId = null,
    Guid? TeamId = null,
    string? Role = null,
    int Page = 1,
    int PageSize = 20
) : IQuery<PagedResponse<ClubCoachDto>>;

/// <summary>
/// Handler for GetCoachesByClubIdQuery
/// </summary>
public class GetCoachesByClubIdHandler : IRequestHandler<GetCoachesByClubIdQuery, PagedResponse<ClubCoachDto>>
{
    private readonly OurGameContext _db;

    public GetCoachesByClubIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<PagedResponse<ClubCoachDto>> Handle(GetCoachesByClubIdQuery query, CancellationToken cancellationToken)
    {
        var (whereClause, _) = BuildFilter(query);

        var countSql = $"SELECT COUNT(*) AS Value FROM Coaches c WHERE {whereClause}";
        var (_, countParams) = BuildFilter(query);
        var totalCount = (await _db.Database
            .SqlQueryRaw<int>(countSql, countParams)
            .ToListAsync(cancellationToken))[0];

        if (totalCount == 0)
            return PagedResponse<ClubCoachDto>.Create(new List<ClubCoachDto>(), query.Page, query.PageSize, 0);

        var skip = (query.Page - 1) * query.PageSize;
        var (_, mainFilterParams) = BuildFilter(query);
        var mainParams = new List<object>(mainFilterParams)
        {
            new SqlParameter("@skip", skip),
            new SqlParameter("@pageSize", query.PageSize)
        };

        var mainSql = $@"
            SELECT
                c.Id,
                c.ClubId,
                c.FirstName,
                c.LastName,
                c.DateOfBirth,
                c.Photo,
                u.Email,
                c.Phone,
                c.AssociationId,
                c.HasAccount,
                c.Biography,
                c.Specializations,
                c.ClubRoles,
                c.Badges,
                c.IsArchived
            FROM Coaches c
            LEFT JOIN Users u ON u.Id = c.UserId
            WHERE {whereClause}
            ORDER BY c.FirstName, c.LastName
            OFFSET @skip ROWS FETCH NEXT @pageSize ROWS ONLY";

        var coachData = await _db.Database
            .SqlQueryRaw<CoachRawDto>(mainSql, mainParams.ToArray())
            .ToListAsync(cancellationToken);

        if (coachData.Count == 0)
            return PagedResponse<ClubCoachDto>.Create(new List<ClubCoachDto>(), query.Page, query.PageSize, totalCount);

        var coachIds = coachData.Select(c => c.Id).ToList();
        var batchParams = coachIds.Select((id, i) => new SqlParameter($"@p{i}", id)).ToArray();
        var paramNames = string.Join(", ", batchParams.Select(p => p.ParameterName));

        var teamSql = $@"
            SELECT
                tc.CoachId,
                t.Id,
                t.AgeGroupId,
                t.Name,
                ag.Name AS AgeGroupName
            FROM TeamCoaches tc
            INNER JOIN Teams t ON tc.TeamId = t.Id
            LEFT JOIN AgeGroups ag ON t.AgeGroupId = ag.Id
            WHERE tc.CoachId IN ({paramNames})
            ORDER BY ag.Name, t.Name";

        var teamData = await _db.Database
            .SqlQueryRaw<CoachTeamRawDto>(teamSql, batchParams)
            .ToListAsync(cancellationToken);

        var teamsByCoach = teamData
            .GroupBy(t => t.CoachId)
            .ToDictionary(
                g => g.Key,
                g => g.Select(t => new ClubCoachTeamDto
                {
                    Id = t.Id,
                    AgeGroupId = t.AgeGroupId,
                    Name = t.Name ?? string.Empty,
                    AgeGroupName = t.AgeGroupName
                }).ToList()
            );

        var items = coachData
            .Select(c => new ClubCoachDto
            {
                Id = c.Id,
                ClubId = c.ClubId,
                FirstName = c.FirstName ?? string.Empty,
                LastName = c.LastName ?? string.Empty,
                DateOfBirth = c.DateOfBirth,
                Photo = c.Photo,
                Email = c.Email,
                Phone = c.Phone,
                AssociationId = c.AssociationId,
                HasAccount = c.HasAccount,
                Biography = c.Biography,
                Specializations = ParseJsonOrCsv(c.Specializations),
                ClubRoles = ParseJsonOrCsv(c.ClubRoles),
                Badges = ParseJsonOrCsv(c.Badges),
                IsArchived = c.IsArchived,
                Teams = teamsByCoach.GetValueOrDefault(c.Id, new List<ClubCoachTeamDto>())
            })
            .ToList();

        return PagedResponse<ClubCoachDto>.Create(items, query.Page, query.PageSize, totalCount);
    }

    private static (string WhereClause, object[] Parameters) BuildFilter(GetCoachesByClubIdQuery query)
    {
        var conditions = new List<string> { "c.ClubId = @clubId" };
        var parameters = new List<SqlParameter> { new("@clubId", query.ClubId) };

        if (!query.IncludeArchived)
            conditions.Add("c.IsArchived = 0");

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            conditions.Add("(c.FirstName + ' ' + c.LastName LIKE '%' + @search + '%')");
            parameters.Add(new("@search", query.Search.Trim()));
        }

        if (query.AgeGroupId.HasValue)
        {
            conditions.Add("EXISTS (SELECT 1 FROM TeamCoaches tc INNER JOIN Teams t ON tc.TeamId = t.Id WHERE tc.CoachId = c.Id AND t.AgeGroupId = @ageGroupId)");
            parameters.Add(new("@ageGroupId", query.AgeGroupId.Value));
        }

        if (query.TeamId.HasValue)
        {
            conditions.Add("EXISTS (SELECT 1 FROM TeamCoaches tc WHERE tc.CoachId = c.Id AND tc.TeamId = @teamId)");
            parameters.Add(new("@teamId", query.TeamId.Value));
        }

        if (!string.IsNullOrWhiteSpace(query.Role))
        {
            conditions.Add("c.ClubRoles LIKE '%' + @role + '%'");
            parameters.Add(new("@role", query.Role.Trim()));
        }

        return (string.Join(" AND ", conditions), parameters.Cast<object>().ToArray());
    }

    private static List<string> ParseJsonOrCsv(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return new List<string>();

        var trimmed = value.Trim();
        if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
        {
            try
            {
                return System.Text.Json.JsonSerializer.Deserialize<List<string>>(trimmed) ?? new List<string>();
            }
            catch
            {
                // fall through
            }
        }

        return trimmed
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => s.Trim())
            .ToList();
    }
}

class CoachRawDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Photo { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? AssociationId { get; set; }
    public bool HasAccount { get; set; }
    public string? Biography { get; set; }
    public string? Specializations { get; set; }
    public string? ClubRoles { get; set; }
    public string? Badges { get; set; }
    public bool IsArchived { get; set; }
}

class CoachTeamRawDto
{
    public Guid CoachId { get; set; }
    public Guid Id { get; set; }
    public Guid AgeGroupId { get; set; }
    public string? Name { get; set; }
    public string? AgeGroupName { get; set; }
}

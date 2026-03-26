using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Players.Queries.GetPlayersByClubId.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Queries.GetPlayersByClubId;

/// <summary>
/// Query to get all players for a specific club
/// </summary>
public record GetPlayersByClubIdQuery(Guid ClubId, bool IncludeArchived = false) : IQuery<List<ClubPlayerDto>>;

/// <summary>
/// Handler for GetPlayersByClubIdQuery
/// </summary>
public class GetPlayersByClubIdHandler : IRequestHandler<GetPlayersByClubIdQuery, List<ClubPlayerDto>>
{
    private readonly OurGameContext _db;

    public GetPlayersByClubIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<ClubPlayerDto>> Handle(GetPlayersByClubIdQuery query, CancellationToken cancellationToken)
    {
        // Get all players for the club
        var sql = query.IncludeArchived
            ? @"
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
                    p.IsArchived
                FROM Players p
                WHERE p.ClubId = {0}
                ORDER BY p.FirstName, p.LastName"
            : @"
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
                    p.IsArchived
                FROM Players p
                WHERE p.ClubId = {0} AND p.IsArchived = 0
                ORDER BY p.FirstName, p.LastName";

        var playerData = await _db.Database
            .SqlQueryRaw<PlayerRawDto>(sql, query.ClubId)
            .ToListAsync(cancellationToken);

        if (playerData.Count == 0)
        {
            return new List<ClubPlayerDto>();
        }

        // Get player IDs for fetching related data
        var playerIds = playerData.Select(p => p.Id).ToList();

        // Build parameterized query for age groups
        var parameters = playerIds.Select((id, index) =>
            new Microsoft.Data.SqlClient.SqlParameter($"@p{index}", id)).ToArray();
        var parameterNames = string.Join(", ", parameters.Select(p => p.ParameterName));

        // Get age groups for players
        var ageGroupSql = $@"
            SELECT 
                pag.PlayerId,
                ag.Id,
                ag.Name
            FROM PlayerAgeGroups pag
            INNER JOIN AgeGroups ag ON pag.AgeGroupId = ag.Id
            WHERE pag.PlayerId IN ({parameterNames})
            ORDER BY ag.Name";

        var ageGroupData = await _db.Database
            .SqlQueryRaw<PlayerAgeGroupRawDto>(ageGroupSql, parameters)
            .ToListAsync(cancellationToken);

        // Get teams for players
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
            WHERE pt.PlayerId IN ({parameterNames})
            ORDER BY ag.Name, t.Name";

        var teamData = await _db.Database
            .SqlQueryRaw<PlayerTeamRawDto>(teamSql, parameters)
            .ToListAsync(cancellationToken);

        // Group related data by player
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

        // Map to DTOs
        return playerData
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
                IsArchived = p.IsArchived,
                AgeGroups = ageGroupsByPlayer.TryGetValue(p.Id, out var ageGroups)
                    ? ageGroups
                    : new List<ClubPlayerAgeGroupDto>(),
                Teams = teamsByPlayer.TryGetValue(p.Id, out var teams)
                    ? teams
                    : new List<ClubPlayerTeamDto>()
            })
            .ToList();
    }

    private static List<string> ParsePositions(string? positions)
    {
        if (string.IsNullOrWhiteSpace(positions))
            return new List<string>();

        // Database stores positions as JSON array: ["CAM","CM"]
        try
        {
            var result = System.Text.Json.JsonSerializer.Deserialize<List<string>>(positions);
            return result ?? new List<string>();
        }
        catch (System.Text.Json.JsonException)
        {
            // Fallback: treat as comma-separated string for legacy data
            return positions
                .Split(new[] { ',', '|', ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(p => p.Trim())
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .ToList();
        }
    }
}

/// <summary>
/// DTO for raw SQL player query result
/// </summary>
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
    public bool IsArchived { get; set; }
}

/// <summary>
/// DTO for raw SQL age group query result
/// </summary>
class PlayerAgeGroupRawDto
{
    public Guid PlayerId { get; set; }
    public Guid Id { get; set; }
    public string? Name { get; set; }
}

/// <summary>
/// DTO for raw SQL team query result
/// </summary>
class PlayerTeamRawDto
{
    public Guid PlayerId { get; set; }
    public Guid Id { get; set; }
    public Guid AgeGroupId { get; set; }
    public string? Name { get; set; }
    public string? AgeGroupName { get; set; }
}

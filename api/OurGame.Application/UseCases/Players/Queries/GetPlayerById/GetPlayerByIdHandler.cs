using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Queries.GetPlayerById;

/// <summary>
/// Query to get player details by ID
/// </summary>
public record GetPlayerByIdQuery(Guid PlayerId) : IQuery<PlayerDto?>;

/// <summary>
/// Handler for GetPlayerByIdQuery.
/// Returns denormalized player context including club, age group, and team information.
/// Fetches all team and age group assignments for settings-ready data.
/// </summary>
public class GetPlayerByIdHandler : IRequestHandler<GetPlayerByIdQuery, PlayerDto?>
{
    private readonly OurGameContext _db;

    public GetPlayerByIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<PlayerDto?> Handle(GetPlayerByIdQuery query, CancellationToken cancellationToken)
    {
        // 1. Fetch base player data with club
        var playerSql = @"
            SELECT 
                p.Id,
                p.FirstName,
                p.LastName,
                p.Nickname,
                p.Photo AS PhotoUrl,
                p.DateOfBirth,
                p.AssociationId,
                p.IsArchived,
                p.ClubId,
                c.Name AS ClubName,
                p.PreferredPositions
            FROM Players p
            INNER JOIN Clubs c ON c.Id = p.ClubId
            WHERE p.Id = {0}";

        var player = await _db.Database
            .SqlQueryRaw<PlayerBaseRawDto>(playerSql, query.PlayerId)
            .FirstOrDefaultAsync(cancellationToken);

        if (player == null)
        {
            return null;
        }

        // 2. Fetch all team assignments with age group details
        var teamSql = @"
            SELECT 
                t.Id,
                t.AgeGroupId,
                t.Name,
                ag.Name AS AgeGroupName
            FROM PlayerTeams pt
            INNER JOIN Teams t ON t.Id = pt.TeamId
            LEFT JOIN AgeGroups ag ON ag.Id = t.AgeGroupId
            WHERE pt.PlayerId = {0}
            ORDER BY ag.Name, t.Name";

        var teamData = await _db.Database
            .SqlQueryRaw<PlayerTeamRawDto>(teamSql, query.PlayerId)
            .ToListAsync(cancellationToken);

        // 3. Parse positions
        var positions = ParsePositions(player.PreferredPositions);

        // 4. Build team minimal DTOs
        var teams = teamData
            .Select(t => new TeamMinimalDto
            {
                Id = t.Id,
                Name = t.Name ?? string.Empty,
                AgeGroupId = t.AgeGroupId,
                AgeGroupName = t.AgeGroupName
            })
            .ToArray();

        var teamIds = teams.Select(t => t.Id).ToArray();
        var ageGroupIds = teams.Select(t => t.AgeGroupId).Distinct().ToArray();

        // 5. Map to DTO, keeping backward-compatible single-value fields from first assignment
        var firstTeam = teams.FirstOrDefault();

        return new PlayerDto
        {
            Id = player.Id,
            FirstName = player.FirstName ?? string.Empty,
            LastName = player.LastName ?? string.Empty,
            Nickname = player.Nickname,
            PhotoUrl = player.PhotoUrl,
            DateOfBirth = player.DateOfBirth?.ToDateTime(TimeOnly.MinValue),
            AssociationId = player.AssociationId,
            IsArchived = player.IsArchived,
            ClubId = player.ClubId,
            ClubName = player.ClubName,
            PreferredPositions = positions,
            TeamIds = teamIds,
            AgeGroupIds = ageGroupIds,
            Teams = teams,

            // Backward-compatible single-value fields
            AgeGroupId = firstTeam?.AgeGroupId,
            AgeGroupName = firstTeam?.AgeGroupName,
            TeamId = firstTeam?.Id,
            TeamName = firstTeam?.Name,
            PreferredPosition = positions.FirstOrDefault()
        };
    }

    private static string[] ParsePositions(string? positions)
    {
        if (string.IsNullOrWhiteSpace(positions))
            return Array.Empty<string>();

        // Database stores positions as JSON array: ["CAM","CM"]
        try
        {
            var result = System.Text.Json.JsonSerializer.Deserialize<string[]>(positions);
            return result ?? Array.Empty<string>();
        }
        catch (System.Text.Json.JsonException)
        {
            // Fallback: treat as comma-separated string for legacy data
            return positions
                .Split(new[] { ',', '|', ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(p => p.Trim())
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .ToArray();
        }
    }
}

/// <summary>
/// Raw SQL result for base player data
/// </summary>
public class PlayerBaseRawDto
{
    public Guid Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Nickname { get; set; }
    public string? PhotoUrl { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? AssociationId { get; set; }
    public bool IsArchived { get; set; }
    public Guid? ClubId { get; set; }
    public string? ClubName { get; set; }
    public string? PreferredPositions { get; set; }
}

/// <summary>
/// Raw SQL result for player team assignments
/// </summary>
public class PlayerTeamRawDto
{
    public Guid Id { get; set; }
    public Guid AgeGroupId { get; set; }
    public string? Name { get; set; }
    public string? AgeGroupName { get; set; }
}

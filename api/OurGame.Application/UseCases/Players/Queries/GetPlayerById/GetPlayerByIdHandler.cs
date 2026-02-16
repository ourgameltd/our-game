using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Queries.GetPlayerById;

/// <summary>
/// Query to get player details by ID
/// </summary>
public record GetPlayerByIdQuery(Guid PlayerId, string? UserId = null) : IQuery<PlayerDto?>;

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
        // Authorization check: verify user has access to this player
        if (!string.IsNullOrEmpty(query.UserId))
        {
            var authSql = @"
                SELECT CASE WHEN EXISTS (
                    -- User is a coach assigned to any team the player is in
                    SELECT 1
                    FROM Players p
                    INNER JOIN PlayerTeams pt ON p.Id = pt.PlayerId
                    INNER JOIN Teams t ON pt.TeamId = t.Id
                    INNER JOIN TeamCoaches tc ON t.Id = tc.TeamId
                    INNER JOIN Coaches c ON tc.CoachId = c.Id
                    INNER JOIN Users u ON c.UserId = u.Id
                    WHERE p.Id = {0} AND u.AuthId = {1}
                    
                    UNION
                    
                    -- User is the player's own linked user
                    SELECT 1
                    FROM Players p
                    INNER JOIN Users u ON p.UserId = u.Id
                    WHERE p.Id = {0} AND u.AuthId = {1}
                    
                    UNION
                    
                    -- User is a parent of the player
                    SELECT 1
                    FROM Players p
                    INNER JOIN PlayerParents pp ON p.Id = pp.PlayerId
                    INNER JOIN Users u ON pp.ParentUserId = u.Id
                    WHERE p.Id = {0} AND u.AuthId = {1}
                ) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS HasAccess";

            var hasAccess = await _db.Database
                .SqlQueryRaw<AuthCheckResult>(authSql, query.PlayerId, query.UserId)
                .FirstOrDefaultAsync(cancellationToken);

            if (hasAccess == null || !hasAccess.HasAccess)
            {
                return null; // Return 404 to not leak existence
            }
        }

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
                p.PreferredPositions,
                p.Allergies,
                p.MedicalConditions,
                p.OverallRating
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

        // 2. Fetch all team assignments with age group details and squad numbers
        var teamSql = @"
            SELECT 
                t.Id,
                t.AgeGroupId,
                t.Name,
                ag.Name AS AgeGroupName,
                pt.SquadNumber
            FROM PlayerTeams pt
            INNER JOIN Teams t ON t.Id = pt.TeamId
            LEFT JOIN AgeGroups ag ON ag.Id = t.AgeGroupId
            WHERE pt.PlayerId = {0}
            ORDER BY ag.Name, t.Name";

        var teamData = await _db.Database
            .SqlQueryRaw<PlayerTeamRawDto>(teamSql, query.PlayerId)
            .ToListAsync(cancellationToken);

        // 3. Calculate average rating from performance ratings
        var avgRatingSql = @"
            SELECT AVG(CAST(pr.Rating AS FLOAT)) AS AverageRating
            FROM PerformanceRatings pr
            WHERE pr.PlayerId = {0}";

        var avgRatingResult = await _db.Database
            .SqlQueryRaw<AverageRatingResult>(avgRatingSql, query.PlayerId)
            .FirstOrDefaultAsync(cancellationToken);

        // 4. Fetch emergency contacts
        var emergencyContactsSql = @"
            SELECT Id, Name, Phone, Relationship, IsPrimary
            FROM EmergencyContacts
            WHERE PlayerId = {0}
            ORDER BY IsPrimary DESC, Name";

        var emergencyContactsData = await _db.Database
            .SqlQueryRaw<EmergencyContactRawDto>(emergencyContactsSql, query.PlayerId)
            .ToListAsync(cancellationToken);

        var emergencyContacts = emergencyContactsData
            .Select(ec => new EmergencyContactDto
            {
                Id = ec.Id,
                Name = ec.Name ?? string.Empty,
                Phone = ec.Phone ?? string.Empty,
                Relationship = ec.Relationship ?? string.Empty,
                IsPrimary = ec.IsPrimary
            })
            .ToArray();

        // 5. Parse positions
        var positions = ParsePositions(player.PreferredPositions);

        // 6. Build team minimal DTOs
        var teams = teamData
            .Select(t => new TeamMinimalDto
            {
                Id = t.Id,
                Name = t.Name ?? string.Empty,
                AgeGroupId = t.AgeGroupId,
                AgeGroupName = t.AgeGroupName,
                SquadNumber = t.SquadNumber
            })
            .ToArray();

        var teamIds = teams.Select(t => t.Id).ToArray();
        var ageGroupIds = teams.Select(t => t.AgeGroupId).Distinct().ToArray();

        // 7. Map to DTO, keeping backward-compatible single-value fields from first assignment
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
            Allergies = player.Allergies,
            MedicalConditions = player.MedicalConditions,
            OverallRating = player.OverallRating,
            AverageRating = avgRatingResult?.AverageRating,
            EmergencyContacts = emergencyContacts.Length > 0 ? emergencyContacts : null,

            // Backward-compatible single-value fields
            AgeGroupId = firstTeam?.AgeGroupId,
            AgeGroupName = firstTeam?.AgeGroupName,
            TeamId = firstTeam?.Id,
            TeamName = firstTeam?.Name,
            SquadNumber = firstTeam?.SquadNumber,
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
    public string? Allergies { get; set; }
    public string? MedicalConditions { get; set; }
    public int? OverallRating { get; set; }
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
    public int? SquadNumber { get; set; }
}

/// <summary>
/// Result for authorization check
/// </summary>
public class AuthCheckResult
{
    public bool HasAccess { get; set; }
}

/// <summary>
/// Result for average rating calculation
/// </summary>
public class AverageRatingResult
{
    public double? AverageRating { get; set; }
}

/// <summary>
/// Raw SQL result for emergency contacts
/// </summary>
public class EmergencyContactRawDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Relationship { get; set; }
    public bool IsPrimary { get; set; }
}

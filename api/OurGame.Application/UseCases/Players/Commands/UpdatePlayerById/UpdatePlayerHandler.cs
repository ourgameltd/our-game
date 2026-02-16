using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Commands.UpdatePlayerById;

/// <summary>
/// Handler for updating an existing player's settings.
/// Updates the Players table, rebuilds PlayerTeams assignments,
/// and derives PlayerAgeGroups from the selected teams.
/// </summary>
public class UpdatePlayerHandler : IRequestHandler<UpdatePlayerCommand, PlayerDto?>
{
    private readonly OurGameContext _db;

    public UpdatePlayerHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<PlayerDto?> Handle(UpdatePlayerCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var playerId = command.PlayerId;

        // Authorization check: verify user has access to this player
        if (!string.IsNullOrEmpty(command.UserId))
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
                .SqlQueryRaw<AuthCheckResult>(authSql, playerId, command.UserId)
                .FirstOrDefaultAsync(cancellationToken);

            if (hasAccess == null || !hasAccess.HasAccess)
            {
                return null; // Return 404 to not leak existence
            }
        }

        // 1. Verify the player exists and check archive state
        var existing = await _db.Database
            .SqlQueryRaw<PlayerExistsResult>(
                "SELECT Id, IsArchived FROM Players WHERE Id = {0}", playerId)
            .FirstOrDefaultAsync(cancellationToken);

        if (existing == null)
        {
            throw new NotFoundException("Player", playerId.ToString());
        }

        // Reject updates to currently-archived players (unless the request is un-archiving)
        if (existing.IsArchived && dto.IsArchived)
        {
            throw new ValidationException("IsArchived",
                "Cannot update an archived player. Please unarchive the player first.");
        }

        // 2. Serialize preferred positions to JSON for storage
        var preferredPositionsJson = JsonSerializer.Serialize(dto.PreferredPositions);
        var now = DateTime.UtcNow;
        var nickname = dto.Nickname ?? string.Empty;
        var associationId = dto.AssociationId ?? string.Empty;
        var photo = dto.Photo ?? string.Empty;
        var allergies = dto.Allergies ?? string.Empty;
        var medicalConditions = dto.MedicalConditions ?? string.Empty;

        // 3. Update the Players row
        var rowsAffected = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE Players
            SET
                FirstName           = {dto.FirstName},
                LastName            = {dto.LastName},
                Nickname            = {nickname},
                AssociationId       = {associationId},
                DateOfBirth         = {dto.DateOfBirth},
                Photo               = {photo},
                Allergies           = {allergies},
                MedicalConditions   = {medicalConditions},
                PreferredPositions  = {preferredPositionsJson},
                IsArchived          = {dto.IsArchived},
                UpdatedAt           = {now}
            WHERE Id = {playerId}
        ", cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException("Player", playerId.ToString());
        }

        // 4. Rebuild emergency contacts (delete existing, insert new)
        if (dto.EmergencyContacts != null)
        {
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                DELETE FROM EmergencyContacts WHERE PlayerId = {playerId}
            ", cancellationToken);

            // Enforce exactly one primary contact
            var contacts = dto.EmergencyContacts;
            var hasPrimary = contacts.Any(c => c.IsPrimary);
            
            for (int i = 0; i < contacts.Length; i++)
            {
                var contact = contacts[i];
                var ecId = Guid.NewGuid();
                // If none marked primary, set first as primary
                // If multiple marked primary, only keep first as primary
                var isPrimary = !hasPrimary && i == 0 || hasPrimary && contact.IsPrimary && contacts.Take(i).All(c => !c.IsPrimary);

                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO EmergencyContacts (Id, PlayerId, Name, Phone, Relationship, IsPrimary)
                    VALUES ({ecId}, {playerId}, {contact.Name}, {contact.Phone}, {contact.Relationship}, {isPrimary})
                ", cancellationToken);
            }
        }

        // 5. Rebuild PlayerTeams join table (only if TeamIds provided)
        if (dto.TeamIds != null)
        {
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                DELETE FROM PlayerTeams WHERE PlayerId = {playerId}
            ", cancellationToken);

            foreach (var teamId in dto.TeamIds)
            {
                var ptId = Guid.NewGuid();
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO PlayerTeams (Id, PlayerId, TeamId, AssignedAt)
                    VALUES ({ptId}, {playerId}, {teamId}, {now})
                ", cancellationToken);
            }

            // 6. Derive age groups from the selected teams and rebuild PlayerAgeGroups
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                DELETE FROM PlayerAgeGroups WHERE PlayerId = {playerId}
            ", cancellationToken);

            if (dto.TeamIds.Length > 0)
            {
                // Get distinct age group IDs for the assigned teams using LINQ to avoid SQL injection
                var ageGroupIds = await _db.Teams
                    .Where(t => dto.TeamIds.Contains(t.Id))
                    .Select(t => t.AgeGroupId)
                    .Distinct()
                    .ToListAsync(cancellationToken);

                foreach (var agId in ageGroupIds)
                {
                    var pagId = Guid.NewGuid();
                    await _db.Database.ExecuteSqlInterpolatedAsync($@"
                        INSERT INTO PlayerAgeGroups (Id, PlayerId, AgeGroupId)
                        VALUES ({pagId}, {playerId}, {agId})
                    ", cancellationToken);
                }
            }
        }

        // 7. Query back the updated player to return
        var result = await _db.Database
            .SqlQueryRaw<UpdatedPlayerRawDto>(@"
                SELECT 
                    p.Id,
                    p.FirstName,
                    p.LastName,
                    p.Photo AS PhotoUrl,
                    p.DateOfBirth,
                    p.ClubId,
                    c.Name AS ClubName,
                    pag.AgeGroupId,
                    ag.Name AS AgeGroupName,
                    pt.TeamId,
                    t.Name AS TeamName,
                    p.PreferredPositions AS PreferredPosition
                FROM Players p
                INNER JOIN Clubs c ON c.Id = p.ClubId
                LEFT JOIN PlayerAgeGroups pag ON pag.PlayerId = p.Id
                LEFT JOIN AgeGroups ag ON ag.Id = pag.AgeGroupId
                LEFT JOIN PlayerTeams pt ON pt.PlayerId = p.Id
                LEFT JOIN Teams t ON t.Id = pt.TeamId
                WHERE p.Id = {0}
            ", playerId)
            .FirstOrDefaultAsync(cancellationToken);

        if (result == null)
        {
            throw new Exception("Failed to retrieve updated player.");
        }

        return new PlayerDto
        {
            Id = result.Id,
            FirstName = result.FirstName ?? string.Empty,
            LastName = result.LastName ?? string.Empty,
            PhotoUrl = result.PhotoUrl,
            DateOfBirth = result.DateOfBirth?.ToDateTime(TimeOnly.MinValue),
            ClubId = result.ClubId,
            ClubName = result.ClubName,
            AgeGroupId = result.AgeGroupId,
            AgeGroupName = result.AgeGroupName,
            TeamId = result.TeamId,
            TeamName = result.TeamName,
            PreferredPosition = result.PreferredPosition
        };
    }
}

/// <summary>
/// Result for authorization check
/// </summary>
internal class AuthCheckResult
{
    public bool HasAccess { get; set; }
}

/// <summary>
/// Raw SQL projection for checking player existence and archive state.
/// </summary>
internal class PlayerExistsResult
{
    public Guid Id { get; set; }
    public bool IsArchived { get; set; }
}

/// <summary>
/// Raw SQL query result model for the updated player data.
/// </summary>
internal class UpdatedPlayerRawDto
{
    public Guid Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhotoUrl { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public Guid? ClubId { get; set; }
    public string? ClubName { get; set; }
    public Guid? AgeGroupId { get; set; }
    public string? AgeGroupName { get; set; }
    public Guid? TeamId { get; set; }
    public string? TeamName { get; set; }
    public string? PreferredPosition { get; set; }
}

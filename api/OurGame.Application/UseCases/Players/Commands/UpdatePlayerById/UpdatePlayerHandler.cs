using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
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
    private readonly IBlobStorageService _blobStorage;

    public UpdatePlayerHandler(OurGameContext db, IBlobStorageService blobStorage)
    {
        _db = db;
        _blobStorage = blobStorage;
    }

    public async Task<PlayerDto?> Handle(UpdatePlayerCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var playerId = command.PlayerId;
        var canEditProtectedFields = false;

        // 1. Verify the player exists and check archive state
        var existing = await _db.Database
            .SqlQueryRaw<PlayerExistsResult>(
                "SELECT Id, ClubId, UserId, AssociationId, PreferredPositions, IsArchived FROM Players WHERE Id = {0}", playerId)
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

        // 1b. Authorize caller and enforce field-level restrictions for linked player/parent accounts.
        if (!string.IsNullOrWhiteSpace(command.UserId))
        {
            var caller = await _db.Users
                .AsNoTracking()
                .Where(u => u.AuthId == command.UserId)
                .Select(u => new { u.Id, u.IsAdmin })
                .FirstOrDefaultAsync(cancellationToken);

            if (caller == null)
            {
                throw new ForbiddenException("User is not authorized to update this player.");
            }

            var isCoachForClub = existing.ClubId.HasValue && await _db.Coaches
                .AsNoTracking()
                .AnyAsync(c => c.UserId == caller.Id && c.ClubId == existing.ClubId && !c.IsArchived, cancellationToken);

            var isPlayerSelf = existing.UserId.HasValue && existing.UserId == caller.Id;

            var isLinkedParent = await _db.EmergencyContacts
                .AsNoTracking()
                .AnyAsync(ec => ec.PlayerId == playerId && ec.UserId == caller.Id, cancellationToken);

            if (!caller.IsAdmin && !isCoachForClub && !isPlayerSelf && !isLinkedParent)
            {
                throw new ForbiddenException("You are not authorized to update this player.");
            }

            canEditProtectedFields = caller.IsAdmin || isCoachForClub;
            if (!canEditProtectedFields)
            {
                var requestedAssociationId = dto.AssociationId ?? string.Empty;
                var existingAssociationId = existing.AssociationId ?? string.Empty;
                if (!string.Equals(requestedAssociationId, existingAssociationId, StringComparison.Ordinal))
                {
                    throw new ForbiddenException("Only coaches can update a player's association ID.");
                }

                var requestedPreferredPositions = (dto.PreferredPositions ?? Array.Empty<string>())
                    .OrderBy(p => p, StringComparer.OrdinalIgnoreCase)
                    .ToArray();

                var existingPreferredPositions = ParsePreferredPositions(existing.PreferredPositions)
                    .OrderBy(p => p, StringComparer.OrdinalIgnoreCase)
                    .ToArray();

                if (!requestedPreferredPositions.SequenceEqual(existingPreferredPositions, StringComparer.OrdinalIgnoreCase))
                {
                    throw new ForbiddenException("Only coaches can update a player's preferred positions.");
                }

                if (dto.TeamIds != null)
                {
                    throw new ForbiddenException("Only coaches can update player team assignments.");
                }

                if (dto.IsArchived != existing.IsArchived)
                {
                    throw new ForbiddenException("Only coaches can archive or unarchive players.");
                }
            }
        }

        var hasLinkedAccountRemovalRequest = dto.UnlinkPlayerAccount ||
            (dto.RemoveLinkedEmergencyContactIds?.Length ?? 0) > 0;
        if (hasLinkedAccountRemovalRequest && !canEditProtectedFields)
        {
            throw new ForbiddenException("Only coaches can remove linked accounts.");
        }

        // 2. Serialize preferred positions to JSON for storage
        var preferredPositionsJson = JsonSerializer.Serialize(dto.PreferredPositions);
        var now = DateTime.UtcNow;
        var nickname = dto.Nickname ?? string.Empty;
        var associationId = dto.AssociationId ?? string.Empty;
        var photo = await _blobStorage.UploadImageAsync(dto.Photo, "player-photos", playerId.ToString(), cancellationToken);
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

        // 3b. Remove requested linked accounts.
        if (dto.UnlinkPlayerAccount)
        {
            await _db.Players
                .Where(p => p.Id == playerId)
                .ExecuteUpdateAsync(
                    updates => updates.SetProperty(p => p.UserId, _ => (Guid?)null),
                    cancellationToken);
        }

        if ((dto.RemoveLinkedEmergencyContactIds?.Length ?? 0) > 0)
        {
            var linkedIdsToRemove = dto.RemoveLinkedEmergencyContactIds!
                .Distinct()
                .ToArray();

            await _db.EmergencyContacts
                .Where(ec => ec.PlayerId == playerId
                             && ec.UserId != null
                             && linkedIdsToRemove.Contains(ec.Id))
                .ExecuteDeleteAsync(cancellationToken);
        }

        // 4. Rebuild emergency contacts (delete existing, insert new)
        if (dto.EmergencyContacts != null)
        {
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                DELETE FROM EmergencyContacts
                WHERE PlayerId = {playerId}
                  AND UserId IS NULL
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
                    INSERT INTO EmergencyContacts (Id, PlayerId, Name, Phone, Email, Relationship, IsPrimary)
                    VALUES ({ecId}, {playerId}, {contact.Name}, {contact.Phone ?? string.Empty}, {contact.Email ?? string.Empty}, {contact.Relationship ?? string.Empty}, {isPrimary})
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
    private static string[] ParsePreferredPositions(string? rawPreferredPositions)
    {
        if (string.IsNullOrWhiteSpace(rawPreferredPositions))
        {
            return Array.Empty<string>();
        }

        try
        {
            var parsed = JsonSerializer.Deserialize<string[]>(rawPreferredPositions);
            return parsed?.Where(p => !string.IsNullOrWhiteSpace(p)).ToArray() ?? Array.Empty<string>();
        }
        catch (JsonException)
        {
            return rawPreferredPositions
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .ToArray();
        }
    }
}

/// <summary>
/// Raw SQL projection for checking player existence and archive state.
/// </summary>
internal class PlayerExistsResult
{
    public Guid Id { get; set; }
    public Guid? ClubId { get; set; }
    public Guid? UserId { get; set; }
    public string? AssociationId { get; set; }
    public string? PreferredPositions { get; set; }
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

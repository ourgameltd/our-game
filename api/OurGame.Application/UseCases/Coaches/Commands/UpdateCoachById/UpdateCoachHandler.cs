using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachById.DTOs;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Coaches.Commands.UpdateCoachById;

/// <summary>
/// Handler for updating an existing coach's profile.
/// Updates the Coaches table, rebuilds TeamCoaches assignments,
/// and returns the full updated coach detail.
/// </summary>
public class UpdateCoachHandler : IRequestHandler<UpdateCoachCommand, CoachDetailDto>
{
    private readonly OurGameContext _db;
    private readonly IBlobStorageService _blobStorage;

    public UpdateCoachHandler(OurGameContext db, IBlobStorageService blobStorage)
    {
        _db = db;
        _blobStorage = blobStorage;
    }

    public async Task<CoachDetailDto> Handle(UpdateCoachCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var coachId = command.CoachId;

        // 1. Verify the coach exists
        var existing = await _db.Database
            .SqlQueryRaw<CoachExistsResult>(
                "SELECT Id, IsArchived FROM Coaches WHERE Id = {0}", coachId)
            .FirstOrDefaultAsync(cancellationToken);

        if (existing == null)
        {
            throw new NotFoundException("Coach", coachId.ToString());
        }

        // 2. Validate the role value maps to a valid CoachRole enum
        if (!Enum.TryParse<CoachRole>(dto.Role, ignoreCase: true, out var parsedRole))
        {
            var validRoles = string.Join(", ", Enum.GetNames<CoachRole>());
            throw new ValidationException("Role",
                $"'{dto.Role}' is not a valid coach role. Valid values: {validRoles}");
        }

        var roleInt = (int)parsedRole;

        // 3. Serialize specializations to comma-separated string for storage
        var specializations = dto.Specializations.Length > 0
            ? string.Join(",", dto.Specializations)
            : (string?)null;

        var now = DateTime.UtcNow;
        var phone = dto.Phone ?? string.Empty;
        var associationId = dto.AssociationId ?? string.Empty;
        var photo = await _blobStorage.UploadImageAsync(dto.Photo, "coach-photos", coachId.ToString(), cancellationToken);

        // 4. Update the Coaches row
        var rowsAffected = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE Coaches
            SET
                FirstName       = {dto.FirstName},
                LastName        = {dto.LastName},
                Phone           = {phone},
                DateOfBirth     = {dto.DateOfBirth},
                AssociationId   = {associationId},
                Role            = {roleInt},
                Biography       = {dto.Biography},
                Specializations = {specializations},
                Photo           = {photo},
                UpdatedAt       = {now}
            WHERE Id = {coachId}
        ", cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException("Coach", coachId.ToString());
        }

        // 4b. Remove requested linked accounts.
        if (dto.UnlinkCoachAccount)
        {
            await _db.Coaches
                .Where(c => c.Id == coachId)
                .ExecuteUpdateAsync(
                    updates => updates.SetProperty(c => c.UserId, _ => (Guid?)null),
                    cancellationToken);
        }

        if ((dto.RemoveLinkedEmergencyContactIds?.Length ?? 0) > 0)
        {
            var linkedIdsToRemove = dto.RemoveLinkedEmergencyContactIds!
                .Distinct()
                .ToArray();

            await _db.EmergencyContacts
                .Where(ec => ec.CoachId == coachId
                             && ec.UserId != null
                             && linkedIdsToRemove.Contains(ec.Id))
                .ExecuteDeleteAsync(cancellationToken);
        }

        // 5. Rebuild TeamCoaches join table (delete existing, insert new)
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM TeamCoaches WHERE CoachId = {coachId}
        ", cancellationToken);

        foreach (var teamId in dto.TeamIds)
        {
            var tcId = Guid.NewGuid();
            var assignedAt = now;
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO TeamCoaches (Id, CoachId, TeamId, Role, AssignedAt)
                VALUES ({tcId}, {coachId}, {teamId}, {roleInt}, {assignedAt})
            ", cancellationToken);
        }

        // 6. Query back the updated coach to return full detail
        var coach = await _db.Database
            .SqlQueryRaw<UpdatedCoachRaw>(@"
                SELECT
                    c.Id,
                    c.FirstName,
                    c.LastName,
                    c.DateOfBirth,
                    c.Photo,
                    u.Email,
                    c.Phone,
                    c.AssociationId,
                    c.HasAccount,
                    c.Role,
                    c.Biography,
                    c.Specializations,
                    c.IsArchived,
                    c.ClubId,
                    cl.Name AS ClubName,
                    c.CreatedAt,
                    c.UpdatedAt
                FROM Coaches c
                LEFT JOIN Users u ON u.Id = c.UserId
                INNER JOIN Clubs cl ON cl.Id = c.ClubId
                WHERE c.Id = {0}
            ", coachId)
            .FirstOrDefaultAsync(cancellationToken);

        if (coach == null)
        {
            throw new NotFoundException("Coach", coachId.ToString());
        }

        // 7. Fetch updated team assignments
        var teams = await _db.Database
            .SqlQueryRaw<UpdatedTeamAssignmentRaw>(@"
                SELECT
                    t.Id AS TeamId,
                    t.Name AS TeamName,
                    ag.Id AS AgeGroupId,
                    ag.Name AS AgeGroupName
                FROM TeamCoaches tc
                INNER JOIN Teams t ON t.Id = tc.TeamId
                INNER JOIN AgeGroups ag ON ag.Id = t.AgeGroupId
                WHERE tc.CoachId = {0}
                ORDER BY ag.Name, t.Name
            ", coachId)
            .ToListAsync(cancellationToken);

        // 8. Fetch coordinator age groups
        var coordinatorRoles = await _db.Database
            .SqlQueryRaw<UpdatedCoordinatorRoleRaw>(@"
                SELECT
                    ag.Id AS AgeGroupId,
                    ag.Name AS AgeGroupName
                FROM AgeGroupCoordinators agc
                INNER JOIN AgeGroups ag ON ag.Id = agc.AgeGroupId
                WHERE agc.CoachId = {0}
                ORDER BY ag.Name
            ", coachId)
            .ToListAsync(cancellationToken);

        // Map the role enum value to its string name
        var roleName = Enum.IsDefined(typeof(CoachRole), coach.Role)
            ? ((CoachRole)coach.Role).ToString()
            : "Unknown";

        // 9. Fetch linked emergency-contact accounts
        var linkedAccountsData = await _db.Database
            .SqlQueryRaw<UpdatedCoachLinkedAccountRaw>(@"
                SELECT
                    ec.Id,
                    ec.Name,
                    ec.Phone,
                    u.Email,
                    CASE WHEN ec.UserId IS NULL THEN CAST(0 AS bit) ELSE CAST(1 AS bit) END AS IsLinked
                FROM EmergencyContacts ec
                LEFT JOIN Users u ON u.Id = ec.UserId
                WHERE ec.CoachId = {0}
                  AND ec.UserId IS NOT NULL
                ORDER BY ec.Name
            ", coachId)
            .ToListAsync(cancellationToken);

        var linkedAccounts = linkedAccountsData
            .Select(ec => new LinkedAccountDto
            {
                Id = ec.Id,
                FirstName = ExtractFirstName(ec.Name),
                LastName = ExtractLastName(ec.Name),
                Email = ec.Email,
                Phone = ec.Phone,
                IsLinked = ec.IsLinked
            })
            .ToArray();

        return new CoachDetailDto
        {
            Id = coach.Id,
            FirstName = coach.FirstName ?? string.Empty,
            LastName = coach.LastName ?? string.Empty,
            DateOfBirth = coach.DateOfBirth,
            PhotoUrl = coach.Photo,
            Email = coach.Email,
            Phone = coach.Phone,
            AssociationId = coach.AssociationId,
            HasAccount = coach.HasAccount,
            Role = roleName,
            Biography = coach.Biography,
            Specializations = ParseSpecializations(coach.Specializations),
            IsArchived = coach.IsArchived,
            ClubId = coach.ClubId,
            ClubName = coach.ClubName ?? string.Empty,
            TeamAssignments = teams.Select(t => new CoachTeamAssignmentDto
            {
                TeamId = t.TeamId,
                TeamName = t.TeamName ?? string.Empty,
                AgeGroupId = t.AgeGroupId,
                AgeGroupName = t.AgeGroupName ?? string.Empty,
                Role = roleName
            }).ToList(),
            CoordinatorRoles = coordinatorRoles.Select(cr => new CoachAgeGroupCoordinatorDto
            {
                AgeGroupId = cr.AgeGroupId,
                AgeGroupName = cr.AgeGroupName ?? string.Empty
            }).ToList(),
            CreatedAt = coach.CreatedAt,
            UpdatedAt = coach.UpdatedAt,
            LinkedAccounts = linkedAccounts.Length > 0 ? linkedAccounts : null
        };
    }

    /// <summary>
    /// Parse specializations string (comma-separated) into a list of strings.
    /// </summary>
    private static List<string> ParseSpecializations(string? specializations)
    {
        if (string.IsNullOrWhiteSpace(specializations))
        {
            return new List<string>();
        }

        return specializations
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToList();
    }

    private static string ExtractFirstName(string? fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName)) return string.Empty;
        var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return parts.Length > 0 ? parts[0] : string.Empty;
    }

    private static string ExtractLastName(string? fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName)) return string.Empty;
        var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return parts.Length > 1 ? string.Join(' ', parts.Skip(1)) : string.Empty;
    }
}

#region Raw SQL Query Models

/// <summary>
/// Raw SQL projection for checking coach existence.
/// </summary>
internal class CoachExistsResult
{
    public Guid Id { get; set; }
    public bool IsArchived { get; set; }
}

/// <summary>
/// Raw SQL projection for the updated coach row.
/// </summary>
internal class UpdatedCoachRaw
{
    public Guid Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Photo { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? AssociationId { get; set; }
    public bool HasAccount { get; set; }
    public int Role { get; set; }
    public string? Biography { get; set; }
    public string? Specializations { get; set; }
    public bool IsArchived { get; set; }
    public Guid ClubId { get; set; }
    public string? ClubName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// Raw SQL projection for team assignments after update.
/// </summary>
internal class UpdatedTeamAssignmentRaw
{
    public Guid TeamId { get; set; }
    public string? TeamName { get; set; }
    public Guid AgeGroupId { get; set; }
    public string? AgeGroupName { get; set; }
}

/// <summary>
/// Raw SQL projection for coordinator roles after update.
/// </summary>
internal class UpdatedCoordinatorRoleRaw
{
    public Guid AgeGroupId { get; set; }
    public string? AgeGroupName { get; set; }
}

/// <summary>
/// Raw SQL projection for linked account rows after coach update.
/// </summary>
internal class UpdatedCoachLinkedAccountRaw
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool IsLinked { get; set; }
}

#endregion

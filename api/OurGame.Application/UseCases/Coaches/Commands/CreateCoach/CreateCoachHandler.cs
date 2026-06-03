using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Coaches.Commands.CreateCoach;

public class CreateCoachHandler : IRequestHandler<CreateCoachCommand, CoachDetailDto>
{
    private readonly OurGameContext _db;
    private readonly IBlobStorageService _blobStorage;

    public CreateCoachHandler(OurGameContext db, IBlobStorageService blobStorage)
    {
        _db = db;
        _blobStorage = blobStorage;
    }

    public async Task<CoachDetailDto> Handle(CreateCoachCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var clubId = command.ClubId;

        var clubExists = await _db.Clubs.AnyAsync(c => c.Id == clubId, cancellationToken);
        if (!clubExists)
            throw new NotFoundException("Club", clubId.ToString());

        var newId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        var specializations = dto.Specializations.Length > 0
            ? string.Join(",", dto.Specializations)
            : (string?)null;

        var clubRoles = dto.ClubRoles.Length > 0
            ? string.Join(",", dto.ClubRoles)
            : (string?)null;

        var badges = dto.Badges.Length > 0
            ? string.Join(",", dto.Badges)
            : (string?)null;

        var phone = dto.Phone ?? string.Empty;
        var associationId = dto.AssociationId ?? string.Empty;
        var photo = await _blobStorage.UploadImageAsync(dto.Photo, "coach-photos", newId.ToString(), cancellationToken);

        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO Coaches (Id, ClubId, FirstName, LastName, Phone, DateOfBirth, AssociationId,
                                 Biography, Specializations, ClubRoles, Badges, Photo, HasAccount, IsArchived,
                                 CreatedAt, UpdatedAt)
            VALUES ({newId}, {clubId}, {dto.FirstName}, {dto.LastName}, {phone}, {dto.DateOfBirth},
                    {associationId}, {dto.Biography}, {specializations}, {clubRoles}, {badges}, {photo},
                    {false}, {false}, {now}, {now})
        ", cancellationToken);

        foreach (var teamId in dto.TeamIds)
        {
            var tcId = Guid.NewGuid();
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO TeamCoaches (Id, CoachId, TeamId, IsPrimary, AssignedAt)
                VALUES ({tcId}, {newId}, {teamId}, {false}, {now})
            ", cancellationToken);
        }

        foreach (var agRole in dto.AgeGroupRoles)
        {
            if (!Enum.TryParse<CoachRole>(agRole.Role, ignoreCase: true, out var parsedRole)) continue;
            var agcId = Guid.NewGuid();
            var roleInt = (int)parsedRole;
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO AgeGroupCoordinators (Id, AgeGroupId, CoachId, Role)
                VALUES ({agcId}, {agRole.AgeGroupId}, {newId}, {roleInt})
            ", cancellationToken);
        }

        var coach = await _db.Database
            .SqlQueryRaw<CreatedCoachRaw>(@"
                SELECT
                    c.Id,
                    c.FirstName,
                    c.LastName,
                    c.DateOfBirth,
                    c.Photo,
                    c.Phone,
                    c.AssociationId,
                    c.HasAccount,
                    c.Biography,
                    c.Specializations,
                    c.ClubRoles,
                    c.Badges,
                    c.IsArchived,
                    c.ClubId,
                    cl.Name AS ClubName,
                    c.CreatedAt,
                    c.UpdatedAt
                FROM Coaches c
                INNER JOIN Clubs cl ON cl.Id = c.ClubId
                WHERE c.Id = {0}
            ", newId)
            .FirstOrDefaultAsync(cancellationToken);

        if (coach == null)
            throw new Exception("Failed to retrieve created coach.");

        var teams = await _db.Database
            .SqlQueryRaw<CreatedTeamAssignmentRaw>(@"
                SELECT
                    t.Id AS TeamId,
                    t.Name AS TeamName,
                    ag.Id AS AgeGroupId,
                    ag.Name AS AgeGroupName,
                    tc.IsPrimary AS TeamIsPrimary
                FROM TeamCoaches tc
                INNER JOIN Teams t ON t.Id = tc.TeamId
                INNER JOIN AgeGroups ag ON ag.Id = t.AgeGroupId
                WHERE tc.CoachId = {0}
                ORDER BY ag.Name, t.Name
            ", newId)
            .ToListAsync(cancellationToken);

        return new CoachDetailDto
        {
            Id = coach.Id,
            FirstName = coach.FirstName ?? string.Empty,
            LastName = coach.LastName ?? string.Empty,
            DateOfBirth = coach.DateOfBirth,
            PhotoUrl = coach.Photo,
            Phone = coach.Phone,
            AssociationId = coach.AssociationId,
            HasAccount = false,
            ClubRoles = ParseSpecializations(coach.ClubRoles),
            Badges = ParseSpecializations(coach.Badges),
            Biography = coach.Biography,
            Specializations = ParseSpecializations(coach.Specializations),
            IsArchived = false,
            ClubId = coach.ClubId,
            ClubName = coach.ClubName ?? string.Empty,
            TeamAssignments = teams.Select(t => new CoachTeamAssignmentDto
            {
                TeamId = t.TeamId,
                TeamName = t.TeamName ?? string.Empty,
                AgeGroupId = t.AgeGroupId,
                AgeGroupName = t.AgeGroupName ?? string.Empty,
                IsPrimary = t.TeamIsPrimary
            }).ToList(),
            CoordinatorRoles = new List<CoachAgeGroupCoordinatorDto>(),
            CreatedAt = coach.CreatedAt,
            UpdatedAt = coach.UpdatedAt,
            LinkedAccounts = null
        };
    }

    private static List<string> ParseSpecializations(string? specializations)
    {
        if (string.IsNullOrWhiteSpace(specializations))
            return new List<string>();

        return specializations
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToList();
    }
}

#region Raw SQL Query Models

internal class CreatedCoachRaw
{
    public Guid Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Photo { get; set; }
    public string? Phone { get; set; }
    public string? AssociationId { get; set; }
    public bool HasAccount { get; set; }
    public string? Biography { get; set; }
    public string? Specializations { get; set; }
    public string? ClubRoles { get; set; }
    public string? Badges { get; set; }
    public bool IsArchived { get; set; }
    public Guid ClubId { get; set; }
    public string? ClubName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

internal class CreatedTeamAssignmentRaw
{
    public Guid TeamId { get; set; }
    public string? TeamName { get; set; }
    public Guid AgeGroupId { get; set; }
    public string? AgeGroupName { get; set; }
    public bool TeamIsPrimary { get; set; }
}

#endregion

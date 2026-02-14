using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Coaches.Queries.GetCoachById;

/// <summary>
/// Query to get a coach by ID with full profile detail
/// </summary>
public record GetCoachByIdQuery(Guid CoachId) : IRequest<CoachDetailDto?>;

/// <summary>
/// Handler for GetCoachByIdQuery - retrieves full coach profile using raw SQL
/// </summary>
public class GetCoachByIdHandler : IRequestHandler<GetCoachByIdQuery, CoachDetailDto?>
{
    private readonly OurGameContext _db;

    public GetCoachByIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<CoachDetailDto?> Handle(GetCoachByIdQuery query, CancellationToken cancellationToken)
    {
        // 1. Fetch coach base details with club name
        var coachSql = @"
            SELECT
                c.Id,
                c.FirstName,
                c.LastName,
                c.DateOfBirth,
                c.Photo,
                c.Email,
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
            INNER JOIN Clubs cl ON cl.Id = c.ClubId
            WHERE c.Id = {0}";

        var coach = await _db.Database
            .SqlQueryRaw<CoachRaw>(coachSql, query.CoachId)
            .FirstOrDefaultAsync(cancellationToken);

        if (coach == null)
        {
            return null;
        }

        // 2. Fetch team assignments (TeamCoaches → Teams → AgeGroups)
        var teamsSql = @"
            SELECT
                t.Id AS TeamId,
                t.Name AS TeamName,
                ag.Id AS AgeGroupId,
                ag.Name AS AgeGroupName
            FROM TeamCoaches tc
            INNER JOIN Teams t ON t.Id = tc.TeamId
            INNER JOIN AgeGroups ag ON ag.Id = t.AgeGroupId
            WHERE tc.CoachId = {0}
            ORDER BY ag.Name, t.Name";

        var teams = await _db.Database
            .SqlQueryRaw<TeamAssignmentRaw>(teamsSql, query.CoachId)
            .ToListAsync(cancellationToken);

        // 3. Fetch coordinator age groups (AgeGroupCoordinators → AgeGroups)
        var coordinatorSql = @"
            SELECT
                ag.Id AS AgeGroupId,
                ag.Name AS AgeGroupName
            FROM AgeGroupCoordinators agc
            INNER JOIN AgeGroups ag ON ag.Id = agc.AgeGroupId
            WHERE agc.CoachId = {0}
            ORDER BY ag.Name";

        var coordinatorRoles = await _db.Database
            .SqlQueryRaw<CoordinatorRoleRaw>(coordinatorSql, query.CoachId)
            .ToListAsync(cancellationToken);

        // Map the coach's global role enum value to its string name
        var roleName = Enum.IsDefined(typeof(CoachRole), coach.Role)
            ? ((CoachRole)coach.Role).ToString()
            : "Unknown";

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
            UpdatedAt = coach.UpdatedAt
        };
    }

    /// <summary>
    /// Parse specializations string (comma-separated or JSON array) into a list of strings.
    /// Returns empty list for null or empty input.
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
}

#region Raw SQL DTOs

public class CoachRaw
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

public class TeamAssignmentRaw
{
    public Guid TeamId { get; set; }
    public string? TeamName { get; set; }
    public Guid AgeGroupId { get; set; }
    public string? AgeGroupName { get; set; }
}

public class CoordinatorRoleRaw
{
    public Guid AgeGroupId { get; set; }
    public string? AgeGroupName { get; set; }
}

#endregion

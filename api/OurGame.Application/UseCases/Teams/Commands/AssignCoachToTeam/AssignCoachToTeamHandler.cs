using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;
using TeamCoachDto = OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId.DTOs.TeamCoachDto;

namespace OurGame.Application.UseCases.Teams.Commands.AssignCoachToTeam;

/// <summary>
/// Handler for assigning a coach to a team with a specific role
/// </summary>
public class AssignCoachToTeamHandler : IRequestHandler<AssignCoachToTeamCommand, TeamCoachDto>
{
    private readonly OurGameContext _db;

    public AssignCoachToTeamHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<TeamCoachDto> Handle(AssignCoachToTeamCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var teamId = command.TeamId;

        // Parse and validate role
        if (!Enum.TryParse<CoachRole>(dto.Role, ignoreCase: true, out var role))
        {
            throw new ValidationException("Role",
                "Invalid role. Must be one of: headcoach, assistantcoach, goalkeepercoach, fitnesscoach, technicalcoach.");
        }

        // Validate team exists and get its club
        var teamResult = await _db.Database
            .SqlQueryRaw<TeamValidationResult>(@"
                SELECT Id, ClubId, IsArchived
                FROM Teams
                WHERE Id = {0}
            ", teamId)
            .FirstOrDefaultAsync(cancellationToken);

        if (teamResult == null)
        {
            throw new NotFoundException("Team", teamId.ToString());
        }

        if (teamResult.IsArchived)
        {
            throw new ValidationException("Team", "Cannot assign coaches to an archived team.");
        }

        // Validate coach exists, is not archived, and belongs to the same club
        var coachResult = await _db.Database
            .SqlQueryRaw<CoachValidationResult>(@"
                SELECT Id, ClubId, IsArchived
                FROM Coaches
                WHERE Id = {0}
            ", dto.CoachId)
            .FirstOrDefaultAsync(cancellationToken);

        if (coachResult == null)
        {
            throw new NotFoundException("Coach", dto.CoachId.ToString());
        }

        if (coachResult.IsArchived)
        {
            throw new ValidationException("Coach", "Cannot assign an archived coach to a team.");
        }

        if (coachResult.ClubId != teamResult.ClubId)
        {
            throw new ValidationException("Coach",
                "Coach must belong to the same club as the team.");
        }

        // Check if coach is already assigned to this team
        var existingAssignment = await _db.Database
            .SqlQueryRaw<TeamCoachExistsResult>(@"
                SELECT Id
                FROM TeamCoaches
                WHERE TeamId = {0} AND CoachId = {1}
            ", teamId, dto.CoachId)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingAssignment != null)
        {
            throw new ValidationException("Coach", "This coach is already assigned to this team.");
        }

        // Insert team coach assignment
        var newAssignmentId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var roleInt = (int)role;

        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO TeamCoaches (Id, TeamId, CoachId, Role, AssignedAt)
            VALUES ({newAssignmentId}, {teamId}, {dto.CoachId}, {roleInt}, {now})
        ", cancellationToken);

        // Query back the assigned coach details
        var result = await _db.Database
            .SqlQueryRaw<TeamCoachQueryResult>(@"
                SELECT
                    c.Id,
                    c.FirstName,
                    c.LastName,
                    c.Photo,
                    tc.Role,
                    c.IsArchived
                FROM Coaches c
                INNER JOIN TeamCoaches tc ON tc.CoachId = c.Id
                WHERE tc.TeamId = {0} AND tc.CoachId = {1}
            ", teamId, dto.CoachId)
            .FirstOrDefaultAsync(cancellationToken);

        if (result == null)
        {
            throw new Exception("Failed to retrieve assigned coach.");
        }

        var roleName = Enum.GetName(typeof(CoachRole), result.Role) ?? CoachRole.AssistantCoach.ToString();

        return new TeamCoachDto
        {
            Id = result.Id,
            FirstName = result.FirstName ?? string.Empty,
            LastName = result.LastName ?? string.Empty,
            PhotoUrl = result.Photo,
            Role = roleName,
            IsArchived = result.IsArchived
        };
    }
}

/// <summary>
/// Raw SQL query result for team validation
/// </summary>
internal class TeamValidationResult
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public bool IsArchived { get; set; }
}

/// <summary>
/// Raw SQL query result for coach validation
/// </summary>
internal class CoachValidationResult
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public bool IsArchived { get; set; }
}

/// <summary>
/// Raw SQL query result for checking existing team coach assignment
/// </summary>
internal class TeamCoachExistsResult
{
    public Guid Id { get; set; }
}

/// <summary>
/// Raw SQL query result for coach data
/// </summary>
internal class TeamCoachQueryResult
{
    public Guid Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Photo { get; set; }
    public int Role { get; set; }
    public bool IsArchived { get; set; }
}

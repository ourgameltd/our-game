using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Models;
using TeamCoachDto = OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId.DTOs.TeamCoachDto;

namespace OurGame.Application.UseCases.Teams.Commands.UpdateTeamCoachRole;

/// <summary>
/// Handler for updating the role of a coach on a team
/// </summary>
public class UpdateTeamCoachRoleHandler : IRequestHandler<UpdateTeamCoachRoleCommand, TeamCoachDto>
{
    private readonly OurGameContext _db;

    public UpdateTeamCoachRoleHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<TeamCoachDto> Handle(UpdateTeamCoachRoleCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var teamId = command.TeamId;
        var coachId = command.CoachId;

        // Validate assignment exists
        var assignmentExists = await _db.Database
            .SqlQueryRaw<TeamCoachAssignmentResult>(@"
                SELECT Id
                FROM TeamCoaches
                WHERE TeamId = {0} AND CoachId = {1}
            ", teamId, coachId)
            .FirstOrDefaultAsync(cancellationToken);

        if (assignmentExists == null)
        {
            throw new NotFoundException("TeamCoach",
                $"Coach assignment not found for team {teamId} and coach {coachId}");
        }

        // Update IsPrimary
        var isPrimary = dto.IsPrimary;

        var rowsAffected = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE TeamCoaches
            SET IsPrimary = {isPrimary}
            WHERE TeamId = {teamId} AND CoachId = {coachId}
        ", cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException("TeamCoach",
                $"Failed to update coach assignment for team {teamId} and coach {coachId}");
        }

        // Query back the updated coach details
        var result = await _db.Database
            .SqlQueryRaw<TeamCoachQueryResult>(@"
                SELECT
                    c.Id,
                    c.AssociationId,
                    c.FirstName,
                    c.LastName,
                    c.Photo,
                    tc.IsPrimary,
                    c.IsArchived
                FROM Coaches c
                INNER JOIN TeamCoaches tc ON tc.CoachId = c.Id
                WHERE tc.TeamId = {0} AND tc.CoachId = {1}
            ", teamId, coachId)
            .FirstOrDefaultAsync(cancellationToken);

        if (result == null)
        {
            throw new Exception("Failed to retrieve updated coach.");
        }

        return new TeamCoachDto
        {
            Id = result.Id,
            AssociationId = result.AssociationId,
            FirstName = result.FirstName ?? string.Empty,
            LastName = result.LastName ?? string.Empty,
            PhotoUrl = result.Photo,
            IsPrimary = result.IsPrimary,
            IsArchived = result.IsArchived
        };
    }
}

/// <summary>
/// Raw SQL query result for team coach assignment check
/// </summary>
internal class TeamCoachAssignmentResult
{
    public Guid Id { get; set; }
}

/// <summary>
/// Raw SQL query result for coach data
/// </summary>
internal class TeamCoachQueryResult
{
    public Guid Id { get; set; }
    public string? AssociationId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Photo { get; set; }
    public bool IsPrimary { get; set; }
    public bool IsArchived { get; set; }
}

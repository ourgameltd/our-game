using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Commands.RemoveCoachFromTeam;

/// <summary>
/// Handler for removing a coach from a team
/// </summary>
public class RemoveCoachFromTeamHandler : IRequestHandler<RemoveCoachFromTeamCommand>
{
    private readonly OurGameContext _db;

    public RemoveCoachFromTeamHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task Handle(RemoveCoachFromTeamCommand command, CancellationToken cancellationToken)
    {
        var teamId = command.TeamId;
        var coachId = command.CoachId;

        // Validate team exists
        var teamExists = await _db.Database
            .SqlQueryRaw<TeamExistsResult>(@"
                SELECT Id
                FROM Teams
                WHERE Id = {0}
            ", teamId)
            .FirstOrDefaultAsync(cancellationToken);

        if (teamExists == null)
        {
            throw new NotFoundException("Team", teamId.ToString());
        }

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

        // Delete the team coach assignment
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM TeamCoaches
            WHERE TeamId = {teamId} AND CoachId = {coachId}
        ", cancellationToken);
    }
}

/// <summary>
/// Raw SQL query result for team existence check
/// </summary>
internal class TeamExistsResult
{
    public Guid Id { get; set; }
}

/// <summary>
/// Raw SQL query result for team coach assignment check
/// </summary>
internal class TeamCoachAssignmentResult
{
    public Guid Id { get; set; }
}

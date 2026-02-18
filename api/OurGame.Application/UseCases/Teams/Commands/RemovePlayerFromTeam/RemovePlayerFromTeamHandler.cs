using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Responses;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Commands.RemovePlayerFromTeam;

/// <summary>
/// Handler for removing a player from a team
/// </summary>
public class RemovePlayerFromTeamHandler : IRequestHandler<RemovePlayerFromTeamCommand, Result>
{
    private readonly OurGameContext _db;

    public RemovePlayerFromTeamHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<Result> Handle(RemovePlayerFromTeamCommand command, CancellationToken cancellationToken)
    {
        var teamId = command.TeamId;
        var playerId = command.PlayerId;

        // Check if the player-team assignment exists
        var assignmentExists = await _db.Database
            .SqlQueryRaw<PlayerTeamAssignmentResult>(@"
                SELECT PlayerId, TeamId
                FROM PlayerTeams
                WHERE TeamId = {0} AND PlayerId = {1}
            ", teamId, playerId)
            .FirstOrDefaultAsync(cancellationToken);

        if (assignmentExists == null)
        {
            return Result.NotFound($"Player assignment not found for team {teamId} and player {playerId}");
        }

        // Delete the player-team assignment
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM PlayerTeams
            WHERE TeamId = {teamId} AND PlayerId = {playerId}
        ", cancellationToken);

        return Result.Success();
    }
}

/// <summary>
/// Raw SQL query result for player-team assignment check
/// </summary>
internal class PlayerTeamAssignmentResult
{
    public Guid PlayerId { get; set; }
    public Guid TeamId { get; set; }
}

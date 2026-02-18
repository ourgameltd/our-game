using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Responses;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Commands.UpdateTeamPlayerSquadNumber;

/// <summary>
/// Command to update a player's squad number within a team.
/// </summary>
public record UpdateTeamPlayerSquadNumberCommand(Guid TeamId, Guid PlayerId, int SquadNumber, string UserId) : IRequest<Result>;

/// <summary>
/// Handler for updating a player's squad number on a team.
/// Validates that the assignment exists and that the squad number is not already in use.
/// </summary>
public class UpdateTeamPlayerSquadNumberHandler : IRequestHandler<UpdateTeamPlayerSquadNumberCommand, Result>
{
    private readonly OurGameContext _db;

    public UpdateTeamPlayerSquadNumberHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<Result> Handle(UpdateTeamPlayerSquadNumberCommand command, CancellationToken cancellationToken)
    {
        var teamId = command.TeamId;
        var playerId = command.PlayerId;
        var squadNumber = command.SquadNumber;

        // 1. Check if the PlayerTeam assignment exists
        var assignmentExists = await _db.Database
            .SqlQueryRaw<int>(
                "SELECT COUNT(1) FROM PlayerTeams WHERE TeamId = {0} AND PlayerId = {1}",
                teamId, playerId)
            .FirstOrDefaultAsync(cancellationToken);

        if (assignmentExists == 0)
        {
            return Result.NotFound($"Player {playerId} is not assigned to team {teamId}");
        }

        // 2. Check if the squad number is already used by another player on the same team
        var squadNumberInUse = await _db.Database
            .SqlQueryRaw<int>(
                "SELECT COUNT(1) FROM PlayerTeams WHERE TeamId = {0} AND SquadNumber = {1} AND PlayerId != {2}",
                teamId, squadNumber, playerId)
            .FirstOrDefaultAsync(cancellationToken);

        if (squadNumberInUse > 0)
        {
            return Result.Failure($"Squad number {squadNumber} is already assigned to another player on this team");
        }

        // 3. Update the squad number
        var rowsAffected = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE PlayerTeams
            SET SquadNumber = {squadNumber}
            WHERE TeamId = {teamId} AND PlayerId = {playerId}
        ", cancellationToken);

        if (rowsAffected == 0)
        {
            return Result.NotFound($"Player {playerId} is not assigned to team {teamId}");
        }

        return Result.Success();
    }
}

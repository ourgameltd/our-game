using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.Commands.AddPlayerToTeam.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Commands.AddPlayerToTeam;

/// <summary>
/// Command to add a player to a team with a squad number
/// </summary>
public record AddPlayerToTeamCommand(Guid TeamId, Guid PlayerId, int SquadNumber, string UserId) 
    : ICommand<Result<AddPlayerToTeamResultDto>>;

/// <summary>
/// Raw database result for team validation query
/// </summary>
public class TeamExistsRawDto
{
    public Guid Id { get; set; }
}

/// <summary>
/// Raw database result for player validation query
/// </summary>
public class PlayerExistsRawDto
{
    public Guid Id { get; set; }
}

/// <summary>
/// Raw database result for existing assignment check
/// </summary>
public class PlayerTeamExistsRawDto
{
    public Guid Id { get; set; }
}

/// <summary>
/// Raw database result for squad number check
/// </summary>
public class SquadNumberExistsRawDto
{
    public int SquadNumber { get; set; }
}

/// <summary>
/// Handler for AddPlayerToTeamCommand
/// </summary>
public class AddPlayerToTeamHandler : IRequestHandler<AddPlayerToTeamCommand, Result<AddPlayerToTeamResultDto>>
{
    private readonly OurGameContext _db;

    public AddPlayerToTeamHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<Result<AddPlayerToTeamResultDto>> Handle(AddPlayerToTeamCommand command, CancellationToken cancellationToken)
    {
        // Validate team exists
        var teamSql = "SELECT Id FROM Teams WHERE Id = {0}";
        var team = await _db.Database
            .SqlQueryRaw<TeamExistsRawDto>(teamSql, command.TeamId)
            .FirstOrDefaultAsync(cancellationToken);

        if (team == null)
        {
            return Result<AddPlayerToTeamResultDto>.NotFound($"Team with ID {command.TeamId} not found");
        }

        // Validate player exists
        var playerSql = "SELECT Id FROM Players WHERE Id = {0}";
        var player = await _db.Database
            .SqlQueryRaw<PlayerExistsRawDto>(playerSql, command.PlayerId)
            .FirstOrDefaultAsync(cancellationToken);

        if (player == null)
        {
            return Result<AddPlayerToTeamResultDto>.NotFound($"Player with ID {command.PlayerId} not found");
        }

        // Check if player is already assigned to this team
        var assignmentCheckSql = "SELECT Id FROM PlayerTeams WHERE PlayerId = {0} AND TeamId = {1}";
        var existingAssignment = await _db.Database
            .SqlQueryRaw<PlayerTeamExistsRawDto>(assignmentCheckSql, command.PlayerId, command.TeamId)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingAssignment != null)
        {
            return Result<AddPlayerToTeamResultDto>.Failure(
                $"Player is already assigned to this team", 
                400);
        }

        // Check if squad number is already used by another player on this team
        var squadNumberCheckSql = "SELECT SquadNumber FROM PlayerTeams WHERE TeamId = {0} AND SquadNumber = {1}";
        var existingSquadNumber = await _db.Database
            .SqlQueryRaw<SquadNumberExistsRawDto>(squadNumberCheckSql, command.TeamId, command.SquadNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingSquadNumber != null)
        {
            return Result<AddPlayerToTeamResultDto>.Failure(
                $"Squad number {command.SquadNumber} is already assigned to another player on this team", 
                400);
        }

        // Insert into PlayerTeams
        var newId = Guid.NewGuid();
        var assignedAt = DateTime.UtcNow;

        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO PlayerTeams (Id, PlayerId, TeamId, SquadNumber, AssignedAt)
            VALUES ({newId}, {command.PlayerId}, {command.TeamId}, {command.SquadNumber}, {assignedAt})
        ", cancellationToken);

        // Return success result
        var result = new AddPlayerToTeamResultDto
        {
            PlayerId = command.PlayerId,
            TeamId = command.TeamId,
            SquadNumber = command.SquadNumber
        };

        return Result<AddPlayerToTeamResultDto>.Success(result);
    }
}

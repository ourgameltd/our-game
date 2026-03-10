using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Responses;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Commands.UpdateTeamSquadNumbers;

/// <summary>
/// Command to update squad numbers for multiple players within a team.
/// Supports swapping numbers and clearing assignments atomically.
/// </summary>
public record UpdateTeamSquadNumbersCommand(
    Guid TeamId, 
    List<SquadNumberAssignment> Assignments, 
    string UserId) : IRequest<Result>;

/// <summary>
/// Represents a single player squad number assignment.
/// </summary>
public record SquadNumberAssignment(Guid PlayerId, int? SquadNumber);

/// <summary>
/// Handler for bulk updating squad numbers on a team.
/// Uses a two-phase approach to safely handle number swaps:
/// 1. Clear all squad numbers in the request
/// 2. Assign new squad numbers
/// This avoids uniqueness constraint violations during swaps.
/// </summary>
public class UpdateTeamSquadNumbersHandler : IRequestHandler<UpdateTeamSquadNumbersCommand, Result>
{
    private readonly OurGameContext _db;

    public UpdateTeamSquadNumbersHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<Result> Handle(UpdateTeamSquadNumbersCommand command, CancellationToken cancellationToken)
    {
        var teamId = command.TeamId;
        var assignments = command.Assignments;

        // Validate: Check for duplicate non-null squad numbers in the request
        var assignedNumbers = assignments
            .Where(a => a.SquadNumber.HasValue)
            .Select(a => a.SquadNumber!.Value)
            .ToList();

        var duplicates = assignedNumbers
            .GroupBy(n => n)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

        if (duplicates.Any())
        {
            return Result.Failure($"Duplicate squad numbers detected in request: {string.Join(", ", duplicates)}");
        }

        // Validate: Ensure all players belong to the team
        var playerIds = assignments.Select(a => a.PlayerId).Distinct().ToList();
        
        // Build a parameterized query to validate all players belong to the team
        var playerCount = playerIds.Count;
        var validPlayerIds = await _db.PlayerTeams
            .Where(pt => pt.TeamId == teamId && playerIds.Contains(pt.PlayerId))
            .Select(pt => pt.PlayerId)
            .Distinct()
            .CountAsync(cancellationToken);

        if (validPlayerIds != playerCount)
        {
            return Result.NotFound("One or more players are not assigned to this team");
        }

        // Execute atomic update in transaction
        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            // Phase 1: Clear squad numbers for all players in the request
            // This prevents uniqueness constraint violations during swaps
            foreach (var playerId in playerIds)
            {
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    UPDATE PlayerTeams
                    SET SquadNumber = NULL
                    WHERE TeamId = {teamId} AND PlayerId = {playerId}
                ", cancellationToken);
            }

            // Phase 2: Assign new squad numbers (only for non-null values)
            foreach (var assignment in assignments.Where(a => a.SquadNumber.HasValue))
            {
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    UPDATE PlayerTeams
                    SET SquadNumber = {assignment.SquadNumber!.Value}
                    WHERE TeamId = {teamId} AND PlayerId = {assignment.PlayerId}
                ", cancellationToken);
            }

            await transaction.CommitAsync(cancellationToken);
            return Result.Success();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure($"Failed to update squad numbers: {ex.Message}");
        }
    }
}

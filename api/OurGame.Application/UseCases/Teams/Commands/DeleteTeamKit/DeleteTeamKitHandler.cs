using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Commands.DeleteTeamKit;

/// <summary>
/// Handler for deleting an existing team kit.
/// Validates kit exists and belongs to the specified team before deletion.
/// </summary>
public class DeleteTeamKitHandler : IRequestHandler<DeleteTeamKitCommand>
{
    private readonly OurGameContext _db;

    public DeleteTeamKitHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task Handle(DeleteTeamKitCommand command, CancellationToken cancellationToken)
    {
        var teamId = command.TeamId;
        var kitId = command.KitId;

        // 1. Verify kit exists and belongs to the specified team
        var kitCheck = await _db.Database
            .SqlQueryRaw<KitCheckResult>(
                "SELECT Id, TeamId FROM Kits WHERE Id = {0}", kitId)
            .FirstOrDefaultAsync(cancellationToken);

        if (kitCheck == null)
        {
            throw new NotFoundException("Kit", kitId.ToString());
        }

        if (kitCheck.TeamId != teamId)
        {
            throw new NotFoundException("Kit", kitId.ToString());
        }

        // 2. Delete the kit from Kits table
        var rowsAffected = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM Kits WHERE Id = {kitId} AND TeamId = {teamId}
        ", cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException("Kit", kitId.ToString());
        }
    }
}

/// <summary>
/// Raw SQL query result for kit existence check.
/// </summary>
internal class KitCheckResult
{
    public Guid Id { get; set; }
    public Guid? TeamId { get; set; }
}

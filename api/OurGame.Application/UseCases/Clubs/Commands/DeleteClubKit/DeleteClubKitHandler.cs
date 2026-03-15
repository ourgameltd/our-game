using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Commands.DeleteClubKit;

/// <summary>
/// Handler for deleting an existing club kit.
/// Validates the kit belongs to the specified club and is not a team kit.
/// </summary>
public class DeleteClubKitHandler : IRequestHandler<DeleteClubKitCommand>
{
    private readonly OurGameContext _db;

    public DeleteClubKitHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task Handle(DeleteClubKitCommand command, CancellationToken cancellationToken)
    {
        var clubId = command.ClubId;
        var kitId = command.KitId;

        var kitCheck = await _db.Database
            .SqlQueryRaw<KitCheckResult>(
                "SELECT Id, ClubId, TeamId FROM Kits WHERE Id = {0}", kitId)
            .FirstOrDefaultAsync(cancellationToken);

        if (kitCheck == null)
        {
            throw new NotFoundException("Kit", kitId.ToString());
        }

        if (kitCheck.ClubId != clubId || kitCheck.TeamId != null)
        {
            throw new NotFoundException("Kit", kitId.ToString());
        }

        var rowsAffected = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM Kits WHERE Id = {kitId} AND ClubId = {clubId} AND TeamId IS NULL
        ", cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException("Kit", kitId.ToString());
        }
    }
}

internal class KitCheckResult
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public Guid? TeamId { get; set; }
}
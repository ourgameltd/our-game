using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Drills.Commands.ArchiveDrill;

/// <summary>
/// Handler for archiving or unarchiving a drill.
/// Only the creating coach can archive/unarchive the drill.
/// </summary>
public class ArchiveDrillHandler : IRequestHandler<ArchiveDrillCommand>
{
    private readonly OurGameContext _db;

    public ArchiveDrillHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task Handle(ArchiveDrillCommand command, CancellationToken cancellationToken)
    {
        var drillId = command.DrillId;

        var drillCheck = await _db.Database
            .SqlQueryRaw<ArchiveDrillCheckRaw>(@"
                SELECT Id, CreatedBy
                FROM Drills
                WHERE Id = {0}
            ", drillId)
            .FirstOrDefaultAsync(cancellationToken);

        if (drillCheck == null)
        {
            throw new NotFoundException("Drill", drillId.ToString());
        }

        var currentCoachId = await _db.Database
            .SqlQueryRaw<Guid>(@"
                SELECT c.Id AS Value
                FROM Coaches c
                INNER JOIN Users u ON c.UserId = u.Id
                WHERE u.AuthId = {0}
            ", command.UserId)
            .FirstOrDefaultAsync(cancellationToken);

        if (currentCoachId == Guid.Empty)
        {
            throw new NotFoundException("Coach", "Current user is not a coach");
        }

        if (drillCheck.CreatedBy != currentCoachId)
        {
            throw new UnauthorizedAccessException("Only the creating coach can archive this drill");
        }

        var rowsAffected = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE Drills
            SET IsArchived = {command.Dto.IsArchived}
            WHERE Id = {drillId}
        ", cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException("Drill", drillId.ToString());
        }
    }
}

internal class ArchiveDrillCheckRaw
{
    public Guid Id { get; set; }
    public Guid? CreatedBy { get; set; }
}

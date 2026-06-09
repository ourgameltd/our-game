using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Drills.Commands.ArchiveDrill;

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

        var exists = await _db.Database
            .SqlQueryRaw<int>(@"
                SELECT 1 AS Value
                FROM Drills
                WHERE Id = {0}
            ", drillId)
            .FirstOrDefaultAsync(cancellationToken);

        if (exists == 0)
        {
            throw new NotFoundException("Drill", drillId.ToString());
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

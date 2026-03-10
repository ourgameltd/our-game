using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.AgeGroups.Commands.ArchiveAgeGroup;

/// <summary>
/// Handler for archiving or unarchiving an age group.
/// </summary>
public class ArchiveAgeGroupHandler : IRequestHandler<ArchiveAgeGroupCommand>
{
    private readonly OurGameContext _db;

    public ArchiveAgeGroupHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task Handle(ArchiveAgeGroupCommand command, CancellationToken cancellationToken)
    {
        var ageGroupId = command.AgeGroupId;
        var isArchived = command.Dto.IsArchived;

        // Check if age group exists
        var exists = await _db.Database
            .SqlQueryRaw<int>(
                "SELECT COUNT(1) FROM AgeGroups WHERE Id = {0}", ageGroupId)
            .FirstOrDefaultAsync(cancellationToken);

        if (exists == 0)
        {
            throw new NotFoundException("AgeGroup", ageGroupId.ToString());
        }

        var now = DateTime.UtcNow;

        // Update the archive status
        var rowsAffected = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE AgeGroups
            SET 
                IsArchived = {isArchived},
                UpdatedAt = {now}
            WHERE Id = {ageGroupId}
        ", cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException("AgeGroup", ageGroupId.ToString());
        }
    }
}

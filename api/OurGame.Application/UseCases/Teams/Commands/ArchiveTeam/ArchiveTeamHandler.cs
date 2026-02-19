using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Commands.ArchiveTeam;

/// <summary>
/// Handler for archiving or unarchiving a team.
/// </summary>
public class ArchiveTeamHandler : IRequestHandler<ArchiveTeamCommand>
{
    private readonly OurGameContext _db;

    public ArchiveTeamHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task Handle(ArchiveTeamCommand command, CancellationToken cancellationToken)
    {
        var teamId = command.TeamId;
        var isArchived = command.Dto.IsArchived;

        // Check if team exists
        var exists = await _db.Database
            .SqlQueryRaw<int>(
                "SELECT COUNT(1) FROM Teams WHERE Id = {0}", teamId)
            .FirstOrDefaultAsync(cancellationToken);

        if (exists == 0)
        {
            throw new NotFoundException("Team", teamId.ToString());
        }

        var now = DateTime.UtcNow;

        // Update the archive status
        var rowsAffected = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE Teams
            SET 
                IsArchived = {isArchived},
                UpdatedAt = {now}
            WHERE Id = {teamId}
        ", cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException("Team", teamId.ToString());
        }
    }
}

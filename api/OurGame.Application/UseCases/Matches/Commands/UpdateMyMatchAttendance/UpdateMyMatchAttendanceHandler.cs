using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Matches.Commands.UpdateMyMatchAttendance;

public class UpdateMyMatchAttendanceHandler : IRequestHandler<UpdateMyMatchAttendanceCommand>
{
    private readonly OurGameContext _db;

    public UpdateMyMatchAttendanceHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task Handle(UpdateMyMatchAttendanceCommand command, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.AuthId == command.AuthId, cancellationToken);

        if (user == null)
            throw new NotFoundException("User", command.AuthId);

        if (command.PlayerId.HasValue)
        {
            // Parent responding on behalf of a child — validate the parent-child link
            var isLinked = await _db.EmergencyContacts
                .AnyAsync(ec => ec.UserId == user.Id && ec.PlayerId == command.PlayerId.Value, cancellationToken);

            if (!isLinked)
                throw new ForbiddenException("You are not authorised to update attendance for this player.");

            await UpdatePlayerAttendanceAsync(command.MatchId, command.PlayerId.Value, command.Status, cancellationToken);
            return;
        }

        // Check if user is linked to a player
        var player = await _db.Players
            .FirstOrDefaultAsync(p => p.UserId == user.Id, cancellationToken);

        if (player != null)
        {
            await UpdatePlayerAttendanceAsync(command.MatchId, player.Id, command.Status, cancellationToken);
            return;
        }

        // Check if user is linked to a coach
        var coach = await _db.Coaches
            .FirstOrDefaultAsync(c => c.UserId == user.Id, cancellationToken);

        if (coach != null)
        {
            await UpdateCoachAttendanceAsync(command.MatchId, coach.Id, command.Status, cancellationToken);
            return;
        }

        throw new ForbiddenException("No attendance record found for your account on this match.");
    }

    private async Task UpdatePlayerAttendanceAsync(Guid matchId, Guid playerId, string status, CancellationToken cancellationToken)
    {
        var rows = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE MatchAttendances
            SET Status = {status}, UpdatedAt = {DateTime.UtcNow}
            WHERE MatchId = {matchId} AND PlayerId = {playerId}
        ", cancellationToken);

        if (rows == 0)
            throw new NotFoundException("MatchAttendance", $"{matchId}/{playerId}");
    }

    private async Task UpdateCoachAttendanceAsync(Guid matchId, Guid coachId, string status, CancellationToken cancellationToken)
    {
        var rows = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE MatchCoaches
            SET Status = {status}
            WHERE MatchId = {matchId} AND CoachId = {coachId}
        ", cancellationToken);

        if (rows == 0)
            throw new NotFoundException("MatchCoach", $"{matchId}/{coachId}");
    }
}

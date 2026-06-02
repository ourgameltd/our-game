using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.TrainingSessions.Commands.UpdateMySessionAttendance;

public class UpdateMySessionAttendanceHandler : IRequestHandler<UpdateMySessionAttendanceCommand>
{
    private readonly OurGameContext _db;

    public UpdateMySessionAttendanceHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task Handle(UpdateMySessionAttendanceCommand command, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.AuthId == command.AuthId, cancellationToken);

        if (user == null)
            throw new NotFoundException("User", command.AuthId);

        if (command.PlayerId.HasValue)
        {
            var isLinked = await _db.EmergencyContacts
                .AnyAsync(ec => ec.UserId == user.Id && ec.PlayerId == command.PlayerId.Value, cancellationToken);

            if (!isLinked)
                throw new ForbiddenException("You are not authorised to update attendance for this player.");

            await UpdatePlayerAttendanceAsync(command.SessionId, command.PlayerId.Value, command.Status, cancellationToken);
            return;
        }

        var player = await _db.Players
            .FirstOrDefaultAsync(p => p.UserId == user.Id, cancellationToken);

        if (player != null)
        {
            await UpdatePlayerAttendanceAsync(command.SessionId, player.Id, command.Status, cancellationToken);
            return;
        }

        var coach = await _db.Coaches
            .FirstOrDefaultAsync(c => c.UserId == user.Id, cancellationToken);

        if (coach != null)
        {
            await UpdateCoachAttendanceAsync(command.SessionId, coach.Id, command.Status, cancellationToken);
            return;
        }

        throw new ForbiddenException("No attendance record found for your account on this session.");
    }

    private async Task UpdatePlayerAttendanceAsync(Guid sessionId, Guid playerId, string status, CancellationToken cancellationToken)
    {
        // SessionAttendance stores Present as nullable bool
        bool? present = status switch
        {
            "confirmed" => true,
            "declined" => false,
            _ => null
        };

        var rows = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE SessionAttendances
            SET Present = {present}
            WHERE SessionId = {sessionId} AND PlayerId = {playerId}
        ", cancellationToken);

        if (rows == 0)
            throw new NotFoundException("SessionAttendance", $"{sessionId}/{playerId}");
    }

    private async Task UpdateCoachAttendanceAsync(Guid sessionId, Guid coachId, string status, CancellationToken cancellationToken)
    {
        var rows = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE SessionCoaches
            SET Status = {status}
            WHERE SessionId = {sessionId} AND CoachId = {coachId}
        ", cancellationToken);

        if (rows == 0)
            throw new NotFoundException("SessionCoach", $"{sessionId}/{coachId}");
    }
}

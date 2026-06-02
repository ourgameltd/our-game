using MediatR;

namespace OurGame.Application.UseCases.TrainingSessions.Commands.UpdateMySessionAttendance;

/// <summary>
/// Updates the current authenticated user's attendance status for a training session.
/// The handler resolves the correct attendance record based on the user's role
/// (player, coach, or parent responding on behalf of a child).
/// </summary>
public record UpdateMySessionAttendanceCommand(
    Guid SessionId,
    string AuthId,
    string Status,
    Guid? PlayerId = null) : IRequest;

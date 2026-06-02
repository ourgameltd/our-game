using MediatR;

namespace OurGame.Application.UseCases.Matches.Commands.UpdateMyMatchAttendance;

/// <summary>
/// Updates the current authenticated user's attendance status for a match.
/// The handler resolves the correct attendance record based on the user's role
/// (player, coach, or parent responding on behalf of a child).
/// </summary>
public record UpdateMyMatchAttendanceCommand(
    Guid MatchId,
    string AuthId,
    string Status,
    Guid? PlayerId = null) : IRequest;

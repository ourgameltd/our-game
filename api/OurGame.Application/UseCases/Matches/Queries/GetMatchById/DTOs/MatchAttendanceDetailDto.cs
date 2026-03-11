namespace OurGame.Application.UseCases.Matches.Queries.GetMatchById.DTOs;

/// <summary>
/// Match attendance detail DTO
/// </summary>
public record MatchAttendanceDetailDto
{
    public Guid Id { get; init; }
    public Guid PlayerId { get; init; }
    public string PlayerName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string? Notes { get; init; }
}

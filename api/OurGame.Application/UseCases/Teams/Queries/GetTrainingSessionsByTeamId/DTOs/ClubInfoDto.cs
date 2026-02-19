namespace OurGame.Application.UseCases.Teams.Queries.GetTrainingSessionsByTeamId.DTOs;

/// <summary>
/// DTO for club information
/// </summary>
public record ClubInfoDto
{
    /// <summary>
    /// Unique identifier of the club
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Name of the club
    /// </summary>
    public string Name { get; init; } = string.Empty;
}

namespace OurGame.Application.UseCases.Teams.Queries.GetMatchesByTeamId.DTOs;

/// <summary>
/// DTO containing club metadata
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

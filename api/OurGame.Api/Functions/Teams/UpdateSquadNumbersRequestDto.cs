using System.ComponentModel.DataAnnotations;

namespace OurGame.Api.Functions.Teams;

/// <summary>
/// Request DTO for updating squad numbers for multiple players in a team.
/// </summary>
public record UpdateSquadNumbersRequestDto
{
    /// <summary>
    /// List of player squad number assignments.
    /// </summary>
    [Required]
    public List<SquadNumberAssignmentDto> Assignments { get; init; } = new();
}

/// <summary>
/// Represents a single player squad number assignment.
/// </summary>
public record SquadNumberAssignmentDto
{
    /// <summary>
    /// The player ID.
    /// </summary>
    [Required]
    public Guid PlayerId { get; init; }

    /// <summary>
    /// The squad number (1-99), or null to remove assignment.
    /// </summary>
    [Range(1, 99)]
    public int? SquadNumber { get; init; }
}

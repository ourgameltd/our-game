namespace OurGame.Application.UseCases.Teams.Queries.GetKitsByTeamId.DTOs;

/// <summary>
/// DTO for team kit information
/// </summary>
public class TeamKitDto
{
    /// <summary>
    /// Unique identifier for the kit
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Kit name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Kit type (home, away, third, goalkeeper, training)
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Shirt color (hex format)
    /// </summary>
    public string ShirtColor { get; set; } = string.Empty;

    /// <summary>
    /// Shorts color (hex format)
    /// </summary>
    public string ShortsColor { get; set; } = string.Empty;

    /// <summary>
    /// Socks color (hex format)
    /// </summary>
    public string SocksColor { get; set; } = string.Empty;

    /// <summary>
    /// Season the kit is for (optional)
    /// </summary>
    public string? Season { get; set; }

    /// <summary>
    /// Indicates if the kit is currently active
    /// </summary>
    public bool IsActive { get; set; }
}

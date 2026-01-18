namespace OurGame.Application.UseCases.Players.DTOs;

/// <summary>
/// Player list item DTO for displaying players in lists
/// </summary>
public class PlayerListItemDto
{
    /// <summary>
    /// Player unique identifier
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Club unique identifier
    /// </summary>
    public Guid ClubId { get; set; }

    /// <summary>
    /// Player's first name
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Player's last name
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Player's date of birth
    /// </summary>
    public DateOnly? DateOfBirth { get; set; }

    /// <summary>
    /// Player's calculated age
    /// </summary>
    public int? Age { get; set; }

    /// <summary>
    /// URL to player's photo
    /// </summary>
    public string? Photo { get; set; }

    /// <summary>
    /// List of preferred positions (e.g., ["GK"], ["CB", "RB"])
    /// </summary>
    public List<string> PreferredPositions { get; set; } = new();

    /// <summary>
    /// List of age group names the player belongs to
    /// </summary>
    public List<string> AgeGroups { get; set; } = new();

    /// <summary>
    /// List of team names the player belongs to
    /// </summary>
    public List<string> Teams { get; set; } = new();

    /// <summary>
    /// Overall player rating (0-99)
    /// </summary>
    public int? OverallRating { get; set; }

    /// <summary>
    /// Whether the player is archived
    /// </summary>
    public bool IsArchived { get; set; }
}

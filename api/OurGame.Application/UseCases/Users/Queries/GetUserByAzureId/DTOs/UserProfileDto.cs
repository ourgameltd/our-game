namespace OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs;

/// <summary>
/// User profile information
/// </summary>
public class UserProfileDto
{
    public Guid Id { get; set; }
    public string AuthId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Photo { get; set; } = string.Empty;
    public string Preferences { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    /// <summary>
    /// Associated player ID if this user is a player
    /// </summary>
    public Guid? PlayerId { get; set; }
    
    /// <summary>
    /// Associated coach ID if this user is a coach
    /// </summary>
    public Guid? CoachId { get; set; }
}

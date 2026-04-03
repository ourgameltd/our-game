namespace OurGame.Application.UseCases.Clubs.Queries.GetClubSocialLinks.DTOs;

/// <summary>
/// DTO for club social media links.
/// </summary>
public class ClubSocialLinksDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public string? Website { get; set; }
    public string? Twitter { get; set; }
    public string? Instagram { get; set; }
    public string? Facebook { get; set; }
    public string? YouTube { get; set; }
    public string? TikTok { get; set; }
}

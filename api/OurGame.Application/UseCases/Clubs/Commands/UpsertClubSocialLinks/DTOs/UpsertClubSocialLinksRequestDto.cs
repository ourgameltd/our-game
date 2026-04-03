namespace OurGame.Application.UseCases.Clubs.Commands.UpsertClubSocialLinks.DTOs;

/// <summary>
/// Request DTO for upserting club social media links.
/// All fields are optional – only supplied values are stored.
/// </summary>
public record UpsertClubSocialLinksRequestDto
{
    public string? Website { get; init; }
    public string? Twitter { get; init; }
    public string? Instagram { get; init; }
    public string? Facebook { get; init; }
    public string? YouTube { get; init; }
    public string? TikTok { get; init; }
}

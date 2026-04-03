namespace OurGame.Application.UseCases.Clubs.Queries.GetPublicClubPostById.DTOs;

/// <summary>
/// DTO for a public club post, enriched with club metadata for OG tag rendering.
/// </summary>
public class PublicClubPostDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? ExternalUrl { get; set; }
    public string PostType { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public Guid? LinkedEntityId { get; set; }
    public string? LinkedEntityType { get; set; }
    public DateTime CreatedAt { get; set; }

    // Club metadata for OG tags
    public Guid ClubId { get; set; }
    public string ClubName { get; set; } = string.Empty;
    public string? ClubLogo { get; set; }
    public string? ClubPrimaryColor { get; set; }
}

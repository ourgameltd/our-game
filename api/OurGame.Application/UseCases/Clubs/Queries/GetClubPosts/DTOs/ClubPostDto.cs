namespace OurGame.Application.UseCases.Clubs.Queries.GetClubPosts.DTOs;

/// <summary>
/// DTO for a club post.
/// </summary>
public class ClubPostDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? ExternalUrl { get; set; }
    public string PostType { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public Guid? LinkedEntityId { get; set; }
    public string? LinkedEntityType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

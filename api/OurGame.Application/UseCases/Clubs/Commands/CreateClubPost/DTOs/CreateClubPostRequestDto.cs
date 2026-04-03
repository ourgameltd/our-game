using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Clubs.Commands.CreateClubPost.DTOs;

/// <summary>
/// Request DTO for creating a new club post.
/// </summary>
public record CreateClubPostRequestDto
{
    /// <summary>
    /// Post title (required).
    /// </summary>
    [Required]
    [StringLength(500)]
    public string Title { get; init; } = string.Empty;

    /// <summary>
    /// Optional description / body text.
    /// </summary>
    [StringLength(5000)]
    public string? Description { get; init; }

    /// <summary>
    /// Optional image URL for the post.
    /// </summary>
    [StringLength(2000)]
    public string? ImageUrl { get; init; }

    /// <summary>
    /// Optional external link associated with the post.
    /// </summary>
    [StringLength(2000)]
    public string? ExternalUrl { get; init; }

    /// <summary>
    /// Type of post: match_report, player_spotlight, upcoming_fixture, result, clip.
    /// </summary>
    [Required]
    [StringLength(50)]
    public string PostType { get; init; } = string.Empty;

    /// <summary>
    /// Whether this post is publicly shareable.
    /// </summary>
    public bool IsPublic { get; init; }

    /// <summary>
    /// Optional linked entity ID (e.g. a match or player ID).
    /// </summary>
    public Guid? LinkedEntityId { get; init; }

    /// <summary>
    /// Optional linked entity type (e.g. "match", "player").
    /// </summary>
    [StringLength(50)]
    public string? LinkedEntityType { get; init; }
}

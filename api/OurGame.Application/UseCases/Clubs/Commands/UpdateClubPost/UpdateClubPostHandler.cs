using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Clubs.Commands.UpdateClubPost.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetClubPosts.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Commands.UpdateClubPost;

/// <summary>
/// Command to update an existing club post.
/// </summary>
public record UpdateClubPostCommand(Guid ClubId, Guid PostId, UpdateClubPostRequestDto Dto) : IRequest<ClubPostDto>;

/// <summary>
/// Handler for UpdateClubPostCommand.
/// Validates the post belongs to the club, validates inputs, updates the row, and returns the updated post.
/// </summary>
public class UpdateClubPostHandler : IRequestHandler<UpdateClubPostCommand, ClubPostDto>
{
    private static readonly HashSet<string> ValidPostTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "match_report",
        "player_spotlight",
        "upcoming_fixture",
        "result",
        "clip"
    };

    private readonly OurGameContext _db;

    public UpdateClubPostHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<ClubPostDto> Handle(UpdateClubPostCommand command, CancellationToken cancellationToken)
    {
        var clubId = command.ClubId;
        var postId = command.PostId;
        var dto = command.Dto;

        // 1. Verify the post exists and belongs to this club
        var existing = await _db.Database
            .SqlQueryRaw<PostOwnerCheck>(
                "SELECT Id, ClubId FROM ClubPosts WHERE Id = {0}", postId)
            .FirstOrDefaultAsync(cancellationToken);

        if (existing == null || existing.ClubId != clubId)
        {
            throw new NotFoundException("ClubPost", postId.ToString());
        }

        // 2. Validate required fields
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(dto.Title))
            errors.Add("Title", new[] { "Title is required." });

        if (string.IsNullOrWhiteSpace(dto.PostType))
            errors.Add("PostType", new[] { "PostType is required." });
        else if (!ValidPostTypes.Contains(dto.PostType))
            errors.Add("PostType", new[] { $"Invalid post type: {dto.PostType}. Must be one of: match_report, player_spotlight, upcoming_fixture, result, clip." });

        if (errors.Count > 0)
        {
            throw new ValidationException(errors);
        }

        // 3. Execute the UPDATE
        var now = DateTime.UtcNow;

        var rowsAffected = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE ClubPosts
            SET
                Title            = {dto.Title},
                Description      = {dto.Description},
                ImageUrl         = {dto.ImageUrl},
                ExternalUrl      = {dto.ExternalUrl},
                PostType         = {dto.PostType},
                IsPublic         = {dto.IsPublic},
                LinkedEntityId   = {dto.LinkedEntityId},
                LinkedEntityType = {dto.LinkedEntityType},
                UpdatedAt        = {now}
            WHERE Id = {postId} AND ClubId = {clubId}
        ", cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException("ClubPost", postId.ToString());
        }

        // 4. Query back the updated post
        var post = await _db.Database
            .SqlQueryRaw<UpdatedPostRawDto>(@"
                SELECT
                    Id,
                    ClubId,
                    Title,
                    Description,
                    ImageUrl,
                    ExternalUrl,
                    PostType,
                    IsPublic,
                    LinkedEntityId,
                    LinkedEntityType,
                    CreatedAt,
                    UpdatedAt
                FROM ClubPosts
                WHERE Id = {0}
            ", postId)
            .FirstOrDefaultAsync(cancellationToken);

        if (post == null)
        {
            throw new Exception("Failed to retrieve updated club post.");
        }

        return new ClubPostDto
        {
            Id = post.Id,
            ClubId = post.ClubId,
            Title = post.Title ?? string.Empty,
            Description = post.Description,
            ImageUrl = post.ImageUrl,
            ExternalUrl = post.ExternalUrl,
            PostType = post.PostType ?? string.Empty,
            IsPublic = post.IsPublic,
            LinkedEntityId = post.LinkedEntityId,
            LinkedEntityType = post.LinkedEntityType,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt
        };
    }
}

internal class PostOwnerCheck
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
}

internal class UpdatedPostRawDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? ExternalUrl { get; set; }
    public string? PostType { get; set; }
    public bool IsPublic { get; set; }
    public Guid? LinkedEntityId { get; set; }
    public string? LinkedEntityType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

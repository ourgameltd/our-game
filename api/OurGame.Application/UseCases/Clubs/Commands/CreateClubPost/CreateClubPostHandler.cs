using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Clubs.Commands.CreateClubPost.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetClubPosts.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Commands.CreateClubPost;

/// <summary>
/// Command to create a new club post.
/// </summary>
public record CreateClubPostCommand(Guid ClubId, CreateClubPostRequestDto Dto) : IRequest<ClubPostDto>;

/// <summary>
/// Handler for CreateClubPostCommand.
/// Validates inputs, inserts a new ClubPost row, and returns the created post.
/// </summary>
public class CreateClubPostHandler : IRequestHandler<CreateClubPostCommand, ClubPostDto>
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

    public CreateClubPostHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<ClubPostDto> Handle(CreateClubPostCommand command, CancellationToken cancellationToken)
    {
        var clubId = command.ClubId;
        var dto = command.Dto;

        // 1. Verify the club exists
        var club = await _db.Database
            .SqlQueryRaw<ClubExistsCheck>("SELECT Id FROM Clubs WHERE Id = {0}", clubId)
            .FirstOrDefaultAsync(cancellationToken);

        if (club == null)
        {
            throw new NotFoundException("Club", clubId.ToString());
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

        // 3. Insert the new post
        var postId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO ClubPosts (Id, ClubId, Title, Description, ImageUrl, ExternalUrl, PostType, IsPublic, LinkedEntityId, LinkedEntityType, CreatedAt, UpdatedAt)
            VALUES ({postId}, {clubId}, {dto.Title}, {dto.Description}, {dto.ImageUrl}, {dto.ExternalUrl}, {dto.PostType}, {dto.IsPublic}, {dto.LinkedEntityId}, {dto.LinkedEntityType}, {now}, {now})
        ", cancellationToken);

        // 4. Query back the created post
        var post = await _db.Database
            .SqlQueryRaw<CreatedPostRawDto>(@"
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
            throw new Exception("Failed to retrieve created club post.");
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

internal class ClubExistsCheck
{
    public Guid Id { get; set; }
}

internal class CreatedPostRawDto
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

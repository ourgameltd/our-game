using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Clubs.Queries.GetClubPosts.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Queries.GetClubPosts;

/// <summary>
/// Query to get all posts for a club, ordered by most recent first.
/// </summary>
public record GetClubPostsQuery(Guid ClubId) : IQuery<List<ClubPostDto>>;

/// <summary>
/// Handler for GetClubPostsQuery.
/// </summary>
public class GetClubPostsHandler : IRequestHandler<GetClubPostsQuery, List<ClubPostDto>>
{
    private readonly OurGameContext _db;

    public GetClubPostsHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<ClubPostDto>> Handle(GetClubPostsQuery query, CancellationToken cancellationToken)
    {
        var rows = await _db.Database
            .SqlQueryRaw<ClubPostRawDto>(@"
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
                WHERE ClubId = {0}
                ORDER BY CreatedAt DESC
            ", query.ClubId)
            .ToListAsync(cancellationToken);

        return rows.Select(r => new ClubPostDto
        {
            Id = r.Id,
            ClubId = r.ClubId,
            Title = r.Title ?? string.Empty,
            Description = r.Description,
            ImageUrl = r.ImageUrl,
            ExternalUrl = r.ExternalUrl,
            PostType = r.PostType ?? string.Empty,
            IsPublic = r.IsPublic,
            LinkedEntityId = r.LinkedEntityId,
            LinkedEntityType = r.LinkedEntityType,
            CreatedAt = r.CreatedAt,
            UpdatedAt = r.UpdatedAt
        }).ToList();
    }
}

/// <summary>
/// Raw SQL projection for ClubPosts row.
/// </summary>
internal class ClubPostRawDto
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

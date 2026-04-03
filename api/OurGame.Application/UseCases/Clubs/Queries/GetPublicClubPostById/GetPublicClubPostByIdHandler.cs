using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Clubs.Queries.GetPublicClubPostById.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Queries.GetPublicClubPostById;

/// <summary>
/// Query to get a single public club post by ID, enriched with club metadata.
/// </summary>
public record GetPublicClubPostByIdQuery(Guid PostId) : IQuery<PublicClubPostDto?>;

/// <summary>
/// Handler for GetPublicClubPostByIdQuery.
/// Joins ClubPosts with Clubs and only returns posts where IsPublic = 1.
/// </summary>
public class GetPublicClubPostByIdHandler : IRequestHandler<GetPublicClubPostByIdQuery, PublicClubPostDto?>
{
    private readonly OurGameContext _db;

    public GetPublicClubPostByIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<PublicClubPostDto?> Handle(GetPublicClubPostByIdQuery query, CancellationToken cancellationToken)
    {
        var row = await _db.Database
            .SqlQueryRaw<PublicClubPostRawDto>(@"
                SELECT
                    p.Id,
                    p.Title,
                    p.Description,
                    p.ImageUrl,
                    p.ExternalUrl,
                    p.PostType,
                    p.IsPublic,
                    p.LinkedEntityId,
                    p.LinkedEntityType,
                    p.CreatedAt,
                    p.ClubId,
                    c.Name AS ClubName,
                    c.Logo AS ClubLogo,
                    c.PrimaryColor AS ClubPrimaryColor
                FROM ClubPosts p
                INNER JOIN Clubs c ON c.Id = p.ClubId
                WHERE p.Id = {0} AND p.IsPublic = 1
            ", query.PostId)
            .FirstOrDefaultAsync(cancellationToken);

        if (row == null)
        {
            return null;
        }

        return new PublicClubPostDto
        {
            Id = row.Id,
            Title = row.Title ?? string.Empty,
            Description = row.Description,
            ImageUrl = row.ImageUrl,
            ExternalUrl = row.ExternalUrl,
            PostType = row.PostType ?? string.Empty,
            IsPublic = row.IsPublic,
            LinkedEntityId = row.LinkedEntityId,
            LinkedEntityType = row.LinkedEntityType,
            CreatedAt = row.CreatedAt,
            ClubId = row.ClubId,
            ClubName = row.ClubName ?? string.Empty,
            ClubLogo = row.ClubLogo,
            ClubPrimaryColor = row.ClubPrimaryColor
        };
    }
}

/// <summary>
/// Raw SQL projection for public club post joined with club data.
/// </summary>
internal class PublicClubPostRawDto
{
    public Guid Id { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? ExternalUrl { get; set; }
    public string? PostType { get; set; }
    public bool IsPublic { get; set; }
    public Guid? LinkedEntityId { get; set; }
    public string? LinkedEntityType { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid ClubId { get; set; }
    public string? ClubName { get; set; }
    public string? ClubLogo { get; set; }
    public string? ClubPrimaryColor { get; set; }
}

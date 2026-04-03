using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Clubs.Queries.GetClubSocialLinks.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Queries.GetClubSocialLinks;

/// <summary>
/// Query to get social media links for a club.
/// </summary>
public record GetClubSocialLinksQuery(Guid ClubId) : IQuery<ClubSocialLinksDto?>;

/// <summary>
/// Handler for GetClubSocialLinksQuery.
/// Returns null if the club has not set up social links yet.
/// </summary>
public class GetClubSocialLinksHandler : IRequestHandler<GetClubSocialLinksQuery, ClubSocialLinksDto?>
{
    private readonly OurGameContext _db;

    public GetClubSocialLinksHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<ClubSocialLinksDto?> Handle(GetClubSocialLinksQuery query, CancellationToken cancellationToken)
    {
        var row = await _db.Database
            .SqlQueryRaw<ClubSocialLinksRawDto>(@"
                SELECT
                    Id,
                    ClubId,
                    Website,
                    Twitter,
                    Instagram,
                    Facebook,
                    YouTube,
                    TikTok
                FROM ClubSocialLinks
                WHERE ClubId = {0}
            ", query.ClubId)
            .FirstOrDefaultAsync(cancellationToken);

        if (row == null)
        {
            return null;
        }

        return new ClubSocialLinksDto
        {
            Id = row.Id,
            ClubId = row.ClubId,
            Website = row.Website,
            Twitter = row.Twitter,
            Instagram = row.Instagram,
            Facebook = row.Facebook,
            YouTube = row.YouTube,
            TikTok = row.TikTok
        };
    }
}

/// <summary>
/// Raw SQL projection for ClubSocialLinks row.
/// </summary>
internal class ClubSocialLinksRawDto
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

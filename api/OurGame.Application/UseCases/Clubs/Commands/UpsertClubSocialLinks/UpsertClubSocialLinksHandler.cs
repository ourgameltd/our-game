using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Clubs.Commands.UpsertClubSocialLinks.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetClubSocialLinks.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Commands.UpsertClubSocialLinks;

/// <summary>
/// Command to create or update a club's social media links.
/// </summary>
public record UpsertClubSocialLinksCommand(Guid ClubId, UpsertClubSocialLinksRequestDto Dto)
    : IRequest<ClubSocialLinksDto>;

/// <summary>
/// Handler for UpsertClubSocialLinksCommand.
/// Checks if a row already exists for the club – if so, updates it; otherwise inserts a new row.
/// </summary>
public class UpsertClubSocialLinksHandler : IRequestHandler<UpsertClubSocialLinksCommand, ClubSocialLinksDto>
{
    private readonly OurGameContext _db;

    public UpsertClubSocialLinksHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<ClubSocialLinksDto> Handle(UpsertClubSocialLinksCommand command, CancellationToken cancellationToken)
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

        // 2. Check if social links row already exists for this club
        var existing = await _db.Database
            .SqlQueryRaw<SocialLinksExistsCheck>(
                "SELECT Id FROM ClubSocialLinks WHERE ClubId = {0}", clubId)
            .FirstOrDefaultAsync(cancellationToken);

        var now = DateTime.UtcNow;

        if (existing != null)
        {
            // 3a. UPDATE existing row
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                UPDATE ClubSocialLinks
                SET
                    Website   = {dto.Website},
                    Twitter   = {dto.Twitter},
                    Instagram = {dto.Instagram},
                    Facebook  = {dto.Facebook},
                    YouTube   = {dto.YouTube},
                    TikTok    = {dto.TikTok},
                    UpdatedAt = {now}
                WHERE ClubId = {clubId}
            ", cancellationToken);
        }
        else
        {
            // 3b. INSERT new row
            var newId = Guid.NewGuid();

            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO ClubSocialLinks (Id, ClubId, Website, Twitter, Instagram, Facebook, YouTube, TikTok, CreatedAt, UpdatedAt)
                VALUES ({newId}, {clubId}, {dto.Website}, {dto.Twitter}, {dto.Instagram}, {dto.Facebook}, {dto.YouTube}, {dto.TikTok}, {now}, {now})
            ", cancellationToken);
        }

        // 4. Query back the saved row
        var saved = await _db.Database
            .SqlQueryRaw<SocialLinksRawDto>(@"
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
            ", clubId)
            .FirstOrDefaultAsync(cancellationToken);

        if (saved == null)
        {
            throw new Exception("Failed to retrieve upserted social links.");
        }

        return new ClubSocialLinksDto
        {
            Id = saved.Id,
            ClubId = saved.ClubId,
            Website = saved.Website,
            Twitter = saved.Twitter,
            Instagram = saved.Instagram,
            Facebook = saved.Facebook,
            YouTube = saved.YouTube,
            TikTok = saved.TikTok
        };
    }
}

internal class ClubExistsCheck
{
    public Guid Id { get; set; }
}

internal class SocialLinksExistsCheck
{
    public Guid Id { get; set; }
}

internal class SocialLinksRawDto
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

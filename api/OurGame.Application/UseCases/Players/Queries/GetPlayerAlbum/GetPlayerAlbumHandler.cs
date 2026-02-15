using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAlbum.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Queries.GetPlayerAlbum;

/// <summary>
/// Query to get player album with all photos
/// </summary>
public record GetPlayerAlbumQuery(Guid PlayerId) : IQuery<GetPlayerAlbumDto?>;

/// <summary>
/// Handler for GetPlayerAlbumQuery.
/// Returns player name and all album photos with metadata.
/// </summary>
public class GetPlayerAlbumHandler : IRequestHandler<GetPlayerAlbumQuery, GetPlayerAlbumDto?>
{
    private readonly OurGameContext _db;

    public GetPlayerAlbumHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<GetPlayerAlbumDto?> Handle(GetPlayerAlbumQuery query, CancellationToken cancellationToken)
    {
        // 1. Fetch player existence and name
        var playerSql = @"
            SELECT 
                p.Id,
                p.FirstName,
                p.LastName
            FROM Players p
            WHERE p.Id = {0}";

        var player = await _db.Database
            .SqlQueryRaw<PlayerRawDto>(playerSql, query.PlayerId)
            .FirstOrDefaultAsync(cancellationToken);

        if (player == null)
        {
            return null;
        }

        // 2. Fetch player images
        var imagesSql = @"
            SELECT 
                pi.Id,
                pi.Url,
                pi.Caption,
                pi.PhotoDate,
                pi.CreatedAt,
                pi.Tags
            FROM PlayerImages pi
            WHERE pi.PlayerId = {0}
            ORDER BY COALESCE(pi.PhotoDate, pi.CreatedAt) DESC, pi.CreatedAt DESC";

        var images = await _db.Database
            .SqlQueryRaw<PlayerImageRawDto>(imagesSql, query.PlayerId)
            .ToListAsync(cancellationToken);

        // 3. Map images to DTOs, filtering out null/empty URLs
        var photos = images
            .Where(img => !string.IsNullOrWhiteSpace(img.Url))
            .Select(img => new PlayerAlbumPhotoDto
            {
                Id = img.Id,
                Url = img.Url!,
                Thumbnail = img.Url!, // Same as Url for now
                Caption = img.Caption,
                Date = FormatDate(img.PhotoDate ?? img.CreatedAt),
                Tags = ParseTags(img.Tags)
            })
            .ToArray();

        // 4. Build player name
        var playerName = BuildPlayerName(player.FirstName, player.LastName);

        return new GetPlayerAlbumDto
        {
            PlayerId = player.Id,
            PlayerName = playerName,
            Photos = photos
        };
    }

    private static string BuildPlayerName(string? firstName, string? lastName)
    {
        var parts = new[] { firstName, lastName }
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .ToArray();

        return parts.Length > 0 ? string.Join(" ", parts) : "Unknown Player";
    }

    private static string FormatDate(DateTime dateTime)
    {
        return dateTime.ToString("yyyy-MM-dd");
    }

    private static string[] ParseTags(string? tags)
    {
        if (string.IsNullOrWhiteSpace(tags))
            return Array.Empty<string>();

        return tags
            .Split(new[] { ',', ';', '|' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(t => t.Trim())
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .ToArray();
    }
}

/// <summary>
/// Raw SQL result for player data
/// </summary>
internal class PlayerRawDto
{
    public Guid Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

/// <summary>
/// Raw SQL result for player images
/// </summary>
internal class PlayerImageRawDto
{
    public Guid Id { get; set; }
    public string? Url { get; set; }
    public string? Caption { get; set; }
    public DateTime? PhotoDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Tags { get; set; }
}

using System.Text.Json;
using System.Text.RegularExpressions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Application.UseCases.Clubs.Commands.UpdateClubById.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetClubById;
using OurGame.Application.UseCases.Clubs.Queries.GetClubById.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Commands.UpdateClubById;

/// <summary>
/// Handler for updating an existing club's details.
/// Validates inputs, executes the UPDATE, and returns the updated club.
/// </summary>
public class UpdateClubHandler : IRequestHandler<UpdateClubCommand, ClubDetailDto>
{
    private static readonly Regex HexColorRegex = new(@"^#([0-9a-fA-F]{6})$", RegexOptions.Compiled);

    private readonly OurGameContext _db;
    private readonly IBlobStorageService _blobStorage;

    public UpdateClubHandler(OurGameContext db, IBlobStorageService blobStorage)
    {
        _db = db;
        _blobStorage = blobStorage;
    }

    public async Task<ClubDetailDto> Handle(UpdateClubCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var clubId = command.ClubId;

        // 1. Verify the club exists
        var existing = await _db.Database
            .SqlQueryRaw<ClubExistsResult>(
                "SELECT Id FROM Clubs WHERE Id = {0}", clubId)
            .FirstOrDefaultAsync(cancellationToken);

        if (existing == null)
        {
            throw new NotFoundException("Club", clubId.ToString());
        }

        // 2. Validate required fields
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(dto.Name))
            errors.Add("Name", new[] { "Name is required." });

        if (string.IsNullOrWhiteSpace(dto.ShortName))
            errors.Add("ShortName", new[] { "Short name is required." });

        if (string.IsNullOrWhiteSpace(dto.City))
            errors.Add("City", new[] { "City is required." });

        if (string.IsNullOrWhiteSpace(dto.Country))
            errors.Add("Country", new[] { "Country is required." });

        if (string.IsNullOrWhiteSpace(dto.Venue))
            errors.Add("Venue", new[] { "Venue is required." });

        // 3. Validate founded year range
        var currentYear = DateTime.UtcNow.Year;
        if (dto.Founded.HasValue && (dto.Founded.Value < 1850 || dto.Founded.Value > currentYear))
        {
            errors.Add("Founded", new[] { $"Founded year must be between 1850 and {currentYear}." });
        }

        // 4. Validate color formats
        if (!string.IsNullOrEmpty(dto.PrimaryColor) && !HexColorRegex.IsMatch(dto.PrimaryColor))
            errors.Add("PrimaryColor", new[] { "Primary color must be a valid hex color (e.g. #FF0000)." });

        if (!string.IsNullOrEmpty(dto.SecondaryColor) && !HexColorRegex.IsMatch(dto.SecondaryColor))
            errors.Add("SecondaryColor", new[] { "Secondary color must be a valid hex color (e.g. #FFFFFF)." });

        if (!string.IsNullOrEmpty(dto.AccentColor) && !HexColorRegex.IsMatch(dto.AccentColor))
            errors.Add("AccentColor", new[] { "Accent color must be a valid hex color (e.g. #CCCCCC)." });

        if (dto.MediaLinks is not null)
        {
            for (var i = 0; i < dto.MediaLinks.Count; i++)
            {
                var link = dto.MediaLinks[i];
                if (string.IsNullOrWhiteSpace(link.Url))
                {
                    errors[$"MediaLinks[{i}].Url"] = new[] { "URL is required." };
                    continue;
                }

                if (!Uri.TryCreate(link.Url, UriKind.Absolute, out var parsedUri)
                    || (parsedUri.Scheme != Uri.UriSchemeHttp && parsedUri.Scheme != Uri.UriSchemeHttps))
                {
                    errors[$"MediaLinks[{i}].Url"] = new[] { "URL must be an absolute http/https URL." };
                }
            }
        }

        if (errors.Count > 0)
        {
            throw new ValidationException(errors);
        }

        // 5. Serialize principles array to JSON for database storage
        string? principlesJson = dto.Principles is { Length: > 0 }
            ? JsonSerializer.Serialize(dto.Principles)
            : null;

        var now = DateTime.UtcNow;
        var address = dto.Address ?? string.Empty;
        var logo = await _blobStorage.UploadImageAsync(dto.Logo, "club-logos", clubId.ToString(), cancellationToken);

        // 6. Execute the UPDATE
        var rowsAffected = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE Clubs
            SET
                Name           = {dto.Name},
                ShortName      = {dto.ShortName},
                Logo           = {logo},
                PrimaryColor   = {dto.PrimaryColor},
                SecondaryColor = {dto.SecondaryColor},
                AccentColor    = {dto.AccentColor},
                City           = {dto.City},
                Country        = {dto.Country},
                Venue          = {dto.Venue},
                Address        = {address},
                FoundedYear    = {dto.Founded},
                History        = {dto.History},
                Ethos          = {dto.Ethos},
                Principles     = {principlesJson},
                UpdatedAt      = {now}
            WHERE Id = {clubId}
        ", cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException("Club", clubId.ToString());
        }

        // 6b. Replace media links for this club
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM ClubMediaLinks
            WHERE ClubId = {clubId}
        ", cancellationToken);

        var mediaLinks = dto.MediaLinks ?? new List<UpdateClubMediaLinkDto>();
        var mediaEntities = new List<ClubMediaLink>(mediaLinks.Count);
        for (var i = 0; i < mediaLinks.Count; i++)
        {
            var link = mediaLinks[i];
            var normalizedType = NormalizeMediaType(link.Type);
            mediaEntities.Add(new ClubMediaLink
            {
                Id = Guid.NewGuid(),
                ClubId = clubId,
                Url = link.Url,
                Title = link.Title,
                Type = normalizedType,
                IsPublic = link.IsPublic,
                DisplayOrder = i,
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        if (mediaEntities.Count > 0)
        {
            await _db.ClubMediaLinks.AddRangeAsync(mediaEntities, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);
        }

        // 7. Query back the updated club
        var club = await _db.Database
            .SqlQueryRaw<UpdatedClubRawDto>(@"
                SELECT 
                    c.Id,
                    c.Name,
                    c.ShortName,
                    c.Logo,
                    c.PrimaryColor,
                    c.SecondaryColor,
                    c.AccentColor,
                    c.City,
                    c.Country,
                    c.Venue,
                    c.Address,
                    c.FoundedYear,
                    c.History,
                    c.Ethos,
                    c.Principles
                FROM Clubs c
                WHERE c.Id = {0}
            ", clubId)
            .FirstOrDefaultAsync(cancellationToken);

        if (club == null)
        {
            throw new Exception("Failed to retrieve updated club.");
        }

        // 8. Map to ClubDetailDto
        var mediaLinksResult = await _db.Database
            .SqlQueryRaw<UpdatedClubMediaLinkRawDto>(@"
                SELECT Id, Url, Title, Type, IsPublic, DisplayOrder
                FROM ClubMediaLinks
                WHERE ClubId = {0}
                ORDER BY DisplayOrder, CreatedAt
            ", clubId)
            .ToListAsync(cancellationToken);

        return new ClubDetailDto
        {
            Id = club.Id,
            Name = club.Name ?? string.Empty,
            ShortName = club.ShortName ?? string.Empty,
            Logo = club.Logo,
            Colors = new ClubColorsDto
            {
                Primary = club.PrimaryColor ?? "#000000",
                Secondary = club.SecondaryColor ?? "#FFFFFF",
                Accent = club.AccentColor ?? "#CCCCCC"
            },
            Location = new ClubLocationDto
            {
                City = club.City ?? string.Empty,
                Country = club.Country ?? string.Empty,
                Venue = club.Venue ?? string.Empty,
                Address = club.Address ?? string.Empty
            },
            Founded = club.FoundedYear,
            History = club.History,
            Ethos = club.Ethos,
            Principles = ParsePrinciples(club.Principles),
            MediaLinks = mediaLinksResult.Select(link => new ClubMediaLinkDto
            {
                Id = link.Id,
                Url = link.Url ?? string.Empty,
                Title = link.Title,
                Type = string.IsNullOrWhiteSpace(link.Type) ? "other" : link.Type,
                IsPublic = link.IsPublic
            }).ToList()
        };
    }

    private static string NormalizeMediaType(string? type)
    {
        var normalized = (type ?? "other").Trim().ToLowerInvariant();

        return normalized switch
        {
            "youtube" => "youtube",
            "instagram" => "instagram",
            "tiktok" => "tiktok",
            "website" => "website",
            "facebook" => "facebook",
            "x" => "x",
            "twitter" => "twitter",
            "sponsor" => "sponsor",
            "match-report" => "match-report",
            "result" => "result",
            "fixture" => "fixture",
            "clip" => "clip",
            _ => "other"
        };
    }

    /// <summary>
    /// Parse principles from JSON array string or delimited string.
    /// </summary>
    private static List<string> ParsePrinciples(string? principles)
    {
        if (string.IsNullOrWhiteSpace(principles))
        {
            return new List<string>();
        }

        if (principles.TrimStart().StartsWith("["))
        {
            try
            {
                var parsed = JsonSerializer.Deserialize<List<string>>(principles);
                return parsed ?? new List<string>();
            }
            catch (JsonException)
            {
                // Fall through to delimiter parsing
            }
        }

        return principles.Split(new[] { '\n', '|' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(p => p.Trim())
            .Where(p => !string.IsNullOrWhiteSpace(p))
            .ToList();
    }
}

/// <summary>
/// Raw SQL projection for checking club existence.
/// </summary>
internal class ClubExistsResult
{
    public Guid Id { get; set; }
}

/// <summary>
/// Raw SQL query result model for the updated club data.
/// </summary>
internal class UpdatedClubRawDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? ShortName { get; set; }
    public string? Logo { get; set; }
    public string? PrimaryColor { get; set; }
    public string? SecondaryColor { get; set; }
    public string? AccentColor { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? Venue { get; set; }
    public string? Address { get; set; }
    public int? FoundedYear { get; set; }
    public string? History { get; set; }
    public string? Ethos { get; set; }
    public string? Principles { get; set; }
}

internal class UpdatedClubMediaLinkRawDto
{
    public Guid Id { get; set; }
    public string? Url { get; set; }
    public string? Title { get; set; }
    public string? Type { get; set; }
    public bool IsPublic { get; set; }
    public int DisplayOrder { get; set; }
}

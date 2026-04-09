using System.Text.Json;
using System.Text.RegularExpressions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Application.UseCases.Clubs.Queries.GetClubById.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Commands.CreateClub;

public class CreateClubHandler : IRequestHandler<CreateClubCommand, ClubDetailDto>
{
    private static readonly Regex HexColorRegex = new(@"^#([0-9a-fA-F]{6})$", RegexOptions.Compiled);
    private readonly OurGameContext _db;
    private readonly IBlobStorageService _blobStorage;

    public CreateClubHandler(OurGameContext db, IBlobStorageService blobStorage)
    {
        _db = db;
        _blobStorage = blobStorage;
    }

    public async Task<ClubDetailDto> Handle(CreateClubCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;

        // 1. Validate required fields
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

        // 2. Validate founded year
        var currentYear = DateTime.UtcNow.Year;
        if (dto.Founded.HasValue && (dto.Founded.Value < 1850 || dto.Founded.Value > currentYear))
            errors.Add("Founded", new[] { $"Founded year must be between 1850 and {currentYear}." });

        // 3. Validate color formats
        if (!string.IsNullOrEmpty(dto.PrimaryColor) && !HexColorRegex.IsMatch(dto.PrimaryColor))
            errors.Add("PrimaryColor", new[] { "Primary color must be a valid hex color (e.g. #FF0000)." });
        if (!string.IsNullOrEmpty(dto.SecondaryColor) && !HexColorRegex.IsMatch(dto.SecondaryColor))
            errors.Add("SecondaryColor", new[] { "Secondary color must be a valid hex color (e.g. #FFFFFF)." });
        if (!string.IsNullOrEmpty(dto.AccentColor) && !HexColorRegex.IsMatch(dto.AccentColor))
            errors.Add("AccentColor", new[] { "Accent color must be a valid hex color (e.g. #000000)." });

        if (errors.Count > 0)
            throw new ValidationException(errors);

        // 4. Serialize principles
        string? principlesJson = dto.Principles is { Length: > 0 }
            ? JsonSerializer.Serialize(dto.Principles)
            : null;

        // 5. Insert via raw SQL
        var newId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var logo = await _blobStorage.UploadImageAsync(dto.Logo, "club-logos", newId.ToString(), cancellationToken);
        var primaryColor = dto.PrimaryColor ?? "#000000";
        var secondaryColor = dto.SecondaryColor ?? "#FFFFFF";
        var accentColor = dto.AccentColor ?? "#CCCCCC";
        var address = dto.Address ?? string.Empty;
        var history = dto.History ?? string.Empty;
        var ethos = dto.Ethos ?? string.Empty;

        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO Clubs (Id, Name, ShortName, Logo, PrimaryColor, SecondaryColor, AccentColor,
                               City, Country, Venue, Address, FoundedYear, History, Ethos, Principles,
                               IsArchived, CreatedAt, UpdatedAt)
            VALUES ({newId}, {dto.Name}, {dto.ShortName}, {logo}, {primaryColor}, {secondaryColor}, {accentColor},
                    {dto.City}, {dto.Country}, {dto.Venue}, {address}, {dto.Founded}, {history}, {ethos},
                    {principlesJson}, {false}, {now}, {now})
        ", cancellationToken);

        // 6. Query back the created club
        var club = await _db.Database
            .SqlQueryRaw<CreatedClubRawDto>(@"
                SELECT Id, Name, ShortName, Logo, PrimaryColor, SecondaryColor, AccentColor,
                       City, Country, Venue, Address, FoundedYear, History, Ethos, Principles
                FROM Clubs
                WHERE Id = {0}
            ", newId)
            .FirstOrDefaultAsync(cancellationToken);

        if (club == null)
            throw new Exception("Failed to retrieve created club.");

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
            MediaLinks = new List<ClubMediaLinkDto>()
        };
    }

    private static List<string> ParsePrinciples(string? principles)
    {
        if (string.IsNullOrWhiteSpace(principles))
            return new List<string>();

        if (principles.TrimStart().StartsWith("["))
        {
            try
            {
                var parsed = JsonSerializer.Deserialize<List<string>>(principles);
                return parsed ?? new List<string>();
            }
            catch (JsonException) { }
        }

        return principles.Split(new[] { '\n', '|' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(p => p.Trim())
            .Where(p => !string.IsNullOrWhiteSpace(p))
            .ToList();
    }
}

internal class CreatedClubRawDto
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

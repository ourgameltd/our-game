using System.Text.RegularExpressions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Clubs.Queries.GetKitsByClubId.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Commands.CreateClubKit;

/// <summary>
/// Handler for creating a new club kit.
/// Validates club exists and inserts a club-level kit only.
/// </summary>
public class CreateClubKitHandler : IRequestHandler<CreateClubKitCommand, ClubKitDto>
{
    private static readonly Regex HexColorRegex = new(@"^#([0-9a-fA-F]{6})$", RegexOptions.Compiled);

    private readonly OurGameContext _db;

    public CreateClubKitHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<ClubKitDto> Handle(CreateClubKitCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var clubId = command.ClubId;

        var club = await _db.Database
            .SqlQueryRaw<ClubLookupResult>(
                "SELECT Id FROM Clubs WHERE Id = {0} AND IsArchived = 0", clubId)
            .FirstOrDefaultAsync(cancellationToken);

        if (club == null)
        {
            throw new NotFoundException("Club", clubId.ToString());
        }

        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(dto.Name))
            errors.Add("Name", new[] { "Name is required." });

        if (string.IsNullOrWhiteSpace(dto.Type))
            errors.Add("Type", new[] { "Type is required." });

        if (string.IsNullOrWhiteSpace(dto.ShirtColor))
            errors.Add("ShirtColor", new[] { "Shirt color is required." });

        if (string.IsNullOrWhiteSpace(dto.ShortsColor))
            errors.Add("ShortsColor", new[] { "Shorts color is required." });

        if (string.IsNullOrWhiteSpace(dto.SocksColor))
            errors.Add("SocksColor", new[] { "Socks color is required." });

        if (!string.IsNullOrEmpty(dto.ShirtColor) && !HexColorRegex.IsMatch(dto.ShirtColor))
            errors.Add("ShirtColor", new[] { "Shirt color must be a valid hex color (e.g. #FF0000)." });

        if (!string.IsNullOrEmpty(dto.ShortsColor) && !HexColorRegex.IsMatch(dto.ShortsColor))
            errors.Add("ShortsColor", new[] { "Shorts color must be a valid hex color (e.g. #FFFFFF)." });

        if (!string.IsNullOrEmpty(dto.SocksColor) && !HexColorRegex.IsMatch(dto.SocksColor))
            errors.Add("SocksColor", new[] { "Socks color must be a valid hex color (e.g. #000000)." });

        var kitType = ParseKitType(dto.Type);
        if (kitType == null)
        {
            errors.Add("Type", new[] { $"Invalid kit type: {dto.Type}. Must be one of: home, away, third, goalkeeper, training." });
        }

        if (errors.Count > 0)
        {
            throw new ValidationException(errors);
        }

        var kitId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var season = dto.Season ?? string.Empty;
        Guid? teamId = null;

        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO Kits (Id, ClubId, TeamId, Name, Type, ShirtColor, ShortsColor, SocksColor, Season, IsActive, CreatedAt)
            VALUES ({kitId}, {clubId}, {teamId}, {dto.Name}, {(int)kitType!.Value},
                    {dto.ShirtColor}, {dto.ShortsColor}, {dto.SocksColor}, {season}, {dto.IsActive}, {now})
        ", cancellationToken);

        var kit = await _db.Database
            .SqlQueryRaw<KitRawDto>(@"
                SELECT
                    k.Id,
                    k.Name,
                    k.Type,
                    k.ShirtColor,
                    k.ShortsColor,
                    k.SocksColor,
                    k.Season,
                    k.IsActive
                FROM Kits k
                WHERE k.Id = {0} AND k.ClubId = {1} AND k.TeamId IS NULL
            ", kitId, clubId)
            .FirstOrDefaultAsync(cancellationToken);

        if (kit == null)
        {
            throw new Exception("Failed to retrieve created kit.");
        }

        return new ClubKitDto
        {
            Id = kit.Id,
            Name = kit.Name ?? string.Empty,
            Type = MapKitTypeToString(kit.Type),
            ShirtColor = kit.ShirtColor ?? string.Empty,
            ShortsColor = kit.ShortsColor ?? string.Empty,
            SocksColor = kit.SocksColor ?? string.Empty,
            Season = kit.Season,
            IsActive = kit.IsActive
        };
    }

    private static KitType? ParseKitType(string type)
    {
        return type.ToLowerInvariant() switch
        {
            "home" => KitType.Home,
            "away" => KitType.Away,
            "third" => KitType.Third,
            "goalkeeper" => KitType.Goalkeeper,
            "training" => KitType.Training,
            _ => null
        };
    }

    private static string MapKitTypeToString(int type)
    {
        return ((KitType)type).ToString().ToLowerInvariant();
    }
}

internal class ClubLookupResult
{
    public Guid Id { get; set; }
}

internal class KitRawDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public int Type { get; set; }
    public string? ShirtColor { get; set; }
    public string? ShortsColor { get; set; }
    public string? SocksColor { get; set; }
    public string? Season { get; set; }
    public bool IsActive { get; set; }
}
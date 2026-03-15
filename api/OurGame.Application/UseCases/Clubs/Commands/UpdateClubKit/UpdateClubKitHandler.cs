using System.Text.RegularExpressions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Clubs.Queries.GetKitsByClubId.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Commands.UpdateClubKit;

/// <summary>
/// Handler for updating an existing club kit.
/// Validates the kit belongs to the specified club and is not a team kit.
/// </summary>
public class UpdateClubKitHandler : IRequestHandler<UpdateClubKitCommand, ClubKitDto>
{
    private static readonly Regex HexColorRegex = new(@"^#([0-9a-fA-F]{6})$", RegexOptions.Compiled);

    private readonly OurGameContext _db;

    public UpdateClubKitHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<ClubKitDto> Handle(UpdateClubKitCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var clubId = command.ClubId;
        var kitId = command.KitId;

        var kitCheck = await _db.Database
            .SqlQueryRaw<KitCheckResult>(
                "SELECT Id, ClubId, TeamId FROM Kits WHERE Id = {0}", kitId)
            .FirstOrDefaultAsync(cancellationToken);

        if (kitCheck == null)
        {
            throw new NotFoundException("Kit", kitId.ToString());
        }

        if (kitCheck.ClubId != clubId || kitCheck.TeamId != null)
        {
            throw new NotFoundException("Kit", kitId.ToString());
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

        var season = dto.Season ?? string.Empty;

        var rowsAffected = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE Kits
            SET
                Name = {dto.Name},
                Type = {(int)kitType!.Value},
                ShirtColor = {dto.ShirtColor},
                ShortsColor = {dto.ShortsColor},
                SocksColor = {dto.SocksColor},
                Season = {season},
                IsActive = {dto.IsActive}
            WHERE Id = {kitId} AND ClubId = {clubId} AND TeamId IS NULL
        ", cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException("Kit", kitId.ToString());
        }

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
            throw new Exception("Failed to retrieve updated kit.");
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

internal class KitCheckResult
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public Guid? TeamId { get; set; }
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
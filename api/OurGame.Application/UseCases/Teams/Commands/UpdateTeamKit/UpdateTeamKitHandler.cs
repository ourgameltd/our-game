using System.Text.RegularExpressions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Teams.Queries.GetKitsByTeamId.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Commands.UpdateTeamKit;

/// <summary>
/// Handler for updating an existing team kit.
/// Validates kit exists and belongs to the specified team before updating.
/// </summary>
public class UpdateTeamKitHandler : IRequestHandler<UpdateTeamKitCommand, TeamKitDto>
{
    private static readonly Regex HexColorRegex = new(@"^#([0-9a-fA-F]{6})$", RegexOptions.Compiled);
    private static readonly HashSet<string> ValidStripTypes = new(StringComparer.OrdinalIgnoreCase)
        { "plain", "hooped", "striped", "sash", "half-and-half", "sleeves" };

    private readonly OurGameContext _db;

    public UpdateTeamKitHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<TeamKitDto> Handle(UpdateTeamKitCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var teamId = command.TeamId;
        var kitId = command.KitId;

        // 1. Verify kit exists and belongs to the specified team
        var kitCheck = await _db.Database
            .SqlQueryRaw<KitCheckResult>(
                "SELECT Id, TeamId FROM Kits WHERE Id = {0}", kitId)
            .FirstOrDefaultAsync(cancellationToken);

        if (kitCheck == null)
        {
            throw new NotFoundException("Kit", kitId.ToString());
        }

        if (kitCheck.TeamId != teamId)
        {
            throw new NotFoundException("Kit", kitId.ToString());
        }

        // 2. Validate required fields
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

        // 3. Validate color formats
        if (!string.IsNullOrEmpty(dto.ShirtColor) && !HexColorRegex.IsMatch(dto.ShirtColor))
            errors.Add("ShirtColor", new[] { "Shirt color must be a valid hex color (e.g. #FF0000)." });

        if (!string.IsNullOrEmpty(dto.ShirtColor2) && !HexColorRegex.IsMatch(dto.ShirtColor2))
            errors.Add("ShirtColor2", new[] { "Second shirt color must be a valid hex color (e.g. #FFFFFF)." });

        if (!string.IsNullOrEmpty(dto.ShortsColor) && !HexColorRegex.IsMatch(dto.ShortsColor))
            errors.Add("ShortsColor", new[] { "Shorts color must be a valid hex color (e.g. #FFFFFF)." });

        if (!string.IsNullOrEmpty(dto.SocksColor) && !HexColorRegex.IsMatch(dto.SocksColor))
            errors.Add("SocksColor", new[] { "Socks color must be a valid hex color (e.g. #000000)." });

        // 4. Validate kit type
        var kitType = ParseKitType(dto.Type);
        if (kitType == null)
        {
            errors.Add("Type", new[] { $"Invalid kit type: {dto.Type}. Must be one of: home, away, third, goalkeeper, training." });
        }

        // 5. Validate strip type
        if (!string.IsNullOrEmpty(dto.StripType) && !ValidStripTypes.Contains(dto.StripType))
        {
            errors.Add("StripType", new[] { $"Invalid strip type: {dto.StripType}. Must be one of: plain, hooped, striped, sash, half-and-half, sleeves." });
        }

        if (errors.Count > 0)
        {
            throw new ValidationException(errors);
        }

        var season = dto.Season ?? string.Empty;
        var shirtColor2 = dto.ShirtColor2 ?? string.Empty;
        var stripType = dto.StripType ?? string.Empty;

        // 6. Execute the UPDATE
        var rowsAffected = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE Kits
            SET
                Name = {dto.Name},
                Type = {(int)kitType!.Value},
                ShirtColor = {dto.ShirtColor},
                ShirtColor2 = {shirtColor2},
                StripType = {stripType},
                ShortsColor = {dto.ShortsColor},
                SocksColor = {dto.SocksColor},
                Season = {season},
                IsActive = {dto.IsActive}
            WHERE Id = {kitId} AND TeamId = {teamId}
        ", cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException("Kit", kitId.ToString());
        }

        // 7. Query back the updated kit
        var kit = await _db.Database
            .SqlQueryRaw<KitRawDto>(@"
                SELECT
                    k.Id,
                    k.Name,
                    k.Type,
                    k.ShirtColor,
                    k.ShirtColor2,
                    k.StripType,
                    k.ShortsColor,
                    k.SocksColor,
                    k.Season,
                    k.IsActive
                FROM Kits k
                WHERE k.Id = {0}
            ", kitId)
            .FirstOrDefaultAsync(cancellationToken);

        if (kit == null)
        {
            throw new Exception("Failed to retrieve updated kit.");
        }

        // 8. Map to TeamKitDto
        return new TeamKitDto
        {
            Id = kit.Id,
            Name = kit.Name ?? string.Empty,
            Type = MapKitTypeToString(kit.Type),
            ShirtColor = kit.ShirtColor ?? string.Empty,
            ShirtColor2 = string.IsNullOrEmpty(kit.ShirtColor2) ? null : kit.ShirtColor2,
            StripType = string.IsNullOrEmpty(kit.StripType) ? null : kit.StripType,
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
    public Guid? TeamId { get; set; }
}

internal class KitRawDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public int Type { get; set; }
    public string? ShirtColor { get; set; }
    public string? ShirtColor2 { get; set; }
    public string? StripType { get; set; }
    public string? ShortsColor { get; set; }
    public string? SocksColor { get; set; }
    public string? Season { get; set; }
    public bool IsActive { get; set; }
}

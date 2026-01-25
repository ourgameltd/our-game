using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Clubs.Queries.GetKitsByClubId.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Queries.GetKitsByClubId;

/// <summary>
/// Query to get kits for a club by club ID
/// </summary>
public record GetKitsByClubIdQuery(Guid ClubId) : IQuery<List<ClubKitDto>>;

/// <summary>
/// Raw database result for kit query
/// </summary>
public class KitRawDto
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

/// <summary>
/// Handler for GetKitsByClubIdQuery
/// </summary>
public class GetKitsByClubIdHandler : IRequestHandler<GetKitsByClubIdQuery, List<ClubKitDto>>
{
    private readonly OurGameContext _db;

    public GetKitsByClubIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<ClubKitDto>> Handle(GetKitsByClubIdQuery query, CancellationToken cancellationToken)
    {
        var sql = @"
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
            WHERE k.ClubId = {0} AND k.TeamId IS NULL
            ORDER BY k.Type, k.Name";

        var kits = await _db.Database
            .SqlQueryRaw<KitRawDto>(sql, query.ClubId)
            .ToListAsync(cancellationToken);

        return kits.Select(k => new ClubKitDto
        {
            Id = k.Id,
            Name = k.Name ?? string.Empty,
            Type = MapKitType(k.Type),
            ShirtColor = k.ShirtColor ?? "#000000",
            ShortsColor = k.ShortsColor ?? "#000000",
            SocksColor = k.SocksColor ?? "#000000",
            Season = k.Season,
            IsActive = k.IsActive
        }).ToList();
    }

    /// <summary>
    /// Map KitType enum value to string representation
    /// </summary>
    private static string MapKitType(int type)
    {
        return type switch
        {
            0 => "home",
            1 => "away",
            2 => "third",
            3 => "goalkeeper",
            4 => "training",
            _ => "home"
        };
    }
}

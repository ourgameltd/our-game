using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.Queries.GetKitsByTeamId.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Queries.GetKitsByTeamId;

/// <summary>
/// Query to get kits for a team by team ID
/// </summary>
public record GetKitsByTeamIdQuery(Guid TeamId) : IQuery<Result<TeamKitsDto>>;

/// <summary>
/// Raw database result for team validation query
/// </summary>
public class TeamValidationRawDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public bool IsArchived { get; set; }
    public Guid ClubId { get; set; }
    public string? ClubName { get; set; }
}

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
/// Handler for GetKitsByTeamIdQuery
/// </summary>
public class GetKitsByTeamIdHandler : IRequestHandler<GetKitsByTeamIdQuery, Result<TeamKitsDto>>
{
    private readonly OurGameContext _db;

    public GetKitsByTeamIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<Result<TeamKitsDto>> Handle(GetKitsByTeamIdQuery query, CancellationToken cancellationToken)
    {
        // Validate team exists and get team context
        var teamSql = @"
            SELECT 
                t.Id,
                t.Name,
                t.IsArchived,
                t.ClubId,
                c.Name AS ClubName
            FROM Teams t
            INNER JOIN Clubs c ON t.ClubId = c.Id
            WHERE t.Id = {0}";

        var team = await _db.Database
            .SqlQueryRaw<TeamValidationRawDto>(teamSql, query.TeamId)
            .FirstOrDefaultAsync(cancellationToken);

        if (team == null)
        {
            return Result<TeamKitsDto>.NotFound($"Team with ID {query.TeamId} not found");
        }

        // Fetch team kits
        var kitsSql = @"
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
            WHERE k.TeamId = {0}
            ORDER BY k.Type, k.Name";

        var kits = await _db.Database
            .SqlQueryRaw<KitRawDto>(kitsSql, query.TeamId)
            .ToListAsync(cancellationToken);

        var kitDtos = kits.Select(k => new TeamKitDto
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

        var result = new TeamKitsDto
        {
            TeamId = team.Id,
            TeamName = team.Name ?? string.Empty,
            ClubId = team.ClubId,
            ClubName = team.ClubName ?? string.Empty,
            Kits = kitDtos
        };

        return Result<TeamKitsDto>.Success(result);
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

using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.UseCases.Formations.Queries.GetSystemFormations.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Formations.Queries.GetSystemFormations;

/// <summary>
/// Handler for retrieving all system formations with their ordered base positions.
/// </summary>
public class GetSystemFormationsHandler : IRequestHandler<GetSystemFormationsQuery, List<SystemFormationDto>>
{
    private readonly OurGameContext _db;

    public GetSystemFormationsHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<SystemFormationDto>> Handle(GetSystemFormationsQuery query, CancellationToken cancellationToken)
    {
        var formationsSql = @"
            SELECT
                f.Id,
                f.Name,
                f.System,
                f.SquadSize,
                f.Summary,
                f.Tags
            FROM Formations f
            WHERE f.IsSystemFormation = 1
            ORDER BY f.SquadSize, f.Name";

        var formations = await _db.Database
            .SqlQueryRaw<SystemFormationRaw>(formationsSql)
            .ToListAsync(cancellationToken);

        if (formations.Count == 0)
        {
            return new List<SystemFormationDto>();
        }

        var positionsSql = @"
            SELECT
                fp.FormationId,
                fp.PositionIndex,
                fp.Position,
                fp.XCoord,
                fp.YCoord,
                fp.Direction
            FROM FormationPositions fp
            INNER JOIN Formations f ON f.Id = fp.FormationId
            WHERE f.IsSystemFormation = 1
            ORDER BY fp.FormationId, fp.PositionIndex";

        var positions = await _db.Database
            .SqlQueryRaw<SystemFormationPositionRaw>(positionsSql)
            .ToListAsync(cancellationToken);

        var positionsByFormationId = positions
            .GroupBy(position => position.FormationId)
            .ToDictionary(
                group => group.Key,
                group => group
                    .OrderBy(position => position.PositionIndex)
                    .Select(position => new SystemFormationPositionDto
                    {
                        PositionIndex = position.PositionIndex,
                        Position = ((PlayerPosition)position.Position).ToString(),
                        X = (double)(position.XCoord ?? 0m),
                        Y = (double)(position.YCoord ?? 0m),
                        Direction = position.Direction.HasValue
                            ? ((Direction)position.Direction.Value).ToString()
                            : null
                    })
                    .ToList());

        return formations
            .Select(formation => new SystemFormationDto
            {
                Id = formation.Id,
                Name = formation.Name ?? string.Empty,
                System = formation.System,
                SquadSize = formation.SquadSize,
                Summary = formation.Summary,
                Tags = ParseTags(formation.Tags),
                Positions = positionsByFormationId.GetValueOrDefault(formation.Id, new List<SystemFormationPositionDto>())
            })
            .ToList();
    }

    private static List<string> ParseTags(string? rawTags)
    {
        if (string.IsNullOrWhiteSpace(rawTags))
        {
            return new List<string>();
        }

        try
        {
            return JsonSerializer.Deserialize<List<string>>(rawTags) ?? new List<string>();
        }
        catch
        {
            return rawTags
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList();
        }
    }
}

public class SystemFormationRaw
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? System { get; set; }
    public int SquadSize { get; set; }
    public string? Summary { get; set; }
    public string? Tags { get; set; }
}

public class SystemFormationPositionRaw
{
    public Guid FormationId { get; set; }
    public int PositionIndex { get; set; }
    public int Position { get; set; }
    public decimal? XCoord { get; set; }
    public decimal? YCoord { get; set; }
    public int? Direction { get; set; }
}
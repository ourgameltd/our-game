using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.UseCases.Drills.DTOs;
using OurGame.Application.UseCases.Drills.Queries.GetDrillById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Drills.Queries.GetDrillById;

/// <summary>
/// Handler for GetDrillByIdQuery - retrieves full drill detail using raw SQL
/// </summary>
public class GetDrillByIdHandler : IRequestHandler<GetDrillByIdQuery, DrillDetailDto?>
{
    private readonly OurGameContext _db;

    public GetDrillByIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<DrillDetailDto?> Handle(GetDrillByIdQuery query, CancellationToken cancellationToken)
    {
        // 1. Fetch the drill
        var drillSql = @"
            SELECT 
                d.Id,
                d.Name,
                d.Description,
                d.DurationMinutes,
                d.Category,
                d.Attributes,
                d.Equipment,
                d.DrillDiagramConfig,
                d.Instructions,
                d.Variations,
                d.IsPublic,
                d.CreatedBy,
                d.CreatedAt,
                d.UpdatedAt
            FROM Drills d
            WHERE d.Id = {0}";

        var drill = await _db.Database
            .SqlQueryRaw<DrillRaw>(drillSql, query.DrillId)
            .FirstOrDefaultAsync(cancellationToken);

        if (drill == null)
        {
            return null;
        }

        // 2. Fetch drill links
        var linksSql = @"
            SELECT 
                dl.Id,
                dl.Url,
                dl.Title,
                dl.Type
            FROM DrillLinks dl
            WHERE dl.DrillId = {0}";

        var links = await _db.Database
            .SqlQueryRaw<DrillLinkRaw>(linksSql, query.DrillId)
            .ToListAsync(cancellationToken);

        // 3. Fetch scope link data
        var clubIdsSql = @"SELECT dc.ClubId FROM DrillClubs dc WHERE dc.DrillId = {0}";
        var ageGroupIdsSql = @"SELECT dag.AgeGroupId FROM DrillAgeGroups dag WHERE dag.DrillId = {0}";
        var teamIdsSql = @"SELECT dt.TeamId FROM DrillTeams dt WHERE dt.DrillId = {0}";

        var clubIds = await _db.Database
            .SqlQueryRaw<Guid>(clubIdsSql, query.DrillId)
            .ToListAsync(cancellationToken);

        var ageGroupIds = await _db.Database
            .SqlQueryRaw<Guid>(ageGroupIdsSql, query.DrillId)
            .ToListAsync(cancellationToken);

        var teamIds = await _db.Database
            .SqlQueryRaw<Guid>(teamIdsSql, query.DrillId)
            .ToListAsync(cancellationToken);

        // Map to response DTO
        return new DrillDetailDto
        {
            Id = drill.Id,
            Name = drill.Name ?? string.Empty,
            Description = drill.Description,
            DurationMinutes = drill.DurationMinutes,
            Category = MapCategoryToString(drill.Category),
            Attributes = ParseJsonArray(drill.Attributes),
            Equipment = ParseJsonArray(drill.Equipment),
            DrillDiagramConfig = ParseDiagramConfig(drill.DrillDiagramConfig),
            Instructions = ParseJsonArray(drill.Instructions),
            Variations = ParseJsonArray(drill.Variations),
            IsPublic = drill.IsPublic,
            CreatedBy = drill.CreatedBy,
            CreatedAt = drill.CreatedAt,
            UpdatedAt = drill.UpdatedAt,
            Links = links.Select(l => new DrillLinkDto
            {
                Id = l.Id,
                Url = l.Url ?? string.Empty,
                Title = l.Title,
                LinkType = ((LinkType)l.Type).ToString()
            }).ToList(),
            Scope = new DrillScopeDto
            {
                ClubIds = clubIds,
                AgeGroupIds = ageGroupIds,
                TeamIds = teamIds
            }
        };
    }

    private static string MapCategoryToString(int category)
    {
        return category switch
        {
            // New persisted values
            10 => "Drill",
            11 => "Skills Practice",
            12 => "Game Related Practice",
            13 => "Conditioned Game",

            // Legacy persisted values normalized to new category strings
            0 => "Skills Practice",
            1 => "Game Related Practice",
            2 => "Conditioned Game",
            3 => "Drill",
            4 => "Drill",
            _ => "Drill"
        };
    }

    /// <summary>
    /// Parse JSON string array (e.g. '["item1","item2"]') into a list of strings
    /// </summary>
    private static List<string> ParseJsonArray(string? jsonArray)
    {
        if (string.IsNullOrWhiteSpace(jsonArray))
        {
            return new List<string>();
        }

        try
        {
            return JsonSerializer.Deserialize<List<string>>(jsonArray) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }

    private static DrillDiagramConfigDto? ParseDiagramConfig(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<DrillDiagramConfigDto>(json, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        }
        catch
        {
            return null;
        }
    }
}

#region Raw SQL DTOs

public class DrillRaw
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? DurationMinutes { get; set; }
    public int Category { get; set; }
    public string? Attributes { get; set; }
    public string? Equipment { get; set; }
    public string? DrillDiagramConfig { get; set; }
    public string? Instructions { get; set; }
    public string? Variations { get; set; }
    public bool IsPublic { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class DrillLinkRaw
{
    public Guid Id { get; set; }
    public string? Url { get; set; }
    public string? Title { get; set; }
    public int Type { get; set; }
}

#endregion

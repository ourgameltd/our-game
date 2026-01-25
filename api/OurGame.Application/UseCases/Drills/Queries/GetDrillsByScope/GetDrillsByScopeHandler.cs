using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Drills.Queries.GetDrillsByScope.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Drills.Queries.GetDrillsByScope;

/// <summary>
/// Query to get drills by scope (club, age group, or team level)
/// </summary>
public record GetDrillsByScopeQuery(
    Guid ClubId,
    Guid? AgeGroupId = null,
    Guid? TeamId = null,
    string? Category = null,
    string? SearchTerm = null
) : IQuery<DrillsByScopeResponseDto>;

/// <summary>
/// Handler for GetDrillsByScopeQuery
/// </summary>
public class GetDrillsByScopeHandler : IRequestHandler<GetDrillsByScopeQuery, DrillsByScopeResponseDto>
{
    private readonly OurGameContext _db;

    public GetDrillsByScopeHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<DrillsByScopeResponseDto> Handle(GetDrillsByScopeQuery query, CancellationToken cancellationToken)
    {
        // Determine the scope type based on provided IDs
        var scopeType = query.TeamId.HasValue ? "team"
                      : query.AgeGroupId.HasValue ? "agegroup"
                      : "club";

        // Build SQL query to get drills accessible at this scope via link tables
        // For club scope: get drills linked to this club
        // For age group scope: get drills linked to this club OR this age group
        // For team scope: get drills linked to this club OR the age group OR this team
        var sql = @"
            SELECT 
                d.Id,
                d.Name,
                d.Description,
                d.DurationMinutes,
                d.Category,
                d.Attributes,
                d.Equipment,
                d.Diagram,
                d.Instructions,
                d.Variations,
                d.CreatedBy,
                d.IsPublic,
                d.CreatedAt,
                CASE 
                    WHEN dt.DrillId IS NOT NULL THEN 'team'
                    WHEN dag.DrillId IS NOT NULL THEN 'agegroup'
                    WHEN dc.DrillId IS NOT NULL THEN 'club'
                    ELSE 'unknown'
                END as ScopeType,
                dc.ClubId as ScopeClubId,
                dag.AgeGroupId as ScopeAgeGroupId,
                dt.TeamId as ScopeTeamId
            FROM Drills d
            LEFT JOIN DrillClubs dc ON d.Id = dc.DrillId AND dc.ClubId = {0}
            LEFT JOIN DrillAgeGroups dag ON d.Id = dag.DrillId AND dag.AgeGroupId = {1}
            LEFT JOIN DrillTeams dt ON d.Id = dt.DrillId AND dt.TeamId = {2}
            WHERE dc.DrillId IS NOT NULL OR dag.DrillId IS NOT NULL OR dt.DrillId IS NOT NULL";

        var parameters = new List<object>
        {
            query.ClubId,
            query.AgeGroupId ?? Guid.Empty,
            query.TeamId ?? Guid.Empty
        };

        // Add optional category filter
        if (!string.IsNullOrEmpty(query.Category) && query.Category != "all")
        {
            var categoryValue = query.Category.ToLower() switch
            {
                "technical" => 0,
                "tactical" => 1,
                "physical" => 2,
                "mental" => 3,
                "mixed" => 4,
                _ => -1
            };

            if (categoryValue >= 0)
            {
                sql += $" AND d.Category = {{{parameters.Count}}}";
                parameters.Add(categoryValue);
            }
        }

        // Add optional search filter
        if (!string.IsNullOrEmpty(query.SearchTerm))
        {
            sql += $" AND (d.Name LIKE {{{parameters.Count}}} OR d.Description LIKE {{{parameters.Count}}} OR d.Attributes LIKE {{{parameters.Count}}})";
            parameters.Add($"%{query.SearchTerm}%");
        }

        sql += " ORDER BY d.Name ASC";

        var drills = await _db.Database
            .SqlQueryRaw<DrillRawDto>(sql, parameters.ToArray())
            .ToListAsync(cancellationToken);

        // Fetch links for all drills
        var drillIds = drills.Select(d => d.Id).ToList();
        var links = await _db.DrillLinks
            .Where(l => drillIds.Contains(l.DrillId))
            .Select(l => new
            {
                l.DrillId,
                l.Url,
                l.Title,
                Type = l.Type.ToString().ToLower()
            })
            .ToListAsync(cancellationToken);

        var linksByDrillId = links.GroupBy(l => l.DrillId)
            .ToDictionary(g => g.Key, g => g.Select(l => new DrillLinkDto
            {
                Url = l.Url ?? string.Empty,
                Title = l.Title ?? string.Empty,
                Type = l.Type
            }).ToList());

        var scopeDrills = new List<DrillListDto>();
        var inheritedDrills = new List<DrillListDto>();

        foreach (var drill in drills)
        {
            var dto = MapToDto(drill, linksByDrillId.GetValueOrDefault(drill.Id, new List<DrillLinkDto>()));

            // Determine the most specific scope this drill is linked to
            var drillScopeType = drill.ScopeType?.ToLowerInvariant() ?? "unknown";

            // Determine if this drill is at the current scope or inherited
            bool isCurrentScope = scopeType switch
            {
                "club" => drillScopeType == "club",
                "agegroup" => drillScopeType == "agegroup",
                "team" => drillScopeType == "team",
                _ => false
            };

            bool isInherited = scopeType switch
            {
                "club" => false,
                "agegroup" => drillScopeType == "club",
                "team" => drillScopeType == "club" || drillScopeType == "agegroup",
                _ => false
            };

            if (isCurrentScope)
            {
                scopeDrills.Add(dto);
            }
            else if (isInherited)
            {
                inheritedDrills.Add(dto);
            }
            else
            {
                // If we can't determine, add to inherited
                inheritedDrills.Add(dto);
            }
        }

        return new DrillsByScopeResponseDto
        {
            Drills = scopeDrills,
            InheritedDrills = inheritedDrills,
            TotalCount = scopeDrills.Count + inheritedDrills.Count
        };
    }

    private static DrillListDto MapToDto(DrillRawDto raw, List<DrillLinkDto> links)
    {
        return new DrillListDto
        {
            Id = raw.Id,
            Name = raw.Name ?? string.Empty,
            Description = raw.Description ?? string.Empty,
            Duration = raw.DurationMinutes ?? 0,
            Category = MapCategoryToString(raw.Category),
            Attributes = ParseJsonArray(raw.Attributes),
            Equipment = ParseJsonArray(raw.Equipment),
            Diagram = raw.Diagram,
            Instructions = ParseJsonArray(raw.Instructions),
            Variations = ParseJsonArray(raw.Variations),
            Links = links,
            ScopeType = raw.ScopeType ?? "unknown",
            IsPublic = raw.IsPublic,
            CreatedBy = raw.CreatedBy,
            CreatedAt = raw.CreatedAt
        };
    }

    private static string MapCategoryToString(int category)
    {
        return category switch
        {
            0 => "technical",
            1 => "tactical",
            2 => "physical",
            3 => "mental",
            4 => "mixed",
            _ => "technical"
        };
    }

    private static List<string> ParseJsonArray(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new List<string>();

        if (json.StartsWith("["))
        {
            try
            {
                return System.Text.Json.JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        // Handle comma-separated values
        return json.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => s.Trim())
            .ToList();
    }
}

/// <summary>
/// Raw DTO for SQL query result
/// </summary>
public class DrillRawDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? DurationMinutes { get; set; }
    public int Category { get; set; }
    public string? Attributes { get; set; }
    public string? Equipment { get; set; }
    public string? Diagram { get; set; }
    public string? Instructions { get; set; }
    public string? Variations { get; set; }
    public Guid? CreatedBy { get; set; }
    public bool IsPublic { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? ScopeType { get; set; }
    public Guid? ScopeClubId { get; set; }
    public Guid? ScopeAgeGroupId { get; set; }
    public Guid? ScopeTeamId { get; set; }
}

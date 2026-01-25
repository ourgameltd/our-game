using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplatesByScope.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplatesByScope;

/// <summary>
/// Query to get drill templates by scope (club, age group, or team level)
/// </summary>
public record GetDrillTemplatesByScopeQuery(
    Guid ClubId,
    Guid? AgeGroupId = null,
    Guid? TeamId = null,
    string? Category = null,
    string? SearchTerm = null,
    List<string>? Attributes = null
) : IQuery<DrillTemplatesByScopeResponseDto>;

/// <summary>
/// Handler for GetDrillTemplatesByScopeQuery
/// </summary>
public class GetDrillTemplatesByScopeHandler : IRequestHandler<GetDrillTemplatesByScopeQuery, DrillTemplatesByScopeResponseDto>
{
    private readonly OurGameContext _db;

    public GetDrillTemplatesByScopeHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<DrillTemplatesByScopeResponseDto> Handle(GetDrillTemplatesByScopeQuery query, CancellationToken cancellationToken)
    {
        // Determine the scope type based on provided IDs
        var scopeType = query.TeamId.HasValue ? "team"
                      : query.AgeGroupId.HasValue ? "agegroup"
                      : "club";

        // Build SQL query to get drill templates accessible at this scope via link tables
        var sql = @"
            SELECT 
                dt.Id,
                dt.Name,
                dt.Description,
                dt.AggregatedAttributes,
                dt.TotalDuration,
                dt.Category,
                dt.CreatedBy,
                dt.IsPublic,
                dt.CreatedAt,
                CASE 
                    WHEN dtt.DrillTemplateId IS NOT NULL THEN 'team'
                    WHEN dtag.DrillTemplateId IS NOT NULL THEN 'agegroup'
                    WHEN dtc.DrillTemplateId IS NOT NULL THEN 'club'
                    ELSE 'unknown'
                END as ScopeType,
                dtc.ClubId as ScopeClubId,
                dtag.AgeGroupId as ScopeAgeGroupId,
                dtt.TeamId as ScopeTeamId
            FROM DrillTemplates dt
            LEFT JOIN DrillTemplateClubs dtc ON dt.Id = dtc.DrillTemplateId AND dtc.ClubId = {0}
            LEFT JOIN DrillTemplateAgeGroups dtag ON dt.Id = dtag.DrillTemplateId AND dtag.AgeGroupId = {1}
            LEFT JOIN DrillTemplateTeams dtt ON dt.Id = dtt.DrillTemplateId AND dtt.TeamId = {2}
            WHERE dtc.DrillTemplateId IS NOT NULL OR dtag.DrillTemplateId IS NOT NULL OR dtt.DrillTemplateId IS NOT NULL";

        var parameters = new List<object>
        {
            query.ClubId,
            query.AgeGroupId ?? Guid.Empty,
            query.TeamId ?? Guid.Empty
        };

        // Add optional category filter
        if (!string.IsNullOrEmpty(query.Category) && query.Category != "all")
        {
            sql += $" AND dt.Category = {{{parameters.Count}}}";
            parameters.Add(query.Category.ToLower());
        }

        // Add optional search filter
        if (!string.IsNullOrEmpty(query.SearchTerm))
        {
            sql += $" AND (dt.Name LIKE {{{parameters.Count}}} OR dt.Description LIKE {{{parameters.Count}}} OR dt.AggregatedAttributes LIKE {{{parameters.Count}}})";
            parameters.Add($"%{query.SearchTerm}%");
        }

        sql += " ORDER BY dt.Name ASC";

        var templates = await _db.Database
            .SqlQueryRaw<DrillTemplateRawDto>(sql, parameters.ToArray())
            .ToListAsync(cancellationToken);

        // Get drill IDs for all templates
        var templateIds = templates.Select(t => t.Id).ToList();
        var templateDrills = await _db.TemplateDrills
            .Where(td => templateIds.Contains(td.TemplateId))
            .OrderBy(td => td.DrillOrder)
            .Select(td => new { td.TemplateId, td.DrillId })
            .ToListAsync(cancellationToken);

        var drillIdsByTemplateId = templateDrills
            .GroupBy(td => td.TemplateId)
            .ToDictionary(g => g.Key, g => g.Select(td => td.DrillId).ToList());

        // Filter by attributes if specified (template must have ALL selected attributes)
        if (query.Attributes is { Count: > 0 })
        {
            templates = templates.Where(t =>
            {
                var attrs = ParseJsonArray(t.AggregatedAttributes);
                return query.Attributes.All(attr => attrs.Contains(attr));
            }).ToList();
        }

        var scopeTemplates = new List<DrillTemplateListDto>();
        var inheritedTemplates = new List<DrillTemplateListDto>();
        var allAttributes = new HashSet<string>();

        foreach (var template in templates)
        {
            var dto = MapToDto(template, drillIdsByTemplateId.GetValueOrDefault(template.Id, new List<Guid>()));

            // Collect all attributes for filter
            dto.Attributes.ForEach(a => allAttributes.Add(a));

            // Determine the most specific scope this template is linked to
            var templateScopeType = template.ScopeType?.ToLowerInvariant() ?? "unknown";

            // Determine if this template is at the current scope or inherited
            bool isCurrentScope = scopeType switch
            {
                "club" => templateScopeType == "club",
                "agegroup" => templateScopeType == "agegroup",
                "team" => templateScopeType == "team",
                _ => false
            };

            bool isInherited = scopeType switch
            {
                "club" => false,
                "agegroup" => templateScopeType == "club",
                "team" => templateScopeType == "club" || templateScopeType == "agegroup",
                _ => false
            };

            if (isCurrentScope)
            {
                scopeTemplates.Add(dto);
            }
            else if (isInherited)
            {
                inheritedTemplates.Add(dto);
            }
            else
            {
                // If we can't determine, add to inherited
                inheritedTemplates.Add(dto);
            }
        }

        return new DrillTemplatesByScopeResponseDto
        {
            Templates = scopeTemplates,
            InheritedTemplates = inheritedTemplates,
            TotalCount = scopeTemplates.Count + inheritedTemplates.Count,
            AvailableAttributes = allAttributes.OrderBy(a => a).ToList()
        };
    }

    private static DrillTemplateListDto MapToDto(DrillTemplateRawDto raw, List<Guid> drillIds)
    {
        return new DrillTemplateListDto
        {
            Id = raw.Id,
            Name = raw.Name ?? string.Empty,
            Description = raw.Description ?? string.Empty,
            DrillIds = drillIds,
            TotalDuration = raw.TotalDuration ?? 0,
            Category = raw.Category,
            Attributes = ParseJsonArray(raw.AggregatedAttributes),
            ScopeType = raw.ScopeType ?? "unknown",
            IsPublic = raw.IsPublic,
            CreatedBy = raw.CreatedBy,
            CreatedAt = raw.CreatedAt
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
public class DrillTemplateRawDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? AggregatedAttributes { get; set; }
    public int? TotalDuration { get; set; }
    public string? Category { get; set; }
    public Guid? CreatedBy { get; set; }
    public bool IsPublic { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? ScopeType { get; set; }
    public Guid? ScopeClubId { get; set; }
    public Guid? ScopeAgeGroupId { get; set; }
    public Guid? ScopeTeamId { get; set; }
}

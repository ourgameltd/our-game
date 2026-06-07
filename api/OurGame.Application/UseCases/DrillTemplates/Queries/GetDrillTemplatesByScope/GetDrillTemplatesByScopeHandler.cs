using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Drills.DTOs;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplatesByScope.DTOs;
using OurGame.Persistence.Models;
using System;

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
    List<Guid>? CompetencyIds = null
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
                dt.TotalDuration,
                dt.Category,
                dt.SessionCategory,
                dt.CreatedBy,
                dt.IsPublic,
                dt.IsArchived,
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
                        WHERE (dtc.DrillTemplateId IS NOT NULL OR dtag.DrillTemplateId IS NOT NULL OR dtt.DrillTemplateId IS NOT NULL)
                            AND dt.IsArchived = 0";

        var parameters = new List<object>
        {
            query.ClubId,
            query.AgeGroupId ?? Guid.Empty,
            query.TeamId ?? Guid.Empty
        };

        // Add optional session category filter
        if (!string.IsNullOrEmpty(query.Category) && query.Category != "all")
        {
            sql += $" AND dt.SessionCategory = {{{parameters.Count}}}";
            parameters.Add(query.Category.Trim());
        }

        // Add optional search filter
        if (!string.IsNullOrEmpty(query.SearchTerm))
        {
            sql += $" AND (dt.Name LIKE {{{parameters.Count}}} OR dt.Description LIKE {{{parameters.Count}}})";
            parameters.Add($"%{query.SearchTerm}%");
        }

        // Add optional competency filter — template must have at least one drill with a matching competency
        if (query.CompetencyIds is { Count: > 0 })
        {
            var competencyPlaceholders = new List<string>();
            foreach (var competencyId in query.CompetencyIds)
            {
                competencyPlaceholders.Add($"{{{parameters.Count}}}");
                parameters.Add(competencyId);
            }
            sql += $@" AND EXISTS (
                SELECT 1 FROM TemplateDrills td2
                JOIN DrillCompetencies dc2 ON dc2.DrillId = td2.DrillId
                WHERE td2.TemplateId = dt.Id AND dc2.CompetencyId IN ({string.Join(", ", competencyPlaceholders)}))";
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

        // Batch fetch competencies for all template drills
        Dictionary<Guid, List<CompetencyDto>> competenciesByTemplateId = new();
        if (templateIds.Count > 0)
        {
            var idPlaceholders = string.Join(", ", templateIds.Select((_, i) => $"{{{i}}}"));
            var competenciesSql = $@"
                SELECT DISTINCT td.TemplateId, c.Id, c.Name, c.DisplayOrder
                FROM TemplateDrills td
                JOIN DrillCompetencies dc ON dc.DrillId = td.DrillId
                JOIN Competencies c ON c.Id = dc.CompetencyId
                WHERE td.TemplateId IN ({idPlaceholders})
                ORDER BY c.DisplayOrder";

            var templateCompetencies = await _db.Database
                .SqlQueryRaw<TemplateCompetencyRaw>(competenciesSql, templateIds.Cast<object>().ToArray())
                .ToListAsync(cancellationToken);

            competenciesByTemplateId = templateCompetencies
                .GroupBy(tc => tc.TemplateId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(tc => new CompetencyDto { Id = tc.Id, Name = tc.Name ?? string.Empty, DisplayOrder = tc.DisplayOrder })
                          .DistinctBy(c => c.Id)
                          .ToList()
                );
        }

        var scopeTemplates = new List<DrillTemplateListDto>();
        var inheritedTemplates = new List<DrillTemplateListDto>();

        foreach (var template in templates)
        {
            var templateCompetencies = competenciesByTemplateId.GetValueOrDefault(template.Id, new List<CompetencyDto>());
            var dto = MapToDto(template, drillIdsByTemplateId.GetValueOrDefault(template.Id, new List<Guid>()), templateCompetencies);

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
            AvailableCompetencies = new List<CompetencyDto>()
        };
    }

    private static DrillTemplateListDto MapToDto(DrillTemplateRawDto raw, List<Guid> drillIds, List<CompetencyDto> competencies)
    {
        return new DrillTemplateListDto
        {
            Id = raw.Id,
            Name = raw.Name ?? string.Empty,
            Description = raw.Description ?? string.Empty,
            DrillIds = drillIds,
            TotalDuration = raw.TotalDuration ?? 0,
            Category = raw.Category,
            SessionCategory = raw.SessionCategory ?? "Whole Part Whole",
            Competencies = competencies,
            ScopeType = raw.ScopeType ?? "unknown",
            IsPublic = raw.IsPublic,
            IsArchived = raw.IsArchived,
            CreatedBy = raw.CreatedBy,
            CreatedAt = raw.CreatedAt
        };
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
    public int? TotalDuration { get; set; }
    public string? Category { get; set; }
    public string? SessionCategory { get; set; }
    public Guid? CreatedBy { get; set; }
    public bool IsPublic { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? ScopeType { get; set; }
    public Guid? ScopeClubId { get; set; }
    public Guid? ScopeAgeGroupId { get; set; }
    public Guid? ScopeTeamId { get; set; }
}

public class TemplateCompetencyRaw
{
    public Guid TemplateId { get; set; }
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public int DisplayOrder { get; set; }
}

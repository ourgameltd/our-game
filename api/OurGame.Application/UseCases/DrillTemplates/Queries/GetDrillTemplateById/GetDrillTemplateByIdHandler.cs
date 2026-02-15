using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplateById.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplateById;

/// <summary>
/// Query to get a drill template by ID with full detail
/// </summary>
public record GetDrillTemplateByIdQuery(Guid Id) : IQuery<DrillTemplateDetailDto?>;

/// <summary>
/// Handler for GetDrillTemplateByIdQuery
/// </summary>
public class GetDrillTemplateByIdHandler : IRequestHandler<GetDrillTemplateByIdQuery, DrillTemplateDetailDto?>
{
    private readonly OurGameContext _db;

    public GetDrillTemplateByIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<DrillTemplateDetailDto?> Handle(GetDrillTemplateByIdQuery query, CancellationToken cancellationToken)
    {
        // Query drill template with scope information via link tables
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
            LEFT JOIN DrillTemplateClubs dtc ON dt.Id = dtc.DrillTemplateId
            LEFT JOIN DrillTemplateAgeGroups dtag ON dt.Id = dtag.DrillTemplateId
            LEFT JOIN DrillTemplateTeams dtt ON dt.Id = dtt.DrillTemplateId
            WHERE dt.Id = {0}";

        var template = await _db.Database
            .SqlQueryRaw<DrillTemplateRawDto>(sql, query.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (template == null)
        {
            return null;
        }

        // Get ordered drill IDs for this template
        var drillIds = await _db.TemplateDrills
            .Where(td => td.TemplateId == query.Id)
            .OrderBy(td => td.DrillOrder)
            .Select(td => td.DrillId)
            .ToListAsync(cancellationToken);

        return MapToDto(template, drillIds);
    }

    private static DrillTemplateDetailDto MapToDto(DrillTemplateRawDto raw, List<Guid> drillIds)
    {
        return new DrillTemplateDetailDto
        {
            Id = raw.Id,
            Name = raw.Name ?? string.Empty,
            Description = raw.Description ?? string.Empty,
            DrillIds = drillIds,
            TotalDuration = raw.TotalDuration ?? 0,
            Category = raw.Category,
            Attributes = ParseJsonArray(raw.AggregatedAttributes),
            IsPublic = raw.IsPublic,
            CreatedBy = raw.CreatedBy,
            CreatedAt = raw.CreatedAt,
            ScopeType = raw.ScopeType ?? "unknown",
            ScopeClubId = raw.ScopeClubId,
            ScopeAgeGroupId = raw.ScopeAgeGroupId,
            ScopeTeamId = raw.ScopeTeamId
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

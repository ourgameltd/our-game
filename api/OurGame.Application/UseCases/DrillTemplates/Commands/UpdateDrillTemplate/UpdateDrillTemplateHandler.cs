using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.DrillTemplates.Commands.UpdateDrillTemplate.DTOs;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplateById;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplateById.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.DrillTemplates.Commands.UpdateDrillTemplate;

/// <summary>
/// Command for updating an existing drill template
/// </summary>
public record UpdateDrillTemplateCommand(
    Guid TemplateId,
    string UserId,
    UpdateDrillTemplateRequestDto Dto
) : IRequest<DrillTemplateDetailDto>;

/// <summary>
/// Handler for updating an existing drill template.
/// Updates DrillTemplates row, replaces TemplateDrills atomically.
/// Recomputes aggregates (duration, attributes, category) from drill list.
/// Scope links are immutable (cannot be changed after creation).
/// Only the creating coach can update their template.
/// </summary>
public class UpdateDrillTemplateHandler : IRequestHandler<UpdateDrillTemplateCommand, DrillTemplateDetailDto>
{
    private readonly OurGameContext _db;

    public UpdateDrillTemplateHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<DrillTemplateDetailDto> Handle(UpdateDrillTemplateCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var templateId = command.TemplateId;

        // Validate required fields
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new ValidationException("Name", "Name is required.");
        }

        if (dto.DrillIds == null || dto.DrillIds.Count == 0)
        {
            throw new ValidationException("DrillIds", "At least one drill is required.");
        }

        // Check template exists and fetch CreatedBy coach ID
        var templateCheckSql = @"
            SELECT Id, CreatedBy 
            FROM DrillTemplates 
            WHERE Id = {0}";

        var templateCheck = await _db.Database
            .SqlQueryRaw<TemplateCheckRaw>(templateCheckSql, templateId)
            .FirstOrDefaultAsync(cancellationToken);

        if (templateCheck == null)
        {
            throw new NotFoundException("DrillTemplate", templateId.ToString());
        }

        // Resolve current coach ID from AuthId (UserId from command)
        var currentCoachSql = @"
            SELECT c.Id 
            FROM Coaches c
            INNER JOIN Users u ON c.UserId = u.Id
            WHERE u.AuthId = {0}";

        var currentCoachId = await _db.Database
            .SqlQueryRaw<Guid>(currentCoachSql, command.UserId)
            .FirstOrDefaultAsync(cancellationToken);

        if (currentCoachId == Guid.Empty)
        {
            throw new NotFoundException("Coach", "Current user is not a coach");
        }

        // Verify authorization: only the creating coach can update
        if (templateCheck.CreatedBy != currentCoachId)
        {
            throw new UnauthorizedAccessException("Only the creating coach can update this drill template");
        }

        // Fetch drills to compute aggregates
        var drillDataSql = @"
            SELECT 
                d.Id,
                d.DurationMinutes,
                d.Category,
                d.Attributes
            FROM Drills d
            WHERE d.Id IN ({0})";

        // Build parameterized query for drill IDs
        var drillIdParams = string.Join(",", dto.DrillIds.Select((_, i) => $"{{{i}}}"));
        var drillDataQuery = string.Format(drillDataSql, drillIdParams);

        var drillData = await _db.Database
            .SqlQueryRaw<DrillDataRaw>(drillDataQuery, dto.DrillIds.Cast<object>().ToArray())
            .ToListAsync(cancellationToken);

        // Verify all drills exist
        if (drillData.Count != dto.DrillIds.Count)
        {
            var foundIds = drillData.Select(d => d.Id).ToHashSet();
            var missingIds = dto.DrillIds.Where(id => !foundIds.Contains(id)).ToList();
            throw new ValidationException("DrillIds", $"The following drill IDs do not exist: {string.Join(", ", missingIds)}");
        }

        // Compute aggregates
        var totalDuration = drillData.Sum(d => d.DurationMinutes ?? 0);
        var allAttributes = new HashSet<string>();
        var categoryCount = new Dictionary<string, int>();

        foreach (var drill in drillData)
        {
            // Parse and merge attributes
            var attrs = ParseJsonArray(drill.Attributes);
            foreach (var attr in attrs)
            {
                allAttributes.Add(attr);
            }

            // Count categories
            var category = drill.Category?.ToLowerInvariant() ?? "mixed";
            categoryCount[category] = categoryCount.GetValueOrDefault(category, 0) + 1;
        }

        // Determine predominant category
        var predominantCategory = categoryCount.Count > 0
            ? categoryCount.OrderByDescending(kv => kv.Value).First().Key
            : "mixed";

        var aggregatedAttributesJson = allAttributes.Count > 0
            ? JsonSerializer.Serialize(allAttributes.OrderBy(a => a).ToList())
            : null;

        var name = dto.Name;
        var description = dto.Description ?? string.Empty;
        var isPublic = dto.IsPublic;

        // Begin transaction
        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            // Update the DrillTemplates row (scope links unchanged, CreatedBy unchanged)
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                UPDATE DrillTemplates
                SET Name = {name},
                    Description = {description},
                    AggregatedAttributes = {aggregatedAttributesJson},
                    TotalDuration = {totalDuration},
                    Category = {predominantCategory},
                    IsPublic = {isPublic}
                WHERE Id = {templateId}
            ", cancellationToken);

            // Replace TemplateDrills: DELETE existing + INSERT new set
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                DELETE FROM TemplateDrills WHERE TemplateId = {templateId}
            ", cancellationToken);

            for (int i = 0; i < dto.DrillIds.Count; i++)
            {
                var templateDrillId = Guid.NewGuid();
                var drillId = dto.DrillIds[i];
                var drillOrder = i;

                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO TemplateDrills (Id, TemplateId, DrillId, DrillOrder)
                    VALUES ({templateDrillId}, {templateId}, {drillId}, {drillOrder})
                ", cancellationToken);
            }

            // Commit transaction
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        // Requery the updated drill template using the existing GetDrillTemplateById handler
        var result = await new GetDrillTemplateByIdHandler(_db)
            .Handle(new GetDrillTemplateByIdQuery(templateId), cancellationToken);

        if (result == null)
        {
            throw new Exception("Failed to retrieve updated drill template.");
        }

        return result;
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
}

/// <summary>
/// Raw DTO for checking template existence and ownership
/// </summary>
public class TemplateCheckRaw
{
    public Guid Id { get; set; }
    public Guid? CreatedBy { get; set; }
}

/// <summary>
/// Raw DTO for drill data needed for aggregation
/// </summary>
public class DrillDataRaw
{
    public Guid Id { get; set; }
    public int? DurationMinutes { get; set; }
    public string? Category { get; set; }
    public string? Attributes { get; set; }
}

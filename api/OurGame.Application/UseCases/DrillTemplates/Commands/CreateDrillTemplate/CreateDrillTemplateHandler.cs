using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplatesByScope;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplatesByScope.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.DrillTemplates.Commands.CreateDrillTemplate;

/// <summary>
/// Handler for creating a new drill template with multi-table inserts in a transaction
/// </summary>
public class CreateDrillTemplateHandler : IRequestHandler<CreateDrillTemplateCommand, DrillTemplateListDto>
{
    private readonly OurGameContext _db;
    private readonly GetDrillTemplatesByScopeHandler _getDrillTemplatesByScopeHandler;

    public CreateDrillTemplateHandler(OurGameContext db)
    {
        _db = db;
        _getDrillTemplatesByScopeHandler = new GetDrillTemplatesByScopeHandler(db);
    }

    public async Task<DrillTemplateListDto> Handle(CreateDrillTemplateCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;

        // Validate name
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new ValidationException("Name", "Name is required.");
        }

        // Validate drillIds
        if (dto.DrillIds == null || dto.DrillIds.Count == 0)
        {
            throw new ValidationException("DrillIds", "At least one drill must be included in the template.");
        }

        // Validate scope - exactly one scope field must be provided
        var scopeCount = (dto.Scope.ClubId.HasValue && dto.Scope.ClubId != Guid.Empty ? 1 : 0) +
                        (dto.Scope.AgeGroupId.HasValue && dto.Scope.AgeGroupId != Guid.Empty ? 1 : 0) +
                        (dto.Scope.TeamId.HasValue && dto.Scope.TeamId != Guid.Empty ? 1 : 0);

        if (scopeCount != 1)
        {
            throw new ValidationException("Scope", "Exactly one scope (ClubId, AgeGroupId, or TeamId) must be provided.");
        }

        // Resolve CreatedBy coach ID from authenticated user
        Guid? coachId = null;
        if (!string.IsNullOrEmpty(command.UserId))
        {
            var userIdSql = "SELECT Id FROM Users WHERE AuthId = {0}";
            var userId = await _db.Database
                .SqlQueryRaw<Guid>(userIdSql, command.UserId)
                .FirstOrDefaultAsync(cancellationToken);

            if (userId != Guid.Empty)
            {
                var coachIdSql = "SELECT Id FROM Coaches WHERE UserId = {0}";
                var resolvedCoachId = await _db.Database
                    .SqlQueryRaw<Guid>(coachIdSql, userId)
                    .FirstOrDefaultAsync(cancellationToken);

                if (resolvedCoachId != Guid.Empty)
                {
                    coachId = resolvedCoachId;
                }
            }
        }

        // Query drills to compute aggregated data
        var drillData = await GetDrillDataAsync(dto.DrillIds, cancellationToken);

        if (drillData.Count != dto.DrillIds.Count)
        {
            var missingIds = dto.DrillIds.Except(drillData.Select(d => d.Id)).ToList();
            throw new NotFoundException($"Drills not found: {string.Join(", ", missingIds)}");
        }

        // Compute aggregated fields
        var totalDuration = drillData.Sum(d => d.DurationMinutes ?? 0);
        var allAttributes = new HashSet<string>();
        var categories = new HashSet<string>();

        foreach (var drill in drillData)
        {
            // Parse attributes JSON array
            var attrs = ParseJsonArray(drill.Attributes);
            foreach (var attr in attrs)
            {
                allAttributes.Add(attr);
            }

            // Collect categories
            categories.Add(drill.Category.ToString().ToLower());
        }

        var aggregatedAttributes = JsonSerializer.Serialize(allAttributes.OrderBy(a => a).ToList());
        var category = categories.Count == 1 ? categories.First() : "mixed";

        // Generate IDs and timestamps
        var templateId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        // Begin transaction
        IDbContextTransaction? transaction = null;
        try
        {
            transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

            // Insert into DrillTemplates table
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO DrillTemplates (Id, Name, Description, AggregatedAttributes, TotalDuration, Category, CreatedBy, IsPublic, CreatedAt)
                VALUES ({templateId}, {dto.Name}, {dto.Description}, {aggregatedAttributes}, {totalDuration}, {category}, {coachId}, {dto.IsPublic}, {now})
            ", cancellationToken);

            // Insert scope link row
            var scopeLinkId = Guid.NewGuid();
            if (dto.Scope.ClubId.HasValue && dto.Scope.ClubId != Guid.Empty)
            {
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO DrillTemplateClubs (Id, DrillTemplateId, ClubId, SharedAt)
                    VALUES ({scopeLinkId}, {templateId}, {dto.Scope.ClubId}, {now})
                ", cancellationToken);
            }
            else if (dto.Scope.AgeGroupId.HasValue && dto.Scope.AgeGroupId != Guid.Empty)
            {
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO DrillTemplateAgeGroups (Id, DrillTemplateId, AgeGroupId, SharedAt)
                    VALUES ({scopeLinkId}, {templateId}, {dto.Scope.AgeGroupId}, {now})
                ", cancellationToken);
            }
            else if (dto.Scope.TeamId.HasValue && dto.Scope.TeamId != Guid.Empty)
            {
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO DrillTemplateTeams (Id, DrillTemplateId, TeamId, SharedAt)
                    VALUES ({scopeLinkId}, {templateId}, {dto.Scope.TeamId}, {now})
                ", cancellationToken);
            }

            // Insert TemplateDrills rows with DrillOrder
            for (int i = 0; i < dto.DrillIds.Count; i++)
            {
                var templateDrillId = Guid.NewGuid();
                var drillId = dto.DrillIds[i];
                var drillOrder = i; // 0-based order

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
            if (transaction != null)
            {
                await transaction.RollbackAsync(cancellationToken);
            }
            throw;
        }
        finally
        {
            if (transaction != null)
            {
                await transaction.DisposeAsync();
            }
        }

        // Re-query and return the created template using GetDrillTemplatesByScope handler
        var scopeQuery = new GetDrillTemplatesByScopeQuery(
            ClubId: dto.Scope.ClubId ?? Guid.Empty,
            AgeGroupId: dto.Scope.AgeGroupId,
            TeamId: dto.Scope.TeamId
        );

        var scopeResult = await _getDrillTemplatesByScopeHandler.Handle(scopeQuery, cancellationToken);

        // Find the newly created template in the results
        var createdTemplate = scopeResult.Templates.FirstOrDefault(t => t.Id == templateId)
                           ?? scopeResult.InheritedTemplates.FirstOrDefault(t => t.Id == templateId);

        if (createdTemplate == null)
        {
            throw new Exception("Failed to retrieve created drill template.");
        }

        return createdTemplate;
    }

    /// <summary>
    /// Query drill data for computing aggregated fields
    /// </summary>
    private async Task<List<DrillDataDto>> GetDrillDataAsync(List<Guid> drillIds, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT Id, DurationMinutes, Category, Attributes
            FROM Drills
            WHERE Id IN ({0})";

        // Build parameterized query for IN clause
        var parameters = string.Join(", ", drillIds.Select((_, i) => $"{{{i}}}"));
        var formattedSql = sql.Replace("{0}", parameters);

        var result = await _db.Database
            .SqlQueryRaw<DrillDataDto>(formattedSql, drillIds.Cast<object>().ToArray())
            .ToListAsync(cancellationToken);

        return result;
    }

    private static List<string> ParseJsonArray(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new List<string>();

        if (json.StartsWith("["))
        {
            try
            {
                return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
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
/// DTO for drill data used in aggregation
/// </summary>
public class DrillDataDto
{
    public Guid Id { get; set; }
    public int? DurationMinutes { get; set; }
    public DrillCategory Category { get; set; }
    public string? Attributes { get; set; }
}

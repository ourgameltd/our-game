using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Tactics.Queries.GetTacticById;

/// <summary>
/// Handler for GetTacticByIdQuery - retrieves full tactic detail using raw SQL
/// </summary>
public class GetTacticByIdHandler : IRequestHandler<GetTacticByIdQuery, TacticDetailDto?>
{
    private readonly OurGameContext _db;

    public GetTacticByIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<TacticDetailDto?> Handle(GetTacticByIdQuery query, CancellationToken cancellationToken)
    {
        // 1. Fetch the tactic (formation with ParentFormationId != null)
        var tacticSql = @"
            SELECT 
                f.Id,
                f.Name,
                f.ParentFormationId,
                pf.Name AS ParentFormationName,
                f.ParentTacticId,
                pt.Name AS ParentTacticName,
                f.SquadSize,
                f.Summary,
                f.Description,
                f.Style,
                f.Tags,
                f.CreatedAt,
                f.UpdatedAt
            FROM Formations f
            LEFT JOIN Formations pf ON f.ParentFormationId = pf.Id
            LEFT JOIN Formations pt ON f.ParentTacticId = pt.Id
            WHERE f.Id = {0}
              AND f.ParentFormationId IS NOT NULL";

        var tactic = await _db.Database
            .SqlQueryRaw<TacticRaw>(tacticSql, query.TacticId)
            .FirstOrDefaultAsync(cancellationToken);

        if (tactic == null)
        {
            return null;
        }

        // 2. Fetch position overrides
        var overridesSql = @"
            SELECT 
                po.Id,
                po.PositionIndex,
                po.XCoord,
                po.YCoord,
                po.Direction
            FROM PositionOverrides po
            WHERE po.FormationId = {0}
            ORDER BY po.PositionIndex";

        var overrides = await _db.Database
            .SqlQueryRaw<PositionOverrideRaw>(overridesSql, query.TacticId)
            .ToListAsync(cancellationToken);

        // 3. Fetch tactic principles
        var principlesSql = @"
            SELECT 
                tp.Id,
                tp.Title,
                tp.Description,
                tp.PositionIndices
            FROM TacticPrinciples tp
            WHERE tp.FormationId = {0}";

        var principles = await _db.Database
            .SqlQueryRaw<TacticPrincipleRaw>(principlesSql, query.TacticId)
            .ToListAsync(cancellationToken);

        // 4. Fetch scope link data
        var clubIdsSql = @"SELECT fc.ClubId FROM FormationClubs fc WHERE fc.FormationId = {0}";
        var ageGroupIdsSql = @"SELECT fag.AgeGroupId FROM FormationAgeGroups fag WHERE fag.FormationId = {0}";
        var teamIdsSql = @"SELECT ft.TeamId FROM FormationTeams ft WHERE ft.FormationId = {0}";

        var clubIds = await _db.Database
            .SqlQueryRaw<Guid>(clubIdsSql, query.TacticId)
            .ToListAsync(cancellationToken);

        var ageGroupIds = await _db.Database
            .SqlQueryRaw<Guid>(ageGroupIdsSql, query.TacticId)
            .ToListAsync(cancellationToken);

        var teamIds = await _db.Database
            .SqlQueryRaw<Guid>(teamIdsSql, query.TacticId)
            .ToListAsync(cancellationToken);

        // 5. Fetch base formation positions from parent formation
        var basePositionsSql = @"
            SELECT 
                fp.PositionIndex,
                fp.Position,
                fp.XCoord,
                fp.YCoord,
                fp.Direction
            FROM FormationPositions fp
            WHERE fp.FormationId = {0}
            ORDER BY fp.PositionIndex";

        var basePositions = tactic.ParentFormationId.HasValue
            ? await _db.Database
                .SqlQueryRaw<FormationPositionRaw>(basePositionsSql, tactic.ParentFormationId.Value)
                .ToListAsync(cancellationToken)
            : new List<FormationPositionRaw>();

        // 6. Build tactic inheritance chain using recursive CTE
        var hierarchySql = @"
            WITH TacticHierarchy AS (
                SELECT Id, ParentTacticId, 0 as Depth
                FROM Formations
                WHERE Id = {0}
                
                UNION ALL
                
                SELECT f.Id, f.ParentTacticId, th.Depth + 1
                FROM Formations f
                INNER JOIN TacticHierarchy th ON f.Id = th.ParentTacticId
                WHERE th.Depth < 10
            )
            SELECT Id, Depth 
            FROM TacticHierarchy
            ORDER BY Depth DESC";

        var hierarchy = await _db.Database
            .SqlQueryRaw<TacticHierarchyRaw>(hierarchySql, query.TacticId)
            .ToListAsync(cancellationToken);

        // 7. Fetch position overrides for all tactics in the chain
        List<PositionOverrideWithTacticRaw> allOverrides = new();
        
        if (hierarchy.Any())
        {
            var tacticIds = hierarchy.Select(h => h.Id).ToList();
            // Note: Safe to use string concatenation here because tacticIds come from DB query, not user input
            var tacticIdsParam = string.Join(",", tacticIds.Select(id => $"'{id}'"));
            
            var chainOverridesSql = $@"
                SELECT 
                    po.FormationId as TacticId,
                    po.PositionIndex,
                    po.XCoord,
                    po.YCoord,
                    po.Direction
                FROM PositionOverrides po
                WHERE po.FormationId IN ({tacticIdsParam})";

            allOverrides = await _db.Database
                .SqlQueryRaw<PositionOverrideWithTacticRaw>(chainOverridesSql)
                .ToListAsync(cancellationToken);
        }

        // 8. Compute resolved positions with inheritance applied
        var resolvedPositions = ComputeResolvedPositions(
            basePositions, 
            hierarchy, 
            allOverrides, 
            tactic.ParentFormationId);

        // Map to response DTO
        return new TacticDetailDto
        {
            Id = tactic.Id,
            Name = tactic.Name ?? string.Empty,
            ParentFormationId = tactic.ParentFormationId,
            ParentFormationName = tactic.ParentFormationName,
            ParentTacticId = tactic.ParentTacticId,
            ParentTacticName = tactic.ParentTacticName,
            SquadSize = tactic.SquadSize,
            Summary = tactic.Summary,
            Description = tactic.Description,
            Style = tactic.Style,
            Tags = ParseTags(tactic.Tags),
            Scope = new TacticScopeDto
            {
                ClubIds = clubIds,
                AgeGroupIds = ageGroupIds,
                TeamIds = teamIds
            },
            PositionOverrides = overrides.Select(o => new PositionOverrideDto
            {
                Id = o.Id,
                PositionIndex = o.PositionIndex,
                XCoord = o.XCoord,
                YCoord = o.YCoord,
                Direction = o.Direction
            }).ToList(),
            Principles = principles.Select(p => new TacticPrincipleDto
            {
                Id = p.Id,
                Title = p.Title ?? string.Empty,
                Description = p.Description,
                PositionIndices = ParsePositionIndices(p.PositionIndices)
            }).ToList(),
            ResolvedPositions = resolvedPositions,
            CreatedAt = tactic.CreatedAt,
            UpdatedAt = tactic.UpdatedAt
        };
    }

    /// <summary>
    /// Compute resolved positions by applying inheritance chain from base formation through parent tactics
    /// </summary>
    private static List<ResolvedPositionDto> ComputeResolvedPositions(
        List<FormationPositionRaw> basePositions,
        List<TacticHierarchyRaw> hierarchy,
        List<PositionOverrideWithTacticRaw> allOverrides,
        Guid? sourceFormationId)
    {
        // Start with a dictionary indexed by PositionIndex for efficient lookups
        var positionMap = new Dictionary<int, ResolvedPosition>();

        // Initialize with base formation positions
        foreach (var basePos in basePositions)
        {
            positionMap[basePos.PositionIndex] = new ResolvedPosition
            {
                PositionIndex = basePos.PositionIndex,
                Position = ((PlayerPosition)basePos.Position).ToString(),
                X = (double)(basePos.XCoord ?? 0),
                Y = (double)(basePos.YCoord ?? 0),
                Direction = basePos.Direction.HasValue 
                    ? ((Direction)basePos.Direction.Value).ToString() 
                    : null,
                SourceFormationId = sourceFormationId,
                OverriddenBy = new List<Guid>()
            };
        }

        // Apply overrides in order from root (highest depth) to current tactic (lowest depth)
        // Hierarchy is already ordered by Depth DESC (root first)
        foreach (var node in hierarchy)
        {
            var overridesForThisTactic = allOverrides.Where(o => o.TacticId == node.Id).ToList();
            
            foreach (var ovr in overridesForThisTactic)
            {
                // Only apply override if the position index exists in the base formation
                if (positionMap.TryGetValue(ovr.PositionIndex, out var position))
                {
                    // Apply coordinate overrides
                    if (ovr.XCoord.HasValue)
                    {
                        position.X = (double)ovr.XCoord.Value;
                    }
                    
                    if (ovr.YCoord.HasValue)
                    {
                        position.Y = (double)ovr.YCoord.Value;
                    }
                    
                    // Apply direction override (PositionOverride.Direction is a string)
                    if (!string.IsNullOrWhiteSpace(ovr.Direction))
                    {
                        position.Direction = ovr.Direction;
                    }
                    
                    // Track that this tactic overrode this position
                    position.OverriddenBy.Add(node.Id);
                }
            }
        }

        // Convert to DTO list, ordered by PositionIndex
        return positionMap.Values
            .OrderBy(p => p.PositionIndex)
            .Select(p => new ResolvedPositionDto(
                Position: p.Position,
                X: p.X,
                Y: p.Y,
                Direction: p.Direction,
                SourceFormationId: p.SourceFormationId?.ToString(),
                OverriddenBy: p.OverriddenBy.Count > 0 
                    ? p.OverriddenBy.Select(id => id.ToString()).ToList() 
                    : null
            ))
            .ToList();
    }

    /// <summary>
    /// Parse Tags JSON string array (e.g. '["pressing","high-line"]') into a list of strings
    /// </summary>
    private static List<string> ParseTags(string? tagsJson)
    {
        if (string.IsNullOrWhiteSpace(tagsJson))
        {
            return new List<string>();
        }

        try
        {
            return JsonSerializer.Deserialize<List<string>>(tagsJson) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }

    /// <summary>
    /// Parse CSV position indices (e.g. "9,10") into an int list
    /// </summary>
    private static List<int> ParsePositionIndices(string? csv)
    {
        if (string.IsNullOrWhiteSpace(csv))
        {
            return new List<int>();
        }

        return csv
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(s => int.TryParse(s, out var v) ? v : (int?)null)
            .Where(v => v.HasValue)
            .Select(v => v!.Value)
            .ToList();
    }
}

#region Raw SQL DTOs

public class TacticRaw
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public Guid? ParentFormationId { get; set; }
    public string? ParentFormationName { get; set; }
    public Guid? ParentTacticId { get; set; }
    public string? ParentTacticName { get; set; }
    public int SquadSize { get; set; }
    public string? Summary { get; set; }
    public string? Description { get; set; }
    public string? Style { get; set; }
    public string? Tags { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class PositionOverrideRaw
{
    public Guid Id { get; set; }
    public int PositionIndex { get; set; }
    public decimal? XCoord { get; set; }
    public decimal? YCoord { get; set; }
    public string? Direction { get; set; }
}

public class TacticPrincipleRaw
{
    public Guid Id { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? PositionIndices { get; set; }
}

public class FormationPositionRaw
{
    public int PositionIndex { get; set; }
    public int Position { get; set; }  // PlayerPosition enum stored as int in SQL
    public decimal? XCoord { get; set; }
    public decimal? YCoord { get; set; }
    public int? Direction { get; set; }  // Direction enum stored as int in SQL
}

public class TacticHierarchyRaw
{
    public Guid Id { get; set; }
    public int Depth { get; set; }
}

public class PositionOverrideWithTacticRaw
{
    public Guid TacticId { get; set; }
    public int PositionIndex { get; set; }
    public decimal? XCoord { get; set; }
    public decimal? YCoord { get; set; }
    public string? Direction { get; set; }
}

#endregion

#region Helper Classes

/// <summary>
/// Internal model for tracking resolved position state during inheritance computation
/// </summary>
internal class ResolvedPosition
{
    public int PositionIndex { get; set; }
    public string Position { get; set; } = string.Empty;
    public double X { get; set; }
    public double Y { get; set; }
    public string? Direction { get; set; }
    public Guid? SourceFormationId { get; set; }
    public List<Guid> OverriddenBy { get; set; } = new();
}

#endregion

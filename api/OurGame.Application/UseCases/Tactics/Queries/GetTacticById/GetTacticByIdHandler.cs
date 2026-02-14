using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;
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
            CreatedAt = tactic.CreatedAt,
            UpdatedAt = tactic.UpdatedAt
        };
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

#endregion

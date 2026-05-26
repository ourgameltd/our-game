using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticsByScope.DTOs;
using ScopeTacticScopeDto = OurGame.Application.UseCases.Tactics.Queries.GetTacticsByScope.DTOs.TacticScopeDto;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Tactics.Queries.GetTacticsByScope;

public record GetTacticsByScopeQuery(
    Guid ClubId,
    Guid? AgeGroupId = null,
    Guid? TeamId = null
) : IQuery<TacticsByScopeResponseDto>;

public class GetTacticsByScopeHandler : IRequestHandler<GetTacticsByScopeQuery, TacticsByScopeResponseDto>
{
    private readonly OurGameContext _db;

    public GetTacticsByScopeHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<TacticsByScopeResponseDto> Handle(GetTacticsByScopeQuery query, CancellationToken cancellationToken)
    {
        var scopeType = query.TeamId.HasValue ? "team"
                      : query.AgeGroupId.HasValue ? "agegroup"
                      : "club";

        var sql = @"
            SELECT
                f.Id,
                f.Name,
                f.Summary,
                f.Style,
                f.SquadSize,
                f.ParentFormationId,
                pf.Name as ParentFormationName,
                f.Tags,
                f.CreatedAt,
                f.UpdatedAt,
                CASE
                    WHEN ft.FormationId IS NOT NULL THEN 'team'
                    WHEN fag.FormationId IS NOT NULL THEN 'agegroup'
                    WHEN fc.FormationId IS NOT NULL THEN 'club'
                    ELSE 'unknown'
                END as ScopeType,
                fc.ClubId as ScopeClubId,
                fag.AgeGroupId as ScopeAgeGroupId,
                ft.TeamId as ScopeTeamId
            FROM Formations f
            LEFT JOIN Formations pf ON f.ParentFormationId = pf.Id
            LEFT JOIN FormationClubs fc ON f.Id = fc.FormationId AND fc.ClubId = {0}
            LEFT JOIN FormationAgeGroups fag ON f.Id = fag.FormationId AND fag.AgeGroupId = {1}
            LEFT JOIN FormationTeams ft ON f.Id = ft.FormationId AND ft.TeamId = {2}
            WHERE fc.FormationId IS NOT NULL OR fag.FormationId IS NOT NULL OR ft.FormationId IS NOT NULL";

        var tactics = await _db.Database
            .SqlQueryRaw<TacticRawDto>(sql,
                query.ClubId,
                query.AgeGroupId ?? Guid.Empty,
                query.TeamId ?? Guid.Empty)
            .ToListAsync(cancellationToken);

        if (tactics.Count == 0)
        {
            return new TacticsByScopeResponseDto();
        }

        // Batch-fetch base formation positions for all unique parent formations
        var parentFormationIds = tactics
            .Where(t => t.ParentFormationId.HasValue)
            .Select(t => t.ParentFormationId!.Value)
            .Distinct()
            .ToList();

        var basePositionsByFormation = new Dictionary<Guid, List<ScopeFormationPositionRaw>>();

        if (parentFormationIds.Count > 0)
        {
            var formationIdsParam = string.Join(",", parentFormationIds.Select(id => $"'{id}'"));
            var basePositionsSql = $@"
                SELECT fp.FormationId, fp.Id, fp.PositionIndex, fp.Position, fp.XCoord, fp.YCoord, fp.Direction
                FROM FormationPositions fp
                WHERE fp.FormationId IN ({formationIdsParam})
                ORDER BY fp.FormationId, fp.PositionIndex, fp.YCoord, fp.XCoord, fp.Position, fp.Id";

            var allBasePositions = await _db.Database
                .SqlQueryRaw<ScopeFormationPositionRaw>(basePositionsSql)
                .ToListAsync(cancellationToken);

            basePositionsByFormation = allBasePositions
                .GroupBy(p => p.FormationId)
                .ToDictionary(g => g.Key, g => g.ToList());
        }

        // Batch-fetch position overrides for all tactics
        var tacticIds = tactics.Select(t => t.Id).ToList();
        var tacticIdsParam = string.Join(",", tacticIds.Select(id => $"'{id}'"));
        var overridesSql = $@"
            SELECT po.FormationId as TacticId, po.PositionIndex, po.XCoord, po.YCoord, po.Direction
            FROM PositionOverrides po
            WHERE po.FormationId IN ({tacticIdsParam})";

        var allOverrides = await _db.Database
            .SqlQueryRaw<ScopeOverrideRaw>(overridesSql)
            .ToListAsync(cancellationToken);

        var overridesByTactic = allOverrides
            .GroupBy(o => o.TacticId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var scopeTactics = new List<TacticListDto>();
        var inheritedTactics = new List<TacticListDto>();

        foreach (var tactic in tactics)
        {
            var basePositions = tactic.ParentFormationId.HasValue &&
                                basePositionsByFormation.TryGetValue(tactic.ParentFormationId.Value, out var bp)
                ? bp : new List<ScopeFormationPositionRaw>();

            overridesByTactic.TryGetValue(tactic.Id, out var overrides);

            var resolvedPositions = ResolvePositions(basePositions, overrides ?? new(), tactic.ParentFormationId);

            var dto = MapToDto(tactic, resolvedPositions);

            var tacticScopeType = tactic.ScopeType?.ToLowerInvariant() ?? "unknown";

            bool isCurrentScope = scopeType switch
            {
                "club" => tacticScopeType == "club",
                "agegroup" => tacticScopeType == "agegroup",
                "team" => tacticScopeType == "team",
                _ => false
            };

            bool isInherited = scopeType switch
            {
                "club" => false,
                "agegroup" => tacticScopeType == "club",
                "team" => tacticScopeType == "club" || tacticScopeType == "agegroup",
                _ => false
            };

            if (isCurrentScope) scopeTactics.Add(dto);
            else if (isInherited) inheritedTactics.Add(dto);
        }

        return new TacticsByScopeResponseDto
        {
            ScopeTactics = scopeTactics.OrderBy(t => t.Name).ToList(),
            InheritedTactics = inheritedTactics.OrderBy(t => t.Name).ToList()
        };
    }

    private static List<ResolvedPositionDto> ResolvePositions(
        List<ScopeFormationPositionRaw> basePositions,
        List<ScopeOverrideRaw> overrides,
        Guid? sourceFormationId)
    {
        var resolved = basePositions.Select(p => new
        {
            PositionId = p.Id.ToString(),
            p.PositionIndex,
            Position = ((PlayerPosition)p.Position).ToString(),
            X = (double)(p.XCoord ?? 0),
            Y = (double)(p.YCoord ?? 0),
            Direction = p.Direction,
            SourceFormationId = sourceFormationId?.ToString()
        }).ToList();

        // Apply direct tactic overrides on top of the base positions
        var resolvedMutable = resolved.Select(p => new ResolvedEntry
        {
            PositionId = p.PositionId,
            PositionIndex = p.PositionIndex,
            Position = p.Position,
            X = p.X,
            Y = p.Y,
            Direction = p.Direction,
            SourceFormationId = p.SourceFormationId
        }).ToList();

        var byIndex = resolvedMutable.GroupBy(p => p.PositionIndex)
            .ToDictionary(g => g.Key, g => g.ToList());

        foreach (var ovr in overrides)
        {
            if (!byIndex.TryGetValue(ovr.PositionIndex, out var matches)) continue;
            foreach (var pos in matches)
            {
                if (ovr.XCoord.HasValue) pos.X = (double)ovr.XCoord.Value;
                if (ovr.YCoord.HasValue) pos.Y = (double)ovr.YCoord.Value;
                if (!string.IsNullOrWhiteSpace(ovr.Direction)) pos.Direction = ovr.Direction;
            }
        }

        return resolvedMutable
            .OrderBy(p => p.PositionIndex)
            .Select(p => new ResolvedPositionDto(
                PositionId: p.PositionId,
                PositionIndex: p.PositionIndex,
                Position: p.Position,
                X: p.X,
                Y: p.Y,
                Direction: p.Direction,
                SourceFormationId: p.SourceFormationId,
                OverriddenBy: null))
            .ToList();
    }

    private static List<string> ParseTags(string? raw) =>
        string.IsNullOrEmpty(raw)
            ? new List<string>()
            : raw.TrimStart().StartsWith('[')
                ? JsonSerializer.Deserialize<List<string>>(raw) ?? new List<string>()
                : raw.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(t => t.Trim()).ToList();

    private static TacticListDto MapToDto(TacticRawDto raw, List<ResolvedPositionDto> resolvedPositions)
    {
        return new TacticListDto
        {
            Id = raw.Id,
            Name = raw.Name ?? string.Empty,
            Summary = raw.Summary,
            Style = raw.Style,
            SquadSize = raw.SquadSize,
            ParentFormationId = raw.ParentFormationId,
            ParentFormationName = raw.ParentFormationName,
            Scope = new ScopeTacticScopeDto
            {
                Type = raw.ScopeType?.ToLowerInvariant() ?? "unknown",
                ClubId = raw.ScopeClubId,
                AgeGroupId = raw.ScopeAgeGroupId,
                TeamId = raw.ScopeTeamId
            },
            Tags = ParseTags(raw.Tags),
            ResolvedPositions = resolvedPositions,
            CreatedAt = raw.CreatedAt,
            UpdatedAt = raw.UpdatedAt
        };
    }
}

internal class ResolvedEntry
{
    public string PositionId { get; set; } = string.Empty;
    public int PositionIndex { get; set; }
    public string Position { get; set; } = string.Empty;
    public double X { get; set; }
    public double Y { get; set; }
    public string? Direction { get; set; }
    public string? SourceFormationId { get; set; }
}

public class TacticRawDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Summary { get; set; }
    public string? Style { get; set; }
    public int SquadSize { get; set; }
    public Guid? ParentFormationId { get; set; }
    public string? ParentFormationName { get; set; }
    public string? ScopeType { get; set; }
    public Guid? ScopeClubId { get; set; }
    public Guid? ScopeAgeGroupId { get; set; }
    public Guid? ScopeTeamId { get; set; }
    public string? Tags { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ScopeFormationPositionRaw
{
    public Guid FormationId { get; set; }
    public Guid Id { get; set; }
    public int PositionIndex { get; set; }
    public int Position { get; set; }
    public decimal? XCoord { get; set; }
    public decimal? YCoord { get; set; }
    public string? Direction { get; set; }
}

public class ScopeOverrideRaw
{
    public Guid TacticId { get; set; }
    public int PositionIndex { get; set; }
    public decimal? XCoord { get; set; }
    public decimal? YCoord { get; set; }
    public string? Direction { get; set; }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticsByScope.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Tactics.Queries.GetTacticsByScope;

/// <summary>
/// Query to get tactics by scope (club, age group, or team level)
/// </summary>
public record GetTacticsByScopeQuery(
    Guid ClubId,
    Guid? AgeGroupId = null,
    Guid? TeamId = null
) : IQuery<TacticsByScopeResponseDto>;

/// <summary>
/// Handler for GetTacticsByScopeQuery
/// </summary>
public class GetTacticsByScopeHandler : IRequestHandler<GetTacticsByScopeQuery, TacticsByScopeResponseDto>
{
    private readonly OurGameContext _db;

    public GetTacticsByScopeHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<TacticsByScopeResponseDto> Handle(GetTacticsByScopeQuery query, CancellationToken cancellationToken)
    {
        // Determine the scope type based on provided IDs
        var scopeType = query.TeamId.HasValue ? "team"
                      : query.AgeGroupId.HasValue ? "agegroup"
                      : "club";

        // SQL to get tactics accessible at this scope via link tables
        // For club scope: get tactics linked to this club
        // For age group scope: get tactics linked to this club OR this age group
        // For team scope: get tactics linked to this club OR the age group OR this team
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

        var scopeTactics = new List<TacticListDto>();
        var inheritedTactics = new List<TacticListDto>();

        foreach (var tactic in tactics)
        {
            var dto = MapToDto(tactic);
            
            // Determine the most specific scope this tactic is linked to
            var tacticScopeType = tactic.ScopeType?.ToLowerInvariant() ?? "unknown";
            
            // Determine if this tactic is at the current scope or inherited
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

            if (isCurrentScope)
            {
                scopeTactics.Add(dto);
            }
            else if (isInherited)
            {
                inheritedTactics.Add(dto);
            }
        }

        return new TacticsByScopeResponseDto
        {
            ScopeTactics = scopeTactics.OrderBy(t => t.Name).ToList(),
            InheritedTactics = inheritedTactics.OrderBy(t => t.Name).ToList()
        };
    }

    private static TacticListDto MapToDto(TacticRawDto raw)
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
            Scope = new TacticScopeDto
            {
                Type = raw.ScopeType?.ToLowerInvariant() ?? "unknown",
                ClubId = raw.ScopeClubId,
                AgeGroupId = raw.ScopeAgeGroupId,
                TeamId = raw.ScopeTeamId
            },
            Tags = !string.IsNullOrEmpty(raw.Tags)
                ? raw.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(t => t.Trim())
                    .ToList()
                : new List<string>(),
            CreatedAt = raw.CreatedAt,
            UpdatedAt = raw.UpdatedAt
        };
    }
}

/// <summary>
/// Raw DTO for SQL query result
/// </summary>
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

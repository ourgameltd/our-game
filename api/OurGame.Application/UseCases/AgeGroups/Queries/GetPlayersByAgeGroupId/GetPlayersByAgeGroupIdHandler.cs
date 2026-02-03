using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.AgeGroups.Queries.GetPlayersByAgeGroupId.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.AgeGroups.Queries.GetPlayersByAgeGroupId;

/// <summary>
/// Query to get all players for a specific age group
/// </summary>
public record GetPlayersByAgeGroupIdQuery(Guid AgeGroupId, bool IncludeArchived = false) : IQuery<List<AgeGroupPlayerDto>>;

/// <summary>
/// Handler for GetPlayersByAgeGroupIdQuery
/// </summary>
public class GetPlayersByAgeGroupIdHandler : IRequestHandler<GetPlayersByAgeGroupIdQuery, List<AgeGroupPlayerDto>>
{
    private readonly OurGameContext _db;

    public GetPlayersByAgeGroupIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<AgeGroupPlayerDto>> Handle(GetPlayersByAgeGroupIdQuery query, CancellationToken cancellationToken)
    {
        // Get all players for the age group
        var sql = query.IncludeArchived
            ? @"
                SELECT 
                    p.Id,
                    p.ClubId,
                    p.FirstName,
                    p.LastName,
                    p.Nickname,
                    p.DateOfBirth,
                    p.Photo,
                    p.AssociationId,
                    p.PreferredPositions,
                    p.OverallRating,
                    p.IsArchived
                FROM Players p
                INNER JOIN PlayerAgeGroups pag ON p.Id = pag.PlayerId
                WHERE pag.AgeGroupId = {0}
                ORDER BY p.FirstName, p.LastName"
            : @"
                SELECT 
                    p.Id,
                    p.ClubId,
                    p.FirstName,
                    p.LastName,
                    p.Nickname,
                    p.DateOfBirth,
                    p.Photo,
                    p.AssociationId,
                    p.PreferredPositions,
                    p.OverallRating,
                    p.IsArchived
                FROM Players p
                INNER JOIN PlayerAgeGroups pag ON p.Id = pag.PlayerId
                WHERE pag.AgeGroupId = {0} AND p.IsArchived = 0
                ORDER BY p.FirstName, p.LastName";

        var playerData = await _db.Database
            .SqlQueryRaw<PlayerRawDto>(sql, query.AgeGroupId)
            .ToListAsync(cancellationToken);

        if (playerData.Count == 0)
        {
            return new List<AgeGroupPlayerDto>();
        }

        // Get player IDs for fetching related data
        var playerIds = playerData.Select(p => p.Id).ToList();

        // Build parameterized query for related data
        var parameters = playerIds.Select((id, index) =>
            new Microsoft.Data.SqlClient.SqlParameter($"@p{index}", id)).ToArray();
        var parameterNames = string.Join(", ", parameters.Select(p => p.ParameterName));

        // Get player attributes
        var attributesSql = $@"
            SELECT 
                pa.PlayerId,
                pa.BallControl,
                pa.Crossing,
                pa.WeakFoot,
                pa.Dribbling,
                pa.Finishing,
                pa.FreeKick,
                pa.Heading,
                pa.LongPassing,
                pa.LongShot,
                pa.Penalties,
                pa.ShortPassing,
                pa.ShotPower,
                pa.SlidingTackle,
                pa.StandingTackle,
                pa.Volleys,
                pa.Acceleration,
                pa.Agility,
                pa.Balance,
                pa.Jumping,
                pa.Pace,
                pa.Reactions,
                pa.SprintSpeed,
                pa.Stamina,
                pa.Strength,
                pa.Aggression,
                pa.AttackingPosition,
                pa.Awareness,
                pa.Communication,
                pa.Composure,
                pa.DefensivePositioning,
                pa.Interceptions,
                pa.Marking,
                pa.Positivity,
                pa.Positioning,
                pa.Vision
            FROM PlayerAttributes pa
            WHERE pa.PlayerId IN ({parameterNames})";

        var attributesData = await _db.Database
            .SqlQueryRaw<PlayerAttributeRawDto>(attributesSql, parameters)
            .ToListAsync(cancellationToken);

        // Get evaluations
        var evaluationsSql = $@"
            SELECT 
                ae.Id,
                ae.PlayerId,
                ae.EvaluatedBy,
                ae.EvaluatedAt,
                ae.OverallRating,
                ae.CoachNotes,
                ae.PeriodStart,
                ae.PeriodEnd
            FROM AttributeEvaluations ae
            WHERE ae.PlayerId IN ({parameterNames})
            ORDER BY ae.EvaluatedAt DESC";

        var evaluationsData = await _db.Database
            .SqlQueryRaw<EvaluationRawDto>(evaluationsSql, parameters)
            .ToListAsync(cancellationToken);

        // Get evaluation attributes
        var evaluationIds = evaluationsData.Select(e => e.Id).Distinct().ToList();
        
        Dictionary<Guid, List<EvaluationAttributeRawDto>> evaluationAttributesDict = new();
        
        if (evaluationIds.Any())
        {
            var evalParameters = evaluationIds.Select((id, index) =>
                new Microsoft.Data.SqlClient.SqlParameter($"@e{index}", id)).ToArray();
            var evalParameterNames = string.Join(", ", evalParameters.Select(p => p.ParameterName));

            var evaluationAttributesSql = $@"
                SELECT 
                    ea.EvaluationId,
                    ea.AttributeName,
                    ea.Rating,
                    ea.Notes
                FROM EvaluationAttributes ea
                WHERE ea.EvaluationId IN ({evalParameterNames})
                ORDER BY ea.AttributeName";

            var evaluationAttributesData = await _db.Database
                .SqlQueryRaw<EvaluationAttributeRawDto>(evaluationAttributesSql, evalParameters)
                .ToListAsync(cancellationToken);

            evaluationAttributesDict = evaluationAttributesData
                .GroupBy(ea => ea.EvaluationId)
                .ToDictionary(g => g.Key, g => g.ToList());
        }

        // Get age groups for players
        var ageGroupSql = $@"
            SELECT 
                pag.PlayerId,
                pag.AgeGroupId
            FROM PlayerAgeGroups pag
            WHERE pag.PlayerId IN ({parameterNames})";

        var ageGroupData = await _db.Database
            .SqlQueryRaw<PlayerAgeGroupRawDto>(ageGroupSql, parameters)
            .ToListAsync(cancellationToken);

        // Get teams for players
        var teamSql = $@"
            SELECT 
                pt.PlayerId,
                pt.TeamId
            FROM PlayerTeams pt
            WHERE pt.PlayerId IN ({parameterNames})";

        var teamData = await _db.Database
            .SqlQueryRaw<PlayerTeamRawDto>(teamSql, parameters)
            .ToListAsync(cancellationToken);

        // Get parents for players
        var parentSql = $@"
            SELECT 
                pp.PlayerId,
                pp.ParentUserId
            FROM PlayerParents pp
            WHERE pp.PlayerId IN ({parameterNames})";

        var parentData = await _db.Database
            .SqlQueryRaw<PlayerParentRawDto>(parentSql, parameters)
            .ToListAsync(cancellationToken);

        // Group related data by player
        var attributesByPlayer = attributesData
            .ToDictionary(a => a.PlayerId);

        var evaluationsByPlayer = evaluationsData
            .GroupBy(e => e.PlayerId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var ageGroupsByPlayer = ageGroupData
            .GroupBy(ag => ag.PlayerId)
            .ToDictionary(g => g.Key, g => g.Select(ag => ag.AgeGroupId).ToList());

        var teamsByPlayer = teamData
            .GroupBy(t => t.PlayerId)
            .ToDictionary(g => g.Key, g => g.Select(t => t.TeamId).ToList());

        var parentsByPlayer = parentData
            .GroupBy(p => p.PlayerId)
            .ToDictionary(g => g.Key, g => g.Select(p => p.ParentUserId).ToList());

        // Map to DTOs
        return playerData
            .Select(p => new AgeGroupPlayerDto
            {
                Id = p.Id,
                ClubId = p.ClubId,
                FirstName = p.FirstName ?? string.Empty,
                LastName = p.LastName ?? string.Empty,
                Nickname = p.Nickname,
                DateOfBirth = p.DateOfBirth,
                Photo = p.Photo,
                AssociationId = p.AssociationId,
                PreferredPositions = ParsePositions(p.PreferredPositions),
                Attributes = attributesByPlayer.TryGetValue(p.Id, out var attrs)
                    ? MapAttributes(attrs)
                    : new AgeGroupPlayerAttributesDto(),
                OverallRating = p.OverallRating,
                Evaluations = evaluationsByPlayer.TryGetValue(p.Id, out var evals)
                    ? evals.Select(e => new AgeGroupPlayerEvaluationDto
                    {
                        Id = e.Id,
                        PlayerId = e.PlayerId,
                        EvaluatedBy = e.EvaluatedBy,
                        EvaluatedAt = e.EvaluatedAt,
                        OverallRating = e.OverallRating,
                        CoachNotes = e.CoachNotes,
                        PeriodStart = e.PeriodStart,
                        PeriodEnd = e.PeriodEnd,
                        Attributes = evaluationAttributesDict.TryGetValue(e.Id, out var evalAttrs)
                            ? evalAttrs.Select(ea => new AgeGroupEvaluationAttributeDto
                            {
                                AttributeName = ea.AttributeName ?? string.Empty,
                                Rating = ea.Rating,
                                Notes = ea.Notes
                            }).ToList()
                            : new List<AgeGroupEvaluationAttributeDto>()
                    }).ToList()
                    : new List<AgeGroupPlayerEvaluationDto>(),
                AgeGroupIds = ageGroupsByPlayer.TryGetValue(p.Id, out var ageGroups)
                    ? ageGroups
                    : new List<Guid>(),
                TeamIds = teamsByPlayer.TryGetValue(p.Id, out var teams)
                    ? teams
                    : new List<Guid>(),
                ParentIds = parentsByPlayer.TryGetValue(p.Id, out var parents)
                    ? parents
                    : new List<Guid>(),
                IsArchived = p.IsArchived
            })
            .ToList();
    }

    private static List<string> ParsePositions(string? positions)
    {
        if (string.IsNullOrWhiteSpace(positions))
            return new List<string>();

        // Database stores positions as JSON array: ["CAM","CM"]
        try
        {
            var result = System.Text.Json.JsonSerializer.Deserialize<List<string>>(positions);
            return result ?? new List<string>();
        }
        catch (System.Text.Json.JsonException)
        {
            // Fallback: treat as comma-separated string for legacy data
            return positions
                .Split(new[] { ',', '|', ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(p => p.Trim())
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .ToList();
        }
    }

    private static AgeGroupPlayerAttributesDto MapAttributes(PlayerAttributeRawDto attrs)
    {
        return new AgeGroupPlayerAttributesDto
        {
            BallControl = attrs.BallControl,
            Crossing = attrs.Crossing,
            WeakFoot = attrs.WeakFoot,
            Dribbling = attrs.Dribbling,
            Finishing = attrs.Finishing,
            FreeKick = attrs.FreeKick,
            Heading = attrs.Heading,
            LongPassing = attrs.LongPassing,
            LongShot = attrs.LongShot,
            Penalties = attrs.Penalties,
            ShortPassing = attrs.ShortPassing,
            ShotPower = attrs.ShotPower,
            SlidingTackle = attrs.SlidingTackle,
            StandingTackle = attrs.StandingTackle,
            Volleys = attrs.Volleys,
            Acceleration = attrs.Acceleration,
            Agility = attrs.Agility,
            Balance = attrs.Balance,
            Jumping = attrs.Jumping,
            Pace = attrs.Pace,
            Reactions = attrs.Reactions,
            SprintSpeed = attrs.SprintSpeed,
            Stamina = attrs.Stamina,
            Strength = attrs.Strength,
            Aggression = attrs.Aggression,
            AttackingPosition = attrs.AttackingPosition,
            Awareness = attrs.Awareness,
            Communication = attrs.Communication,
            Composure = attrs.Composure,
            DefensivePositioning = attrs.DefensivePositioning,
            Interceptions = attrs.Interceptions,
            Marking = attrs.Marking,
            Positivity = attrs.Positivity,
            Positioning = attrs.Positioning,
            Vision = attrs.Vision
        };
    }
}

/// <summary>
/// DTO for raw SQL player query result
/// </summary>
class PlayerRawDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Nickname { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Photo { get; set; }
    public string? AssociationId { get; set; }
    public string? PreferredPositions { get; set; }
    public int? OverallRating { get; set; }
    public bool IsArchived { get; set; }
}

/// <summary>
/// DTO for raw SQL player attributes query result
/// </summary>
class PlayerAttributeRawDto
{
    public Guid PlayerId { get; set; }
    public int? BallControl { get; set; }
    public int? Crossing { get; set; }
    public int? WeakFoot { get; set; }
    public int? Dribbling { get; set; }
    public int? Finishing { get; set; }
    public int? FreeKick { get; set; }
    public int? Heading { get; set; }
    public int? LongPassing { get; set; }
    public int? LongShot { get; set; }
    public int? Penalties { get; set; }
    public int? ShortPassing { get; set; }
    public int? ShotPower { get; set; }
    public int? SlidingTackle { get; set; }
    public int? StandingTackle { get; set; }
    public int? Volleys { get; set; }
    public int? Acceleration { get; set; }
    public int? Agility { get; set; }
    public int? Balance { get; set; }
    public int? Jumping { get; set; }
    public int? Pace { get; set; }
    public int? Reactions { get; set; }
    public int? SprintSpeed { get; set; }
    public int? Stamina { get; set; }
    public int? Strength { get; set; }
    public int? Aggression { get; set; }
    public int? AttackingPosition { get; set; }
    public int? Awareness { get; set; }
    public int? Communication { get; set; }
    public int? Composure { get; set; }
    public int? DefensivePositioning { get; set; }
    public int? Interceptions { get; set; }
    public int? Marking { get; set; }
    public int? Positivity { get; set; }
    public int? Positioning { get; set; }
    public int? Vision { get; set; }
}

/// <summary>
/// DTO for raw SQL evaluation query result
/// </summary>
class EvaluationRawDto
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public Guid EvaluatedBy { get; set; }
    public DateTime EvaluatedAt { get; set; }
    public int? OverallRating { get; set; }
    public string? CoachNotes { get; set; }
    public DateOnly? PeriodStart { get; set; }
    public DateOnly? PeriodEnd { get; set; }
}

/// <summary>
/// DTO for raw SQL evaluation attribute query result
/// </summary>
class EvaluationAttributeRawDto
{
    public Guid EvaluationId { get; set; }
    public string? AttributeName { get; set; }
    public int? Rating { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for raw SQL age group query result
/// </summary>
class PlayerAgeGroupRawDto
{
    public Guid PlayerId { get; set; }
    public Guid AgeGroupId { get; set; }
}

/// <summary>
/// DTO for raw SQL team query result
/// </summary>
class PlayerTeamRawDto
{
    public Guid PlayerId { get; set; }
    public Guid TeamId { get; set; }
}

/// <summary>
/// DTO for raw SQL parent query result
/// </summary>
class PlayerParentRawDto
{
    public Guid PlayerId { get; set; }
    public Guid ParentUserId { get; set; }
}

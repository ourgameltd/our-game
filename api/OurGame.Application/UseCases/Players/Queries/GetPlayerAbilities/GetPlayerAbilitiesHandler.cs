using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAbilities.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Queries.GetPlayerAbilities;

/// <summary>
/// Query to get player abilities including current attributes and evaluation history
/// </summary>
public record GetPlayerAbilitiesQuery(Guid PlayerId, string AzureUserId) : IQuery<PlayerAbilitiesDto?>;

/// <summary>
/// Handler for GetPlayerAbilitiesQuery.
/// Returns comprehensive player ability data including EA FC-style attributes and coach evaluations.
/// </summary>
public class GetPlayerAbilitiesHandler : IRequestHandler<GetPlayerAbilitiesQuery, PlayerAbilitiesDto?>
{
    private readonly OurGameContext _db;

    public GetPlayerAbilitiesHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<PlayerAbilitiesDto?> Handle(GetPlayerAbilitiesQuery query, CancellationToken cancellationToken)
    {
        // 1. Fetch base player data
        var playerSql = @"
            SELECT 
                p.Id,
                p.FirstName,
                p.LastName,
                p.Photo,
                p.PreferredPositions,
                p.ClubId,
                p.OverallRating
            FROM Players p
            WHERE p.Id = {0}";

        var player = await _db.Database
            .SqlQueryRaw<PlayerBaseRawDto>(playerSql, query.PlayerId)
            .FirstOrDefaultAsync(cancellationToken);

        if (player == null)
        {
            return null;
        }

        // 2. Fetch player attributes
        var attributesSql = @"
            SELECT 
                BallControl,
                Crossing,
                WeakFoot,
                Dribbling,
                Finishing,
                FreeKick,
                Heading,
                LongPassing,
                LongShot,
                Penalties,
                ShortPassing,
                ShotPower,
                SlidingTackle,
                StandingTackle,
                Volleys,
                Acceleration,
                Agility,
                Balance,
                Jumping,
                Pace,
                Reactions,
                SprintSpeed,
                Stamina,
                Strength,
                Aggression,
                AttackingPosition,
                Awareness,
                Communication,
                Composure,
                DefensivePositioning,
                Interceptions,
                Marking,
                Positivity,
                Positioning,
                Vision,
                UpdatedAt
            FROM PlayerAttributes
            WHERE PlayerId = {0}";

        var attributes = await _db.Database
            .SqlQueryRaw<PlayerAttributesRawDto>(attributesSql, query.PlayerId)
            .FirstOrDefaultAsync(cancellationToken);

        // 4. Fetch last 12 evaluations
        var evaluationsSql = @"
            SELECT TOP 12
                ae.Id,
                ae.EvaluatedBy,
                CONCAT(c.FirstName, ' ', c.LastName) AS CoachName,
                ae.EvaluatedAt,
                ae.OverallRating,
                ae.CoachNotes,
                ae.PeriodStart,
                ae.PeriodEnd
            FROM AttributeEvaluations ae
            INNER JOIN Coaches c ON c.Id = ae.EvaluatedBy
            WHERE ae.PlayerId = {0}
            ORDER BY ae.EvaluatedAt DESC";

        var evaluations = await _db.Database
            .SqlQueryRaw<EvaluationRawDto>(evaluationsSql, query.PlayerId)
            .ToListAsync(cancellationToken);

        // 5. Fetch evaluation attributes if we have evaluations
        List<EvaluationAttributeRawDto> evaluationAttributes = new();
        if (evaluations.Any())
        {
            var evaluationIds = evaluations.Select(e => e.Id).ToArray();
            var attributesSqlParams = string.Join(",", evaluationIds.Select((_, i) => $"{{{i}}}"));
            var evaluationAttributesSql = $@"
                SELECT 
                    ea.EvaluationId,
                    ea.AttributeName,
                    ea.Rating,
                    ea.Notes
                FROM EvaluationAttributes ea
                WHERE ea.EvaluationId IN ({attributesSqlParams})";

            evaluationAttributes = await _db.Database
                .SqlQueryRaw<EvaluationAttributeRawDto>(
                    evaluationAttributesSql, 
                    evaluationIds.Cast<object>().ToArray())
                .ToListAsync(cancellationToken);
        }

        // 6. Map to DTOs
        var attributesDto = attributes != null ? new PlayerAttributesDto
        {
            BallControl = attributes.BallControl ?? 0,
            Crossing = attributes.Crossing ?? 0,
            WeakFoot = attributes.WeakFoot ?? 0,
            Dribbling = attributes.Dribbling ?? 0,
            Finishing = attributes.Finishing ?? 0,
            FreeKick = attributes.FreeKick ?? 0,
            Heading = attributes.Heading ?? 0,
            LongPassing = attributes.LongPassing ?? 0,
            LongShot = attributes.LongShot ?? 0,
            Penalties = attributes.Penalties ?? 0,
            ShortPassing = attributes.ShortPassing ?? 0,
            ShotPower = attributes.ShotPower ?? 0,
            SlidingTackle = attributes.SlidingTackle ?? 0,
            StandingTackle = attributes.StandingTackle ?? 0,
            Volleys = attributes.Volleys ?? 0,
            Acceleration = attributes.Acceleration ?? 0,
            Agility = attributes.Agility ?? 0,
            Balance = attributes.Balance ?? 0,
            Jumping = attributes.Jumping ?? 0,
            Pace = attributes.Pace ?? 0,
            Reactions = attributes.Reactions ?? 0,
            SprintSpeed = attributes.SprintSpeed ?? 0,
            Stamina = attributes.Stamina ?? 0,
            Strength = attributes.Strength ?? 0,
            Aggression = attributes.Aggression ?? 0,
            AttackingPosition = attributes.AttackingPosition ?? 0,
            Awareness = attributes.Awareness ?? 0,
            Communication = attributes.Communication ?? 0,
            Composure = attributes.Composure ?? 0,
            DefensivePositioning = attributes.DefensivePositioning ?? 0,
            Interceptions = attributes.Interceptions ?? 0,
            Marking = attributes.Marking ?? 0,
            Positivity = attributes.Positivity ?? 0,
            Positioning = attributes.Positioning ?? 0,
            Vision = attributes.Vision ?? 0,
            UpdatedAt = attributes.UpdatedAt
        } : null;

        var evaluationDtos = evaluations.Select(e => new PlayerAbilityEvaluationDto
        {
            Id = e.Id,
            EvaluatedBy = e.EvaluatedBy,
            CoachName = e.CoachName,
            EvaluatedAt = e.EvaluatedAt,
            OverallRating = e.OverallRating,
            CoachNotes = e.CoachNotes,
            PeriodStart = e.PeriodStart,
            PeriodEnd = e.PeriodEnd,
            Attributes = evaluationAttributes
                .Where(ea => ea.EvaluationId == e.Id)
                .Select(ea => new EvaluationAttributeDto
                {
                    AttributeName = ea.AttributeName ?? string.Empty,
                    Rating = ea.Rating,
                    Notes = ea.Notes
                })
                .ToList()
        }).ToList();

        return new PlayerAbilitiesDto
        {
            Id = player.Id,
            FirstName = player.FirstName ?? string.Empty,
            LastName = player.LastName ?? string.Empty,
            Photo = player.Photo,
            PreferredPositions = player.PreferredPositions,
            ClubId = player.ClubId,
            OverallRating = player.OverallRating,
            Attributes = attributesDto,
            Evaluations = evaluationDtos
        };
    }
}

/// <summary>
/// Raw SQL result for base player data
/// </summary>
public class PlayerBaseRawDto
{
    public Guid Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Photo { get; set; }
    public string? PreferredPositions { get; set; }
    public Guid ClubId { get; set; }
    public int? OverallRating { get; set; }
}

/// <summary>
/// Raw SQL result for player attributes
/// </summary>
public class PlayerAttributesRawDto
{
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
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Raw SQL result for evaluation data
/// </summary>
public class EvaluationRawDto
{
    public Guid Id { get; set; }
    public Guid EvaluatedBy { get; set; }
    public string? CoachName { get; set; }
    public DateTime EvaluatedAt { get; set; }
    public int? OverallRating { get; set; }
    public string? CoachNotes { get; set; }
    public DateOnly? PeriodStart { get; set; }
    public DateOnly? PeriodEnd { get; set; }
}

/// <summary>
/// Raw SQL result for evaluation attributes
/// </summary>
public class EvaluationAttributeRawDto
{
    public Guid EvaluationId { get; set; }
    public string? AttributeName { get; set; }
    public int? Rating { get; set; }
    public string? Notes { get; set; }
}

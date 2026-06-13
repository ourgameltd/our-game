using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.Services.CompetencyCalculation;

public class CompetencyCalculationService : ICompetencyCalculationService
{
    private readonly OurGameContext _db;

    public CompetencyCalculationService(OurGameContext db)
    {
        _db = db;
    }

    public async Task<CompetencyFrameworkSnapshot?> ResolveFrameworkForTeamAsync(Guid teamId, CancellationToken cancellationToken = default)
    {
        var team = await _db.Teams
            .Where(t => t.Id == teamId)
            .Select(t => new { t.Id, t.AgeGroupId, t.ClubId })
            .FirstOrDefaultAsync(cancellationToken);

        if (team is null) return null;

        // team -> age-group -> club
        var assignment = await _db.CompetencyFrameworkAssignments
            .Where(a => a.TeamId == teamId)
            .FirstOrDefaultAsync(cancellationToken)
            ?? await _db.CompetencyFrameworkAssignments
                .Where(a => a.AgeGroupId == team.AgeGroupId)
                .FirstOrDefaultAsync(cancellationToken)
            ?? await _db.CompetencyFrameworkAssignments
                .Where(a => a.ClubId == team.ClubId)
                .FirstOrDefaultAsync(cancellationToken);

        if (assignment is null) return null;
        return await LoadFrameworkAsync(assignment.FrameworkId, cancellationToken);
    }

    public async Task<CompetencyFrameworkSnapshot?> LoadFrameworkAsync(Guid frameworkId, CancellationToken cancellationToken = default)
    {
        var framework = await _db.CompetencyFrameworks
            .Where(f => f.Id == frameworkId && !f.IsArchived)
            .FirstOrDefaultAsync(cancellationToken);
        if (framework is null) return null;

        var thresholds = await _db.CompetencyFrameworkBandThresholds
            .Where(t => t.FrameworkId == frameworkId)
            .ToListAsync(cancellationToken);

        var weights = await _db.CompetencyFrameworkAttributeWeights
            .Where(w => w.FrameworkId == frameworkId)
            .Select(w => new { w.AttributeId, w.Format, w.WeightPercent, w.IsGoalkeeper })
            .ToListAsync(cancellationToken);

        return new CompetencyFrameworkSnapshot
        {
            Id = framework.Id,
            Name = framework.Name ?? string.Empty,
            UpliftPercent = framework.UpliftPercent,
            BandThresholds = thresholds.ToDictionary(t => t.Band, t => t.Threshold),
            AttributeWeights = weights
                .Where(w => !w.IsGoalkeeper)
                .ToDictionary(w => (w.AttributeId, w.Format), w => w.WeightPercent),
            GoalkeeperAttributeWeights = weights
                .Where(w => w.IsGoalkeeper)
                .ToDictionary(w => (w.AttributeId, w.Format), w => w.WeightPercent),
        };
    }

    public CompetencyScoreResult Preview(
        IReadOnlyDictionary<Guid, CompetencyBand> competencyLevels,
        CompetencyFrameworkSnapshot framework,
        GameFormat format,
        bool isGoalkeeper = false)
    {
        var mappings = _db.CompetencyAttributes
            .AsNoTracking()
            .Select(a => new AttributeCompetencyMapping(a.Id, a.CompetencyId))
            .ToList();
        return CompetencyScoreCalculator.Calculate(competencyLevels, mappings, framework, format, isGoalkeeper);
    }

    public async Task RecalculatePlayerScoresAsync(Guid playerId, CancellationToken cancellationToken = default)
    {
        var player = await _db.Players.FirstOrDefaultAsync(p => p.Id == playerId, cancellationToken);
        if (player is null) return;

        var isGoalkeeper = GoalkeeperDetection.IsGoalkeeper(player.PreferredPositions);

        var levels = await _db.PlayerCompetencyLevels
            .Where(l => l.PlayerId == playerId)
            .ToDictionaryAsync(l => l.CompetencyId, l => l.Band, cancellationToken);

        var mappings = await _db.CompetencyAttributes
            .AsNoTracking()
            .Select(a => new AttributeCompetencyMapping(a.Id, a.CompetencyId))
            .ToListAsync(cancellationToken);

        var memberships = await _db.PlayerTeams
            .Where(pt => pt.PlayerId == playerId)
            .Select(pt => new { pt.TeamId, pt.AssignedAt })
            .OrderBy(pt => pt.AssignedAt)
            .ToListAsync(cancellationToken);

        // Drop existing per-team scores; we'll rewrite them.
        var existing = await _db.PlayerTeamScores
            .Where(s => s.PlayerId == playerId)
            .ToListAsync(cancellationToken);
        if (existing.Count > 0) _db.PlayerTeamScores.RemoveRange(existing);

        CompetencyScoreResult? primaryResult = null;
        Guid? primaryFrameworkId = null;

        for (int i = 0; i < memberships.Count; i++)
        {
            var teamId = memberships[i].TeamId;
            var team = await _db.Teams
                .Where(t => t.Id == teamId)
                .Select(t => new { t.Id, t.AgeGroup.DefaultSquadSize })
                .FirstOrDefaultAsync(cancellationToken);
            if (team is null) continue;

            var format = GameFormatMapping.FromSquadSize(team.DefaultSquadSize);
            var framework = await ResolveFrameworkForTeamAsync(teamId, cancellationToken);
            if (framework is null) continue;

            var result = CompetencyScoreCalculator.Calculate(levels, mappings, framework, format, isGoalkeeper);

            _db.PlayerTeamScores.Add(new PlayerTeamScore
            {
                Id = Guid.NewGuid(),
                PlayerId = playerId,
                TeamId = teamId,
                FrameworkId = framework.Id,
                Format = format,
                BaseScore = result.BaseScore,
                BoostedScore = result.BoostedScore,
                Band = result.Band,
                DerivedAttributesJson = JsonSerializer.Serialize(result.DerivedAttributeValues),
                CalculatedAt = DateTime.UtcNow,
            });

            if (i == 0)
            {
                primaryResult = result;
                primaryFrameworkId = framework.Id;
            }
        }

        if (primaryResult is not null)
        {
            player.OverallRating = (int)decimal.Round(primaryResult.BoostedScore);
            player.OverallBand = primaryResult.Band;

            await RewriteDerivedAttributeCacheAsync(playerId, primaryResult.DerivedAttributeValues, cancellationToken);
        }

        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task RecalculateTeamAsync(Guid teamId, CancellationToken cancellationToken = default)
    {
        var playerIds = await _db.PlayerTeams
            .Where(pt => pt.TeamId == teamId)
            .Select(pt => pt.PlayerId)
            .Distinct()
            .ToListAsync(cancellationToken);

        foreach (var id in playerIds)
        {
            await RecalculatePlayerScoresAsync(id, cancellationToken);
        }
    }

    public async Task RecalculateAgeGroupAsync(Guid ageGroupId, CancellationToken cancellationToken = default)
    {
        var playerIds = await _db.PlayerTeams
            .Where(pt => pt.Team.AgeGroupId == ageGroupId)
            .Select(pt => pt.PlayerId)
            .Distinct()
            .ToListAsync(cancellationToken);

        foreach (var id in playerIds)
        {
            await RecalculatePlayerScoresAsync(id, cancellationToken);
        }
    }

    public async Task RecalculateClubAsync(Guid clubId, CancellationToken cancellationToken = default)
    {
        var playerIds = await _db.Players
            .Where(p => p.ClubId == clubId && !p.IsArchived)
            .Select(p => p.Id)
            .ToListAsync(cancellationToken);

        foreach (var id in playerIds)
        {
            await RecalculatePlayerScoresAsync(id, cancellationToken);
        }
    }

    private async Task RewriteDerivedAttributeCacheAsync(
        Guid playerId,
        IReadOnlyDictionary<Guid, int> derivedByAttributeId,
        CancellationToken cancellationToken)
    {
        var nameByAttributeId = await _db.CompetencyAttributes
            .AsNoTracking()
            .ToDictionaryAsync(a => a.Id, a => a.Name, cancellationToken);

        var byName = derivedByAttributeId
            .Where(kv => nameByAttributeId.TryGetValue(kv.Key, out _))
            .ToDictionary(kv => nameByAttributeId[kv.Key], kv => kv.Value);

        var row = await _db.PlayerAttributes.FirstOrDefaultAsync(a => a.PlayerId == playerId, cancellationToken);
        if (row is null)
        {
            row = new PlayerAttribute { Id = Guid.NewGuid(), PlayerId = playerId };
            _db.PlayerAttributes.Add(row);
        }

        int? Val(string name) => byName.TryGetValue(name, out var v) ? v : (int?)null;

        row.BallControl = Val("Ball Control");
        row.Crossing = Val("Crossing");
        row.WeakFoot = Val("Weak Foot");
        row.Dribbling = Val("Dribbling");
        row.Finishing = Val("Finishing");
        row.FreeKick = Val("Free Kick");
        row.Heading = Val("Heading");
        row.LongPassing = Val("Long Passing");
        row.LongShot = Val("Long Shot");
        row.Penalties = Val("Penalties");
        row.ShortPassing = Val("Short Passing");
        row.ShotPower = Val("Shot Power");
        row.SlidingTackle = Val("Sliding Tackle");
        row.StandingTackle = Val("Standing Tackle");
        row.Volleys = Val("Volleys");
        row.Acceleration = Val("Acceleration");
        row.Agility = Val("Agility");
        row.Balance = Val("Balance");
        row.Jumping = Val("Jumping");
        row.Pace = Val("Pace");
        row.Reactions = Val("Reactions");
        row.SprintSpeed = Val("Sprint Speed");
        row.Stamina = Val("Stamina");
        row.Strength = Val("Strength");
        row.Aggression = Val("Aggression");
        row.AttackingPosition = Val("Attacking Position");
        row.Awareness = Val("Awareness");
        row.Communication = Val("Communication");
        row.Composure = Val("Composure");
        row.DefensivePositioning = Val("Defensive Positioning");
        row.Interceptions = Val("Interceptions");
        row.Marking = Val("Marking");
        row.Positivity = Val("Positivity");
        row.Positioning = Val("Positioning");
        row.Vision = Val("Vision");
        row.UpdatedAt = DateTime.UtcNow;
    }
}

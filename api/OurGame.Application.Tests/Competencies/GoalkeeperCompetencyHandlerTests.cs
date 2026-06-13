using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services.CompetencyCalculation;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Competencies.Commands.CreateCompetencyFramework;
using OurGame.Application.UseCases.Competencies.Commands.UpdateCompetencyFramework;
using OurGame.Application.UseCases.Competencies.Queries.GetPlayerCompetencies;
using OurGame.Persistence.Data.SeedData;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Competencies;

/// <summary>
/// Goalkeeper coverage for the competency handlers: update validation/replacement,
/// clone copying, and the player-facing goalkeeper flag/names.
/// </summary>
public class GoalkeeperCompetencyHandlerTests
{
    private static readonly Guid AttributeId = CompetencyTaxonomySeedData.AttributeId("Ball Control");

    private static readonly Dictionary<CompetencyBand, decimal> Thresholds = new()
    {
        { CompetencyBand.Development, 18m },
        { CompetencyBand.Intermediate, 35m },
        { CompetencyBand.Advanced, 52m },
        { CompetencyBand.Elite, 70m },
    };

    private static async Task SeedTaxonomyAsync(TestDatabaseFactory db)
    {
        await db.Context.CompetencyCategories.AddRangeAsync(CompetencyTaxonomySeedData.GetCategories());
        await db.Context.Competencies.AddRangeAsync(CompetencyTaxonomySeedData.GetCompetencies());
        await db.Context.SaveChangesAsync();
        await db.Context.CompetencyAttributes.AddRangeAsync(CompetencyTaxonomySeedData.GetAttributes());
        await db.Context.SaveChangesAsync();
    }

    private static async Task<Guid> SeedCustomFrameworkAsync(TestDatabaseFactory db, Guid clubId)
    {
        var frameworkId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        db.Context.CompetencyFrameworks.Add(new CompetencyFramework
        {
            Id = frameworkId,
            Name = "Custom",
            IsSystemDefault = false,
            Scope = CompetencyFrameworkScope.Club,
            OwnerClubId = clubId,
            UpliftPercent = 5m,
            IsArchived = false,
            CreatedAt = now,
            UpdatedAt = now,
        });
        await db.Context.SaveChangesAsync();
        return frameworkId;
    }

    /// <summary>Weights putting all 100% on the single seeded attribute, for every format.</summary>
    private static List<AttributeWeightInputDto> FullWeights(int perFormat = 100) =>
        new[] { GameFormat.FiveASide, GameFormat.SevenASide, GameFormat.NineASide, GameFormat.ElevenASide }
            .Select(f => new AttributeWeightInputDto { AttributeId = AttributeId, Format = f, WeightPercent = perFormat })
            .ToList();

    [Fact]
    public async Task Update_GoalkeeperTotalsNot100_ThrowsValidation()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        await SeedTaxonomyAsync(db);
        var frameworkId = await SeedCustomFrameworkAsync(db, clubId);

        var handler = new UpdateCompetencyFrameworkHandler(db.Context);
        var dto = new UpdateCompetencyFrameworkRequestDto
        {
            Name = "Custom",
            UpliftPercent = 5m,
            BandThresholds = Thresholds,
            Weights = FullWeights(100),
            GoalkeeperWeights = FullWeights(80), // each format totals 80, not 100
        };

        await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new UpdateCompetencyFrameworkCommand(frameworkId, dto), CancellationToken.None));
    }

    [Fact]
    public async Task Update_PreservesGoalkeeperRowsWhenOmitted()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        await SeedTaxonomyAsync(db);
        var frameworkId = await SeedCustomFrameworkAsync(db, clubId);
        var handler = new UpdateCompetencyFrameworkHandler(db.Context);

        // First save: establish GK rows.
        await handler.Handle(new UpdateCompetencyFrameworkCommand(frameworkId, new UpdateCompetencyFrameworkRequestDto
        {
            Name = "Custom",
            UpliftPercent = 5m,
            BandThresholds = Thresholds,
            Weights = FullWeights(100),
            GoalkeeperWeights = FullWeights(100),
        }), CancellationToken.None);

        // Second save: omit GK weights entirely.
        await handler.Handle(new UpdateCompetencyFrameworkCommand(frameworkId, new UpdateCompetencyFrameworkRequestDto
        {
            Name = "Custom Renamed",
            UpliftPercent = 5m,
            BandThresholds = Thresholds,
            Weights = FullWeights(100),
            GoalkeeperWeights = new List<AttributeWeightInputDto>(),
        }), CancellationToken.None);

        var gkRows = await db.Context.CompetencyFrameworkAttributeWeights
            .Where(w => w.FrameworkId == frameworkId && w.IsGoalkeeper)
            .CountAsync();
        Assert.Equal(4, gkRows); // 1 attribute x 4 formats survived
    }

    [Fact]
    public async Task Update_SystemFramework_IsReadOnly()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await SeedTaxonomyAsync(db);
        var systemId = Guid.NewGuid();
        db.Context.CompetencyFrameworks.Add(new CompetencyFramework
        {
            Id = systemId,
            Name = "System",
            IsSystemDefault = true,
            Scope = CompetencyFrameworkScope.System,
            UpliftPercent = 5m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        });
        await db.Context.SaveChangesAsync();

        var handler = new UpdateCompetencyFrameworkHandler(db.Context);
        await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new UpdateCompetencyFrameworkCommand(systemId, new UpdateCompetencyFrameworkRequestDto
            {
                Name = "Tampered",
                UpliftPercent = 5m,
                BandThresholds = Thresholds,
                Weights = FullWeights(100),
            }), CancellationToken.None));
    }

    [Fact]
    public async Task Create_CloneCopiesGoalkeeperRows()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        await SeedTaxonomyAsync(db);
        var sourceId = await SeedCustomFrameworkAsync(db, clubId);

        // Give the source GK + outfield rows and a description per position.
        db.Context.CompetencyFrameworkAttributeWeights.AddRange(
            new CompetencyFrameworkAttributeWeight { Id = Guid.NewGuid(), FrameworkId = sourceId, AttributeId = AttributeId, Format = GameFormat.ElevenASide, WeightPercent = 100, IsGoalkeeper = false },
            new CompetencyFrameworkAttributeWeight { Id = Guid.NewGuid(), FrameworkId = sourceId, AttributeId = AttributeId, Format = GameFormat.ElevenASide, WeightPercent = 100, IsGoalkeeper = true });
        await db.Context.SaveChangesAsync();

        var handler = new CreateCompetencyFrameworkHandler(db.Context);
        var newId = await handler.Handle(new CreateCompetencyFrameworkCommand(new CreateCompetencyFrameworkRequestDto
        {
            Name = "Clone",
            Scope = CompetencyFrameworkScope.Club,
            OwnerClubId = clubId,
            SourceFrameworkId = sourceId,
        }), CancellationToken.None);

        var clonedGk = await db.Context.CompetencyFrameworkAttributeWeights
            .CountAsync(w => w.FrameworkId == newId && w.IsGoalkeeper);
        var clonedOutfield = await db.Context.CompetencyFrameworkAttributeWeights
            .CountAsync(w => w.FrameworkId == newId && !w.IsGoalkeeper);

        Assert.Equal(1, clonedGk);
        Assert.Equal(1, clonedOutfield);
    }

    [Fact]
    public async Task GetPlayerCompetencies_GoalkeeperPlayer_ReturnsFlagAndGkNames()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        await SeedTaxonomyAsync(db);
        var playerId = await db.SeedPlayerAsync(clubId, preferredPositions: "[\"GK\",\"CB\"]");

        var handler = new GetPlayerCompetenciesHandler(db.Context);
        var result = await handler.Handle(new GetPlayerCompetenciesQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.True(result!.IsGoalkeeper);
        Assert.Equal(9, result.Competencies.Count);
        Assert.All(result.Competencies, c => Assert.False(string.IsNullOrWhiteSpace(c.CompetencyGoalkeeperName)));
    }

    [Fact]
    public async Task RecalculatePlayerScores_GoalkeeperPrimary_AppliesGoalkeeperWeights()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId, squadSize: SquadSize.ElevenASide);
        var teamId = await db.SeedTeamAsync(clubId, ageGroupId);
        await SeedTaxonomyAsync(db);

        // A custom framework whose GK weights are the mirror image of its outfield weights:
        // outfield loads competency #1's attributes, GK loads competency #2's. With opposing
        // bands on those two competencies the boosted score must differ by position.
        var comp1 = CompetencyTaxonomySeedData.CompControlReceiving_Id;
        var comp2 = CompetencyTaxonomySeedData.CompGameIntelligence_Id;
        var frameworkId = await SeedCustomFrameworkAsync(db, clubId);

        var attrsByComp = CompetencyTaxonomySeedData.GetAttributes()
            .GroupBy(a => a.CompetencyId)
            .ToDictionary(g => g.Key, g => g.Select(a => a.Id).ToList());

        void AddEvenWeights(Guid competencyId, bool isGoalkeeper)
        {
            var attrs = attrsByComp[competencyId];
            var per = 100 / attrs.Count;
            var residue = 100 - per * attrs.Count;
            foreach (var format in new[] { GameFormat.FiveASide, GameFormat.SevenASide, GameFormat.NineASide, GameFormat.ElevenASide })
            {
                for (int i = 0; i < attrs.Count; i++)
                {
                    db.Context.CompetencyFrameworkAttributeWeights.Add(new CompetencyFrameworkAttributeWeight
                    {
                        Id = Guid.NewGuid(),
                        FrameworkId = frameworkId,
                        AttributeId = attrs[i],
                        Format = format,
                        WeightPercent = per + (i < residue ? 1 : 0),
                        IsGoalkeeper = isGoalkeeper,
                    });
                }
            }
        }

        AddEvenWeights(comp1, isGoalkeeper: false);
        AddEvenWeights(comp2, isGoalkeeper: true);

        foreach (var (band, threshold) in new[]
        {
            (CompetencyBand.Development, 18m), (CompetencyBand.Intermediate, 35m),
            (CompetencyBand.Advanced, 52m), (CompetencyBand.Elite, 70m),
        })
        {
            db.Context.CompetencyFrameworkBandThresholds.Add(new CompetencyFrameworkBandThreshold
            {
                Id = Guid.NewGuid(), FrameworkId = frameworkId, Band = band, Threshold = threshold,
            });
        }

        db.Context.CompetencyFrameworkAssignments.Add(new CompetencyFrameworkAssignment
        {
            Id = Guid.NewGuid(), FrameworkId = frameworkId, ClubId = clubId, Scope = CompetencyFrameworkScope.Club,
            CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow,
        });
        await db.Context.SaveChangesAsync();

        // comp1 (drives outfield score) = Elite; comp2 (drives GK score) = Development.
        async Task<decimal> ScoreForPositionsAsync(string positions)
        {
            var playerId = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, lastName: positions);
            var player = await db.Context.Players.FirstAsync(p => p.Id == playerId);
            player.PreferredPositions = positions;
            db.Context.PlayerCompetencyLevels.AddRange(
                new PlayerCompetencyLevel { Id = Guid.NewGuid(), PlayerId = playerId, CompetencyId = comp1, Band = CompetencyBand.Elite, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new PlayerCompetencyLevel { Id = Guid.NewGuid(), PlayerId = playerId, CompetencyId = comp2, Band = CompetencyBand.Development, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            await db.Context.SaveChangesAsync();

            var service = new CompetencyCalculationService(db.Context);
            await service.RecalculatePlayerScoresAsync(playerId);

            return await db.Context.PlayerTeamScores
                .Where(s => s.PlayerId == playerId)
                .Select(s => s.BoostedScore)
                .FirstAsync();
        }

        var outfieldScore = await ScoreForPositionsAsync("[\"CB\",\"GK\"]");
        var goalkeeperScore = await ScoreForPositionsAsync("[\"GK\",\"CB\"]");

        // Outfield weights see comp1=Elite (high); GK weights see comp2=Development (low).
        Assert.True(outfieldScore > goalkeeperScore,
            $"Expected GK-primary score ({goalkeeperScore}) to be lower than outfield ({outfieldScore}).");
    }

    [Fact]
    public async Task GetPlayerCompetencies_OutfieldPlayer_FlagIsFalse()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        await SeedTaxonomyAsync(db);
        var playerId = await db.SeedPlayerAsync(clubId, preferredPositions: "[\"CB\",\"GK\"]");

        var handler = new GetPlayerCompetenciesHandler(db.Context);
        var result = await handler.Handle(new GetPlayerCompetenciesQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.False(result!.IsGoalkeeper);
    }
}

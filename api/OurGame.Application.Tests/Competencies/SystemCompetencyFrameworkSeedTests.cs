using OurGame.Persistence.Data.SeedData;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Competencies;

/// <summary>
/// Guards the goalkeeper seed data: every framework/format/position weight set must sum to
/// 100, the goalkeeper rubric set must be complete, and goalkeeper rows must use distinct IDs
/// so they coexist with outfield rows under the unique indexes.
/// </summary>
public class SystemCompetencyFrameworkSeedTests
{
    [Fact]
    public void GetAttributeWeights_EveryFrameworkFormatAndPosition_SumsTo100()
    {
        var weights = SystemCompetencyFrameworkSeed.GetAttributeWeights();

        var groups = weights
            .GroupBy(w => new { w.FrameworkId, w.Format, w.IsGoalkeeper })
            .ToList();

        // 6 frameworks x 4 formats x 2 positions = 48 groups.
        Assert.Equal(48, groups.Count);
        foreach (var g in groups)
        {
            Assert.Equal(100, g.Sum(w => w.WeightPercent));
        }
    }

    [Fact]
    public void GetCompetencyDescriptions_HasGoalkeeperRowsForEveryFramework()
    {
        var descriptions = SystemCompetencyFrameworkSeed.GetCompetencyDescriptions();

        var goalkeeperByFramework = descriptions
            .Where(d => d.IsGoalkeeper)
            .GroupBy(d => d.FrameworkId)
            .ToList();

        Assert.Equal(6, goalkeeperByFramework.Count);
        foreach (var g in goalkeeperByFramework)
        {
            // 9 competencies x 4 bands.
            Assert.Equal(36, g.Count());
        }
    }

    [Fact]
    public void GoalkeeperAndOutfieldRows_HaveDistinctIds()
    {
        var weights = SystemCompetencyFrameworkSeed.GetAttributeWeights();
        Assert.Equal(weights.Count, weights.Select(w => w.Id).Distinct().Count());

        var descriptions = SystemCompetencyFrameworkSeed.GetCompetencyDescriptions();
        Assert.Equal(descriptions.Count, descriptions.Select(d => d.Id).Distinct().Count());
    }

    [Fact]
    public void Taxonomy_PopulatesGoalkeeperNames()
    {
        Assert.All(CompetencyTaxonomySeedData.GetCompetencies(), c => Assert.False(string.IsNullOrWhiteSpace(c.GoalkeeperName)));
        Assert.All(CompetencyTaxonomySeedData.GetAttributes(), a => Assert.False(string.IsNullOrWhiteSpace(a.GoalkeeperName)));

        var gkDescriptions = CompetencyTaxonomySeedData.GetGoalkeeperDescriptions();
        Assert.Equal(36, gkDescriptions.Count);
        Assert.All(Enum.GetValues<CompetencyBand>(), band =>
            Assert.Equal(9, gkDescriptions.Count(kv => kv.Key.Band == band)));
    }
}

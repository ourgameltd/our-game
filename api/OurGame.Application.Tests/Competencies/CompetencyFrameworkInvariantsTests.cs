using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services.CompetencyCalculation;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Competencies;

public class CompetencyFrameworkInvariantsTests
{
    [Fact]
    public void EnsureThresholdsAscending_RejectsEqualOrDescending()
    {
        var bad = new Dictionary<CompetencyBand, decimal>
        {
            { CompetencyBand.Development, 18 },
            { CompetencyBand.Intermediate, 35 },
            { CompetencyBand.Advanced, 35 }, // equal to previous, not strictly ascending
            { CompetencyBand.Elite, 70 },
        };

        Assert.Throws<ValidationException>(() => CompetencyFrameworkInvariants.EnsureThresholdsAscending(bad));
    }

    [Fact]
    public void EnsureThresholdsAscending_RejectsMissingBand()
    {
        var missing = new Dictionary<CompetencyBand, decimal>
        {
            { CompetencyBand.Development, 18 },
            { CompetencyBand.Intermediate, 35 },
            { CompetencyBand.Advanced, 52 },
            // Elite missing
        };

        Assert.Throws<ValidationException>(() => CompetencyFrameworkInvariants.EnsureThresholdsAscending(missing));
    }

    [Fact]
    public void EnsureThresholdsAscending_AcceptsStandardThresholds()
    {
        var good = new Dictionary<CompetencyBand, decimal>
        {
            { CompetencyBand.Development, 18 },
            { CompetencyBand.Intermediate, 35 },
            { CompetencyBand.Advanced, 52 },
            { CompetencyBand.Elite, 70 },
        };

        CompetencyFrameworkInvariants.EnsureThresholdsAscending(good);
    }

    [Fact]
    public void EnsureFormatTotalsAre100_RejectsNon100Total()
    {
        var weights = new (GameFormat, int)[]
        {
            (GameFormat.FiveASide, 60),
            (GameFormat.FiveASide, 30), // sums to 90, not 100
            (GameFormat.SevenASide, 100),
            (GameFormat.NineASide, 100),
            (GameFormat.ElevenASide, 100),
        };

        Assert.Throws<ValidationException>(() => CompetencyFrameworkInvariants.EnsureFormatTotalsAre100(weights));
    }

    [Fact]
    public void EnsureFormatTotalsAre100_AcceptsEachFormatSummingTo100()
    {
        var weights = new (GameFormat, int)[]
        {
            (GameFormat.FiveASide, 100),
            (GameFormat.SevenASide, 100),
            (GameFormat.NineASide, 100),
            (GameFormat.ElevenASide, 100),
        };

        CompetencyFrameworkInvariants.EnsureFormatTotalsAre100(weights);
    }
}

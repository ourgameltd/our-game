using OurGame.Application.Services.CompetencyCalculation;

namespace OurGame.Application.Tests.Competencies;

public class GoalkeeperDetectionTests
{
    [Theory]
    [InlineData("[\"GK\",\"CB\"]", true)]   // primary GK (JSON array)
    [InlineData("[\"gk\"]", true)]          // case-insensitive
    [InlineData("[\"CB\",\"GK\"]", false)]  // GK only secondary
    [InlineData("[\"CB\"]", false)]
    [InlineData("GK,CB", true)]              // legacy delimited fallback
    [InlineData("CB,GK", false)]
    [InlineData("GK", true)]
    [InlineData("", false)]
    [InlineData("   ", false)]
    [InlineData(null, false)]
    [InlineData("not json at all", false)]
    public void IsGoalkeeper_DetectsPrimaryPosition(string? preferredPositions, bool expected)
    {
        Assert.Equal(expected, GoalkeeperDetection.IsGoalkeeper(preferredPositions));
    }
}

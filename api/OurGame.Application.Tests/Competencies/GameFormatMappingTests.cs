using OurGame.Application.Services.CompetencyCalculation;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Competencies;

/// <summary>
/// The game format used to score a player's competencies is derived from the
/// age group's squad size. Frameworks define weights only for 5s/7s/9s/11s, so
/// a 4-a-side squad is mapped onto the closest small-sided profile (5s).
/// </summary>
public class GameFormatMappingTests
{
    [Theory]
    [InlineData(SquadSize.FourASide, GameFormat.FiveASide)]
    [InlineData(SquadSize.FiveASide, GameFormat.FiveASide)]
    [InlineData(SquadSize.SevenASide, GameFormat.SevenASide)]
    [InlineData(SquadSize.NineASide, GameFormat.NineASide)]
    [InlineData(SquadSize.ElevenASide, GameFormat.ElevenASide)]
    public void FromSquadSize_MapsToExpectedFormat(SquadSize squadSize, GameFormat expected)
    {
        Assert.Equal(expected, GameFormatMapping.FromSquadSize(squadSize));
    }

    [Fact]
    public void FromSquadSize_UnknownValue_DefaultsToElevenASide()
    {
        Assert.Equal(GameFormat.ElevenASide, GameFormatMapping.FromSquadSize((SquadSize)999));
    }
}

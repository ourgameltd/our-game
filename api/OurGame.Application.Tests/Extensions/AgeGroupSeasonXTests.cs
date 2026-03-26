using OurGame.Application.Extensions;

namespace OurGame.Application.Tests.Extensions;

public class AgeGroupSeasonXTests
{
    [Fact]
    public void ParseSeasons_NullInput_ReturnsEmptyList()
    {
        var result = AgeGroupSeasonX.ParseSeasons(null);

        Assert.Empty(result);
    }

    [Fact]
    public void ParseSeasons_WhitespaceInput_ReturnsEmptyList()
    {
        var result = AgeGroupSeasonX.ParseSeasons("   ");

        Assert.Empty(result);
    }

    [Fact]
    public void ParseSeasons_EmptyString_ReturnsEmptyList()
    {
        var result = AgeGroupSeasonX.ParseSeasons("");

        Assert.Empty(result);
    }

    [Fact]
    public void ParseSeasons_JsonArray_ParsesCorrectly()
    {
        var result = AgeGroupSeasonX.ParseSeasons("[\"2023-24\",\"2024-25\"]");

        Assert.Equal(2, result.Count);
        Assert.Equal("2023-24", result[0]);
        Assert.Equal("2024-25", result[1]);
    }

    [Fact]
    public void ParseSeasons_CsvFormat_ParsesCorrectly()
    {
        var result = AgeGroupSeasonX.ParseSeasons("2023-24,2024-25");

        Assert.Equal(2, result.Count);
        Assert.Equal("2023-24", result[0]);
        Assert.Equal("2024-25", result[1]);
    }

    [Fact]
    public void ParseSeasons_MalformedJson_FallsBackToCsv()
    {
        var result = AgeGroupSeasonX.ParseSeasons("[invalid json");

        Assert.Single(result);
        Assert.Equal("invalid json", result[0]);
    }

    [Fact]
    public void ParseSeasons_JsonWithWhitespace_TrimsValues()
    {
        var result = AgeGroupSeasonX.ParseSeasons("[\" 2023-24 \", \" 2024-25 \"]");

        Assert.Equal(2, result.Count);
        Assert.Equal("2023-24", result[0]);
        Assert.Equal("2024-25", result[1]);
    }

    [Fact]
    public void SerializeSeasons_ValidList_ReturnsJsonArray()
    {
        var seasons = new List<string> { "2023-24", "2024-25" };

        var result = AgeGroupSeasonX.SerializeSeasons(seasons);

        Assert.Equal("[\"2023-24\",\"2024-25\"]", result);
    }

    [Fact]
    public void SerializeSeasons_NullInput_ReturnsEmptyArray()
    {
        var result = AgeGroupSeasonX.SerializeSeasons(null!);

        Assert.Equal("[]", result);
    }

    [Fact]
    public void SerializeSeasons_EmptyList_ReturnsEmptyArray()
    {
        var result = AgeGroupSeasonX.SerializeSeasons(new List<string>());

        Assert.Equal("[]", result);
    }
}

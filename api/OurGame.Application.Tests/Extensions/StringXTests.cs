using OurGame.Application.Extensions;

namespace OurGame.Application.Tests.Extensions;

public class StringXTests
{
    [Fact]
    public void Slugify_SimplePhrase_ReturnsSlug()
    {
        Assert.Equal("hello-world", "Hello World".Slugify());
    }

    [Fact]
    public void Slugify_WithAccents_RemovesAccents()
    {
        Assert.Equal("cafe-resume", "Café Résumé".Slugify());
    }

    [Fact]
    public void Slugify_WithSpecialChars_RemovesNonAlphanumeric()
    {
        Assert.Equal("hello-world", "Hello, World!".Slugify());
    }

    [Fact]
    public void Slugify_WithMultipleSpaces_NormalizesSpaces()
    {
        Assert.Equal("hello-world", "Hello   World".Slugify());
    }

    [Fact]
    public void Slugify_LongString_TruncatesTo45Chars()
    {
        var longPhrase = "This is a really long phrase that should be truncated to forty five characters";
        var result = longPhrase.Slugify();

        Assert.True(result.Length <= 45);
    }

    [Fact]
    public void Slugify_WithUpperCase_ReturnsLowerCase()
    {
        Assert.Equal("test-string", "TEST STRING".Slugify());
    }

    [Fact]
    public void Slugify_WithNumbers_PreservesNumbers()
    {
        Assert.Equal("team-2024", "Team 2024".Slugify());
    }
}

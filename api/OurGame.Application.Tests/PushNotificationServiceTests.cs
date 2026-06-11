using OurGame.Application.Services;

namespace OurGame.Application.Tests;

public class PushNotificationServiceTests
{
    // ── SafeTopic ────────────────────────────────────────────────────────────────

    [Fact]
    public void SafeTopic_NullTag_ReturnsNull()
    {
        Assert.Null(PushNotificationService.SafeTopic(null));
    }

    [Fact]
    public void SafeTopic_EmptyString_Returns32CharHex()
    {
        var result = PushNotificationService.SafeTopic(string.Empty);

        Assert.NotNull(result);
        Assert.Equal(32, result.Length);
        Assert.Matches("^[0-9a-f]{32}$", result);
    }

    [Fact]
    public void SafeTopic_ColonContainingTag_ProducesValidAppleTopic()
    {
        // The original bug: "notification:{guid}" contains a colon which Apple rejects.
        var tag = $"notification:{Guid.NewGuid()}";

        var result = PushNotificationService.SafeTopic(tag);

        Assert.NotNull(result);
        Assert.Equal(32, result.Length);
        Assert.Matches("^[0-9a-f]{32}$", result);
    }

    [Fact]
    public void SafeTopic_SameInput_ReturnsSameOutput()
    {
        const string tag = "notification:abc123";

        Assert.Equal(
            PushNotificationService.SafeTopic(tag),
            PushNotificationService.SafeTopic(tag));
    }

    [Fact]
    public void SafeTopic_DifferentInputs_ReturnDifferentOutputs()
    {
        var a = PushNotificationService.SafeTopic("notification:aaa");
        var b = PushNotificationService.SafeTopic("notification:bbb");

        Assert.NotEqual(a, b);
    }
}

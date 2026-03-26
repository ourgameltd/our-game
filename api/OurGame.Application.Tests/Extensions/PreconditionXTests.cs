using OurGame.Application.Extensions;

namespace OurGame.Application.Tests.Extensions;

public class PreconditionXTests
{
    [Fact]
    public void CheckNotNull_WhenNotNull_ReturnsReference()
    {
        var value = "hello";

        var result = value.CheckNotNull("prop");

        Assert.Same(value, result);
    }

    [Fact]
    public void CheckNotNull_WhenNull_ThrowsArgumentNullException()
    {
        string? value = null;

        var ex = Assert.Throws<ArgumentNullException>(() => value.CheckNotNull("myProp"));

        Assert.Equal("myProp", ex.ParamName);
    }
}

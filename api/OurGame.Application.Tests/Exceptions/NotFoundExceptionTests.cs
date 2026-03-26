using OurGame.Application.Abstractions.Exceptions;

namespace OurGame.Application.Tests.Exceptions;

public class NotFoundExceptionTests
{
    [Fact]
    public void Constructor_WithMessage_SetsMessage()
    {
        var ex = new NotFoundException("Club not found");

        Assert.Equal("Club not found", ex.Message);
    }

    [Fact]
    public void Constructor_WithResourceTypeAndKey_FormatsMessage()
    {
        var key = Guid.NewGuid();

        var ex = new NotFoundException("Club", key);

        Assert.Equal($"Club with key '{key}' was not found", ex.Message);
    }
}

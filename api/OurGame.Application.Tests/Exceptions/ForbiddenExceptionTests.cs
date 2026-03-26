using OurGame.Application.Abstractions.Exceptions;

namespace OurGame.Application.Tests.Exceptions;

public class ForbiddenExceptionTests
{
    [Fact]
    public void Constructor_WithMessage_SetsMessage()
    {
        var ex = new ForbiddenException("You are not allowed to do that");

        Assert.Equal("You are not allowed to do that", ex.Message);
    }
}

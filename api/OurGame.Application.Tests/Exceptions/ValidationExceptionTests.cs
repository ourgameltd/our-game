using OurGame.Application.Abstractions.Exceptions;

namespace OurGame.Application.Tests.Exceptions;

public class ValidationExceptionTests
{
    [Fact]
    public void Constructor_WithDictionary_SetsErrors()
    {
        var errors = new Dictionary<string, string[]>
        {
            { "Name", new[] { "Name is required" } },
            { "Email", new[] { "Email is invalid", "Email is taken" } }
        };

        var ex = new ValidationException(errors);

        Assert.Equal("One or more validation errors occurred", ex.Message);
        Assert.Equal(2, ex.Errors.Count);
        Assert.Single(ex.Errors["Name"]);
        Assert.Equal(2, ex.Errors["Email"].Length);
    }

    [Fact]
    public void Constructor_WithFieldAndError_CreatesDictionary()
    {
        var ex = new ValidationException("Name", "Name is required");

        Assert.Equal("One or more validation errors occurred", ex.Message);
        Assert.Single(ex.Errors);
        Assert.Equal(new[] { "Name is required" }, ex.Errors["Name"]);
    }
}

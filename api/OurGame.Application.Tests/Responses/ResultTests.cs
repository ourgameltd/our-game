using OurGame.Application.Abstractions.Responses;

namespace OurGame.Application.Tests.Responses;

public class ResultTests
{
    [Fact]
    public void Success_IsSuccessTrue_IsFailureFalse_StatusCode204()
    {
        var result = Result.Success();

        Assert.True(result.IsSuccess);
        Assert.False(result.IsFailure);
        Assert.False(result.IsNotFound);
        Assert.Null(result.ErrorMessage);
        Assert.Equal(204, result.StatusCode);
    }

    [Fact]
    public void NotFound_IsNotFoundTrue_StatusCode404()
    {
        var result = Result.NotFound("Club not found");

        Assert.False(result.IsSuccess);
        Assert.True(result.IsFailure);
        Assert.True(result.IsNotFound);
        Assert.Equal("Club not found", result.ErrorMessage);
        Assert.Equal(404, result.StatusCode);
    }

    [Fact]
    public void Failure_IsFailureTrue_SetsErrorMessage()
    {
        var result = Result.Failure("Bad request");

        Assert.False(result.IsSuccess);
        Assert.True(result.IsFailure);
        Assert.False(result.IsNotFound);
        Assert.Equal("Bad request", result.ErrorMessage);
        Assert.Equal(400, result.StatusCode);
    }

    [Fact]
    public void Failure_CustomStatusCode()
    {
        var result = Result.Failure("Conflict", 409);

        Assert.Equal(409, result.StatusCode);
    }
}

public class ResultOfTTests
{
    [Fact]
    public void Success_SetsValue()
    {
        var result = Result<string>.Success("hello");

        Assert.True(result.IsSuccess);
        Assert.False(result.IsFailure);
        Assert.False(result.IsNotFound);
        Assert.Equal("hello", result.Value);
        Assert.Null(result.ErrorMessage);
        Assert.Equal(200, result.StatusCode);
    }

    [Fact]
    public void NotFound_SetsError()
    {
        var result = Result<string>.NotFound("Not found");

        Assert.False(result.IsSuccess);
        Assert.True(result.IsNotFound);
        Assert.Null(result.Value);
        Assert.Equal("Not found", result.ErrorMessage);
        Assert.Equal(404, result.StatusCode);
    }

    [Fact]
    public void Failure_SetsError()
    {
        var result = Result<string>.Failure("Invalid", 422);

        Assert.False(result.IsSuccess);
        Assert.False(result.IsNotFound);
        Assert.Null(result.Value);
        Assert.Equal("Invalid", result.ErrorMessage);
        Assert.Equal(422, result.StatusCode);
    }

    [Fact]
    public void Failure_DefaultStatusCode_Is400()
    {
        var result = Result<int>.Failure("error");

        Assert.Equal(400, result.StatusCode);
    }
}

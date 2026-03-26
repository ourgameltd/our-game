using OurGame.Application.Abstractions.Responses;

namespace OurGame.Application.Tests.Responses;

public class ApiResponseTests
{
    [Fact]
    public void SuccessResponse_SetsSuccessTrueAndData()
    {
        var response = ApiResponse<string>.SuccessResponse("hello", 200);

        Assert.True(response.Success);
        Assert.Equal("hello", response.Data);
        Assert.Equal(200, response.StatusCode);
        Assert.Null(response.Error);
    }

    [Fact]
    public void SuccessResponse_DefaultStatusCode_Is200()
    {
        var response = ApiResponse<int>.SuccessResponse(42);

        Assert.Equal(200, response.StatusCode);
    }

    [Fact]
    public void ErrorResponse_SetsCodeAndMessage()
    {
        var response = ApiResponse<string>.ErrorResponse("Something failed", 500, "SERVER_ERROR");

        Assert.False(response.Success);
        Assert.Equal(500, response.StatusCode);
        Assert.NotNull(response.Error);
        Assert.Equal("Something failed", response.Error!.Message);
        Assert.Equal("SERVER_ERROR", response.Error.Code);
    }

    [Fact]
    public void ErrorResponse_DefaultCode_UsesStatusCode()
    {
        var response = ApiResponse<string>.ErrorResponse("fail", 422);

        Assert.Equal("ERROR_422", response.Error!.Code);
    }

    [Fact]
    public void NotFoundResponse_Sets404AndNotFoundCode()
    {
        var response = ApiResponse<string>.NotFoundResponse("Club not found");

        Assert.False(response.Success);
        Assert.Equal(404, response.StatusCode);
        Assert.Equal("NOT_FOUND", response.Error!.Code);
        Assert.Equal("Club not found", response.Error.Message);
    }

    [Fact]
    public void NotFoundResponse_DefaultMessage()
    {
        var response = ApiResponse<string>.NotFoundResponse();

        Assert.Equal("Resource not found", response.Error!.Message);
    }

    [Fact]
    public void ValidationErrorResponse_Sets400WithValidationErrors()
    {
        var errors = new Dictionary<string, string[]>
        {
            { "Name", new[] { "Required" } }
        };

        var response = ApiResponse<string>.ValidationErrorResponse("Validation failed", errors);

        Assert.False(response.Success);
        Assert.Equal(400, response.StatusCode);
        Assert.Equal("VALIDATION_ERROR", response.Error!.Code);
        Assert.Equal("Validation failed", response.Error.Message);
        Assert.NotNull(response.Error.ValidationErrors);
        Assert.Single(response.Error.ValidationErrors!["Name"]);
    }

    [Fact]
    public void ValidationErrorResponse_NullValidationErrors()
    {
        var response = ApiResponse<string>.ValidationErrorResponse("Bad input");

        Assert.Null(response.Error!.ValidationErrors);
    }
}

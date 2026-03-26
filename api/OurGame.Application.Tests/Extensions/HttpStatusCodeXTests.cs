using System.Net;
using OurGame.Application.Extensions;

namespace OurGame.Application.Tests.Extensions;

public class HttpStatusCodeXTests
{
    [Theory]
    [InlineData(HttpStatusCode.OK)]
    [InlineData(HttpStatusCode.Created)]
    [InlineData((HttpStatusCode)299)]
    public void IsSuccess_HttpStatusCode_SuccessCodes_ReturnsTrue(HttpStatusCode code)
    {
        Assert.True(code.IsSuccess());
    }

    [Theory]
    [InlineData((HttpStatusCode)199)]
    [InlineData(HttpStatusCode.MultipleChoices)]
    [InlineData(HttpStatusCode.NotFound)]
    [InlineData(HttpStatusCode.InternalServerError)]
    public void IsSuccess_HttpStatusCode_NonSuccessCodes_ReturnsFalse(HttpStatusCode code)
    {
        Assert.False(code.IsSuccess());
    }

    [Theory]
    [InlineData(200)]
    [InlineData(201)]
    [InlineData(299)]
    public void IsSuccess_Int_SuccessCodes_ReturnsTrue(int code)
    {
        Assert.True(code.IsSuccess());
    }

    [Theory]
    [InlineData(199)]
    [InlineData(300)]
    [InlineData(404)]
    [InlineData(500)]
    public void IsSuccess_Int_NonSuccessCodes_ReturnsFalse(int code)
    {
        Assert.False(code.IsSuccess());
    }
}

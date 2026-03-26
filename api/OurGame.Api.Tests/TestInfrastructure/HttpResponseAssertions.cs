using System.Text.Json;
using Microsoft.Azure.Functions.Worker.Http;
using OurGame.Application.Abstractions.Responses;

namespace OurGame.Api.Tests.TestInfrastructure;

internal static class HttpResponseAssertions
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static async Task<ApiResponse<T>> ReadApiResponseAsync<T>(HttpResponseData response)
    {
        response.Body.Seek(0, SeekOrigin.Begin);
        var payload = await JsonSerializer.DeserializeAsync<ApiResponse<T>>(response.Body, JsonOptions);
        Assert.NotNull(payload);
        return payload!;
    }
}

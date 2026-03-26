using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace OurGame.Api.Tests.TestInfrastructure;

internal sealed class TestHttpRequestData : HttpRequestData
{
    private readonly Stream _body;
    private readonly List<IHttpCookie> _cookies;
    private readonly List<ClaimsIdentity> _identities;

    public TestHttpRequestData(
        FunctionContext functionContext,
        string method,
        string url,
        string? body = null)
        : base(functionContext)
    {
        Method = method;
        Url = new Uri(url);
        Headers = new HttpHeadersCollection();
        _body = new MemoryStream(Encoding.UTF8.GetBytes(body ?? string.Empty));
        _cookies = new List<IHttpCookie>();
        _identities = new List<ClaimsIdentity>();
    }

    public override Stream Body => _body;

    public override HttpHeadersCollection Headers { get; }

    public override IReadOnlyCollection<IHttpCookie> Cookies => _cookies;

    public override Uri Url { get; }

    public override IEnumerable<ClaimsIdentity> Identities => _identities;

    public override string Method { get; }

    public override HttpResponseData CreateResponse()
    {
        return new TestHttpResponseData(FunctionContext);
    }

    public void AddClientPrincipalHeader(string userId, string? userDetails = null, IEnumerable<string>? roles = null)
    {
        var principal = new
        {
            identityProvider = "aad",
            userId,
            userDetails = userDetails ?? "test.user@ourgame.local",
            userRoles = roles?.ToArray() ?? new[] { "authenticated" },
            claims = Array.Empty<object>()
        };
        var principalJson = JsonSerializer.Serialize(principal);

        var encoded = Convert.ToBase64String(Encoding.UTF8.GetBytes(principalJson));
        Headers.Add("x-ms-client-principal", encoded);
    }
}

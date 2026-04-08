using System.Security.Claims;
using System.Text;
using System.Text.Json;
using OurGame.Api.Extensions;
using OurGame.Api.Tests.TestInfrastructure;

namespace OurGame.Api.Tests.Extensions;

public class HttpRequestDataXTests
{
    private static TestHttpRequestData CreateRequest(string url = "https://localhost/api/test")
    {
        var context = TestFunctionContextFactory.Create();
        return new TestHttpRequestData(context, "GET", url);
    }

    private static void AddCustomPrincipalHeader(
        TestHttpRequestData req,
        string userId,
        string? userDetails = null,
        IEnumerable<string>? roles = null,
        List<object>? claims = null)
    {
        var principal = new
        {
            identityProvider = "aad",
            userId,
            userDetails = userDetails ?? "",
            userRoles = roles?.ToArray() ?? new[] { "authenticated" },
            claims = claims ?? new List<object>()
        };
        var json = JsonSerializer.Serialize(principal);
        var encoded = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
        req.Headers.Add("x-ms-client-principal", encoded);
    }

    #region GetClientPrincipal

    [Fact]
    public void GetClientPrincipal_ReturnsNull_WhenHeaderMissing()
    {
        var req = CreateRequest();

        var result = req.GetClientPrincipal();

        Assert.Null(result);
    }

    [Fact]
    public void GetClientPrincipal_ReturnsNull_WhenHeaderValueIsEmpty()
    {
        var req = CreateRequest();
        req.Headers.Add("x-ms-client-principal", "");

        var result = req.GetClientPrincipal();

        Assert.Null(result);
    }

    [Fact]
    public void GetClientPrincipal_ReturnsNull_WhenBase64IsInvalid()
    {
        var req = CreateRequest();
        req.Headers.Add("x-ms-client-principal", "not-valid-base64!!!");

        var result = req.GetClientPrincipal();

        Assert.Null(result);
    }

    [Fact]
    public void GetClientPrincipal_ReturnsNull_WhenJsonIsInvalid()
    {
        var req = CreateRequest();
        var encoded = Convert.ToBase64String(Encoding.UTF8.GetBytes("{bad json!!!}"));
        req.Headers.Add("x-ms-client-principal", encoded);

        var result = req.GetClientPrincipal();

        Assert.Null(result);
    }

    [Fact]
    public void GetClientPrincipal_ReturnsPrincipal_WithUserIdAndNameAndRoles()
    {
        var req = CreateRequest();
        req.AddClientPrincipalHeader("user-123", "John Doe", new[] { "authenticated", "admin" });

        var result = req.GetClientPrincipal();

        Assert.NotNull(result);
        Assert.Equal("user-123", result.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        Assert.Equal("John Doe", result.FindFirst(ClaimTypes.Name)?.Value);
        Assert.True(result.IsInRole("authenticated"));
        Assert.True(result.IsInRole("admin"));
    }

    [Fact]
    public void GetClientPrincipal_ReturnsPrincipal_WithCustomClaims()
    {
        var req = CreateRequest();
        var claims = new List<object>
        {
            new { typ = ClaimTypes.Email, val = "test@example.com" },
            new { typ = "custom_claim", val = "custom_value" }
        };
        AddCustomPrincipalHeader(req, "user-456", "Jane Doe", new[] { "authenticated" }, claims);

        var result = req.GetClientPrincipal();

        Assert.NotNull(result);
        Assert.Equal("test@example.com", result.FindFirst(ClaimTypes.Email)?.Value);
        Assert.Equal("custom_value", result.FindFirst("custom_claim")?.Value);
    }

    [Fact]
    public void GetClientPrincipal_ReturnsPrincipal_WithNullClaimsArray()
    {
        var req = CreateRequest();
        var principal = new
        {
            identityProvider = "aad",
            userId = "user-789",
            userDetails = "Test User",
            userRoles = new[] { "authenticated" },
            claims = (List<object>?)null
        };
        var json = JsonSerializer.Serialize(principal);
        var encoded = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
        req.Headers.Add("x-ms-client-principal", encoded);

        var result = req.GetClientPrincipal();

        Assert.NotNull(result);
        Assert.Equal("user-789", result.FindFirst(ClaimTypes.NameIdentifier)?.Value);
    }

    [Fact]
    public void GetClientPrincipal_DoesNotAddNameClaim_WhenUserDetailsEmpty()
    {
        var req = CreateRequest();
        AddCustomPrincipalHeader(req, "user-empty", userDetails: "");

        var result = req.GetClientPrincipal();

        Assert.NotNull(result);
        Assert.Null(result.FindFirst(ClaimTypes.Name));
    }

    #endregion

    #region GetUserId

    [Fact]
    public void GetUserId_ReturnsUserId_WhenAuthenticated()
    {
        var req = CreateRequest();
        req.AddClientPrincipalHeader("user-abc");

        var result = req.GetUserId();

        Assert.Equal("user-abc", result);
    }

    [Fact]
    public void GetUserId_ReturnsNull_WhenNotAuthenticated()
    {
        var req = CreateRequest();

        var result = req.GetUserId();

        Assert.Null(result);
    }

    #endregion

    #region GetUserDisplayName

    [Fact]
    public void GetUserDisplayName_ReturnsName_WhenAuthenticated()
    {
        var req = CreateRequest();
        req.AddClientPrincipalHeader("user-1", "Display Name");

        var result = req.GetUserDisplayName();

        Assert.Equal("Display Name", result);
    }

    [Fact]
    public void GetUserDisplayName_ReturnsNull_WhenNotAuthenticated()
    {
        var req = CreateRequest();

        var result = req.GetUserDisplayName();

        Assert.Null(result);
    }

    [Fact]
    public void GetUserDisplayName_ReturnsNull_WhenUserDetailsEmpty()
    {
        var req = CreateRequest();
        AddCustomPrincipalHeader(req, "user-2", userDetails: "");

        var result = req.GetUserDisplayName();

        Assert.Null(result);
    }

    #endregion

    #region GetUserEmail

    [Fact]
    public void GetUserEmail_ReturnsEmail_FromEmailClaim()
    {
        var req = CreateRequest();
        var claims = new List<object>
        {
            new { typ = ClaimTypes.Email, val = "user@example.com" }
        };
        AddCustomPrincipalHeader(req, "user-email", claims: claims);

        var result = req.GetUserEmail();

        Assert.Equal("user@example.com", result);
    }

    [Fact]
    public void GetUserEmail_FallsBackToEmailsClaim()
    {
        var req = CreateRequest();
        var claims = new List<object>
        {
            new { typ = "emails", val = "fallback@example.com" }
        };
        AddCustomPrincipalHeader(req, "user-emails", claims: claims);

        var result = req.GetUserEmail();

        Assert.Equal("fallback@example.com", result);
    }

    [Fact]
    public void GetUserEmail_FallsBackToPreferredUsername()
    {
        var req = CreateRequest();
        var claims = new List<object>
        {
            new { typ = "preferred_username", val = "preferred@example.com" }
        };
        AddCustomPrincipalHeader(req, "user-preferred", claims: claims);

        var result = req.GetUserEmail();

        Assert.Equal("preferred@example.com", result);
    }

    [Fact]
    public void GetUserEmail_PrefersEmailOverEmailsAndPreferredUsername()
    {
        var req = CreateRequest();
        var claims = new List<object>
        {
            new { typ = ClaimTypes.Email, val = "primary@example.com" },
            new { typ = "emails", val = "secondary@example.com" },
            new { typ = "preferred_username", val = "tertiary@example.com" }
        };
        AddCustomPrincipalHeader(req, "user-all", claims: claims);

        var result = req.GetUserEmail();

        Assert.Equal("primary@example.com", result);
    }

    [Fact]
    public void GetUserEmail_ReturnsNull_WhenNoEmailClaims()
    {
        var req = CreateRequest();
        AddCustomPrincipalHeader(req, "user-no-email");

        var result = req.GetUserEmail();

        Assert.Null(result);
    }

    [Fact]
    public void GetUserEmail_ReturnsNull_WhenNotAuthenticated()
    {
        var req = CreateRequest();

        var result = req.GetUserEmail();

        Assert.Null(result);
    }

    #endregion

    #region GetUserGivenNameAndSurname

    [Fact]
    public void GetUserGivenName_ReturnsGivenName_FromClaim()
    {
        var req = CreateRequest();
        var claims = new List<object>
        {
            new { typ = ClaimTypes.GivenName, val = "Nicola" },
            new { typ = ClaimTypes.Surname, val = "Law" }
        };
        AddCustomPrincipalHeader(req, "user-names", claims: claims);

        var givenName = req.GetUserGivenName();
        var surname = req.GetUserSurname();

        Assert.Equal("Nicola", givenName);
        Assert.Equal("Law", surname);
    }

    [Fact]
    public void GetUserGivenNameAndSurname_ReturnNull_WhenClaimsMissing()
    {
        var req = CreateRequest();
        req.AddClientPrincipalHeader("user-no-names");

        var givenName = req.GetUserGivenName();
        var surname = req.GetUserSurname();

        Assert.Null(givenName);
        Assert.Null(surname);
    }

    #endregion

    #region IsInRole

    [Fact]
    public void IsInRole_ReturnsTrue_WhenUserHasRole()
    {
        var req = CreateRequest();
        req.AddClientPrincipalHeader("user-role", roles: new[] { "authenticated", "admin" });

        var result = req.IsInRole("admin");

        Assert.True(result);
    }

    [Fact]
    public void IsInRole_ReturnsFalse_WhenUserDoesNotHaveRole()
    {
        var req = CreateRequest();
        req.AddClientPrincipalHeader("user-role", roles: new[] { "authenticated" });

        var result = req.IsInRole("admin");

        Assert.False(result);
    }

    [Fact]
    public void IsInRole_ReturnsFalse_WhenNotAuthenticated()
    {
        var req = CreateRequest();

        var result = req.IsInRole("admin");

        Assert.False(result);
    }

    #endregion

    #region IsAuthenticated

    [Fact]
    public void IsAuthenticated_ReturnsTrue_WhenPrincipalHeaderPresent()
    {
        var req = CreateRequest();
        req.AddClientPrincipalHeader("user-auth");

        var result = req.IsAuthenticated();

        Assert.True(result);
    }

    [Fact]
    public void IsAuthenticated_ReturnsFalse_WhenPrincipalHeaderMissing()
    {
        var req = CreateRequest();

        var result = req.IsAuthenticated();

        Assert.False(result);
    }

    #endregion

    #region GetQueryParam

    [Fact]
    public void GetQueryParam_ReturnsValue_WhenParamExists()
    {
        var req = CreateRequest("https://localhost/api/test?name=value");

        var result = req.GetQueryParam("name");

        Assert.Equal("value", result);
    }

    [Fact]
    public void GetQueryParam_ReturnsNull_WhenParamMissing()
    {
        var req = CreateRequest("https://localhost/api/test?other=value");

        var result = req.GetQueryParam("name");

        Assert.Null(result);
    }

    [Fact]
    public void GetQueryParam_ReturnsNull_WhenNoQueryString()
    {
        var req = CreateRequest("https://localhost/api/test");

        var result = req.GetQueryParam("name");

        Assert.Null(result);
    }

    [Fact]
    public void GetQueryParam_ReturnsValue_WithMultipleParams()
    {
        var req = CreateRequest("https://localhost/api/test?first=one&second=two&third=three");

        Assert.Equal("one", req.GetQueryParam("first"));
        Assert.Equal("two", req.GetQueryParam("second"));
        Assert.Equal("three", req.GetQueryParam("third"));
    }

    [Fact]
    public void GetQueryParam_ReturnsDecodedValue_WhenUrlEncoded()
    {
        var req = CreateRequest("https://localhost/api/test?name=hello%20world");

        var result = req.GetQueryParam("name");

        Assert.Equal("hello world", result);
    }

    #endregion
}

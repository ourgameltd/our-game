using Microsoft.Azure.Functions.Worker.Http;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace OurGame.Api.Extensions;

/// <summary>
/// Extension methods for HttpRequestData to access Azure Static Web Apps user information
/// </summary>
public static class HttpRequestDataX
{
    /// <summary>
    /// Gets the authenticated user's ClaimsPrincipal from the request headers.
    /// Azure Static Web Apps injects the user principal in the x-ms-client-principal header.
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <returns>ClaimsPrincipal if authenticated, null otherwise</returns>
    public static ClaimsPrincipal? GetClientPrincipal(this HttpRequestData req)
    {
        var json = string.Empty;

#if DEBUG
        // ML: Mother of all hacks while this bug gets fixed
        // https://github.com/Azure/static-web-apps/issues/897

        if (req.Cookies.Any(i => i.Name == "StaticWebAppsAuthCookie"))
        {
            var cookieData = req.Cookies.First(i => i.Name == "StaticWebAppsAuthCookie").Value;
            var decoded = Convert.FromBase64String(cookieData);
            json = Encoding.UTF8.GetString(decoded);
        }
#endif

        if (!req.Headers.TryGetValues("x-ms-client-principal", out var headerValues))
        {
            return null;
        }

        var header = headerValues.FirstOrDefault();
        if (string.IsNullOrEmpty(header))
        {
            return null;
        }

        try
        {
            if (string.IsNullOrWhiteSpace(json))
            { 
                // The header is base64 encoded JSON
                var data = Convert.FromBase64String(header);
                json = System.Text.Encoding.UTF8.GetString(data);
            }

            var principal = JsonSerializer.Deserialize<ClientPrincipalData>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (principal == null)
            {
                return null;
            }

            // Create claims identity
            var identity = new ClaimsIdentity(principal.IdentityProvider);
            
            // Add user ID claim
            identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, principal.UserId));
            
            // Add user details (usually the display name or email)
            if (!string.IsNullOrEmpty(principal.UserDetails))
            {
                identity.AddClaim(new Claim(ClaimTypes.Name, principal.UserDetails));
            }

            // Add role claims
            foreach (var role in principal.UserRoles)
            {
                identity.AddClaim(new Claim(ClaimTypes.Role, role));
            }

            // Add custom claims
            if (principal.Claims != null)
            {
                foreach (var claim in principal.Claims)
                {
                    identity.AddClaim(new Claim(claim.Typ, claim.Val));
                }
            }

            return new ClaimsPrincipal(identity);
        }
        catch (Exception)
        {
            return null;
        }
    }

    /// <summary>
    /// Gets the authenticated user's ID
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <returns>User ID if authenticated, null otherwise</returns>
    public static string? GetUserId(this HttpRequestData req)
    {
        var principal = req.GetClientPrincipal();
        return principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }

    /// <summary>
    /// Gets the authenticated user's display name
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <returns>Display name if available, null otherwise</returns>
    public static string? GetUserDisplayName(this HttpRequestData req)
    {
        var principal = req.GetClientPrincipal();
        return principal?.FindFirst(ClaimTypes.Name)?.Value;
    }

    /// <summary>
    /// Gets the authenticated user's email from claims
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <returns>Email if available, null otherwise</returns>
    public static string? GetUserEmail(this HttpRequestData req)
    {
        var principal = req.GetClientPrincipal();
        return principal?.FindFirst(ClaimTypes.Email)?.Value ??
               principal?.FindFirst("emails")?.Value ??
               principal?.FindFirst("preferred_username")?.Value;
    }

    /// <summary>
    /// Gets the authenticated user's given/first name from claims.
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <returns>Given name if available, null otherwise</returns>
    public static string? GetUserGivenName(this HttpRequestData req)
    {
        var principal = req.GetClientPrincipal();
        return principal?.FindFirst(ClaimTypes.GivenName)?.Value ??
               principal?.FindFirst("given_name")?.Value;
    }

    /// <summary>
    /// Gets the authenticated user's surname/last name from claims.
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <returns>Surname if available, null otherwise</returns>
    public static string? GetUserSurname(this HttpRequestData req)
    {
        var principal = req.GetClientPrincipal();
        return principal?.FindFirst(ClaimTypes.Surname)?.Value ??
               principal?.FindFirst("family_name")?.Value;
    }

    /// <summary>
    /// Checks if the user has a specific role
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="role">The role to check</param>
    /// <returns>True if user has the role, false otherwise</returns>
    public static bool IsInRole(this HttpRequestData req, string role)
    {
        var principal = req.GetClientPrincipal();
        return principal?.IsInRole(role) ?? false;
    }

    /// <summary>
    /// Checks if the request is from an authenticated user
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <returns>True if authenticated, false otherwise</returns>
    public static bool IsAuthenticated(this HttpRequestData req)
    {
        return req.GetClientPrincipal() != null;
    }

    /// <summary>
    /// Gets a query parameter value from the request URL
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="paramName">The name of the query parameter</param>
    /// <returns>The parameter value if found, null otherwise</returns>
    public static string? GetQueryParam(this HttpRequestData req, string paramName)
    {
        var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
        return query[paramName];
    }
}

/// <summary>
/// Data model for Azure Static Web Apps client principal
/// </summary>
internal class ClientPrincipalData
{
    public string IdentityProvider { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserDetails { get; set; } = string.Empty;
    public List<string> UserRoles { get; set; } = new();
    public List<ClientPrincipalClaim>? Claims { get; set; }
}

/// <summary>
/// Data model for client principal claims
/// </summary>
internal class ClientPrincipalClaim
{
    public string Typ { get; set; } = string.Empty;
    public string Val { get; set; } = string.Empty;
}

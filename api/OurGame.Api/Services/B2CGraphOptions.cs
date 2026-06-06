namespace OurGame.Api.Services;

/// <summary>
/// Configuration options for the Azure AD B2C Microsoft Graph integration.
/// Bind from the <c>B2cGraph</c> section of app settings.
/// </summary>
public sealed class B2CGraphOptions
{
    public const string SectionName = "B2cGraph";

    /// <summary>Azure AD B2C tenant ID (GUID or tenant domain).</summary>
    public string TenantId { get; set; } = string.Empty;

    /// <summary>Client (application) ID of the app registration with User.Read.All.</summary>
    public string ClientId { get; set; } = string.Empty;

    /// <summary>Client secret for the app registration.</summary>
    public string ClientSecret { get; set; } = string.Empty;
}

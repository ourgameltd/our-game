namespace OurGame.Application.Abstractions;

/// <summary>
/// Profile data retrieved from the Azure AD B2C directory via the Microsoft Graph API.
/// </summary>
public record B2CUserProfile(
    string? Email,
    string? GivenName,
    string? Surname,
    string? DisplayName);

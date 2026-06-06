namespace OurGame.Application.Abstractions;

/// <summary>
/// Retrieves user profile data from the identity provider directory.
/// Implementations may query the Microsoft Graph API (production) or return null (local development).
/// </summary>
public interface IB2CUserService
{
    /// <summary>
    /// Fetches profile information for the given B2C object ID.
    /// Returns <c>null</c> if the user cannot be found or the service is unavailable.
    /// </summary>
    Task<B2CUserProfile?> GetUserAsync(string objectId, CancellationToken cancellationToken = default);
}

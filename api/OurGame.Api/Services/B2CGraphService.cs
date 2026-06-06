using Azure.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Graph;
using OurGame.Application.Abstractions;

namespace OurGame.Api.Services;

/// <summary>
/// Production implementation of <see cref="IB2CUserService"/> that queries the
/// Microsoft Graph API to retrieve full user profile data from the Azure AD B2C directory.
/// </summary>
public sealed class B2CGraphService : IB2CUserService
{
    private readonly GraphServiceClient _graphClient;
    private readonly ILogger<B2CGraphService> _logger;

    public B2CGraphService(IOptions<B2CGraphOptions> options, ILogger<B2CGraphService> logger)
    {
        _logger = logger;

        var opts = options.Value;
        var credential = new ClientSecretCredential(opts.TenantId, opts.ClientId, opts.ClientSecret);
        _graphClient = new GraphServiceClient(credential);
    }

    /// <inheritdoc/>
    public async Task<B2CUserProfile?> GetUserAsync(string objectId, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _graphClient.Users[objectId].GetAsync(config =>
            {
                config.QueryParameters.Select = new[]
                {
                    "mail", "otherMails", "givenName", "surname", "displayName"
                };
            }, cancellationToken);

            if (user == null)
            {
                return null;
            }

            // Prefer the primary SMTP address (mail); fall back to otherMails which B2C
            // may populate for local accounts depending on the user flow configuration.
            var email = user.Mail
                ?? user.OtherMails?.FirstOrDefault();

            return new B2CUserProfile(
                Email: email,
                GivenName: user.GivenName,
                Surname: user.Surname,
                DisplayName: user.DisplayName);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to retrieve user {ObjectId} from B2C Graph API; falling back to claim-based values", objectId);
            return null;
        }
    }
}

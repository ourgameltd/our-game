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
                // identities is required for B2C local accounts — the email is stored
                // there as signInType="emailAddress", not in mail/otherMails.
                config.QueryParameters.Select = new[]
                {
                    "mail", "otherMails", "identities", "givenName", "surname", "displayName"
                };
            }, cancellationToken);

            if (user == null)
            {
                return null;
            }

            // For B2C local accounts the email lives in identities[signInType=emailAddress].
            // mail / otherMails are only populated for work/school or federated accounts.
            var emailFromIdentities = user.Identities?
                .FirstOrDefault(i => string.Equals(i.SignInType, "emailAddress", StringComparison.OrdinalIgnoreCase))
                ?.IssuerAssignedId;

            var email = user.Mail
                ?? emailFromIdentities
                ?? user.OtherMails?.FirstOrDefault();

            _logger.LogInformation(
                "B2C Graph returned for {ObjectId}: mail={Mail}, identityEmail={IdentityEmail}, otherMails={OtherMails}",
                objectId, user.Mail, emailFromIdentities, string.Join(",", user.OtherMails ?? []));

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

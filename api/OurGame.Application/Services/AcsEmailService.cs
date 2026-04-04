using Azure;
using Azure.Communication.Email;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace OurGame.Application.Services;

/// <summary>
/// Azure Communication Services implementation of <see cref="IEmailService"/>.
/// Sends transactional emails using the ACS Email SDK.
/// </summary>
public class AcsEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<AcsEmailService> _logger;

    public AcsEmailService(IConfiguration configuration, ILogger<AcsEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendInviteEmailAsync(
        string recipientEmail,
        string recipientName,
        string clubName,
        string roleName,
        string inviteCode,
        CancellationToken cancellationToken = default)
    {
        var connectionString = _configuration["AzureCommunicationServices:ConnectionString"];
        if (string.IsNullOrEmpty(connectionString))
        {
            _logger.LogWarning("ACS connection string is not configured – skipping invite email to {Email}", recipientEmail);
            return false;
        }

        var senderAddress = _configuration["AzureCommunicationServices:SenderAddress"];
        if (string.IsNullOrWhiteSpace(senderAddress))
        {
            _logger.LogWarning("ACS sender address is not configured – skipping invite email to {Email}", recipientEmail);
            return false;
        }
        var frontendBaseUrl = _configuration["App:FrontendBaseUrl"] ?? "https://isourgame.com";

        var inviteUrl = $"{frontendBaseUrl.TrimEnd('/')}/invite/{inviteCode}";
        var subject = $"You've been invited to join {clubName} on OurGame";

        var htmlContent = BuildInviteEmailHtml(clubName, roleName, inviteUrl);
        var plainTextContent = BuildInviteEmailPlainText(clubName, roleName, inviteUrl);

        var client = new EmailClient(connectionString);
        var emailMessage = new EmailMessage(
            senderAddress: senderAddress,
            recipients: new EmailRecipients(
                new List<EmailAddress> { new(recipientEmail, recipientName) }),
            content: new EmailContent(subject)
            {
                Html = htmlContent,
                PlainText = plainTextContent
            });

        try
        {
            var operation = await client.SendAsync(WaitUntil.Started, emailMessage, cancellationToken);

            _logger.LogInformation(
                "Invite email queued for {Email} for club {ClubName} as {Role} (OperationId: {OperationId})",
                recipientEmail, clubName, roleName, operation.Id);
            return true;
        }
        catch (RequestFailedException ex)
        {
            _logger.LogWarning(ex,
                "ACS returned {StatusCode} when sending invite email to {Email}: {Message}",
                ex.Status, recipientEmail, ex.Message);
            return false;
        }
        catch (OperationCanceledException ex) when (ex.CancellationToken == cancellationToken)
        {
            _logger.LogInformation(ex, "Sending invite email to {Email} was canceled.", recipientEmail);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send invite email to {Email}", recipientEmail);
            return false;
        }
    }

    private static string BuildInviteEmailHtml(string clubName, string roleName, string inviteUrl)
    {
        return $"""
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8" /></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
              <div style="max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
                <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 32px 24px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">You've been invited!</h1>
                </div>
                <div style="padding: 32px 24px;">
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 0;">
                    You've been invited to join <strong>{clubName}</strong> as a <strong>{roleName}</strong> on OurGame.
                  </p>
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Click the button below to accept the invite and link your account. If you don't have an account yet, you'll be able to create one.
                  </p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="{inviteUrl}" style="display: inline-block; background: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Accept Invite
                    </a>
                  </div>
                  <p style="color: #9ca3af; font-size: 12px; line-height: 1.6;">
                    If the button doesn't work, copy and paste this link into your browser:<br />
                    <a href="{inviteUrl}" style="color: #dc2626;">{inviteUrl}</a>
                  </p>
                  <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin-bottom: 0;">
                    This invite expires in 30 days. If you did not expect this email, you can safely ignore it.
                  </p>
                </div>
              </div>
            </body>
            </html>
            """;
    }

    private static string BuildInviteEmailPlainText(string clubName, string roleName, string inviteUrl)
    {
        return $"""
            You've been invited to join {clubName} as a {roleName} on OurGame.

            Click this link to accept the invite and link your account:
            {inviteUrl}

            If you don't have an account yet, you'll be able to create one.

            This invite expires in 30 days. If you did not expect this email, you can safely ignore it.
            """;
    }
}

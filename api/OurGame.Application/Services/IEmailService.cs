namespace OurGame.Application.Services;

/// <summary>
/// Abstraction for sending transactional emails.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends an invite email to the specified recipient.
    /// </summary>
    /// <param name="recipientEmail">Email address of the invite recipient.</param>
    /// <param name="recipientName">Display name for the recipient (may be empty).</param>
    /// <param name="clubName">Name of the club the user is being invited to.</param>
    /// <param name="roleName">Human-readable role label (Coach, Player, Guardian).</param>
    /// <param name="inviteCode">The 8-character invite code.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the email was sent successfully; false otherwise.</returns>
    Task<bool> SendInviteEmailAsync(
        string recipientEmail,
        string recipientName,
        string clubName,
        string roleName,
        string inviteCode,
        CancellationToken cancellationToken = default);
}

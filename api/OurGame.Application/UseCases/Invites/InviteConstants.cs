namespace OurGame.Application.UseCases.Invites;

public static class InviteConstants
{
    public const string OpenInviteEmail = "open-invite@ourgame.local";

    public static bool IsOpenInviteEmail(string? email)
        => string.Equals(email?.Trim(), OpenInviteEmail, StringComparison.OrdinalIgnoreCase);
}

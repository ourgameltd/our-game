using System.Security.Cryptography;
using System.Text;

namespace OurGame.Application.UseCases.Invites;

public static class InviteConstants
{
    public const string OpenInviteEmail = "open-invite@ourgame.local";
    public const int InviteExpiryDays = 30;

    private const string CodeChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public static bool IsOpenInviteEmail(string? email)
        => string.Equals(email?.Trim(), OpenInviteEmail, StringComparison.OrdinalIgnoreCase);

    public static string GenerateCode()
    {
        var bytes = new byte[8];
        RandomNumberGenerator.Fill(bytes);
        var sb = new StringBuilder(8);
        foreach (var b in bytes)
        {
            sb.Append(CodeChars[b % CodeChars.Length]);
        }
        return sb.ToString();
    }
}

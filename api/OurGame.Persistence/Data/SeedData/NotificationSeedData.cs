using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class NotificationSeedData
{
    public static List<Notification> GetNotifications()
    {
        var now = DateTime.UtcNow;

        return new List<Notification>
        {
            // Global announcements (UserId = null -> visible to everyone)
            new Notification
            {
                Id = UserSeedData.CreateDeterministicGuid("notification|global|welcome"),
                UserId = null,
                Type = "announcement",
                Title = "Welcome to OurGame",
                Message = "Your club management portal is ready. Explore clubs, teams, and players from the dashboard.",
                Url = "/dashboard",
                CreatedAt = now.AddDays(-7)
            },
            new Notification
            {
                Id = UserSeedData.CreateDeterministicGuid("notification|global|new-features"),
                UserId = null,
                Type = "announcement",
                Title = "New training session builder",
                Message = "Coaches can now create and share training sessions across teams and age groups.",
                Url = "/drill-templates",
                CreatedAt = now.AddDays(-3)
            },
            new Notification
            {
                Id = UserSeedData.CreateDeterministicGuid("notification|global|season-kickoff"),
                UserId = null,
                Type = "match",
                Title = "Season kick-off this weekend",
                Message = "Fixtures for all age groups are now published. Check your team page for details.",
                Url = "/dashboard",
                CreatedAt = now.AddDays(-1)
            },

            // Targeted notifications for the seeded admin (Michael Law)
            new Notification
            {
                Id = UserSeedData.CreateDeterministicGuid("notification|michael|team-invite"),
                UserId = UserSeedData.MichaelLaw_Id,
                Type = "team",
                Title = "You're now a club admin",
                Message = "You have full administrator access. Invite coaches and parents from the invites page.",
                Url = "/dashboard",
                CreatedAt = now.AddDays(-5)
            },
            new Notification
            {
                Id = UserSeedData.CreateDeterministicGuid("notification|michael|training-reminder"),
                UserId = UserSeedData.MichaelLaw_Id,
                Type = "training",
                Title = "Training session tomorrow",
                Message = "Reminder: Vale 2014 Reds training session scheduled at 6:30pm.",
                Url = "/dashboard",
                CreatedAt = now.AddHours(-18)
            },
            new Notification
            {
                Id = UserSeedData.CreateDeterministicGuid("notification|michael|match-result"),
                UserId = UserSeedData.MichaelLaw_Id,
                Type = "match",
                Title = "Match report available",
                Message = "The match report for last weekend's fixture has been published.",
                Url = "/dashboard",
                CreatedAt = now.AddHours(-6)
            },
            new Notification
            {
                Id = UserSeedData.CreateDeterministicGuid("notification|michael|message"),
                UserId = UserSeedData.MichaelLaw_Id,
                Type = "message",
                Title = "New message from coach",
                Message = "You have a new message regarding player development plans.",
                Url = "/notifications",
                CreatedAt = now.AddMinutes(-45)
            },
            new Notification
            {
                Id = UserSeedData.CreateDeterministicGuid("notification|michael|kit-order"),
                UserId = UserSeedData.MichaelLaw_Id,
                Type = "announcement",
                Title = "Kit orders closing soon",
                Message = "Final call for this season's kit orders — closes at end of week.",
                Url = "/dashboard",
                CreatedAt = now.AddMinutes(-10)
            }
        };
    }
}

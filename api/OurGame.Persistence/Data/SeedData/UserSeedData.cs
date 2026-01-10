using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class UserSeedData
{
    // User IDs from TypeScript data
    public static readonly Guid DemoUser_Id = Guid.Parse("00000001-0000-0000-0000-000000000123");
    public static readonly Guid PlayerUser_Id = Guid.Parse("00000001-0000-0000-0000-000000000456");
    public static readonly Guid ParentUser_Id = Guid.Parse("00000001-0000-0000-0000-000000000789");
    public static readonly Guid FanUser_Id = Guid.Parse("00000001-0000-0000-0000-000000000101");

    public static List<User> GetUsers()
    {
        var now = DateTime.UtcNow;
        
        return new List<User>
        {
            new User
            {
                Id = DemoUser_Id,
                Email = "demo@valefc.com",
                FirstName = "Demo",
                LastName = "User",
                Role = "coach",
                ClubId = ClubSeedData.ValeFC_Id,
                PlayerId = null,
                StaffId = CoachSeedData.MichaelRobertson_Id,
                Photo = null,
                Preferences = "{\"notifications\":true,\"theme\":\"light\",\"navigationStyle\":\"modern\"}",
                CreatedAt = now,
                UpdatedAt = now
            },
            new User
            {
                Id = PlayerUser_Id,
                Email = "oliver.thompson@example.com",
                FirstName = "Oliver",
                LastName = "Thompson",
                Role = "player",
                ClubId = ClubSeedData.ValeFC_Id,
                PlayerId = PlayerSeedData.OliverThompson_Id,
                StaffId = null,
                Photo = null,
                Preferences = "{\"notifications\":true,\"theme\":\"light\"}",
                CreatedAt = now,
                UpdatedAt = now
            },
            new User
            {
                Id = ParentUser_Id,
                Email = "sarah.thompson@example.com",
                FirstName = "Sarah",
                LastName = "Thompson",
                Role = "parent",
                ClubId = ClubSeedData.ValeFC_Id,
                PlayerId = null,
                StaffId = null,
                Photo = null,
                Preferences = "{\"notifications\":true}",
                CreatedAt = now,
                UpdatedAt = now
            },
            new User
            {
                Id = FanUser_Id,
                Email = "mike.anderson@example.com",
                FirstName = "Mike",
                LastName = "Anderson",
                Role = "fan",
                ClubId = ClubSeedData.ValeFC_Id,
                PlayerId = null,
                StaffId = null,
                Photo = null,
                Preferences = "{\"notifications\":false,\"theme\":\"dark\"}",
                CreatedAt = now,
                UpdatedAt = now
            }
        };
    }
}

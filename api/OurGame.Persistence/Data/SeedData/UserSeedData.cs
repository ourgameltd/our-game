using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class UserSeedData
{
    // User IDs from TypeScript data
    public static readonly Guid DemoUser_Id = Guid.Parse("00000001-0000-0000-0000-000000000123");
    public static readonly Guid PlayerUser_Id = Guid.Parse("00000001-0000-0000-0000-000000000456");
    public static readonly Guid ParentUser_Id = Guid.Parse("00000001-0000-0000-0000-000000000789");
    public static readonly Guid FanUser_Id = Guid.Parse("00000001-0000-0000-0000-000000000101");
    public static readonly Guid MichaelLaw_Id = Guid.Parse("00000001-0000-0000-0000-000000000102");

    public static List<User> GetUsers()
    {
        var now = DateTime.UtcNow;
        
        return new List<User>
        {
            new User
            {
                Id = DemoUser_Id,
                AuthId = "demo-azure-user-id-123",
                Email = "demo@valefc.com",
                FirstName = "Demo",
                LastName = "User",
                Photo = null,
                Preferences = "{\"notifications\":true,\"theme\":\"light\",\"navigationStyle\":\"modern\"}",
                CreatedAt = now,
                UpdatedAt = now
            },
            new User
            {
                Id = PlayerUser_Id,
                AuthId = "player-azure-user-id-456",
                Email = "oliver.thompson@example.com",
                FirstName = "Oliver",
                LastName = "Thompson",
                Photo = null,
                Preferences = "{\"notifications\":true,\"theme\":\"light\"}",
                CreatedAt = now,
                UpdatedAt = now
            },
            new User
            {
                Id = ParentUser_Id,
                AuthId = "parent-azure-user-id-789",
                Email = "sarah.thompson@example.com",
                FirstName = "Sarah",
                LastName = "Thompson",
                Photo = null,
                Preferences = "{\"notifications\":true}",
                CreatedAt = now,
                UpdatedAt = now
            },
            new User
            {
                Id = FanUser_Id,
                AuthId = "fan-azure-user-id-101",
                Email = "mike.anderson@example.com",
                FirstName = "Mike",
                LastName = "Anderson",
                Photo = null,
                Preferences = "{\"notifications\":false,\"theme\":\"dark\"}",
                CreatedAt = now,
                UpdatedAt = now
            },
            new User
            {
                Id = MichaelLaw_Id,
                AuthId = "00000001000000000000000000000101",
                Email = "michael.law@valefc.com",
                FirstName = "Michael",
                LastName = "Law",
                Photo = null,
                Preferences = "{\"notifications\":true,\"theme\":\"dark\",\"navigationStyle\":\"modern\"}",
                CreatedAt = now,
                UpdatedAt = now
            }
        };
    }
}

using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class CoachSeedData
{
    // Coach IDs from TypeScript data
    public static readonly Guid MichaelRobertson_Id = Guid.Parse("c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6");
    public static readonly Guid SarahMcKenzie_Id = Guid.Parse("c2a3b4c5-d6e7-f8a9-b0c1-d2e3f4a5b6c7");
    public static readonly Guid DavidCampbell_Id = Guid.Parse("c3a4b5c6-d7e8-f9a0-b1c2-d3e4f5a6b7c8");
    public static readonly Guid EmmaWilson_Id = Guid.Parse("c4a5b6c7-d8e9-f0a1-b2c3-d4e5f6a7b8c9");
    public static readonly Guid JamesAnderson_Id = Guid.Parse("c5a6b7c8-d9e0-f1a2-b3c4-d5e6f7a8b9c0");
    public static readonly Guid LauraThomson_Id = Guid.Parse("c6a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c1");

    public static List<Coach> GetCoaches()
    {
        var now = DateTime.UtcNow;
        
        return new List<Coach>
        {
            new Coach
            {
                Id = MichaelRobertson_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                FirstName = "Michael",
                LastName = "Robertson",
                DateOfBirth = new DateOnly(1978, 5, 12),
                Photo = "https://placehold.co/150/2C3E50/FFFFFF?text=MR",
                Email = "michael.robertson@valefc.com",
                Phone = "+44 7700 900123",
                AssociationId = "SFA-24781",
                HasAccount = true,
                Role = "head-coach",
                Biography = "Experienced youth coach with over 15 years developing young talent. Former professional player with Vale of Leven FC and passionate about grassroots football development.",
                Specializations = "[\"Youth Development\",\"Tactical Training\",\"Team Building\"]",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Coach
            {
                Id = SarahMcKenzie_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                FirstName = "Sarah",
                LastName = "McKenzie",
                DateOfBirth = new DateOnly(1985, 9, 23),
                Photo = "https://placehold.co/150/8E44AD/FFFFFF?text=SM",
                Email = "sarah.mckenzie@valefc.com",
                Phone = "+44 7700 900124",
                AssociationId = "SFA-31245",
                HasAccount = false,
                Role = "assistant-coach",
                Biography = "Dedicated assistant coach with expertise in fitness and conditioning. Former semi-professional player committed to player welfare and development.",
                Specializations = "[\"Fitness Training\",\"Player Welfare\",\"Set Pieces\"]",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Coach
            {
                Id = DavidCampbell_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                FirstName = "David",
                LastName = "Campbell",
                DateOfBirth = new DateOnly(1980, 11, 8),
                Photo = "https://placehold.co/150/16A085/FFFFFF?text=DC",
                Email = "david.campbell@valefc.com",
                Phone = "+44 7700 900125",
                AssociationId = "SFA-28934",
                HasAccount = true,
                Role = "goalkeeper-coach",
                Biography = "Former professional goalkeeper with over 200 appearances. Specializes in goalkeeper development and technical training for all age groups.",
                Specializations = "[\"Goalkeeper Training\",\"Shot Stopping\",\"Distribution\"]",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Coach
            {
                Id = EmmaWilson_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                FirstName = "Emma",
                LastName = "Wilson",
                DateOfBirth = new DateOnly(1992, 3, 17),
                Photo = "https://placehold.co/150/E74C3C/FFFFFF?text=EW",
                Email = "emma.wilson@valefc.com",
                Phone = "+44 7700 900126",
                AssociationId = "SFA-34567",
                HasAccount = false,
                Role = "head-coach",
                Biography = "Young and dynamic coach with a focus on modern coaching methodologies. Passionate about developing well-rounded players both on and off the pitch.",
                Specializations = "[\"Technical Skills\",\"Game Intelligence\",\"Youth Psychology\"]",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Coach
            {
                Id = JamesAnderson_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                FirstName = "James",
                LastName = "Anderson",
                DateOfBirth = new DateOnly(1975, 7, 29),
                Photo = "https://placehold.co/150/3498DB/FFFFFF?text=JA",
                Email = "james.anderson@valefc.com",
                Phone = "+44 7700 900127",
                AssociationId = "SFA-21456",
                HasAccount = true,
                Role = "head-coach",
                Biography = "Veteran coach with extensive experience in Scottish football. Known for developing young talent and building strong team cultures.",
                Specializations = "[\"Team Leadership\",\"Defensive Organization\",\"Match Analysis\"]",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Coach
            {
                Id = LauraThomson_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                FirstName = "Laura",
                LastName = "Thomson",
                DateOfBirth = new DateOnly(1988, 12, 3),
                Photo = "https://placehold.co/150/F39C12/FFFFFF?text=LT",
                Email = "laura.thomson@valefc.com",
                Phone = "+44 7700 900128",
                AssociationId = "SFA-32789",
                HasAccount = false,
                Role = "fitness-coach",
                Biography = "Sports science specialist focusing on youth player physical development and injury prevention.",
                Specializations = "[\"Physical Development\",\"Injury Prevention\",\"Nutrition\"]",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            }
        };
    }
}

using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class ClubSeedData
{
    // Club IDs from TypeScript data
    public static readonly Guid ValeFC_Id = Guid.Parse("8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b");
    public static readonly Guid RentonUnited_Id = Guid.Parse("7d3c8b1a-0e2f-4d5e-6b7c-8d9e0f1a2b3c");

    public static List<Club> GetClubs()
    {
        var now = DateTime.UtcNow;
        
        return new List<Club>
        {
            new Club
            {
                Id = ValeFC_Id,
                Name = "Vale Football Club",
                ShortName = "Vale FC",
                Logo = "/assets/vale-crest.jpg",
                PrimaryColor = "#1a472a",
                SecondaryColor = "#ffd700",
                AccentColor = "#ffffff",
                City = "Vale",
                Country = "England",
                Venue = "Community Sports Ground",
                Address = "123 Football Lane, Vale",
                FoundedYear = 1950,
                History = "Founded in 1950, Vale Football Club has been a cornerstone of the local community for over 70 years. Starting as a small amateur team, we have grown to support players of all ages and abilities.",
                Ethos = "Vale FC is committed to providing an inclusive, welcoming environment where everyone can enjoy football. We believe in developing not just skilled players, but well-rounded individuals who embody the values of teamwork, respect, and perseverance.",
                Principles = "[\"Inclusivity - Football for everyone, regardless of age, ability, or background\",\"Community - Building strong connections within our local area\",\"Development - Nurturing talent and personal growth at every level\",\"Respect - Treating everyone with dignity on and off the pitch\",\"Fun - Ensuring football remains enjoyable for all participants\"]",
                CreatedAt = now,
                UpdatedAt = now
            },
            new Club
            {
                Id = RentonUnited_Id,
                Name = "Renton United",
                ShortName = "Renton",
                Logo = "/assets/renton-crest.jpg",
                PrimaryColor = "#CC0014",
                SecondaryColor = "#000000",
                AccentColor = null,
                City = "Riverside",
                Country = "England",
                Venue = "Riverside Stadium",
                Address = null,
                FoundedYear = 1985,
                History = "Riverside United was established in 1985 by a group of local enthusiasts.",
                Ethos = "Excellence through teamwork and dedication.",
                Principles = null,
                CreatedAt = now,
                UpdatedAt = now
            }
        };
    }
}

using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class DrillTemplateSeedData
{
    // Drill Template IDs
    public static readonly Guid Template_TechnicalFoundations_Id = Guid.Parse("d01a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c");
    public static readonly Guid Template_TacticalDevelopment_Id = Guid.Parse("d02b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d");
    public static readonly Guid Template_MatchPreparation_Id = Guid.Parse("d03c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e");

    public static List<DrillTemplate> GetDrillTemplates()
    {
        var now = DateTime.UtcNow;
        
        return new List<DrillTemplate>
        {
            new DrillTemplate
            {
                Id = Template_TechnicalFoundations_Id,
                Name = "Technical Foundations",
                Description = "Focus on fundamental ball skills - passing, dribbling, and first touch",
                AggregatedAttributes = "[\"shortPassing\",\"ballControl\",\"dribbling\",\"agility\",\"communication\"]",
                TotalDuration = 25,
                Category = "technical",
                ClubId = ClubSeedData.ValeFC_Id,
                IsPublic = true,
                CreatedAt = now
            },
            new DrillTemplate
            {
                Id = Template_TacticalDevelopment_Id,
                Name = "Possession Play",
                Description = "Small-sided games focusing on keeping the ball and building play",
                AggregatedAttributes = "[\"shortPassing\",\"positioning\",\"awareness\",\"vision\",\"ballControl\",\"communication\"]",
                TotalDuration = 30,
                Category = "tactical",
                ClubId = ClubSeedData.ValeFC_Id,
                IsPublic = true,
                CreatedAt = now
            },
            new DrillTemplate
            {
                Id = Template_MatchPreparation_Id,
                Name = "Finishing Practice",
                Description = "Improve accuracy and confidence in front of goal",
                AggregatedAttributes = "[\"finishing\",\"shotPower\",\"composure\",\"crossing\",\"heading\",\"attackingPosition\"]",
                TotalDuration = 40,
                Category = "technical",
                ClubId = ClubSeedData.ValeFC_Id,
                IsPublic = true,
                CreatedAt = now
            }
        };
    }
}

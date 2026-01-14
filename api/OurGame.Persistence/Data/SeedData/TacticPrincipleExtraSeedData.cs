using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class TacticPrincipleExtraSeedData
{
    public static List<TacticPrinciple> GetAdditionalTacticPrinciples()
    {
        // Note: TacticPrincipleSeedData already has one principle
        // Adding more principles from tactics.ts data
        return new List<TacticPrinciple>
        {
            new TacticPrinciple
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                Title = "Press High",
                Description = "Immediately press the opposition when they have the ball in their defensive third. Force them to play long or make mistakes.",
                PositionIndices = "9,10" // Strikers
            },
            new TacticPrinciple
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                Title = "Stay Compact",
                Description = "Keep distances between units tight. No more than 10 yards between each line of defense.",
                PositionIndices = "" // All players
            },
            new TacticPrinciple
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                Title = "Quick Transition",
                Description = "When we win the ball, look to play forward immediately. Maximum 3 touches before a forward pass.",
                PositionIndices = "5,6,7,8" // Midfielders and wingers
            },
            new TacticPrinciple
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                Title = "Force Play Wide",
                Description = "Block central passing lanes to force opposition to play wide where we can trap the ball.",
                PositionIndices = "6,7,9,10" // Central midfielders and strikers
            },
            // Principles for 4-3-3 formation
            new TacticPrinciple
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_433_Attack_Id,
                Title = "Wide Attacking Play",
                Description = "Utilize width with wingers staying wide to stretch the defense and create space for central players.",
                PositionIndices = "7,11" // Wingers
            },
            new TacticPrinciple
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_433_Attack_Id,
                Title = "High Line Defense",
                Description = "Push defensive line up to compress space and maintain possession in opponent's half.",
                PositionIndices = "2,3,4,5" // Defenders
            }
        };
    }
}

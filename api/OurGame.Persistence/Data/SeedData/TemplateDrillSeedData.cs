using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class TemplateDrillSeedData
{
    public static List<TemplateDrill> GetTemplateDrills()
    {
        var now = DateTime.UtcNow;
        
        return new List<TemplateDrill>
        {
            // Technical Foundations Template drills
            new TemplateDrill
            {
                Id = Guid.NewGuid(),
                TemplateId = DrillTemplateSeedData.Template_TechnicalFoundations_Id,
                DrillId = DrillSeedData.Drill_PassingSquares_Id,
                DrillOrder = 1,
            },
            new TemplateDrill
            {
                Id = Guid.NewGuid(),
                TemplateId = DrillTemplateSeedData.Template_TechnicalFoundations_Id,
                DrillId = DrillSeedData.Drill_1v1_Id,
                DrillOrder = 2,
            },
            new TemplateDrill
            {
                Id = Guid.NewGuid(),
                TemplateId = DrillTemplateSeedData.Template_TechnicalFoundations_Id,
                DrillId = DrillSeedData.Drill_ShootingCircuit_Id,
                DrillOrder = 3,
            },
            // Tactical Development Template drills
            new TemplateDrill
            {
                Id = Guid.NewGuid(),
                TemplateId = DrillTemplateSeedData.Template_TacticalDevelopment_Id,
                DrillId = DrillSeedData.Drill_PositionalPlay_Id,
                DrillOrder = 1,
            },
            new TemplateDrill
            {
                Id = Guid.NewGuid(),
                TemplateId = DrillTemplateSeedData.Template_TacticalDevelopment_Id,
                DrillId = DrillSeedData.Drill_SmallSidedGame_Id,
                DrillOrder = 2,
            },
            // Match Preparation Template drills
            new TemplateDrill
            {
                Id = Guid.NewGuid(),
                TemplateId = DrillTemplateSeedData.Template_MatchPreparation_Id,
                DrillId = DrillSeedData.Drill_PassingSquares_Id,
                DrillOrder = 1,
            },
            new TemplateDrill
            {
                Id = Guid.NewGuid(),
                TemplateId = DrillTemplateSeedData.Template_MatchPreparation_Id,
                DrillId = DrillSeedData.Drill_PositionalPlay_Id,
                DrillOrder = 2,
            },
            new TemplateDrill
            {
                Id = Guid.NewGuid(),
                TemplateId = DrillTemplateSeedData.Template_MatchPreparation_Id,
                DrillId = DrillSeedData.Drill_SmallSidedGame_Id,
                DrillOrder = 3,
            }
        };
    }
}

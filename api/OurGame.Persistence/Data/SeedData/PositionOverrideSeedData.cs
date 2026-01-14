using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class PositionOverrideSeedData
{
    public static List<PositionOverride> GetPositionOverrides()
    {
        // From tactics.ts - 4-4-2 High Press formation overrides
        return new List<PositionOverride>
        {
            // CM (left) - direction South
            new PositionOverride
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                PositionIndex = 6,
                Direction = "S"
            },
            // CM (right) - direction South
            new PositionOverride
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                PositionIndex = 7,
                Direction = "S"
            },
            // ST (left) - push higher up the pitch
            new PositionOverride
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                PositionIndex = 9,
                YCoord = 85,
                Direction = "N"
            },
            // ST (right) - push higher up the pitch
            new PositionOverride
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                PositionIndex = 10,
                YCoord = 85,
                Direction = "N"
            }
        };
    }
}

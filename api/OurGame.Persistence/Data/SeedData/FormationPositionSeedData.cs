using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class FormationPositionSeedData
{
    public static List<FormationPosition> GetFormationPositions()
    {
        var now = DateTime.UtcNow;
        
        return new List<FormationPosition>
        {
            // 4-4-2 Classic Formation positions
            // Goalkeeper
            new FormationPosition
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                Position = PlayerPosition.GK,
                XCoord = 50.0m,
                YCoord = 5.0m,
            },
            // Defenders
            new FormationPosition
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                Position = PlayerPosition.LB,
                XCoord = 20.0m,
                YCoord = 25.0m,
            },
            new FormationPosition
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                Position = PlayerPosition.CB,
                XCoord = 40.0m,
                YCoord = 20.0m,
            },
            new FormationPosition
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                Position = PlayerPosition.CB,
                XCoord = 60.0m,
                YCoord = 20.0m,
            },
            new FormationPosition
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                Position = PlayerPosition.RB,
                XCoord = 80.0m,
                YCoord = 25.0m,
            },
            // Midfielders
            new FormationPosition
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                Position = PlayerPosition.LM,
                XCoord = 20.0m,
                YCoord = 50.0m,
            },
            new FormationPosition
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                Position = PlayerPosition.CM,
                XCoord = 40.0m,
                YCoord = 50.0m,
            },
            new FormationPosition
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                Position = PlayerPosition.CM,
                XCoord = 60.0m,
                YCoord = 50.0m,
            },
            new FormationPosition
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                Position = PlayerPosition.RM,
                XCoord = 80.0m,
                YCoord = 50.0m,
            },
            // Forwards
            new FormationPosition
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                Position = PlayerPosition.ST,
                XCoord = 40.0m,
                YCoord = 80.0m,
            },
            new FormationPosition
            {
                Id = Guid.NewGuid(),
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                Position = PlayerPosition.ST,
                XCoord = 60.0m,
                YCoord = 80.0m,
            }
        };
    }
}

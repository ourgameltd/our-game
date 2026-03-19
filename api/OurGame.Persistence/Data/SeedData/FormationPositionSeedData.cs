using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class FormationPositionSeedData
{
    public static List<FormationPosition> GetFormationPositions()
    {
        var positionsByFormation = new Dictionary<Guid, List<(PlayerPosition Position, decimal XCoord, decimal YCoord)>>
        {
            [FormationSeedData.Formation_442_Classic_Id] = new List<(PlayerPosition Position, decimal XCoord, decimal YCoord)>
            {
                (PlayerPosition.GK, 50.0m, 5.0m),
                (PlayerPosition.LB, 20.0m, 25.0m),
                (PlayerPosition.CB, 40.0m, 20.0m),
                (PlayerPosition.CB, 60.0m, 20.0m),
                (PlayerPosition.RB, 80.0m, 25.0m),
                (PlayerPosition.LM, 20.0m, 50.0m),
                (PlayerPosition.CM, 40.0m, 50.0m),
                (PlayerPosition.CM, 60.0m, 50.0m),
                (PlayerPosition.RM, 80.0m, 50.0m),
                (PlayerPosition.ST, 40.0m, 80.0m),
                (PlayerPosition.ST, 60.0m, 80.0m)
            },
            [FormationSeedData.Formation_433_Attack_Id] = new List<(PlayerPosition Position, decimal XCoord, decimal YCoord)>
            {
                (PlayerPosition.GK, 50.0m, 5.0m),
                (PlayerPosition.LB, 20.0m, 25.0m),
                (PlayerPosition.CB, 40.0m, 20.0m),
                (PlayerPosition.CB, 60.0m, 20.0m),
                (PlayerPosition.RB, 80.0m, 25.0m),
                (PlayerPosition.CDM, 50.0m, 38.0m),
                (PlayerPosition.CM, 35.0m, 55.0m),
                (PlayerPosition.CM, 65.0m, 55.0m),
                (PlayerPosition.LW, 20.0m, 75.0m),
                (PlayerPosition.ST, 50.0m, 82.0m),
                (PlayerPosition.RW, 80.0m, 75.0m)
            },
            [FormationSeedData.Formation_352_Id] = new List<(PlayerPosition Position, decimal XCoord, decimal YCoord)>
            {
                (PlayerPosition.GK, 50.0m, 5.0m),
                (PlayerPosition.CB, 28.0m, 20.0m),
                (PlayerPosition.CB, 50.0m, 18.0m),
                (PlayerPosition.CB, 72.0m, 20.0m),
                (PlayerPosition.LWB, 15.0m, 45.0m),
                (PlayerPosition.CM, 35.0m, 50.0m),
                (PlayerPosition.CDM, 50.0m, 42.0m),
                (PlayerPosition.CM, 65.0m, 50.0m),
                (PlayerPosition.RWB, 85.0m, 45.0m),
                (PlayerPosition.ST, 40.0m, 80.0m),
                (PlayerPosition.ST, 60.0m, 80.0m)
            },
            [FormationSeedData.Formation_4231_Id] = new List<(PlayerPosition Position, decimal XCoord, decimal YCoord)>
            {
                (PlayerPosition.GK, 50.0m, 5.0m),
                (PlayerPosition.LB, 20.0m, 25.0m),
                (PlayerPosition.CB, 40.0m, 20.0m),
                (PlayerPosition.CB, 60.0m, 20.0m),
                (PlayerPosition.RB, 80.0m, 25.0m),
                (PlayerPosition.CDM, 38.0m, 42.0m),
                (PlayerPosition.CDM, 62.0m, 42.0m),
                (PlayerPosition.LW, 20.0m, 68.0m),
                (PlayerPosition.CAM, 50.0m, 65.0m),
                (PlayerPosition.RW, 80.0m, 68.0m),
                (PlayerPosition.ST, 50.0m, 85.0m)
            },
            [FormationSeedData.Formation_332_Id] = new List<(PlayerPosition Position, decimal XCoord, decimal YCoord)>
            {
                (PlayerPosition.GK, 50.0m, 5.0m),
                (PlayerPosition.CB, 25.0m, 22.0m),
                (PlayerPosition.CB, 50.0m, 18.0m),
                (PlayerPosition.CB, 75.0m, 22.0m),
                (PlayerPosition.LM, 20.0m, 50.0m),
                (PlayerPosition.CM, 50.0m, 50.0m),
                (PlayerPosition.RM, 80.0m, 50.0m),
                (PlayerPosition.ST, 38.0m, 78.0m),
                (PlayerPosition.ST, 62.0m, 78.0m)
            },
            [FormationSeedData.Formation_233_Id] = new List<(PlayerPosition Position, decimal XCoord, decimal YCoord)>
            {
                (PlayerPosition.GK, 50.0m, 5.0m),
                (PlayerPosition.CB, 35.0m, 22.0m),
                (PlayerPosition.CB, 65.0m, 22.0m),
                (PlayerPosition.LM, 20.0m, 50.0m),
                (PlayerPosition.CM, 50.0m, 48.0m),
                (PlayerPosition.RM, 80.0m, 50.0m),
                (PlayerPosition.LW, 20.0m, 78.0m),
                (PlayerPosition.ST, 50.0m, 82.0m),
                (PlayerPosition.RW, 80.0m, 78.0m)
            },
            [FormationSeedData.Formation_431_Id] = new List<(PlayerPosition Position, decimal XCoord, decimal YCoord)>
            {
                (PlayerPosition.GK, 50.0m, 5.0m),
                (PlayerPosition.LB, 18.0m, 26.0m),
                (PlayerPosition.CB, 40.0m, 20.0m),
                (PlayerPosition.CB, 60.0m, 20.0m),
                (PlayerPosition.RB, 82.0m, 26.0m),
                (PlayerPosition.LM, 25.0m, 52.0m),
                (PlayerPosition.CM, 50.0m, 50.0m),
                (PlayerPosition.RM, 75.0m, 52.0m),
                (PlayerPosition.ST, 50.0m, 82.0m)
            },
            [FormationSeedData.Formation_231_Id] = new List<(PlayerPosition Position, decimal XCoord, decimal YCoord)>
            {
                (PlayerPosition.GK, 50.0m, 5.0m),
                (PlayerPosition.CB, 35.0m, 24.0m),
                (PlayerPosition.CB, 65.0m, 24.0m),
                (PlayerPosition.LM, 20.0m, 52.0m),
                (PlayerPosition.CM, 50.0m, 50.0m),
                (PlayerPosition.RM, 80.0m, 52.0m),
                (PlayerPosition.ST, 50.0m, 82.0m)
            },
            [FormationSeedData.Formation_222_Id] = new List<(PlayerPosition Position, decimal XCoord, decimal YCoord)>
            {
                (PlayerPosition.GK, 50.0m, 5.0m),
                (PlayerPosition.CB, 35.0m, 24.0m),
                (PlayerPosition.CB, 65.0m, 24.0m),
                (PlayerPosition.CM, 38.0m, 52.0m),
                (PlayerPosition.CM, 62.0m, 52.0m),
                (PlayerPosition.ST, 38.0m, 80.0m),
                (PlayerPosition.ST, 62.0m, 80.0m)
            },
            [FormationSeedData.Formation_5aside_121_Id] = new List<(PlayerPosition Position, decimal XCoord, decimal YCoord)>
            {
                (PlayerPosition.GK, 50.0m, 5.0m),
                (PlayerPosition.CB, 50.0m, 28.0m),
                (PlayerPosition.CM, 32.0m, 56.0m),
                (PlayerPosition.CM, 68.0m, 56.0m),
                (PlayerPosition.ST, 50.0m, 82.0m)
            },
            [FormationSeedData.Formation_4aside_121_Id] = new List<(PlayerPosition Position, decimal XCoord, decimal YCoord)>
            {
                (PlayerPosition.GK, 50.0m, 5.0m),
                (PlayerPosition.CB, 50.0m, 30.0m),
                (PlayerPosition.CM, 50.0m, 58.0m),
                (PlayerPosition.ST, 50.0m, 82.0m)
            }
        };

        var systemFormations = FormationSeedData.GetFormations()
            .Where(formation => FormationSeedData.SystemFormationIds.Contains(formation.Id))
            .ToList();

        var missingFormationIds = FormationSeedData.SystemFormationIds
            .Where(formationId => !positionsByFormation.ContainsKey(formationId))
            .ToList();

        if (missingFormationIds.Count > 0)
        {
            throw new InvalidOperationException(
                $"Formation position seed data is missing definitions for system formation IDs: {string.Join(", ", missingFormationIds)}");
        }

        var incompleteFormations = systemFormations
            .Where(formation => positionsByFormation[formation.Id].Count != (int)formation.SquadSize)
            .Select(formation => $"{formation.Name} expects {(int)formation.SquadSize} positions but has {positionsByFormation[formation.Id].Count}")
            .ToList();

        if (incompleteFormations.Count > 0)
        {
            throw new InvalidOperationException(
                $"Formation position seed data is incomplete: {string.Join("; ", incompleteFormations)}");
        }

        return FormationSeedData.SystemFormationIds
            .SelectMany(formationId => positionsByFormation[formationId]
                .Select((position, index) => new FormationPosition
                {
                    Id = Guid.NewGuid(),
                    FormationId = formationId,
                    Position = position.Position,
                    XCoord = position.XCoord,
                    YCoord = position.YCoord,
                    PositionIndex = index
                }))
            .ToList();
    }
}

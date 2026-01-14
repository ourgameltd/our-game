using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class LineupPlayerSeedData
{
    public static List<LineupPlayer> GetLineupPlayers()
    {
        var now = DateTime.UtcNow;
        var lineupId = MatchLineupSeedData.Match3_Lineup_Id;
        
        return new List<LineupPlayer>
        {
            new LineupPlayer
            {
                Id = Guid.NewGuid(),
                LineupId = lineupId,
                PlayerId = PlayerSeedData.OliverThompson_Id,
                Position = "GK",
                SquadNumber = 1,
                IsStarting = true,
            },
            new LineupPlayer
            {
                Id = Guid.NewGuid(),
                LineupId = lineupId,
                PlayerId = PlayerSeedData.JamesWilson_Id,
                Position = "CB",
                SquadNumber = 4,
                IsStarting = true,
            },
            new LineupPlayer
            {
                Id = Guid.NewGuid(),
                LineupId = lineupId,
                PlayerId = PlayerSeedData.LucasMartinez_Id,
                Position = "CB",
                SquadNumber = 5,
                IsStarting = true,
            },
            new LineupPlayer
            {
                Id = Guid.NewGuid(),
                LineupId = lineupId,
                PlayerId = PlayerSeedData.EthanDavies_Id,
                Position = "CM",
                SquadNumber = 8,
                IsStarting = true,
            },
            new LineupPlayer
            {
                Id = Guid.NewGuid(),
                LineupId = lineupId,
                PlayerId = PlayerSeedData.NoahAnderson_Id,
                Position = "ST",
                SquadNumber = 9,
                IsStarting = true,
            },
            new LineupPlayer
            {
                Id = Guid.NewGuid(),
                LineupId = lineupId,
                PlayerId = PlayerSeedData.CharlieRoberts_Id,
                Position = "ST",
                SquadNumber = 11,
                IsStarting = true,
            }
        };
    }
}

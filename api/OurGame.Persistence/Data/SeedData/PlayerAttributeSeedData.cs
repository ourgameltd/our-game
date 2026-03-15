using System.Security.Cryptography;
using System.Text;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class PlayerAttributeSeedData
{
    public static List<PlayerAttribute> GetPlayerAttributes()
    {
        var now = DateTime.UtcNow;

        return PlayerSeedData.GetSourcePlayers()
            .Select(source =>
            {
                var playerId = PlayerSeedData.GetPlayerIdByName(source.Name);

                return new PlayerAttribute
                {
                    Id = UserSeedData.CreateDeterministicGuid($"player-attribute|{playerId:N}"),
                    PlayerId = playerId,
                    BallControl = DeterministicStat(playerId, "BallControl", 50, 68),
                    Crossing = DeterministicStat(playerId, "Crossing", 45, 66),
                    WeakFoot = DeterministicStat(playerId, "WeakFoot", 45, 70),
                    Dribbling = DeterministicStat(playerId, "Dribbling", 50, 70),
                    Finishing = DeterministicStat(playerId, "Finishing", 44, 68),
                    FreeKick = DeterministicStat(playerId, "FreeKick", 42, 66),
                    Heading = DeterministicStat(playerId, "Heading", 42, 66),
                    LongPassing = DeterministicStat(playerId, "LongPassing", 45, 68),
                    LongShot = DeterministicStat(playerId, "LongShot", 42, 66),
                    Penalties = DeterministicStat(playerId, "Penalties", 42, 68),
                    ShortPassing = DeterministicStat(playerId, "ShortPassing", 50, 72),
                    ShotPower = DeterministicStat(playerId, "ShotPower", 44, 68),
                    SlidingTackle = DeterministicStat(playerId, "SlidingTackle", 40, 65),
                    StandingTackle = DeterministicStat(playerId, "StandingTackle", 42, 66),
                    Volleys = DeterministicStat(playerId, "Volleys", 40, 64),
                    Acceleration = DeterministicStat(playerId, "Acceleration", 50, 74),
                    Agility = DeterministicStat(playerId, "Agility", 50, 74),
                    Balance = DeterministicStat(playerId, "Balance", 48, 72),
                    Jumping = DeterministicStat(playerId, "Jumping", 42, 68),
                    Pace = DeterministicStat(playerId, "Pace", 48, 74),
                    Reactions = DeterministicStat(playerId, "Reactions", 48, 72),
                    SprintSpeed = DeterministicStat(playerId, "SprintSpeed", 48, 74),
                    Stamina = DeterministicStat(playerId, "Stamina", 48, 73),
                    Strength = DeterministicStat(playerId, "Strength", 42, 70),
                    Aggression = DeterministicStat(playerId, "Aggression", 40, 68),
                    AttackingPosition = DeterministicStat(playerId, "AttackingPosition", 44, 70),
                    Awareness = DeterministicStat(playerId, "Awareness", 48, 72),
                    Communication = DeterministicStat(playerId, "Communication", 50, 76),
                    Composure = DeterministicStat(playerId, "Composure", 46, 72),
                    DefensivePositioning = DeterministicStat(playerId, "DefensivePositioning", 42, 68),
                    Interceptions = DeterministicStat(playerId, "Interceptions", 40, 66),
                    Marking = DeterministicStat(playerId, "Marking", 40, 66),
                    Positivity = DeterministicStat(playerId, "Positivity", 58, 80),
                    Positioning = DeterministicStat(playerId, "Positioning", 45, 70),
                    Vision = DeterministicStat(playerId, "Vision", 48, 74),
                    UpdatedAt = now
                };
            })
            .ToList();
    }

    private static int DeterministicStat(Guid playerId, string metric, int min, int max)
    {
        var hash = MD5.HashData(Encoding.UTF8.GetBytes($"{playerId:N}|{metric}"));
        var range = max - min + 1;
        return min + (hash[0] % range);
    }
}

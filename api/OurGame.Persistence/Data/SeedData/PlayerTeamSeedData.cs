using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class PlayerTeamSeedData
{
    public static List<PlayerTeam> GetPlayerTeams()
    {
        var now = DateTime.UtcNow;

        return PlayerSeedData.GetSourcePlayers()
            .Select((player, index) => new PlayerTeam
            {
                Id = UserSeedData.CreateDeterministicGuid($"player-team|{UserSeedData.NormalizeName(player.Name)}|{TeamSeedData.NormalizeTeamName(player.Team)}"),
                PlayerId = PlayerSeedData.GetPlayerIdByName(player.Name),
                TeamId = TeamSeedData.GetTeamIdByName(player.Team),
                SquadNumber = index + 1,
                AssignedAt = now
            })
            .ToList();
    }
}

using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class TeamCoachSeedData
{
    public static List<TeamCoach> GetTeamCoaches()
    {
        var now = DateTime.UtcNow;

        var uniqueAssignments = UserSeedData.GetDataset().Admins
            .GroupBy(admin => $"{TeamSeedData.NormalizeTeamName(admin.Team)}|{UserSeedData.NormalizeName(admin.Name)}")
            .Select(group => group.First())
            .ToList();

        return uniqueAssignments.Select(admin => new TeamCoach
        {
            Id = UserSeedData.CreateDeterministicGuid($"team-coach|{TeamSeedData.NormalizeTeamName(admin.Team)}|{UserSeedData.NormalizeName(admin.Name)}"),
            TeamId = TeamSeedData.GetTeamIdByName(admin.Team),
            CoachId = CoachSeedData.GetCoachIdByAdminName(admin.Name),
            Role = CoachRole.HeadCoach,
            AssignedAt = now
        }).ToList();
    }
}

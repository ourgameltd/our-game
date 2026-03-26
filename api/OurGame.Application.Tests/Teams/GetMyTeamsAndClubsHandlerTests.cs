using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Queries.GetMyTeamsAndClubs;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Teams;

public class GetMyTeamsAndClubsHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoCoachAssignments_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await db.SeedUserAsync("lonely-user");
        var handler = new GetMyTeamsAndClubsHandler(db.Context);
        var query = new GetMyTeamsAndClubsQuery("lonely-user");

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsTeamsViaCoachAssignment()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync("Vale FC");
        var (coachId, userId) = await db.SeedCoachAsync(clubId, "coach-auth");
        await db.SeedTeamCoachAsync(teamId, coachId);
        var handler = new GetMyTeamsAndClubsHandler(db.Context);
        var query = new GetMyTeamsAndClubsQuery("coach-auth");

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Single(result);
        var team = result[0];
        Assert.Equal(teamId, team.Id);
        Assert.Equal(clubId, team.ClubId);
        Assert.Equal(ageGroupId, team.AgeGroupId);
        Assert.Equal("Blues", team.Name);
        Assert.NotNull(team.Club);
        Assert.Equal("Vale FC", team.Club.Name);
    }

    [Fact]
    public async Task Handle_ExcludesArchivedTeams()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var activeTeamId = await db.SeedTeamAsync(clubId, ageGroupId, "Active");
        var archivedTeamId = await db.SeedTeamAsync(clubId, ageGroupId, "Archived", isArchived: true);
        var (coachId, _) = await db.SeedCoachAsync(clubId, "coach-auth");
        await db.SeedTeamCoachAsync(activeTeamId, coachId);
        await db.SeedTeamCoachAsync(archivedTeamId, coachId);
        var handler = new GetMyTeamsAndClubsHandler(db.Context);
        var query = new GetMyTeamsAndClubsQuery("coach-auth");

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("Active", result[0].Name);
    }

    [Fact]
    public async Task Handle_ReturnsMultipleTeams()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var team1 = await db.SeedTeamAsync(clubId, ageGroupId, "Blues");
        var team2 = await db.SeedTeamAsync(clubId, ageGroupId, "Reds");
        var (coachId, _) = await db.SeedCoachAsync(clubId, "coach-auth");
        await db.SeedTeamCoachAsync(team1, coachId);
        await db.SeedTeamCoachAsync(team2, coachId);
        var handler = new GetMyTeamsAndClubsHandler(db.Context);
        var query = new GetMyTeamsAndClubsQuery("coach-auth");

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Equal(2, result.Count);
    }
}

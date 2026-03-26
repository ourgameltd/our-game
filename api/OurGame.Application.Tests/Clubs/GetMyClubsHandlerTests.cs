using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Clubs.Queries.GetMyClubs;

namespace OurGame.Application.Tests.Clubs;

public class GetMyClubsHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserHasNoAccess_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetMyClubsHandler(db.Context);
        var query = new GetMyClubsQuery("no-such-auth-id");

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_WhenUserIsCoach_ReturnsClubsViaTeamCoaches()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync("Coach Club");
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var teamId = await db.SeedTeamAsync(clubId, ageGroupId);
        var (coachId, userId) = await db.SeedCoachAsync(clubId, authId: "coach-auth");
        await db.SeedTeamCoachAsync(teamId, coachId);
        var handler = new GetMyClubsHandler(db.Context);
        var query = new GetMyClubsQuery("coach-auth");

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("Coach Club", result[0].Name);
    }

    [Fact]
    public async Task Handle_WhenUserIsPlayer_ReturnsClubsViaPlayerAccess()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync("Player Club");
        var userId = await db.SeedUserAsync("player-auth");
        await db.SeedPlayerAsync(clubId, userId: userId);
        var handler = new GetMyClubsHandler(db.Context);
        var query = new GetMyClubsQuery("player-auth");

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("Player Club", result[0].Name);
    }

    [Fact]
    public async Task Handle_ReturnsDtoWithColorAndCountFields()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync("My Club");
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var teamId = await db.SeedTeamAsync(clubId, ageGroupId);
        var (coachId, userId) = await db.SeedCoachAsync(clubId, authId: "full-auth");
        await db.SeedTeamCoachAsync(teamId, coachId);
        var handler = new GetMyClubsHandler(db.Context);
        var query = new GetMyClubsQuery("full-auth");

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Single(result);
        var club = result[0];
        Assert.Equal(clubId, club.Id);
        Assert.Equal("My Club", club.Name);
        Assert.Equal("#ff0000", club.PrimaryColor);
        Assert.Equal("#ffffff", club.SecondaryColor);
        Assert.Equal("#000000", club.AccentColor);
    }
}

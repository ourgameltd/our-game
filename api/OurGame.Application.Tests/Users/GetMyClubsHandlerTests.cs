using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Users.Queries.GetMyClubs;

namespace OurGame.Application.Tests.Users;

public class GetMyClubsHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoClubs_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();

        var handler = new GetMyClubsHandler(db.Context);
        var result = await handler.Handle(new GetMyClubsQuery("unknown-user"), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsClubWhereUserIsCoach()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (_, userId) = await db.SeedCoachAsync(clubId: clubId);
        var user = await db.Context.Users.FindAsync(userId);

        var handler = new GetMyClubsHandler(db.Context);
        var result = await handler.Handle(new GetMyClubsQuery(user!.AuthId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(clubId, result[0].Id);
    }

    [Fact]
    public async Task Handle_ReturnsClubWhereUserIsPlayer()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerUserId = await db.SeedUserAsync("player-auth");
        var playerId = await db.SeedPlayerAsync(clubId: clubId, userId: playerUserId);
        var user = await db.Context.Users.FindAsync(playerUserId);

        var handler = new GetMyClubsHandler(db.Context);
        var result = await handler.Handle(new GetMyClubsQuery(user!.AuthId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(clubId, result[0].Id);
    }

    [Fact]
    public async Task Handle_ReturnsClubWhereUserIsParent()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var parentUserId = await db.SeedUserAsync("parent-auth");
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        // Create parent-player link via emergency contact
        db.Context.EmergencyContacts.Add(new OurGame.Persistence.Models.EmergencyContact
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            UserId = parentUserId,
            Name = "Test Parent",
            Relationship = "Parent",
            IsPrimary = true
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetMyClubsHandler(db.Context);
        var result = await handler.Handle(new GetMyClubsQuery("parent-auth"), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(clubId, result[0].Id);
    }

    [Fact]
    public async Task Handle_IncludesTeamAndPlayerCounts()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var (_, userId) = await db.SeedCoachAsync(clubId: clubId);
        await db.SeedPlayerAsync(clubId: clubId);
        await db.SeedPlayerAsync(clubId: clubId);
        var user = await db.Context.Users.FindAsync(userId);

        var handler = new GetMyClubsHandler(db.Context);
        var result = await handler.Handle(new GetMyClubsQuery(user!.AuthId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(1, result[0].TeamCount);
        Assert.Equal(2, result[0].PlayerCount);
    }
}

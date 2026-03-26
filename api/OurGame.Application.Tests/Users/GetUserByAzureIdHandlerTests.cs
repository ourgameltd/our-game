using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId;

namespace OurGame.Application.Tests.Users;

public class GetUserByAzureIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserNotFound_ReturnsNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetUserByAzureIdHandler(db.Context);

        var result = await handler.Handle(new GetUserByAzureIdQuery("non-existent-auth"), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenUserExists_ReturnsMappedDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var userId = await db.SeedUserAsync("auth-123");
        var handler = new GetUserByAzureIdHandler(db.Context);

        var result = await handler.Handle(new GetUserByAzureIdQuery("auth-123"), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(userId, result.Id);
        Assert.Equal("auth-123", result.AuthId);
        Assert.Equal("auth-123@test.com", result.Email);
        Assert.Equal("Test", result.FirstName);
        Assert.Equal("User", result.LastName);
    }

    [Fact]
    public async Task Handle_WhenPlayerAssociated_IncludesPlayerId()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var userId = await db.SeedUserAsync("auth-player");
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId: clubId);
        var teamId = await db.SeedTeamAsync(ageGroupId: ageGroupId, clubId: clubId);
        var playerId = await db.SeedPlayerAsync(clubId: clubId, userId: userId);

        var handler = new GetUserByAzureIdHandler(db.Context);
        var result = await handler.Handle(new GetUserByAzureIdQuery("auth-player"), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(playerId, result.PlayerId);
        Assert.Null(result.CoachId);
    }

    [Fact]
    public async Task Handle_WhenCoachAssociated_IncludesCoachId()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, userId) = await db.SeedCoachAsync(clubId: clubId);

        var handler = new GetUserByAzureIdHandler(db.Context);

        // Need to get the user's auth ID
        var user = await db.Context.Users.FindAsync(userId);
        Assert.NotNull(user);

        var result = await handler.Handle(new GetUserByAzureIdQuery(user!.AuthId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(coachId, result.CoachId);
    }

    [Fact]
    public async Task Handle_WhenNoAssociations_PlayerIdAndCoachIdAreNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await db.SeedUserAsync("standalone-user");

        var handler = new GetUserByAzureIdHandler(db.Context);
        var result = await handler.Handle(new GetUserByAzureIdQuery("standalone-user"), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Null(result.PlayerId);
        Assert.Null(result.CoachId);
    }
}

using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Queries.GetTrainingSessionsByTeamId;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Teams;

public class GetTrainingSessionsByTeamIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenTeamNotFound_ThrowsKeyNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetTrainingSessionsByTeamIdHandler(db.Context);

        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            handler.Handle(new GetTrainingSessionsByTeamIdQuery(Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ReturnsSessions()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId, SessionStatus.Scheduled);

        var handler = new GetTrainingSessionsByTeamIdHandler(db.Context);
        var result = await handler.Handle(new GetTrainingSessionsByTeamIdQuery(teamId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(result.Team);
        Assert.Equal(teamId, result.Team.Id);
        Assert.NotNull(result.Club);
        Assert.Equal(clubId, result.Club.Id);
        Assert.Single(result.Sessions);
        Assert.Equal(sessionId, result.Sessions[0].Id);
        Assert.Equal(1, result.TotalCount);
    }

    [Fact]
    public async Task Handle_WhenNoSessions_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();

        var handler = new GetTrainingSessionsByTeamIdHandler(db.Context);
        var result = await handler.Handle(new GetTrainingSessionsByTeamIdQuery(teamId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(teamId, result.Team.Id);
        Assert.Empty(result.Sessions);
        Assert.Equal(0, result.TotalCount);
    }
}

using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Clubs.Queries.GetTrainingSessionsByClubId;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Clubs;

public class GetTrainingSessionsByClubIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoSessions_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();

        var handler = new GetTrainingSessionsByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetTrainingSessionsByClubIdQuery(clubId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Empty(result.Sessions);
        Assert.Equal(0, result.TotalCount);
    }

    [Fact]
    public async Task Handle_ReturnsSessions()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId, SessionStatus.Scheduled);

        var handler = new GetTrainingSessionsByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetTrainingSessionsByClubIdQuery(clubId), CancellationToken.None);

        Assert.Single(result.Sessions);
        Assert.Equal(sessionId, result.Sessions[0].Id);
        Assert.Equal(1, result.TotalCount);
    }

    [Fact]
    public async Task Handle_FiltersByTeamId()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId1) = await db.SeedClubWithTeamAsync();
        var teamId2 = await db.SeedTeamAsync(clubId, ageGroupId, "Reds");

        await db.SeedTrainingSessionAsync(teamId1, SessionStatus.Scheduled);
        var session2Id = await db.SeedTrainingSessionAsync(teamId2, SessionStatus.Scheduled);

        var handler = new GetTrainingSessionsByClubIdHandler(db.Context);
        var result = await handler.Handle(
            new GetTrainingSessionsByClubIdQuery(clubId, TeamId: teamId2), CancellationToken.None);

        Assert.Single(result.Sessions);
        Assert.Equal(session2Id, result.Sessions[0].Id);
    }
}

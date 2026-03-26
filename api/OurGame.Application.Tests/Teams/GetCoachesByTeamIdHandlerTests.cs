using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Teams;

public class GetCoachesByTeamIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoCoaches_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new GetCoachesByTeamIdHandler(db.Context);
        var query = new GetCoachesByTeamIdQuery(teamId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsMappedCoachDtos()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId, firstName: "Jane", lastName: "Smith", role: CoachRole.HeadCoach);
        await db.SeedTeamCoachAsync(teamId, coachId, CoachRole.HeadCoach);
        var handler = new GetCoachesByTeamIdHandler(db.Context);
        var query = new GetCoachesByTeamIdQuery(teamId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Single(result);
        var coach = result[0];
        Assert.Equal(coachId, coach.Id);
        Assert.Equal("Jane", coach.FirstName);
        Assert.Equal("Smith", coach.LastName);
        Assert.Equal("HeadCoach", coach.Role);
        Assert.False(coach.IsArchived);
    }

    [Fact]
    public async Task Handle_ReturnsMultipleCoaches()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var (coach1Id, _) = await db.SeedCoachAsync(clubId, "auth1", "Head", "Coach", CoachRole.HeadCoach);
        var (coach2Id, _) = await db.SeedCoachAsync(clubId, "auth2", "Assistant", "Coach", CoachRole.AssistantCoach);
        await db.SeedTeamCoachAsync(teamId, coach1Id, CoachRole.HeadCoach);
        await db.SeedTeamCoachAsync(teamId, coach2Id, CoachRole.AssistantCoach);
        var handler = new GetCoachesByTeamIdHandler(db.Context);
        var query = new GetCoachesByTeamIdQuery(teamId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Equal(2, result.Count);
    }
}

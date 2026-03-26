using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.AgeGroups.Queries.GetCoachesByAgeGroupId;

namespace OurGame.Application.Tests.AgeGroups;

public class GetCoachesByAgeGroupIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoCoaches_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);

        var handler = new GetCoachesByAgeGroupIdHandler(db.Context);
        var result = await handler.Handle(new GetCoachesByAgeGroupIdQuery(ageGroupId), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsCoachesAssignedToAgeGroupTeams()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);

        db.Context.Set<OurGame.Persistence.Models.TeamCoach>().Add(new OurGame.Persistence.Models.TeamCoach
        {
            Id = Guid.NewGuid(),
            TeamId = teamId,
            CoachId = coachId,
            Role = 0
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetCoachesByAgeGroupIdHandler(db.Context);
        var result = await handler.Handle(new GetCoachesByAgeGroupIdQuery(ageGroupId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(coachId, result[0].Id);
    }

    [Fact]
    public async Task Handle_ExcludesArchivedCoaches()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId, isArchived: true);

        db.Context.Set<OurGame.Persistence.Models.TeamCoach>().Add(new OurGame.Persistence.Models.TeamCoach
        {
            Id = Guid.NewGuid(),
            TeamId = teamId,
            CoachId = coachId,
            Role = 0
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetCoachesByAgeGroupIdHandler(db.Context);
        var result = await handler.Handle(new GetCoachesByAgeGroupIdQuery(ageGroupId), CancellationToken.None);

        Assert.Empty(result);
    }
}

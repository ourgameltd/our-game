using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachById;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Coaches;

public class GetCoachByIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNotFound_ReturnsNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetCoachByIdHandler(db.Context);

        var result = await handler.Handle(new GetCoachByIdQuery(Guid.NewGuid()), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenExists_ReturnsMappedDetail()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, userId) = await db.SeedCoachAsync(clubId: clubId, firstName: "Jane", lastName: "Smith");

        var handler = new GetCoachByIdHandler(db.Context);
        var result = await handler.Handle(new GetCoachByIdQuery(coachId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(coachId, result.Id);
        Assert.Equal("Jane", result.FirstName);
        Assert.Equal("Smith", result.LastName);
        Assert.Equal(clubId, result.ClubId);
        Assert.Equal("HeadCoach", result.Role);
        Assert.False(result.IsArchived);
    }

    [Fact]
    public async Task Handle_IncludesTeamAssignments()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var (coachId, userId) = await db.SeedCoachAsync(clubId: clubId);

        // Assign coach to team
        db.Context.Set<TeamCoach>().Add(new TeamCoach
        {
            Id = Guid.NewGuid(),
            TeamId = teamId,
            CoachId = coachId,
            Role = 0
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetCoachByIdHandler(db.Context);
        var result = await handler.Handle(new GetCoachByIdQuery(coachId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result.TeamAssignments);
        Assert.Equal(teamId, result.TeamAssignments[0].TeamId);
        Assert.Equal(ageGroupId, result.TeamAssignments[0].AgeGroupId);
    }

    [Fact]
    public async Task Handle_IncludesCoordinatorRoles()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var (coachId, userId) = await db.SeedCoachAsync(clubId: clubId);

        // Assign coordinator role
        db.Context.AgeGroupCoordinators.Add(new AgeGroupCoordinator
        {
            Id = Guid.NewGuid(),
            AgeGroupId = ageGroupId,
            CoachId = coachId
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetCoachByIdHandler(db.Context);
        var result = await handler.Handle(new GetCoachByIdQuery(coachId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result.CoordinatorRoles);
        Assert.Equal(ageGroupId, result.CoordinatorRoles[0].AgeGroupId);
    }

    [Fact]
    public async Task Handle_ParsesJsonSpecializations()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, userId) = await db.SeedCoachAsync(clubId: clubId);

        var coach = await db.Context.Coaches.FindAsync(coachId);
        coach!.Specializations = "[\"Youth Development\",\"Tactical Training\"]";
        await db.Context.SaveChangesAsync();

        var handler = new GetCoachByIdHandler(db.Context);
        var result = await handler.Handle(new GetCoachByIdQuery(coachId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(2, result.Specializations.Count);
        Assert.Contains("Youth Development", result.Specializations);
        Assert.Contains("Tactical Training", result.Specializations);
    }
}

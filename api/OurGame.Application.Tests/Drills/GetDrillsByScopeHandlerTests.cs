using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Drills.Queries.GetDrillsByScope;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Drills;

public class GetDrillsByScopeHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoDrills_ReturnsEmptyLists()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();

        var handler = new GetDrillsByScopeHandler(db.Context);
        var result = await handler.Handle(new GetDrillsByScopeQuery(clubId), CancellationToken.None);

        Assert.Empty(result.Drills);
        Assert.Empty(result.InheritedDrills);
        Assert.Equal(0, result.TotalCount);
    }

    [Fact]
    public async Task Handle_ClubScope_ReturnsDrillsLinkedToClub()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var drillId = await db.SeedDrillAsync(name: "Club Drill");

        db.Context.Set<DrillClub>().Add(new DrillClub
        {
            Id = Guid.NewGuid(),
            DrillId = drillId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetDrillsByScopeHandler(db.Context);
        var result = await handler.Handle(new GetDrillsByScopeQuery(clubId), CancellationToken.None);

        Assert.Single(result.Drills);
        Assert.Equal("Club Drill", result.Drills[0].Name);
        Assert.Equal(1, result.TotalCount);
    }

    [Fact]
    public async Task Handle_TeamScope_InheritsClubDrills()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId: clubId);
        var teamId = await db.SeedTeamAsync(ageGroupId: ageGroupId, clubId: clubId);
        var drillId = await db.SeedDrillAsync(name: "Club-Level Drill");

        db.Context.Set<DrillClub>().Add(new DrillClub
        {
            Id = Guid.NewGuid(),
            DrillId = drillId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetDrillsByScopeHandler(db.Context);
        var result = await handler.Handle(new GetDrillsByScopeQuery(clubId, ageGroupId, teamId), CancellationToken.None);

        Assert.Empty(result.Drills); // no team-level drills
        Assert.Single(result.InheritedDrills); // inherited from club
        Assert.Equal("Club-Level Drill", result.InheritedDrills[0].Name);
    }

    [Fact]
    public async Task Handle_TeamScope_SeparatesTeamAndInherited()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId: clubId);
        var teamId = await db.SeedTeamAsync(ageGroupId: ageGroupId, clubId: clubId);

        var clubDrillId = await db.SeedDrillAsync(name: "AAA Club Drill");
        db.Context.Set<DrillClub>().Add(new DrillClub
        {
            Id = Guid.NewGuid(),
            DrillId = clubDrillId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });

        var teamDrillId = await db.SeedDrillAsync(name: "BBB Team Drill");
        db.Context.Set<DrillTeam>().Add(new DrillTeam
        {
            Id = Guid.NewGuid(),
            DrillId = teamDrillId,
            TeamId = teamId,
            SharedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetDrillsByScopeHandler(db.Context);
        var result = await handler.Handle(new GetDrillsByScopeQuery(clubId, ageGroupId, teamId), CancellationToken.None);

        Assert.Single(result.Drills);
        Assert.Equal("BBB Team Drill", result.Drills[0].Name);
        Assert.Single(result.InheritedDrills);
        Assert.Equal("AAA Club Drill", result.InheritedDrills[0].Name);
        Assert.Equal(2, result.TotalCount);
    }
}

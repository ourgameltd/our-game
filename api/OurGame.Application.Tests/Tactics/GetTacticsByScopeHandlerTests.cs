using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticsByScope;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Tactics;

public class GetTacticsByScopeHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoTactics_ReturnsEmptyLists()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();

        var handler = new GetTacticsByScopeHandler(db.Context);
        var result = await handler.Handle(new GetTacticsByScopeQuery(clubId), CancellationToken.None);

        Assert.Empty(result.ScopeTactics);
        Assert.Empty(result.InheritedTactics);
    }

    [Fact]
    public async Task Handle_ClubScope_ReturnsClubTactics()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var formationId = await db.SeedSystemFormationAsync();
        var tacticId = await db.SeedTacticAsync(formationId, "Club Tactic");

        db.Context.FormationClubs.Add(new FormationClub
        {
            Id = Guid.NewGuid(),
            FormationId = tacticId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetTacticsByScopeHandler(db.Context);
        var result = await handler.Handle(new GetTacticsByScopeQuery(clubId), CancellationToken.None);

        Assert.Single(result.ScopeTactics);
        Assert.Equal("Club Tactic", result.ScopeTactics[0].Name);
        Assert.Empty(result.InheritedTactics);
    }

    [Fact]
    public async Task Handle_AgeGroupScope_InheritsClubTactics()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId: clubId);
        var formationId = await db.SeedSystemFormationAsync();
        var tacticId = await db.SeedTacticAsync(formationId, "Club-Level Tactic");

        db.Context.FormationClubs.Add(new FormationClub
        {
            Id = Guid.NewGuid(),
            FormationId = tacticId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetTacticsByScopeHandler(db.Context);
        var result = await handler.Handle(new GetTacticsByScopeQuery(clubId, ageGroupId), CancellationToken.None);

        Assert.Empty(result.ScopeTactics); // no age-group-level tactics
        Assert.Single(result.InheritedTactics); // club tactic inherited
        Assert.Equal("Club-Level Tactic", result.InheritedTactics[0].Name);
    }

    [Fact]
    public async Task Handle_TeamScope_InheritsClubAndAgeGroupTactics()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId: clubId);
        var teamId = await db.SeedTeamAsync(ageGroupId: ageGroupId, clubId: clubId);
        var formationId = await db.SeedSystemFormationAsync();

        // Club-level tactic
        var clubTacticId = await db.SeedTacticAsync(formationId, "Club Tactic");
        db.Context.FormationClubs.Add(new FormationClub
        {
            Id = Guid.NewGuid(),
            FormationId = clubTacticId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });

        // Team-level tactic
        var teamTacticId = await db.SeedTacticAsync(formationId, "Team Tactic");
        db.Context.FormationTeams.Add(new FormationTeam
        {
            Id = Guid.NewGuid(),
            FormationId = teamTacticId,
            TeamId = teamId,
            SharedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetTacticsByScopeHandler(db.Context);
        var result = await handler.Handle(new GetTacticsByScopeQuery(clubId, ageGroupId, teamId), CancellationToken.None);

        Assert.Single(result.ScopeTactics); // team-level
        Assert.Equal("Team Tactic", result.ScopeTactics[0].Name);
        Assert.Single(result.InheritedTactics); // club-level inherited
        Assert.Equal("Club Tactic", result.InheritedTactics[0].Name);
    }
}

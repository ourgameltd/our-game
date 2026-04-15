using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplatesByScope;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.DrillTemplates;

public class GetDrillTemplatesByScopeHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoTemplates_ReturnsEmptyLists()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();

        var handler = new GetDrillTemplatesByScopeHandler(db.Context);
        var result = await handler.Handle(new GetDrillTemplatesByScopeQuery(clubId), CancellationToken.None);

        Assert.Empty(result.Templates);
        Assert.Empty(result.InheritedTemplates);
        Assert.Equal(0, result.TotalCount);
    }

    [Fact]
    public async Task Handle_ClubScope_ReturnsClubTemplates()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var templateId = Guid.NewGuid();

        db.Context.DrillTemplates.Add(new DrillTemplate
        {
            Id = templateId,
            Name = "Club Template",
            Description = "",
            Category = "Skills Practice",
            CreatedAt = DateTime.UtcNow
        });
        db.Context.Set<DrillTemplateClub>().Add(new DrillTemplateClub
        {
            Id = Guid.NewGuid(),
            DrillTemplateId = templateId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetDrillTemplatesByScopeHandler(db.Context);
        var result = await handler.Handle(new GetDrillTemplatesByScopeQuery(clubId), CancellationToken.None);

        Assert.Single(result.Templates);
        Assert.Equal("Club Template", result.Templates[0].Name);
        Assert.Equal(1, result.TotalCount);
    }

    [Fact]
    public async Task Handle_TeamScope_InheritsClubTemplates()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var templateId = Guid.NewGuid();

        db.Context.DrillTemplates.Add(new DrillTemplate
        {
            Id = templateId,
            Name = "Inherited Template",
            Description = "",
            Category = "Conditioned Game",
            CreatedAt = DateTime.UtcNow
        });
        db.Context.Set<DrillTemplateClub>().Add(new DrillTemplateClub
        {
            Id = Guid.NewGuid(),
            DrillTemplateId = templateId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetDrillTemplatesByScopeHandler(db.Context);
        var result = await handler.Handle(
            new GetDrillTemplatesByScopeQuery(clubId, ageGroupId, teamId), CancellationToken.None);

        Assert.Empty(result.Templates); // no team-level templates
        Assert.Single(result.InheritedTemplates);
        Assert.Equal("Inherited Template", result.InheritedTemplates[0].Name);
    }

    [Fact]
    public async Task Handle_TeamScope_SeparatesTeamAndInherited()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();

        var clubTemplateId = Guid.NewGuid();
        db.Context.DrillTemplates.Add(new DrillTemplate
        {
            Id = clubTemplateId,
            Name = "AAA Club Template",
            Description = "",
            Category = "Game Related Practice",
            CreatedAt = DateTime.UtcNow
        });
        db.Context.Set<DrillTemplateClub>().Add(new DrillTemplateClub
        {
            Id = Guid.NewGuid(),
            DrillTemplateId = clubTemplateId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });

        var teamTemplateId = Guid.NewGuid();
        db.Context.DrillTemplates.Add(new DrillTemplate
        {
            Id = teamTemplateId,
            Name = "BBB Team Template",
            Description = "",
            Category = "Mixed",
            CreatedAt = DateTime.UtcNow
        });
        db.Context.Set<DrillTemplateTeam>().Add(new DrillTemplateTeam
        {
            Id = Guid.NewGuid(),
            DrillTemplateId = teamTemplateId,
            TeamId = teamId,
            SharedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetDrillTemplatesByScopeHandler(db.Context);
        var result = await handler.Handle(
            new GetDrillTemplatesByScopeQuery(clubId, ageGroupId, teamId), CancellationToken.None);

        Assert.Single(result.Templates);
        Assert.Equal("BBB Team Template", result.Templates[0].Name);
        Assert.Single(result.InheritedTemplates);
        Assert.Equal("AAA Club Template", result.InheritedTemplates[0].Name);
        Assert.Equal(2, result.TotalCount);
    }
}

using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplateById;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.DrillTemplates;

public class GetDrillTemplateByIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNotFound_ReturnsNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetDrillTemplateByIdHandler(db.Context);

        var result = await handler.Handle(new GetDrillTemplateByIdQuery(Guid.NewGuid()), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenExists_ReturnsMappedDetail()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);
        var templateId = Guid.NewGuid();

        db.Context.DrillTemplates.Add(new DrillTemplate
        {
            Id = templateId,
            Name = "Warm-up Template",
            Description = "A basic warm-up",
            Category = "physical",
            TotalDuration = 30,
            AggregatedAttributes = "[\"agility\",\"speed\"]",
            CreatedBy = coachId,
            IsPublic = true,
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

        var handler = new GetDrillTemplateByIdHandler(db.Context);
        var result = await handler.Handle(new GetDrillTemplateByIdQuery(templateId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(templateId, result.Id);
        Assert.Equal("Warm-up Template", result.Name);
        Assert.Equal("physical", result.Category);
        Assert.Equal(30, result.TotalDuration);
        Assert.True(result.IsPublic);
        Assert.Equal(coachId, result.CreatedBy);
        Assert.Equal("club", result.ScopeType);
        Assert.Equal(clubId, result.ScopeClubId);
    }

    [Fact]
    public async Task Handle_IncludesDrillIds()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var drillId1 = await db.SeedDrillAsync(name: "First Drill");
        var drillId2 = await db.SeedDrillAsync(name: "Second Drill");
        var templateId = Guid.NewGuid();

        db.Context.DrillTemplates.Add(new DrillTemplate
        {
            Id = templateId,
            Name = "Multi-Drill Template",
            Description = "",
            Category = "mixed",
            CreatedAt = DateTime.UtcNow
        });
        db.Context.Set<DrillTemplateClub>().Add(new DrillTemplateClub
        {
            Id = Guid.NewGuid(),
            DrillTemplateId = templateId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });
        db.Context.TemplateDrills.AddRange(
            new TemplateDrill { Id = Guid.NewGuid(), TemplateId = templateId, DrillId = drillId1, DrillOrder = 0 },
            new TemplateDrill { Id = Guid.NewGuid(), TemplateId = templateId, DrillId = drillId2, DrillOrder = 1 }
        );
        await db.Context.SaveChangesAsync();

        var handler = new GetDrillTemplateByIdHandler(db.Context);
        var result = await handler.Handle(new GetDrillTemplateByIdQuery(templateId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(2, result.DrillIds.Count);
        Assert.Equal(drillId1, result.DrillIds[0]);
        Assert.Equal(drillId2, result.DrillIds[1]);
    }

    [Fact]
    public async Task Handle_ParsesAggregatedAttributes()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var templateId = Guid.NewGuid();

        db.Context.DrillTemplates.Add(new DrillTemplate
        {
            Id = templateId,
            Name = "Attr Template",
            Description = "",
            Category = "technical",
            AggregatedAttributes = "[\"passing\",\"dribbling\"]",
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

        var handler = new GetDrillTemplateByIdHandler(db.Context);
        var result = await handler.Handle(new GetDrillTemplateByIdQuery(templateId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(new List<string> { "passing", "dribbling" }, result.Attributes);
    }
}

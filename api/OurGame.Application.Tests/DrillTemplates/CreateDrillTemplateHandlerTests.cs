using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.DrillTemplates.Commands.CreateDrillTemplate;
using OurGame.Application.UseCases.DrillTemplates.Commands.CreateDrillTemplate.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.DrillTemplates;

public class CreateDrillTemplateHandlerTests
{
    private static CreateDrillTemplateRequestDto ValidDto(Guid clubId, List<Guid> drillIds) => new()
    {
        Name = "New Template",
        Description = "Test template",
        DrillIds = drillIds,
        Scope = new CreateDrillTemplateScopeDto { ClubId = clubId },
        IsPublic = false
    };

    [Fact]
    public async Task Handle_WhenNameEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateDrillTemplateHandler(db.Context);

        var dto = ValidDto(Guid.NewGuid(), new List<Guid> { Guid.NewGuid() }) with { Name = "" };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateDrillTemplateCommand(dto, "user1"), CancellationToken.None));
        Assert.Contains("Name", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenNoDrillIds_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateDrillTemplateHandler(db.Context);

        var dto = ValidDto(Guid.NewGuid(), new List<Guid>());

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateDrillTemplateCommand(dto, "user1"), CancellationToken.None));
        Assert.Contains("DrillIds", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenNoScope_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateDrillTemplateHandler(db.Context);

        var dto = new CreateDrillTemplateRequestDto
        {
            Name = "Test",
            DrillIds = new List<Guid> { Guid.NewGuid() },
            Scope = new CreateDrillTemplateScopeDto()
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateDrillTemplateCommand(dto, "user1"), CancellationToken.None));
        Assert.Contains("Scope", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenValid_CreatesAndReturnsDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, userId) = await db.SeedCoachAsync(clubId: clubId);
        var drillId = await db.SeedDrillAsync(coachId: coachId);

        // Get the user's AuthId for the command
        var user = await db.Context.Users.FindAsync(userId);
        Assert.NotNull(user);

        var handler = new CreateDrillTemplateHandler(db.Context);
        var dto = ValidDto(clubId, new List<Guid> { drillId });

        var result = await handler.Handle(
            new CreateDrillTemplateCommand(dto, user!.AuthId), CancellationToken.None);

        Assert.Equal("New Template", result.Name);
    }

    [Fact]
    public async Task Handle_AggregatesDrillAttributes()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, userId) = await db.SeedCoachAsync(clubId: clubId);
        
        var drill1 = await db.SeedDrillAsync(coachId: coachId, name: "Drill 1");
        var drill2 = await db.SeedDrillAsync(coachId: coachId, name: "Drill 2");

        // Update drill attributes
        var d1 = await db.Context.Drills.FindAsync(drill1);
        d1!.Attributes = "[\"passing\",\"movement\"]";
        d1.DurationMinutes = 10;
        var d2 = await db.Context.Drills.FindAsync(drill2);
        d2!.Attributes = "[\"shooting\"]";
        d2.DurationMinutes = 15;
        await db.Context.SaveChangesAsync();

        var user = await db.Context.Users.FindAsync(userId);
        Assert.NotNull(user);

        var handler = new CreateDrillTemplateHandler(db.Context);
        var dto = ValidDto(clubId, new List<Guid> { drill1, drill2 });

        var result = await handler.Handle(
            new CreateDrillTemplateCommand(dto, user!.AuthId), CancellationToken.None);

        Assert.Equal(25, result.TotalDuration);
    }
}

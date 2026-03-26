using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.DrillTemplates.Commands.UpdateDrillTemplate;
using OurGame.Application.UseCases.DrillTemplates.Commands.UpdateDrillTemplate.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.DrillTemplates;

public class UpdateDrillTemplateHandlerTests
{
    private static UpdateDrillTemplateRequestDto ValidDto(List<Guid> drillIds) => new()
    {
        Name = "Updated Template",
        Description = "Updated desc",
        DrillIds = drillIds,
        IsPublic = true
    };

    [Fact]
    public async Task Handle_WhenNameEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdateDrillTemplateHandler(db.Context);

        var dto = ValidDto(new List<Guid> { Guid.NewGuid() }) with { Name = "" };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new UpdateDrillTemplateCommand(Guid.NewGuid(), "user1", dto), CancellationToken.None));
        Assert.Contains("Name", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenNoDrillIds_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdateDrillTemplateHandler(db.Context);

        var dto = ValidDto(new List<Guid>());

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new UpdateDrillTemplateCommand(Guid.NewGuid(), "user1", dto), CancellationToken.None));
        Assert.Contains("DrillIds", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenTemplateNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdateDrillTemplateHandler(db.Context);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new UpdateDrillTemplateCommand(Guid.NewGuid(), "user1", ValidDto(new List<Guid> { Guid.NewGuid() })), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenNotOwner_ThrowsUnauthorizedAccessException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, userId) = await db.SeedCoachAsync(clubId: clubId);
        var drillId = await db.SeedDrillAsync(coachId: coachId);

        var templateId = Guid.NewGuid();
        db.Context.DrillTemplates.Add(new DrillTemplate
        {
            Id = templateId,
            Name = "Original",
            Description = "",
            Category = "technical",
            CreatedBy = coachId,
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

        // Create a different coach
        var (otherCoachId, otherUserId) = await db.SeedCoachAsync(clubId: clubId, authId: "other-coach-auth");
        var otherUser = await db.Context.Users.FindAsync(otherUserId);
        Assert.NotNull(otherUser);

        var handler = new UpdateDrillTemplateHandler(db.Context);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            handler.Handle(new UpdateDrillTemplateCommand(templateId, otherUser!.AuthId, ValidDto(new List<Guid> { drillId })), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenValid_UpdatesAndReturnsDetail()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, userId) = await db.SeedCoachAsync(clubId: clubId);
        var drillId = await db.SeedDrillAsync(coachId: coachId);

        var templateId = Guid.NewGuid();
        db.Context.DrillTemplates.Add(new DrillTemplate
        {
            Id = templateId,
            Name = "Original",
            Description = "",
            Category = "technical",
            CreatedBy = coachId,
            CreatedAt = DateTime.UtcNow
        });
        db.Context.Set<DrillTemplateClub>().Add(new DrillTemplateClub
        {
            Id = Guid.NewGuid(),
            DrillTemplateId = templateId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });
        db.Context.TemplateDrills.Add(new TemplateDrill
        {
            Id = Guid.NewGuid(),
            TemplateId = templateId,
            DrillId = drillId,
            DrillOrder = 0
        });
        await db.Context.SaveChangesAsync();

        var user = await db.Context.Users.FindAsync(userId);
        Assert.NotNull(user);

        var handler = new UpdateDrillTemplateHandler(db.Context);
        var result = await handler.Handle(
            new UpdateDrillTemplateCommand(templateId, user!.AuthId, ValidDto(new List<Guid> { drillId })),
            CancellationToken.None);

        Assert.Equal("Updated Template", result.Name);
        Assert.Equal("Updated desc", result.Description);
        Assert.True(result.IsPublic);
    }

    [Fact]
    public async Task Handle_ReplacesDrillList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, userId) = await db.SeedCoachAsync(clubId: clubId);
        var oldDrill = await db.SeedDrillAsync(coachId: coachId, name: "Old");
        var newDrill = await db.SeedDrillAsync(coachId: coachId, name: "New");

        var templateId = Guid.NewGuid();
        db.Context.DrillTemplates.Add(new DrillTemplate
        {
            Id = templateId,
            Name = "Template",
            Description = "",
            Category = "technical",
            CreatedBy = coachId,
            CreatedAt = DateTime.UtcNow
        });
        db.Context.Set<DrillTemplateClub>().Add(new DrillTemplateClub
        {
            Id = Guid.NewGuid(),
            DrillTemplateId = templateId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });
        db.Context.TemplateDrills.Add(new TemplateDrill
        {
            Id = Guid.NewGuid(),
            TemplateId = templateId,
            DrillId = oldDrill,
            DrillOrder = 0
        });
        await db.Context.SaveChangesAsync();

        var user = await db.Context.Users.FindAsync(userId);
        Assert.NotNull(user);

        var handler = new UpdateDrillTemplateHandler(db.Context);
        var result = await handler.Handle(
            new UpdateDrillTemplateCommand(templateId, user!.AuthId, ValidDto(new List<Guid> { newDrill })),
            CancellationToken.None);

        Assert.Single(result.DrillIds);
        Assert.Equal(newDrill, result.DrillIds[0]);
    }
}

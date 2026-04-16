using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.DrillTemplates.Commands.ArchiveDrillTemplate;
using OurGame.Application.UseCases.DrillTemplates.Commands.ArchiveDrillTemplate.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.DrillTemplates;

public class ArchiveDrillTemplateHandlerTests
{
    [Fact]
    public async Task Handle_WhenTemplateNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new ArchiveDrillTemplateHandler(db.Context);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new ArchiveDrillTemplateCommand(Guid.NewGuid(), "auth-user", new ArchiveDrillTemplateRequestDto { IsArchived = true }), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenUserIsNotCoach_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);

        var templateId = Guid.NewGuid();
        db.Context.DrillTemplates.Add(new DrillTemplate
        {
            Id = templateId,
            Name = "Template",
            Description = "desc",
            Category = "Drill",
            CreatedBy = coachId,
            IsPublic = true,
            IsArchived = false,
            CreatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new ArchiveDrillTemplateHandler(db.Context);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new ArchiveDrillTemplateCommand(templateId, "auth-user-without-coach", new ArchiveDrillTemplateRequestDto { IsArchived = true }), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenUserIsNotOwner_ThrowsUnauthorizedAccessException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (ownerCoachId, _) = await db.SeedCoachAsync(clubId: clubId, authId: "owner-auth");
        await db.SeedCoachAsync(clubId: clubId, authId: "other-auth");

        var templateId = Guid.NewGuid();
        db.Context.DrillTemplates.Add(new DrillTemplate
        {
            Id = templateId,
            Name = "Template",
            Description = "desc",
            Category = "Drill",
            CreatedBy = ownerCoachId,
            IsPublic = true,
            IsArchived = false,
            CreatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new ArchiveDrillTemplateHandler(db.Context);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            handler.Handle(new ArchiveDrillTemplateCommand(templateId, "other-auth", new ArchiveDrillTemplateRequestDto { IsArchived = true }), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenValid_ArchivesTemplate()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, userId) = await db.SeedCoachAsync(clubId: clubId);

        var user = await db.Context.Users.FindAsync(userId);
        Assert.NotNull(user);

        var templateId = Guid.NewGuid();
        db.Context.DrillTemplates.Add(new DrillTemplate
        {
            Id = templateId,
            Name = "Template",
            Description = "desc",
            Category = "Drill",
            CreatedBy = coachId,
            IsPublic = true,
            IsArchived = false,
            CreatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new ArchiveDrillTemplateHandler(db.Context);
        await handler.Handle(new ArchiveDrillTemplateCommand(templateId, user!.AuthId, new ArchiveDrillTemplateRequestDto { IsArchived = true }), CancellationToken.None);

        var archived = await db.Context.DrillTemplates.AsNoTracking().SingleAsync(t => t.Id == templateId);
        Assert.True(archived.IsArchived);
    }
}

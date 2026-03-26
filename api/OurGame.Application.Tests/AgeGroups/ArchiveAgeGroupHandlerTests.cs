using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.AgeGroups.Commands.ArchiveAgeGroup;
using OurGame.Application.UseCases.AgeGroups.Commands.ArchiveAgeGroup.DTOs;
using Microsoft.EntityFrameworkCore;

namespace OurGame.Application.Tests.AgeGroups;

public class ArchiveAgeGroupHandlerTests
{
    [Fact]
    public async Task Handle_WhenAgeGroupNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new ArchiveAgeGroupHandler(db.Context);
        var command = new ArchiveAgeGroupCommand(Guid.NewGuid(), new ArchiveAgeGroupRequestDto { IsArchived = true });

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ArchivesAgeGroup()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var handler = new ArchiveAgeGroupHandler(db.Context);

        await handler.Handle(
            new ArchiveAgeGroupCommand(ageGroupId, new ArchiveAgeGroupRequestDto { IsArchived = true }),
            CancellationToken.None);

        var ag = await db.Context.AgeGroups.AsNoTracking().FirstAsync(a => a.Id == ageGroupId);
        Assert.True(ag.IsArchived);
    }

    [Fact]
    public async Task Handle_UnarchivesAgeGroup()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId, isArchived: true);
        var handler = new ArchiveAgeGroupHandler(db.Context);

        await handler.Handle(
            new ArchiveAgeGroupCommand(ageGroupId, new ArchiveAgeGroupRequestDto { IsArchived = false }),
            CancellationToken.None);

        var ag = await db.Context.AgeGroups.AsNoTracking().FirstAsync(a => a.Id == ageGroupId);
        Assert.False(ag.IsArchived);
    }
}

using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Commands.ArchiveTeam;
using OurGame.Application.UseCases.Teams.Commands.ArchiveTeam.DTOs;
using Microsoft.EntityFrameworkCore;

namespace OurGame.Application.Tests.Teams;

public class ArchiveTeamHandlerTests
{
    [Fact]
    public async Task Handle_WhenTeamNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new ArchiveTeamHandler(db.Context);
        var command = new ArchiveTeamCommand(Guid.NewGuid(), new ArchiveTeamRequestDto { IsArchived = true });

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenArchiving_SetsIsArchivedTrue()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new ArchiveTeamHandler(db.Context);
        var command = new ArchiveTeamCommand(teamId, new ArchiveTeamRequestDto { IsArchived = true });

        await handler.Handle(command, CancellationToken.None);

        var team = await db.Context.Teams.AsNoTracking().FirstAsync(t => t.Id == teamId);
        Assert.True(team.IsArchived);
    }

    [Fact]
    public async Task Handle_WhenUnarchiving_SetsIsArchivedFalse()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var teamId = await db.SeedTeamAsync(clubId, ageGroupId, isArchived: true);
        var handler = new ArchiveTeamHandler(db.Context);
        var command = new ArchiveTeamCommand(teamId, new ArchiveTeamRequestDto { IsArchived = false });

        await handler.Handle(command, CancellationToken.None);

        var team = await db.Context.Teams.AsNoTracking().FirstAsync(t => t.Id == teamId);
        Assert.False(team.IsArchived);
    }
}

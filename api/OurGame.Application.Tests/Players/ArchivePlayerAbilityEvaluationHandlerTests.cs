using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Players.Commands.ArchivePlayerAbilityEvaluation;

namespace OurGame.Application.Tests.Players;

public class ArchivePlayerAbilityEvaluationHandlerTests
{
    [Fact]
    public async Task Handle_WhenEvaluationNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var handler = new ArchivePlayerAbilityEvaluationHandler(db.Context);
        var command = new ArchivePlayerAbilityEvaluationCommand(playerId, Guid.NewGuid(), true, "user-auth");

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenEvaluationBelongsToDifferentPlayer_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var player1 = await db.SeedPlayerAsync(clubId, "Player", "One");
        var player2 = await db.SeedPlayerAsync(clubId, "Player", "Two");
        var (coachId, _) = await db.SeedCoachAsync(clubId);
        var evalId = await db.SeedAttributeEvaluationAsync(player1, coachId);
        var handler = new ArchivePlayerAbilityEvaluationHandler(db.Context);
        var command = new ArchivePlayerAbilityEvaluationCommand(player2, evalId, true, "user-auth");

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenArchivingActiveEvaluation_SetsIsArchivedTrue()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var (coachId, _) = await db.SeedCoachAsync(clubId);
        var evalId = await db.SeedAttributeEvaluationAsync(playerId, coachId);

        var handler = new ArchivePlayerAbilityEvaluationHandler(db.Context);
        var command = new ArchivePlayerAbilityEvaluationCommand(playerId, evalId, true, "user-auth");

        await handler.Handle(command, CancellationToken.None);

        var persisted = await db.Context.AttributeEvaluations
            .AsNoTracking()
            .FirstAsync(ae => ae.Id == evalId);
        Assert.True(persisted.IsArchived);
    }

    [Fact]
    public async Task Handle_WhenUnarchivingArchivedEvaluation_SetsIsArchivedFalse()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var (coachId, _) = await db.SeedCoachAsync(clubId);
        var evalId = await db.SeedAttributeEvaluationAsync(playerId, coachId);

        var entity = await db.Context.AttributeEvaluations.FirstAsync(ae => ae.Id == evalId);
        entity.IsArchived = true;
        await db.Context.SaveChangesAsync();

        var handler = new ArchivePlayerAbilityEvaluationHandler(db.Context);
        var command = new ArchivePlayerAbilityEvaluationCommand(playerId, evalId, false, "user-auth");

        await handler.Handle(command, CancellationToken.None);

        var persisted = await db.Context.AttributeEvaluations
            .AsNoTracking()
            .FirstAsync(ae => ae.Id == evalId);
        Assert.False(persisted.IsArchived);
    }

    [Fact]
    public async Task Handle_WhenStateAlreadyMatches_IsNoOp()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var (coachId, _) = await db.SeedCoachAsync(clubId);
        var evalId = await db.SeedAttributeEvaluationAsync(playerId, coachId);

        var handler = new ArchivePlayerAbilityEvaluationHandler(db.Context);
        var command = new ArchivePlayerAbilityEvaluationCommand(playerId, evalId, false, "user-auth");

        await handler.Handle(command, CancellationToken.None);

        var persisted = await db.Context.AttributeEvaluations
            .AsNoTracking()
            .FirstAsync(ae => ae.Id == evalId);
        Assert.False(persisted.IsArchived);
    }
}

using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticById;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Tactics;

public class GetTacticByIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNotFound_ReturnsNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetTacticByIdHandler(db.Context);

        var result = await handler.Handle(new GetTacticByIdQuery(Guid.NewGuid()), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenSystemFormation_ReturnsNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync();
        var handler = new GetTacticByIdHandler(db.Context);

        // System formations have no ParentFormationId and are excluded
        var result = await handler.Handle(new GetTacticByIdQuery(formationId), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenTacticExists_ReturnsMappedDetail()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync();
        var tacticId = await db.SeedTacticAsync(formationId, "My Tactic");

        // Add a club scope link
        var clubId = await db.SeedClubAsync();
        db.Context.FormationClubs.Add(new FormationClub
        {
            Id = Guid.NewGuid(),
            FormationId = tacticId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetTacticByIdHandler(db.Context);
        var result = await handler.Handle(new GetTacticByIdQuery(tacticId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(tacticId, result.Id);
        Assert.Equal("My Tactic", result.Name);
        Assert.Equal(formationId, result.ParentFormationId);
        Assert.Equal("4-3-3", result.ParentFormationName);
    }

    [Fact]
    public async Task Handle_IncludesScopeData()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync();
        var tacticId = await db.SeedTacticAsync(formationId);
        var clubId = await db.SeedClubAsync();

        db.Context.FormationClubs.Add(new FormationClub
        {
            Id = Guid.NewGuid(),
            FormationId = tacticId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetTacticByIdHandler(db.Context);
        var result = await handler.Handle(new GetTacticByIdQuery(tacticId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Contains(clubId, result.Scope.ClubIds);
    }

    [Fact]
    public async Task Handle_IncludesPositionOverrides()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync();
        var tacticId = await db.SeedTacticAsync(formationId);
        var clubId = await db.SeedClubAsync();

        db.Context.FormationClubs.Add(new FormationClub
        {
            Id = Guid.NewGuid(),
            FormationId = tacticId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });

        db.Context.PositionOverrides.Add(new PositionOverride
        {
            Id = Guid.NewGuid(),
            FormationId = tacticId,
            PositionIndex = 0,
            XCoord = 45m,
            YCoord = 85m,
            Direction = "forward"
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetTacticByIdHandler(db.Context);
        var result = await handler.Handle(new GetTacticByIdQuery(tacticId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result.PositionOverrides);
        Assert.Equal(0, result.PositionOverrides[0].PositionIndex);
    }

    [Fact]
    public async Task Handle_IncludesPrinciples()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync();
        var tacticId = await db.SeedTacticAsync(formationId);
        var clubId = await db.SeedClubAsync();

        db.Context.FormationClubs.Add(new FormationClub
        {
            Id = Guid.NewGuid(),
            FormationId = tacticId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });

        db.Context.TacticPrinciples.Add(new TacticPrinciple
        {
            Id = Guid.NewGuid(),
            FormationId = tacticId,
            Title = "Press High",
            Description = "Close down quickly",
            PositionIndices = "9,10"
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetTacticByIdHandler(db.Context);
        var result = await handler.Handle(new GetTacticByIdQuery(tacticId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result.Principles);
        Assert.Equal("Press High", result.Principles[0].Title);
        Assert.Equal(new List<int> { 9, 10 }, result.Principles[0].PositionIndices);
        Assert.Empty(result.Principles[0].PositionOverrides);
    }

    [Fact]
    public async Task Handle_IncludesPrinciplePositionOverrides()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync();
        var tacticId = await db.SeedTacticAsync(formationId);
        var clubId = await db.SeedClubAsync();

        db.Context.FormationClubs.Add(new FormationClub
        {
            Id = Guid.NewGuid(),
            FormationId = tacticId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });

        var principleId = Guid.NewGuid();
        db.Context.TacticPrinciples.Add(new TacticPrinciple
        {
            Id = principleId,
            FormationId = tacticId,
            Title = "High Line",
            Description = "Push up",
            PositionIndices = "3,4"
        });
        await db.Context.SaveChangesAsync();

        db.Context.TacticPrinciplePositionOverrides.Add(new TacticPrinciplePositionOverride
        {
            Id = Guid.NewGuid(),
            TacticPrincipleId = principleId,
            PositionIndex = 3,
            XCoord = 25m,
            YCoord = 30m,
            Direction = "N"
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetTacticByIdHandler(db.Context);
        var result = await handler.Handle(new GetTacticByIdQuery(tacticId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result.Principles);
        var principle = result.Principles[0];
        Assert.Single(principle.PositionOverrides);
        Assert.Equal(3, principle.PositionOverrides[0].PositionIndex);
        Assert.Equal(25.0, principle.PositionOverrides[0].XCoord);
        Assert.Equal(30.0, principle.PositionOverrides[0].YCoord);
        Assert.Equal("N", principle.PositionOverrides[0].Direction);
    }

    [Fact]
    public async Task Handle_ResolvesPositionsFromParentFormation()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync();

        // Add a base formation position
        db.Context.FormationPositions.Add(new FormationPosition
        {
            Id = Guid.NewGuid(),
            FormationId = formationId,
            PositionIndex = 0,
            Position = (int)PlayerPosition.GK,
            XCoord = 50m,
            YCoord = 95m
        });
        await db.Context.SaveChangesAsync();

        var tacticId = await db.SeedTacticAsync(formationId);
        var clubId = await db.SeedClubAsync();
        db.Context.FormationClubs.Add(new FormationClub
        {
            Id = Guid.NewGuid(),
            FormationId = tacticId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetTacticByIdHandler(db.Context);
        var result = await handler.Handle(new GetTacticByIdQuery(tacticId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result.ResolvedPositions);
        Assert.Equal("GK", result.ResolvedPositions[0].Position);
    }
}

using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Formations.Queries.GetSystemFormations;
using OurGame.Persistence.Data.SeedData;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Formations;

public class GetSystemFormationsHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoFormations_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetSystemFormationsHandler(db.Context);

        var result = await handler.Handle(new GetSystemFormationsQuery(), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsSystemFormations()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync("4-3-3", SquadSize.ElevenASide);
        var handler = new GetSystemFormationsHandler(db.Context);

        var result = await handler.Handle(new GetSystemFormationsQuery(), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(formationId, result[0].Id);
        Assert.Equal("4-3-3", result[0].Name);
    }

    [Fact]
    public async Task Handle_ExcludesNonSystemFormations()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync();
        // Tactic is not a system formation (IsSystemFormation = false)
        await db.SeedTacticAsync(formationId, "High Press Tactic");
        var handler = new GetSystemFormationsHandler(db.Context);

        var result = await handler.Handle(new GetSystemFormationsQuery(), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("4-3-3", result[0].Name);
    }

    [Fact]
    public async Task Handle_IncludesPositions()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync();

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

        var handler = new GetSystemFormationsHandler(db.Context);
        var result = await handler.Handle(new GetSystemFormationsQuery(), CancellationToken.None);

        Assert.Single(result);
        Assert.Single(result[0].Positions);
        Assert.Equal(0, result[0].Positions[0].PositionIndex);
        Assert.Equal("GK", result[0].Positions[0].Position);
        Assert.Equal(50.0, result[0].Positions[0].X);
        Assert.Equal(95.0, result[0].Positions[0].Y);
    }

    [Fact]
    public async Task Handle_ReturnsCanonicalFourASideSystemFormationPositions()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await db.Context.Formations.AddRangeAsync(FormationSeedData.GetFormations());
        await db.Context.FormationPositions.AddRangeAsync(FormationPositionSeedData.GetFormationPositions());
        await db.Context.SaveChangesAsync();

        var handler = new GetSystemFormationsHandler(db.Context);
        var result = await handler.Handle(new GetSystemFormationsQuery(), CancellationToken.None);

        var fourASide = Assert.Single(result.Where(formation => formation.Id == FormationSeedData.Formation_4aside_121_Id));

        Assert.Equal(new[] { "CB", "CM", "CM", "ST" }, fourASide.Positions.Select(position => position.Position));
        Assert.Equal(new[] { 0, 1, 2, 3 }, fourASide.Positions.Select(position => position.PositionIndex));
        Assert.DoesNotContain(fourASide.Positions, position => position.Position == "GK");
    }
}

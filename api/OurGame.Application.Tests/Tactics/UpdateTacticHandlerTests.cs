using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Tactics.Commands.UpdateTactic;
using OurGame.Application.UseCases.Tactics.Commands.UpdateTactic.DTOs;

namespace OurGame.Application.Tests.Tactics;

public class UpdateTacticHandlerTests
{
    private static UpdateTacticRequestDto ValidDto() => new()
    {
        Name = "Updated Tactic",
        ParentFormationId = Guid.NewGuid(), // ignored for update
        Summary = "Updated summary",
        Style = "defensive",
        Tags = new List<string> { "compact", "low-block" },
        PositionOverrides = new List<UpdatePositionOverrideDto>(),
        Principles = new List<UpdateTacticPrincipleDto>()
    };

    [Fact]
    public async Task Handle_WhenNameEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdateTacticHandler(db.Context);

        var dto = ValidDto() with { Name = "  " };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new UpdateTacticCommand(Guid.NewGuid(), dto), CancellationToken.None));
        Assert.Contains("Name", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenTacticNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdateTacticHandler(db.Context);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new UpdateTacticCommand(Guid.NewGuid(), ValidDto()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenValid_UpdatesNameSummaryStyleTags()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync();
        var tacticId = await db.SeedTacticAsync(formationId, "Original");
        var clubId = await db.SeedClubAsync();
        // Add club scope link for GetTacticById to find
        db.Context.FormationClubs.Add(new OurGame.Persistence.Models.FormationClub
        {
            Id = Guid.NewGuid(),
            FormationId = tacticId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new UpdateTacticHandler(db.Context);
        var dto = ValidDto();

        var result = await handler.Handle(new UpdateTacticCommand(tacticId, dto), CancellationToken.None);

        Assert.Equal("Updated Tactic", result.Name);
        Assert.Equal("Updated summary", result.Summary);
        Assert.Equal("defensive", result.Style);
        Assert.Contains("compact", result.Tags);
        Assert.Contains("low-block", result.Tags);
    }

    [Fact]
    public async Task Handle_ReplacesPositionOverrides()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync();
        var tacticId = await db.SeedTacticAsync(formationId);
        var clubId = await db.SeedClubAsync();
        db.Context.FormationClubs.Add(new OurGame.Persistence.Models.FormationClub
        {
            Id = Guid.NewGuid(),
            FormationId = tacticId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new UpdateTacticHandler(db.Context);
        var dto = ValidDto() with
        {
            PositionOverrides = new List<UpdatePositionOverrideDto>
            {
                new() { PositionIndex = 1, XCoord = 30m, YCoord = 60m, Direction = "forward" }
            }
        };

        var result = await handler.Handle(new UpdateTacticCommand(tacticId, dto), CancellationToken.None);

        Assert.Single(result.PositionOverrides);
        Assert.Equal(1, result.PositionOverrides[0].PositionIndex);
    }

    [Fact]
    public async Task Handle_ReplacesPrinciples()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync();
        var tacticId = await db.SeedTacticAsync(formationId);
        var clubId = await db.SeedClubAsync();
        db.Context.FormationClubs.Add(new OurGame.Persistence.Models.FormationClub
        {
            Id = Guid.NewGuid(),
            FormationId = tacticId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new UpdateTacticHandler(db.Context);
        var dto = ValidDto() with
        {
            Principles = new List<UpdateTacticPrincipleDto>
            {
                new() { Title = "Compact Shape", Description = "Stay tight", PositionIndices = new List<int> { 4, 5, 6 } }
            }
        };

        var result = await handler.Handle(new UpdateTacticCommand(tacticId, dto), CancellationToken.None);

        Assert.Single(result.Principles);
        Assert.Equal("Compact Shape", result.Principles[0].Title);
        Assert.Equal(new List<int> { 4, 5, 6 }, result.Principles[0].PositionIndices);
    }
}

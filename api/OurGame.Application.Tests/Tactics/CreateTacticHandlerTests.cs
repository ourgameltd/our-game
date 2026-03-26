using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Tactics.Commands.CreateTactic;
using OurGame.Application.UseCases.Tactics.Commands.CreateTactic.DTOs;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Tactics;

public class CreateTacticHandlerTests
{
    [Fact]
    public async Task Handle_WhenNameEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateTacticHandler(db.Context);

        var dto = new CreateTacticRequestDto
        {
            Name = "",
            ParentFormationId = Guid.NewGuid(),
            Scope = new CreateTacticScopeDto { Type = "club", ClubId = Guid.NewGuid() }
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateTacticCommand(dto), CancellationToken.None));
        Assert.Contains("Name", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenParentFormationIdEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateTacticHandler(db.Context);

        var dto = new CreateTacticRequestDto
        {
            Name = "My Tactic",
            ParentFormationId = Guid.Empty,
            Scope = new CreateTacticScopeDto { Type = "club", ClubId = Guid.NewGuid() }
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateTacticCommand(dto), CancellationToken.None));
        Assert.Contains("ParentFormationId", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenParentFormationNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateTacticHandler(db.Context);

        var dto = new CreateTacticRequestDto
        {
            Name = "My Tactic",
            ParentFormationId = Guid.NewGuid(),
            Scope = new CreateTacticScopeDto { Type = "club", ClubId = Guid.NewGuid() }
        };

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new CreateTacticCommand(dto), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenParentIsNotSystemFormation_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync();
        var tacticId = await db.SeedTacticAsync(formationId, "Non-System Tactic");

        var handler = new CreateTacticHandler(db.Context);
        var dto = new CreateTacticRequestDto
        {
            Name = "My Tactic",
            ParentFormationId = tacticId, // a tactic, not a system formation
            Scope = new CreateTacticScopeDto { Type = "club", ClubId = Guid.NewGuid() }
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateTacticCommand(dto), CancellationToken.None));
        Assert.Contains("ParentFormationId", ex.Errors.Keys);
    }

    [Theory]
    [InlineData("invalid")]
    [InlineData("")]
    public async Task Handle_WhenInvalidScopeType_ThrowsValidationException(string scopeType)
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync();

        var handler = new CreateTacticHandler(db.Context);
        var dto = new CreateTacticRequestDto
        {
            Name = "My Tactic",
            ParentFormationId = formationId,
            Scope = new CreateTacticScopeDto { Type = scopeType, ClubId = Guid.NewGuid() }
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateTacticCommand(dto), CancellationToken.None));
        Assert.Contains("Scope.Type", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenAgeGroupScopeWithNoAgeGroupId_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync();

        var handler = new CreateTacticHandler(db.Context);
        var dto = new CreateTacticRequestDto
        {
            Name = "My Tactic",
            ParentFormationId = formationId,
            Scope = new CreateTacticScopeDto { Type = "ageGroup", ClubId = Guid.NewGuid() }
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateTacticCommand(dto), CancellationToken.None));
        Assert.Contains("Scope.AgeGroupId", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenTeamScopeWithNoTeamId_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync();

        var handler = new CreateTacticHandler(db.Context);
        var dto = new CreateTacticRequestDto
        {
            Name = "My Tactic",
            ParentFormationId = formationId,
            Scope = new CreateTacticScopeDto { Type = "team", ClubId = Guid.NewGuid() }
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateTacticCommand(dto), CancellationToken.None));
        Assert.Contains("Scope.TeamId", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenClubScopeEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync();

        var handler = new CreateTacticHandler(db.Context);
        var dto = new CreateTacticRequestDto
        {
            Name = "My Tactic",
            ParentFormationId = formationId,
            Scope = new CreateTacticScopeDto { Type = "club", ClubId = Guid.Empty }
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateTacticCommand(dto), CancellationToken.None));
        Assert.Contains("Scope.ClubId", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenValid_CreatesTacticAndReturnsDetail()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var formationId = await db.SeedSystemFormationAsync();
        var clubId = await db.SeedClubAsync();

        var handler = new CreateTacticHandler(db.Context);
        var dto = new CreateTacticRequestDto
        {
            Name = "High Press 4-3-3",
            ParentFormationId = formationId,
            Summary = "Aggressive high pressing formation",
            Style = "attacking",
            Tags = new List<string> { "pressing", "high-line" },
            Scope = new CreateTacticScopeDto { Type = "club", ClubId = clubId },
            PositionOverrides = new List<CreatePositionOverrideDto>
            {
                new() { PositionIndex = 0, XCoord = 50m, YCoord = 90m }
            },
            Principles = new List<CreateTacticPrincipleDto>
            {
                new() { Title = "Press High", Description = "Close down in their half", PositionIndices = new List<int> { 9, 10 } }
            }
        };

        var result = await handler.Handle(new CreateTacticCommand(dto), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("High Press 4-3-3", result.Name);
        Assert.Equal(formationId, result.ParentFormationId);
        Assert.Equal("Aggressive high pressing formation", result.Summary);
        Assert.Equal("attacking", result.Style);
        Assert.Contains("pressing", result.Tags);
        Assert.Contains("high-line", result.Tags);
        Assert.Single(result.PositionOverrides);
        Assert.Equal(0, result.PositionOverrides[0].PositionIndex);
        Assert.Single(result.Principles);
        Assert.Equal("Press High", result.Principles[0].Title);
    }
}

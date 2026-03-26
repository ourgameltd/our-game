using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Drills.Commands.CreateDrill;
using OurGame.Application.UseCases.Drills.Commands.CreateDrill.DTOs;

namespace OurGame.Application.Tests.Drills;

public class CreateDrillHandlerTests
{
    [Fact]
    public async Task Handle_WhenNameEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateDrillHandler(db.Context);

        var dto = new CreateDrillRequestDto
        {
            Name = "",
            Category = "technical",
            Scope = new CreateDrillScopeDto { ClubId = Guid.NewGuid() }
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateDrillCommand(dto, "user1"), CancellationToken.None));
        Assert.Contains("Name", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenInvalidCategory_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateDrillHandler(db.Context);

        var dto = new CreateDrillRequestDto
        {
            Name = "My Drill",
            Category = "invalid",
            Scope = new CreateDrillScopeDto { ClubId = Guid.NewGuid() }
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateDrillCommand(dto, "user1"), CancellationToken.None));
        Assert.Contains("Category", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenNoScope_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateDrillHandler(db.Context);

        var dto = new CreateDrillRequestDto
        {
            Name = "My Drill",
            Category = "technical",
            Scope = new CreateDrillScopeDto() // all empty
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateDrillCommand(dto, "user1"), CancellationToken.None));
        Assert.Contains("Scope", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenMultipleScopes_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateDrillHandler(db.Context);

        var dto = new CreateDrillRequestDto
        {
            Name = "My Drill",
            Category = "technical",
            Scope = new CreateDrillScopeDto { ClubId = Guid.NewGuid(), TeamId = Guid.NewGuid() }
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateDrillCommand(dto, "user1"), CancellationToken.None));
        Assert.Contains("Scope", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenValid_CreatesDrillAndReturnsDetail()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, userId) = await db.SeedCoachAsync(clubId: clubId);

        // Get user's authId
        var user = await db.Context.Users.FindAsync(userId);
        Assert.NotNull(user);

        var handler = new CreateDrillHandler(db.Context);

        var dto = new CreateDrillRequestDto
        {
            Name = "Rondo 4v2",
            Description = "Passing drill in a box",
            DurationMinutes = 15,
            Category = "technical",
            Attributes = new List<string> { "passing", "movement" },
            Equipment = new List<string> { "cones", "balls" },
            Instructions = new List<string> { "Form a circle", "Keep ball" },
            Variations = new List<string> { "2-touch", "1-touch" },
            IsPublic = true,
            Scope = new CreateDrillScopeDto { ClubId = clubId },
            Links = new List<CreateDrillLinkDto>
            {
                new() { Url = "https://youtube.com/rondo", Title = "Tutorial", LinkType = "youtube" }
            }
        };

        var result = await handler.Handle(new CreateDrillCommand(dto, user!.AuthId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("Rondo 4v2", result.Name);
        Assert.Equal("Passing drill in a box", result.Description);
        Assert.Equal(15, result.DurationMinutes);
        Assert.Equal("Technical", result.Category);
        Assert.True(result.IsPublic);
        Assert.Equal(coachId, result.CreatedBy);
        Assert.Single(result.Links);
        Assert.Contains(clubId, result.Scope.ClubIds);
    }
}

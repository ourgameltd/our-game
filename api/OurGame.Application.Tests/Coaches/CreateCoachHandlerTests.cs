using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Coaches.Commands.CreateCoach;
using OurGame.Application.UseCases.Coaches.Commands.CreateCoach.DTOs;

namespace OurGame.Application.Tests.Coaches;

public class CreateCoachHandlerTests
{
    private static CreateCoachRequestDto ValidDto(params Guid[] teamIds) => new()
    {
        FirstName = "Kenny",
        LastName = "Dalglish",
        Phone = "0851234567",
        DateOfBirth = new DateOnly(1951, 3, 4),
        AssociationId = "seed-assoc-kenny",
        Role = "HeadCoach",
        Biography = "Legendary coach",
        Specializations = new[] { "Attacking", "Set Pieces" },
        TeamIds = teamIds,
    };

    [Fact]
    public async Task Handle_WhenClubNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateCoachHandler(db.Context, new StubBlobStorageService());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new CreateCoachCommand(Guid.NewGuid(), ValidDto()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenInvalidRole_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new CreateCoachHandler(db.Context, new StubBlobStorageService());
        var dto = ValidDto() with { Role = "NotARole" };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateCoachCommand(clubId, dto), CancellationToken.None));
        Assert.Contains("Role", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenValid_CreatesAndReturnsCoachDetail()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new CreateCoachHandler(db.Context, new StubBlobStorageService());

        var result = await handler.Handle(new CreateCoachCommand(clubId, ValidDto()), CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal("Kenny", result.FirstName);
        Assert.Equal("Dalglish", result.LastName);
        Assert.Equal("HeadCoach", result.Role);
        Assert.Equal("seed-assoc-kenny", result.AssociationId);
        Assert.Equal("Legendary coach", result.Biography);
        Assert.Equal(new List<string> { "Attacking", "Set Pieces" }, result.Specializations);
        Assert.Equal(clubId, result.ClubId);
        Assert.False(result.HasAccount);
        Assert.False(result.IsArchived);
        Assert.Empty(result.TeamAssignments);
    }

    [Fact]
    public async Task Handle_WithTeamIds_AssignsTeams()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId: clubId);
        var teamId = await db.SeedTeamAsync(ageGroupId: ageGroupId, clubId: clubId);
        var handler = new CreateCoachHandler(db.Context, new StubBlobStorageService());

        var result = await handler.Handle(new CreateCoachCommand(clubId, ValidDto(teamId)), CancellationToken.None);

        Assert.Single(result.TeamAssignments);
        Assert.Equal(teamId, result.TeamAssignments[0].TeamId);
    }
}

using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Matches.Commands.UpdateMatch;
using OurGame.Application.UseCases.Matches.Commands.UpdateMatch.DTOs;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Matches;

public class UpdateMatchHandlerTests
{
    [Fact]
    public async Task Handle_WhenOppositionEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, "Old Opposition");
        var handler = new UpdateMatchHandler(db.Context);

        var dto = new UpdateMatchRequest
        {
            SeasonId = "2025-26",
            SquadSize = 11,
            Opposition = "",
            MatchDate = DateTime.UtcNow.AddDays(14),
            IsHome = false,
            Status = "scheduled"
        };

        await Assert.ThrowsAsync<ValidationException>(
            () => handler.Handle(new UpdateMatchCommand(matchId, dto), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenMatchNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdateMatchHandler(db.Context);

        var dto = new UpdateMatchRequest
        {
            SeasonId = "2025-26",
            SquadSize = 11,
            Opposition = "New Opposition",
            MatchDate = DateTime.UtcNow.AddDays(14),
            IsHome = false,
            Status = "scheduled"
        };

        await Assert.ThrowsAsync<NotFoundException>(
            () => handler.Handle(new UpdateMatchCommand(Guid.NewGuid(), dto), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenValid_UpdatesAndReturnsDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, "Old Opposition");
        var handler = new UpdateMatchHandler(db.Context);

        var dto = new UpdateMatchRequest
        {
            SeasonId = "2025-26",
            SquadSize = 11,
            Opposition = "New Opposition",
            MatchDate = DateTime.UtcNow.AddDays(14),
            IsHome = false,
            Status = "scheduled"
        };

        var result = await handler.Handle(new UpdateMatchCommand(matchId, dto), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(matchId, result.Id);
        Assert.Equal("New Opposition", result.Opposition);
        Assert.False(result.IsHome);
        Assert.Equal("scheduled", result.Status);
        Assert.Equal(11, result.SquadSize);
    }
}

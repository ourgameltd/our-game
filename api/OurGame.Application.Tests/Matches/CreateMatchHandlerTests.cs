using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Matches.Commands.CreateMatch;
using OurGame.Application.UseCases.Matches.Commands.CreateMatch.DTOs;

namespace OurGame.Application.Tests.Matches;

public class CreateMatchHandlerTests
{
    [Fact]
    public async Task Handle_WhenOppositionEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new CreateMatchHandler(db.Context);

        var dto = new CreateMatchRequest
        {
            TeamId = teamId,
            SeasonId = "2025-26",
            SquadSize = 11,
            Opposition = "",
            MatchDate = DateTime.UtcNow.AddDays(7),
            IsHome = true,
            Status = "scheduled"
        };

        await Assert.ThrowsAsync<ValidationException>(
            () => handler.Handle(new CreateMatchCommand(dto), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenTeamNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateMatchHandler(db.Context);

        var dto = new CreateMatchRequest
        {
            TeamId = Guid.NewGuid(),
            SeasonId = "2025-26",
            SquadSize = 11,
            Opposition = "Rivals FC",
            MatchDate = DateTime.UtcNow.AddDays(7),
            IsHome = true,
            Status = "scheduled"
        };

        await Assert.ThrowsAsync<NotFoundException>(
            () => handler.Handle(new CreateMatchCommand(dto), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenValid_CreatesMatchAndReturnsDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new CreateMatchHandler(db.Context);
        var matchDate = DateTime.UtcNow.AddDays(7);

        var dto = new CreateMatchRequest
        {
            TeamId = teamId,
            SeasonId = "2025-26",
            SquadSize = 11,
            Opposition = "Rivals FC",
            MatchDate = matchDate,
            IsHome = true,
            Status = "scheduled"
        };

        var result = await handler.Handle(new CreateMatchCommand(dto), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(teamId, result.TeamId);
        Assert.Equal("Rivals FC", result.Opposition);
        Assert.Equal("scheduled", result.Status);
        Assert.True(result.IsHome);
        Assert.Equal(11, result.SquadSize);
        Assert.Equal("2025-26", result.SeasonId);
        Assert.Null(result.Lineup);
        Assert.Null(result.Report);
    }
}

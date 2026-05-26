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

    [Fact]
    public async Task Handle_WithCoachAttendance_PersistsStatusAndNotes()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, "Rivals FC");
        var (coachId, _) = await db.SeedCoachAsync(clubId);
        var handler = new UpdateMatchHandler(db.Context);

        var dto = new UpdateMatchRequest
        {
            SeasonId = "2025-26",
            SquadSize = 11,
            Opposition = "Rivals FC",
            MatchDate = DateTime.UtcNow.AddDays(7),
            IsHome = true,
            Status = "scheduled",
            Coaches = new List<UpdateMatchCoachRequest>
            {
                new() { CoachId = coachId, Status = "confirmed", Notes = "Will be 10 mins late" }
            }
        };

        var result = await handler.Handle(new UpdateMatchCommand(matchId, dto), CancellationToken.None);

        Assert.NotNull(result);
        var coach = Assert.Single(result.Coaches);
        Assert.Equal(coachId, coach.CoachId);
        Assert.Equal("confirmed", coach.Status);
        Assert.Equal("Will be 10 mins late", coach.Notes);
    }

    [Fact]
    public async Task Handle_WithCoachAttendanceDeclined_PersistsStatus()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, "Rivals FC");
        var (coachId, _) = await db.SeedCoachAsync(clubId);
        var handler = new UpdateMatchHandler(db.Context);

        var dto = new UpdateMatchRequest
        {
            SeasonId = "2025-26",
            SquadSize = 11,
            Opposition = "Rivals FC",
            MatchDate = DateTime.UtcNow.AddDays(7),
            IsHome = true,
            Status = "scheduled",
            Coaches = new List<UpdateMatchCoachRequest>
            {
                new() { CoachId = coachId, Status = "declined" }
            }
        };

        var result = await handler.Handle(new UpdateMatchCommand(matchId, dto), CancellationToken.None);

        var coach = Assert.Single(result.Coaches);
        Assert.Equal("declined", coach.Status);
        Assert.Null(coach.Notes);
    }
}

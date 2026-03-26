using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Queries.GetMatchesByTeamId;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Teams;

public class GetMatchesByTeamIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenTeamNotFound_ThrowsKeyNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetMatchesByTeamIdHandler(db.Context);

        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            handler.Handle(new GetMatchesByTeamIdQuery(Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenNoMatches_ReturnsEmptyResult()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();

        var handler = new GetMatchesByTeamIdHandler(db.Context);
        var result = await handler.Handle(new GetMatchesByTeamIdQuery(teamId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Empty(result.Matches);
        Assert.NotNull(result.Team);
        Assert.Equal(teamId, result.Team.Id);
    }

    [Fact]
    public async Task Handle_ReturnsMatchesForTeam()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();

        var matchId = Guid.NewGuid();
        db.Context.Matches.Add(new Match
        {
            Id = matchId,
            TeamId = teamId,
            Opposition = "Rival FC",
            MatchDate = DateTime.UtcNow.AddDays(7),
            KickOffTime = DateTime.UtcNow.AddDays(7),
            Location = "Home Ground",
            IsHome = true,
            Competition = "Cup",
            Status = MatchStatus.Scheduled,
            IsLocked = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetMatchesByTeamIdHandler(db.Context);
        var result = await handler.Handle(new GetMatchesByTeamIdQuery(teamId), CancellationToken.None);

        Assert.Single(result.Matches);
        Assert.Equal(matchId, result.Matches[0].Id);
        Assert.Equal("Rival FC", result.Matches[0].OpponentName);
    }

    [Fact]
    public async Task Handle_FiltersByStatus()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();

        db.Context.Matches.Add(new Match
        {
            Id = Guid.NewGuid(),
            TeamId = teamId,
            Opposition = "Scheduled FC",
            MatchDate = DateTime.UtcNow.AddDays(7),
            KickOffTime = DateTime.UtcNow.AddDays(7),
            Location = "Pitch",
            IsHome = true,
            Status = MatchStatus.Scheduled,
            IsLocked = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        db.Context.Matches.Add(new Match
        {
            Id = Guid.NewGuid(),
            TeamId = teamId,
            Opposition = "Cancelled FC",
            MatchDate = DateTime.UtcNow.AddDays(14),
            KickOffTime = DateTime.UtcNow.AddDays(14),
            Location = "Pitch",
            IsHome = false,
            Status = MatchStatus.Cancelled,
            IsLocked = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetMatchesByTeamIdHandler(db.Context);

        var result = await handler.Handle(new GetMatchesByTeamIdQuery(teamId, Status: "scheduled"), CancellationToken.None);
        Assert.Single(result.Matches);
        Assert.Equal("Scheduled FC", result.Matches[0].OpponentName);

        var cancelled = await handler.Handle(new GetMatchesByTeamIdQuery(teamId, Status: "cancelled"), CancellationToken.None);
        Assert.Single(cancelled.Matches);
        Assert.Equal("Cancelled FC", cancelled.Matches[0].OpponentName);
    }
}

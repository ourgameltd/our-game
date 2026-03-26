using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Clubs.Queries.GetMatchesByClubId;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Clubs;

public class GetMatchesByClubIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoMatches_ReturnsEmptyResult()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();

        var handler = new GetMatchesByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetMatchesByClubIdQuery(clubId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Empty(result.Matches);
    }

    [Fact]
    public async Task Handle_ReturnsMatchesForClub()
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
            Competition = "League",
            Status = 0,
            IsLocked = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetMatchesByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetMatchesByClubIdQuery(clubId), CancellationToken.None);

        Assert.Single(result.Matches);
        Assert.Equal(matchId, result.Matches[0].Id);
        Assert.Equal("Rival FC", result.Matches[0].Opposition);
        Assert.True(result.Matches[0].IsHome);
    }

    [Fact]
    public async Task Handle_FiltersbyAgeGroupId()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();

        db.Context.Matches.Add(new Match
        {
            Id = Guid.NewGuid(),
            TeamId = teamId,
            Opposition = "Team A",
            MatchDate = DateTime.UtcNow.AddDays(7),
            KickOffTime = DateTime.UtcNow.AddDays(7),
            Location = "Pitch",
            IsHome = true,
            Status = 0,
            IsLocked = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetMatchesByClubIdHandler(db.Context);

        // Filter by correct age group
        var result = await handler.Handle(new GetMatchesByClubIdQuery(clubId, AgeGroupId: ageGroupId), CancellationToken.None);
        Assert.Single(result.Matches);

        // Filter by wrong age group
        var emptyResult = await handler.Handle(new GetMatchesByClubIdQuery(clubId, AgeGroupId: Guid.NewGuid()), CancellationToken.None);
        Assert.Empty(emptyResult.Matches);
    }

    [Fact]
    public async Task Handle_FiltersByTeamId()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();

        db.Context.Matches.Add(new Match
        {
            Id = Guid.NewGuid(),
            TeamId = teamId,
            Opposition = "Team B",
            MatchDate = DateTime.UtcNow.AddDays(5),
            KickOffTime = DateTime.UtcNow.AddDays(5),
            Location = "Away",
            IsHome = false,
            Status = 0,
            IsLocked = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetMatchesByClubIdHandler(db.Context);

        var result = await handler.Handle(new GetMatchesByClubIdQuery(clubId, TeamId: teamId), CancellationToken.None);
        Assert.Single(result.Matches);

        var emptyResult = await handler.Handle(new GetMatchesByClubIdQuery(clubId, TeamId: Guid.NewGuid()), CancellationToken.None);
        Assert.Empty(emptyResult.Matches);
    }
}

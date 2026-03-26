using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById;
using OurGame.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace OurGame.Application.Tests.Players;

public class GetPlayerByIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenPlayerNotFound_ReturnsNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetPlayerByIdHandler(db.Context);
        var query = new GetPlayerByIdQuery(Guid.NewGuid());

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_ReturnsMappedPlayerDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync("Vale FC");
        var playerId = await db.SeedPlayerAsync(clubId, "Alex", "Vale");
        var handler = new GetPlayerByIdHandler(db.Context);
        var query = new GetPlayerByIdQuery(playerId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(playerId, result!.Id);
        Assert.Equal("Alex", result.FirstName);
        Assert.Equal("Vale", result.LastName);
        Assert.Equal(clubId, result.ClubId);
        Assert.Equal("Vale FC", result.ClubName);
    }

    [Fact]
    public async Task Handle_ParsesPreferredPositionsFromJson()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId, preferredPositions: "[\"CB\",\"RB\"]");
        var handler = new GetPlayerByIdHandler(db.Context);

        var result = await handler.Handle(new GetPlayerByIdQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(2, result!.PreferredPositions.Length);
        Assert.Contains("CB", result.PreferredPositions);
        Assert.Contains("RB", result.PreferredPositions);
        Assert.Equal("CB", result.PreferredPosition); // backward-compat first position
    }

    [Fact]
    public async Task Handle_IncludesTeamAssignments()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "Alex", "Player", 10);
        var handler = new GetPlayerByIdHandler(db.Context);

        var result = await handler.Handle(new GetPlayerByIdQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result!.Teams);
        Assert.Equal(teamId, result.Teams[0].Id);
        Assert.Equal(10, result.Teams[0].SquadNumber);
        Assert.Contains(teamId, result.TeamIds);
        Assert.Contains(ageGroupId, result.AgeGroupIds);
        // backward-compat fields
        Assert.Equal(teamId, result.TeamId);
        Assert.Equal(ageGroupId, result.AgeGroupId);
    }

    [Fact]
    public async Task Handle_IncludesEmergencyContacts()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        await db.SeedEmergencyContactAsync(playerId, "Parent One", isPrimary: true);
        await db.SeedEmergencyContactAsync(playerId, "Parent Two", isPrimary: false);
        var handler = new GetPlayerByIdHandler(db.Context);

        var result = await handler.Handle(new GetPlayerByIdQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(result!.EmergencyContacts);
        Assert.Equal(2, result.EmergencyContacts!.Length);
        Assert.Contains(result.EmergencyContacts, c => c.Name == "Parent One" && c.IsPrimary);
    }

    [Fact]
    public async Task Handle_WhenNoTeams_BackwardCompatFieldsAreNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var handler = new GetPlayerByIdHandler(db.Context);

        var result = await handler.Handle(new GetPlayerByIdQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Empty(result!.Teams);
        Assert.Null(result.TeamId);
        Assert.Null(result.AgeGroupId);
    }
}

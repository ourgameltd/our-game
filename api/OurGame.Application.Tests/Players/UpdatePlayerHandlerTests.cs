using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Players.Commands.UpdatePlayerById;
using OurGame.Application.UseCases.Players.Commands.UpdatePlayerById.DTOs;
using OurGame.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace OurGame.Application.Tests.Players;

public class UpdatePlayerHandlerTests
{
    [Fact]
    public async Task Handle_WhenPlayerNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdatePlayerHandler(db.Context);
        var dto = MakeDto();

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new UpdatePlayerCommand(Guid.NewGuid(), dto), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenArchivedAndStayingArchived_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId, isArchived: true);
        var handler = new UpdatePlayerHandler(db.Context);
        var dto = MakeDto(isArchived: true);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new UpdatePlayerCommand(playerId, dto), CancellationToken.None));
        Assert.True(ex.Errors.ContainsKey("IsArchived"));
    }

    [Fact]
    public async Task Handle_WhenArchivedAndUnarchiving_Succeeds()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId, isArchived: true);
        var handler = new UpdatePlayerHandler(db.Context);
        var dto = MakeDto(isArchived: false);

        var result = await handler.Handle(new UpdatePlayerCommand(playerId, dto), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(playerId, result!.Id);
    }

    [Fact]
    public async Task Handle_UpdatesBasicFields()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var handler = new UpdatePlayerHandler(db.Context);
        var dto = MakeDto(
            firstName: "Updated",
            lastName: "Name",
            dob: new DateOnly(2010, 1, 15));

        var result = await handler.Handle(new UpdatePlayerCommand(playerId, dto), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("Updated", result!.FirstName);
        Assert.Equal("Name", result.LastName);
    }

    [Fact]
    public async Task Handle_RebuildsEmergencyContacts()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        await db.SeedEmergencyContactAsync(playerId, "Original Contact");
        var handler = new UpdatePlayerHandler(db.Context);
        var contacts = new[]
        {
            new EmergencyContactRequestDto { Name = "New Contact", Phone = "+1234", Relationship = "Parent", IsPrimary = true },
            new EmergencyContactRequestDto { Name = "Second Contact", Phone = "+5678", Relationship = "Guardian" }
        };
        var dto = MakeDto(emergencyContacts: contacts);

        await handler.Handle(new UpdatePlayerCommand(playerId, dto), CancellationToken.None);

        var dbContacts = await db.Context.EmergencyContacts
            .AsNoTracking()
            .Where(c => c.PlayerId == playerId)
            .ToListAsync();
        Assert.Equal(2, dbContacts.Count);
        Assert.Single(dbContacts.Where(c => c.IsPrimary));
        Assert.DoesNotContain(dbContacts, c => c.Name == "Original Contact");
    }

    [Fact]
    public async Task Handle_WhenNoPrimaryMarked_FirstContactBecomesPrimary()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var handler = new UpdatePlayerHandler(db.Context);
        var contacts = new[]
        {
            new EmergencyContactRequestDto { Name = "First", Phone = "+1", Relationship = "Parent", IsPrimary = false },
            new EmergencyContactRequestDto { Name = "Second", Phone = "+2", Relationship = "Guardian", IsPrimary = false }
        };
        var dto = MakeDto(emergencyContacts: contacts);

        await handler.Handle(new UpdatePlayerCommand(playerId, dto), CancellationToken.None);

        var dbContacts = await db.Context.EmergencyContacts
            .AsNoTracking()
            .Where(c => c.PlayerId == playerId)
            .OrderBy(c => c.Name)
            .ToListAsync();
        Assert.Equal(2, dbContacts.Count);
        Assert.True(dbContacts.First(c => c.Name == "First").IsPrimary);
        Assert.False(dbContacts.First(c => c.Name == "Second").IsPrimary);
    }

    [Fact]
    public async Task Handle_RebuildsTeamAndAgeGroupAssignments()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var team1 = await db.SeedTeamAsync(clubId, ageGroupId, "Blues");
        var team2 = await db.SeedTeamAsync(clubId, ageGroupId, "Reds");
        var playerId = await db.SeedPlayerWithTeamAsync(clubId, team1, ageGroupId);
        var handler = new UpdatePlayerHandler(db.Context);
        var dto = MakeDto(teamIds: new[] { team2 });

        await handler.Handle(new UpdatePlayerCommand(playerId, dto), CancellationToken.None);

        var teamLinks = await db.Context.PlayerTeams
            .AsNoTracking()
            .Where(pt => pt.PlayerId == playerId)
            .ToListAsync();
        Assert.Single(teamLinks);
        Assert.Equal(team2, teamLinks[0].TeamId);

        var ageGroupLinks = await db.Context.PlayerAgeGroups
            .AsNoTracking()
            .Where(pag => pag.PlayerId == playerId)
            .ToListAsync();
        Assert.Single(ageGroupLinks);
        Assert.Equal(ageGroupId, ageGroupLinks[0].AgeGroupId);
    }

    [Fact]
    public async Task Handle_WhenNoTeamIdsProvided_DoesNotRebuildAssignments()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var teamId = await db.SeedTeamAsync(clubId, ageGroupId);
        var playerId = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId);
        var handler = new UpdatePlayerHandler(db.Context);
        var dto = MakeDto(teamIds: null);

        await handler.Handle(new UpdatePlayerCommand(playerId, dto), CancellationToken.None);

        var teamLinks = await db.Context.PlayerTeams
            .AsNoTracking()
            .Where(pt => pt.PlayerId == playerId)
            .ToListAsync();
        Assert.Single(teamLinks); // Original assignment preserved
    }

    private static UpdatePlayerRequestDto MakeDto(
        string firstName = "Alex",
        string lastName = "Vale",
        DateOnly? dob = null,
        bool isArchived = false,
        Guid[]? teamIds = null,
        EmergencyContactRequestDto[]? emergencyContacts = null) =>
        new()
        {
            FirstName = firstName,
            LastName = lastName,
            DateOfBirth = dob ?? new DateOnly(2012, 5, 20),
            PreferredPositions = new[] { "CM" },
            IsArchived = isArchived,
            TeamIds = teamIds,
            EmergencyContacts = emergencyContacts
        };
}

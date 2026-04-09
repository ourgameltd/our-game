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
    public async Task Handle_RebuildsEditableContacts_ButPreservesLinkedAccountContacts()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var linkedUserId = await db.SeedUserAsync("linked-parent-auth");

        db.Context.EmergencyContacts.Add(new EmergencyContact
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            UserId = linkedUserId,
            Name = "Linked Parent",
            Phone = "+447700900001",
            Relationship = "Parent",
            IsPrimary = true
        });
        await db.SeedEmergencyContactAsync(playerId, "Editable Contact");
        await db.Context.SaveChangesAsync();

        var handler = new UpdatePlayerHandler(db.Context);
        var contacts = new[]
        {
            new EmergencyContactRequestDto { Name = "Updated Editable", Phone = "+447700900002", Relationship = "Guardian", IsPrimary = true }
        };
        var dto = MakeDto(emergencyContacts: contacts);

        await handler.Handle(new UpdatePlayerCommand(playerId, dto), CancellationToken.None);

        var dbContacts = await db.Context.EmergencyContacts
            .AsNoTracking()
            .Where(c => c.PlayerId == playerId)
            .ToListAsync();

        Assert.Equal(2, dbContacts.Count);
        Assert.Contains(dbContacts, c => c.UserId == linkedUserId && c.Name == "Linked Parent");
        Assert.Contains(dbContacts, c => c.UserId == null && c.Name == "Updated Editable");
    }

    [Fact]
    public async Task Handle_WhenRemoveLinkedEmergencyContactIdsProvided_RemovesSelectedLinkedAccounts()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        _ = await db.SeedCoachAsync(clubId, authId: "coach-remove-linked");

        var linkedUserOne = await db.SeedUserAsync("linked-parent-1");
        var linkedUserTwo = await db.SeedUserAsync("linked-parent-2");

        var linkedContactOne = new EmergencyContact
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            UserId = linkedUserOne,
            Name = "Linked Parent One",
            Phone = "+447700900010",
            Relationship = "Parent",
            IsPrimary = false
        };

        var linkedContactTwo = new EmergencyContact
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            UserId = linkedUserTwo,
            Name = "Linked Parent Two",
            Phone = "+447700900011",
            Relationship = "Parent",
            IsPrimary = false
        };

        db.Context.EmergencyContacts.AddRange(linkedContactOne, linkedContactTwo);
        await db.Context.SaveChangesAsync();

        var handler = new UpdatePlayerHandler(db.Context);
        var dto = MakeDto(
            emergencyContacts: Array.Empty<EmergencyContactRequestDto>(),
            removeLinkedEmergencyContactIds: new[] { linkedContactOne.Id });

        await handler.Handle(new UpdatePlayerCommand(playerId, dto, "coach-remove-linked"), CancellationToken.None);

        var dbContacts = await db.Context.EmergencyContacts
            .AsNoTracking()
            .Where(c => c.PlayerId == playerId)
            .ToListAsync();

        Assert.DoesNotContain(dbContacts, c => c.Id == linkedContactOne.Id);
        Assert.Contains(dbContacts, c => c.Id == linkedContactTwo.Id);
    }

    [Fact]
    public async Task Handle_WhenUnlinkPlayerAccountRequested_ClearsPlayerUserId()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var linkedPlayerUserId = await db.SeedUserAsync("linked-player-auth");
        var playerId = await db.SeedPlayerAsync(clubId, userId: linkedPlayerUserId);
        _ = await db.SeedCoachAsync(clubId, authId: "coach-unlink-player");

        var handler = new UpdatePlayerHandler(db.Context);
        var dto = MakeDto(unlinkPlayerAccount: true);

        await handler.Handle(new UpdatePlayerCommand(playerId, dto, "coach-unlink-player"), CancellationToken.None);

        var refreshed = await db.Context.Players.AsNoTracking().SingleAsync(p => p.Id == playerId);
        Assert.Null(refreshed.UserId);
    }

    [Fact]
    public async Task Handle_WhenEmergencyContactHasOnlyName_AllowsOptionalFieldsToBeEmpty()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var handler = new UpdatePlayerHandler(db.Context);
        var contacts = new[]
        {
            new EmergencyContactRequestDto { Name = "Name Only", IsPrimary = true }
        };
        var dto = MakeDto(emergencyContacts: contacts);

        await handler.Handle(new UpdatePlayerCommand(playerId, dto), CancellationToken.None);

        var dbContact = await db.Context.EmergencyContacts
            .AsNoTracking()
            .SingleAsync(c => c.PlayerId == playerId && c.Name == "Name Only");

        Assert.Equal(string.Empty, dbContact.Phone);
        Assert.Equal(string.Empty, dbContact.Relationship);
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

    [Fact]
    public async Task Handle_WhenParentUpdatesRestrictedFields_ThrowsForbiddenException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId, preferredPositions: "[\"CM\"]");
        var parentUserId = await db.SeedUserAsync("parent-auth");

        db.Context.EmergencyContacts.Add(new EmergencyContact
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            UserId = parentUserId,
            Name = "Parent Contact",
            Phone = "+447700900001",
            Relationship = "Parent",
            IsPrimary = true
        });
        await db.Context.SaveChangesAsync();

        var handler = new UpdatePlayerHandler(db.Context);
        var dto = MakeDto(associationId: "SFA-9999", preferredPositions: new[] { "ST" });

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            handler.Handle(new UpdatePlayerCommand(playerId, dto, "parent-auth"), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenParentUpdatesAllowedFields_Succeeds()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId, preferredPositions: "[\"CM\"]");
        var parentUserId = await db.SeedUserAsync("parent-auth-allowed");

        db.Context.EmergencyContacts.Add(new EmergencyContact
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            UserId = parentUserId,
            Name = "Parent Contact",
            Phone = "+447700900001",
            Relationship = "Parent",
            IsPrimary = true
        });
        await db.Context.SaveChangesAsync();

        var handler = new UpdatePlayerHandler(db.Context);
        var dto = MakeDto(
            firstName: "ParentEdited",
            lastName: "Player",
            preferredPositions: new[] { "CM" },
            allergies: "Peanuts",
            medicalConditions: "Asthma");

        var result = await handler.Handle(new UpdatePlayerCommand(playerId, dto, "parent-auth-allowed"), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("ParentEdited", result!.FirstName);
    }

    [Fact]
    public async Task Handle_WhenPlayerSelfUpdatesRestrictedFields_ThrowsForbiddenException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerUserId = await db.SeedUserAsync("player-auth");
        var playerId = await db.SeedPlayerAsync(clubId, preferredPositions: "[\"CM\"]", userId: playerUserId);
        var handler = new UpdatePlayerHandler(db.Context);
        var dto = MakeDto(associationId: "SFA-1000", preferredPositions: new[] { "ST" });

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            handler.Handle(new UpdatePlayerCommand(playerId, dto, "player-auth"), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenCoachUpdatesRestrictedFields_Succeeds()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId, preferredPositions: "[\"CM\"]");
        _ = await db.SeedCoachAsync(clubId, authId: "coach-auth");

        var handler = new UpdatePlayerHandler(db.Context);
        var dto = MakeDto(associationId: "SFA-1234", preferredPositions: new[] { "ST" });

        var result = await handler.Handle(new UpdatePlayerCommand(playerId, dto, "coach-auth"), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(playerId, result!.Id);
    }

    private static UpdatePlayerRequestDto MakeDto(
        string firstName = "Alex",
        string lastName = "Vale",
        DateOnly? dob = null,
        bool isArchived = false,
        Guid[]? teamIds = null,
        EmergencyContactRequestDto[]? emergencyContacts = null,
        string? associationId = null,
        string[]? preferredPositions = null,
        string? allergies = null,
        string? medicalConditions = null,
        Guid[]? removeLinkedEmergencyContactIds = null,
        bool unlinkPlayerAccount = false) =>
        new()
        {
            FirstName = firstName,
            LastName = lastName,
            DateOfBirth = dob ?? new DateOnly(2012, 5, 20),
            PreferredPositions = preferredPositions ?? new[] { "CM" },
            AssociationId = associationId,
            Allergies = allergies,
            MedicalConditions = medicalConditions,
            IsArchived = isArchived,
            TeamIds = teamIds,
            EmergencyContacts = emergencyContacts,
            RemoveLinkedEmergencyContactIds = removeLinkedEmergencyContactIds,
            UnlinkPlayerAccount = unlinkPlayerAccount
        };
}

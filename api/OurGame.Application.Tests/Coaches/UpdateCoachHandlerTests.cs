using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Coaches.Commands.UpdateCoachById;
using OurGame.Application.UseCases.Coaches.Commands.UpdateCoachById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace OurGame.Application.Tests.Coaches;

public class UpdateCoachHandlerTests
{
    private static UpdateCoachRequestDto ValidDto(params Guid[] teamIds) => new()
    {
        FirstName = "Updated",
        LastName = "Coach",
        Phone = "0851234567",
        DateOfBirth = new DateOnly(1985, 6, 15),
        AssociationId = "FAI-001",
        Role = "HeadCoach",
        Biography = "Experienced coach",
        Specializations = new[] { "Goalkeeping", "Set Pieces" },
        TeamIds = teamIds,
        Photo = "https://example.com/photo.jpg"
    };

    [Fact]
    public async Task Handle_WhenCoachNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdateCoachHandler(db.Context, new StubBlobStorageService());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new UpdateCoachCommand(Guid.NewGuid(), ValidDto()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenInvalidRole_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);

        var handler = new UpdateCoachHandler(db.Context, new StubBlobStorageService());
        var dto = ValidDto() with { Role = "InvalidRole" };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new UpdateCoachCommand(coachId, dto), CancellationToken.None));
        Assert.Contains("Role", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenValid_UpdatesAndReturnsCoachDetail()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);

        var handler = new UpdateCoachHandler(db.Context, new StubBlobStorageService());
        var result = await handler.Handle(new UpdateCoachCommand(coachId, ValidDto()), CancellationToken.None);

        Assert.Equal(coachId, result.Id);
        Assert.Equal("Updated", result.FirstName);
        Assert.Equal("Coach", result.LastName);
        Assert.Equal("HeadCoach", result.Role);
        Assert.Equal("Experienced coach", result.Biography);
        Assert.Equal(new List<string> { "Goalkeeping", "Set Pieces" }, result.Specializations);
        Assert.Equal(clubId, result.ClubId);
    }

    [Fact]
    public async Task Handle_RebuildTeamAssignments()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId: clubId);
        var teamId = await db.SeedTeamAsync(ageGroupId: ageGroupId, clubId: clubId);
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);

        var handler = new UpdateCoachHandler(db.Context, new StubBlobStorageService());
        var dto = ValidDto(teamId);
        var result = await handler.Handle(new UpdateCoachCommand(coachId, dto), CancellationToken.None);

        Assert.Single(result.TeamAssignments);
        Assert.Equal(teamId, result.TeamAssignments[0].TeamId);
    }

    [Theory]
    [InlineData("HeadCoach")]
    [InlineData("AssistantCoach")]
    [InlineData("GoalkeeperCoach")]
    [InlineData("FitnessCoach")]
    [InlineData("TechnicalCoach")]
    public async Task Handle_AllValidCoachRoles(string role)
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);

        var handler = new UpdateCoachHandler(db.Context, new StubBlobStorageService());
        var dto = ValidDto() with { Role = role };
        var result = await handler.Handle(new UpdateCoachCommand(coachId, dto), CancellationToken.None);

        Assert.Equal(role, result.Role);
    }

    [Fact]
    public async Task Handle_EmptySpecializations_ParsesEmpty()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);

        var handler = new UpdateCoachHandler(db.Context, new StubBlobStorageService());
        var dto = ValidDto() with { Specializations = Array.Empty<string>() };
        var result = await handler.Handle(new UpdateCoachCommand(coachId, dto), CancellationToken.None);

        Assert.Empty(result.Specializations);
    }

    [Fact]
    public async Task Handle_WhenUnlinkCoachAccountTrue_RemovesCoachUserLink()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);

        var handler = new UpdateCoachHandler(db.Context, new StubBlobStorageService());
        var dto = ValidDto() with { UnlinkCoachAccount = true };

        await handler.Handle(new UpdateCoachCommand(coachId, dto), CancellationToken.None);

        db.Context.ChangeTracker.Clear();

        var updatedCoach = await db.Context.Coaches.AsNoTracking().SingleAsync(c => c.Id == coachId);
        Assert.NotNull(updatedCoach);
        Assert.Null(updatedCoach!.UserId);
    }

    [Fact]
    public async Task Handle_WhenRemoveLinkedEmergencyContactIdsProvided_DeletesOnlyRequestedLinkedContacts()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);

        var linkedUserOneId = await db.SeedUserAsync("linked-emergency-1");
        var linkedUserTwoId = await db.SeedUserAsync("linked-emergency-2");

        var contactToRemove = new EmergencyContact
        {
            Id = Guid.NewGuid(),
            CoachId = coachId,
            UserId = linkedUserOneId,
            Name = "Linked Contact One",
            Phone = "+447700900001",
            Relationship = "Parent",
            IsPrimary = true
        };

        var contactToKeep = new EmergencyContact
        {
            Id = Guid.NewGuid(),
            CoachId = coachId,
            UserId = linkedUserTwoId,
            Name = "Linked Contact Two",
            Phone = "+447700900002",
            Relationship = "Parent",
            IsPrimary = false
        };

        db.Context.EmergencyContacts.AddRange(contactToRemove, contactToKeep);
        await db.Context.SaveChangesAsync();

        var handler = new UpdateCoachHandler(db.Context, new StubBlobStorageService());
        var dto = ValidDto() with { RemoveLinkedEmergencyContactIds = new[] { contactToRemove.Id } };

        var result = await handler.Handle(new UpdateCoachCommand(coachId, dto), CancellationToken.None);

        db.Context.ChangeTracker.Clear();

        var removed = await db.Context.EmergencyContacts.AsNoTracking().SingleOrDefaultAsync(ec => ec.Id == contactToRemove.Id);
        var kept = await db.Context.EmergencyContacts.AsNoTracking().SingleOrDefaultAsync(ec => ec.Id == contactToKeep.Id);

        Assert.Null(removed);
        Assert.NotNull(kept);
        Assert.Contains(result.LinkedAccounts ?? Array.Empty<OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs.LinkedAccountDto>(), a => a.Id == contactToKeep.Id);
        Assert.DoesNotContain(result.LinkedAccounts ?? Array.Empty<OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs.LinkedAccountDto>(), a => a.Id == contactToRemove.Id);
    }
}

using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Invites;
using OurGame.Application.UseCases.Invites.Queries.GetInviteLinkOptions;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Invites;

public class GetInviteLinkOptionsHandlerTests
{
    private static GetInviteLinkOptionsHandler BuildHandler(OurGameContext db) => new(db);

    private static async Task<Invite> SeedOpenInviteAsync(
        OurGameContext db,
        Guid clubId,
        Guid ageGroupId,
        InviteType type = InviteType.Player)
    {
        var invite = new Invite
        {
            Id = Guid.NewGuid(),
            Code = InviteConstants.GenerateCode(),
            Email = InviteConstants.OpenInviteEmail,
            Type = type,
            EntityId = ageGroupId,
            ClubId = clubId,
            Status = InviteStatus.Pending,
            CreatedByUserId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };
        db.Invites.Add(invite);
        await db.SaveChangesAsync();
        return invite;
    }

    // ──────────────────────────────────────────────
    //  Invite not found
    // ──────────────────────────────────────────────

    [Fact]
    public async Task Handle_ThrowsNotFoundException_WhenInviteCodeDoesNotExist()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = BuildHandler(db.Context);

        var query = new GetInviteLinkOptionsQuery("NOTFOUND", "some-auth");

        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(query, CancellationToken.None));
    }

    // ──────────────────────────────────────────────
    //  User does not exist yet (new user, no DB record)
    // ──────────────────────────────────────────────

    [Fact]
    public async Task Handle_ReturnsCandidates_WhenUserDoesNotExistYet_PlayerInvite()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "Alice", "Wonderland");
        var invite = await SeedOpenInviteAsync(db.Context, clubId, ageGroupId, InviteType.Player);

        var handler = BuildHandler(db.Context);
        var query = new GetInviteLinkOptionsQuery(invite.Code, "non-existent-auth-id");

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(invite.Code, result.Code);
        Assert.Equal(InviteType.Player, result.Type);
        Assert.False(result.CanSelectMultiple);
        Assert.False(result.HasSingleLinkAssigned);
        Assert.Single(result.Candidates);
        Assert.Equal(playerId, result.Candidates[0].Id);
        Assert.Equal("Alice Wonderland", result.Candidates[0].Name);
        Assert.False(result.Candidates[0].IsLinked);
        Assert.False(result.Candidates[0].IsLinkedToCurrentUser);
    }

    [Fact]
    public async Task Handle_ReturnsCandidates_WhenUserDoesNotExistYet_CoachInvite()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();

        // Seed an unlinked coach
        var coachId = Guid.NewGuid();
        db.Context.Coaches.Add(new Coach
        {
            Id = coachId,
            ClubId = clubId,
            UserId = null,
            FirstName = "Jane",
            LastName = "Doe",
            Role = CoachRole.HeadCoach,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var invite = await SeedOpenInviteAsync(db.Context, clubId, ageGroupId, InviteType.Coach);

        var handler = BuildHandler(db.Context);
        var query = new GetInviteLinkOptionsQuery(invite.Code, "non-existent-auth-id");

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.NotNull(result);
        Assert.False(result.HasSingleLinkAssigned);
        Assert.Single(result.Candidates);
        Assert.Equal("Jane Doe", result.Candidates[0].Name);
        Assert.False(result.Candidates[0].IsLinked);
        Assert.False(result.Candidates[0].IsLinkedToCurrentUser);
    }

    [Fact]
    public async Task Handle_ReturnsCandidates_WhenUserDoesNotExistYet_ParentInvite()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "Child", "Player");
        var invite = await SeedOpenInviteAsync(db.Context, clubId, ageGroupId, InviteType.Parent);

        var handler = BuildHandler(db.Context);
        var query = new GetInviteLinkOptionsQuery(invite.Code, "non-existent-auth-id");

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.NotNull(result);
        Assert.True(result.CanSelectMultiple);
        Assert.Single(result.Candidates);
        Assert.False(result.Candidates[0].IsLinked);
        Assert.False(result.Candidates[0].IsLinkedToCurrentUser);
    }

    // ──────────────────────────────────────────────
    //  User exists with existing links
    // ──────────────────────────────────────────────

    [Fact]
    public async Task Handle_ShowsLinkedStatus_WhenUserHasExistingPlayerLink()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var userId = await db.SeedUserAsync("linked-user-auth");
        var playerId = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "Linked", "Player");

        // Link the player to the user
        var player = await db.Context.Players.FindAsync(playerId);
        player!.UserId = userId;
        await db.Context.SaveChangesAsync();

        var invite = await SeedOpenInviteAsync(db.Context, clubId, ageGroupId, InviteType.Player);

        var handler = BuildHandler(db.Context);
        var query = new GetInviteLinkOptionsQuery(invite.Code, "linked-user-auth");

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.True(result.HasSingleLinkAssigned);
        Assert.Single(result.Candidates);
        Assert.True(result.Candidates[0].IsLinked);
        Assert.True(result.Candidates[0].IsLinkedToCurrentUser);
    }

    [Fact]
    public async Task Handle_ShowsPlayerLinkedToOther_WhenDifferentUserLinked()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var otherUserId = await db.SeedUserAsync("other-user-auth");
        await db.SeedUserAsync("current-user-auth");
        var playerId = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "Taken", "Player");

        // Link to a different user
        var player = await db.Context.Players.FindAsync(playerId);
        player!.UserId = otherUserId;
        await db.Context.SaveChangesAsync();

        var invite = await SeedOpenInviteAsync(db.Context, clubId, ageGroupId, InviteType.Player);

        var handler = BuildHandler(db.Context);
        var query = new GetInviteLinkOptionsQuery(invite.Code, "current-user-auth");

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.False(result.HasSingleLinkAssigned);
        Assert.Single(result.Candidates);
        Assert.True(result.Candidates[0].IsLinked);
        Assert.False(result.Candidates[0].IsLinkedToCurrentUser);
    }

    // ──────────────────────────────────────────────
    //  Non-open invite returns empty candidates
    // ──────────────────────────────────────────────

    [Fact]
    public async Task Handle_ReturnsEmptyCandidates_ForNonOpenInvite()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, _) = await db.SeedClubWithTeamAsync();
        await db.SeedUserAsync("some-auth");

        var invite = new Invite
        {
            Id = Guid.NewGuid(),
            Code = InviteConstants.GenerateCode(),
            Email = "specific@test.com",
            Type = InviteType.Player,
            EntityId = ageGroupId,
            ClubId = clubId,
            Status = InviteStatus.Pending,
            CreatedByUserId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };
        db.Context.Invites.Add(invite);
        await db.Context.SaveChangesAsync();

        var handler = BuildHandler(db.Context);
        var query = new GetInviteLinkOptionsQuery(invite.Code, "some-auth");

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Empty(result.Candidates);
    }

    // ──────────────────────────────────────────────
    //  Archived entities excluded
    // ──────────────────────────────────────────────

    [Fact]
    public async Task Handle_ExcludesArchivedPlayers()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var activePlayerId = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "Active", "Player");
        var archivedPlayerId = await db.SeedPlayerAsync(clubId, "Archived", "Player", isArchived: true);

        // Also add archived player to age group
        db.Context.PlayerAgeGroups.Add(new PlayerAgeGroup
        {
            Id = Guid.NewGuid(),
            PlayerId = archivedPlayerId,
            AgeGroupId = ageGroupId
        });
        await db.Context.SaveChangesAsync();

        var invite = await SeedOpenInviteAsync(db.Context, clubId, ageGroupId, InviteType.Player);
        var handler = BuildHandler(db.Context);
        var query = new GetInviteLinkOptionsQuery(invite.Code, "non-existent-auth-id");

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Single(result.Candidates);
        Assert.Equal("Active Player", result.Candidates[0].Name);
    }
}

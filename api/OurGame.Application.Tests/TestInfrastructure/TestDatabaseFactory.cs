using Microsoft.EntityFrameworkCore;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.TestInfrastructure;

/// <summary>
/// Shared test database factory providing a dedicated SQL Server database per test instance
/// using the local Docker SQL Server container. Each database is created fresh and dropped on dispose.
/// </summary>
public sealed class TestDatabaseFactory : IAsyncDisposable
{
    private const string MasterConnection =
        "Server=localhost,14330;Database=master;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True";

    private readonly string _databaseName;

    public OurGameContext Context { get; }

    private TestDatabaseFactory(string databaseName, OurGameContext context)
    {
        _databaseName = databaseName;
        Context = context;
    }

    public static async Task<TestDatabaseFactory> CreateAsync()
    {
        var databaseName = $"OurGameTest_{Guid.NewGuid():N}";
        var connectionString =
            $"Server=localhost,14330;Database={databaseName};User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True";

        // Create the unique test database
        var masterOptions = new DbContextOptionsBuilder<OurGameContext>()
            .UseSqlServer(MasterConnection)
            .Options;
        await using (var masterContext = new OurGameContext(masterOptions))
        {
            await masterContext.Database.ExecuteSqlRawAsync(
                $"CREATE DATABASE [{databaseName}]");
        }

        var options = new DbContextOptionsBuilder<OurGameContext>()
            .UseSqlServer(connectionString)
            .Options;

        var context = new OurGameContext(options);
        await context.Database.EnsureCreatedAsync();

        // The Clubs table in the EF model does not have IsArchived, but handler raw SQL
        // references it (e.g. CreateClubKitHandler). Add it post-creation to match production schema.
        await context.Database.ExecuteSqlRawAsync(
            "ALTER TABLE Clubs ADD IsArchived BIT NOT NULL DEFAULT 0");

        return new TestDatabaseFactory(databaseName, context);
    }

    // ────────────────────────────────────────────
    //  Club
    // ────────────────────────────────────────────

    public async Task<Guid> SeedClubAsync(string name = "Vale FC", string? principles = null)
    {
        var clubId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        Context.Clubs.Add(new Club
        {
            Id = clubId,
            Name = name,
            ShortName = name,
            Logo = string.Empty,
            PrimaryColor = "#ff0000",
            SecondaryColor = "#ffffff",
            AccentColor = "#000000",
            City = "Stoke",
            Country = "GB",
            Venue = "Vale Park",
            Address = "1 Football Road",
            History = "Est. 1876",
            Ethos = "Community first",
            Principles = principles ?? string.Empty,
            CreatedAt = now,
            UpdatedAt = now
        });
        await Context.SaveChangesAsync();
        return clubId;
    }

    // ────────────────────────────────────────────
    //  AgeGroup
    // ────────────────────────────────────────────

    public async Task<Guid> SeedAgeGroupAsync(
        Guid clubId,
        string name = "U14",
        string code = "u14",
        Level level = Level.Youth,
        SquadSize squadSize = SquadSize.ElevenASide,
        bool isArchived = false,
        string seasons = "[\"2025-26\"]",
        string defaultSeason = "2025-26")
    {
        var ageGroupId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        Context.AgeGroups.Add(new AgeGroup
        {
            Id = ageGroupId,
            ClubId = clubId,
            Name = name,
            Code = code,
            Level = level,
            CurrentSeason = "2025-26",
            Seasons = seasons,
            DefaultSeason = defaultSeason,
            DefaultSquadSize = squadSize,
            Description = string.Empty,
            IsArchived = isArchived,
            CreatedAt = now,
            UpdatedAt = now
        });
        await Context.SaveChangesAsync();
        return ageGroupId;
    }

    // ────────────────────────────────────────────
    //  Team
    // ────────────────────────────────────────────

    public async Task<Guid> SeedTeamAsync(
        Guid clubId,
        Guid ageGroupId,
        string name = "Blues",
        bool isArchived = false)
    {
        var teamId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        Context.Teams.Add(new Team
        {
            Id = teamId,
            ClubId = clubId,
            AgeGroupId = ageGroupId,
            Name = name,
            ShortName = name[..Math.Min(3, name.Length)].ToUpperInvariant(),
            Level = "Youth",
            Season = "2025-26",
            PrimaryColor = "#ff0000",
            SecondaryColor = "#ffffff",
            IsArchived = isArchived,
            CreatedAt = now,
            UpdatedAt = now
        });
        await Context.SaveChangesAsync();
        return teamId;
    }

    // ────────────────────────────────────────────
    //  User
    // ────────────────────────────────────────────

    public async Task<Guid> SeedUserAsync(string authId = "test-user-auth")
    {
        var userId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        Context.Users.Add(new User
        {
            Id = userId,
            AuthId = authId,
            Email = $"{authId}@test.com",
            FirstName = "Test",
            LastName = "User",
            CreatedAt = now,
            UpdatedAt = now
        });
        await Context.SaveChangesAsync();
        return userId;
    }

    // ────────────────────────────────────────────
    //  Coach
    // ────────────────────────────────────────────

    public async Task<(Guid CoachId, Guid UserId)> SeedCoachAsync(
        Guid clubId,
        string authId = "coach-auth",
        string firstName = "John",
        string lastName = "Coach",
        CoachRole role = CoachRole.HeadCoach,
        bool isArchived = false)
    {
        var userId = await SeedUserAsync(authId);
        var coachId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        Context.Coaches.Add(new Coach
        {
            Id = coachId,
            ClubId = clubId,
            UserId = userId,
            FirstName = firstName,
            LastName = lastName,
            Role = role,
            IsArchived = isArchived,
            CreatedAt = now,
            UpdatedAt = now
        });
        await Context.SaveChangesAsync();
        return (coachId, userId);
    }

    // ────────────────────────────────────────────
    //  Player
    // ────────────────────────────────────────────

    public async Task<Guid> SeedPlayerAsync(
        Guid clubId,
        string firstName = "Alex",
        string lastName = "Vale",
        string preferredPositions = "[\"CM\"]",
        bool isArchived = false,
        Guid? userId = null)
    {
        var playerId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        Context.Players.Add(new Player
        {
            Id = playerId,
            ClubId = clubId,
            UserId = userId,
            FirstName = firstName,
            LastName = lastName,
            PreferredPositions = preferredPositions,
            IsArchived = isArchived,
            CreatedAt = now,
            UpdatedAt = now
        });
        await Context.SaveChangesAsync();
        return playerId;
    }

    /// <summary>
    /// Seed a player and assign it to a team (with optional squad number).
    /// </summary>
    public async Task<Guid> SeedPlayerWithTeamAsync(
        Guid clubId,
        Guid teamId,
        Guid ageGroupId,
        string firstName = "Alex",
        string lastName = "Vale",
        int? squadNumber = null)
    {
        var playerId = await SeedPlayerAsync(clubId, firstName, lastName);

        Context.PlayerTeams.Add(new PlayerTeam
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            TeamId = teamId,
            SquadNumber = squadNumber,
            AssignedAt = DateTime.UtcNow
        });

        Context.PlayerAgeGroups.Add(new PlayerAgeGroup
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            AgeGroupId = ageGroupId
        });

        await Context.SaveChangesAsync();
        return playerId;
    }

    // ────────────────────────────────────────────
    //  Formation (system) and Tactic
    // ────────────────────────────────────────────

    public async Task<Guid> SeedSystemFormationAsync(
        string name = "4-3-3",
        SquadSize squadSize = SquadSize.ElevenASide)
    {
        var formationId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        Context.Formations.Add(new Formation
        {
            Id = formationId,
            Name = name,
            System = name,
            SquadSize = squadSize,
            IsSystemFormation = true,
            ParentFormationId = null,
            ParentTacticId = null,
            Summary = string.Empty,
            Description = string.Empty,
            Style = string.Empty,
            Tags = string.Empty,
            CreatedAt = now,
            UpdatedAt = now
        });
        await Context.SaveChangesAsync();
        return formationId;
    }

    public async Task<Guid> SeedTacticAsync(Guid parentFormationId, string name = "High Press")
    {
        var tacticId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        Context.Formations.Add(new Formation
        {
            Id = tacticId,
            Name = name,
            System = "4-3-3",
            SquadSize = SquadSize.ElevenASide,
            IsSystemFormation = false,
            ParentFormationId = parentFormationId,
            ParentTacticId = null,
            Summary = "A high-energy pressing system",
            Description = string.Empty,
            Style = "Aggressive",
            Tags = string.Empty,
            CreatedAt = now,
            UpdatedAt = now
        });
        await Context.SaveChangesAsync();
        return tacticId;
    }

    // ────────────────────────────────────────────
    //  Kit
    // ────────────────────────────────────────────

    public async Task<Guid> SeedKitAsync(
        Guid clubId,
        Guid? teamId = null,
        string name = "Home Kit",
        KitType type = KitType.Home)
    {
        var kitId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        Context.Kits.Add(new Kit
        {
            Id = kitId,
            ClubId = clubId,
            TeamId = teamId,
            Name = name,
            Type = type,
            ShirtColor = "#ff0000",
            ShortsColor = "#ffffff",
            SocksColor = "#000000",
            Season = "2025-26",
            IsActive = true,
            CreatedAt = now
        });
        await Context.SaveChangesAsync();
        return kitId;
    }

    // ────────────────────────────────────────────
    //  TeamCoach assignment
    // ────────────────────────────────────────────

    public async Task SeedTeamCoachAsync(Guid teamId, Guid coachId, CoachRole role = CoachRole.HeadCoach)
    {
        Context.TeamCoaches.Add(new TeamCoach
        {
            Id = Guid.NewGuid(),
            TeamId = teamId,
            CoachId = coachId,
            Role = role,
            AssignedAt = DateTime.UtcNow
        });
        await Context.SaveChangesAsync();
    }

    // ────────────────────────────────────────────
    //  Match
    // ────────────────────────────────────────────

    public async Task<Guid> SeedMatchAsync(
        Guid teamId,
        string opposition = "Rivals FC",
        MatchStatus status = MatchStatus.Scheduled,
        DateTime? matchDate = null)
    {
        var matchId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var date = matchDate ?? now.AddDays(7);

        Context.Matches.Add(new Match
        {
            Id = matchId,
            TeamId = teamId,
            SeasonId = "2025-26",
            SquadSize = SquadSize.ElevenASide,
            Opposition = opposition,
            MatchDate = date,
            KickOffTime = date,
            Location = "Home Ground",
            IsHome = true,
            Competition = "League",
            Status = status,
            CreatedAt = now,
            UpdatedAt = now
        });
        await Context.SaveChangesAsync();
        return matchId;
    }

    // ────────────────────────────────────────────
    //  Drill
    // ────────────────────────────────────────────

    public async Task<Guid> SeedDrillAsync(
        Guid? coachId = null,
        string name = "Passing Drill",
        DrillCategory category = DrillCategory.SkillsPractice)
    {
        var drillId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        Context.Drills.Add(new Drill
        {
            Id = drillId,
            Name = name,
            Description = "A basic passing drill",
            DurationMinutes = 15,
            Category = category,
            Attributes = "[]",
            Equipment = "[]",
            Instructions = "[]",
            Variations = "[]",
            CreatedBy = coachId,
            IsPublic = false,
            CreatedAt = now,
            UpdatedAt = now
        });
        await Context.SaveChangesAsync();
        return drillId;
    }

    // ────────────────────────────────────────────
    //  TrainingSession
    // ────────────────────────────────────────────

    public async Task<Guid> SeedTrainingSessionAsync(
        Guid teamId,
        SessionStatus status = SessionStatus.Scheduled)
    {
        var sessionId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        Context.TrainingSessions.Add(new TrainingSession
        {
            Id = sessionId,
            TeamId = teamId,
            SessionDate = now.AddDays(3),
            Location = "Training Ground",
            Status = status,
            FocusAreas = "[]",
            Category = "Whole Part Whole",
            Notes = string.Empty,
            CreatedAt = now,
            UpdatedAt = now
        });
        await Context.SaveChangesAsync();
        return sessionId;
    }

    // ────────────────────────────────────────────
    //  DevelopmentPlan
    // ────────────────────────────────────────────

    public async Task<Guid> SeedDevelopmentPlanAsync(
        Guid playerId,
        Guid? coachId = null,
        string title = "Season Plan",
        PlanStatus status = PlanStatus.Active)
    {
        var planId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        Context.DevelopmentPlans.Add(new DevelopmentPlan
        {
            Id = planId,
            PlayerId = playerId,
            CreatedBy = coachId,
            Title = title,
            Status = status,
            PeriodStart = DateOnly.FromDateTime(now),
            PeriodEnd = DateOnly.FromDateTime(now.AddMonths(3)),
            Description = "Improve passing accuracy",
            CoachNotes = string.Empty,
            CreatedAt = now,
            UpdatedAt = now
        });
        await Context.SaveChangesAsync();
        return planId;
    }

    // ────────────────────────────────────────────
    //  PlayerReport
    // ────────────────────────────────────────────

    public async Task<Guid> SeedPlayerReportAsync(
        Guid playerId,
        Guid? coachId = null)
    {
        var reportId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        Context.PlayerReports.Add(new PlayerReport
        {
            Id = reportId,
            PlayerId = playerId,
            CreatedBy = coachId,
            PeriodStart = DateOnly.FromDateTime(now.AddMonths(-1)),
            PeriodEnd = DateOnly.FromDateTime(now),
            OverallRating = 75,
            Strengths = "[\"Passing\",\"Vision\"]",
            AreasForImprovement = "[\"Finishing\"]",
            CoachComments = "Good progress this term",
            CreatedAt = now
        });
        await Context.SaveChangesAsync();
        return reportId;
    }

    // ────────────────────────────────────────────
    //  AttributeEvaluation
    // ────────────────────────────────────────────

    public async Task<Guid> SeedAttributeEvaluationAsync(
        Guid playerId,
        Guid coachId)
    {
        var evalId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        Context.AttributeEvaluations.Add(new AttributeEvaluation
        {
            Id = evalId,
            PlayerId = playerId,
            EvaluatedBy = coachId,
            EvaluatedAt = now,
            OverallRating = 72
        });
        await Context.SaveChangesAsync();
        return evalId;
    }

    // ────────────────────────────────────────────
    //  EmergencyContact
    // ────────────────────────────────────────────

    public async Task<Guid> SeedEmergencyContactAsync(
        Guid playerId,
        string name = "Parent One",
        bool isPrimary = true,
        string? email = null)
    {
        var contactId = Guid.NewGuid();

        Context.EmergencyContacts.Add(new EmergencyContact
        {
            Id = contactId,
            PlayerId = playerId,
            Name = name,
            Phone = "+447700900001",
            Email = email,
            Relationship = "Parent",
            IsPrimary = isPrimary
        });
        await Context.SaveChangesAsync();
        return contactId;
    }

    // ────────────────────────────────────────────
    //  Convenience: full stack seed
    // ────────────────────────────────────────────

    /// <summary>
    /// Seeds a complete club → age group → team stack. Returns all IDs.
    /// </summary>
    public async Task<(Guid ClubId, Guid AgeGroupId, Guid TeamId)> SeedClubWithTeamAsync(string clubName = "Vale FC")
    {
        var clubId = await SeedClubAsync(clubName);
        var ageGroupId = await SeedAgeGroupAsync(clubId);
        var teamId = await SeedTeamAsync(clubId, ageGroupId);
        return (clubId, ageGroupId, teamId);
    }

    /// <summary>
    /// Seeds a full match-ready stack: club, age group, team, formation, tactic, 2 players.
    /// </summary>
    public async Task<MatchSeedData> SeedMatchReadyDataAsync()
    {
        var (clubId, ageGroupId, teamId) = await SeedClubWithTeamAsync();
        var formationId = await SeedSystemFormationAsync();
        var tacticId = await SeedTacticAsync(formationId);
        var playerOneId = await SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "Invited", "Player");
        var playerTwoId = await SeedPlayerAsync(clubId, "NonInvited", "Player");
        return new MatchSeedData(clubId, ageGroupId, teamId, formationId, tacticId, playerOneId, playerTwoId);
    }

    public async ValueTask DisposeAsync()
    {
        await Context.DisposeAsync();

        // Drop the test database
        var masterOptions = new DbContextOptionsBuilder<OurGameContext>()
            .UseSqlServer(MasterConnection)
            .Options;
        await using var masterContext = new OurGameContext(masterOptions);
        await masterContext.Database.ExecuteSqlRawAsync(
            $"ALTER DATABASE [{_databaseName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [{_databaseName}]");
    }
}

// ────────────────────────────────────────────
//  Seed data records
// ────────────────────────────────────────────

public readonly record struct MatchSeedData(
    Guid ClubId,
    Guid AgeGroupId,
    Guid TeamId,
    Guid FormationId,
    Guid TacticId,
    Guid PlayerOneId,
    Guid PlayerTwoId);

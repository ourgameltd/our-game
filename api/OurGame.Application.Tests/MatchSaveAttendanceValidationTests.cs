using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Matches.Commands.CreateMatch;
using OurGame.Application.UseCases.Matches.Commands.CreateMatch.DTOs;
using OurGame.Application.UseCases.Matches.Commands.UpdateMatch;
using OurGame.Application.UseCases.Matches.Commands.UpdateMatch.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests;

public class MatchSaveAttendanceValidationTests
{
    [Fact]
    public async Task CreateMatch_WhenAttendanceIncludesNonInvitedPlayer_ThrowsValidationException()
    {
        await using var database = await TestDatabase.CreateAsync();
        var data = await database.SeedBaseDataAsync();

        var handler = new CreateMatchHandler(database.Context);
        var request = BuildCreateRequest(
            data.TeamId,
            data.FormationId,
            data.TacticId,
            invitedPlayerIds: [data.PlayerOneId],
            attendancePlayerIds: [data.PlayerTwoId]);

        var exception = await Assert.ThrowsAsync<ValidationException>(async () =>
            await handler.Handle(new CreateMatchCommand(request), CancellationToken.None));

        Assert.True(exception.Errors.ContainsKey("Attendance"));
    }

    [Fact]
    public async Task UpdateMatch_WhenAttendanceIncludesRemovedPlayer_ThrowsValidationException()
    {
        await using var database = await TestDatabase.CreateAsync();
        var data = await database.SeedBaseDataAsync();

        var createHandler = new CreateMatchHandler(database.Context);
        var createdMatch = await createHandler.Handle(
            new CreateMatchCommand(BuildCreateRequest(
                data.TeamId,
                data.FormationId,
                data.TacticId,
                invitedPlayerIds: [data.PlayerOneId],
                attendancePlayerIds: [data.PlayerOneId])),
            CancellationToken.None);

        var updateHandler = new UpdateMatchHandler(database.Context);
        var updateRequest = BuildUpdateRequest(
            data.FormationId,
            data.TacticId,
            invitedPlayerIds: [data.PlayerOneId],
            attendancePlayerIds: [data.PlayerTwoId]);

        var exception = await Assert.ThrowsAsync<ValidationException>(async () =>
            await updateHandler.Handle(new UpdateMatchCommand(createdMatch.Id, updateRequest), CancellationToken.None));

        Assert.True(exception.Errors.ContainsKey("Attendance"));
    }

    private static CreateMatchRequest BuildCreateRequest(
        Guid teamId,
        Guid formationId,
        Guid tacticId,
        IReadOnlyCollection<Guid> invitedPlayerIds,
        IReadOnlyCollection<Guid> attendancePlayerIds)
    {
        return new CreateMatchRequest
        {
            TeamId = teamId,
            SeasonId = "2025-26",
            SquadSize = 11,
            Opposition = "Rivals FC",
            MatchDate = DateTime.UtcNow,
            KickOffTime = DateTime.UtcNow,
            Location = "Home Ground",
            IsHome = true,
            Competition = "League",
            Status = "scheduled",
            Lineup = new CreateMatchLineupRequest
            {
                FormationId = formationId,
                TacticId = tacticId,
                Players = invitedPlayerIds.Select((playerId, index) => new CreateLineupPlayerRequest
                {
                    PlayerId = playerId,
                    PositionIndex = index,
                    Position = "CM",
                    SquadNumber = index + 1,
                    IsStarting = true
                }).ToList()
            },
            Attendance = attendancePlayerIds.Select(playerId => new CreateMatchAttendanceRequest
            {
                PlayerId = playerId,
                Status = "confirmed"
            }).ToList()
        };
    }

    private static UpdateMatchRequest BuildUpdateRequest(
        Guid formationId,
        Guid tacticId,
        IReadOnlyCollection<Guid> invitedPlayerIds,
        IReadOnlyCollection<Guid> attendancePlayerIds)
    {
        return new UpdateMatchRequest
        {
            SeasonId = "2025-26",
            SquadSize = 11,
            Opposition = "Updated Rivals FC",
            MatchDate = DateTime.UtcNow,
            KickOffTime = DateTime.UtcNow,
            Location = "Updated Ground",
            IsHome = true,
            Competition = "League",
            Status = "scheduled",
            IsLocked = false,
            Lineup = new UpdateMatchLineupRequest
            {
                FormationId = formationId,
                TacticId = tacticId,
                Players = invitedPlayerIds.Select((playerId, index) => new UpdateLineupPlayerRequest
                {
                    PlayerId = playerId,
                    PositionIndex = index,
                    Position = "CM",
                    SquadNumber = index + 1,
                    IsStarting = true
                }).ToList()
            },
            Attendance = attendancePlayerIds.Select(playerId => new UpdateMatchAttendanceRequest
            {
                PlayerId = playerId,
                Status = "confirmed"
            }).ToList()
        };
    }

    private sealed class TestDatabase : IAsyncDisposable
    {
        private readonly SqliteConnection _connection;

        public OurGameContext Context { get; }

        private TestDatabase(SqliteConnection connection, OurGameContext context)
        {
            _connection = connection;
            Context = context;
        }

        public static async Task<TestDatabase> CreateAsync()
        {
            var connection = new SqliteConnection("Data Source=:memory:");
            await connection.OpenAsync();

            var options = new DbContextOptionsBuilder<OurGameContext>()
                .UseSqlite(connection)
                .Options;

            var context = new OurGameContext(options);
            await context.Database.EnsureCreatedAsync();

            return new TestDatabase(connection, context);
        }

        public async Task<SeededData> SeedBaseDataAsync()
        {
            var now = DateTime.UtcNow;
            var clubId = Guid.NewGuid();
            var ageGroupId = Guid.NewGuid();
            var teamId = Guid.NewGuid();
            var playerOneId = Guid.NewGuid();
            var playerTwoId = Guid.NewGuid();
            var formationId = Guid.NewGuid();
            var tacticId = Guid.NewGuid();

            Context.Clubs.Add(new Club
            {
                Id = clubId,
                Name = "Vale FC",
                ShortName = "Vale",
                Logo = string.Empty,
                PrimaryColor = "#ff0000",
                SecondaryColor = "#ffffff",
                AccentColor = "#000000",
                City = "Vale",
                Country = "GB",
                Venue = "Vale Ground",
                Address = "1 Football Road",
                History = string.Empty,
                Ethos = string.Empty,
                Principles = string.Empty,
                CreatedAt = now,
                UpdatedAt = now
            });

            Context.AgeGroups.Add(new AgeGroup
            {
                Id = ageGroupId,
                ClubId = clubId,
                Name = "U15",
                Code = "u15",
                Level = Level.Youth,
                CurrentSeason = "2025-26",
                Seasons = "2025-26",
                DefaultSeason = "2025-26",
                DefaultSquadSize = SquadSize.ElevenASide,
                Description = string.Empty,
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            });

            Context.Formations.AddRange(
                new Formation
                {
                    Id = formationId,
                    Name = "4-3-3",
                    System = "4-3-3",
                    SquadSize = SquadSize.ElevenASide,
                    IsSystemFormation = true,
                    ParentFormationId = null,
                    ParentTacticId = null,
                    Summary = string.Empty,
                    Description = string.Empty,
                    Style = string.Empty,
                    Tags = string.Empty,
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new Formation
                {
                    Id = tacticId,
                    Name = "High Press",
                    System = "4-3-3",
                    SquadSize = SquadSize.ElevenASide,
                    IsSystemFormation = false,
                    ParentFormationId = formationId,
                    ParentTacticId = null,
                    Summary = string.Empty,
                    Description = string.Empty,
                    Style = string.Empty,
                    Tags = string.Empty,
                    CreatedAt = now,
                    UpdatedAt = now
                });

            Context.Teams.Add(new Team
            {
                Id = teamId,
                ClubId = clubId,
                AgeGroupId = ageGroupId,
                Name = "Blues",
                ShortName = "BLU",
                Level = "Youth",
                Season = "2025-26",
                PrimaryColor = "#ff0000",
                SecondaryColor = "#ffffff",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            });

            Context.Players.AddRange(
                new Player
                {
                    Id = playerOneId,
                    ClubId = clubId,
                    FirstName = "Invited",
                    LastName = "Player",
                    PreferredPositions = "CM",
                    IsArchived = false,
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new Player
                {
                    Id = playerTwoId,
                    ClubId = clubId,
                    FirstName = "NonInvited",
                    LastName = "Player",
                    PreferredPositions = "CM",
                    IsArchived = false,
                    CreatedAt = now,
                    UpdatedAt = now
                });

            await Context.SaveChangesAsync();

            return new SeededData(teamId, formationId, tacticId, playerOneId, playerTwoId);
        }

        public async ValueTask DisposeAsync()
        {
            await Context.DisposeAsync();
            await _connection.DisposeAsync();
        }
    }

    private readonly record struct SeededData(
        Guid TeamId,
        Guid FormationId,
        Guid TacticId,
        Guid PlayerOneId,
        Guid PlayerTwoId);
}

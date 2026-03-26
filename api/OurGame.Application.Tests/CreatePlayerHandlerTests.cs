using MediatR;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Players.Commands.CreatePlayer;
using OurGame.Application.UseCases.Players.Commands.CreatePlayer.DTOs;
using OurGame.Application.UseCases.Players.Commands.UpdatePlayerById.DTOs;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests;

public class CreatePlayerHandlerTests
{
    [Fact]
    public async Task CreatePlayer_WithValidRequest_CreatesPlayerWithAssignmentsAndContacts()
    {
        await using var database = await TestDatabase.CreateAsync();
        var seed = await database.SeedSingleClubWithTeamAsync();
        var mediator = new TestMediator(database.Context);
        var handler = new CreatePlayerHandler(database.Context, mediator);

        var request = new CreatePlayerRequestDto
        {
            FirstName = "Alex",
            LastName = "Vale",
            DateOfBirth = new DateOnly(2012, 5, 20),
            PreferredPositions = ["CB", "CM"],
            TeamIds = [seed.TeamId],
            EmergencyContacts =
            [
                new EmergencyContactRequestDto
                {
                    Name = "Parent One",
                    Phone = "+447700900001",
                    Relationship = "Parent",
                    IsPrimary = false,
                }
            ]
        };

        var result = await handler.Handle(new CreatePlayerCommand(seed.ClubId, request, "test-user"), CancellationToken.None);

        Assert.Equal("Alex", result.FirstName);
        Assert.Equal("Vale", result.LastName);
        Assert.Contains(seed.TeamId, result.TeamIds);
        Assert.Contains(seed.AgeGroupId, result.AgeGroupIds);
        Assert.Contains("CB", result.PreferredPositions);

        var dbPlayer = await database.Context.Players.SingleAsync(p => p.Id == result.Id);
        Assert.Equal(seed.ClubId, dbPlayer.ClubId);
        Assert.Equal("Alex", dbPlayer.FirstName);

        var dbContacts = await database.Context.EmergencyContacts
            .Where(c => c.PlayerId == result.Id)
            .ToListAsync();

        Assert.Single(dbContacts);
        Assert.True(dbContacts[0].IsPrimary);

        var dbTeamLinks = await database.Context.PlayerTeams
            .Where(pt => pt.PlayerId == result.Id)
            .ToListAsync();
        Assert.Single(dbTeamLinks);
        Assert.Equal(seed.TeamId, dbTeamLinks[0].TeamId);
    }

    [Fact]
    public async Task CreatePlayer_WhenPreferredPositionsMissing_ThrowsValidationException()
    {
        await using var database = await TestDatabase.CreateAsync();
        var mediator = new TestMediator(database.Context);
        var handler = new CreatePlayerHandler(database.Context, mediator);

        var request = new CreatePlayerRequestDto
        {
            FirstName = "Alex",
            LastName = "Vale",
            DateOfBirth = new DateOnly(2012, 5, 20),
            PreferredPositions = []
        };

        var exception = await Assert.ThrowsAsync<ValidationException>(async () =>
            await handler.Handle(new CreatePlayerCommand(Guid.NewGuid(), request, "test-user"), CancellationToken.None));

        Assert.True(exception.Errors.ContainsKey("PreferredPositions"));
    }

    [Fact]
    public async Task CreatePlayer_WhenClubNotFound_ThrowsNotFoundException()
    {
        await using var database = await TestDatabase.CreateAsync();
        var mediator = new TestMediator(database.Context);
        var handler = new CreatePlayerHandler(database.Context, mediator);

        var request = new CreatePlayerRequestDto
        {
            FirstName = "Alex",
            LastName = "Vale",
            DateOfBirth = new DateOnly(2012, 5, 20),
            PreferredPositions = ["ST"]
        };

        await Assert.ThrowsAsync<NotFoundException>(async () =>
            await handler.Handle(new CreatePlayerCommand(Guid.NewGuid(), request, "test-user"), CancellationToken.None));
    }

    [Fact]
    public async Task CreatePlayer_WhenTeamDoesNotBelongToClub_ThrowsValidationException()
    {
        await using var database = await TestDatabase.CreateAsync();
        var seed = await database.SeedTwoClubsWithForeignTeamAsync();
        var mediator = new TestMediator(database.Context);
        var handler = new CreatePlayerHandler(database.Context, mediator);

        var request = new CreatePlayerRequestDto
        {
            FirstName = "Alex",
            LastName = "Vale",
            DateOfBirth = new DateOnly(2012, 5, 20),
            PreferredPositions = ["CM"],
            TeamIds = [seed.ForeignTeamId]
        };

        var exception = await Assert.ThrowsAsync<ValidationException>(async () =>
            await handler.Handle(new CreatePlayerCommand(seed.ClubId, request, "test-user"), CancellationToken.None));

        Assert.True(exception.Errors.ContainsKey("TeamIds"));
    }

    private sealed class TestMediator : IMediator
    {
        private readonly OurGameContext _db;

        public TestMediator(OurGameContext db)
        {
            _db = db;
        }

        public async Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)
        {
            if (request is GetPlayerByIdQuery query)
            {
                var handler = new GetPlayerByIdHandler(_db);
                var result = await handler.Handle(query, cancellationToken);
                return (TResponse)(object?)result!;
            }

            throw new NotSupportedException($"Unsupported request type: {request.GetType().Name}");
        }

        public async Task<object?> Send(object request, CancellationToken cancellationToken = default)
        {
            if (request is GetPlayerByIdQuery query)
            {
                var handler = new GetPlayerByIdHandler(_db);
                return await handler.Handle(query, cancellationToken);
            }

            throw new NotSupportedException($"Unsupported request type: {request.GetType().Name}");
        }

        public Task Send<TRequest>(TRequest request, CancellationToken cancellationToken = default)
            where TRequest : IRequest
            => throw new NotSupportedException($"Unsupported request type: {request?.GetType().Name}");

        public IAsyncEnumerable<TResponse> CreateStream<TResponse>(IStreamRequest<TResponse> request, CancellationToken cancellationToken = default)
            => throw new NotSupportedException();

        public IAsyncEnumerable<object?> CreateStream(object request, CancellationToken cancellationToken = default)
            => throw new NotSupportedException();

        public Task Publish(object notification, CancellationToken cancellationToken = default)
            => Task.CompletedTask;

        public Task Publish<TNotification>(TNotification notification, CancellationToken cancellationToken = default)
            where TNotification : INotification
            => Task.CompletedTask;
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

        public async Task<SeedSingleClubData> SeedSingleClubWithTeamAsync()
        {
            var now = DateTime.UtcNow;
            var clubId = Guid.NewGuid();
            var ageGroupId = Guid.NewGuid();
            var teamId = Guid.NewGuid();

            Context.Clubs.Add(BuildClub(clubId, now, "Vale FC"));

            Context.AgeGroups.Add(new AgeGroup
            {
                Id = ageGroupId,
                ClubId = clubId,
                Name = "U14",
                Code = "u14",
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

            Context.Teams.Add(new Team
            {
                Id = teamId,
                ClubId = clubId,
                AgeGroupId = ageGroupId,
                Name = "Vale Blues",
                ShortName = "Blues",
                Level = "League",
                Season = "2025-26",
                PrimaryColor = "#ff0000",
                SecondaryColor = "#ffffff",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            });

            await Context.SaveChangesAsync();

            return new SeedSingleClubData(clubId, ageGroupId, teamId);
        }

        public async Task<SeedTwoClubsData> SeedTwoClubsWithForeignTeamAsync()
        {
            var now = DateTime.UtcNow;
            var clubId = Guid.NewGuid();
            var foreignClubId = Guid.NewGuid();
            var foreignAgeGroupId = Guid.NewGuid();
            var foreignTeamId = Guid.NewGuid();

            Context.Clubs.AddRange(
                BuildClub(clubId, now, "Home Club"),
                BuildClub(foreignClubId, now, "Foreign Club"));

            Context.AgeGroups.Add(new AgeGroup
            {
                Id = foreignAgeGroupId,
                ClubId = foreignClubId,
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

            Context.Teams.Add(new Team
            {
                Id = foreignTeamId,
                ClubId = foreignClubId,
                AgeGroupId = foreignAgeGroupId,
                Name = "Foreign Team",
                ShortName = "FT",
                Level = "League",
                Season = "2025-26",
                PrimaryColor = "#0000ff",
                SecondaryColor = "#ffffff",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            });

            await Context.SaveChangesAsync();

            return new SeedTwoClubsData(clubId, foreignTeamId);
        }

        private static Club BuildClub(Guid clubId, DateTime now, string name)
            => new()
            {
                Id = clubId,
                Name = name,
                ShortName = name,
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
            };

        public async ValueTask DisposeAsync()
        {
            await Context.DisposeAsync();
            await _connection.DisposeAsync();
        }
    }

    private sealed record SeedSingleClubData(Guid ClubId, Guid AgeGroupId, Guid TeamId);
    private sealed record SeedTwoClubsData(Guid ClubId, Guid ForeignTeamId);
}
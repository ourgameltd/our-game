using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Matches.Commands.CreateMatch.DTOs;
using OurGame.Application.UseCases.Matches.Queries.GetMatchById;
using OurGame.Application.UseCases.Matches.Queries.GetMatchById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Matches.Commands.CreateMatch;

/// <summary>
/// Command to create a new match with optional lineup, report, coaches, and substitutions
/// </summary>
public record CreateMatchCommand(CreateMatchRequest Dto) : IRequest<MatchDetailDto>;

/// <summary>
/// Handler for creating a new match
/// </summary>
public class CreateMatchHandler : IRequestHandler<CreateMatchCommand, MatchDetailDto>
{
    private readonly OurGameContext _db;

    public CreateMatchHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<MatchDetailDto> Handle(CreateMatchCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;

        // Validate required fields
        if (string.IsNullOrWhiteSpace(dto.Opposition))
        {
            throw new ValidationException("Opposition", "Opposition is required.");
        }

        // Validate team exists
        var teamExists = await _db.Teams.AnyAsync(t => t.Id == dto.TeamId, cancellationToken);
        if (!teamExists)
        {
            throw new NotFoundException("Team", dto.TeamId.ToString());
        }

        await ValidateLineupReferencesAsync(dto.Lineup, cancellationToken);

        // Parse match status
        var statusInt = ParseStatus(dto.Status);

        var matchId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var squadSizeInt = dto.SquadSize;
        var location = dto.Location ?? string.Empty;
        var competition = dto.Competition ?? string.Empty;
        var notes = dto.Notes ?? string.Empty;
        var weatherCondition = dto.WeatherCondition;

        // Insert match
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO Matches (Id, TeamId, SeasonId, SquadSize, Opposition, MatchDate, MeetTime, KickOffTime,
                Location, IsHome, Competition, PrimaryKitId, SecondaryKitId, GoalkeeperKitId,
                HomeScore, AwayScore, Status, IsLocked, Notes, WeatherCondition, WeatherTemperature,
                CreatedAt, UpdatedAt)
            VALUES ({matchId}, {dto.TeamId}, {dto.SeasonId}, {squadSizeInt}, {dto.Opposition}, {dto.MatchDate},
                {dto.MeetTime}, {dto.KickOffTime}, {location}, {dto.IsHome}, {competition},
                {dto.PrimaryKitId}, {dto.SecondaryKitId}, {dto.GoalkeeperKitId},
                {dto.HomeScore}, {dto.AwayScore}, {statusInt}, {false}, {notes},
                {weatherCondition}, {dto.WeatherTemperature}, {now}, {now})
        ", cancellationToken);

        // Insert lineup if provided
        if (dto.Lineup != null)
        {
            var lineupId = Guid.NewGuid();
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO MatchLineups (Id, MatchId, FormationId, TacticId)
                VALUES ({lineupId}, {matchId}, {dto.Lineup.FormationId}, {dto.Lineup.TacticId})
            ", cancellationToken);

            foreach (var player in dto.Lineup.Players)
            {
                var lpId = Guid.NewGuid();
                var position = player.Position ?? string.Empty;
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO LineupPlayers (Id, LineupId, PlayerId, PositionIndex, Position, SquadNumber, IsStarting)
                    VALUES ({lpId}, {lineupId}, {player.PlayerId}, {player.PositionIndex}, {position}, {player.SquadNumber}, {player.IsStarting})
                ", cancellationToken);
            }
        }

        // Insert match coaches
        foreach (var coachId in dto.CoachIds)
        {
            var mcId = Guid.NewGuid();
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO MatchCoaches (Id, MatchId, CoachId)
                VALUES ({mcId}, {matchId}, {coachId})
            ", cancellationToken);
        }

        // Insert substitutions
        foreach (var sub in dto.Substitutions)
        {
            var subId = Guid.NewGuid();
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO MatchSubstitutions (Id, MatchId, Minute, PlayerOutId, PlayerInId)
                VALUES ({subId}, {matchId}, {sub.Minute}, {sub.PlayerOutId}, {sub.PlayerInId})
            ", cancellationToken);
        }

        // Insert attendance
        if (dto.Attendance != null && dto.Attendance.Any())
        {
            foreach (var attendance in dto.Attendance)
            {
                var attendanceId = Guid.NewGuid();
                var attendanceNotes = attendance.Notes ?? string.Empty;
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO MatchAttendances (Id, MatchId, PlayerId, Status, Notes, CreatedAt, UpdatedAt)
                    VALUES ({attendanceId}, {matchId}, {attendance.PlayerId}, {attendance.Status}, {attendanceNotes}, {now}, {now})
                ", cancellationToken);
            }
        }

        // Insert match report if provided
        if (dto.Report != null)
        {
            var reportId = Guid.NewGuid();
            var summary = dto.Report.Summary ?? string.Empty;
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO MatchReports (Id, MatchId, Summary, CaptainId, PlayerOfMatchId, CreatedAt)
                VALUES ({reportId}, {matchId}, {summary}, {dto.Report.CaptainId}, {dto.Report.PlayerOfMatchId}, {now})
            ", cancellationToken);

            // Insert goals
            foreach (var goal in dto.Report.Goals)
            {
                var goalId = Guid.NewGuid();
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO Goals (Id, MatchReportId, PlayerId, Minute, AssistPlayerId)
                    VALUES ({goalId}, {reportId}, {goal.PlayerId}, {goal.Minute}, {goal.AssistPlayerId})
                ", cancellationToken);
            }

            // Insert cards
            foreach (var card in dto.Report.Cards)
            {
                var cardId = Guid.NewGuid();
                var cardTypeInt = ParseCardType(card.Type);
                var reason = card.Reason ?? string.Empty;
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO Cards (Id, MatchReportId, PlayerId, Type, Minute, Reason)
                    VALUES ({cardId}, {reportId}, {card.PlayerId}, {cardTypeInt}, {card.Minute}, {reason})
                ", cancellationToken);
            }

            // Insert injuries
            foreach (var injury in dto.Report.Injuries)
            {
                var injuryId = Guid.NewGuid();
                var severityInt = ParseSeverity(injury.Severity);
                var description = injury.Description ?? string.Empty;
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO Injuries (Id, MatchReportId, PlayerId, Minute, Description, Severity)
                    VALUES ({injuryId}, {reportId}, {injury.PlayerId}, {injury.Minute}, {description}, {severityInt})
                ", cancellationToken);
            }

            // Insert performance ratings
            foreach (var rating in dto.Report.PerformanceRatings)
            {
                var ratingId = Guid.NewGuid();
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO PerformanceRatings (Id, MatchReportId, PlayerId, Rating)
                    VALUES ({ratingId}, {reportId}, {rating.PlayerId}, {rating.Rating})
                ", cancellationToken);
            }
        }

        // Query back the created match using the same SQL pattern as GetMatchByIdHandler
        var result = await new GetMatchByIdHandler(_db)
            .Handle(new GetMatchByIdQuery(matchId), cancellationToken);

        if (result == null)
        {
            throw new Exception("Failed to retrieve created match.");
        }

        return result;
    }

    private async Task ValidateLineupReferencesAsync(CreateMatchLineupRequest? lineup, CancellationToken cancellationToken)
    {
        if (lineup == null)
        {
            return;
        }

        var errors = new Dictionary<string, string[]>();

        if (lineup.FormationId == Guid.Empty)
        {
            errors["Lineup.FormationId"] = ["FormationId must be a valid non-empty GUID."];
        }

        if (lineup.TacticId == Guid.Empty)
        {
            errors["Lineup.TacticId"] = ["TacticId must be a valid non-empty GUID."];
        }

        FormationReference? formation = null;
        if (lineup.FormationId.HasValue && lineup.FormationId.Value != Guid.Empty)
        {
            formation = await _db.Formations
                .Where(f => f.Id == lineup.FormationId.Value)
                .Select(f => new FormationReference
                {
                    Id = f.Id,
                    IsSystemFormation = f.IsSystemFormation,
                    ParentFormationId = f.ParentFormationId
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (formation == null)
            {
                errors["Lineup.FormationId"] = ["FormationId must reference an existing formation."];
            }
            else if (!formation.IsSystemFormation)
            {
                errors["Lineup.FormationId"] = ["FormationId must reference an existing system formation."];
            }
        }

        FormationReference? tactic = null;
        if (lineup.TacticId.HasValue && lineup.TacticId.Value != Guid.Empty)
        {
            tactic = await _db.Formations
                .Where(f => f.Id == lineup.TacticId.Value)
                .Select(f => new FormationReference
                {
                    Id = f.Id,
                    IsSystemFormation = f.IsSystemFormation,
                    ParentFormationId = f.ParentFormationId
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (tactic == null)
            {
                errors["Lineup.TacticId"] = ["TacticId must reference an existing tactic."];
            }
            else if (tactic.IsSystemFormation || !tactic.ParentFormationId.HasValue)
            {
                errors["Lineup.TacticId"] = ["TacticId must reference an existing tactic."];
            }
        }

        if (formation?.Id != null && tactic?.ParentFormationId != null && tactic.ParentFormationId != formation.Id)
        {
            errors["Lineup.TacticId"] = ["TacticId must belong to the selected FormationId."];
        }

        if (errors.Count > 0)
        {
            throw new ValidationException(errors);
        }
    }

    private static int ParseStatus(string? status)
    {
        return (status?.ToLower()) switch
        {
            "scheduled" => (int)MatchStatus.Scheduled,
            "in-progress" or "inprogress" => (int)MatchStatus.InProgress,
            "completed" => (int)MatchStatus.Completed,
            "postponed" => (int)MatchStatus.Postponed,
            "cancelled" => (int)MatchStatus.Cancelled,
            _ => (int)MatchStatus.Scheduled
        };
    }

    private static int ParseCardType(string? type)
    {
        return (type?.ToLower()) switch
        {
            "red" => (int)CardType.Red,
            _ => (int)CardType.Yellow
        };
    }

    private static int ParseSeverity(string? severity)
    {
        return (severity?.ToLower()) switch
        {
            "moderate" => (int)Severity.Moderate,
            "serious" => (int)Severity.Serious,
            _ => (int)Severity.Minor
        };
    }

    private sealed class FormationReference
    {
        public Guid Id { get; init; }

        public bool IsSystemFormation { get; init; }

        public Guid? ParentFormationId { get; init; }
    }
}

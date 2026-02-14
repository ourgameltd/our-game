using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Matches.Commands.UpdateMatch.DTOs;
using OurGame.Application.UseCases.Matches.Queries.GetMatchById;
using OurGame.Application.UseCases.Matches.Queries.GetMatchById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Matches.Commands.UpdateMatch;

/// <summary>
/// Command to update an existing match with all related data (replace strategy)
/// </summary>
public record UpdateMatchCommand(Guid MatchId, UpdateMatchRequest Dto) : IRequest<MatchDetailDto>;

/// <summary>
/// Handler for updating an existing match
/// </summary>
public class UpdateMatchHandler : IRequestHandler<UpdateMatchCommand, MatchDetailDto>
{
    private readonly OurGameContext _db;

    public UpdateMatchHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<MatchDetailDto> Handle(UpdateMatchCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var matchId = command.MatchId;

        // Validate required fields
        if (string.IsNullOrWhiteSpace(dto.Opposition))
        {
            throw new ValidationException("Opposition", "Opposition is required.");
        }

        // Check match exists
        var exists = await _db.Matches.AnyAsync(m => m.Id == matchId, cancellationToken);
        if (!exists)
        {
            throw new NotFoundException("Match", matchId.ToString());
        }

        // Parse match status
        var statusInt = ParseStatus(dto.Status);

        var now = DateTime.UtcNow;
        var location = dto.Location ?? string.Empty;
        var competition = dto.Competition ?? string.Empty;
        var notes = dto.Notes ?? string.Empty;
        var weatherCondition = dto.WeatherCondition;

        // Update the match record
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE Matches
            SET SeasonId = {dto.SeasonId},
                SquadSize = {dto.SquadSize},
                Opposition = {dto.Opposition},
                MatchDate = {dto.MatchDate},
                MeetTime = {dto.MeetTime},
                KickOffTime = {dto.KickOffTime},
                Location = {location},
                IsHome = {dto.IsHome},
                Competition = {competition},
                PrimaryKitId = {dto.PrimaryKitId},
                SecondaryKitId = {dto.SecondaryKitId},
                GoalkeeperKitId = {dto.GoalkeeperKitId},
                HomeScore = {dto.HomeScore},
                AwayScore = {dto.AwayScore},
                Status = {statusInt},
                IsLocked = {dto.IsLocked},
                Notes = {notes},
                WeatherCondition = {weatherCondition},
                WeatherTemperature = {dto.WeatherTemperature},
                UpdatedAt = {now}
            WHERE Id = {matchId}
        ", cancellationToken);

        // Replace lineup (delete existing + insert new)
        // First delete lineup players, then the lineup itself
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE lp FROM LineupPlayers lp
            INNER JOIN MatchLineups ml ON lp.LineupId = ml.Id
            WHERE ml.MatchId = {matchId}
        ", cancellationToken);

        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM MatchLineups WHERE MatchId = {matchId}
        ", cancellationToken);

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
                    INSERT INTO LineupPlayers (Id, LineupId, PlayerId, Position, SquadNumber, IsStarting)
                    VALUES ({lpId}, {lineupId}, {player.PlayerId}, {position}, {player.SquadNumber}, {player.IsStarting})
                ", cancellationToken);
            }
        }

        // Replace coaches
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM MatchCoaches WHERE MatchId = {matchId}
        ", cancellationToken);

        foreach (var coachId in dto.CoachIds)
        {
            var mcId = Guid.NewGuid();
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO MatchCoaches (Id, MatchId, CoachId)
                VALUES ({mcId}, {matchId}, {coachId})
            ", cancellationToken);
        }

        // Replace substitutions
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM MatchSubstitutions WHERE MatchId = {matchId}
        ", cancellationToken);

        foreach (var sub in dto.Substitutions)
        {
            var subId = Guid.NewGuid();
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO MatchSubstitutions (Id, MatchId, Minute, PlayerOutId, PlayerInId)
                VALUES ({subId}, {matchId}, {sub.Minute}, {sub.PlayerOutId}, {sub.PlayerInId})
            ", cancellationToken);
        }

        // Replace match report and its children
        // Delete children first (goals, cards, injuries, ratings), then the report
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE g FROM Goals g
            INNER JOIN MatchReports mr ON g.MatchReportId = mr.Id
            WHERE mr.MatchId = {matchId}
        ", cancellationToken);

        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE c FROM Cards c
            INNER JOIN MatchReports mr ON c.MatchReportId = mr.Id
            WHERE mr.MatchId = {matchId}
        ", cancellationToken);

        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE i FROM Injuries i
            INNER JOIN MatchReports mr ON i.MatchReportId = mr.Id
            WHERE mr.MatchId = {matchId}
        ", cancellationToken);

        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE pr FROM PerformanceRatings pr
            INNER JOIN MatchReports mr ON pr.MatchReportId = mr.Id
            WHERE mr.MatchId = {matchId}
        ", cancellationToken);

        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM MatchReports WHERE MatchId = {matchId}
        ", cancellationToken);

        if (dto.Report != null)
        {
            var reportId = Guid.NewGuid();
            var summary = dto.Report.Summary ?? string.Empty;
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO MatchReports (Id, MatchId, Summary, CaptainId, PlayerOfMatchId, CreatedAt)
                VALUES ({reportId}, {matchId}, {summary}, {dto.Report.CaptainId}, {dto.Report.PlayerOfMatchId}, {now})
            ", cancellationToken);

            foreach (var goal in dto.Report.Goals)
            {
                var goalId = Guid.NewGuid();
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO Goals (Id, MatchReportId, PlayerId, Minute, AssistPlayerId)
                    VALUES ({goalId}, {reportId}, {goal.PlayerId}, {goal.Minute}, {goal.AssistPlayerId})
                ", cancellationToken);
            }

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

            foreach (var rating in dto.Report.PerformanceRatings)
            {
                var ratingId = Guid.NewGuid();
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO PerformanceRatings (Id, MatchReportId, PlayerId, Rating)
                    VALUES ({ratingId}, {reportId}, {rating.PlayerId}, {rating.Rating})
                ", cancellationToken);
            }
        }

        // Query back the updated match
        var result = await new GetMatchByIdHandler(_db)
            .Handle(new GetMatchByIdQuery(matchId), cancellationToken);

        if (result == null)
        {
            throw new Exception("Failed to retrieve updated match.");
        }

        return result;
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
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Matches.Commands.EndMatch;

public record EndMatchCommand(Guid MatchId, string AuthId) : IRequest;

public class EndMatchHandler : IRequestHandler<EndMatchCommand>
{
    private readonly OurGameContext _db;
    private readonly INotificationService _notificationService;

    public EndMatchHandler(OurGameContext db, INotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    public async Task Handle(EndMatchCommand command, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.AuthId == command.AuthId, cancellationToken);

        if (user == null)
            throw new NotFoundException("User", command.AuthId);

        var match = await _db.Matches
            .Where(m => m.Id == command.MatchId)
            .Select(m => new
            {
                m.Id,
                m.Opposition,
                m.TeamId,
                TeamName = m.Team.Name,
                m.Team.AgeGroupId,
                m.Team.ClubId,
                m.IsHome,
                m.HomeScore,
                m.AwayScore,
                m.HomePenScore,
                m.AwayPenScore,
                HomeTeamName = m.IsHome ? m.Team.Name : m.Opposition,
                AwayTeamName = m.IsHome ? m.Opposition : m.Team.Name,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (match == null)
            throw new NotFoundException("Match", command.MatchId.ToString());

        var isCoach = await _db.TeamCoaches
            .AnyAsync(tc => tc.TeamId == match.TeamId && tc.Coach.UserId == user.Id, cancellationToken);

        if (!isCoach)
            throw new ForbiddenException("You are not a coach for this team.");

        // Derive scores from goal events if any are recorded; otherwise fall back to manually-entered values
        var allGoals = await _db.Goals
            .Where(g => g.MatchReport.MatchId == command.MatchId)
            .Select(g => new { g.IsOpponent, g.Period })
            .ToListAsync(cancellationToken);

        int? homeScore, awayScore, homePenScore, awayPenScore;

        if (allGoals.Count > 0)
        {
            var regularGoals = allGoals.Where(g => g.Period != "penalties").ToList();
            var penaltyGoals = allGoals.Where(g => g.Period == "penalties").ToList();

            homeScore = regularGoals.Count(g => match.IsHome ? !g.IsOpponent : g.IsOpponent);
            awayScore = regularGoals.Count(g => match.IsHome ? g.IsOpponent : !g.IsOpponent);
            homePenScore = penaltyGoals.Count > 0
                ? penaltyGoals.Count(g => match.IsHome ? !g.IsOpponent : g.IsOpponent)
                : null;
            awayPenScore = penaltyGoals.Count > 0
                ? penaltyGoals.Count(g => match.IsHome ? g.IsOpponent : !g.IsOpponent)
                : null;

            await _db.Matches
                .Where(m => m.Id == command.MatchId)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(m => m.Status, MatchStatus.Completed)
                    .SetProperty(m => m.HomeScore, homeScore)
                    .SetProperty(m => m.AwayScore, awayScore)
                    .SetProperty(m => m.HomePenScore, homePenScore)
                    .SetProperty(m => m.AwayPenScore, awayPenScore),
                    cancellationToken);
        }
        else
        {
            homeScore = match.HomeScore;
            awayScore = match.AwayScore;
            homePenScore = match.HomePenScore;
            awayPenScore = match.AwayPenScore;

            await _db.Matches
                .Where(m => m.Id == command.MatchId)
                .ExecuteUpdateAsync(s => s.SetProperty(m => m.Status, MatchStatus.Completed), cancellationToken);
        }

        var invitedPlayerIds = await _db.MatchAttendances
            .Where(ma => ma.MatchId == command.MatchId)
            .Select(ma => ma.PlayerId)
            .ToListAsync(cancellationToken);

        var playerUserIds = await _db.Players
            .Where(p => invitedPlayerIds.Contains(p.Id) && p.UserId != null)
            .Select(p => p.UserId!.Value)
            .ToListAsync(cancellationToken);

        var parentUserIds = await _db.EmergencyContacts
            .Where(ec => ec.PlayerId != null
                      && invitedPlayerIds.Contains(ec.PlayerId.Value)
                      && ec.UserId != null)
            .Select(ec => ec.UserId!.Value)
            .ToListAsync(cancellationToken);

        var coachUserIds = await _db.TeamCoaches
            .Where(tc => tc.TeamId == match.TeamId && tc.Coach.UserId != null)
            .Select(tc => tc.Coach.UserId!.Value)
            .ToListAsync(cancellationToken);

        var coachUserIdSet = coachUserIds.ToHashSet();
        var playerAndParentUserIds = playerUserIds
            .Concat(parentUserIds)
            .Distinct()
            .Where(id => !coachUserIdSet.Contains(id))
            .ToList();

        if (playerAndParentUserIds.Count == 0 && coachUserIds.Count == 0)
            return;

        var url = $"/dashboard/{match.ClubId}/age-groups/{match.AgeGroupId}/teams/{match.TeamId}/matches/{match.Id}";
        var title = BuildFullTimeTitle(match.HomeTeamName, match.AwayTeamName, homeScore, awayScore, homePenScore, awayPenScore);

        foreach (var userId in playerAndParentUserIds)
        {
            await _notificationService.CreateAsync(
                userId,
                "fulltime",
                title,
                "The match has ended.",
                url,
                sendPush: true,
                audience: "player",
                cancellationToken);
        }

        foreach (var userId in coachUserIds.Distinct())
        {
            await _notificationService.CreateAsync(
                userId,
                "fulltime",
                title,
                "The match has ended.",
                url,
                sendPush: true,
                audience: "coach",
                cancellationToken);
        }
    }

    private static string BuildFullTimeTitle(
        string homeTeam,
        string awayTeam,
        int? homeScore,
        int? awayScore,
        int? homePen,
        int? awayPen)
    {
        if (homeScore == null || awayScore == null)
            return $"Full Time: {homeTeam} vs {awayTeam}";

        if (homePen != null && awayPen != null)
            return $"Full Time: {homeTeam} {homeScore} ({homePen})–({awayPen}) {awayScore} {awayTeam}";

        return $"Full Time: {homeTeam} {homeScore}–{awayScore} {awayTeam}";
    }
}

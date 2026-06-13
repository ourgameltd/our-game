using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Matches.Commands.StartMatch;

public record StartMatchCommand(Guid MatchId, string AuthId) : IRequest;

public class StartMatchHandler : IRequestHandler<StartMatchCommand>
{
    private readonly OurGameContext _db;
    private readonly INotificationService _notificationService;

    public StartMatchHandler(OurGameContext db, INotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    public async Task Handle(StartMatchCommand command, CancellationToken cancellationToken)
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
                m.Location,
                TeamName = m.Team.Name,
                m.Team.AgeGroupId,
                m.Team.ClubId,
                m.IsHome,
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

        await _db.Matches
            .Where(m => m.Id == command.MatchId)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.Status, MatchStatus.InProgress), cancellationToken);

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
        var title = $"Kick Off! {match.HomeTeamName} vs {match.AwayTeamName}";
        var message = string.IsNullOrWhiteSpace(match.Location)
            ? "The match has kicked off."
            : $"Match has kicked off at {match.Location}.";

        foreach (var userId in playerAndParentUserIds)
        {
            await _notificationService.CreateAsync(
                userId,
                "kickoff",
                title,
                message,
                url,
                sendPush: true,
                audience: "player",
                cancellationToken);
        }

        foreach (var userId in coachUserIds.Distinct())
        {
            await _notificationService.CreateAsync(
                userId,
                "kickoff",
                title,
                message,
                url,
                sendPush: true,
                audience: "coach",
                cancellationToken);
        }
    }
}

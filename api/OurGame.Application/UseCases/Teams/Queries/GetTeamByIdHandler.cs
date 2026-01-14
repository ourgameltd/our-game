using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Teams.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Queries;

/// <summary>
/// Handler for GetTeamByIdQuery
/// </summary>
public class GetTeamByIdHandler : IRequestHandler<GetTeamByIdQuery, TeamDetailDto>
{
    private readonly OurGameContext _db;

    public GetTeamByIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<TeamDetailDto> Handle(GetTeamByIdQuery query, CancellationToken cancellationToken)
    {
        var team = await _db.Teams
            .AsNoTracking()
            .Include(t => t.TeamCoaches)
            .FirstOrDefaultAsync(t => t.Id == query.TeamId);

        if (team == null)
        {
            throw new NotFoundException("Team", query.TeamId);
        }

        // Get statistics
        var statistics = await GetTeamStatistics(query.TeamId);

        return new TeamDetailDto
        {
            Id = team.Id,
            ClubId = team.ClubId,
            AgeGroupId = team.AgeGroupId,
            Name = team.Name,
            ShortName = team.ShortName,
            Level = team.Level ?? string.Empty,
            Season = team.Season ?? string.Empty,
            FormationId = team.FormationId,
            PrimaryColor = team.PrimaryColor ?? string.Empty,
            SecondaryColor = team.SecondaryColor ?? string.Empty,
            IsArchived = team.IsArchived,
            CreatedAt = team.CreatedAt,
            UpdatedAt = team.UpdatedAt,
            CoachIds = team.TeamCoaches.Select(tc => tc.CoachId).ToList(),
            Statistics = statistics
        };
    }

    private async Task<TeamStatisticsDto> GetTeamStatistics(Guid teamId)
    {
        var playerCount = await _db.PlayerTeams.CountAsync(pt => pt.TeamId == teamId);

        var matches = await _db.Matches
            .Where(m => m.TeamId == teamId && m.Status == Persistence.Enums.MatchStatus.Completed)
            .Select(m => new
            {
                m.IsHome,
                m.HomeScore,
                m.AwayScore
            })
            .ToListAsync();

        int matchesPlayed = matches.Count;
        int matchesWon = 0;
        int matchesDrawn = 0;
        int matchesLost = 0;
        int goalsScored = 0;
        int goalsConceded = 0;

        foreach (var match in matches)
        {
            if (match.HomeScore.HasValue && match.AwayScore.HasValue)
            {
                if (match.IsHome)
                {
                    goalsScored += match.HomeScore.Value;
                    goalsConceded += match.AwayScore.Value;

                    if (match.HomeScore > match.AwayScore) matchesWon++;
                    else if (match.HomeScore == match.AwayScore) matchesDrawn++;
                    else matchesLost++;
                }
                else
                {
                    goalsScored += match.AwayScore.Value;
                    goalsConceded += match.HomeScore.Value;

                    if (match.AwayScore > match.HomeScore) matchesWon++;
                    else if (match.AwayScore == match.HomeScore) matchesDrawn++;
                    else matchesLost++;
                }
            }
        }

        return new TeamStatisticsDto
        {
            PlayerCount = playerCount,
            MatchesPlayed = matchesPlayed,
            MatchesWon = matchesWon,
            MatchesDrawn = matchesDrawn,
            MatchesLost = matchesLost,
            GoalsScored = goalsScored,
            GoalsConceded = goalsConceded,
            GoalDifference = goalsScored - goalsConceded
        };
    }
}

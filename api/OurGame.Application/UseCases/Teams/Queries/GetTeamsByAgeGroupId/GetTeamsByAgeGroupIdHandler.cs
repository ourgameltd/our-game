using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Teams.Queries.GetTeamsByAgeGroupId.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Queries.GetTeamsByAgeGroupId;

/// <summary>
/// Query to get teams by age group ID
/// </summary>
public record GetTeamsByAgeGroupIdQuery(Guid AgeGroupId) : IQuery<List<TeamWithStatsDto>>;

/// <summary>
/// Handler for GetTeamsByAgeGroupIdQuery
/// </summary>
public class GetTeamsByAgeGroupIdHandler : IRequestHandler<GetTeamsByAgeGroupIdQuery, List<TeamWithStatsDto>>
{
    private readonly OurGameContext _db;

    public GetTeamsByAgeGroupIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<TeamWithStatsDto>> Handle(GetTeamsByAgeGroupIdQuery query, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT 
                t.Id,
                t.ClubId,
                t.AgeGroupId,
                t.Name,
                t.ShortName,
                t.Level,
                t.Season,
                t.PrimaryColor,
                t.SecondaryColor,
                t.IsArchived,
                COALESCE(COUNT(DISTINCT pt.PlayerId), 0) AS PlayerCount,
                COALESCE(COUNT(DISTINCT tc.CoachId), 0) AS CoachCount,
                COUNT(CASE WHEN m.Status = 2 THEN 1 END) AS MatchesPlayed,
                COUNT(CASE WHEN m.Status = 2 AND m.IsHome = 1 AND m.HomeScore > m.AwayScore THEN 1 
                           WHEN m.Status = 2 AND m.IsHome = 0 AND m.AwayScore > m.HomeScore THEN 1 END) AS Wins,
                COUNT(CASE WHEN m.Status = 2 AND m.HomeScore = m.AwayScore THEN 1 END) AS Draws,
                COUNT(CASE WHEN m.Status = 2 AND m.IsHome = 1 AND m.HomeScore < m.AwayScore THEN 1 
                           WHEN m.Status = 2 AND m.IsHome = 0 AND m.AwayScore < m.HomeScore THEN 1 END) AS Losses,
                COALESCE(SUM(CASE WHEN m.IsHome = 1 THEN m.HomeScore ELSE m.AwayScore END), 0) AS GoalsFor,
                COALESCE(SUM(CASE WHEN m.IsHome = 1 THEN m.AwayScore ELSE m.HomeScore END), 0) AS GoalsAgainst
            FROM Teams t
            LEFT JOIN PlayerTeams pt ON pt.TeamId = t.Id
            LEFT JOIN TeamCoaches tc ON tc.TeamId = t.Id
            LEFT JOIN Matches m ON m.TeamId = t.Id
            WHERE t.AgeGroupId = {0} AND t.IsArchived = 0
            GROUP BY t.Id, t.ClubId, t.AgeGroupId, t.Name, t.ShortName, t.Level, t.Season, t.PrimaryColor, t.SecondaryColor, t.IsArchived
            ORDER BY t.Name";

        var teamData = await _db.Database
            .SqlQueryRaw<TeamWithStatsRawDto>(sql, query.AgeGroupId)
            .ToListAsync(cancellationToken);

        return teamData.Select(team =>
        {
            var matchesPlayed = team.MatchesPlayed;
            var wins = team.Wins;
            var draws = team.Draws;
            var losses = team.Losses;
            var goalsFor = team.GoalsFor;
            var goalsAgainst = team.GoalsAgainst;

            return new TeamWithStatsDto
            {
                Id = team.Id,
                ClubId = team.ClubId,
                AgeGroupId = team.AgeGroupId,
                Name = team.Name ?? string.Empty,
                ShortName = team.ShortName ?? string.Empty,
                Level = team.Level ?? string.Empty,
                Season = team.Season ?? string.Empty,
                Colors = new TeamColorsDto
                {
                    Primary = team.PrimaryColor,
                    Secondary = team.SecondaryColor
                },
                IsArchived = team.IsArchived,
                Stats = new TeamStatsDto
                {
                    PlayerCount = team.PlayerCount,
                    CoachCount = team.CoachCount,
                    MatchesPlayed = matchesPlayed,
                    Wins = wins,
                    Draws = draws,
                    Losses = losses,
                    WinRate = matchesPlayed > 0 ? Math.Round((decimal)wins / matchesPlayed * 100, 1) : 0,
                    GoalDifference = goalsFor - goalsAgainst
                }
            };
        }).ToList();
    }
}

/// <summary>
/// DTO for raw SQL query result
/// </summary>
public class TeamWithStatsRawDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public Guid AgeGroupId { get; set; }
    public string? Name { get; set; }
    public string? ShortName { get; set; }
    public string? Level { get; set; }
    public string? Season { get; set; }
    public string? PrimaryColor { get; set; }
    public string? SecondaryColor { get; set; }
    public bool IsArchived { get; set; }
    public int PlayerCount { get; set; }
    public int CoachCount { get; set; }
    public int MatchesPlayed { get; set; }
    public int Wins { get; set; }
    public int Draws { get; set; }
    public int Losses { get; set; }
    public int GoalsFor { get; set; }
    public int GoalsAgainst { get; set; }
}

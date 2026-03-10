using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.Extensions;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupsByClubId.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupsByClubId;

/// <summary>
/// Query to get all age groups for a club with statistics
/// </summary>
public record GetAgeGroupsByClubIdQuery(Guid ClubId, bool IncludeArchived = false) : IQuery<List<AgeGroupListDto>>;

/// <summary>
/// Handler for GetAgeGroupsByClubIdQuery
/// </summary>
public class GetAgeGroupsByClubIdHandler : IRequestHandler<GetAgeGroupsByClubIdQuery, List<AgeGroupListDto>>
{
    private readonly OurGameContext _db;

    public GetAgeGroupsByClubIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<AgeGroupListDto>> Handle(GetAgeGroupsByClubIdQuery query, CancellationToken cancellationToken)
    {
        var archivedFilter = query.IncludeArchived ? "" : "AND ag.IsArchived = 0";

        // Extended SQL to include statistics
        var sql = $@"
            SELECT 
                ag.Id,
                ag.ClubId,
                ag.Name,
                ag.Code,
                ag.Level,
                ag.CurrentSeason,
                ag.Seasons,
                ag.DefaultSeason,
                ag.DefaultSquadSize,
                ag.Description,
                ag.IsArchived,
                COALESCE(teamStats.TeamCount, 0) AS TeamCount,
                COALESCE(playerStats.PlayerCount, 0) AS PlayerCount,
                COALESCE(matchStats.MatchesPlayed, 0) AS MatchesPlayed,
                COALESCE(matchStats.Wins, 0) AS Wins,
                COALESCE(matchStats.Draws, 0) AS Draws,
                COALESCE(matchStats.Losses, 0) AS Losses,
                COALESCE(matchStats.GoalDifference, 0) AS GoalDifference
            FROM AgeGroups ag
            LEFT JOIN (
                SELECT t.AgeGroupId, COUNT(DISTINCT t.Id) AS TeamCount
                FROM Teams t
                WHERE t.IsArchived = 0
                GROUP BY t.AgeGroupId
            ) teamStats ON teamStats.AgeGroupId = ag.Id
            LEFT JOIN (
                SELECT pag.AgeGroupId, COUNT(DISTINCT p.Id) AS PlayerCount
                FROM PlayerAgeGroups pag
                INNER JOIN Players p ON p.Id = pag.PlayerId AND p.IsArchived = 0
                GROUP BY pag.AgeGroupId
            ) playerStats ON playerStats.AgeGroupId = ag.Id
            LEFT JOIN (
                SELECT 
                    t.AgeGroupId,
                    COUNT(CASE WHEN m.Status = 2 THEN 1 END) AS MatchesPlayed,
                    COUNT(CASE WHEN m.Status = 2 AND m.IsHome = 1 AND m.HomeScore > m.AwayScore THEN 1 
                               WHEN m.Status = 2 AND m.IsHome = 0 AND m.AwayScore > m.HomeScore THEN 1 END) AS Wins,
                    COUNT(CASE WHEN m.Status = 2 AND m.HomeScore = m.AwayScore THEN 1 END) AS Draws,
                    COUNT(CASE WHEN m.Status = 2 AND m.IsHome = 1 AND m.HomeScore < m.AwayScore THEN 1 
                               WHEN m.Status = 2 AND m.IsHome = 0 AND m.AwayScore < m.HomeScore THEN 1 END) AS Losses,
                    COALESCE(SUM(CASE WHEN m.Status = 2 THEN 
                        CASE WHEN m.IsHome = 1 THEN m.HomeScore - m.AwayScore ELSE m.AwayScore - m.HomeScore END 
                    END), 0) AS GoalDifference
                FROM Teams t
                LEFT JOIN Matches m ON m.TeamId = t.Id
                WHERE t.IsArchived = 0
                GROUP BY t.AgeGroupId
            ) matchStats ON matchStats.AgeGroupId = ag.Id
            WHERE ag.ClubId = {{0}} {archivedFilter}
            ORDER BY ag.Name";

        var ageGroups = await _db.Database
            .SqlQueryRaw<AgeGroupRawDto>(sql, query.ClubId)
            .ToListAsync(cancellationToken);

        return ageGroups.Select(ag =>
        {
            var levelName = Enum.GetName(typeof(Level), ag.Level) ?? Level.Youth.ToString();
            var matchesPlayed = ag.MatchesPlayed;
            var winRate = matchesPlayed > 0 
                ? Math.Round((decimal)ag.Wins / matchesPlayed * 100, 1) 
                : 0;

            return new AgeGroupListDto
            {
                Id = ag.Id,
                ClubId = ag.ClubId,
                Name = ag.Name ?? string.Empty,
                Code = ag.Code ?? string.Empty,
                Level = levelName.ToLowerInvariant(),
                Season = ag.CurrentSeason ?? string.Empty,
                Seasons = AgeGroupSeasonX.ParseSeasons(ag.Seasons),
                DefaultSeason = ag.DefaultSeason ?? string.Empty,
                DefaultSquadSize = ag.DefaultSquadSize,
                Description = ag.Description,
                IsArchived = ag.IsArchived,
                TeamCount = ag.TeamCount,
                PlayerCount = ag.PlayerCount,
                MatchesPlayed = ag.MatchesPlayed,
                Wins = ag.Wins,
                Draws = ag.Draws,
                Losses = ag.Losses,
                WinRate = winRate,
                GoalDifference = ag.GoalDifference
            };
        }).ToList();
    }
}

/// <summary>
/// DTO for raw SQL query result
/// </summary>
public class AgeGroupRawDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public string? Name { get; set; }
    public string? Code { get; set; }
    public int Level { get; set; }
    public string? CurrentSeason { get; set; }
    public string? Seasons { get; set; }
    public string? DefaultSeason { get; set; }
    public int DefaultSquadSize { get; set; }
    public string? Description { get; set; }
    public bool IsArchived { get; set; }
    public int TeamCount { get; set; }
    public int PlayerCount { get; set; }
    public int MatchesPlayed { get; set; }
    public int Wins { get; set; }
    public int Draws { get; set; }
    public int Losses { get; set; }
    public int GoalDifference { get; set; }
}

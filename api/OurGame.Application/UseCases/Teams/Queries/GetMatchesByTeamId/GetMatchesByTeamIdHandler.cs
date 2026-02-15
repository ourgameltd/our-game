using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Teams.Queries.GetMatchesByTeamId.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Queries.GetMatchesByTeamId;

/// <summary>
/// Query to get matches for a specific team with optional filters
/// </summary>
public record GetMatchesByTeamIdQuery(
    Guid TeamId,
    string? Status = null,
    DateTime? DateFrom = null,
    DateTime? DateTo = null) : IQuery<TeamMatchesDto>;

/// <summary>
/// Handler for GetMatchesByTeamIdQuery - retrieves team matches with team and club info
/// </summary>
public class GetMatchesByTeamIdHandler : IRequestHandler<GetMatchesByTeamIdQuery, TeamMatchesDto>
{
    private readonly OurGameContext _db;

    public GetMatchesByTeamIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<TeamMatchesDto> Handle(GetMatchesByTeamIdQuery query, CancellationToken cancellationToken)
    {
        // 1. Validate team exists and get team/club info
        var teamInfoSql = @"
            SELECT 
                t.Id,
                t.Name,
                t.IsArchived,
                c.Id AS ClubId,
                c.Name AS ClubName
            FROM Teams t
            INNER JOIN Clubs c ON t.ClubId = c.Id
            WHERE t.Id = @teamId";

        var teamInfo = await _db.Database
            .SqlQueryRaw<TeamInfoRaw>(teamInfoSql, query.TeamId)
            .FirstOrDefaultAsync(cancellationToken);

        if (teamInfo == null)
        {
            throw new KeyNotFoundException($"Team with ID {query.TeamId} not found");
        }

        // 2. Build match query with filters
        var matchSql = @"
            SELECT 
                m.Id,
                m.MatchDate AS Date,
                COALESCE(m.KickOffTime, m.MatchDate) AS KickOffTime,
                m.Location,
                m.Status,
                m.Competition,
                m.Opposition AS OpponentName,
                m.IsHome,
                m.HomeScore,
                m.AwayScore,
                mr.Id AS ReportId
            FROM Matches m
            LEFT JOIN MatchReports mr ON m.Id = mr.MatchId
            WHERE m.TeamId = @teamId";

        var parameters = new List<object> { query.TeamId };
        var paramIndex = 0;

        // Apply status filter
        if (!string.IsNullOrEmpty(query.Status))
        {
            var statusLower = query.Status.ToLower();
            if (statusLower == "upcoming")
            {
                matchSql += " AND m.MatchDate >= GETUTCDATE()";
            }
            else if (statusLower == "completed")
            {
                matchSql += " AND m.MatchDate < GETUTCDATE() AND m.HomeScore IS NOT NULL AND m.AwayScore IS NOT NULL";
            }
            else
            {
                var statusValue = statusLower switch
                {
                    "scheduled" => 0,
                    "in-progress" or "inprogress" => 1,
                    "cancelled" => 4,
                    _ => -1
                };

                if (statusValue >= 0)
                {
                    matchSql += $" AND m.Status = @status{paramIndex}";
                    parameters.Add(statusValue);
                    paramIndex++;
                }
            }
        }

        // Apply date range filters
        if (query.DateFrom.HasValue)
        {
            matchSql += $" AND m.MatchDate >= @dateFrom{paramIndex}";
            parameters.Add(query.DateFrom.Value);
            paramIndex++;
        }

        if (query.DateTo.HasValue)
        {
            matchSql += $" AND m.MatchDate <= @dateTo{paramIndex}";
            parameters.Add(query.DateTo.Value);
            paramIndex++;
        }

        matchSql += " ORDER BY m.MatchDate DESC";

        var matches = await _db.Database
            .SqlQueryRaw<MatchRaw>(matchSql, parameters.ToArray())
            .ToListAsync(cancellationToken);

        // 3. Map to response DTOs
        var matchDtos = matches.Select(m => new TeamMatchDto
        {
            Id = m.Id,
            Date = m.Date,
            KickOffTime = m.KickOffTime,
            Location = m.Location ?? string.Empty,
            Status = MapStatusToString(m.Status),
            Competition = m.Competition ?? string.Empty,
            OpponentName = m.OpponentName ?? string.Empty,
            IsHome = m.IsHome,
            HomeScore = m.HomeScore,
            AwayScore = m.AwayScore,
            HasReport = m.ReportId.HasValue,
            ReportId = m.ReportId
        }).ToList();

        return new TeamMatchesDto
        {
            Team = new TeamInfoDto
            {
                Id = teamInfo.Id,
                Name = teamInfo.Name,
                IsArchived = teamInfo.IsArchived
            },
            Club = new ClubInfoDto
            {
                Id = teamInfo.ClubId,
                Name = teamInfo.ClubName
            },
            Matches = matchDtos,
            TotalCount = matchDtos.Count
        };
    }

    private static string MapStatusToString(int status)
    {
        return status switch
        {
            0 => "scheduled",
            1 => "in-progress",
            2 => "completed",
            3 => "scheduled", // Postponed mapped to scheduled for UI compatibility
            4 => "cancelled",
            _ => "scheduled"
        };
    }
}

/// <summary>
/// Raw DTO for team and club info query result
/// </summary>
public class TeamInfoRaw
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsArchived { get; set; }
    public Guid ClubId { get; set; }
    public string ClubName { get; set; } = string.Empty;
}

/// <summary>
/// Raw DTO for match query result
/// </summary>
public class MatchRaw
{
    public Guid Id { get; set; }
    public DateTime Date { get; set; }
    public DateTime KickOffTime { get; set; }
    public string? Location { get; set; }
    public int Status { get; set; }
    public string? Competition { get; set; }
    public string? OpponentName { get; set; }
    public bool IsHome { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public Guid? ReportId { get; set; }
}

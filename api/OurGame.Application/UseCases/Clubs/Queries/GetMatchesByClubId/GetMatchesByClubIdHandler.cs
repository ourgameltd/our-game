using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Clubs.Queries.GetMatchesByClubId.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Queries.GetMatchesByClubId;

/// <summary>
/// Query to get matches for a specific club
/// </summary>
public record GetMatchesByClubIdQuery(
    Guid ClubId,
    Guid? AgeGroupId = null,
    Guid? TeamId = null,
    string? Status = null) : IQuery<ClubMatchesDto>;

/// <summary>
/// Handler for GetMatchesByClubIdQuery
/// </summary>
public class GetMatchesByClubIdHandler : IRequestHandler<GetMatchesByClubIdQuery, ClubMatchesDto>
{
    private readonly OurGameContext _db;

    public GetMatchesByClubIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<ClubMatchesDto> Handle(GetMatchesByClubIdQuery query, CancellationToken cancellationToken)
    {
        // Build the SQL query dynamically based on filters
        var sql = @"
            SELECT 
                m.Id,
                m.TeamId,
                t.AgeGroupId,
                t.Name AS TeamName,
                ag.Name AS AgeGroupName,
                m.SquadSize,
                m.Opposition,
                m.MatchDate AS Date,
                m.MeetTime,
                m.KickOffTime,
                m.Location,
                m.IsHome,
                m.Competition,
                m.HomeScore,
                m.AwayScore,
                m.Status,
                m.IsLocked,
                m.WeatherCondition,
                m.WeatherTemperature
            FROM Matches m
            INNER JOIN Teams t ON m.TeamId = t.Id
            INNER JOIN AgeGroups ag ON t.AgeGroupId = ag.Id
            WHERE t.ClubId = {0}
                AND t.IsArchived = 0";

        // Add optional filters
        var parameters = new List<object> { query.ClubId };

        if (query.AgeGroupId.HasValue)
        {
            sql += $" AND t.AgeGroupId = {{{parameters.Count}}}";
            parameters.Add(query.AgeGroupId.Value);
        }

        if (query.TeamId.HasValue)
        {
            sql += $" AND m.TeamId = {{{parameters.Count}}}";
            parameters.Add(query.TeamId.Value);
        }

        if (!string.IsNullOrEmpty(query.Status))
        {
            var statusValue = query.Status.ToLower() switch
            {
                "upcoming" => -1, // Special case for upcoming
                "past" => -2,     // Special case for past
                "scheduled" => 0,
                "inprogress" => 1,
                "completed" => 2,
                "cancelled" => 3,
                _ => -99 // All
            };

            if (statusValue == -1) // Upcoming
            {
                sql += " AND m.MatchDate >= GETUTCDATE()";
            }
            else if (statusValue == -2) // Past
            {
                sql += " AND m.MatchDate < GETUTCDATE()";
            }
            else if (statusValue >= 0)
            {
                sql += $" AND m.Status = {{{parameters.Count}}}";
                parameters.Add(statusValue);
            }
        }

        sql += " ORDER BY m.MatchDate DESC";

        var matches = await _db.Database
            .SqlQueryRaw<MatchRawDto>(sql, parameters.ToArray())
            .ToListAsync(cancellationToken);

        var result = matches.Select(m => new ClubMatchDto
        {
            Id = m.Id,
            TeamId = m.TeamId,
            AgeGroupId = m.AgeGroupId,
            TeamName = m.TeamName ?? string.Empty,
            AgeGroupName = m.AgeGroupName ?? string.Empty,
            SquadSize = m.SquadSize,
            Opposition = m.Opposition ?? string.Empty,
            Date = m.Date,
            MeetTime = m.MeetTime,
            KickOffTime = m.KickOffTime ?? m.Date,
            Location = m.Location ?? string.Empty,
            IsHome = m.IsHome,
            Competition = m.Competition ?? string.Empty,
            HomeScore = m.HomeScore,
            AwayScore = m.AwayScore,
            Status = MapStatusToString(m.Status),
            IsLocked = m.IsLocked,
            WeatherCondition = m.WeatherCondition,
            WeatherTemperature = m.WeatherTemperature
        }).ToList();

        return new ClubMatchesDto
        {
            Matches = result,
            TotalCount = result.Count
        };
    }

    private static string MapStatusToString(int status)
    {
        return status switch
        {
            0 => "scheduled",
            1 => "in-progress",
            2 => "completed",
            3 => "cancelled",
            _ => "scheduled"
        };
    }
}

/// <summary>
/// Raw DTO for SQL query result
/// </summary>
public class MatchRawDto
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public Guid AgeGroupId { get; set; }
    public string? TeamName { get; set; }
    public string? AgeGroupName { get; set; }
    public int? SquadSize { get; set; }
    public string? Opposition { get; set; }
    public DateTime Date { get; set; }
    public DateTime? MeetTime { get; set; }
    public DateTime? KickOffTime { get; set; }
    public string? Location { get; set; }
    public bool IsHome { get; set; }
    public string? Competition { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public int Status { get; set; }
    public bool IsLocked { get; set; }
    public string? WeatherCondition { get; set; }
    public int? WeatherTemperature { get; set; }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Teams.Queries.GetTrainingSessionsByTeamId.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Queries.GetTrainingSessionsByTeamId;

/// <summary>
/// Query to get training sessions for a specific team with optional filters
/// </summary>
public record GetTrainingSessionsByTeamIdQuery(
    Guid TeamId,
    string? Status = null,
    DateTime? DateFrom = null,
    DateTime? DateTo = null) : IQuery<TeamTrainingSessionsDto>;

/// <summary>
/// Handler for GetTrainingSessionsByTeamIdQuery - retrieves team training sessions with team and club info
/// </summary>
public class GetTrainingSessionsByTeamIdHandler : IRequestHandler<GetTrainingSessionsByTeamIdQuery, TeamTrainingSessionsDto>
{
    private readonly OurGameContext _db;

    public GetTrainingSessionsByTeamIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<TeamTrainingSessionsDto> Handle(GetTrainingSessionsByTeamIdQuery query, CancellationToken cancellationToken)
    {
        // 1. Validate team exists and get team/club/age group info
        var teamInfoSql = @"
            SELECT 
                t.Id,
                t.Name,
                t.IsArchived,
                t.AgeGroupId,
                ag.Name AS AgeGroupName,
                c.Id AS ClubId,
                c.Name AS ClubName
            FROM Teams t
            INNER JOIN AgeGroups ag ON t.AgeGroupId = ag.Id
            INNER JOIN Clubs c ON ag.ClubId = c.Id
            WHERE t.Id = @teamId";

        var teamInfo = await _db.Database
            .SqlQueryRaw<TeamInfoRaw>(teamInfoSql, query.TeamId)
            .FirstOrDefaultAsync(cancellationToken);

        if (teamInfo == null)
        {
            throw new KeyNotFoundException($"Team with ID {query.TeamId} not found");
        }

        // 2. Build training session query with filters
        var sessionSql = @"
            SELECT 
                ts.Id,
                ts.SessionDate,
                ts.MeetTime,
                ts.DurationMinutes,
                ts.Location,
                ts.FocusAreas,
                ts.Status,
                ts.IsLocked,
                (SELECT STRING_AGG(CAST(sd.DrillId AS VARCHAR(36)), ',') 
                 FROM SessionDrills sd 
                 WHERE sd.SessionId = ts.Id) AS DrillIdsString,
                (SELECT STRING_AGG(
                    CAST(sa.PlayerId AS VARCHAR(36)) + '|' + 
                    CAST(sa.Present AS VARCHAR(5)) + '|' + 
                    ISNULL(sa.Notes, ''), 
                    ';') 
                 FROM SessionAttendances sa 
                 WHERE sa.SessionId = ts.Id) AS AttendanceString,
                (SELECT COUNT(DISTINCT sd.DrillId)
                 FROM SessionDrills sd 
                 WHERE sd.SessionId = ts.Id) AS DrillCount,
                (SELECT COUNT(DISTINCT sa.PlayerId)
                 FROM SessionAttendances sa 
                 WHERE sa.SessionId = ts.Id AND sa.Present = 1) AS AttendanceCount
            FROM TrainingSessions ts
            WHERE ts.TeamId = @teamId";

        var parameters = new List<object> { query.TeamId };
        var paramIndex = 0;

        // Apply status filter
        if (!string.IsNullOrEmpty(query.Status))
        {
            var statusLower = query.Status.ToLower();
            if (statusLower == "upcoming")
            {
                sessionSql += " AND ts.SessionDate >= GETUTCDATE()";
            }
            else if (statusLower == "past")
            {
                sessionSql += " AND ts.SessionDate < GETUTCDATE()";
            }
            else
            {
                var statusValue = statusLower switch
                {
                    "scheduled" => 0,
                    "in-progress" or "inprogress" => 1,
                    "completed" => 2,
                    "cancelled" => 3,
                    _ => -1
                };

                if (statusValue >= 0)
                {
                    sessionSql += $" AND ts.Status = @status{paramIndex}";
                    parameters.Add(statusValue);
                    paramIndex++;
                }
            }
        }

        // Apply date range filters
        if (query.DateFrom.HasValue)
        {
            sessionSql += $" AND ts.SessionDate >= @dateFrom{paramIndex}";
            parameters.Add(query.DateFrom.Value);
            paramIndex++;
        }

        if (query.DateTo.HasValue)
        {
            sessionSql += $" AND ts.SessionDate <= @dateTo{paramIndex}";
            parameters.Add(query.DateTo.Value);
            paramIndex++;
        }

        sessionSql += " ORDER BY ts.SessionDate DESC";

        var sessions = await _db.Database
            .SqlQueryRaw<TrainingSessionRaw>(sessionSql, parameters.ToArray())
            .ToListAsync(cancellationToken);

        // 3. Map to response DTOs
        var sessionDtos = sessions.Select(s => new TeamTrainingSessionDto
        {
            Id = s.Id,
            Date = s.SessionDate,
            MeetTime = s.MeetTime,
            DurationMinutes = s.DurationMinutes,
            Location = s.Location ?? string.Empty,
            FocusAreas = ParseFocusAreas(s.FocusAreas),
            DrillIds = ParseDrillIds(s.DrillIdsString),
            Attendance = ParseAttendance(s.AttendanceString),
            Status = MapStatusToString(s.Status),
            IsLocked = s.IsLocked,
            DrillCount = s.DrillCount,
            AttendanceCount = s.AttendanceCount
        }).ToList();

        return new TeamTrainingSessionsDto
        {
            Team = new TeamInfoDto
            {
                Id = teamInfo.Id,
                Name = teamInfo.Name,
                IsArchived = teamInfo.IsArchived,
                AgeGroupId = teamInfo.AgeGroupId,
                AgeGroupName = teamInfo.AgeGroupName
            },
            Club = new ClubInfoDto
            {
                Id = teamInfo.ClubId,
                Name = teamInfo.ClubName
            },
            Sessions = sessionDtos,
            TotalCount = sessionDtos.Count
        };
    }

    private static List<string> ParseFocusAreas(string? focusAreas)
    {
        if (string.IsNullOrWhiteSpace(focusAreas))
            return new List<string>();

        // FocusAreas is stored as a JSON array or comma-separated string
        if (focusAreas.StartsWith("["))
        {
            try
            {
                return System.Text.Json.JsonSerializer.Deserialize<List<string>>(focusAreas) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        return focusAreas.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => s.Trim())
            .ToList();
    }

    private static List<Guid> ParseDrillIds(string? drillIdsString)
    {
        if (string.IsNullOrWhiteSpace(drillIdsString))
            return new List<Guid>();

        return drillIdsString.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => Guid.TryParse(s.Trim(), out var guid) ? guid : Guid.Empty)
            .Where(g => g != Guid.Empty)
            .ToList();
    }

    private static List<AttendanceDto> ParseAttendance(string? attendanceString)
    {
        if (string.IsNullOrWhiteSpace(attendanceString))
            return new List<AttendanceDto>();

        var result = new List<AttendanceDto>();
        var entries = attendanceString.Split(';', StringSplitOptions.RemoveEmptyEntries);

        foreach (var entry in entries)
        {
            var parts = entry.Split('|');
            if (parts.Length >= 2 && Guid.TryParse(parts[0], out var playerId))
            {
                var isPresent = bool.TryParse(parts[1], out var present) && present;
                var notes = parts.Length > 2 ? parts[2] : null;

                result.Add(new AttendanceDto
                {
                    PlayerId = playerId,
                    Status = isPresent ? "confirmed" : "declined",
                    Notes = string.IsNullOrWhiteSpace(notes) ? null : notes
                });
            }
        }

        return result;
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
/// Raw DTO for team, age group, and club info query result
/// </summary>
public class TeamInfoRaw
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsArchived { get; set; }
    public Guid AgeGroupId { get; set; }
    public string AgeGroupName { get; set; } = string.Empty;
    public Guid ClubId { get; set; }
    public string ClubName { get; set; } = string.Empty;
}

/// <summary>
/// Raw DTO for training session query result
/// </summary>
public class TrainingSessionRaw
{
    public Guid Id { get; set; }
    public DateTime SessionDate { get; set; }
    public DateTime? MeetTime { get; set; }
    public int? DurationMinutes { get; set; }
    public string? Location { get; set; }
    public string? FocusAreas { get; set; }
    public int Status { get; set; }
    public bool IsLocked { get; set; }
    public string? DrillIdsString { get; set; }
    public string? AttendanceString { get; set; }
    public int DrillCount { get; set; }
    public int AttendanceCount { get; set; }
}

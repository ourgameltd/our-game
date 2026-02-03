using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Clubs.Queries.GetTrainingSessionsByClubId.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Queries.GetTrainingSessionsByClubId;

/// <summary>
/// Query to get training sessions for a specific club
/// </summary>
public record GetTrainingSessionsByClubIdQuery(
    Guid ClubId,
    Guid? AgeGroupId = null,
    Guid? TeamId = null,
    string? Status = null) : IQuery<ClubTrainingSessionsDto>;

/// <summary>
/// Handler for GetTrainingSessionsByClubIdQuery
/// </summary>
public class GetTrainingSessionsByClubIdHandler : IRequestHandler<GetTrainingSessionsByClubIdQuery, ClubTrainingSessionsDto>
{
    private readonly OurGameContext _db;

    public GetTrainingSessionsByClubIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<ClubTrainingSessionsDto> Handle(GetTrainingSessionsByClubIdQuery query, CancellationToken cancellationToken)
    {
        // Build the SQL query dynamically based on filters
        var sql = @"
            SELECT 
                ts.Id,
                ts.TeamId,
                t.AgeGroupId,
                t.Name AS TeamName,
                ag.Name AS AgeGroupName,
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
                 WHERE sa.SessionId = ts.Id) AS AttendanceString
            FROM TrainingSessions ts
            INNER JOIN Teams t ON ts.TeamId = t.Id
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
            sql += $" AND ts.TeamId = {{{parameters.Count}}}";
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
                sql += " AND ts.SessionDate >= GETUTCDATE()";
            }
            else if (statusValue == -2) // Past
            {
                sql += " AND ts.SessionDate < GETUTCDATE()";
            }
            else if (statusValue >= 0)
            {
                sql += $" AND ts.Status = {{{parameters.Count}}}";
                parameters.Add(statusValue);
            }
        }

        sql += " ORDER BY ts.SessionDate ASC";

        var sessions = await _db.Database
            .SqlQueryRaw<TrainingSessionRawDto>(sql, parameters.ToArray())
            .ToListAsync(cancellationToken);

        var result = sessions.Select(s => new ClubTrainingSessionDto
        {
            Id = s.Id,
            TeamId = s.TeamId,
            AgeGroupId = s.AgeGroupId,
            TeamName = s.TeamName ?? string.Empty,
            AgeGroupName = s.AgeGroupName ?? string.Empty,
            Date = s.SessionDate,
            MeetTime = s.MeetTime,
            DurationMinutes = s.DurationMinutes,
            Location = s.Location ?? string.Empty,
            FocusAreas = ParseFocusAreas(s.FocusAreas),
            DrillIds = ParseDrillIds(s.DrillIdsString),
            Attendance = ParseAttendance(s.AttendanceString),
            Status = MapStatusToString(s.Status),
            IsLocked = s.IsLocked
        }).ToList();

        return new ClubTrainingSessionsDto
        {
            Sessions = result,
            TotalCount = result.Count
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
/// Raw DTO for SQL query result
/// </summary>
public class TrainingSessionRawDto
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public Guid AgeGroupId { get; set; }
    public string? TeamName { get; set; }
    public string? AgeGroupName { get; set; }
    public DateTime SessionDate { get; set; }
    public DateTime? MeetTime { get; set; }
    public int? DurationMinutes { get; set; }
    public string? Location { get; set; }
    public string? FocusAreas { get; set; }
    public int Status { get; set; }
    public bool IsLocked { get; set; }
    public string? DrillIdsString { get; set; }
    public string? AttendanceString { get; set; }
}

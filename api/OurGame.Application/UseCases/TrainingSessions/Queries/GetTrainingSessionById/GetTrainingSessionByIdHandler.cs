using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.UseCases.TrainingSessions.Queries.GetTrainingSessionById.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.TrainingSessions.Queries.GetTrainingSessionById;

/// <summary>
/// Handler for GetTrainingSessionByIdQuery - retrieves full training session detail using raw SQL
/// </summary>
public class GetTrainingSessionByIdHandler : IRequestHandler<GetTrainingSessionByIdQuery, TrainingSessionDetailDto?>
{
    private readonly OurGameContext _db;

    public GetTrainingSessionByIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<TrainingSessionDetailDto?> Handle(GetTrainingSessionByIdQuery query, CancellationToken cancellationToken)
    {
        // 1. Fetch the training session with team/age-group context
        var sessionSql = @"
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
                ts.TemplateId,
                ts.Notes,
                ts.Status,
                ts.IsLocked,
                ts.CreatedAt,
                ts.UpdatedAt
            FROM TrainingSessions ts
            INNER JOIN Teams t ON ts.TeamId = t.Id
            INNER JOIN AgeGroups ag ON t.AgeGroupId = ag.Id
            WHERE ts.Id = {0}";

        var session = await _db.Database
            .SqlQueryRaw<TrainingSessionRaw>(sessionSql, query.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (session == null)
        {
            return null;
        }

        // 2. Fetch session drills with drill details
        var drillsSql = @"
            SELECT
                sd.Id,
                sd.DrillId,
                d.Name AS DrillName,
                d.Description,
                d.DurationMinutes,
                d.Category,
                sd.Source,
                sd.TemplateId,
                sd.DrillOrder
            FROM SessionDrills sd
            INNER JOIN Drills d ON sd.DrillId = d.Id
            WHERE sd.SessionId = {0}
            ORDER BY sd.DrillOrder";

        var drills = await _db.Database
            .SqlQueryRaw<SessionDrillRaw>(drillsSql, query.Id)
            .ToListAsync(cancellationToken);

        // 3. Fetch session attendance with player names
        var attendanceSql = @"
            SELECT
                sa.Id,
                sa.PlayerId,
                p.FirstName,
                p.LastName,
                sa.Present,
                sa.Notes AS AttendanceNotes
            FROM SessionAttendances sa
            INNER JOIN Players p ON sa.PlayerId = p.Id
            WHERE sa.SessionId = {0}
            ORDER BY p.LastName, p.FirstName";

        var attendance = await _db.Database
            .SqlQueryRaw<SessionAttendanceRaw>(attendanceSql, query.Id)
            .ToListAsync(cancellationToken);

        // 4. Fetch session coaches with coach names and roles
        var coachesSql = @"
            SELECT
                sc.Id,
                sc.CoachId,
                c.FirstName AS CoachFirstName,
                c.LastName AS CoachLastName,
                c.Role AS CoachRole
            FROM SessionCoaches sc
            INNER JOIN Coaches c ON sc.CoachId = c.Id
            WHERE sc.SessionId = {0}";

        var coaches = await _db.Database
            .SqlQueryRaw<SessionCoachRaw>(coachesSql, query.Id)
            .ToListAsync(cancellationToken);

        // 5. Fetch applied templates with template names
        var templatesSql = @"
            SELECT
                at2.Id,
                at2.TemplateId,
                dt.Name AS TemplateName,
                at2.AppliedAt
            FROM AppliedTemplates at2
            INNER JOIN DrillTemplates dt ON at2.TemplateId = dt.Id
            WHERE at2.SessionId = {0}
            ORDER BY at2.AppliedAt";

        var appliedTemplates = await _db.Database
            .SqlQueryRaw<AppliedTemplateRaw>(templatesSql, query.Id)
            .ToListAsync(cancellationToken);

        // Map everything to the response DTO
        return new TrainingSessionDetailDto
        {
            Id = session.Id,
            TeamId = session.TeamId,
            AgeGroupId = session.AgeGroupId,
            TeamName = session.TeamName ?? string.Empty,
            AgeGroupName = session.AgeGroupName ?? string.Empty,
            SessionDate = session.SessionDate,
            MeetTime = session.MeetTime,
            DurationMinutes = session.DurationMinutes,
            Location = session.Location ?? string.Empty,
            FocusAreas = ParseFocusAreas(session.FocusAreas),
            TemplateId = session.TemplateId,
            Notes = session.Notes,
            Status = MapSessionStatusToString(session.Status),
            IsLocked = session.IsLocked,
            CreatedAt = session.CreatedAt,
            UpdatedAt = session.UpdatedAt,
            Drills = drills.Select(d => new SessionDrillDto
            {
                Id = d.Id,
                DrillId = d.DrillId,
                DrillName = d.DrillName ?? string.Empty,
                Description = d.Description,
                DurationMinutes = d.DurationMinutes,
                Category = MapDrillCategoryToString(d.Category),
                Source = d.Source ?? string.Empty,
                TemplateId = d.TemplateId,
                Order = d.DrillOrder
            }).ToList(),
            Attendance = attendance.Select(a => new SessionAttendanceDto
            {
                Id = a.Id,
                PlayerId = a.PlayerId,
                FirstName = a.FirstName ?? string.Empty,
                LastName = a.LastName ?? string.Empty,
                Status = MapAttendanceStatus(a.Present),
                Notes = a.AttendanceNotes
            }).ToList(),
            Coaches = coaches.Select(c => new SessionCoachDto
            {
                Id = c.Id,
                CoachId = c.CoachId,
                FirstName = c.CoachFirstName ?? string.Empty,
                LastName = c.CoachLastName ?? string.Empty,
                Role = MapCoachRoleToString(c.CoachRole)
            }).ToList(),
            AppliedTemplates = appliedTemplates.Select(t => new AppliedTemplateDto
            {
                Id = t.Id,
                TemplateId = t.TemplateId,
                TemplateName = t.TemplateName ?? string.Empty,
                AppliedAt = t.AppliedAt
            }).ToList()
        };
    }

    private static string MapSessionStatusToString(int status)
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

    private static string MapAttendanceStatus(bool? present)
    {
        return present switch
        {
            true => "confirmed",
            false => "declined",
            null => "pending"
        };
    }

    private static string MapDrillCategoryToString(int category)
    {
        return category switch
        {
            0 => "technical",
            1 => "tactical",
            2 => "physical",
            3 => "mental",
            4 => "mixed",
            _ => "technical"
        };
    }

    private static string MapCoachRoleToString(int role)
    {
        return role switch
        {
            0 => "head-coach",
            1 => "assistant-coach",
            2 => "goalkeeper-coach",
            3 => "fitness-coach",
            4 => "technical-coach",
            _ => "assistant-coach"
        };
    }

    private static string[] ParseFocusAreas(string? focusAreas)
    {
        if (string.IsNullOrWhiteSpace(focusAreas))
        {
            return [];
        }

        try
        {
            return JsonSerializer.Deserialize<string[]>(focusAreas) ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }
}

#region Raw SQL DTOs

public class TrainingSessionRaw
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
    public Guid? TemplateId { get; set; }
    public string? Notes { get; set; }
    public int Status { get; set; }
    public bool IsLocked { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SessionDrillRaw
{
    public Guid Id { get; set; }
    public Guid DrillId { get; set; }
    public string? DrillName { get; set; }
    public string? Description { get; set; }
    public int? DurationMinutes { get; set; }
    public int Category { get; set; }
    public string? Source { get; set; }
    public Guid? TemplateId { get; set; }
    public int DrillOrder { get; set; }
}

public class SessionAttendanceRaw
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public bool? Present { get; set; }
    public string? AttendanceNotes { get; set; }
}

public class SessionCoachRaw
{
    public Guid Id { get; set; }
    public Guid CoachId { get; set; }
    public string? CoachFirstName { get; set; }
    public string? CoachLastName { get; set; }
    public int CoachRole { get; set; }
}

public class AppliedTemplateRaw
{
    public Guid Id { get; set; }
    public Guid TemplateId { get; set; }
    public string? TemplateName { get; set; }
    public DateTime AppliedAt { get; set; }
}

#endregion

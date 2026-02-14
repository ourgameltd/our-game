using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.TrainingSessions.Commands.CreateTrainingSession.DTOs;
using OurGame.Application.UseCases.TrainingSessions.Queries.GetTrainingSessionById;
using OurGame.Application.UseCases.TrainingSessions.Queries.GetTrainingSessionById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.TrainingSessions.Commands.CreateTrainingSession;

/// <summary>
/// Handler for creating a new training session with drills, coaches, attendance, and applied templates
/// </summary>
public class CreateTrainingSessionHandler : IRequestHandler<CreateTrainingSessionCommand, TrainingSessionDetailDto>
{
    private readonly OurGameContext _db;

    public CreateTrainingSessionHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<TrainingSessionDetailDto> Handle(CreateTrainingSessionCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;

        // Validate required fields
        if (dto.TeamId == Guid.Empty)
            throw new ValidationException("TeamId", "TeamId is required.");

        if (dto.SessionDate == default)
            throw new ValidationException("SessionDate", "SessionDate is required.");

        if (string.IsNullOrWhiteSpace(dto.Location))
            throw new ValidationException("Location", "Location is required.");

        // Validate team exists and is not archived
        var team = await _db.Database
            .SqlQueryRaw<TeamValidationRow>(
                "SELECT Id, AgeGroupId, IsArchived FROM Teams WHERE Id = {0}", dto.TeamId)
            .FirstOrDefaultAsync(cancellationToken);

        if (team == null)
            throw new NotFoundException("Team", dto.TeamId.ToString());

        if (team.IsArchived)
            throw new ValidationException("TeamId", "Cannot create a training session for an archived team.");

        var sessionId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var statusInt = ParseStatus(dto.Status);
        var notes = dto.Notes ?? string.Empty;
        var focusAreasJson = JsonSerializer.Serialize(dto.FocusAreas);

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            // Insert training session
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO TrainingSessions (Id, TeamId, SessionDate, MeetTime, DurationMinutes, Location, FocusAreas, Notes, Status, IsLocked, CreatedAt, UpdatedAt)
                VALUES ({sessionId}, {dto.TeamId}, {dto.SessionDate}, {dto.MeetTime}, {dto.DurationMinutes}, {dto.Location}, {focusAreasJson}, {notes}, {statusInt}, {dto.IsLocked}, {now}, {now})
            ", cancellationToken);

            // Insert session drills
            foreach (var drill in dto.SessionDrills)
            {
                var drillRecordId = Guid.NewGuid();
                var source = drill.Source ?? string.Empty;
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO SessionDrills (Id, SessionId, DrillId, Source, TemplateId, DrillOrder)
                    VALUES ({drillRecordId}, {sessionId}, {drill.DrillId}, {source}, {drill.TemplateId}, {drill.Order})
                ", cancellationToken);
            }

            // Insert session coaches
            foreach (var coachId in dto.AssignedCoachIds)
            {
                var sessionCoachId = Guid.NewGuid();
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO SessionCoaches (Id, SessionId, CoachId)
                    VALUES ({sessionCoachId}, {sessionId}, {coachId})
                ", cancellationToken);
            }

            // Insert session attendances
            foreach (var attendance in dto.Attendance)
            {
                var attendanceId = Guid.NewGuid();
                var present = MapAttendanceStatus(attendance.Status);
                var attendanceNotes = attendance.Notes ?? string.Empty;
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO SessionAttendances (Id, SessionId, PlayerId, Present, Notes)
                    VALUES ({attendanceId}, {sessionId}, {attendance.PlayerId}, {present}, {attendanceNotes})
                ", cancellationToken);
            }

            // Insert applied templates
            foreach (var template in dto.AppliedTemplates)
            {
                var appliedTemplateId = Guid.NewGuid();
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO AppliedTemplates (Id, SessionId, TemplateId, AppliedAt)
                    VALUES ({appliedTemplateId}, {sessionId}, {template.TemplateId}, {template.AppliedAt})
                ", cancellationToken);
            }

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        // Query back the created session using GetTrainingSessionByIdHandler
        var result = await new GetTrainingSessionByIdHandler(_db)
            .Handle(new GetTrainingSessionByIdQuery(sessionId), cancellationToken);

        if (result == null)
            throw new Exception("Failed to retrieve created training session.");

        return result;
    }

    /// <summary>
    /// Maps attendance status string to boolean Present value:
    /// "confirmed" → true, "declined" → false, anything else → null
    /// </summary>
    private static bool? MapAttendanceStatus(string? status) =>
        (status?.ToLower()) switch
        {
            "confirmed" => true,
            "declined" => false,
            _ => null // pending, maybe, or any other value
        };

    private static int ParseStatus(string? status) =>
        (status?.ToLower()) switch
        {
            "scheduled" => (int)SessionStatus.Scheduled,
            "in-progress" or "inprogress" => (int)SessionStatus.InProgress,
            "completed" => (int)SessionStatus.Completed,
            "cancelled" => (int)SessionStatus.Cancelled,
            _ => (int)SessionStatus.Scheduled
        };
}

// --- DB query model for team validation ---

public class TeamValidationRow
{
    public Guid Id { get; set; }
    public Guid AgeGroupId { get; set; }
    public bool IsArchived { get; set; }
}

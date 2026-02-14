using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.TrainingSessions.Queries.GetTrainingSessionById;
using OurGame.Application.UseCases.TrainingSessions.Queries.GetTrainingSessionById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.TrainingSessions.Commands.UpdateTrainingSession;

/// <summary>
/// Handler for updating an existing training session using delete-and-reinsert for child records.
/// Follows the same pattern as UpdateMatchHandler.
/// </summary>
public class UpdateTrainingSessionHandler : IRequestHandler<UpdateTrainingSessionCommand, TrainingSessionDetailDto>
{
    private readonly OurGameContext _db;

    public UpdateTrainingSessionHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<TrainingSessionDetailDto> Handle(UpdateTrainingSessionCommand command, CancellationToken cancellationToken)
    {
        var sessionId = command.SessionId;
        var dto = command.Dto;

        // Validate session exists
        var exists = await _db.TrainingSessions.AnyAsync(s => s.Id == sessionId, cancellationToken);
        if (!exists)
            throw new NotFoundException("TrainingSession", sessionId.ToString());

        var now = DateTime.UtcNow;
        var statusInt = ParseStatus(dto.Status);
        var location = dto.Location ?? string.Empty;
        var focusAreasJson = JsonSerializer.Serialize(dto.FocusAreas);
        var notes = dto.Notes ?? string.Empty;

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            // Update main TrainingSessions record
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                UPDATE TrainingSessions
                SET TeamId = {dto.TeamId},
                    SessionDate = {dto.SessionDate},
                    MeetTime = {dto.MeetTime},
                    DurationMinutes = {dto.DurationMinutes},
                    Location = {location},
                    FocusAreas = {focusAreasJson},
                    TemplateId = {dto.TemplateId},
                    Notes = {notes},
                    Status = {statusInt},
                    IsLocked = {dto.IsLocked},
                    UpdatedAt = {now}
                WHERE Id = {sessionId}
            ", cancellationToken);

            // Delete existing child records
            await _db.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM SessionDrills WHERE SessionId = {sessionId}", cancellationToken);

            await _db.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM SessionCoaches WHERE SessionId = {sessionId}", cancellationToken);

            await _db.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM SessionAttendances WHERE SessionId = {sessionId}", cancellationToken);

            await _db.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM AppliedTemplates WHERE SessionId = {sessionId}", cancellationToken);

            // Re-insert session drills
            foreach (var drill in dto.Drills)
            {
                var drillRecordId = Guid.NewGuid();
                var source = drill.Source ?? string.Empty;
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO SessionDrills (Id, SessionId, DrillId, Source, TemplateId, DrillOrder)
                    VALUES ({drillRecordId}, {sessionId}, {drill.DrillId}, {source}, {drill.TemplateId}, {drill.Order})
                ", cancellationToken);
            }

            // Re-insert session coaches
            foreach (var coachId in dto.CoachIds)
            {
                var scId = Guid.NewGuid();
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO SessionCoaches (Id, SessionId, CoachId)
                    VALUES ({scId}, {sessionId}, {coachId})
                ", cancellationToken);
            }

            // Re-insert session attendance with status-to-Present mapping
            foreach (var attendance in dto.Attendance)
            {
                var saId = Guid.NewGuid();
                var present = MapAttendanceStatus(attendance.Status);
                var attendanceNotes = attendance.Notes ?? string.Empty;
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO SessionAttendances (Id, SessionId, PlayerId, Present, Notes)
                    VALUES ({saId}, {sessionId}, {attendance.PlayerId}, {present}, {attendanceNotes})
                ", cancellationToken);
            }

            // Re-insert applied templates (preserve timestamps from request)
            foreach (var template in dto.AppliedTemplates)
            {
                var atId = Guid.NewGuid();
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO AppliedTemplates (Id, SessionId, TemplateId, AppliedAt)
                    VALUES ({atId}, {sessionId}, {template.TemplateId}, {template.AppliedAt})
                ", cancellationToken);
            }

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        // Query back the updated session using GetTrainingSessionByIdHandler
        var result = await new GetTrainingSessionByIdHandler(_db)
            .Handle(new GetTrainingSessionByIdQuery(sessionId), cancellationToken);

        if (result == null)
            throw new Exception("Failed to retrieve updated training session.");

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
            _ => null
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

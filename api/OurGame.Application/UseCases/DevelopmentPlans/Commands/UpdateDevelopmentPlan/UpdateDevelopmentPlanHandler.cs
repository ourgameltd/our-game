using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.DevelopmentPlans.Commands.UpdateDevelopmentPlan.DTOs;
using OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById;
using OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.DevelopmentPlans.Commands.UpdateDevelopmentPlan;

/// <summary>
/// Command to update an existing development plan
/// </summary>
public record UpdateDevelopmentPlanCommand(Guid PlanId, UpdateDevelopmentPlanRequest Dto) : IRequest<DevelopmentPlanDto>;

/// <summary>
/// Handler for updating an existing development plan
/// </summary>
public class UpdateDevelopmentPlanHandler : IRequestHandler<UpdateDevelopmentPlanCommand, DevelopmentPlanDto>
{
    private readonly OurGameContext _db;

    public UpdateDevelopmentPlanHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<DevelopmentPlanDto> Handle(UpdateDevelopmentPlanCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var planId = command.PlanId;

        // Validate required fields
        if (string.IsNullOrWhiteSpace(dto.Title))
        {
            throw new ValidationException("Title", "Title is required.");
        }

        // Validate period dates
        if (dto.PeriodStart >= dto.PeriodEnd)
        {
            throw new ValidationException("PeriodStart", "Period start must be before period end.");
        }

        // Check if plan exists
        var exists = await _db.DevelopmentPlans.AnyAsync(dp => dp.Id == planId, cancellationToken);
        if (!exists)
        {
            throw new NotFoundException("DevelopmentPlan", planId.ToString());
        }

        // Parse and validate status
        if (!Enum.TryParse<PlanStatus>(dto.Status, ignoreCase: true, out var status))
        {
            throw new ValidationException("Status", "Invalid status. Must be one of: active, completed, archived.");
        }

        var now = DateTime.UtcNow;
        var statusInt = (int)status;
        var periodStart = DateOnly.FromDateTime(dto.PeriodStart);
        var periodEnd = DateOnly.FromDateTime(dto.PeriodEnd);
        var description = dto.Description ?? string.Empty;
        var coachNotes = dto.CoachNotes ?? string.Empty;

        // Update the development plan
        var rowsAffected = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE DevelopmentPlans
            SET 
                Title = {dto.Title},
                Description = {description},
                PeriodStart = {periodStart},
                PeriodEnd = {periodEnd},
                Status = {statusInt},
                CoachNotes = {coachNotes},
                UpdatedAt = {now}
            WHERE Id = {planId}
        ", cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException("DevelopmentPlan", planId.ToString());
        }

        // Delete existing goals (replace strategy)
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM DevelopmentGoals WHERE PlanId = {planId}
        ", cancellationToken);

        // Insert new goals, filtering out empty ones
        var validGoals = dto.Goals?
            .Where(g => !string.IsNullOrWhiteSpace(g.Goal))
            .ToList() ?? new List<UpdateDevelopmentGoalRequest>();

        foreach (var goal in validGoals)
        {
            var goalId = Guid.NewGuid();
            var actionsJson = SerializeActions(goal.Actions);
            var goalStartDate = DateOnly.FromDateTime(goal.StartDate);
            var goalTargetDate = DateOnly.FromDateTime(goal.TargetDate);
            DateOnly? goalCompletedDate = goal.CompletedDate.HasValue
                ? DateOnly.FromDateTime(goal.CompletedDate.Value)
                : null;
            var progress = goal.Progress;

            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO DevelopmentGoals (Id, PlanId, Goal, Actions, StartDate, TargetDate, Progress, Completed, CompletedDate)
                VALUES ({goalId}, {planId}, {goal.Goal}, {actionsJson}, {goalStartDate}, {goalTargetDate}, {progress}, {goal.Completed}, {goalCompletedDate})
            ", cancellationToken);
        }

        // Query back the updated plan
        var planSql = @"
            SELECT 
                dp.Id,
                dp.PlayerId,
                dp.Title,
                dp.Description,
                dp.PeriodStart,
                dp.PeriodEnd,
                dp.Status,
                dp.CoachNotes
            FROM DevelopmentPlans dp
            WHERE dp.Id = {0}";

        var plan = await _db.Database
            .SqlQueryRaw<DevelopmentPlanRawDto>(planSql, planId)
            .FirstOrDefaultAsync(cancellationToken);

        if (plan == null)
        {
            throw new Exception("Failed to retrieve updated development plan.");
        }

        var goalsSql = @"
            SELECT 
                dg.Id,
                dg.PlanId,
                dg.Goal,
                dg.Actions,
                dg.StartDate,
                dg.TargetDate,
                dg.Progress,
                dg.Completed,
                dg.CompletedDate
            FROM DevelopmentGoals dg
            WHERE dg.PlanId = {0}";

        var goals = await _db.Database
            .SqlQueryRaw<DevelopmentGoalRawDto>(goalsSql, planId)
            .ToListAsync(cancellationToken);

        var statusName = Enum.GetName(typeof(PlanStatus), plan.Status) ?? PlanStatus.Active.ToString();

        return new DevelopmentPlanDto
        {
            Id = plan.Id,
            PlayerId = plan.PlayerId,
            Title = plan.Title ?? string.Empty,
            Description = plan.Description,
            PeriodStart = plan.PeriodStart?.ToDateTime(TimeOnly.MinValue) ?? DateTime.MinValue,
            PeriodEnd = plan.PeriodEnd?.ToDateTime(TimeOnly.MinValue) ?? DateTime.MinValue,
            Status = statusName.ToLowerInvariant(),
            CoachNotes = plan.CoachNotes,
            Goals = goals.Select(g => new DevelopmentGoalDto
            {
                Id = g.Id,
                Goal = g.Goal ?? string.Empty,
                Actions = ParseActions(g.Actions),
                StartDate = g.StartDate?.ToDateTime(TimeOnly.MinValue) ?? DateTime.MinValue,
                TargetDate = g.TargetDate?.ToDateTime(TimeOnly.MinValue) ?? DateTime.MinValue,
                Progress = g.Progress ?? 0,
                Completed = g.Completed,
                CompletedDate = g.CompletedDate?.ToDateTime(TimeOnly.MinValue)
            }).ToList()
        };
    }

    /// <summary>
    /// Serializes a list of action strings to JSON, filtering out empty entries
    /// </summary>
    private static string SerializeActions(List<string>? actions)
    {
        var filtered = actions?
            .Where(a => !string.IsNullOrWhiteSpace(a))
            .ToList() ?? new List<string>();

        return JsonSerializer.Serialize(filtered);
    }

    /// <summary>
    /// Parses the Actions column from JSON string to a list of strings
    /// </summary>
    private static List<string> ParseActions(string? actions)
    {
        if (string.IsNullOrWhiteSpace(actions))
        {
            return new List<string>();
        }

        try
        {
            var parsed = JsonSerializer.Deserialize<List<string>>(actions);
            return parsed?.Where(a => !string.IsNullOrWhiteSpace(a)).ToList() ?? new List<string>();
        }
        catch (JsonException)
        {
            return new List<string> { actions };
        }
    }
}

using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById;

/// <summary>
/// Query to get a development plan by ID
/// </summary>
public record GetDevelopmentPlanByIdQuery(Guid PlanId) : IQuery<DevelopmentPlanDto?>;

/// <summary>
/// Handler for GetDevelopmentPlanByIdQuery
/// </summary>
public class GetDevelopmentPlanByIdHandler : IRequestHandler<GetDevelopmentPlanByIdQuery, DevelopmentPlanDto?>
{
    private readonly OurGameContext _db;

    public GetDevelopmentPlanByIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<DevelopmentPlanDto?> Handle(GetDevelopmentPlanByIdQuery query, CancellationToken cancellationToken)
    {
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
            .SqlQueryRaw<DevelopmentPlanRawDto>(planSql, query.PlanId)
            .FirstOrDefaultAsync(cancellationToken);

        if (plan == null)
        {
            return null;
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
            .SqlQueryRaw<DevelopmentGoalRawDto>(goalsSql, query.PlanId)
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
    /// Parses the Actions column from JSON string to a list of strings.
    /// Falls back to a single-item array if the value is not valid JSON array.
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
            // Plain string fallback
            return new List<string> { actions };
        }
    }
}

/// <summary>
/// Raw SQL query result for development plan
/// </summary>
public class DevelopmentPlanRawDto
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateOnly? PeriodStart { get; set; }
    public DateOnly? PeriodEnd { get; set; }
    public int Status { get; set; }
    public string? CoachNotes { get; set; }
}

/// <summary>
/// Raw SQL query result for development goal
/// </summary>
public class DevelopmentGoalRawDto
{
    public Guid Id { get; set; }
    public Guid PlanId { get; set; }
    public string? Goal { get; set; }
    public string? Actions { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? TargetDate { get; set; }
    public int? Progress { get; set; }
    public bool Completed { get; set; }
    public DateOnly? CompletedDate { get; set; }
}

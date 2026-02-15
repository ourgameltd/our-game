using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById;

/// <summary>
/// Query to get a development plan by ID with full detail
/// </summary>
public record GetDevelopmentPlanByIdQuery(Guid PlanId) : IQuery<DevelopmentPlanDetailDto?>;

/// <summary>
/// Handler for GetDevelopmentPlanByIdQuery - retrieves full development plan detail using raw SQL
/// </summary>
public class GetDevelopmentPlanByIdHandler : IRequestHandler<GetDevelopmentPlanByIdQuery, DevelopmentPlanDetailDto?>
{
    private readonly OurGameContext _db;

    public GetDevelopmentPlanByIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<DevelopmentPlanDetailDto?> Handle(GetDevelopmentPlanByIdQuery query, CancellationToken cancellationToken)
    {
        // 1. Fetch base plan with player info and team/ageGroup/club context
        var planSql = @"
            SELECT 
                dp.Id,
                dp.Title,
                dp.Description,
                dp.PeriodStart,
                dp.PeriodEnd,
                dp.Status,
                dp.CoachNotes,
                dp.CreatedAt,
                dp.UpdatedAt,
                p.Id AS PlayerId,
                p.FirstName,
                p.LastName,
                p.PreferredPositions,
                p.ClubId,
                c.Name AS ClubName,
                t.Id AS TeamId,
                t.Name AS TeamName,
                ag.Id AS AgeGroupId,
                ag.Name AS AgeGroupName
            FROM DevelopmentPlans dp
            INNER JOIN Players p ON p.Id = dp.PlayerId
            INNER JOIN Clubs c ON c.Id = p.ClubId
            LEFT JOIN (
                SELECT pt.PlayerId, pt.TeamId, pt.AssignedAt,
                    ROW_NUMBER() OVER (PARTITION BY pt.PlayerId ORDER BY pt.AssignedAt DESC) AS RowNum
                FROM PlayerTeams pt
            ) pt_ranked ON pt_ranked.PlayerId = p.Id AND pt_ranked.RowNum = 1
            LEFT JOIN Teams t ON t.Id = pt_ranked.TeamId
            LEFT JOIN AgeGroups ag ON ag.Id = t.AgeGroupId
            WHERE dp.Id = @p0";

        var plan = await _db.Database
            .SqlQueryRaw<PlanDetailRaw>(planSql, query.PlanId)
            .FirstOrDefaultAsync(cancellationToken);

        if (plan == null)
        {
            return null;
        }

        // 2. Fetch goals/milestones from DevelopmentGoals
        var goalsSql = @"
            SELECT 
                dg.Id,
                dg.Goal,
                dg.Actions,
                dg.TargetDate,
                dg.CompletedDate,
                dg.Completed,
                dg.Progress
            FROM DevelopmentGoals dg
            WHERE dg.PlanId = @p0
            ORDER BY dg.TargetDate";

        var goals = await _db.Database
            .SqlQueryRaw<GoalRaw>(goalsSql, query.PlanId)
            .ToListAsync(cancellationToken);

        // 3. Progress notes - not directly linked to DevelopmentPlans, return empty list
        var progressNotes = new List<DevelopmentPlanProgressNoteDto>();

        // 4. Training objectives - not directly linked to DevelopmentPlans, return empty list
        var trainingObjectives = new List<DevelopmentPlanTrainingObjectiveDto>();

        // Map to response DTO
        var statusName = Enum.GetName(typeof(PlanStatus), plan.Status) ?? PlanStatus.Active.ToString();
        var playerName = $"{plan.FirstName ?? ""} {plan.LastName ?? ""}".Trim();

        return new DevelopmentPlanDetailDto
        {
            Id = plan.Id,
            Title = plan.Title ?? string.Empty,
            Description = plan.Description,
            PeriodStart = plan.PeriodStart,
            PeriodEnd = plan.PeriodEnd,
            Status = statusName,
            CoachNotes = plan.CoachNotes,
            CreatedAt = plan.CreatedAt,
            UpdatedAt = plan.UpdatedAt,
            PlayerId = plan.PlayerId,
            PlayerName = playerName,
            Position = plan.PreferredPositions,
            TeamId = plan.TeamId,
            TeamName = plan.TeamName,
            AgeGroupId = plan.AgeGroupId,
            AgeGroupName = plan.AgeGroupName,
            ClubId = plan.ClubId,
            ClubName = plan.ClubName ?? string.Empty,
            Goals = goals.Select(g => new DevelopmentPlanGoalDto
            {
                Id = g.Id,
                Title = g.Goal ?? string.Empty,
                Description = null,
                TargetDate = g.TargetDate,
                CompletedDate = g.CompletedDate,
                Status = g.Completed ? "Completed" : "InProgress",
                Actions = ParseActions(g.Actions),
                Progress = g.Progress ?? 0
            }).ToList(),
            ProgressNotes = progressNotes,
            TrainingObjectives = trainingObjectives
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

#region Raw SQL DTOs

/// <summary>
/// Raw SQL query result for development plan with player and context
/// </summary>
public class PlanDetailRaw
{
    public Guid Id { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateOnly? PeriodStart { get; set; }
    public DateOnly? PeriodEnd { get; set; }
    public int Status { get; set; }
    public string? CoachNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid PlayerId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PreferredPositions { get; set; }
    public Guid ClubId { get; set; }
    public string? ClubName { get; set; }
    public Guid? TeamId { get; set; }
    public string? TeamName { get; set; }
    public Guid? AgeGroupId { get; set; }
    public string? AgeGroupName { get; set; }
}

/// <summary>
/// Raw SQL query result for development goal
/// </summary>
public class GoalRaw
{
    public Guid Id { get; set; }
    public string? Goal { get; set; }
    public string? Actions { get; set; }
    public DateOnly? TargetDate { get; set; }
    public DateOnly? CompletedDate { get; set; }
    public bool Completed { get; set; }
    public int? Progress { get; set; }
}

/// <summary>
/// Raw SQL query result for basic development plan (used by other handlers)
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
/// Raw SQL query result for basic development goal (used by other handlers)
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

#endregion

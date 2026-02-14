using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Clubs.Queries.GetDevelopmentPlansByClubId.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Queries.GetDevelopmentPlansByClubId;

/// <summary>
/// Query to get all development plans for players belonging to a specific club
/// </summary>
public record GetDevelopmentPlansByClubIdQuery(Guid ClubId) : IQuery<List<ClubDevelopmentPlanDto>>;

/// <summary>
/// Handler for GetDevelopmentPlansByClubIdQuery
/// </summary>
public class GetDevelopmentPlansByClubIdHandler : IRequestHandler<GetDevelopmentPlansByClubIdQuery, List<ClubDevelopmentPlanDto>>
{
    private readonly OurGameContext _db;

    public GetDevelopmentPlansByClubIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<ClubDevelopmentPlanDto>> Handle(GetDevelopmentPlansByClubIdQuery query, CancellationToken cancellationToken)
    {
        // Get all development plans for players belonging to this club
        var plansSql = @"
            SELECT 
                dp.Id,
                dp.PlayerId,
                dp.Title,
                dp.Description,
                dp.PeriodStart,
                dp.PeriodEnd,
                dp.Status,
                dp.CreatedBy,
                dp.CreatedAt,
                p.FirstName AS PlayerFirstName,
                p.LastName AS PlayerLastName,
                p.Nickname AS PlayerNickname,
                p.Photo AS PlayerPhoto,
                p.PreferredPositions AS PlayerPreferredPositions
            FROM DevelopmentPlans dp
            INNER JOIN Players p ON dp.PlayerId = p.Id
            WHERE p.ClubId = {0}
            ORDER BY dp.CreatedAt DESC";

        var planData = await _db.Database
            .SqlQueryRaw<DevelopmentPlanRawDto>(plansSql, query.ClubId)
            .ToListAsync(cancellationToken);

        if (planData.Count == 0)
        {
            return new List<ClubDevelopmentPlanDto>();
        }

        // Get plan IDs for fetching goals
        var planIds = planData.Select(p => p.Id).ToList();

        var planParams = planIds.Select((id, index) =>
            new Microsoft.Data.SqlClient.SqlParameter($"@p{index}", id)).ToArray();
        var planParamNames = string.Join(", ", planParams.Select(p => p.ParameterName));

        // Get all goals for the plans
        var goalsSql = $@"
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
            WHERE dg.PlanId IN ({planParamNames})
            ORDER BY dg.StartDate";

        var goalsData = await _db.Database
            .SqlQueryRaw<DevelopmentGoalRawDto>(goalsSql, planParams)
            .ToListAsync(cancellationToken);

        // Get player IDs for fetching age groups
        var playerIds = planData.Select(p => p.PlayerId).Distinct().ToList();

        var playerParams = playerIds.Select((id, index) =>
            new Microsoft.Data.SqlClient.SqlParameter($"@player{index}", id)).ToArray();
        var playerParamNames = string.Join(", ", playerParams.Select(p => p.ParameterName));

        // Get age groups for players
        var ageGroupsSql = $@"
            SELECT 
                pag.PlayerId,
                pag.AgeGroupId
            FROM PlayerAgeGroups pag
            WHERE pag.PlayerId IN ({playerParamNames})";

        var ageGroupsData = await _db.Database
            .SqlQueryRaw<PlayerAgeGroupRawDto>(ageGroupsSql, playerParams)
            .ToListAsync(cancellationToken);

        // Group data for mapping
        var goalsByPlan = goalsData.GroupBy(g => g.PlanId).ToDictionary(g => g.Key, g => g.ToList());
        var ageGroupsByPlayer = ageGroupsData.GroupBy(ag => ag.PlayerId).ToDictionary(g => g.Key, g => g.Select(x => x.AgeGroupId).ToList());

        // Map to DTOs
        return planData.Select(p =>
        {
            var statusName = Enum.GetName(typeof(PlanStatus), p.Status) ?? PlanStatus.Active.ToString();

            return new ClubDevelopmentPlanDto
            {
                Id = p.Id,
                PlayerId = p.PlayerId,
                Title = p.Title ?? string.Empty,
                Description = p.Description,
                Status = statusName.ToLowerInvariant(),
                CreatedAt = p.CreatedAt,
                CreatedBy = p.CreatedBy,
                Period = new ClubDevelopmentPlanPeriodDto
                {
                    Start = p.PeriodStart,
                    End = p.PeriodEnd
                },
                Player = new ClubDevelopmentPlanPlayerDto
                {
                    Id = p.PlayerId,
                    FirstName = p.PlayerFirstName ?? string.Empty,
                    LastName = p.PlayerLastName ?? string.Empty,
                    Nickname = p.PlayerNickname,
                    Photo = p.PlayerPhoto,
                    PreferredPositions = ParseJsonArray(p.PlayerPreferredPositions),
                    AgeGroupIds = ageGroupsByPlayer.TryGetValue(p.PlayerId, out var ageGroups) ? ageGroups : new List<Guid>()
                },
                Goals = goalsByPlan.TryGetValue(p.Id, out var goals)
                    ? goals.Select(g => new ClubDevelopmentPlanGoalDto
                    {
                        Id = g.Id,
                        Goal = g.Goal ?? string.Empty,
                        Actions = ParseJsonArray(g.Actions),
                        StartDate = g.StartDate,
                        TargetDate = g.TargetDate,
                        Progress = g.Progress ?? 0,
                        Completed = g.Completed,
                        CompletedDate = g.CompletedDate?.ToDateTime(TimeOnly.MinValue)
                    }).ToList()
                    : new List<ClubDevelopmentPlanGoalDto>()
            };
        }).ToList();
    }

    /// <summary>
    /// Parse JSON array string to list of strings.
    /// Falls back to delimiter splitting if not valid JSON.
    /// </summary>
    private static List<string> ParseJsonArray(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return new List<string>();
        }

        if (json.TrimStart().StartsWith("["))
        {
            try
            {
                var parsed = JsonSerializer.Deserialize<List<string>>(json);
                return parsed?.Where(a => !string.IsNullOrWhiteSpace(a)).ToList() ?? new List<string>();
            }
            catch (JsonException)
            {
                return new List<string>();
            }
        }

        // If not JSON, split by delimiter
        return json.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(s => s.Trim())
            .Where(s => !string.IsNullOrEmpty(s))
            .ToList();
    }
}

/// <summary>
/// Raw SQL query result for development plan with joined player data
/// </summary>
internal class DevelopmentPlanRawDto
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateOnly? PeriodStart { get; set; }
    public DateOnly? PeriodEnd { get; set; }
    public int Status { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? PlayerFirstName { get; set; }
    public string? PlayerLastName { get; set; }
    public string? PlayerNickname { get; set; }
    public string? PlayerPhoto { get; set; }
    public string? PlayerPreferredPositions { get; set; }
}

/// <summary>
/// Raw SQL query result for development goal
/// </summary>
internal class DevelopmentGoalRawDto
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

/// <summary>
/// Raw SQL query result for player age group
/// </summary>
internal class PlayerAgeGroupRawDto
{
    public Guid PlayerId { get; set; }
    public Guid AgeGroupId { get; set; }
}

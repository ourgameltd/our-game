using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Teams.Queries.GetDevelopmentPlansByTeamId.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Queries.GetDevelopmentPlansByTeamId;

/// <summary>
/// Query to get all development plans for players belonging to a specific team
/// </summary>
public record GetDevelopmentPlansByTeamIdQuery(Guid TeamId) : IQuery<List<TeamDevelopmentPlanDto>>;

/// <summary>
/// Handler for GetDevelopmentPlansByTeamIdQuery
/// </summary>
public class GetDevelopmentPlansByTeamIdHandler : IRequestHandler<GetDevelopmentPlansByTeamIdQuery, List<TeamDevelopmentPlanDto>>
{
    private readonly OurGameContext _db;

    public GetDevelopmentPlansByTeamIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<TeamDevelopmentPlanDto>> Handle(GetDevelopmentPlansByTeamIdQuery query, CancellationToken cancellationToken)
    {
        // Validate team exists and get club ID
        var teamValidationSql = @"
            SELECT t.Id, t.ClubId, t.AgeGroupId 
            FROM Teams t 
            WHERE t.Id = {0}";

        var teamData = await _db.Database
            .SqlQueryRaw<TeamValidationDto>(teamValidationSql, query.TeamId)
            .FirstOrDefaultAsync(cancellationToken);

        if (teamData == null)
        {
            throw new KeyNotFoundException($"Team with ID {query.TeamId} not found");
        }

        // Get all development plans for players in this team
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
            INNER JOIN PlayerTeams pt ON pt.PlayerId = p.Id
            WHERE pt.TeamId = {0}
              AND p.ClubId = {1}
            ORDER BY 
              CASE WHEN dp.Status = 0 THEN 0 ELSE 1 END, 
              dp.CreatedAt DESC";

        var planData = await _db.Database
            .SqlQueryRaw<DevelopmentPlanRawDto>(plansSql, query.TeamId, teamData.ClubId)
            .ToListAsync(cancellationToken);

        if (planData.Count == 0)
        {
            return new List<TeamDevelopmentPlanDto>();
        }

        // Get plan IDs for fetching goals
        var planIds = planData.Select(p => p.Id).ToList();

        var planParams = planIds.Select((id, index) =>
            new Microsoft.Data.SqlClient.SqlParameter($"@p{index}", id)).ToArray();
        var planParamNames = string.Join(", ", planParams.Select(p => p.ParameterName));

        // Get all goals for the plans
        var goalsSql = $@"
            SELECT 
                Id,
                PlanId,
                Goal,
                Actions,
                StartDate,
                TargetDate,
                Progress,
                Completed,
                CompletedDate
            FROM DevelopmentGoals
            WHERE PlanId IN ({planParamNames})";

        var goalsData = await _db.Database
            .SqlQueryRaw<DevelopmentGoalRawDto>(goalsSql, planParams)
            .ToListAsync(cancellationToken);

        // Group data for mapping
        var goalsByPlan = goalsData.GroupBy(g => g.PlanId).ToDictionary(g => g.Key, g => g.ToList());

        // Map to DTOs
        return planData.Select(p =>
        {
            var statusName = Enum.GetName(typeof(PlanStatus), p.Status) ?? PlanStatus.Active.ToString();

            return new TeamDevelopmentPlanDto
            {
                Id = p.Id,
                PlayerId = p.PlayerId,
                Title = p.Title ?? string.Empty,
                Description = p.Description,
                Status = statusName.ToLowerInvariant(),
                CreatedAt = p.CreatedAt,
                CreatedBy = p.CreatedBy,
                Period = new TeamDevelopmentPlanPeriodDto
                {
                    Start = p.PeriodStart,
                    End = p.PeriodEnd
                },
                Player = new TeamDevelopmentPlanPlayerDto
                {
                    Id = p.PlayerId,
                    FirstName = p.PlayerFirstName ?? string.Empty,
                    LastName = p.PlayerLastName ?? string.Empty,
                    Nickname = p.PlayerNickname,
                    Photo = p.PlayerPhoto,
                    PreferredPositions = ParseJsonArray(p.PlayerPreferredPositions)
                },
                Goals = goalsByPlan.TryGetValue(p.Id, out var goals)
                    ? goals.Select(g => new TeamDevelopmentPlanGoalDto
                    {
                        Id = g.Id,
                        Goal = g.Goal ?? string.Empty,
                        Actions = ParseJsonArray(g.Actions),
                        StartDate = g.StartDate,
                        TargetDate = g.TargetDate,
                        Progress = g.Progress ?? 0,
                        Completed = g.Completed,
                        CompletedDate = g.CompletedDate
                    }).ToList()
                    : new List<TeamDevelopmentPlanGoalDto>()
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
/// Raw SQL query result for team validation
/// </summary>
internal class TeamValidationDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public Guid AgeGroupId { get; set; }
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

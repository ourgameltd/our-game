using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachesByClubId.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Coaches.Queries.GetCoachesByClubId;

/// <summary>
/// Query to get all coaches for a specific club
/// </summary>
public record GetCoachesByClubIdQuery(Guid ClubId, bool IncludeArchived = false) : IQuery<List<ClubCoachDto>>;

/// <summary>
/// Handler for GetCoachesByClubIdQuery
/// </summary>
public class GetCoachesByClubIdHandler : IRequestHandler<GetCoachesByClubIdQuery, List<ClubCoachDto>>
{
    private readonly OurGameContext _db;

    public GetCoachesByClubIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<ClubCoachDto>> Handle(GetCoachesByClubIdQuery query, CancellationToken cancellationToken)
    {
        // Get all coaches for the club
        var sql = query.IncludeArchived
            ? @"
                SELECT 
                    c.Id,
                    c.ClubId,
                    c.FirstName,
                    c.LastName,
                    c.DateOfBirth,
                    c.Photo,
                    c.Email,
                    c.Phone,
                    c.AssociationId,
                    c.HasAccount,
                    c.Role,
                    c.Biography,
                    c.Specializations,
                    c.IsArchived
                FROM Coaches c
                WHERE c.ClubId = {0}
                ORDER BY c.FirstName, c.LastName"
            : @"
                SELECT 
                    c.Id,
                    c.ClubId,
                    c.FirstName,
                    c.LastName,
                    c.DateOfBirth,
                    c.Photo,
                    c.Email,
                    c.Phone,
                    c.AssociationId,
                    c.HasAccount,
                    c.Role,
                    c.Biography,
                    c.Specializations,
                    c.IsArchived
                FROM Coaches c
                WHERE c.ClubId = {0} AND c.IsArchived = 0
                ORDER BY c.FirstName, c.LastName";

        var coachData = await _db.Database
            .SqlQueryRaw<CoachRawDto>(sql, query.ClubId)
            .ToListAsync(cancellationToken);

        if (coachData.Count == 0)
        {
            return new List<ClubCoachDto>();
        }

        // Get coach IDs for fetching related data
        var coachIds = coachData.Select(c => c.Id).ToList();

        // Build parameterized query for teams
        var parameters = coachIds.Select((id, index) =>
            new Microsoft.Data.SqlClient.SqlParameter($"@p{index}", id)).ToArray();
        var parameterNames = string.Join(", ", parameters.Select(p => p.ParameterName));

        // Get teams for coaches
        var teamSql = $@"
            SELECT 
                tc.CoachId,
                t.Id,
                t.AgeGroupId,
                t.Name,
                ag.Name AS AgeGroupName
            FROM TeamCoaches tc
            INNER JOIN Teams t ON tc.TeamId = t.Id
            LEFT JOIN AgeGroups ag ON t.AgeGroupId = ag.Id
            WHERE tc.CoachId IN ({parameterNames})
            ORDER BY ag.Name, t.Name";

        var teamData = await _db.Database
            .SqlQueryRaw<CoachTeamRawDto>(teamSql, parameters)
            .ToListAsync(cancellationToken);

        // Group related data by coach
        var teamsByCoach = teamData
            .GroupBy(t => t.CoachId)
            .ToDictionary(
                g => g.Key,
                g => g.Select(t => new ClubCoachTeamDto
                {
                    Id = t.Id,
                    AgeGroupId = t.AgeGroupId,
                    Name = t.Name ?? string.Empty,
                    AgeGroupName = t.AgeGroupName
                }).ToList()
            );

        // Map to DTOs
        return coachData
            .Select(c => new ClubCoachDto
            {
                Id = c.Id,
                ClubId = c.ClubId,
                FirstName = c.FirstName ?? string.Empty,
                LastName = c.LastName ?? string.Empty,
                DateOfBirth = c.DateOfBirth,
                Photo = c.Photo,
                Email = c.Email,
                Phone = c.Phone,
                AssociationId = c.AssociationId,
                HasAccount = c.HasAccount,
                Role = ConvertRoleToString(c.Role),
                Biography = c.Biography,
                Specializations = ParseSpecializations(c.Specializations),
                IsArchived = c.IsArchived,
                Teams = teamsByCoach.GetValueOrDefault(c.Id, new List<ClubCoachTeamDto>())
            })
            .ToList();
    }

    private static string ConvertRoleToString(int role)
    {
        return (CoachRole)role switch
        {
            CoachRole.HeadCoach => "head-coach",
            CoachRole.AssistantCoach => "assistant-coach",
            CoachRole.GoalkeeperCoach => "goalkeeper-coach",
            CoachRole.FitnessCoach => "fitness-coach",
            CoachRole.TechnicalCoach => "technical-coach",
            _ => "head-coach"
        };
    }

    private static List<string> ParseSpecializations(string? specializations)
    {
        if (string.IsNullOrWhiteSpace(specializations))
        {
            return new List<string>();
        }

        // Try to parse as JSON array first (e.g., ["Youth Development","Tactical Training"])
        var trimmed = specializations.Trim();
        if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
        {
            try
            {
                var parsed = System.Text.Json.JsonSerializer.Deserialize<List<string>>(trimmed);
                return parsed ?? new List<string>();
            }
            catch
            {
                // Fall through to comma-separated parsing
            }
        }

        // Fallback: Specializations are stored as comma-separated values
        return specializations
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => s.Trim())
            .ToList();
    }
}

/// <summary>
/// DTO for raw SQL coach query result
/// </summary>
class CoachRawDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Photo { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? AssociationId { get; set; }
    public bool HasAccount { get; set; }
    public int Role { get; set; }
    public string? Biography { get; set; }
    public string? Specializations { get; set; }
    public bool IsArchived { get; set; }
}

/// <summary>
/// DTO for raw SQL coach team query result
/// </summary>
class CoachTeamRawDto
{
    public Guid CoachId { get; set; }
    public Guid Id { get; set; }
    public Guid AgeGroupId { get; set; }
    public string? Name { get; set; }
    public string? AgeGroupName { get; set; }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupsByClubId.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupsByClubId;

/// <summary>
/// Query to get all age groups for a club
/// </summary>
public record GetAgeGroupsByClubIdQuery(Guid ClubId, bool IncludeArchived = false) : IQuery<List<AgeGroupListDto>>;

/// <summary>
/// Handler for GetAgeGroupsByClubIdQuery
/// </summary>
public class GetAgeGroupsByClubIdHandler : IRequestHandler<GetAgeGroupsByClubIdQuery, List<AgeGroupListDto>>
{
    private readonly OurGameContext _db;

    public GetAgeGroupsByClubIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<AgeGroupListDto>> Handle(GetAgeGroupsByClubIdQuery query, CancellationToken cancellationToken)
    {
        var archivedFilter = query.IncludeArchived ? "" : "AND ag.IsArchived = 0";

        var sql = $@"
            SELECT 
                ag.Id,
                ag.ClubId,
                ag.Name,
                ag.Code,
                ag.Level,
                ag.CurrentSeason,
                ag.Seasons,
                ag.DefaultSeason,
                ag.DefaultSquadSize,
                ag.Description,
                ag.IsArchived,
                COUNT(DISTINCT t.Id) AS TeamCount
            FROM AgeGroups ag
            LEFT JOIN Teams t ON t.AgeGroupId = ag.Id AND t.IsArchived = 0
            WHERE ag.ClubId = {{0}} {archivedFilter}
            GROUP BY ag.Id, ag.ClubId, ag.Name, ag.Code, ag.Level, ag.CurrentSeason, 
                     ag.Seasons, ag.DefaultSeason, ag.DefaultSquadSize, ag.Description, ag.IsArchived
            ORDER BY ag.Name";

        var ageGroups = await _db.Database
            .SqlQueryRaw<AgeGroupRawDto>(sql, query.ClubId)
            .ToListAsync(cancellationToken);

        return ageGroups.Select(ag =>
        {
            var levelName = Enum.GetName(typeof(Level), ag.Level) ?? Level.Youth.ToString();
            return new AgeGroupListDto
            {
                Id = ag.Id,
                ClubId = ag.ClubId,
                Name = ag.Name ?? string.Empty,
                Code = ag.Code ?? string.Empty,
                Level = levelName.ToLowerInvariant(),
                Season = ag.CurrentSeason ?? string.Empty,
                Seasons = ag.Seasons != null
                    ? ag.Seasons.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList()
                    : new List<string>(),
                DefaultSeason = ag.DefaultSeason ?? string.Empty,
                DefaultSquadSize = ag.DefaultSquadSize,
                Description = ag.Description,
                IsArchived = ag.IsArchived,
                TeamCount = ag.TeamCount
            };
        }).ToList();
    }
}

/// <summary>
/// DTO for raw SQL query result
/// </summary>
public class AgeGroupRawDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public string? Name { get; set; }
    public string? Code { get; set; }
    public int Level { get; set; }
    public string? CurrentSeason { get; set; }
    public string? Seasons { get; set; }
    public string? DefaultSeason { get; set; }
    public int DefaultSquadSize { get; set; }
    public string? Description { get; set; }
    public bool IsArchived { get; set; }
    public int TeamCount { get; set; }
}

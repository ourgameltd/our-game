using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupById;

/// <summary>
/// Query to get age group by ID
/// </summary>
public record GetAgeGroupByIdQuery(Guid AgeGroupId) : IQuery<AgeGroupDetailDto?>;

/// <summary>
/// Handler for GetAgeGroupByIdQuery
/// </summary>
public class GetAgeGroupByIdHandler : IRequestHandler<GetAgeGroupByIdQuery, AgeGroupDetailDto?>
{
    private readonly OurGameContext _db;

    public GetAgeGroupByIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<AgeGroupDetailDto?> Handle(GetAgeGroupByIdQuery query, CancellationToken cancellationToken)
    {
        var sql = @"
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
                ag.IsArchived
            FROM AgeGroups ag
            WHERE ag.Id = {0}";

        var ageGroup = await _db.Database
            .SqlQueryRaw<AgeGroupRawDto>(sql, query.AgeGroupId)
            .FirstOrDefaultAsync(cancellationToken);

        if (ageGroup == null)
        {
            return null;
        }

        var levelName = Enum.GetName(typeof(Level), ageGroup.Level) ?? Level.Youth.ToString();

        return new AgeGroupDetailDto
        {
            Id = ageGroup.Id,
            ClubId = ageGroup.ClubId,
            Name = ageGroup.Name ?? string.Empty,
            Code = ageGroup.Code ?? string.Empty,
            Level = levelName.ToLowerInvariant(),
            Season = ageGroup.CurrentSeason ?? string.Empty,
            Seasons = ageGroup.Seasons != null
                ? ageGroup.Seasons.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList()
                : new List<string>(),
            DefaultSeason = ageGroup.DefaultSeason ?? string.Empty,
            DefaultSquadSize = ageGroup.DefaultSquadSize,
            Description = ageGroup.Description,
            IsArchived = ageGroup.IsArchived
        };
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
}

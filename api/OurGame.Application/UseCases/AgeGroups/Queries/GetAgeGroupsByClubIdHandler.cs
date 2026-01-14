using MediatR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using OurGame.Application.UseCases.AgeGroups.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.AgeGroups.Queries;

/// <summary>
/// Handler for GetAgeGroupsByClubIdQuery
/// </summary>
public class GetAgeGroupsByClubIdHandler : IRequestHandler<GetAgeGroupsByClubIdQuery, List<AgeGroupDto>>
{
    private readonly OurGameContext _db;

    public GetAgeGroupsByClubIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<AgeGroupDto>> Handle(GetAgeGroupsByClubIdQuery query, CancellationToken cancellationToken)
    {
        var ageGroups = await _db.AgeGroups
            .AsNoTracking()
            .Where(ag => ag.ClubId == query.ClubId)
            .OrderBy(ag => ag.Level)
            .ToListAsync();

        var result = new List<AgeGroupDto>();

        foreach (var ageGroup in ageGroups)
        {
            var teamCount = await _db.Teams.CountAsync(t => t.AgeGroupId == ageGroup.Id && !t.IsArchived);
            var playerCount = await _db.PlayerAgeGroups.CountAsync(pag => pag.AgeGroupId == ageGroup.Id);

            // Parse seasons JSON array
            List<string> seasons = new();
            if (!string.IsNullOrEmpty(ageGroup.Seasons))
            {
                try
                {
                    seasons = JsonConvert.DeserializeObject<List<string>>(ageGroup.Seasons) ?? new();
                }
                catch
                {
                    // If parsing fails, treat as empty list
                }
            }

            result.Add(new AgeGroupDto
            {
                Id = ageGroup.Id,
                ClubId = ageGroup.ClubId,
                Name = ageGroup.Name,
                Code = ageGroup.Code,
                Level = ageGroup.Level.ToString(),
                Seasons = seasons,
                DefaultSquadSize = ageGroup.DefaultSquadSize.ToString(),
                TeamCount = teamCount,
                PlayerCount = playerCount,
                CreatedAt = ageGroup.CreatedAt,
                UpdatedAt = ageGroup.UpdatedAt
            });
        }

        return result;
    }
}

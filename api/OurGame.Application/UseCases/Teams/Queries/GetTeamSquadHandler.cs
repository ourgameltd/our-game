using MediatR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using OurGame.Application.UseCases.Teams.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Queries;

/// <summary>
/// Handler for GetTeamSquadQuery
/// </summary>
public class GetTeamSquadHandler : IRequestHandler<GetTeamSquadQuery, List<TeamSquadPlayerDto>>
{
    private readonly OurGameContext _db;

    public GetTeamSquadHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<TeamSquadPlayerDto>> Handle(GetTeamSquadQuery query, CancellationToken cancellationToken)
    {
        var playerTeams = await _db.PlayerTeams
            .AsNoTracking()
            .Include(pt => pt.Player)
            .Where(pt => pt.TeamId == query.TeamId)
            .OrderBy(pt => pt.SquadNumber)
            .ToListAsync();

        var result = new List<TeamSquadPlayerDto>();

        foreach (var pt in playerTeams)
        {
            if (pt.Player == null || pt.Player.IsArchived)
                continue;

            // Parse preferred positions JSON array
            List<string> preferredPositions = new();
            if (!string.IsNullOrEmpty(pt.Player.PreferredPositions))
            {
                try
                {
                    preferredPositions = JsonConvert.DeserializeObject<List<string>>(pt.Player.PreferredPositions) ?? new();
                }
                catch
                {
                    // If parsing fails, treat as empty list
                }
            }

            result.Add(new TeamSquadPlayerDto
            {
                PlayerId = pt.Player.Id,
                FirstName = pt.Player.FirstName,
                LastName = pt.Player.LastName,
                Photo = pt.Player.Photo ?? string.Empty,
                SquadNumber = pt.SquadNumber,
                PreferredPosition = preferredPositions.FirstOrDefault() ?? string.Empty,
                PreferredPositions = preferredPositions,
                OverallRating = pt.Player.OverallRating,
                DateOfBirth = pt.Player.DateOfBirth
            });
        }

        return result;
    }
}

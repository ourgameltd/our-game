using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Teams.Queries.GetPlayersByTeamId.DTOs;
using OurGame.Persistence.Models;
using System.Text.Json;

namespace OurGame.Application.UseCases.Teams.Queries.GetPlayersByTeamId;

/// <summary>
/// Query to get players belonging to a specific team
/// </summary>
public record GetPlayersByTeamIdQuery(Guid TeamId) : IQuery<List<TeamPlayerDto>>;

/// <summary>
/// Handler for GetPlayersByTeamIdQuery
/// </summary>
public class GetPlayersByTeamIdHandler : IRequestHandler<GetPlayersByTeamIdQuery, List<TeamPlayerDto>>
{
    private readonly OurGameContext _db;

    public GetPlayersByTeamIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<TeamPlayerDto>> Handle(GetPlayersByTeamIdQuery query, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT
                p.Id,
                p.FirstName,
                p.LastName,
                p.Photo,
                p.PreferredPositions,
                p.OverallRating,
                pt.SquadNumber
            FROM PlayerTeams pt
            INNER JOIN Players p ON p.Id = pt.PlayerId
            WHERE pt.TeamId = {0}
              AND p.IsArchived = 0
            ORDER BY pt.SquadNumber, p.LastName, p.FirstName";

        var rows = await _db.Database
            .SqlQueryRaw<TeamPlayerRawDto>(sql, query.TeamId)
            .ToListAsync(cancellationToken);

        return rows.Select(r => new TeamPlayerDto
        {
            Id = r.Id,
            FirstName = r.FirstName ?? string.Empty,
            LastName = r.LastName ?? string.Empty,
            PhotoUrl = r.Photo,
            PreferredPositions = string.IsNullOrWhiteSpace(r.PreferredPositions)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(r.PreferredPositions) ?? new List<string>(),
            OverallRating = r.OverallRating,
            SquadNumber = r.SquadNumber
        }).ToList();
    }
}

/// <summary>
/// Raw DTO for SQL query projection of team players
/// </summary>
public class TeamPlayerRawDto
{
    public Guid Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Photo { get; set; }
    public string? PreferredPositions { get; set; }
    public int? OverallRating { get; set; }
    public int? SquadNumber { get; set; }
}

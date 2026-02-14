using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId;

/// <summary>
/// Query to get coaches assigned to a specific team
/// </summary>
public record GetCoachesByTeamIdQuery(Guid TeamId) : IQuery<List<TeamCoachDto>>;

/// <summary>
/// Handler for GetCoachesByTeamIdQuery
/// </summary>
public class GetCoachesByTeamIdHandler : IRequestHandler<GetCoachesByTeamIdQuery, List<TeamCoachDto>>
{
    private readonly OurGameContext _db;

    public GetCoachesByTeamIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<TeamCoachDto>> Handle(GetCoachesByTeamIdQuery query, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT
                c.Id,
                c.FirstName,
                c.LastName,
                c.Photo,
                c.Role,
                c.IsArchived
            FROM TeamCoaches tc
            INNER JOIN Coaches c ON c.Id = tc.CoachId
            WHERE tc.TeamId = {0}
            ORDER BY c.Role, c.LastName, c.FirstName";

        var rows = await _db.Database
            .SqlQueryRaw<TeamCoachRawDto>(sql, query.TeamId)
            .ToListAsync(cancellationToken);

        return rows.Select(r => new TeamCoachDto
        {
            Id = r.Id,
            FirstName = r.FirstName ?? string.Empty,
            LastName = r.LastName ?? string.Empty,
            PhotoUrl = r.Photo,
            Role = r.Role.ToString(),
            IsArchived = r.IsArchived
        }).ToList();
    }
}

/// <summary>
/// Raw DTO for SQL query projection of team coaches
/// </summary>
public class TeamCoachRawDto
{
    public Guid Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Photo { get; set; }
    public int Role { get; set; }
    public bool IsArchived { get; set; }
}

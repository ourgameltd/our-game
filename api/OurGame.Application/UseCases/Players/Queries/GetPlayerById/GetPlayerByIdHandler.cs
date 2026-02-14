using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Queries.GetPlayerById;

/// <summary>
/// Query to get player details by ID
/// </summary>
public record GetPlayerByIdQuery(Guid PlayerId) : IQuery<PlayerDto?>;

/// <summary>
/// Handler for GetPlayerByIdQuery.
/// Returns denormalized player context including club, age group, and team information.
/// </summary>
public class GetPlayerByIdHandler : IRequestHandler<GetPlayerByIdQuery, PlayerDto?>
{
    private readonly OurGameContext _db;

    public GetPlayerByIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<PlayerDto?> Handle(GetPlayerByIdQuery query, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT 
                p.Id,
                p.FirstName,
                p.LastName,
                p.Photo AS PhotoUrl,
                p.DateOfBirth,
                p.ClubId,
                c.Name AS ClubName,
                pag.AgeGroupId,
                ag.Name AS AgeGroupName,
                pt.TeamId,
                t.Name AS TeamName,
                p.PreferredPositions AS PreferredPosition
            FROM Players p
            INNER JOIN Clubs c ON c.Id = p.ClubId
            LEFT JOIN PlayerAgeGroups pag ON pag.PlayerId = p.Id
            LEFT JOIN AgeGroups ag ON ag.Id = pag.AgeGroupId
            LEFT JOIN PlayerTeams pt ON pt.PlayerId = p.Id
            LEFT JOIN Teams t ON t.Id = pt.TeamId
            WHERE p.Id = {0}";

        var result = await _db.Database
            .SqlQueryRaw<PlayerRawDto>(sql, query.PlayerId)
            .FirstOrDefaultAsync(cancellationToken);

        if (result == null)
        {
            return null;
        }

        return new PlayerDto
        {
            Id = result.Id,
            FirstName = result.FirstName ?? string.Empty,
            LastName = result.LastName ?? string.Empty,
            PhotoUrl = result.PhotoUrl,
            DateOfBirth = result.DateOfBirth?.ToDateTime(TimeOnly.MinValue),
            ClubId = result.ClubId,
            ClubName = result.ClubName,
            AgeGroupId = result.AgeGroupId,
            AgeGroupName = result.AgeGroupName,
            TeamId = result.TeamId,
            TeamName = result.TeamName,
            PreferredPosition = result.PreferredPosition
        };
    }
}

/// <summary>
/// DTO for raw SQL query result mapping
/// </summary>
public class PlayerRawDto
{
    public Guid Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhotoUrl { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public Guid? ClubId { get; set; }
    public string? ClubName { get; set; }
    public Guid? AgeGroupId { get; set; }
    public string? AgeGroupName { get; set; }
    public Guid? TeamId { get; set; }
    public string? TeamName { get; set; }
    public string? PreferredPosition { get; set; }
}

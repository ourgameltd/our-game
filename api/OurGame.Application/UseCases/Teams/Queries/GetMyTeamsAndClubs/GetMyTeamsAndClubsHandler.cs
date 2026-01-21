using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Teams.Queries.GetMyTeamsAndClubs.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Queries.GetMyTeamsAndClubs;

/// <summary>
/// Query to get teams accessible for the current user (coach assignments)
/// </summary>
public record GetMyTeamsAndClubsQuery(string AzureUserId) : IQuery<List<TeamAndClubsListItemDto>>;

/// <summary>
/// Handler for GetMyTeamsQuery
/// </summary>
public class GetMyTeamsAndClubsHandler : IRequestHandler<GetMyTeamsAndClubsQuery, List<TeamAndClubsListItemDto>>
{
    private readonly OurGameContext _db;

    public GetMyTeamsAndClubsHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<TeamAndClubsListItemDto>> Handle(GetMyTeamsAndClubsQuery query, CancellationToken cancellationToken)
    {
        // Raw SQL query to get teams for the current user via coach assignments
        var sql = @"
            SELECT DISTINCT
                t.Id,
                t.ClubId,
                t.AgeGroupId,
                t.Name,
                t.PrimaryColor,
                t.SecondaryColor,
                t.Season,
                t.IsArchived,
                ag.Name AS AgeGroupName,
                ag.DefaultSquadSize,
                cl.Name AS ClubName,
                cl.ShortName AS ClubShortName,
                cl.Logo AS ClubLogo,
                cl.PrimaryColor AS ClubPrimaryColor,
                cl.SecondaryColor AS ClubSecondaryColor,
                cl.AccentColor AS ClubAccentColor,
                cl.FoundedYear AS ClubFoundedYear
            FROM users u
            INNER JOIN coaches c ON c.user_id = u.Id
            INNER JOIN team_coaches tc ON tc.CoachId = c.Id
            INNER JOIN teams t ON tc.TeamId = t.Id
            LEFT JOIN age_groups ag ON t.AgeGroupId = ag.Id
            LEFT JOIN clubs cl ON t.ClubId = cl.Id
            WHERE u.AzureUserId = {0}
              AND t.IsArchived = 0
            ORDER BY ag.Name DESC, t.Name";

        var teamData = await _db.Database
            .SqlQueryRaw<TeamRawDto>(sql, query.AzureUserId)
            .ToListAsync(cancellationToken);

        if (teamData.Count == 0)
        {
            return new List<TeamAndClubsListItemDto>();
        }

        return teamData
            .Select(t => new TeamAndClubsListItemDto
            {
                Id = t.Id,
                ClubId = t.ClubId,
                AgeGroupId = t.AgeGroupId,
                AgeGroupName = t.AgeGroupName ?? string.Empty,
                Name = t.Name ?? string.Empty,
                Colors = new TeamColorsDto
                {
                    Primary = t.PrimaryColor ?? "#000000",
                    Secondary = t.SecondaryColor ?? "#FFFFFF"
                },
                Season = t.Season ?? string.Empty,
                SquadSize = t.DefaultSquadSize,
                IsArchived = t.IsArchived,
                Club = new TeamClubDto
                {
                    Name = t.ClubName ?? string.Empty,
                    ShortName = t.ClubShortName ?? string.Empty,
                    Logo = t.ClubLogo,
                    PrimaryColor = t.ClubPrimaryColor,
                    SecondaryColor = t.ClubSecondaryColor,
                    AccentColor = t.ClubAccentColor,
                    FoundedYear = t.ClubFoundedYear
                }
            })
            .ToList();
    }
}

/// <summary>
/// DTO for raw SQL query result
/// </summary>
class TeamRawDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public Guid AgeGroupId { get; set; }
    public string? Name { get; set; }
    public string? PrimaryColor { get; set; }
    public string? SecondaryColor { get; set; }
    public string? Season { get; set; }
    public bool IsArchived { get; set; }
    public string? AgeGroupName { get; set; }
    public int DefaultSquadSize { get; set; }
    public string? ClubName { get; set; }
    public string? ClubShortName { get; set; }
    public string? ClubLogo { get; set; }
    public string? ClubPrimaryColor { get; set; }
    public string? ClubSecondaryColor { get; set; }
    public string? ClubAccentColor { get; set; }
    public int? ClubFoundedYear { get; set; }
}

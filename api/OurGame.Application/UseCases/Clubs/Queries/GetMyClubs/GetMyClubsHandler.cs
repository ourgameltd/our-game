using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Clubs.Queries.GetMyClubs.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Queries.GetMyClubs;

/// <summary>
/// Query to get all clubs accessible to the current user
/// </summary>
public record GetMyClubsQuery(string AuthId) : IQuery<List<MyClubListItemDto>>;

/// <summary>
/// Handler for GetMyClubsQuery - derives club access from coach, player, and parent relationships
/// </summary>
public class GetMyClubsHandler : IRequestHandler<GetMyClubsQuery, List<MyClubListItemDto>>
{
    private readonly OurGameContext _db;

    public GetMyClubsHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<MyClubListItemDto>> Handle(GetMyClubsQuery query, CancellationToken cancellationToken)
    {
        var sql = @"
            WITH MyClubIds AS (
                -- Coach access: Users -> Coaches -> TeamCoaches -> Teams
                SELECT DISTINCT t.ClubId
                FROM Users u
                INNER JOIN Coaches c ON c.UserId = u.Id
                INNER JOIN TeamCoaches tc ON tc.CoachId = c.Id
                INNER JOIN Teams t ON tc.TeamId = t.Id
                WHERE u.AuthId = {0}

                UNION

                -- Player access: Users -> Players -> Players.ClubId
                SELECT DISTINCT p.ClubId
                FROM Users u
                INNER JOIN Players p ON p.UserId = u.Id
                WHERE u.AuthId = {0}

                UNION

                -- Parent access: Users -> PlayerParents -> Players.ClubId
                SELECT DISTINCT p.ClubId
                FROM Users u
                INNER JOIN PlayerParents pp ON pp.ParentUserId = u.Id
                INNER JOIN Players p ON pp.PlayerId = p.Id
                WHERE u.AuthId = {0}
            )
            SELECT
                c.Id,
                c.Name,
                c.ShortName,
                c.Logo,
                c.PrimaryColor,
                c.SecondaryColor,
                c.AccentColor,
                c.FoundedYear,
                COUNT(DISTINCT CASE WHEN t.IsArchived = 0 THEN t.Id END) AS TeamCount,
                COUNT(DISTINCT CASE WHEN p.IsArchived = 0 THEN p.Id END) AS PlayerCount
            FROM MyClubIds mci
            INNER JOIN Clubs c ON mci.ClubId = c.Id
            LEFT JOIN Teams t ON t.ClubId = c.Id
            LEFT JOIN PlayerTeams pt ON pt.TeamId = t.Id
            LEFT JOIN Players p ON p.Id = pt.PlayerId
            GROUP BY c.Id, c.Name, c.ShortName, c.Logo, c.PrimaryColor, c.SecondaryColor, c.AccentColor, c.FoundedYear
            ORDER BY c.Name";

        var results = await _db.Database
            .SqlQueryRaw<ClubQueryResult>(sql, query.AuthId)
            .ToListAsync(cancellationToken);

        return results
            .Select(r => new MyClubListItemDto
            {
                Id = r.Id,
                Name = r.Name ?? string.Empty,
                ShortName = r.ShortName ?? string.Empty,
                Logo = r.Logo,
                PrimaryColor = r.PrimaryColor,
                SecondaryColor = r.SecondaryColor,
                AccentColor = r.AccentColor,
                FoundedYear = r.FoundedYear,
                TeamCount = r.TeamCount,
                PlayerCount = r.PlayerCount
            })
            .ToList();
    }
}

/// <summary>
/// DTO for raw SQL query result
/// </summary>
class ClubQueryResult
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? ShortName { get; set; }
    public string? Logo { get; set; }
    public string? PrimaryColor { get; set; }
    public string? SecondaryColor { get; set; }
    public string? AccentColor { get; set; }
    public int? FoundedYear { get; set; }
    public int TeamCount { get; set; }
    public int PlayerCount { get; set; }
}

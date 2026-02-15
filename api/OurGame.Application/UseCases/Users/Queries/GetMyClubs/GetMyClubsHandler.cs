using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Users.Queries.GetMyClubs.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Users.Queries.GetMyClubs;

/// <summary>
/// Query to get all clubs the authenticated user has access to
/// </summary>
public record GetMyClubsQuery(string AzureUserId) : IQuery<List<MyClubListItemDto>>;

/// <summary>
/// Handler for GetMyClubsQuery - retrieves clubs where user is a coach, player, or parent
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
        // Get clubs where user is a coach, player, or parent of a player
        var sql = @"
            WITH UserClubs AS (
                -- Clubs where user is a coach
                SELECT DISTINCT c.Id
                FROM Users u
                INNER JOIN Coaches co ON u.Id = co.UserId
                INNER JOIN Clubs c ON co.ClubId = c.Id
                WHERE u.AuthId = {0}
                  AND co.IsArchived = 0
                
                UNION
                
                -- Clubs where user is a player
                SELECT DISTINCT c.Id
                FROM Users u
                INNER JOIN Players p ON u.Id = p.UserId
                INNER JOIN Clubs c ON p.ClubId = c.Id
                WHERE u.AuthId = {0}
                  AND p.IsArchived = 0
                
                UNION
                
                -- Clubs where user is a parent of a player
                SELECT DISTINCT c.Id
                FROM Users u
                INNER JOIN PlayerParents pp ON u.Id = pp.ParentUserId
                INNER JOIN Players p ON pp.PlayerId = p.Id
                INNER JOIN Clubs c ON p.ClubId = c.Id
                WHERE u.AuthId = {0}
                  AND p.IsArchived = 0
            )
            SELECT 
                c.Id,
                c.Name,
                c.ShortName,
                c.Logo,
                c.PrimaryColor,
                c.SecondaryColor,
                c.AccentColor,
                c.City,
                c.Country,
                (SELECT COUNT(*) FROM Teams t WHERE t.ClubId = c.Id AND t.IsArchived = 0) AS TeamCount,
                (SELECT COUNT(*) FROM Players p WHERE p.ClubId = c.Id AND p.IsArchived = 0) AS PlayerCount
            FROM UserClubs uc
            INNER JOIN Clubs c ON uc.Id = c.Id
            ORDER BY c.Name";

        var clubs = await _db.Database
            .SqlQueryRaw<MyClubRaw>(sql, query.AzureUserId)
            .ToListAsync(cancellationToken);

        return clubs.Select(club => new MyClubListItemDto(
            club.Id,
            club.Name,
            club.ShortName,
            club.Logo,
            club.PrimaryColor,
            club.SecondaryColor,
            club.AccentColor,
            club.City,
            club.Country,
            club.TeamCount,
            club.PlayerCount
        )).ToList();
    }
}

/// <summary>
/// Raw SQL query result for club data with counts
/// </summary>
public class MyClubRaw
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public string? Logo { get; set; }
    public string? PrimaryColor { get; set; }
    public string? SecondaryColor { get; set; }
    public string? AccentColor { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public int TeamCount { get; set; }
    public int PlayerCount { get; set; }
}

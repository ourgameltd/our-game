using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Players.Queries.GetMyChildren.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Queries.GetMyChildren;

/// <summary>
/// Query to get child players for the current authenticated parent user
/// </summary>
public record GetMyChildrenQuery(string AuthId) : IQuery<List<ChildPlayerDto>>;

/// <summary>
/// Handler for GetMyChildrenQuery
/// </summary>
public class GetMyChildrenHandler : IRequestHandler<GetMyChildrenQuery, List<ChildPlayerDto>>
{
    private readonly OurGameContext _db;

    public GetMyChildrenHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<ChildPlayerDto>> Handle(GetMyChildrenQuery query, CancellationToken cancellationToken)
    {
        // Raw SQL query to get child players for the authenticated parent user
        var sql = @"
            SELECT 
                p.Id,
                p.ClubId,
                p.FirstName,
                p.LastName,
                p.Nickname,
                p.DateOfBirth,
                p.Photo,
                p.AssociationId,
                p.PreferredPositions,
                p.OverallRating,
                p.IsArchived,
                c.Name AS ClubName,
                c.ShortName AS ClubShortName,
                c.Logo AS ClubLogo,
                c.PrimaryColor AS ClubPrimaryColor,
                c.SecondaryColor AS ClubSecondaryColor,
                c.AccentColor AS ClubAccentColor
            FROM Users u
            INNER JOIN PlayerParents pp ON pp.ParentUserId = u.Id
            INNER JOIN Players p ON pp.PlayerId = p.Id
            LEFT JOIN Clubs c ON p.ClubId = c.Id
            WHERE u.AuthId = {0}
              AND p.IsArchived = 0
            ORDER BY p.FirstName, p.LastName";

        var playerData = await _db.Database
            .SqlQueryRaw<PlayerRawDto>(sql, query.AuthId)
            .ToListAsync(cancellationToken);

        if (playerData.Count == 0)
        {
            return new List<ChildPlayerDto>();
        }

        // Get age groups for each player
        var playerIds = playerData.Select(p => p.Id).ToList();
        var ageGroupSql = @"
            SELECT 
                pag.PlayerId,
                ag.Id,
                ag.Name
            FROM player_age_groups pag
            INNER JOIN age_groups ag ON pag.AgeGroupId = ag.Id
            WHERE pag.PlayerId IN ({0})
            ORDER BY ag.Name";

        var ageGroupData = await _db.Database
            .SqlQueryRaw<PlayerAgeGroupRawDto>(
                ageGroupSql, 
                string.Join(",", playerIds.Select(id => $"'{id}'"))
            )
            .ToListAsync(cancellationToken);

        // Group age groups by player
        var ageGroupsByPlayer = ageGroupData
            .GroupBy(ag => ag.PlayerId)
            .ToDictionary(
                g => g.Key,
                g => g.Select(ag => new ChildPlayerAgeGroupDto
                {
                    Id = ag.Id,
                    Name = ag.Name ?? string.Empty
                }).ToList()
            );

        return playerData
            .Select(p => new ChildPlayerDto
            {
                Id = p.Id,
                ClubId = p.ClubId,
                FirstName = p.FirstName ?? string.Empty,
                LastName = p.LastName ?? string.Empty,
                Nickname = p.Nickname,
                DateOfBirth = p.DateOfBirth,
                Photo = p.Photo,
                AssociationId = p.AssociationId,
                PreferredPositions = p.PreferredPositions ?? string.Empty,
                OverallRating = p.OverallRating,
                IsArchived = p.IsArchived,
                Club = new ChildPlayerClubDto
                {
                    Name = p.ClubName ?? string.Empty,
                    ShortName = p.ClubShortName ?? string.Empty,
                    Logo = p.ClubLogo,
                    PrimaryColor = p.ClubPrimaryColor,
                    SecondaryColor = p.ClubSecondaryColor,
                    AccentColor = p.ClubAccentColor
                },
                AgeGroups = ageGroupsByPlayer.TryGetValue(p.Id, out var ageGroups) 
                    ? ageGroups 
                    : new List<ChildPlayerAgeGroupDto>()
            })
            .ToList();
    }
}

/// <summary>
/// DTO for raw SQL player query result
/// </summary>
class PlayerRawDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Nickname { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Photo { get; set; }
    public string? AssociationId { get; set; }
    public string? PreferredPositions { get; set; }
    public int? OverallRating { get; set; }
    public bool IsArchived { get; set; }
    public string? ClubName { get; set; }
    public string? ClubShortName { get; set; }
    public string? ClubLogo { get; set; }
    public string? ClubPrimaryColor { get; set; }
    public string? ClubSecondaryColor { get; set; }
    public string? ClubAccentColor { get; set; }
}

/// <summary>
/// DTO for raw SQL age group query result
/// </summary>
class PlayerAgeGroupRawDto
{
    public Guid PlayerId { get; set; }
    public Guid Id { get; set; }
    public string? Name { get; set; }
}

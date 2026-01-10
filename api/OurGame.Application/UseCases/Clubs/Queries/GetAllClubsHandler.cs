using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.UseCases.Clubs.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Queries;

/// <summary>
/// Handler for GetAllClubsQuery
/// </summary>
public class GetAllClubsHandler : IRequestHandler<GetAllClubsQuery, List<ClubSummaryDto>>
{
    private readonly OurGameContext _db;

    public GetAllClubsHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<ClubSummaryDto>> Handle(GetAllClubsQuery query, CancellationToken cancellationToken)
    {
        var clubs = await _db.Clubs
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .ToListAsync();

        return clubs.Select(c => new ClubSummaryDto
        {
            Id = c.Id,
            Name = c.Name,
            ShortName = c.ShortName,
            Logo = c.Logo,
            PrimaryColor = c.PrimaryColor,
            SecondaryColor = c.SecondaryColor,
            AccentColor = c.AccentColor,
            City = c.City,
            Country = c.Country
        }).ToList();
    }
}

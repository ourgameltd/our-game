using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Matches.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Matches.Queries;

/// <summary>
/// Handler for GetMatchLineupQuery
/// </summary>
public class GetMatchLineupHandler : IRequestHandler<GetMatchLineupQuery, MatchLineupDto>
{
    private readonly OurGameContext _db;

    public GetMatchLineupHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<MatchLineupDto> Handle(GetMatchLineupQuery query, CancellationToken cancellationToken)
    {
        var lineup = await _db.MatchLineups
            .AsNoTracking()
            .Include(ml => ml.LineupPlayers)
                .ThenInclude(lp => lp.Player)
            .FirstOrDefaultAsync(ml => ml.MatchId == query.MatchId);

        if (lineup == null)
        {
            throw new NotFoundException("Match lineup", query.MatchId);
        }

        return new MatchLineupDto
        {
            Id = lineup.Id,
            MatchId = lineup.MatchId,
            FormationId = lineup.FormationId,
            TacticId = lineup.TacticId,
            LineupPlayers = lineup.LineupPlayers.Select(lp => new LineupPlayerDto
            {
                Id = lp.Id,
                PlayerId = lp.PlayerId,
                PlayerFirstName = lp.Player?.FirstName ?? string.Empty,
                PlayerLastName = lp.Player?.LastName ?? string.Empty,
                Position = lp.Position ?? string.Empty,
                PositionIndex = null, // Not available in LineupPlayer entity
                IsStarting = lp.IsStarting,
                IsSubstitute = !lp.IsStarting, // Inferred from IsStarting
                IsCaptain = false // Not available in LineupPlayer entity
            }).ToList()
        };
    }
}

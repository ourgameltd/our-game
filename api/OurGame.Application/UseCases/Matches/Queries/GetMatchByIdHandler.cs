using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Matches.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Matches.Queries;

/// <summary>
/// Handler for GetMatchByIdQuery
/// </summary>
public class GetMatchByIdHandler : IRequestHandler<GetMatchByIdQuery, MatchDto>
{
    private readonly OurGameContext _db;

    public GetMatchByIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<MatchDto> Handle(GetMatchByIdQuery query, CancellationToken cancellationToken)
    {
        var match = await _db.Matches
            .AsNoTracking()
            .Include(m => m.MatchCoaches)
            .FirstOrDefaultAsync(m => m.Id == query.MatchId);

        if (match == null)
        {
            throw new NotFoundException("Match", query.MatchId);
        }

        return new MatchDto
        {
            Id = match.Id,
            TeamId = match.TeamId,
            SeasonId = match.SeasonId ?? string.Empty,
            SquadSize = match.SquadSize ?? string.Empty,
            Opposition = match.Opposition,
            MatchDate = match.MatchDate,
            MeetTime = match.MeetTime,
            KickOffTime = match.KickOffTime,
            Location = match.Location ?? string.Empty,
            IsHome = match.IsHome,
            Competition = match.Competition ?? string.Empty,
            PrimaryKitId = match.PrimaryKitId,
            SecondaryKitId = match.SecondaryKitId,
            GoalkeeperKitId = match.GoalkeeperKitId,
            HomeScore = match.HomeScore,
            AwayScore = match.AwayScore,
            Status = match.Status ?? string.Empty,
            IsLocked = match.IsLocked,
            Notes = match.Notes ?? string.Empty,
            WeatherCondition = match.WeatherCondition ?? string.Empty,
            WeatherTemperature = match.WeatherTemperature,
            CoachIds = match.MatchCoaches.Select(mc => mc.CoachId).ToList(),
            CreatedAt = match.CreatedAt,
            UpdatedAt = match.UpdatedAt
        };
    }
}

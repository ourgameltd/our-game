using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Players.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Queries;

/// <summary>
/// Handler for GetPlayerAttributesQuery
/// </summary>
public class GetPlayerAttributesHandler : IRequestHandler<GetPlayerAttributesQuery, PlayerAttributesDto>
{
    private readonly OurGameContext _db;

    public GetPlayerAttributesHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<PlayerAttributesDto> Handle(GetPlayerAttributesQuery query, CancellationToken cancellationToken)
    {
        var attributes = await _db.PlayerAttributes
            .AsNoTracking()
            .FirstOrDefaultAsync(pa => pa.PlayerId == query.PlayerId);

        if (attributes == null)
        {
            throw new NotFoundException("Player attributes", query.PlayerId);
        }

        return new PlayerAttributesDto
        {
            Id = attributes.Id,
            PlayerId = attributes.PlayerId,
            
            // Technical Skills
            BallControl = attributes.BallControl,
            Crossing = attributes.Crossing,
            WeakFoot = attributes.WeakFoot,
            Dribbling = attributes.Dribbling,
            Finishing = attributes.Finishing,
            FreeKick = attributes.FreeKick,
            Heading = attributes.Heading,
            LongPassing = attributes.LongPassing,
            LongShot = attributes.LongShot,
            Penalties = attributes.Penalties,
            ShortPassing = attributes.ShortPassing,
            ShotPower = attributes.ShotPower,
            SlidingTackle = attributes.SlidingTackle,
            StandingTackle = attributes.StandingTackle,
            Volleys = attributes.Volleys,
            
            // Physical
            Acceleration = attributes.Acceleration,
            Agility = attributes.Agility,
            Balance = attributes.Balance,
            Jumping = attributes.Jumping,
            Pace = attributes.Pace,
            Reactions = attributes.Reactions,
            SprintSpeed = attributes.SprintSpeed,
            Stamina = attributes.Stamina,
            Strength = attributes.Strength,
            
            // Mental
            Aggression = attributes.Aggression,
            AttackingPosition = attributes.AttackingPosition,
            Awareness = attributes.Awareness,
            Communication = attributes.Communication,
            Composure = attributes.Composure,
            DefensivePositioning = attributes.DefensivePositioning,
            Interceptions = attributes.Interceptions,
            Marking = attributes.Marking,
            Positivity = attributes.Positivity,
            Positioning = attributes.Positioning,
            Vision = attributes.Vision,
            
            UpdatedAt = attributes.UpdatedAt
        };
    }
}

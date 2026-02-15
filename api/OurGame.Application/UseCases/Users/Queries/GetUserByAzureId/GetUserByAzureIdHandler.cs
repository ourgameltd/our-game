using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Users.Queries.GetUserByAzureId;

/// <summary>
/// Query to get a user by Auth ID (Azure, Auth0, etc.)
/// </summary>
public record GetUserByAzureIdQuery(string AuthId) : IQuery<UserProfileDto?>;

/// <summary>
/// Handler for GetUserByAzureIdQuery
/// </summary>
public class GetUserByAzureIdHandler : IRequestHandler<GetUserByAzureIdQuery, UserProfileDto?>
{
    private readonly OurGameContext _db;

    public GetUserByAzureIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<UserProfileDto?> Handle(GetUserByAzureIdQuery query, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.AuthId == query.AuthId, cancellationToken);

        if (user == null)
        {
            return null;
        }

        // Check if user is associated with a player or coach
        var player = await _db.Players
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == user.Id, cancellationToken);

        var coach = await _db.Coaches
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.UserId == user.Id, cancellationToken);

        return new UserProfileDto
        {
            Id = user.Id,
            AuthId = user.AuthId,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Photo = user.Photo ?? string.Empty,
            Preferences = user.Preferences ?? string.Empty,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            PlayerId = player?.Id,
            CoachId = coach?.Id
        };
    }
}

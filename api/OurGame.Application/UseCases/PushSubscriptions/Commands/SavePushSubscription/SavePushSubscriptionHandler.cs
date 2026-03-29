using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.PushSubscriptions.Commands.SavePushSubscription.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.PushSubscriptions.Commands.SavePushSubscription;

/// <summary>
/// Command to save or update a push subscription for the authenticated user.
/// </summary>
public record SavePushSubscriptionCommand(string AzureUserId, SavePushSubscriptionRequest Dto) : IRequest;

/// <summary>
/// Handler that upserts the push subscription for the current user.
/// </summary>
public class SavePushSubscriptionHandler : IRequestHandler<SavePushSubscriptionCommand>
{
    private readonly OurGameContext _db;

    public SavePushSubscriptionHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task Handle(SavePushSubscriptionCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;

        if (string.IsNullOrWhiteSpace(dto.Endpoint))
            throw new ValidationException("Endpoint", "Endpoint is required.");

        if (dto.Keys == null || string.IsNullOrWhiteSpace(dto.Keys.P256dh) || string.IsNullOrWhiteSpace(dto.Keys.Auth))
            throw new ValidationException("Keys", "Subscription keys (p256dh and auth) are required.");

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.AuthId == command.AzureUserId, cancellationToken)
            ?? throw new NotFoundException("User", command.AzureUserId);

        // Upsert by endpoint – replace any existing subscription with same endpoint
        var existing = await _db.PushSubscriptions
            .FirstOrDefaultAsync(ps => ps.Endpoint == dto.Endpoint, cancellationToken);

        if (existing != null)
        {
            // Update keys in case they rotated
            existing.P256dh = dto.Keys.P256dh;
            existing.Auth = dto.Keys.Auth;
            existing.UserId = user.Id;
        }
        else
        {
            _db.PushSubscriptions.Add(new PushSubscription
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Endpoint = dto.Endpoint,
                P256dh = dto.Keys.P256dh,
                Auth = dto.Keys.Auth,
                CreatedAt = DateTime.UtcNow,
            });
        }

        await _db.SaveChangesAsync(cancellationToken);
    }
}

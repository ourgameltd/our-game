using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.UseCases.PushSubscriptions.Commands.DeletePushSubscription.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.PushSubscriptions.Commands.DeletePushSubscription;

/// <summary>
/// Command to remove a push subscription for the authenticated user.
/// </summary>
public record DeletePushSubscriptionCommand(string AzureUserId, DeletePushSubscriptionRequest Dto) : IRequest;

/// <summary>
/// Handler that removes the push subscription matching the given endpoint for the current user.
/// </summary>
public class DeletePushSubscriptionHandler : IRequestHandler<DeletePushSubscriptionCommand>
{
    private readonly OurGameContext _db;

    public DeletePushSubscriptionHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task Handle(DeletePushSubscriptionCommand command, CancellationToken cancellationToken)
    {
        var subscription = await _db.PushSubscriptions
            .Include(ps => ps.User)
            .FirstOrDefaultAsync(
                ps => ps.Endpoint == command.Dto.Endpoint && ps.User.AuthId == command.AzureUserId,
                cancellationToken);

        if (subscription != null)
        {
            _db.PushSubscriptions.Remove(subscription);
            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}

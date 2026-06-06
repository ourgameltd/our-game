using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OurGame.Application.Abstractions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Users.Commands.SyncProfileFromB2C;

/// <summary>
/// Fetches the latest email and name from the B2C directory and overwrites the stored values.
/// Useful when the local record was created with a placeholder email or stale claims.
/// </summary>
public class SyncProfileFromB2CHandler : IRequestHandler<SyncProfileFromB2CCommand, UserProfileDto>
{
    private readonly OurGameContext _db;
    private readonly IMediator _mediator;
    private readonly IB2CUserService _b2CUserService;
    private readonly ILogger<SyncProfileFromB2CHandler> _logger;

    public SyncProfileFromB2CHandler(
        OurGameContext db,
        IMediator mediator,
        IB2CUserService b2CUserService,
        ILogger<SyncProfileFromB2CHandler> logger)
    {
        _db = db;
        _mediator = mediator;
        _b2CUserService = b2CUserService;
        _logger = logger;
    }

    public async Task<UserProfileDto> Handle(SyncProfileFromB2CCommand command, CancellationToken cancellationToken)
    {
        var authId = command.AuthId;

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.AuthId == authId, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException("User", authId);
        }

        var b2CProfile = await _b2CUserService.GetUserAsync(authId, cancellationToken);

        if (b2CProfile == null)
        {
            _logger.LogWarning("B2C profile not found for user {AuthId}; no changes made", authId);
            // Return the current stored profile unchanged rather than clearing data.
            var unchanged = await _mediator.Send(new GetUserByAzureIdQuery(authId), cancellationToken);
            return unchanged ?? throw new InvalidOperationException("Failed to retrieve user profile.");
        }

        var now = DateTime.UtcNow;
        var email = string.IsNullOrWhiteSpace(b2CProfile.Email) ? user.Email : b2CProfile.Email.Trim();
        var firstName = string.IsNullOrWhiteSpace(b2CProfile.GivenName) ? user.FirstName : b2CProfile.GivenName.Trim();
        var lastName = string.IsNullOrWhiteSpace(b2CProfile.Surname) ? user.LastName : b2CProfile.Surname.Trim();

        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE Users
            SET
                Email     = {email},
                FirstName = {firstName},
                LastName  = {lastName},
                UpdatedAt = {now}
            WHERE Id = {user.Id}
        ", cancellationToken);

        _logger.LogInformation("Synced B2C profile for user {UserId}: email={Email}", user.Id, email);

        var updated = await _mediator.Send(new GetUserByAzureIdQuery(authId), cancellationToken);
        return updated ?? throw new InvalidOperationException("Failed to retrieve updated user profile.");
    }
}

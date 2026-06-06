using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Users.Commands.EnsureUserByAuthId;

/// <summary>
/// Creates a new user row for first-time authenticated users, or returns the existing profile.
/// When identity claims are absent (e.g. in production on Azure Static Web Apps), the handler
/// enriches the profile by querying the Azure AD B2C directory via <see cref="IB2CUserService"/>.
/// </summary>
public class EnsureUserByAuthIdHandler : IRequestHandler<EnsureUserByAuthIdCommand, UserProfileDto>
{
    private readonly OurGameContext _db;
    private readonly IMediator _mediator;
    private readonly IB2CUserService _b2CUserService;

    public EnsureUserByAuthIdHandler(OurGameContext db, IMediator mediator, IB2CUserService b2CUserService)
    {
        _db = db;
        _mediator = mediator;
        _b2CUserService = b2CUserService;
    }

    public async Task<UserProfileDto> Handle(EnsureUserByAuthIdCommand command, CancellationToken cancellationToken)
    {
        var authId = command.AuthId;

        var existing = await _mediator.Send(new GetUserByAzureIdQuery(authId), cancellationToken);
        if (existing != null)
        {
            return existing;
        }

        // When SWA does not forward extended claims (production), enrich from B2C Graph API.
        var email = command.Email;
        var givenName = command.GivenName;
        var surname = command.Surname;
        var displayName = command.DisplayName;

        if (string.IsNullOrWhiteSpace(email) && string.IsNullOrWhiteSpace(givenName) && string.IsNullOrWhiteSpace(surname))
        {
            var b2CProfile = await _b2CUserService.GetUserAsync(authId, cancellationToken);
            if (b2CProfile != null)
            {
                email ??= b2CProfile.Email;
                givenName ??= b2CProfile.GivenName;
                surname ??= b2CProfile.Surname;
                displayName ??= b2CProfile.DisplayName;
            }
        }

        var now = DateTime.UtcNow;
        var (firstName, lastName) = ResolveNames(givenName, surname, displayName);
        var resolvedEmail = ResolveEmail(email, displayName, authId);

        _db.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            AuthId = authId,
            Email = resolvedEmail,
            FirstName = firstName,
            LastName = lastName,
            Photo = string.Empty,
            Preferences = "{}",
            IsAdmin = false,
            CreatedAt = now,
            UpdatedAt = now
        });

        try
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            // If another request created the same user concurrently, fall through and re-query.
        }

        var ensured = await _mediator.Send(new GetUserByAzureIdQuery(authId), cancellationToken);
        if (ensured == null)
        {
            throw new InvalidOperationException("Failed to ensure current user profile.");
        }

        return ensured;
    }

    private static string ResolveEmail(string? email, string? displayName, string authId)
    {
        if (!string.IsNullOrWhiteSpace(email))
        {
            return email.Trim();
        }

        if (!string.IsNullOrWhiteSpace(displayName) && displayName.Contains('@'))
        {
            return displayName.Trim();
        }

        return $"{authId}@ourgame.local";
    }

    private static (string FirstName, string LastName) SplitDisplayName(string? displayName)
    {
        if (string.IsNullOrWhiteSpace(displayName))
        {
            return ("User", string.Empty);
        }

        var parts = displayName
            .Trim()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        if (parts.Length == 0)
        {
            return ("User", string.Empty);
        }

        if (parts.Length == 1)
        {
            return (parts[0], string.Empty);
        }

        return (parts[0], string.Join(' ', parts.Skip(1)));
    }

    private static (string FirstName, string LastName) ResolveNames(string? givenName, string? surname, string? displayName)
    {
        var first = givenName?.Trim() ?? string.Empty;
        var last = surname?.Trim() ?? string.Empty;

        if (!string.IsNullOrWhiteSpace(first) || !string.IsNullOrWhiteSpace(last))
        {
            return (
                string.IsNullOrWhiteSpace(first) ? "User" : first,
                last);
        }

        return SplitDisplayName(displayName);
    }
}

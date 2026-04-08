using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Users.Commands.EnsureUserByAuthId;

/// <summary>
/// Creates a new user row for first-time authenticated users, or returns the existing profile.
/// </summary>
public class EnsureUserByAuthIdHandler : IRequestHandler<EnsureUserByAuthIdCommand, UserProfileDto>
{
    private readonly OurGameContext _db;
    private readonly IMediator _mediator;

    public EnsureUserByAuthIdHandler(OurGameContext db, IMediator mediator)
    {
        _db = db;
        _mediator = mediator;
    }

    public async Task<UserProfileDto> Handle(EnsureUserByAuthIdCommand command, CancellationToken cancellationToken)
    {
        var authId = command.AuthId;

        var existing = await _mediator.Send(new GetUserByAzureIdQuery(authId), cancellationToken);
        if (existing != null)
        {
            return existing;
        }

        var now = DateTime.UtcNow;
        var (firstName, lastName) = ResolveNames(command.GivenName, command.Surname, command.DisplayName);
        var email = ResolveEmail(command.Email, command.DisplayName, authId);

        _db.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            AuthId = authId,
            Email = email,
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

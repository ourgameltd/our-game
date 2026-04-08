using MediatR;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs;

namespace OurGame.Application.UseCases.Users.Commands.EnsureUserByAuthId;

/// <summary>
/// Ensures a user record exists for the authenticated identity provider user.
/// Returns the existing or newly created user profile.
/// </summary>
public record EnsureUserByAuthIdCommand(
    string AuthId,
    string? Email,
    string? DisplayName,
    string? GivenName,
    string? Surname) : IRequest<UserProfileDto>;

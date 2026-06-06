using MediatR;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs;

namespace OurGame.Application.UseCases.Users.Commands.SyncProfileFromB2C;

/// <summary>
/// Forces a refresh of the user's email, first name, and last name from the B2C directory.
/// </summary>
public record SyncProfileFromB2CCommand(string AuthId) : IRequest<UserProfileDto>;

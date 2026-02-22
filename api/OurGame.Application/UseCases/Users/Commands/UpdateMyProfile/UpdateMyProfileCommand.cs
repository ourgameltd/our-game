using MediatR;
using OurGame.Application.UseCases.Users.Commands.UpdateMyProfile.DTOs;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs;

namespace OurGame.Application.UseCases.Users.Commands.UpdateMyProfile;

/// <summary>
/// Command to update the current user's profile information.
/// </summary>
public record UpdateMyProfileCommand(string AuthId, UpdateMyProfileRequestDto Request) : IRequest<UserProfileDto>;

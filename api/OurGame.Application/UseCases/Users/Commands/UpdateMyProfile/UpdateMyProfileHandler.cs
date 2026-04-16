using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Users.Commands.UpdateMyProfile;

/// <summary>
/// Handler for updating the current user's profile information.
/// Validates input and updates the user entity. Email is read-only from the identity provider.
/// </summary>
public class UpdateMyProfileHandler : IRequestHandler<UpdateMyProfileCommand, UserProfileDto>
{
    private readonly OurGameContext _db;
    private readonly IMediator _mediator;
    private readonly IBlobStorageService _blobStorage;

    public UpdateMyProfileHandler(OurGameContext db, IMediator mediator, IBlobStorageService blobStorage)
    {
        _db = db;
        _mediator = mediator;
        _blobStorage = blobStorage;
    }

    public async Task<UserProfileDto> Handle(UpdateMyProfileCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Request;
        var authId = command.AuthId;

        // 1. Fetch user by authId
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.AuthId == authId, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException("User", authId);
        }

        // 2. Validate inputs
        var errors = new Dictionary<string, string[]>();

        // Trim input values
        var firstName = dto.FirstName?.Trim() ?? string.Empty;
        var lastName = dto.LastName?.Trim() ?? string.Empty;

        // Required field validation
        if (string.IsNullOrWhiteSpace(firstName))
        {
            errors.Add("FirstName", new[] { "First name is required." });
        }

        if (string.IsNullOrWhiteSpace(lastName))
        {
            errors.Add("LastName", new[] { "Last name is required." });
        }

        // Length validation
        if (firstName.Length > 100)
        {
            errors.Add("FirstName", new[] { "First name must not exceed 100 characters." });
        }

        if (lastName.Length > 100)
        {
            errors.Add("LastName", new[] { "Last name must not exceed 100 characters." });
        }

        // 3. If validation fails, throw exception
        if (errors.Count > 0)
        {
            throw new OurGame.Application.Abstractions.Exceptions.ValidationException(errors);
        }

        // 4. Update user entity (email is read-only from identity provider)
        var now = DateTime.UtcNow;

        // Upload new photo to blob storage if provided as a data URI; pass-through for URLs.
        // When Photo is null we preserve the existing value; empty string clears it.
        string? photo;
        if (dto.Photo == null)
        {
            photo = user.Photo;
        }
        else if (dto.Photo.Length == 0)
        {
            photo = string.Empty;
        }
        else
        {
            photo = await _blobStorage.UploadImageAsync(dto.Photo, "user-photos", user.Id.ToString(), cancellationToken);
        }

        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE Users
            SET 
                FirstName = {firstName},
                LastName = {lastName},
                Photo = {photo},
                UpdatedAt = {now}
            WHERE Id = {user.Id}
        ", cancellationToken);

        // 5. Return updated profile by reusing existing query handler
        var updatedProfile = await _mediator.Send(new GetUserByAzureIdQuery(authId), cancellationToken);

        if (updatedProfile == null)
        {
            throw new Exception("Failed to retrieve updated user profile.");
        }

        return updatedProfile;
    }
}

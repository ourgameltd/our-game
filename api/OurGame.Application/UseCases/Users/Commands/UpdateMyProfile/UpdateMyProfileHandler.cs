using System.ComponentModel.DataAnnotations;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Users.Commands.UpdateMyProfile;

/// <summary>
/// Handler for updating the current user's profile information.
/// Validates input, ensures email uniqueness, and updates the user entity.
/// </summary>
public class UpdateMyProfileHandler : IRequestHandler<UpdateMyProfileCommand, UserProfileDto>
{
    private static readonly EmailAddressAttribute EmailValidator = new();
    
    private readonly OurGameContext _db;
    private readonly IMediator _mediator;

    public UpdateMyProfileHandler(OurGameContext db, IMediator mediator)
    {
        _db = db;
        _mediator = mediator;
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
        var email = dto.Email?.Trim() ?? string.Empty;

        // Required field validation
        if (string.IsNullOrWhiteSpace(firstName))
        {
            errors.Add("FirstName", new[] { "First name is required." });
        }

        if (string.IsNullOrWhiteSpace(lastName))
        {
            errors.Add("LastName", new[] { "Last name is required." });
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            errors.Add("Email", new[] { "Email is required." });
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

        if (email.Length > 255)
        {
            errors.Add("Email", new[] { "Email must not exceed 255 characters." });
        }

        // Email format validation
        if (!string.IsNullOrWhiteSpace(email) && !EmailValidator.IsValid(email))
        {
            errors.Add("Email", new[] { "Email must be a valid email address." });
        }

        // Email uniqueness validation (case-insensitive, excluding current user)
        if (!string.IsNullOrWhiteSpace(email))
        {
            var emailLower = email.ToLowerInvariant();
            var emailExists = await _db.Users
                .Where(u => u.Id != user.Id)
                .AnyAsync(u => u.Email.ToLower() == emailLower, cancellationToken);

            if (emailExists)
            {
                errors.Add("Email", new[] { "This email address is already in use by another user." });
            }
        }

        // 3. If validation fails, throw exception
        if (errors.Count > 0)
        {
            throw new OurGame.Application.Abstractions.Exceptions.ValidationException(errors);
        }

        // 4. Update user entity
        var now = DateTime.UtcNow;
        var emailNormalized = email.ToLowerInvariant();

        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE Users
            SET 
                FirstName = {firstName},
                LastName = {lastName},
                Email = {emailNormalized},
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

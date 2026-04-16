using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Users.Commands.UpdateMyProfile.DTOs;

/// <summary>
/// Request DTO for updating the current user's profile information.
/// </summary>
public record UpdateMyProfileRequestDto
{
    /// <summary>
    /// User's first name.
    /// </summary>
    [Required]
    [StringLength(100)]
    public string FirstName { get; init; } = string.Empty;

    /// <summary>
    /// User's last name.
    /// </summary>
    [Required]
    [StringLength(100)]
    public string LastName { get; init; } = string.Empty;

    /// <summary>
    /// Profile photo as a base64 data URI (e.g. "data:image/png;base64,...") or an existing URL.
    /// Pass an empty string to clear the photo.
    /// </summary>
    public string? Photo { get; init; }
}

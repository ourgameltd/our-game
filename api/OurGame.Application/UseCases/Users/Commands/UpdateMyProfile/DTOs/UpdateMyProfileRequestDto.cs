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
    /// User's email address.
    /// </summary>
    [Required]
    [StringLength(255)]
    [EmailAddress]
    public string Email { get; init; } = string.Empty;
}

using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Clubs.Commands.UpdateClubById.DTOs;

/// <summary>
/// Request DTO for updating an existing club's details.
/// Contains all mutable fields for a full PUT update.
/// </summary>
public record UpdateClubRequestDto
{
    /// <summary>
    /// Full name of the club (e.g. "Vale Football Club").
    /// </summary>
    [Required]
    [StringLength(200)]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Short / abbreviated club name (e.g. "Vale FC").
    /// </summary>
    [Required]
    [StringLength(50)]
    public string ShortName { get; init; } = string.Empty;

    /// <summary>
    /// Club logo as a Data URI string (e.g. "data:image/png;base64,...").
    /// </summary>
    public string? Logo { get; init; }

    /// <summary>
    /// Primary club color as a hex string (e.g. "#FF0000").
    /// </summary>
    [StringLength(7)]
    public string? PrimaryColor { get; init; }

    /// <summary>
    /// Secondary club color as a hex string (e.g. "#FFFFFF").
    /// </summary>
    [StringLength(7)]
    public string? SecondaryColor { get; init; }

    /// <summary>
    /// Accent club color as a hex string (e.g. "#CCCCCC").
    /// </summary>
    [StringLength(7)]
    public string? AccentColor { get; init; }

    /// <summary>
    /// City where the club is based.
    /// </summary>
    [Required]
    [StringLength(100)]
    public string City { get; init; } = string.Empty;

    /// <summary>
    /// Country where the club is based.
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Country { get; init; } = string.Empty;

    /// <summary>
    /// Name of the club's home venue / ground.
    /// </summary>
    [Required]
    [StringLength(200)]
    public string Venue { get; init; } = string.Empty;

    /// <summary>
    /// Full address of the club's home venue.
    /// </summary>
    [StringLength(500)]
    public string? Address { get; init; }

    /// <summary>
    /// Year the club was founded (e.g. 1920). Must be between 1850 and 2026.
    /// </summary>
    public int? Founded { get; init; }

    /// <summary>
    /// Club history / background narrative.
    /// </summary>
    [StringLength(5000)]
    public string? History { get; init; }

    /// <summary>
    /// Club ethos / mission statement.
    /// </summary>
    [StringLength(5000)]
    public string? Ethos { get; init; }

    /// <summary>
    /// Club principles and values. Stored as a JSON array in the database.
    /// </summary>
    public string[]? Principles { get; init; }
}

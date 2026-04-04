using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Clubs.Commands.CreateClub.DTOs;

public record CreateClubRequestDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string ShortName { get; init; } = string.Empty;

    public string? Logo { get; init; }

    [StringLength(7)]
    public string? PrimaryColor { get; init; }

    [StringLength(7)]
    public string? SecondaryColor { get; init; }

    [StringLength(7)]
    public string? AccentColor { get; init; }

    [Required]
    [StringLength(100)]
    public string City { get; init; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Country { get; init; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string Venue { get; init; } = string.Empty;

    [StringLength(500)]
    public string? Address { get; init; }

    public int? Founded { get; init; }

    [StringLength(5000)]
    public string? History { get; init; }

    [StringLength(5000)]
    public string? Ethos { get; init; }

    public string[]? Principles { get; init; }
}

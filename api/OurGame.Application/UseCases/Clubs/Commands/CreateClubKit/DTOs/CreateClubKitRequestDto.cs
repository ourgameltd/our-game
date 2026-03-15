using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Clubs.Commands.CreateClubKit.DTOs;

/// <summary>
/// Request DTO for creating a new club kit.
/// </summary>
public record CreateClubKitRequestDto
{
    [Required]
    [StringLength(50)]
    public string Type { get; init; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [StringLength(7)]
    public string ShirtColor { get; init; } = string.Empty;

    [Required]
    [StringLength(7)]
    public string ShortsColor { get; init; } = string.Empty;

    [Required]
    [StringLength(7)]
    public string SocksColor { get; init; } = string.Empty;

    [StringLength(50)]
    public string? Season { get; init; }

    public bool IsActive { get; init; } = true;
}
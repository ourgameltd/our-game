using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Clubs.Commands.UpdateClubKit.DTOs;

/// <summary>
/// Request DTO for updating an existing club kit.
/// </summary>
public record UpdateClubKitRequestDto
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
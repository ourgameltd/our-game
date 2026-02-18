using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Teams.Commands.CreateTeamKit.DTOs;

/// <summary>
/// Request DTO for creating a new team kit.
/// </summary>
public record CreateTeamKitRequestDto
{
    /// <summary>
    /// Kit type (home, away, third, goalkeeper, training).
    /// </summary>
    [Required]
    [StringLength(50)]
    public string Type { get; init; } = string.Empty;

    /// <summary>
    /// Kit name (e.g. "2024/25 Home Kit").
    /// </summary>
    [Required]
    [StringLength(200)]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Shirt color as hex string (e.g. "#FF0000").
    /// </summary>
    [Required]
    [StringLength(7)]
    public string ShirtColor { get; init; } = string.Empty;

    /// <summary>
    /// Shorts color as hex string (e.g. "#FFFFFF").
    /// </summary>
    [Required]
    [StringLength(7)]
    public string ShortsColor { get; init; } = string.Empty;

    /// <summary>
    /// Socks color as hex string (e.g. "#000000").
    /// </summary>
    [Required]
    [StringLength(7)]
    public string SocksColor { get; init; } = string.Empty;

    /// <summary>
    /// Season the kit is for (e.g. "2024/25").
    /// </summary>
    [StringLength(50)]
    public string? Season { get; init; }

    /// <summary>
    /// Whether the kit is currently active.
    /// </summary>
    public bool IsActive { get; init; } = true;
}

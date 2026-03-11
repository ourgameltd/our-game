using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Matches.Commands.CreateMatch.DTOs;

/// <summary>
/// Request DTO for creating match attendance record
/// </summary>
public record CreateMatchAttendanceRequest
{
    [Required]
    public Guid PlayerId { get; init; }

    [Required]
    [StringLength(50)]
    public string Status { get; init; } = string.Empty;

    [StringLength(500)]
    public string? Notes { get; init; }
}

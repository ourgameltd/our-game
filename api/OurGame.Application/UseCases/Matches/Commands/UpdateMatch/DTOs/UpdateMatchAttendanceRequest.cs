using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Matches.Commands.UpdateMatch.DTOs;

/// <summary>
/// Request DTO for updating match attendance record
/// </summary>
public record UpdateMatchAttendanceRequest
{
    [Required]
    public Guid PlayerId { get; init; }

    [Required]
    [StringLength(50)]
    public string Status { get; init; } = string.Empty;

    [StringLength(500)]
    public string? Notes { get; init; }
}

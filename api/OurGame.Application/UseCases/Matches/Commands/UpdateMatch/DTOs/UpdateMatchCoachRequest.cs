using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Matches.Commands.UpdateMatch.DTOs;

/// <summary>
/// Coach assigned to the match with attendance status
/// </summary>
public record UpdateMatchCoachRequest
{
    [Required]
    public Guid CoachId { get; init; }

    [StringLength(50)]
    public string Status { get; init; } = "pending";

    [StringLength(500)]
    public string? Notes { get; init; }
}

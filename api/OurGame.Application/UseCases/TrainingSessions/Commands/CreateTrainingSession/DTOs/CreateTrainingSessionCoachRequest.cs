using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.TrainingSessions.Commands.CreateTrainingSession.DTOs;

public record CreateTrainingSessionCoachRequest
{
    [Required]
    public Guid CoachId { get; init; }

    [StringLength(50)]
    public string Status { get; init; } = "pending";

    [StringLength(500)]
    public string? Notes { get; init; }
}

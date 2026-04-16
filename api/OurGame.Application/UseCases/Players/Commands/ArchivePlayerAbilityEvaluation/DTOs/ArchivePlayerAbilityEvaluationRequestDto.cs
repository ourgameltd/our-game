namespace OurGame.Application.UseCases.Players.Commands.ArchivePlayerAbilityEvaluation.DTOs;

/// <summary>
/// Request DTO for archiving or unarchiving a player ability evaluation.
/// </summary>
public record ArchivePlayerAbilityEvaluationRequestDto
{
    /// <summary>
    /// Whether to archive (true) or unarchive (false) the evaluation.
    /// Archived evaluations are excluded from rating calculations.
    /// </summary>
    public bool IsArchived { get; init; }
}

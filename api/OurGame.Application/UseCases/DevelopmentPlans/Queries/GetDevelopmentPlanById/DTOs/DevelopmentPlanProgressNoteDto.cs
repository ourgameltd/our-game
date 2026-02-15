namespace OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById.DTOs;

/// <summary>
/// DTO for a development plan progress note
/// </summary>
public record DevelopmentPlanProgressNoteDto
{
    /// <summary>
    /// Unique identifier for the note
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Date the note was added
    /// </summary>
    public DateTime NoteDate { get; init; }

    /// <summary>
    /// Note content
    /// </summary>
    public string Note { get; init; } = string.Empty;

    /// <summary>
    /// ID of the coach who added the note
    /// </summary>
    public Guid? CoachId { get; init; }

    /// <summary>
    /// Name of the coach who added the note
    /// </summary>
    public string? CoachName { get; init; }
}

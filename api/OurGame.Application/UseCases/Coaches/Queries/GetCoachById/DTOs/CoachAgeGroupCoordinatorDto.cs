namespace OurGame.Application.UseCases.Coaches.Queries.GetCoachById.DTOs;

/// <summary>
/// DTO representing an age group coordinator role for a coach
/// </summary>
public class CoachAgeGroupCoordinatorDto
{
    /// <summary>
    /// The unique identifier of the age group
    /// </summary>
    public Guid AgeGroupId { get; set; }

    /// <summary>
    /// The name of the age group
    /// </summary>
    public string AgeGroupName { get; set; } = string.Empty;
}

namespace OurGame.Application.UseCases.Drills.DTOs;

/// <summary>
/// Competency linked to a drill (one of the 9 fixed taxonomy competencies)
/// </summary>
public class CompetencyDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }
}

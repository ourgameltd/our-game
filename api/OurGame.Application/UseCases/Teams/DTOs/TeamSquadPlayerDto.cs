namespace OurGame.Application.UseCases.Teams.DTOs;

/// <summary>
/// Player in a team squad with squad number and position
/// </summary>
public class TeamSquadPlayerDto
{
    public Guid PlayerId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Photo { get; set; } = string.Empty;
    public int? SquadNumber { get; set; }
    public string PreferredPosition { get; set; } = string.Empty;
    public List<string> PreferredPositions { get; set; } = new();
    public int? OverallRating { get; set; }
    public DateOnly? DateOfBirth { get; set; }
}

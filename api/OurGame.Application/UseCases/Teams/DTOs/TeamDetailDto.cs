namespace OurGame.Application.UseCases.Teams.DTOs;

/// <summary>
/// Detailed information about a team
/// </summary>
public class TeamDetailDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public Guid AgeGroupId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public string Season { get; set; } = string.Empty;
    public Guid? FormationId { get; set; }
    public string PrimaryColor { get; set; } = string.Empty;
    public string SecondaryColor { get; set; } = string.Empty;
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<Guid> CoachIds { get; set; } = new();
    public TeamStatisticsDto? Statistics { get; set; }
}

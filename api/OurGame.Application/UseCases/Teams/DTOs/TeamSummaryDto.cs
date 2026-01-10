namespace OurGame.Application.UseCases.Teams.DTOs;

/// <summary>
/// Summary information about a team
/// </summary>
public class TeamSummaryDto
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
    public int PlayerCount { get; set; }
}

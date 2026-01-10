namespace OurGame.Application.UseCases.AgeGroups.DTOs;

/// <summary>
/// Age group information
/// </summary>
public class AgeGroupDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public List<string> Seasons { get; set; } = new();
    public string DefaultSquadSize { get; set; } = string.Empty;
    public int TeamCount { get; set; }
    public int PlayerCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

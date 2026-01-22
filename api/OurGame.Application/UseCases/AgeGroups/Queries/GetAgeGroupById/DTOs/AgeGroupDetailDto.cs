namespace OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupById.DTOs;

/// <summary>
/// DTO for age group detail
/// </summary>
public class AgeGroupDetailDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public string Season { get; set; } = string.Empty;
    public List<string> Seasons { get; set; } = new();
    public string DefaultSeason { get; set; } = string.Empty;
    public int DefaultSquadSize { get; set; }
    public string? Description { get; set; }
    public bool IsArchived { get; set; }
}

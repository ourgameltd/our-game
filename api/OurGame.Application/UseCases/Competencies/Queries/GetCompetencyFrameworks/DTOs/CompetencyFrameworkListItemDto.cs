using OurGame.Persistence.Enums;

namespace OurGame.Application.UseCases.Competencies.Queries.GetCompetencyFrameworks.DTOs;

public class CompetencyFrameworkListItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsSystemDefault { get; set; }
    public CompetencyFrameworkScope Scope { get; set; }
    public Guid? OwnerClubId { get; set; }
    public Guid? OwnerAgeGroupId { get; set; }
    public Guid? OwnerTeamId { get; set; }
    public Guid? SourceFrameworkId { get; set; }
    public decimal UpliftPercent { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int AssignmentCount { get; set; }
}

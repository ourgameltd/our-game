using OurGame.Persistence.Enums;

namespace OurGame.Application.UseCases.Competencies.Queries.GetPlayerCompetencyEvaluations.DTOs;

public class PlayerCompetencyEvaluationSummaryDto
{
    public Guid Id { get; set; }
    public DateTime EvaluatedAt { get; set; }
    public string CoachName { get; set; } = string.Empty;
    public string CoachNotes { get; set; } = string.Empty;
    public CompetencyBand? OverallBand { get; set; }
    public bool IsArchived { get; set; }
    public List<EvaluationBandDto> Levels { get; set; } = new();
}

public class EvaluationBandDto
{
    public Guid CompetencyId { get; set; }
    public string CompetencyName { get; set; } = string.Empty;
    public string? CompetencyGoalkeeperName { get; set; }
    public int DisplayOrder { get; set; }
    public CompetencyBand Band { get; set; }
}

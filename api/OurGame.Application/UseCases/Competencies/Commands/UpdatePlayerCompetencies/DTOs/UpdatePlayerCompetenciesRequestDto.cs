using OurGame.Persistence.Enums;

namespace OurGame.Application.UseCases.Competencies.Commands.UpdatePlayerCompetencies.DTOs;

public class UpdatePlayerCompetenciesRequestDto
{
    public List<PlayerCompetencyBandInputDto> Bands { get; set; } = new();
    public string? CoachNotes { get; set; }
}

public class PlayerCompetencyBandInputDto
{
    public Guid CompetencyId { get; set; }
    public CompetencyBand Band { get; set; }
}

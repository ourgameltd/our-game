using OurGame.Persistence.Enums;

namespace OurGame.Application.UseCases.Competencies.Queries.GetPlayerCompetencies.DTOs;

public class PlayerCompetenciesDto
{
    public Guid PlayerId { get; set; }
    public string PlayerName { get; set; } = string.Empty;
    public int? OverallRating { get; set; }
    public CompetencyBand? OverallBand { get; set; }

    /// <summary>True when the player's primary preferred position is GK; the UI then
    /// defaults to goalkeeper competency names and rubrics.</summary>
    public bool IsGoalkeeper { get; set; }

    public List<PlayerCompetencyBandDto> Competencies { get; set; } = new();
    public List<PlayerTeamScoreDto> TeamScores { get; set; } = new();
}

public class PlayerCompetencyBandDto
{
    public Guid CompetencyId { get; set; }
    public string CompetencyName { get; set; } = string.Empty;
    public string? CompetencyGoalkeeperName { get; set; }
    public int DisplayOrder { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public CompetencyBand? Band { get; set; }
    public Dictionary<CompetencyBand, string> Descriptions { get; set; } = new();
    public Dictionary<CompetencyBand, string> GoalkeeperDescriptions { get; set; } = new();
}

public class PlayerTeamScoreDto
{
    public Guid TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public GameFormat Format { get; set; }
    public Guid FrameworkId { get; set; }
    public string FrameworkName { get; set; } = string.Empty;
    public decimal BaseScore { get; set; }
    public decimal BoostedScore { get; set; }
    public CompetencyBand Band { get; set; }
    public DateTime CalculatedAt { get; set; }
}

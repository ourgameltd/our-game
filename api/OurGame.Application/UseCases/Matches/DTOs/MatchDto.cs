namespace OurGame.Application.UseCases.Matches.DTOs;

/// <summary>
/// Match information
/// </summary>
public class MatchDto
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public string SeasonId { get; set; } = string.Empty;
    public string SquadSize { get; set; } = string.Empty;
    public string Opposition { get; set; } = string.Empty;
    public DateTime MatchDate { get; set; }
    public DateTime? MeetTime { get; set; }
    public DateTime? KickOffTime { get; set; }
    public string Location { get; set; } = string.Empty;
    public bool IsHome { get; set; }
    public string Competition { get; set; } = string.Empty;
    public Guid? PrimaryKitId { get; set; }
    public Guid? SecondaryKitId { get; set; }
    public Guid? GoalkeeperKitId { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsLocked { get; set; }
    public string Notes { get; set; } = string.Empty;
    public string WeatherCondition { get; set; } = string.Empty;
    public int? WeatherTemperature { get; set; }
    public List<Guid> CoachIds { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

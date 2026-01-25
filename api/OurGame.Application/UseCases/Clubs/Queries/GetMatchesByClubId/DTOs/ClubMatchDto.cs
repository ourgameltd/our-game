namespace OurGame.Application.UseCases.Clubs.Queries.GetMatchesByClubId.DTOs;

/// <summary>
/// DTO for a match within a club
/// </summary>
public class ClubMatchDto
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public Guid AgeGroupId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public string AgeGroupName { get; set; } = string.Empty;
    public int? SquadSize { get; set; }
    public string Opposition { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public DateTime? MeetTime { get; set; }
    public DateTime KickOffTime { get; set; }
    public string Location { get; set; } = string.Empty;
    public bool IsHome { get; set; }
    public string Competition { get; set; } = string.Empty;
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsLocked { get; set; }
    public string? WeatherCondition { get; set; }
    public int? WeatherTemperature { get; set; }
}

/// <summary>
/// DTO for club matches response
/// </summary>
public class ClubMatchesDto
{
    public List<ClubMatchDto> Matches { get; set; } = new();
    public int TotalCount { get; set; }
}

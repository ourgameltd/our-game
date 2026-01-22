namespace OurGame.Application.UseCases.Clubs.Queries.GetClubStatistics.DTOs;

/// <summary>
/// DTO for club statistics
/// </summary>
public class ClubStatisticsDto
{
    public int PlayerCount { get; set; }
    public int TeamCount { get; set; }
    public int AgeGroupCount { get; set; }
    public int MatchesPlayed { get; set; }
    public int Wins { get; set; }
    public int Draws { get; set; }
    public int Losses { get; set; }
    public decimal WinRate { get; set; }
    public int GoalDifference { get; set; }
    public List<MatchSummaryDto> UpcomingMatches { get; set; } = new();
    public List<MatchSummaryDto> PreviousResults { get; set; } = new();
}

/// <summary>
/// DTO for match summary
/// </summary>
public class MatchSummaryDto
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public Guid AgeGroupId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public string AgeGroupName { get; set; } = string.Empty;
    public string Opposition { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public DateTime? MeetTime { get; set; }
    public DateTime? KickOffTime { get; set; }
    public string Location { get; set; } = string.Empty;
    public bool IsHome { get; set; }
    public string? Competition { get; set; }
    public MatchScoreDto? Score { get; set; }
}

/// <summary>
/// DTO for match score
/// </summary>
public class MatchScoreDto
{
    public int Home { get; set; }
    public int Away { get; set; }
}

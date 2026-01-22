namespace OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupStatistics.DTOs;

/// <summary>
/// DTO for age group statistics
/// </summary>
public class AgeGroupStatisticsDto
{
    public int PlayerCount { get; set; }
    public int MatchesPlayed { get; set; }
    public int Wins { get; set; }
    public int Draws { get; set; }
    public int Losses { get; set; }
    public decimal WinRate { get; set; }
    public int GoalDifference { get; set; }
    public List<AgeGroupMatchSummaryDto> UpcomingMatches { get; set; } = new();
    public List<AgeGroupMatchSummaryDto> PreviousResults { get; set; } = new();
    public List<AgeGroupPerformerDto> TopPerformers { get; set; } = new();
    public List<AgeGroupPerformerDto> Underperforming { get; set; } = new();
}

/// <summary>
/// DTO for age group match summary
/// </summary>
public class AgeGroupMatchSummaryDto
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

/// <summary>
/// DTO for performance summary
/// </summary>
public class AgeGroupPerformerDto
{
    public Guid PlayerId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public decimal AverageRating { get; set; }
    public int MatchesPlayed { get; set; }
}

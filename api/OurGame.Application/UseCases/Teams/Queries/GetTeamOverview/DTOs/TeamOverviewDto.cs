namespace OurGame.Application.UseCases.Teams.Queries.GetTeamOverview.DTOs;

/// <summary>
/// DTO for team overview response
/// </summary>
public class TeamOverviewDto
{
    public TeamOverviewTeamDto Team { get; set; } = new();
    public TeamOverviewStatisticsDto Statistics { get; set; } = new();
    public List<TeamTrainingSessionDto> UpcomingTrainingSessions { get; set; } = new();
}

/// <summary>
/// DTO for team details
/// </summary>
public class TeamOverviewTeamDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public Guid AgeGroupId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public string Season { get; set; } = string.Empty;
    public TeamColorsDto Colors { get; set; } = new();
    public bool IsArchived { get; set; }
}

/// <summary>
/// DTO for team colors
/// </summary>
public class TeamColorsDto
{
    public string? Primary { get; set; }
    public string? Secondary { get; set; }
}

/// <summary>
/// DTO for team overview statistics
/// </summary>
public class TeamOverviewStatisticsDto
{
    public int PlayerCount { get; set; }
    public int MatchesPlayed { get; set; }
    public int Wins { get; set; }
    public int Draws { get; set; }
    public int Losses { get; set; }
    public decimal WinRate { get; set; }
    public int GoalDifference { get; set; }
    public List<TeamMatchSummaryDto> UpcomingMatches { get; set; } = new();
    public List<TeamMatchSummaryDto> PreviousResults { get; set; } = new();
    public List<TeamPerformerDto> TopPerformers { get; set; } = new();
    public List<TeamPerformerDto> Underperforming { get; set; } = new();
}

/// <summary>
/// DTO for team match summary
/// </summary>
public class TeamMatchSummaryDto
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public Guid AgeGroupId { get; set; }
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
/// DTO for team performer summary
/// </summary>
public class TeamPerformerDto
{
    public Guid PlayerId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public decimal AverageRating { get; set; }
    public int MatchesPlayed { get; set; }
}

/// <summary>
/// DTO for training session summary
/// </summary>
public class TeamTrainingSessionDto
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public DateTime Date { get; set; }
    public DateTime? MeetTime { get; set; }
    public int? DurationMinutes { get; set; }
    public string Location { get; set; } = string.Empty;
    public List<string> FocusAreas { get; set; } = new();
}
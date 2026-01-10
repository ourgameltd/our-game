namespace OurGame.Application.UseCases.Teams.DTOs;

/// <summary>
/// Statistics for a team
/// </summary>
public class TeamStatisticsDto
{
    public int PlayerCount { get; set; }
    public int MatchesPlayed { get; set; }
    public int MatchesWon { get; set; }
    public int MatchesDrawn { get; set; }
    public int MatchesLost { get; set; }
    public int GoalsScored { get; set; }
    public int GoalsConceded { get; set; }
    public int GoalDifference { get; set; }
}

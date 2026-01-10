namespace OurGame.Application.UseCases.Clubs.DTOs;

/// <summary>
/// Statistics for a club
/// </summary>
public class ClubStatisticsDto
{
    public int TotalPlayers { get; set; }
    public int TotalTeams { get; set; }
    public int TotalAgeGroups { get; set; }
    public int TotalCoaches { get; set; }
    public int MatchesPlayed { get; set; }
    public int MatchesWon { get; set; }
    public int MatchesDrawn { get; set; }
    public int MatchesLost { get; set; }
    public int GoalsScored { get; set; }
    public int GoalsConceded { get; set; }
}

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
}

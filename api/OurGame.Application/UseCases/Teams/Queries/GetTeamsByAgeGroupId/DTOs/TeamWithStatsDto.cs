namespace OurGame.Application.UseCases.Teams.Queries.GetTeamsByAgeGroupId.DTOs;

/// <summary>
/// DTO for team list with stats
/// </summary>
public class TeamWithStatsDto
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
    public TeamStatsDto Stats { get; set; } = new();
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
/// DTO for team stats
/// </summary>
public class TeamStatsDto
{
    public int PlayerCount { get; set; }
    public int CoachCount { get; set; }
    public int MatchesPlayed { get; set; }
    public int Wins { get; set; }
    public int Draws { get; set; }
    public int Losses { get; set; }
    public decimal WinRate { get; set; }
    public int GoalDifference { get; set; }
}

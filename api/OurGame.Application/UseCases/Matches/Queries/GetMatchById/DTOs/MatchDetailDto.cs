namespace OurGame.Application.UseCases.Matches.Queries.GetMatchById.DTOs;

/// <summary>
/// Full match detail DTO including lineup, coaches, report, goals, cards, substitutions, injuries, and ratings
/// </summary>
public record MatchDetailDto
{
    public Guid Id { get; init; }
    public Guid TeamId { get; init; }
    public Guid AgeGroupId { get; init; }
    public string TeamName { get; init; } = string.Empty;
    public string AgeGroupName { get; init; } = string.Empty;
    public string SeasonId { get; init; } = string.Empty;
    public int SquadSize { get; init; }
    public string Opposition { get; init; } = string.Empty;
    public DateTime MatchDate { get; init; }
    public DateTime? MeetTime { get; init; }
    public DateTime? KickOffTime { get; init; }
    public string Location { get; init; } = string.Empty;
    public bool IsHome { get; init; }
    public string Competition { get; init; } = string.Empty;
    public Guid? PrimaryKitId { get; init; }
    public Guid? SecondaryKitId { get; init; }
    public Guid? GoalkeeperKitId { get; init; }
    public int? HomeScore { get; init; }
    public int? AwayScore { get; init; }
    public string Status { get; init; } = string.Empty;
    public bool IsLocked { get; init; }
    public string? Notes { get; init; }
    public string? WeatherCondition { get; init; }
    public int? WeatherTemperature { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }

    public MatchLineupDto? Lineup { get; init; }
    public MatchReportDetailDto? Report { get; init; }
    public List<MatchCoachDetailDto> Coaches { get; init; } = new();
    public List<MatchSubstitutionDetailDto> Substitutions { get; init; } = new();
}

/// <summary>
/// Lineup information including formation, tactic, and players
/// </summary>
public record MatchLineupDto
{
    public Guid Id { get; init; }
    public Guid? FormationId { get; init; }
    public string? FormationName { get; init; }
    public Guid? TacticId { get; init; }
    public string? TacticName { get; init; }
    public List<LineupPlayerDto> Players { get; init; } = new();
}

/// <summary>
/// Individual player in the lineup
/// </summary>
public record LineupPlayerDto
{
    public Guid Id { get; init; }
    public Guid PlayerId { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? Position { get; init; }
    public int? SquadNumber { get; init; }
    public bool IsStarting { get; init; }
}

/// <summary>
/// Match report with goals, cards, injuries, and performance ratings
/// </summary>
public record MatchReportDetailDto
{
    public Guid Id { get; init; }
    public string? Summary { get; init; }
    public Guid? CaptainId { get; init; }
    public string? CaptainName { get; init; }
    public Guid? PlayerOfMatchId { get; init; }
    public string? PlayerOfMatchName { get; init; }
    public List<GoalDetailDto> Goals { get; init; } = new();
    public List<CardDetailDto> Cards { get; init; } = new();
    public List<InjuryDetailDto> Injuries { get; init; } = new();
    public List<PerformanceRatingDto> PerformanceRatings { get; init; } = new();
}

/// <summary>
/// Goal event detail
/// </summary>
public record GoalDetailDto
{
    public Guid Id { get; init; }
    public Guid PlayerId { get; init; }
    public string ScorerName { get; init; } = string.Empty;
    public int Minute { get; init; }
    public Guid? AssistPlayerId { get; init; }
    public string? AssistPlayerName { get; init; }
}

/// <summary>
/// Card event detail
/// </summary>
public record CardDetailDto
{
    public Guid Id { get; init; }
    public Guid PlayerId { get; init; }
    public string PlayerName { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public int Minute { get; init; }
    public string? Reason { get; init; }
}

/// <summary>
/// Injury event detail
/// </summary>
public record InjuryDetailDto
{
    public Guid Id { get; init; }
    public Guid PlayerId { get; init; }
    public string PlayerName { get; init; } = string.Empty;
    public int Minute { get; init; }
    public string? Description { get; init; }
    public string Severity { get; init; } = string.Empty;
}

/// <summary>
/// Player performance rating
/// </summary>
public record PerformanceRatingDto
{
    public Guid Id { get; init; }
    public Guid PlayerId { get; init; }
    public string PlayerName { get; init; } = string.Empty;
    public decimal? Rating { get; init; }
}

/// <summary>
/// Coach assigned to the match
/// </summary>
public record MatchCoachDetailDto
{
    public Guid Id { get; init; }
    public Guid CoachId { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
}

/// <summary>
/// Substitution event detail
/// </summary>
public record MatchSubstitutionDetailDto
{
    public Guid Id { get; init; }
    public int Minute { get; init; }
    public Guid PlayerOutId { get; init; }
    public string PlayerOutName { get; init; } = string.Empty;
    public Guid PlayerInId { get; init; }
    public string PlayerInName { get; init; } = string.Empty;
}

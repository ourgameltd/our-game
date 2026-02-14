using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Matches.Commands.CreateMatch.DTOs;

/// <summary>
/// Request DTO for creating a new match
/// </summary>
public record CreateMatchRequest
{
    [Required]
    public Guid TeamId { get; init; }

    [Required]
    [StringLength(20)]
    public string SeasonId { get; init; } = string.Empty;

    [Required]
    public int SquadSize { get; init; }

    [Required]
    [StringLength(200)]
    public string Opposition { get; init; } = string.Empty;

    [Required]
    public DateTime MatchDate { get; init; }

    public DateTime? MeetTime { get; init; }

    public DateTime? KickOffTime { get; init; }

    [StringLength(500)]
    public string? Location { get; init; }

    public bool IsHome { get; init; }

    [StringLength(200)]
    public string? Competition { get; init; }

    public Guid? PrimaryKitId { get; init; }

    public Guid? SecondaryKitId { get; init; }

    public Guid? GoalkeeperKitId { get; init; }

    public int? HomeScore { get; init; }

    public int? AwayScore { get; init; }

    /// <summary>
    /// Match status: scheduled, in-progress, completed, postponed, cancelled
    /// </summary>
    [StringLength(50)]
    public string Status { get; init; } = "scheduled";

    [StringLength(4000)]
    public string? Notes { get; init; }

    [StringLength(100)]
    public string? WeatherCondition { get; init; }

    public int? WeatherTemperature { get; init; }

    /// <summary>
    /// Lineup containing formation, tactic, and players
    /// </summary>
    public CreateMatchLineupRequest? Lineup { get; init; }

    /// <summary>
    /// Match report with goals, cards, injuries, and ratings
    /// </summary>
    public CreateMatchReportRequest? Report { get; init; }

    /// <summary>
    /// Coaches assigned to the match
    /// </summary>
    public List<Guid> CoachIds { get; init; } = new();

    /// <summary>
    /// Substitutions made during the match
    /// </summary>
    public List<CreateMatchSubstitutionRequest> Substitutions { get; init; } = new();
}

/// <summary>
/// Lineup data for match creation
/// </summary>
public record CreateMatchLineupRequest
{
    public Guid? FormationId { get; init; }

    public Guid? TacticId { get; init; }

    public List<CreateLineupPlayerRequest> Players { get; init; } = new();
}

/// <summary>
/// Player entry in lineup
/// </summary>
public record CreateLineupPlayerRequest
{
    [Required]
    public Guid PlayerId { get; init; }

    [StringLength(50)]
    public string? Position { get; init; }

    public int? SquadNumber { get; init; }

    public bool IsStarting { get; init; }
}

/// <summary>
/// Match report data for creation
/// </summary>
public record CreateMatchReportRequest
{
    [StringLength(4000)]
    public string? Summary { get; init; }

    public Guid? CaptainId { get; init; }

    public Guid? PlayerOfMatchId { get; init; }

    public List<CreateGoalRequest> Goals { get; init; } = new();

    public List<CreateCardRequest> Cards { get; init; } = new();

    public List<CreateInjuryRequest> Injuries { get; init; } = new();

    public List<CreatePerformanceRatingRequest> PerformanceRatings { get; init; } = new();
}

/// <summary>
/// Goal event for creation
/// </summary>
public record CreateGoalRequest
{
    [Required]
    public Guid PlayerId { get; init; }

    [Required]
    public int Minute { get; init; }

    public Guid? AssistPlayerId { get; init; }
}

/// <summary>
/// Card event for creation
/// </summary>
public record CreateCardRequest
{
    [Required]
    public Guid PlayerId { get; init; }

    /// <summary>
    /// Card type: yellow, red
    /// </summary>
    [Required]
    [StringLength(20)]
    public string Type { get; init; } = "yellow";

    [Required]
    public int Minute { get; init; }

    [StringLength(500)]
    public string? Reason { get; init; }
}

/// <summary>
/// Injury event for creation
/// </summary>
public record CreateInjuryRequest
{
    [Required]
    public Guid PlayerId { get; init; }

    [Required]
    public int Minute { get; init; }

    [StringLength(1000)]
    public string? Description { get; init; }

    /// <summary>
    /// Severity: minor, moderate, serious
    /// </summary>
    [Required]
    [StringLength(20)]
    public string Severity { get; init; } = "minor";
}

/// <summary>
/// Performance rating for creation
/// </summary>
public record CreatePerformanceRatingRequest
{
    [Required]
    public Guid PlayerId { get; init; }

    public decimal? Rating { get; init; }
}

/// <summary>
/// Substitution event for creation
/// </summary>
public record CreateMatchSubstitutionRequest
{
    [Required]
    public int Minute { get; init; }

    [Required]
    public Guid PlayerOutId { get; init; }

    [Required]
    public Guid PlayerInId { get; init; }
}

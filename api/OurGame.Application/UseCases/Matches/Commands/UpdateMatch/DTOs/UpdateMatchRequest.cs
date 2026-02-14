using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Matches.Commands.UpdateMatch.DTOs;

/// <summary>
/// Request DTO for updating an existing match
/// </summary>
public record UpdateMatchRequest
{
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

    public bool IsLocked { get; init; }

    [StringLength(4000)]
    public string? Notes { get; init; }

    [StringLength(100)]
    public string? WeatherCondition { get; init; }

    public int? WeatherTemperature { get; init; }

    /// <summary>
    /// Lineup is replaced entirely on update
    /// </summary>
    public UpdateMatchLineupRequest? Lineup { get; init; }

    /// <summary>
    /// Match report is replaced entirely on update
    /// </summary>
    public UpdateMatchReportRequest? Report { get; init; }

    /// <summary>
    /// Coaches are replaced entirely on update
    /// </summary>
    public List<Guid> CoachIds { get; init; } = new();

    /// <summary>
    /// Substitutions are replaced entirely on update
    /// </summary>
    public List<UpdateMatchSubstitutionRequest> Substitutions { get; init; } = new();
}

/// <summary>
/// Lineup data for match update (replaces existing)
/// </summary>
public record UpdateMatchLineupRequest
{
    public Guid? FormationId { get; init; }

    public Guid? TacticId { get; init; }

    public List<UpdateLineupPlayerRequest> Players { get; init; } = new();
}

/// <summary>
/// Player entry in lineup for update
/// </summary>
public record UpdateLineupPlayerRequest
{
    [Required]
    public Guid PlayerId { get; init; }

    [StringLength(50)]
    public string? Position { get; init; }

    public int? SquadNumber { get; init; }

    public bool IsStarting { get; init; }
}

/// <summary>
/// Match report data for update (replaces existing)
/// </summary>
public record UpdateMatchReportRequest
{
    [StringLength(4000)]
    public string? Summary { get; init; }

    public Guid? CaptainId { get; init; }

    public Guid? PlayerOfMatchId { get; init; }

    public List<UpdateGoalRequest> Goals { get; init; } = new();

    public List<UpdateCardRequest> Cards { get; init; } = new();

    public List<UpdateInjuryRequest> Injuries { get; init; } = new();

    public List<UpdatePerformanceRatingRequest> PerformanceRatings { get; init; } = new();
}

/// <summary>
/// Goal event for update
/// </summary>
public record UpdateGoalRequest
{
    [Required]
    public Guid PlayerId { get; init; }

    [Required]
    public int Minute { get; init; }

    public Guid? AssistPlayerId { get; init; }
}

/// <summary>
/// Card event for update
/// </summary>
public record UpdateCardRequest
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
/// Injury event for update
/// </summary>
public record UpdateInjuryRequest
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
/// Performance rating for update
/// </summary>
public record UpdatePerformanceRatingRequest
{
    [Required]
    public Guid PlayerId { get; init; }

    public decimal? Rating { get; init; }
}

/// <summary>
/// Substitution event for update
/// </summary>
public record UpdateMatchSubstitutionRequest
{
    [Required]
    public int Minute { get; init; }

    [Required]
    public Guid PlayerOutId { get; init; }

    [Required]
    public Guid PlayerInId { get; init; }
}

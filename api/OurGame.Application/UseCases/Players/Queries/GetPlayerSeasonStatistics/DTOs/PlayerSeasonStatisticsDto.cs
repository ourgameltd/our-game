namespace OurGame.Application.UseCases.Players.Queries.GetPlayerSeasonStatistics.DTOs;

/// <summary>
/// Aggregated match and attendance statistics for a player in a single season
/// </summary>
public class PlayerSeasonStatisticsDto
{
    /// <summary>Season identifier (e.g. "2024/25")</summary>
    public string Season { get; init; } = string.Empty;

    // ── Match appearances ────────────────────────

    public int Appearances { get; init; }
    public int Goals { get; init; }
    public int Assists { get; init; }

    /// <summary>Average performance rating, null when no ratings recorded</summary>
    public decimal? AvgRating { get; init; }

    // ── Match attendance (RSVP) ──────────────────

    public int MatchesConfirmed { get; init; }
    public int MatchesDeclined { get; init; }
    public int MatchesPending { get; init; }
    public int MatchesRsvpd { get; init; }

    // ── Training attendance ──────────────────────

    public int TrainingPresent { get; init; }
    public int TrainingAbsent { get; init; }
    public int TrainingTotal { get; init; }
}

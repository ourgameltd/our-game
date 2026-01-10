namespace OurGame.Application.UseCases.Matches.DTOs;

/// <summary>
/// Match lineup information
/// </summary>
public class MatchLineupDto
{
    public Guid Id { get; set; }
    public Guid MatchId { get; set; }
    public Guid? FormationId { get; set; }
    public Guid? TacticId { get; set; }
    public List<LineupPlayerDto> LineupPlayers { get; set; } = new();
}

/// <summary>
/// Player in match lineup
/// </summary>
public class LineupPlayerDto
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public string PlayerFirstName { get; set; } = string.Empty;
    public string PlayerLastName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public int? PositionIndex { get; set; }
    public bool IsStarting { get; set; }
    public bool IsSubstitute { get; set; }
    public bool IsCaptain { get; set; }
}

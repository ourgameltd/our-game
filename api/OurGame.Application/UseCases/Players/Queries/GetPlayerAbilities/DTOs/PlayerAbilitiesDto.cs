namespace OurGame.Application.UseCases.Players.Queries.GetPlayerAbilities.DTOs;

/// <summary>
/// DTO for player abilities including current attributes and evaluation history.
/// Provides comprehensive view of player development over time with EA FC-style attributes.
/// </summary>
public record PlayerAbilitiesDto
{
    /// <summary>Player unique identifier</summary>
    public Guid Id { get; init; }

    /// <summary>Player first name</summary>
    public string FirstName { get; init; } = string.Empty;

    /// <summary>Player last name</summary>
    public string LastName { get; init; } = string.Empty;

    /// <summary>Player full name</summary>
    public string FullName => $"{FirstName} {LastName}";

    /// <summary>Player photo URL</summary>
    public string? Photo { get; init; }

    /// <summary>Preferred positions as JSON array string (e.g. ["CAM","CM"])</summary>
    public string? PreferredPositions { get; init; }

    /// <summary>Club identifier</summary>
    public Guid ClubId { get; init; }

    /// <summary>Overall rating (0-100 scale)</summary>
    public int? OverallRating { get; init; }

    /// <summary>Current player attributes (35 EA FC-style metrics)</summary>
    public PlayerAttributesDto? Attributes { get; init; }

    /// <summary>Historical evaluations (last 12, ordered by date descending)</summary>
    public List<PlayerAbilityEvaluationDto> Evaluations { get; init; } = new();
}

/// <summary>
/// DTO for player attributes following EA FC structure.
/// All attributes use 0-100 rating scale.
/// </summary>
public record PlayerAttributesDto
{
    // Technical Skills
    /// <summary>Ball control ability (0-100)</summary>
    public int BallControl { get; init; }

    /// <summary>Crossing accuracy (0-100)</summary>
    public int Crossing { get; init; }

    /// <summary>Weak foot proficiency (0-100)</summary>
    public int WeakFoot { get; init; }

    /// <summary>Dribbling skill (0-100)</summary>
    public int Dribbling { get; init; }

    /// <summary>Finishing ability (0-100)</summary>
    public int Finishing { get; init; }

    /// <summary>Free kick skill (0-100)</summary>
    public int FreeKick { get; init; }

    /// <summary>Heading accuracy (0-100)</summary>
    public int Heading { get; init; }

    /// <summary>Long passing accuracy (0-100)</summary>
    public int LongPassing { get; init; }

    /// <summary>Long shot power (0-100)</summary>
    public int LongShot { get; init; }

    /// <summary>Penalty taking ability (0-100)</summary>
    public int Penalties { get; init; }

    /// <summary>Short passing accuracy (0-100)</summary>
    public int ShortPassing { get; init; }

    /// <summary>Shot power (0-100)</summary>
    public int ShotPower { get; init; }

    /// <summary>Sliding tackle skill (0-100)</summary>
    public int SlidingTackle { get; init; }

    /// <summary>Standing tackle skill (0-100)</summary>
    public int StandingTackle { get; init; }

    /// <summary>Volley skill (0-100)</summary>
    public int Volleys { get; init; }

    // Physical Attributes
    /// <summary>Acceleration speed (0-100)</summary>
    public int Acceleration { get; init; }

    /// <summary>Agility (0-100)</summary>
    public int Agility { get; init; }

    /// <summary>Balance (0-100)</summary>
    public int Balance { get; init; }

    /// <summary>Jumping ability (0-100)</summary>
    public int Jumping { get; init; }

    /// <summary>Pace/sprint speed (0-100)</summary>
    public int Pace { get; init; }

    /// <summary>Reaction time (0-100)</summary>
    public int Reactions { get; init; }

    /// <summary>Sprint speed (0-100)</summary>
    public int SprintSpeed { get; init; }

    /// <summary>Stamina (0-100)</summary>
    public int Stamina { get; init; }

    /// <summary>Physical strength (0-100)</summary>
    public int Strength { get; init; }

    // Mental Attributes
    /// <summary>Aggression (0-100)</summary>
    public int Aggression { get; init; }

    /// <summary>Attacking positioning (0-100)</summary>
    public int AttackingPosition { get; init; }

    /// <summary>Game awareness (0-100)</summary>
    public int Awareness { get; init; }

    /// <summary>Communication skills (0-100)</summary>
    public int Communication { get; init; }

    /// <summary>Composure under pressure (0-100)</summary>
    public int Composure { get; init; }

    /// <summary>Defensive positioning (0-100)</summary>
    public int DefensivePositioning { get; init; }

    /// <summary>Interception ability (0-100)</summary>
    public int Interceptions { get; init; }

    /// <summary>Marking ability (0-100)</summary>
    public int Marking { get; init; }

    /// <summary>Positive attitude (0-100)</summary>
    public int Positivity { get; init; }

    /// <summary>General positioning (0-100)</summary>
    public int Positioning { get; init; }

    /// <summary>Vision and awareness (0-100)</summary>
    public int Vision { get; init; }

    /// <summary>Last update timestamp</summary>
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// DTO for a single player ability evaluation (coach assessment at a point in time).
/// </summary>
public record PlayerAbilityEvaluationDto
{
    /// <summary>Evaluation unique identifier</summary>
    public Guid Id { get; init; }

    /// <summary>Coach who performed the evaluation</summary>
    public Guid EvaluatedBy { get; init; }

    /// <summary>Coach's full name</summary>
    public string? CoachName { get; init; }

    /// <summary>Date and time of evaluation</summary>
    public DateTime EvaluatedAt { get; init; }

    /// <summary>Overall rating at time of evaluation (0-100)</summary>
    public int? OverallRating { get; init; }

    /// <summary>Coach notes and feedback</summary>
    public string? CoachNotes { get; init; }

    /// <summary>Evaluation period start date</summary>
    public DateOnly? PeriodStart { get; init; }

    /// <summary>Evaluation period end date</summary>
    public DateOnly? PeriodEnd { get; init; }

    /// <summary>Individual attribute ratings for this evaluation</summary>
    public List<EvaluationAttributeDto> Attributes { get; init; } = new();
}

/// <summary>
/// DTO for a single attribute rating within an evaluation.
/// </summary>
public record EvaluationAttributeDto
{
    /// <summary>Attribute name (e.g. "BallControl", "Finishing")</summary>
    public string AttributeName { get; init; } = string.Empty;

    /// <summary>Attribute rating (0-100)</summary>
    public int? Rating { get; init; }

    /// <summary>Coach notes specific to this attribute</summary>
    public string? Notes { get; init; }
}

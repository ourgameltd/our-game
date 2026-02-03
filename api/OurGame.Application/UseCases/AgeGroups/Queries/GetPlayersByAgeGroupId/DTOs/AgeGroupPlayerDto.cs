namespace OurGame.Application.UseCases.AgeGroups.Queries.GetPlayersByAgeGroupId.DTOs;

/// <summary>
/// DTO for player in age group players list
/// </summary>
public class AgeGroupPlayerDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Nickname { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Photo { get; set; }
    public string? AssociationId { get; set; }
    public List<string> PreferredPositions { get; set; } = new();
    public AgeGroupPlayerAttributesDto Attributes { get; set; } = new();
    public int? OverallRating { get; set; }
    public List<AgeGroupPlayerEvaluationDto> Evaluations { get; set; } = new();
    public List<Guid> AgeGroupIds { get; set; } = new();
    public List<Guid> TeamIds { get; set; } = new();
    public List<Guid> ParentIds { get; set; } = new();
    public bool IsArchived { get; set; }
}

/// <summary>
/// DTO for player attributes (EA FC style - 35 attributes)
/// </summary>
public class AgeGroupPlayerAttributesDto
{
    // Skills
    public int? BallControl { get; set; }
    public int? Crossing { get; set; }
    public int? WeakFoot { get; set; }
    public int? Dribbling { get; set; }
    public int? Finishing { get; set; }
    public int? FreeKick { get; set; }
    public int? Heading { get; set; }
    public int? LongPassing { get; set; }
    public int? LongShot { get; set; }
    public int? Penalties { get; set; }
    public int? ShortPassing { get; set; }
    public int? ShotPower { get; set; }
    public int? SlidingTackle { get; set; }
    public int? StandingTackle { get; set; }
    public int? Volleys { get; set; }
    
    // Physical
    public int? Acceleration { get; set; }
    public int? Agility { get; set; }
    public int? Balance { get; set; }
    public int? Jumping { get; set; }
    public int? Pace { get; set; }
    public int? Reactions { get; set; }
    public int? SprintSpeed { get; set; }
    public int? Stamina { get; set; }
    public int? Strength { get; set; }
    
    // Mental
    public int? Aggression { get; set; }
    public int? AttackingPosition { get; set; }
    public int? Awareness { get; set; }
    public int? Communication { get; set; }
    public int? Composure { get; set; }
    public int? DefensivePositioning { get; set; }
    public int? Interceptions { get; set; }
    public int? Marking { get; set; }
    public int? Positivity { get; set; }
    public int? Positioning { get; set; }
    public int? Vision { get; set; }
}

/// <summary>
/// DTO for player attribute evaluation
/// </summary>
public class AgeGroupPlayerEvaluationDto
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public Guid EvaluatedBy { get; set; }
    public DateTime EvaluatedAt { get; set; }
    public int? OverallRating { get; set; }
    public string? CoachNotes { get; set; }
    public DateOnly? PeriodStart { get; set; }
    public DateOnly? PeriodEnd { get; set; }
    public List<AgeGroupEvaluationAttributeDto> Attributes { get; set; } = new();
}

/// <summary>
/// DTO for evaluation attribute
/// </summary>
public class AgeGroupEvaluationAttributeDto
{
    public string AttributeName { get; set; } = string.Empty;
    public int? Rating { get; set; }
    public string? Notes { get; set; }
}

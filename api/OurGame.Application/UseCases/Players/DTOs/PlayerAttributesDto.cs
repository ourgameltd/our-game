namespace OurGame.Application.UseCases.Players.DTOs;

/// <summary>
/// Player attributes (EA FC-style 35 attributes)
/// </summary>
public class PlayerAttributesDto
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    
    // Technical Skills (15)
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
    
    // Physical (9)
    public int? Acceleration { get; set; }
    public int? Agility { get; set; }
    public int? Balance { get; set; }
    public int? Jumping { get; set; }
    public int? Pace { get; set; }
    public int? Reactions { get; set; }
    public int? SprintSpeed { get; set; }
    public int? Stamina { get; set; }
    public int? Strength { get; set; }
    
    // Mental (11)
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
    
    public DateTime UpdatedAt { get; set; }
}

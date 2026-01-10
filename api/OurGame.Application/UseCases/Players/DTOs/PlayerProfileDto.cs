namespace OurGame.Application.UseCases.Players.DTOs;

/// <summary>
/// Player profile information
/// </summary>
public class PlayerProfileDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Nickname { get; set; } = string.Empty;
    public DateOnly? DateOfBirth { get; set; }
    public string Photo { get; set; } = string.Empty;
    public string AssociationId { get; set; } = string.Empty;
    public List<string> PreferredPositions { get; set; } = new();
    public int? OverallRating { get; set; }
    public List<string> Allergies { get; set; } = new();
    public List<string> MedicalConditions { get; set; } = new();
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<Guid> AgeGroupIds { get; set; } = new();
    public List<Guid> TeamIds { get; set; } = new();
}

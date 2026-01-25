namespace OurGame.Application.UseCases.Coaches.Queries.GetCoachesByClubId.DTOs;

/// <summary>
/// DTO for coach in club coaches list
/// </summary>
public class ClubCoachDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateOnly? DateOfBirth { get; set; }
    public string? Photo { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? AssociationId { get; set; }
    public bool HasAccount { get; set; }
    public string Role { get; set; } = string.Empty;
    public string? Biography { get; set; }
    public List<string> Specializations { get; set; } = new();
    public bool IsArchived { get; set; }
    public List<ClubCoachTeamDto> Teams { get; set; } = new();
}

/// <summary>
/// DTO for team reference in club coach
/// </summary>
public class ClubCoachTeamDto
{
    public Guid Id { get; set; }
    public Guid AgeGroupId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? AgeGroupName { get; set; }
}

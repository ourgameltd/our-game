namespace OurGame.Application.UseCases.AgeGroups.Queries.GetCoachesByAgeGroupId.DTOs;

/// <summary>
/// DTO for coach in age group coaches list
/// </summary>
public class AgeGroupCoachDto
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
    public List<AgeGroupCoachTeamDto> Teams { get; set; } = new();
}

/// <summary>
/// DTO for team reference in age group coach
/// </summary>
public class AgeGroupCoachTeamDto
{
    public Guid Id { get; set; }
    public Guid AgeGroupId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? AgeGroupName { get; set; }
}

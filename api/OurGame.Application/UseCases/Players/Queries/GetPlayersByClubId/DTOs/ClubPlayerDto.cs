using OurGame.Persistence.Enums;

namespace OurGame.Application.UseCases.Players.Queries.GetPlayersByClubId.DTOs;

/// <summary>
/// DTO for player in club players list
/// </summary>
public class ClubPlayerDto
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
    public int? OverallRating { get; set; }
    public CompetencyBand? OverallBand { get; set; }
    public bool IsArchived { get; set; }
    public List<ClubPlayerAgeGroupDto> AgeGroups { get; set; } = new();
    public List<ClubPlayerTeamDto> Teams { get; set; } = new();
}

/// <summary>
/// DTO for age group reference in club player
/// </summary>
public class ClubPlayerAgeGroupDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

/// <summary>
/// DTO for team reference in club player
/// </summary>
public class ClubPlayerTeamDto
{
    public Guid Id { get; set; }
    public Guid AgeGroupId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? AgeGroupName { get; set; }
}

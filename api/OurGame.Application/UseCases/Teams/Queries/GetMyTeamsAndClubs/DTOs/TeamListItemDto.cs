using System.Text.Json.Serialization;

namespace OurGame.Application.UseCases.Teams.Queries.GetMyTeamsAndClubs.DTOs;

/// <summary>
/// DTO representing team colors
/// </summary>
public class TeamColorsDto
{
    [JsonPropertyName("primary")]
    public string Primary { get; set; } = string.Empty;

    [JsonPropertyName("secondary")]
    public string Secondary { get; set; } = string.Empty;
}

/// <summary>
/// DTO representing club information in team context
/// </summary>
public class TeamClubDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("shortName")]
    public string ShortName { get; set; } = string.Empty;

    [JsonPropertyName("logo")]
    public string? Logo { get; set; }

    [JsonPropertyName("primaryColor")]
    public string? PrimaryColor { get; set; }

    [JsonPropertyName("secondaryColor")]
    public string? SecondaryColor { get; set; }

    [JsonPropertyName("accentColor")]
    public string? AccentColor { get; set; }

    [JsonPropertyName("foundedYear")]
    public int? FoundedYear { get; set; }
}

/// <summary>
/// DTO representing a coach assigned to a team
/// </summary>
public class TeamCoachDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("firstName")]
    public string FirstName { get; set; } = string.Empty;

    [JsonPropertyName("lastName")]
    public string LastName { get; set; } = string.Empty;

    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty;
}

/// <summary>
/// DTO representing a team in a club list
/// </summary>
public class TeamAndClubsListItemDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("clubId")]
    public Guid ClubId { get; set; }

    [JsonPropertyName("ageGroupId")]
    public Guid AgeGroupId { get; set; }

    [JsonPropertyName("ageGroupName")]
    public string AgeGroupName { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("colors")]
    public TeamColorsDto Colors { get; set; } = new();

    [JsonPropertyName("season")]
    public string Season { get; set; } = string.Empty;

    [JsonPropertyName("squadSize")]
    public int SquadSize { get; set; }

    [JsonPropertyName("coaches")]
    public List<TeamCoachDto> Coaches { get; set; } = new();

    [JsonPropertyName("playerCount")]
    public int PlayerCount { get; set; }

    [JsonPropertyName("isArchived")]
    public bool IsArchived { get; set; }

    [JsonPropertyName("club")]
    public TeamClubDto? Club { get; set; }
}

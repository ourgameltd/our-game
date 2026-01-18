using System.Text.Json.Serialization;

namespace OurGame.Application.UseCases.Clubs.DTOs;

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
/// DTO representing a team in a club list
/// </summary>
public class TeamListItemDto
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
}

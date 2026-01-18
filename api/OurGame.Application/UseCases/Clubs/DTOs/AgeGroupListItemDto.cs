using System.Text.Json.Serialization;
using OurGame.Persistence.Enums;

namespace OurGame.Application.UseCases.Clubs.DTOs;

/// <summary>
/// Data transfer object for age group list items with summary information
/// </summary>
public class AgeGroupListItemDto
{
    /// <summary>
    /// Unique identifier of the age group
    /// </summary>
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    /// <summary>
    /// Unique identifier of the club
    /// </summary>
    [JsonPropertyName("clubId")]
    public Guid ClubId { get; set; }

    /// <summary>
    /// Name of the age group (e.g., "2014s", "Amateur", "Senior")
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Code of the age group (e.g., "2014", "amateur", "senior")
    /// </summary>
    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Level of the age group (youth, amateur, reserve, senior)
    /// </summary>
    [JsonPropertyName("level")]
    public string Level { get; set; } = string.Empty;

    /// <summary>
    /// Current season for the age group
    /// </summary>
    [JsonPropertyName("season")]
    public string Season { get; set; } = string.Empty;

    /// <summary>
    /// All seasons this age group has been active
    /// </summary>
    [JsonPropertyName("seasons")]
    public List<string> Seasons { get; set; } = new List<string>();

    /// <summary>
    /// Default squad size for teams in this age group (4, 5, 7, 9, or 11)
    /// </summary>
    [JsonPropertyName("defaultSquadSize")]
    public int DefaultSquadSize { get; set; }

    /// <summary>
    /// Optional description of the age group
    /// </summary>
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    /// <summary>
    /// List of coordinators for this age group
    /// </summary>
    [JsonPropertyName("coordinators")]
    public List<CoordinatorDto> Coordinators { get; set; } = new List<CoordinatorDto>();

    /// <summary>
    /// Number of teams in this age group
    /// </summary>
    [JsonPropertyName("teamCount")]
    public int TeamCount { get; set; }

    /// <summary>
    /// Number of players in this age group
    /// </summary>
    [JsonPropertyName("playerCount")]
    public int PlayerCount { get; set; }

    /// <summary>
    /// Whether this age group is archived
    /// </summary>
    [JsonPropertyName("isArchived")]
    public bool IsArchived { get; set; }
}

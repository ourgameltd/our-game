using System.Text.Json.Serialization;

namespace OurGame.Application.UseCases.Clubs.DTOs;

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

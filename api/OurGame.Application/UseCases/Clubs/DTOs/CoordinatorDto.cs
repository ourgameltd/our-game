using System.Text.Json.Serialization;

namespace OurGame.Application.UseCases.Clubs.DTOs;

/// <summary>
/// Data transfer object for age group coordinator information
/// </summary>
public class CoordinatorDto
{
    /// <summary>
    /// Unique identifier of the coordinator (coach)
    /// </summary>
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    /// <summary>
    /// First name of the coordinator
    /// </summary>
    [JsonPropertyName("firstName")]
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Last name of the coordinator
    /// </summary>
    [JsonPropertyName("lastName")]
    public string LastName { get; set; } = string.Empty;
}

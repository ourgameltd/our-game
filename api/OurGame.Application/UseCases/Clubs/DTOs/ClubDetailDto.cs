namespace OurGame.Application.UseCases.Clubs.DTOs;

/// <summary>
/// Detailed information about a club
/// </summary>
public class ClubDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;
    public string Logo { get; set; } = string.Empty;
    public string PrimaryColor { get; set; } = string.Empty;
    public string SecondaryColor { get; set; } = string.Empty;
    public string AccentColor { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Venue { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public int? FoundedYear { get; set; }
    public string History { get; set; } = string.Empty;
    public string Ethos { get; set; } = string.Empty;
    public List<string> Principles { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ClubStatisticsDto? Statistics { get; set; }
}

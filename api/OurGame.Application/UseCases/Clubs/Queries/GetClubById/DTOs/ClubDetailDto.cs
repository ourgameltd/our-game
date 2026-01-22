namespace OurGame.Application.UseCases.Clubs.Queries.GetClubById.DTOs;

/// <summary>
/// DTO for club detail information
/// </summary>
public class ClubDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;
    public string? Logo { get; set; }
    public ClubColorsDto Colors { get; set; } = new();
    public ClubLocationDto Location { get; set; } = new();
    public int? Founded { get; set; }
    public string? History { get; set; }
    public string? Ethos { get; set; }
    public List<string> Principles { get; set; } = new();
}

/// <summary>
/// DTO for club colors
/// </summary>
public class ClubColorsDto
{
    public string Primary { get; set; } = string.Empty;
    public string Secondary { get; set; } = string.Empty;
    public string Accent { get; set; } = string.Empty;
}

/// <summary>
/// DTO for club location information
/// </summary>
public class ClubLocationDto
{
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Venue { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}

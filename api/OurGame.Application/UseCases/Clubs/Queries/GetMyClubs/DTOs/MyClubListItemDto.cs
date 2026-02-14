namespace OurGame.Application.UseCases.Clubs.Queries.GetMyClubs.DTOs;

/// <summary>
/// Represents a club in the user's clubs list with summary counts
/// </summary>
public class MyClubListItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;
    public string? Logo { get; set; }
    public string? PrimaryColor { get; set; }
    public string? SecondaryColor { get; set; }
    public string? AccentColor { get; set; }
    public int? FoundedYear { get; set; }
    public int TeamCount { get; set; }
    public int PlayerCount { get; set; }
}

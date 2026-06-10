namespace OurGame.Application.UseCases.Clubs.Queries.GetKitsByClubId.DTOs;

/// <summary>
/// DTO for club kit information
/// </summary>
public class ClubKitDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string ShirtColor { get; set; } = string.Empty;
    public string? ShirtColor2 { get; set; }
    public string? StripType { get; set; }
    public string ShortsColor { get; set; } = string.Empty;
    public string SocksColor { get; set; } = string.Empty;
    public string? Season { get; set; }
    public bool IsActive { get; set; }
}

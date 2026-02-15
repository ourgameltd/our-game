namespace OurGame.Application.UseCases.Players.Queries.GetPlayerAlbum.DTOs;

public record PlayerAlbumPhotoDto
{
    public Guid Id { get; init; }
    public string Url { get; init; } = string.Empty;
    public string Thumbnail { get; init; } = string.Empty; // For now, set to same as Url (not in DB yet)
    public string? Caption { get; init; }
    public string Date { get; init; } = string.Empty; // ISO date string (YYYY-MM-DD)
    public string[] Tags { get; init; } = Array.Empty<string>();
}

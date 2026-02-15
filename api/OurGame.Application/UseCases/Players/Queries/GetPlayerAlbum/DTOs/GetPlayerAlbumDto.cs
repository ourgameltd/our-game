namespace OurGame.Application.UseCases.Players.Queries.GetPlayerAlbum.DTOs;

public record GetPlayerAlbumDto
{
    public Guid PlayerId { get; init; }
    public string PlayerName { get; init; } = string.Empty;
    public PlayerAlbumPhotoDto[] Photos { get; init; } = Array.Empty<PlayerAlbumPhotoDto>();
}

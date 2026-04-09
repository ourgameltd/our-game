namespace OurGame.Application.Services;

public interface IBlobStorageService
{
    /// <summary>
    /// Uploads a base64 data-URI image to blob storage and returns the public URL.
    /// If <paramref name="imageData"/> is already an HTTP(S) URL or is null/empty, it is returned unchanged.
    /// </summary>
    /// <param name="imageData">Base64 data URI (e.g. "data:image/png;base64,iVBOR...") or an existing URL.</param>
    /// <param name="containerName">The blob container name (e.g. "player-photos").</param>
    /// <param name="blobPrefix">Optional path prefix inside the container (e.g. player ID).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The public blob URL, the original URL, or empty string if input was null/empty.</returns>
    Task<string> UploadImageAsync(string? imageData, string containerName, string? blobPrefix = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a blob by its public URL. No-op if the URL is not a valid blob URL or the blob does not exist.
    /// </summary>
    Task DeleteImageAsync(string? blobUrl, CancellationToken cancellationToken = default);
}

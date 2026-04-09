using OurGame.Application.Services;

namespace OurGame.Application.Tests.TestInfrastructure;

/// <summary>
/// Stub IBlobStorageService for unit tests.
/// Returns the input value unchanged (URL passthrough or empty string for null/empty).
/// No actual blob storage interaction.
/// </summary>
public sealed class StubBlobStorageService : IBlobStorageService
{
    public Task<string> UploadImageAsync(string? imageData, string containerName, string? blobPrefix = null, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(imageData ?? string.Empty);
    }

    public Task DeleteImageAsync(string? blobUrl, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }
}

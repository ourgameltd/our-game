using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace OurGame.Application.Services;

public class BlobStorageService : IBlobStorageService
{
    private const long MaxImageSizeBytes = 5 * 1024 * 1024; // 5 MB

    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/bmp"
    };

    private static readonly Dictionary<string, string> ContentTypeToExtension = new(StringComparer.OrdinalIgnoreCase)
    {
        ["image/jpeg"] = ".jpg",
        ["image/png"] = ".png",
        ["image/gif"] = ".gif",
        ["image/webp"] = ".webp",
        ["image/svg+xml"] = ".svg",
        ["image/bmp"] = ".bmp"
    };

    private readonly BlobServiceClient _blobServiceClient;
    private readonly ILogger<BlobStorageService> _logger;

    public BlobStorageService(IConfiguration configuration, ILogger<BlobStorageService> logger)
    {
        _logger = logger;

        var connectionString = configuration["BlobStorage:ConnectionString"]
                               ?? configuration["AzureWebJobsStorage"];

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Blob storage connection string not found. Set 'BlobStorage:ConnectionString' or 'AzureWebJobsStorage'.");
        }

        _blobServiceClient = new BlobServiceClient(connectionString);
    }

    public async Task<string> UploadImageAsync(
        string? imageData,
        string containerName,
        string? blobPrefix = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(imageData))
        {
            return string.Empty;
        }

        // If it's already a URL, pass through unchanged
        if (imageData.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            imageData.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            return imageData;
        }

        // Parse base64 data URI: "data:<contentType>;base64,<data>"
        if (!imageData.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("Image data must be a data URI (data:image/...;base64,...) or an HTTP(S) URL.");
        }

        var (contentType, imageBytes) = ParseDataUri(imageData);

        // Validate content type
        if (!AllowedContentTypes.Contains(contentType))
        {
            throw new ArgumentException($"Unsupported image content type: '{contentType}'. Allowed types: {string.Join(", ", AllowedContentTypes)}.");
        }

        // Validate size
        if (imageBytes.Length > MaxImageSizeBytes)
        {
            throw new ArgumentException($"Image exceeds the maximum allowed size of {MaxImageSizeBytes / (1024 * 1024)} MB.");
        }

        // Determine file extension
        var extension = ContentTypeToExtension.GetValueOrDefault(contentType, ".bin");

        // Build blob name
        var blobName = string.IsNullOrWhiteSpace(blobPrefix)
            ? $"{Guid.NewGuid()}{extension}"
            : $"{blobPrefix}/{Guid.NewGuid()}{extension}";

        // Get or create container
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob, cancellationToken: cancellationToken);

        // Upload
        var blobClient = containerClient.GetBlobClient(blobName);
        using var stream = new MemoryStream(imageBytes);
        await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = contentType }, cancellationToken: cancellationToken);

        _logger.LogInformation("Uploaded image to blob {ContainerName}/{BlobName} ({Size} bytes)", containerName, blobName, imageBytes.Length);

        return blobClient.Uri.ToString();
    }

    public async Task DeleteImageAsync(string? blobUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(blobUrl))
        {
            return;
        }

        if (!Uri.TryCreate(blobUrl, UriKind.Absolute, out var uri))
        {
            return;
        }

        // Extract container and blob name from the URI path: /<container>/<blob>
        var segments = uri.AbsolutePath.TrimStart('/').Split('/', 2);
        if (segments.Length < 2)
        {
            return;
        }

        var containerName = segments[0];
        var blobName = segments[1];

        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            await containerClient.DeleteBlobIfExistsAsync(blobName, cancellationToken: cancellationToken);
            _logger.LogInformation("Deleted blob {ContainerName}/{BlobName}", containerName, blobName);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete blob {BlobUrl}", blobUrl);
        }
    }

    private static (string ContentType, byte[] Bytes) ParseDataUri(string dataUri)
    {
        // Format: data:[<mediatype>][;base64],<data>
        var commaIndex = dataUri.IndexOf(',');
        if (commaIndex < 0)
        {
            throw new ArgumentException("Invalid data URI format: missing comma separator.");
        }

        var header = dataUri[5..commaIndex]; // skip "data:"
        var base64Data = dataUri[(commaIndex + 1)..];

        var contentType = "application/octet-stream";
        if (header.EndsWith(";base64", StringComparison.OrdinalIgnoreCase))
        {
            contentType = header[..^7]; // remove ";base64"
        }
        else if (header.Length > 0)
        {
            contentType = header;
        }

        var bytes = Convert.FromBase64String(base64Data);
        return (contentType, bytes);
    }
}

using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OurGame.Application.Services;

namespace OurGame.Application.Tests;

public class BlobStorageServiceTests
{
    // A minimal valid 1x1 red PNG as base64
    private const string ValidPngBase64 =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

    private static string PngDataUri => $"data:image/png;base64,{ValidPngBase64}";

    private static BlobStorageService CreateService()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AzureWebJobsStorage"] = "UseDevelopmentStorage=true"
            })
            .Build();

        var logger = LoggerFactory.Create(_ => { }).CreateLogger<BlobStorageService>();
        return new BlobStorageService(config, logger);
    }

    [Fact]
    public async Task UploadImageAsync_NullInput_ReturnsEmptyString()
    {
        var service = CreateService();
        var result = await service.UploadImageAsync(null, "test-container");
        Assert.Equal(string.Empty, result);
    }

    [Fact]
    public async Task UploadImageAsync_EmptyInput_ReturnsEmptyString()
    {
        var service = CreateService();
        var result = await service.UploadImageAsync("", "test-container");
        Assert.Equal(string.Empty, result);
    }

    [Fact]
    public async Task UploadImageAsync_WhitespaceInput_ReturnsEmptyString()
    {
        var service = CreateService();
        var result = await service.UploadImageAsync("   ", "test-container");
        Assert.Equal(string.Empty, result);
    }

    [Fact]
    public async Task UploadImageAsync_HttpUrl_PassesThroughUnchanged()
    {
        var service = CreateService();
        var url = "https://example.com/images/photo.jpg";
        var result = await service.UploadImageAsync(url, "test-container");
        Assert.Equal(url, result);
    }

    [Fact]
    public async Task UploadImageAsync_HttpsUrl_PassesThroughUnchanged()
    {
        var service = CreateService();
        var url = "https://cdn.example.com/images/photo.png";
        var result = await service.UploadImageAsync(url, "test-container");
        Assert.Equal(url, result);
    }

    [Fact]
    public async Task UploadImageAsync_InvalidDataUri_ThrowsArgumentException()
    {
        var service = CreateService();
        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.UploadImageAsync("not-a-data-uri", "test-container"));
    }

    [Fact]
    public async Task UploadImageAsync_UnsupportedContentType_ThrowsArgumentException()
    {
        var service = CreateService();
        var dataUri = $"data:application/pdf;base64,{ValidPngBase64}";
        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.UploadImageAsync(dataUri, "test-container"));
    }

    [Fact]
    public async Task UploadImageAsync_OversizedImage_ThrowsArgumentException()
    {
        var service = CreateService();
        // Create a base64 string representing > 5MB of data
        var largeBytes = new byte[6 * 1024 * 1024];
        var largeBase64 = Convert.ToBase64String(largeBytes);
        var dataUri = $"data:image/png;base64,{largeBase64}";

        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.UploadImageAsync(dataUri, "test-container"));
    }

    [Fact]
    public void Constructor_MissingConnectionString_ThrowsInvalidOperationException()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();

        var logger = LoggerFactory.Create(_ => { }).CreateLogger<BlobStorageService>();

        Assert.Throws<InvalidOperationException>(() => new BlobStorageService(config, logger));
    }

    [Fact]
    public void Constructor_WithBlobStorageConnectionString_Succeeds()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["BlobStorage:ConnectionString"] = "UseDevelopmentStorage=true"
            })
            .Build();

        var logger = LoggerFactory.Create(_ => { }).CreateLogger<BlobStorageService>();
        var service = new BlobStorageService(config, logger);

        Assert.NotNull(service);
    }

    [Fact]
    public void Constructor_WithAzureWebJobsStorage_Succeeds()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AzureWebJobsStorage"] = "UseDevelopmentStorage=true"
            })
            .Build();

        var logger = LoggerFactory.Create(_ => { }).CreateLogger<BlobStorageService>();
        var service = new BlobStorageService(config, logger);

        Assert.NotNull(service);
    }

    [Fact]
    public async Task DeleteImageAsync_NullUrl_DoesNotThrow()
    {
        var service = CreateService();
        await service.DeleteImageAsync(null);
    }

    [Fact]
    public async Task DeleteImageAsync_EmptyUrl_DoesNotThrow()
    {
        var service = CreateService();
        await service.DeleteImageAsync("");
    }

    [Fact]
    public async Task DeleteImageAsync_InvalidUrl_DoesNotThrow()
    {
        var service = CreateService();
        await service.DeleteImageAsync("not-a-url");
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using OurGame.Persistence.Models;

namespace OurGame.Persistence;

public sealed class OurGameContextFactory : IDesignTimeDbContextFactory<OurGameContext>
{
    public OurGameContext CreateDbContext(string[] args)
    {
        var configuration = BuildConfiguration();

        var connectionString =
            configuration.GetConnectionString("DefaultConnection") ??
            configuration["ConnectionStrings:DefaultConnection"] ??
            Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection") ??
            Environment.GetEnvironmentVariable("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "No connection string found. Set ConnectionStrings__DefaultConnection env var or provide OurGame.Api/appsettings.json with ConnectionStrings:DefaultConnection.");
        }

        var optionsBuilder = new DbContextOptionsBuilder<OurGameContext>();
        optionsBuilder.UseSqlServer(connectionString);

        return new OurGameContext(optionsBuilder.Options);
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var basePath = FindApiProjectDirectory(Directory.GetCurrentDirectory());

        return new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
            .AddEnvironmentVariables()
            .Build();
    }

    private static string FindApiProjectDirectory(string startDirectory)
    {
        // Walk upwards until we find the OurGame.Api project directory.
        var directoryInfo = new DirectoryInfo(startDirectory);

        while (directoryInfo is not null)
        {
            var candidate = Path.Combine(directoryInfo.FullName, "OurGame.Api");
            if (Directory.Exists(candidate))
            {
                return candidate;
            }

            // If already inside OurGame.Api, use it.
            if (string.Equals(directoryInfo.Name, "OurGame.Api", StringComparison.OrdinalIgnoreCase))
            {
                return directoryInfo.FullName;
            }

            directoryInfo = directoryInfo.Parent;
        }

        // Fallback: current directory.
        return startDirectory;
    }
}

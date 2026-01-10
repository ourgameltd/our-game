using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OurGame.Persistence;
using OurGame.Persistence.Models;

Console.WriteLine("OurGame Database Seeder");
Console.WriteLine("======================");
Console.WriteLine();

// Load configuration from OurGame.Api
var config = new ConfigurationBuilder()
    .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "..", "OurGame.Api"))
    .AddJsonFile("appsettings.json", optional: false)
    .AddEnvironmentVariables()
    .Build();

var connectionString = config.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    Console.WriteLine("❌ Error: No connection string found in appsettings.json");
    return 1;
}

Console.WriteLine($"📡 Connection: {connectionString.Split(';')[0]}...");
Console.WriteLine();

try
{
    // Use the same DI setup as the app to get UseAsyncSeeding configured
    var services = new ServiceCollection();
    services.AddPersistenceDependencies(config);
    
    var serviceProvider = services.BuildServiceProvider();
    await using var scope = serviceProvider.CreateAsyncScope();
    var context = scope.ServiceProvider.GetRequiredService<OurGameContext>();
    
    Console.WriteLine("⏳ Seeding database...");
    
    // Call the internal seeding method directly
    await context.Database.EnsureCreatedAsync();
    
    Console.WriteLine("✅ Database seeded successfully!");
    Console.WriteLine();
    
    // Show counts
    Console.WriteLine("Seeded records:");
    Console.WriteLine($"  Clubs: {await context.Clubs.CountAsync()}");
    Console.WriteLine($"  Age Groups: {await context.AgeGroups.CountAsync()}");
    Console.WriteLine($"  Coaches: {await context.Coaches.CountAsync()}");
    Console.WriteLine($"  Players: {await context.Players.CountAsync()}");
    Console.WriteLine($"  Teams: {await context.Teams.CountAsync()}");
    Console.WriteLine($"  Kits: {await context.Kits.CountAsync()}");
    Console.WriteLine($"  Users: {await context.Users.CountAsync()}");
    Console.WriteLine($"  Player Attributes: {await context.PlayerAttributes.CountAsync()}");
    
    return 0;
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Error seeding database: {ex.Message}");
    Console.WriteLine(ex.StackTrace);
    return 1;
}

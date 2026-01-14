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
    
    // Call the internal seeding method directly - this creates tables and seeds base entities
    await context.Database.EnsureCreatedAsync();
    
    // Seed additional data not handled by UseAsyncSeeding
    // Note: Order matters due to foreign key dependencies
    
    if (!await context.Formations.AnyAsync())
    {
        Console.WriteLine("  📐 Seeding formations...");
        var formations = OurGame.Persistence.Data.SeedData.FormationSeedData.GetFormations();
        await context.Formations.AddRangeAsync(formations);
        await context.SaveChangesAsync();
    }
    
    if (!await context.FormationPositions.AnyAsync())
    {
        Console.WriteLine("  📍 Seeding formation positions...");
        var positions = OurGame.Persistence.Data.SeedData.FormationPositionSeedData.GetFormationPositions();
        await context.FormationPositions.AddRangeAsync(positions);
        await context.SaveChangesAsync();
    }
    
    if (!await context.TacticPrinciples.AnyAsync())
    {
        Console.WriteLine("  🎯 Seeding tactic principles...");
        var tactics = OurGame.Persistence.Data.SeedData.TacticPrincipleSeedData.GetTacticPrinciples();
        await context.TacticPrinciples.AddRangeAsync(tactics);
        await context.SaveChangesAsync();
    }
    
    if (!await context.Drills.AnyAsync())
    {
        Console.WriteLine("  🏃 Seeding drills...");
        var drills = OurGame.Persistence.Data.SeedData.DrillSeedData.GetDrills();
        await context.Drills.AddRangeAsync(drills);
        await context.SaveChangesAsync();
    }
    
    // Skip drill templates if they cause initialization errors
    try
    {
        if (!await context.DrillTemplates.AnyAsync())
        {
            Console.WriteLine("  📋 Seeding drill templates...");
            var templates = OurGame.Persistence.Data.SeedData.DrillTemplateSeedData.GetDrillTemplates();
            await context.DrillTemplates.AddRangeAsync(templates);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping drill templates: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.TrainingSessions.AnyAsync())
        {
            Console.WriteLine("  📅 Seeding training sessions...");
            var sessions = OurGame.Persistence.Data.SeedData.TrainingSessionSeedData.GetTrainingSessions();
            await context.TrainingSessions.AddRangeAsync(sessions);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping training sessions: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.Matches.AnyAsync())
        {
            Console.WriteLine("  ⚽ Seeding matches...");
            var matches = OurGame.Persistence.Data.SeedData.MatchSeedData.GetMatches();
            await context.Matches.AddRangeAsync(matches);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping matches: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    // Seed child/related entities
    try
    {
        if (!await context.TemplateDrills.AnyAsync())
        {
            Console.WriteLine("  🔗 Seeding template drills...");
            var templateDrills = OurGame.Persistence.Data.SeedData.TemplateDrillSeedData.GetTemplateDrills();
            await context.TemplateDrills.AddRangeAsync(templateDrills);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping template drills: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.SessionDrills.AnyAsync())
        {
            Console.WriteLine("  🔗 Seeding session drills...");
            var sessionDrills = OurGame.Persistence.Data.SeedData.SessionDrillSeedData.GetSessionDrills();
            await context.SessionDrills.AddRangeAsync(sessionDrills);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping session drills: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.SessionAttendances.AnyAsync())
        {
            Console.WriteLine("  ✓ Seeding session attendance...");
            var attendance = OurGame.Persistence.Data.SeedData.SessionAttendanceSeedData.GetSessionAttendance();
            await context.SessionAttendances.AddRangeAsync(attendance);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping session attendance: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.MatchLineups.AnyAsync())
        {
            Console.WriteLine("  📋 Seeding match lineups...");
            var lineups = OurGame.Persistence.Data.SeedData.MatchLineupSeedData.GetMatchLineups();
            await context.MatchLineups.AddRangeAsync(lineups);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping match lineups: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.LineupPlayers.AnyAsync())
        {
            Console.WriteLine("  👥 Seeding lineup players...");
            var lineupPlayers = OurGame.Persistence.Data.SeedData.LineupPlayerSeedData.GetLineupPlayers();
            await context.LineupPlayers.AddRangeAsync(lineupPlayers);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping lineup players: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.MatchReports.AnyAsync())
        {
            Console.WriteLine("  📊 Seeding match reports...");
            var reports = OurGame.Persistence.Data.SeedData.MatchReportSeedData.GetMatchReports();
            await context.MatchReports.AddRangeAsync(reports);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping match reports: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.Goals.AnyAsync())
        {
            Console.WriteLine("  ⚽ Seeding goals...");
            var goals = OurGame.Persistence.Data.SeedData.GoalSeedData.GetGoals();
            if (goals.Any())
            {
                await context.Goals.AddRangeAsync(goals);
                await context.SaveChangesAsync();
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping goals: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.Goals.AnyAsync())
        {
            Console.WriteLine("  ⚽ Seeding goals...");
            var goals = OurGame.Persistence.Data.SeedData.GoalSeedData.GetGoals();
            await context.Goals.AddRangeAsync(goals);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping goals: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.Cards.AnyAsync())
        {
            Console.WriteLine("  🟨 Seeding cards...");
            var cards = OurGame.Persistence.Data.SeedData.CardSeedData.GetCards();
            await context.Cards.AddRangeAsync(cards);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping cards: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.PerformanceRatings.AnyAsync())
        {
            Console.WriteLine("  ⭐ Seeding performance ratings...");
            var ratings = OurGame.Persistence.Data.SeedData.PerformanceRatingSeedData.GetPerformanceRatings();
            await context.PerformanceRatings.AddRangeAsync(ratings);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping performance ratings: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.EmergencyContacts.AnyAsync())
        {
            Console.WriteLine("  📞 Seeding emergency contacts...");
            var contacts = OurGame.Persistence.Data.SeedData.EmergencyContactSeedData.GetEmergencyContacts();
            await context.EmergencyContacts.AddRangeAsync(contacts);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping emergency contacts: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.Injuries.AnyAsync())
        {
            Console.WriteLine("  🤕 Seeding injuries...");
            var injuries = OurGame.Persistence.Data.SeedData.InjurySeedData.GetInjuries();
            await context.Injuries.AddRangeAsync(injuries);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping injuries: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.SessionCoaches.AnyAsync())
        {
            Console.WriteLine("  👨‍🏫 Seeding session coaches...");
            var sessionCoaches = OurGame.Persistence.Data.SeedData.SessionCoachSeedData.GetSessionCoaches();
            await context.SessionCoaches.AddRangeAsync(sessionCoaches);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping session coaches: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.AttributeEvaluations.AnyAsync())
        {
            Console.WriteLine("  📋 Seeding attribute evaluations...");
            var evaluations = OurGame.Persistence.Data.SeedData.AttributeEvaluationSeedData.GetAttributeEvaluations();
            await context.AttributeEvaluations.AddRangeAsync(evaluations);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping attribute evaluations: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.EvaluationAttributes.AnyAsync())
        {
            Console.WriteLine("  ⭐ Seeding evaluation attributes...");
            var evalAttrs = OurGame.Persistence.Data.SeedData.EvaluationAttributeSeedData.GetEvaluationAttributes();
            await context.EvaluationAttributes.AddRangeAsync(evalAttrs);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping evaluation attributes: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.PositionOverrides.AnyAsync())
        {
            Console.WriteLine("  🔧 Seeding position overrides...");
            var overrides = OurGame.Persistence.Data.SeedData.PositionOverrideSeedData.GetPositionOverrides();
            await context.PositionOverrides.AddRangeAsync(overrides);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping position overrides: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.PerformanceRatings.AnyAsync())
        {
            Console.WriteLine("  ⭐ Seeding performance ratings...");
            var ratings = OurGame.Persistence.Data.SeedData.PerformanceRatingSeedData.GetPerformanceRatings();
            await context.PerformanceRatings.AddRangeAsync(ratings);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping performance ratings: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.MatchSubstitutions.AnyAsync())
        {
            Console.WriteLine("  🔄 Seeding match substitutions...");
            var substitutions = OurGame.Persistence.Data.SeedData.MatchSubstitutionSeedData.GetSubstitutions();
            await context.MatchSubstitutions.AddRangeAsync(substitutions);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping match substitutions: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.PlayerReports.AnyAsync())
        {
            Console.WriteLine("  📝 Seeding player reports...");
            var playerReports = OurGame.Persistence.Data.SeedData.PlayerReportSeedData.GetPlayerReports();
            await context.PlayerReports.AddRangeAsync(playerReports);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping player reports: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.DevelopmentPlans.AnyAsync())
        {
            Console.WriteLine("  📈 Seeding development plans...");
            var devPlans = OurGame.Persistence.Data.SeedData.DevelopmentPlanSeedData.GetDevelopmentPlans();
            await context.DevelopmentPlans.AddRangeAsync(devPlans);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping development plans: {ex.InnerException?.Message ?? ex.Message}");
    }
    
    try
    {
        if (!await context.DevelopmentGoals.AnyAsync())
        {
            Console.WriteLine("  🎯 Seeding development goals...");
            var devGoals = OurGame.Persistence.Data.SeedData.DevelopmentGoalSeedData.GetDevelopmentGoals();
            await context.DevelopmentGoals.AddRangeAsync(devGoals);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ⚠️  Skipping development goals: {ex.InnerException?.Message ?? ex.Message}");
    }
    
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
    Console.WriteLine($"  Formations: {await context.Formations.CountAsync()}");
    Console.WriteLine($"  Formation Positions: {await context.FormationPositions.CountAsync()}");
    Console.WriteLine($"  Drills: {await context.Drills.CountAsync()}");
    Console.WriteLine($"  Drill Templates: {await context.DrillTemplates.CountAsync()}");
    Console.WriteLine($"  Template Drills: {await context.TemplateDrills.CountAsync()}");
    Console.WriteLine($"  Training Sessions: {await context.TrainingSessions.CountAsync()}");
    Console.WriteLine($"  Session Drills: {await context.SessionDrills.CountAsync()}");
    Console.WriteLine($"  Session Attendance: {await context.SessionAttendances.CountAsync()}");
    Console.WriteLine($"  Matches: {await context.Matches.CountAsync()}");
    Console.WriteLine($"  Match Lineups: {await context.MatchLineups.CountAsync()}");
    Console.WriteLine($"  Lineup Players: {await context.LineupPlayers.CountAsync()}");
    Console.WriteLine($"  Match Reports: {await context.MatchReports.CountAsync()}");
    Console.WriteLine($"  Goals: {await context.Goals.CountAsync()}");
    Console.WriteLine($"  Cards: {await context.Cards.CountAsync()}");
    Console.WriteLine($"  Performance Ratings: {await context.PerformanceRatings.CountAsync()}");
    Console.WriteLine($"  Emergency Contacts: {await context.EmergencyContacts.CountAsync()}");
    Console.WriteLine($"  Injuries: {await context.Injuries.CountAsync()}");
    Console.WriteLine($"  Session Coaches: {await context.SessionCoaches.CountAsync()}");
    Console.WriteLine($"  Attribute Evaluations: {await context.AttributeEvaluations.CountAsync()}");
    Console.WriteLine($"  Evaluation Attributes: {await context.EvaluationAttributes.CountAsync()}");
    Console.WriteLine($"  Position Overrides: {await context.PositionOverrides.CountAsync()}");
    Console.WriteLine($"  Match Substitutions: {await context.MatchSubstitutions.CountAsync()}");
    Console.WriteLine($"  Player Reports: {await context.PlayerReports.CountAsync()}");
    Console.WriteLine($"  Development Plans: {await context.DevelopmentPlans.CountAsync()}");
    Console.WriteLine($"  Development Goals: {await context.DevelopmentGoals.CountAsync()}");
    
    return 0;
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Error seeding database: {ex.Message}");
    Console.WriteLine(ex.StackTrace);
    return 1;
}

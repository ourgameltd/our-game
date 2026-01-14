using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OurGame.Persistence;
using OurGame.Persistence.Models;

Console.WriteLine("OurGame Database Seeder");
Console.WriteLine("======================");
Console.WriteLine();

// Find the OurGame.Api directory
var currentDir = Directory.GetCurrentDirectory();
var apiDir = FindApiDirectory(currentDir);

if (apiDir == null)
{
    Console.WriteLine("❌ Error: Could not find OurGame.Api directory");
    return 1;
}

Console.WriteLine($"📁 Using config from: {apiDir}");

// Load configuration from OurGame.Api
var config = new ConfigurationBuilder()
    .SetBasePath(apiDir)
    .AddJsonFile("appsettings.json", optional: true)
    .AddJsonFile("local.settings.json", optional: true)
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
    // Use the same DI setup as the app
    var services = new ServiceCollection();
    services.AddPersistenceDependencies(config);
    
    var serviceProvider = services.BuildServiceProvider();
    await using var scope = serviceProvider.CreateAsyncScope();
    var context = scope.ServiceProvider.GetRequiredService<OurGameContext>();
    
    Console.WriteLine("⏳ Checking database...");
    
    // Check if database exists
    var canConnect = await context.Database.CanConnectAsync();
    
    if (!canConnect)
    {
        Console.WriteLine("⏳ Creating database and applying migrations...");
        await context.Database.MigrateAsync();
        Console.WriteLine("✅ Database created successfully");
    }
    else
    {
        // Database exists, check migration state
        var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
        var appliedMigrations = await context.Database.GetAppliedMigrationsAsync();
        
        Console.WriteLine($"✅ Database exists with {appliedMigrations.Count()} migrations recorded");
        
        if (pendingMigrations.Any())
        {
            Console.WriteLine($"⏳ Applying {pendingMigrations.Count()} pending migration(s)...");
            try
            {
                await context.Database.MigrateAsync();
                Console.WriteLine("✅ Migrations applied successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️  Warning: Migration error (tables may already exist): {ex.Message}");
                Console.WriteLine("⏳ Attempting to seed existing database...");
            }
        }
        else
        {
            Console.WriteLine("✅ Database is up to date");
        }
    }
    
    Console.WriteLine("⏳ Seeding database...");
    
    // Seed base entities (order matters due to foreign keys)
    if (!await context.Clubs.AnyAsync())
    {
        Console.WriteLine("  🏟️  Seeding clubs...");
        var clubs = OurGame.Persistence.Data.SeedData.ClubSeedData.GetClubs();
        await context.Clubs.AddRangeAsync(clubs);
        await context.SaveChangesAsync();
    }
    
    if (!await context.AgeGroups.AnyAsync())
    {
        Console.WriteLine("  👦 Seeding age groups...");
        var ageGroups = OurGame.Persistence.Data.SeedData.AgeGroupSeedData.GetAgeGroups();
        await context.AgeGroups.AddRangeAsync(ageGroups);
        await context.SaveChangesAsync();
    }
    
    if (!await context.Users.AnyAsync())
    {
        Console.WriteLine("  👤 Seeding users...");
        var users = OurGame.Persistence.Data.SeedData.UserSeedData.GetUsers();
        await context.Users.AddRangeAsync(users);
        await context.SaveChangesAsync();
    }
    
    if (!await context.Coaches.AnyAsync())
    {
        Console.WriteLine("  👨‍🏫 Seeding coaches...");
        var coaches = OurGame.Persistence.Data.SeedData.CoachSeedData.GetCoaches();
        await context.Coaches.AddRangeAsync(coaches);
        await context.SaveChangesAsync();
    }
    
    if (!await context.Teams.AnyAsync())
    {
        Console.WriteLine("  ⚽ Seeding teams...");
        var teams = OurGame.Persistence.Data.SeedData.TeamSeedData.GetTeams();
        await context.Teams.AddRangeAsync(teams);
        await context.SaveChangesAsync();
    }
    
    if (!await context.TeamCoaches.AnyAsync())
    {
        Console.WriteLine("  🔗 Seeding team coaches...");
        var teamCoaches = OurGame.Persistence.Data.SeedData.TeamCoachSeedData.GetTeamCoaches();
        await context.TeamCoaches.AddRangeAsync(teamCoaches);
        await context.SaveChangesAsync();
    }
    
    if (!await context.Players.AnyAsync())
    {
        Console.WriteLine("  🏃 Seeding players...");
        var players = OurGame.Persistence.Data.SeedData.PlayerSeedData.GetPlayers();
        await context.Players.AddRangeAsync(players);
        await context.SaveChangesAsync();
    }
    
    if (!await context.PlayerTeams.AnyAsync())
    {
        Console.WriteLine("  🔗 Seeding player teams...");
        var playerTeams = OurGame.Persistence.Data.SeedData.PlayerTeamSeedData.GetPlayerTeams();
        await context.PlayerTeams.AddRangeAsync(playerTeams);
        await context.SaveChangesAsync();
    }
    
    if (!await context.PlayerAgeGroups.AnyAsync())
    {
        Console.WriteLine("  🔗 Seeding player age groups...");
        var playerAgeGroups = OurGame.Persistence.Data.SeedData.PlayerAgeGroupSeedData.GetPlayerAgeGroups();
        await context.PlayerAgeGroups.AddRangeAsync(playerAgeGroups);
        await context.SaveChangesAsync();
    }
    
    if (!await context.PlayerAttributes.AnyAsync())
    {
        Console.WriteLine("  ⭐ Seeding player attributes...");
        var attributes = OurGame.Persistence.Data.SeedData.PlayerAttributeSeedData.GetPlayerAttributes();
        await context.PlayerAttributes.AddRangeAsync(attributes);
        await context.SaveChangesAsync();
    }
    
    if (!await context.Kits.AnyAsync())
    {
        Console.WriteLine("  👕 Seeding kits...");
        var kits = OurGame.Persistence.Data.SeedData.KitSeedData.GetKits();
        await context.Kits.AddRangeAsync(kits);
        await context.SaveChangesAsync();
    }
    
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
        
        // Add additional tactic principles
        var extraTactics = OurGame.Persistence.Data.SeedData.TacticPrincipleExtraSeedData.GetAdditionalTacticPrinciples();
        await context.TacticPrinciples.AddRangeAsync(extraTactics);
        await context.SaveChangesAsync();
    }
    
    if (!await context.Drills.AnyAsync())
    {
        Console.WriteLine("  🏃 Seeding drills...");
        var drills = OurGame.Persistence.Data.SeedData.DrillSeedData.GetDrills();
        await context.Drills.AddRangeAsync(drills);
        await context.SaveChangesAsync();
    }
    
    if (!await context.DrillLinks.AnyAsync())
    {
        Console.WriteLine("  🔗 Seeding drill links...");
        var links = OurGame.Persistence.Data.SeedData.DrillLinkSeedData.GetDrillLinks();
        await context.DrillLinks.AddRangeAsync(links);
        await context.SaveChangesAsync();
    }
    
    if (!await context.DrillTemplates.AnyAsync())
    {
        Console.WriteLine("  📋 Seeding drill templates...");
        var templates = OurGame.Persistence.Data.SeedData.DrillTemplateSeedData.GetDrillTemplates();
        await context.DrillTemplates.AddRangeAsync(templates);
        await context.SaveChangesAsync();
    }
    
    if (!await context.TrainingSessions.AnyAsync())
    {
        Console.WriteLine("  📅 Seeding training sessions...");
        var sessions = OurGame.Persistence.Data.SeedData.TrainingSessionSeedData.GetTrainingSessions();
        await context.TrainingSessions.AddRangeAsync(sessions);
        await context.SaveChangesAsync();
    }
    
    if (!await context.Matches.AnyAsync())
    {
        Console.WriteLine("  ⚽ Seeding matches...");
        var matches = OurGame.Persistence.Data.SeedData.MatchSeedData.GetMatches();
        await context.Matches.AddRangeAsync(matches);
        await context.SaveChangesAsync();
    }
    
    // Seed child/related entities
    if (!await context.TemplateDrills.AnyAsync())
    {
        Console.WriteLine("  🔗 Seeding template drills...");
        var templateDrills = OurGame.Persistence.Data.SeedData.TemplateDrillSeedData.GetTemplateDrills();
        await context.TemplateDrills.AddRangeAsync(templateDrills);
        await context.SaveChangesAsync();
    }
    
    if (!await context.SessionDrills.AnyAsync())
    {
        Console.WriteLine("  🔗 Seeding session drills...");
        var sessionDrills = OurGame.Persistence.Data.SeedData.SessionDrillSeedData.GetSessionDrills();
        await context.SessionDrills.AddRangeAsync(sessionDrills);
        await context.SaveChangesAsync();
    }
    
    if (!await context.SessionAttendances.AnyAsync())
    {
        Console.WriteLine("  ✓ Seeding session attendance...");
        var attendance = OurGame.Persistence.Data.SeedData.SessionAttendanceSeedData.GetSessionAttendance();
        await context.SessionAttendances.AddRangeAsync(attendance);
        await context.SaveChangesAsync();
    }
    
    if (!await context.AppliedTemplates.AnyAsync())
    {
        Console.WriteLine("  📋 Seeding applied templates...");
        var appliedTemplates = OurGame.Persistence.Data.SeedData.AppliedTemplateSeedData.GetAppliedTemplates();
        await context.AppliedTemplates.AddRangeAsync(appliedTemplates);
        await context.SaveChangesAsync();
    }
    
    if (!await context.AgeGroupCoordinators.AnyAsync())
    {
        Console.WriteLine("  👨‍💼 Seeding age group coordinators...");
        var coordinators = OurGame.Persistence.Data.SeedData.AgeGroupCoordinatorSeedData.GetAgeGroupCoordinators();
        await context.AgeGroupCoordinators.AddRangeAsync(coordinators);
        await context.SaveChangesAsync();
    }
    
    if (!await context.PlayerImages.AnyAsync())
    {
        Console.WriteLine("  📸 Seeding player images...");
        var images = OurGame.Persistence.Data.SeedData.PlayerImageSeedData.GetPlayerImages();
        await context.PlayerImages.AddRangeAsync(images);
        await context.SaveChangesAsync();
    }
    
    if (!await context.PlayerParents.AnyAsync())
    {
        Console.WriteLine("  👨‍👩‍👦 Seeding player parents...");
        var parents = OurGame.Persistence.Data.SeedData.PlayerParentSeedData.GetPlayerParents();
        await context.PlayerParents.AddRangeAsync(parents);
        await context.SaveChangesAsync();
    }
    
    if (!await context.MatchLineups.AnyAsync())
    {
        Console.WriteLine("  📋 Seeding match lineups...");
        var lineups = OurGame.Persistence.Data.SeedData.MatchLineupSeedData.GetMatchLineups();
        await context.MatchLineups.AddRangeAsync(lineups);
        await context.SaveChangesAsync();
    }
    
    if (!await context.MatchCoaches.AnyAsync())
    {
        Console.WriteLine("  👨‍🏫 Seeding match coaches...");
        var matchCoaches = OurGame.Persistence.Data.SeedData.MatchCoachSeedData.GetMatchCoaches();
        await context.MatchCoaches.AddRangeAsync(matchCoaches);
        await context.SaveChangesAsync();
    }
    
    if (!await context.LineupPlayers.AnyAsync())
    {
        Console.WriteLine("  👥 Seeding lineup players...");
        var lineupPlayers = OurGame.Persistence.Data.SeedData.LineupPlayerSeedData.GetLineupPlayers();
        await context.LineupPlayers.AddRangeAsync(lineupPlayers);
        await context.SaveChangesAsync();
    }
    
    if (!await context.MatchReports.AnyAsync())
    {
        Console.WriteLine("  📊 Seeding match reports...");
        var reports = OurGame.Persistence.Data.SeedData.MatchReportSeedData.GetMatchReports();
        await context.MatchReports.AddRangeAsync(reports);
        await context.SaveChangesAsync();
    }
    
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
    
    if (!await context.Cards.AnyAsync())
    {
        Console.WriteLine("  🟨 Seeding cards...");
        var cards = OurGame.Persistence.Data.SeedData.CardSeedData.GetCards();
        await context.Cards.AddRangeAsync(cards);
        await context.SaveChangesAsync();
    }
    
    if (!await context.PerformanceRatings.AnyAsync())
    {
        Console.WriteLine("  ⭐ Seeding performance ratings...");
        var ratings = OurGame.Persistence.Data.SeedData.PerformanceRatingSeedData.GetPerformanceRatings();
        await context.PerformanceRatings.AddRangeAsync(ratings);
        await context.SaveChangesAsync();
    }
    
    if (!await context.EmergencyContacts.AnyAsync())
    {
        Console.WriteLine("  📞 Seeding emergency contacts...");
        var contacts = OurGame.Persistence.Data.SeedData.EmergencyContactSeedData.GetEmergencyContacts();
        await context.EmergencyContacts.AddRangeAsync(contacts);
        await context.SaveChangesAsync();
    }
    
    if (!await context.Injuries.AnyAsync())
    {
        Console.WriteLine("  🤕 Seeding injuries...");
        var injuries = OurGame.Persistence.Data.SeedData.InjurySeedData.GetInjuries();
        await context.Injuries.AddRangeAsync(injuries);
        await context.SaveChangesAsync();
    }
    
    if (!await context.SessionCoaches.AnyAsync())
    {
        Console.WriteLine("  👨‍🏫 Seeding session coaches...");
        var sessionCoaches = OurGame.Persistence.Data.SeedData.SessionCoachSeedData.GetSessionCoaches();
        await context.SessionCoaches.AddRangeAsync(sessionCoaches);
        await context.SaveChangesAsync();
    }
    
    if (!await context.AttributeEvaluations.AnyAsync())
    {
        Console.WriteLine("  📋 Seeding attribute evaluations...");
        var evaluations = OurGame.Persistence.Data.SeedData.AttributeEvaluationSeedData.GetAttributeEvaluations();
        await context.AttributeEvaluations.AddRangeAsync(evaluations);
        await context.SaveChangesAsync();
    }
    
    if (!await context.EvaluationAttributes.AnyAsync())
    {
        Console.WriteLine("  ⭐ Seeding evaluation attributes...");
        var evalAttrs = OurGame.Persistence.Data.SeedData.EvaluationAttributeSeedData.GetEvaluationAttributes();
        await context.EvaluationAttributes.AddRangeAsync(evalAttrs);
        await context.SaveChangesAsync();
    }
    
    if (!await context.PositionOverrides.AnyAsync())
    {
        Console.WriteLine("  🔧 Seeding position overrides...");
        var overrides = OurGame.Persistence.Data.SeedData.PositionOverrideSeedData.GetPositionOverrides();
        await context.PositionOverrides.AddRangeAsync(overrides);
        await context.SaveChangesAsync();
    }
    
    if (!await context.TrainingPlans.AnyAsync())
    {
        Console.WriteLine("  📋 Seeding training plans...");
        var plans = OurGame.Persistence.Data.SeedData.TrainingPlanSeedData.GetTrainingPlans();
        await context.TrainingPlans.AddRangeAsync(plans);
        await context.SaveChangesAsync();
    }
    
    if (!await context.TrainingObjectives.AnyAsync())
    {
        Console.WriteLine("  🎯 Seeding training objectives...");
        var objectives = OurGame.Persistence.Data.SeedData.TrainingObjectiveSeedData.GetTrainingObjectives();
        await context.TrainingObjectives.AddRangeAsync(objectives);
        await context.SaveChangesAsync();
    }
    
    if (!await context.ProgressNotes.AnyAsync())
    {
        Console.WriteLine("  📝 Seeding progress notes...");
        var notes = OurGame.Persistence.Data.SeedData.ProgressNoteSeedData.GetProgressNotes();
        await context.ProgressNotes.AddRangeAsync(notes);
        await context.SaveChangesAsync();
    }
    
    if (!await context.PlayerReports.AnyAsync())
    {
        Console.WriteLine("  📝 Seeding player reports...");
        var playerReports = OurGame.Persistence.Data.SeedData.PlayerReportSeedData.GetPlayerReports();
        await context.PlayerReports.AddRangeAsync(playerReports);
        await context.SaveChangesAsync();
    }
    
    if (!await context.ReportDevelopmentActions.AnyAsync())
    {
        Console.WriteLine("  📋 Seeding report development actions...");
        var actions = OurGame.Persistence.Data.SeedData.ReportDevelopmentActionSeedData.GetReportDevelopmentActions();
        await context.ReportDevelopmentActions.AddRangeAsync(actions);
        await context.SaveChangesAsync();
    }
    
    if (!await context.SimilarProfessionals.AnyAsync())
    {
        Console.WriteLine("  ⚽ Seeding similar professionals...");
        var professionals = OurGame.Persistence.Data.SeedData.SimilarProfessionalSeedData.GetSimilarProfessionals();
        await context.SimilarProfessionals.AddRangeAsync(professionals);
        await context.SaveChangesAsync();
    }
    
    if (!await context.MatchSubstitutions.AnyAsync())
    {
        Console.WriteLine("  🔄 Seeding match substitutions...");
        var substitutions = OurGame.Persistence.Data.SeedData.MatchSubstitutionSeedData.GetSubstitutions();
        await context.MatchSubstitutions.AddRangeAsync(substitutions);
        await context.SaveChangesAsync();
    }
    
    if (!await context.DevelopmentPlans.AnyAsync())
    {
        Console.WriteLine("  📈 Seeding development plans...");
        var devPlans = OurGame.Persistence.Data.SeedData.DevelopmentPlanSeedData.GetDevelopmentPlans();
        await context.DevelopmentPlans.AddRangeAsync(devPlans);
        await context.SaveChangesAsync();
    }
    
    if (!await context.DevelopmentGoals.AnyAsync())
    {
        Console.WriteLine("  🎯 Seeding development goals...");
        var devGoals = OurGame.Persistence.Data.SeedData.DevelopmentGoalSeedData.GetDevelopmentGoals();
        await context.DevelopmentGoals.AddRangeAsync(devGoals);
        await context.SaveChangesAsync();
    }
    
    Console.WriteLine("✅ Database seeded successfully!");
    Console.WriteLine();
    
    // Show counts
    Console.WriteLine("Seeded records:");
    Console.WriteLine($"  Clubs: {await context.Clubs.CountAsync()}");
    Console.WriteLine($"  Age Groups: {await context.AgeGroups.CountAsync()}");
    Console.WriteLine($"  Users: {await context.Users.CountAsync()}");
    Console.WriteLine($"  Coaches: {await context.Coaches.CountAsync()}");
    Console.WriteLine($"  Teams: {await context.Teams.CountAsync()}");
    Console.WriteLine($"  Team Coaches: {await context.TeamCoaches.CountAsync()}");
    Console.WriteLine($"  Players: {await context.Players.CountAsync()}");
    Console.WriteLine($"  Player Teams: {await context.PlayerTeams.CountAsync()}");
    Console.WriteLine($"  Player Age Groups: {await context.PlayerAgeGroups.CountAsync()}");
    Console.WriteLine($"  Player Attributes: {await context.PlayerAttributes.CountAsync()}");
    Console.WriteLine($"  Kits: {await context.Kits.CountAsync()}");
    Console.WriteLine($"  Formations: {await context.Formations.CountAsync()}");
    Console.WriteLine($"  Formation Positions: {await context.FormationPositions.CountAsync()}");
    Console.WriteLine($"  Drills: {await context.Drills.CountAsync()}");
    Console.WriteLine($"  Training Sessions: {await context.TrainingSessions.CountAsync()}");
    Console.WriteLine($"  Matches: {await context.Matches.CountAsync()}");
    
    return 0;
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Error seeding database: {ex.Message}");
    Console.WriteLine(ex.StackTrace);
    return 1;
}

static string? FindApiDirectory(string startDirectory)
{
    var directoryInfo = new DirectoryInfo(startDirectory);

    while (directoryInfo != null)
    {
        // Look for OurGame.Api subdirectory
        var candidate = Path.Combine(directoryInfo.FullName, "OurGame.Api");
        if (Directory.Exists(candidate) && File.Exists(Path.Combine(candidate, "appsettings.json")))
        {
            return candidate;
        }

        // If we're already in the api folder, look for sibling
        if (directoryInfo.Name == "api" || directoryInfo.Name == "OurGame.Seeder")
        {
            var sibling = Path.Combine(directoryInfo.Parent?.FullName ?? directoryInfo.FullName, "OurGame.Api");
            if (Directory.Exists(sibling))
            {
                return sibling;
            }
        }

        directoryInfo = directoryInfo.Parent;
    }

    return null;
}

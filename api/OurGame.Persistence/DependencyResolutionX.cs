using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OurGame.Persistence.Data.SeedData;
using OurGame.Persistence.Models;

namespace OurGame.Persistence
{
    public static class DependencyResolutionX
    {
        public static void AddPersistenceDependencies(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<OurGameContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"))
                    .UseAsyncSeeding(async (context, _, cancellationToken) =>
                    {
                        var ourGameContext = (OurGameContext)context;
                        
                        // Seed in dependency order (parent tables first)
                        if (!await ourGameContext.Clubs.AnyAsync(cancellationToken))
                        {
                            await ourGameContext.Clubs.AddRangeAsync(ClubSeedData.GetClubs(), cancellationToken);
                            await ourGameContext.SaveChangesAsync(cancellationToken);
                        }

                        if (!await ourGameContext.AgeGroups.AnyAsync(cancellationToken))
                        {
                            await ourGameContext.AgeGroups.AddRangeAsync(AgeGroupSeedData.GetAgeGroups(), cancellationToken);
                            await ourGameContext.SaveChangesAsync(cancellationToken);
                        }

                        if (!await ourGameContext.Coaches.AnyAsync(cancellationToken))
                        {
                            await ourGameContext.Coaches.AddRangeAsync(CoachSeedData.GetCoaches(), cancellationToken);
                            await ourGameContext.SaveChangesAsync(cancellationToken);
                        }

                        if (!await ourGameContext.Players.AnyAsync(cancellationToken))
                        {
                            await ourGameContext.Players.AddRangeAsync(PlayerSeedData.GetPlayers(), cancellationToken);
                            await ourGameContext.SaveChangesAsync(cancellationToken);
                        }

                        if (!await ourGameContext.Teams.AnyAsync(cancellationToken))
                        {
                            await ourGameContext.Teams.AddRangeAsync(TeamSeedData.GetTeams(), cancellationToken);
                            await ourGameContext.SaveChangesAsync(cancellationToken);
                        }

                        if (!await ourGameContext.Kits.AnyAsync(cancellationToken))
                        {
                            await ourGameContext.Kits.AddRangeAsync(KitSeedData.GetKits(), cancellationToken);
                            await ourGameContext.SaveChangesAsync(cancellationToken);
                        }

                        if (!await ourGameContext.Users.AnyAsync(cancellationToken))
                        {
                            await ourGameContext.Users.AddRangeAsync(UserSeedData.GetUsers(), cancellationToken);
                            await ourGameContext.SaveChangesAsync(cancellationToken);
                        }

                        // Junction tables last
                        if (!await ourGameContext.PlayerAgeGroups.AnyAsync(cancellationToken))
                        {
                            await ourGameContext.PlayerAgeGroups.AddRangeAsync(PlayerAgeGroupSeedData.GetPlayerAgeGroups(), cancellationToken);
                            await ourGameContext.SaveChangesAsync(cancellationToken);
                        }

                        if (!await ourGameContext.PlayerTeams.AnyAsync(cancellationToken))
                        {
                            await ourGameContext.PlayerTeams.AddRangeAsync(PlayerTeamSeedData.GetPlayerTeams(), cancellationToken);
                            await ourGameContext.SaveChangesAsync(cancellationToken);
                        }

                        if (!await ourGameContext.TeamCoaches.AnyAsync(cancellationToken))
                        {
                            await ourGameContext.TeamCoaches.AddRangeAsync(TeamCoachSeedData.GetTeamCoaches(), cancellationToken);
                            await ourGameContext.SaveChangesAsync(cancellationToken);
                        }

                        if (!await ourGameContext.PlayerAttributes.AnyAsync(cancellationToken))
                        {
                            await ourGameContext.PlayerAttributes.AddRangeAsync(PlayerAttributeSeedData.GetPlayerAttributes(), cancellationToken);
                            await ourGameContext.SaveChangesAsync(cancellationToken);
                        }
                    }));
        }
    }
}

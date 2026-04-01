using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OurGame.Application.Services;
using OurGame.Persistence;

namespace OurGame.Application
{
    public static class DependencyResolutionX
    {
        public static void AddApplicationDependencies(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddPersistenceDependencies(configuration);
            services.AddScoped<IPushNotificationService, PushNotificationService>();
            services.AddScoped<IEmailService, AcsEmailService>();
        }
    }
}

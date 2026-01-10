using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using OurGame.Application;
using System.Reflection;
using System.Text.Json;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices((context, services) =>
    {
        // Configure Application Insights telemetry for isolated worker
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();

        // Configure JSON to use camelCase
        services.Configure<JsonSerializerOptions>(options =>
        {
            options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        });

        // Configure Swashbuckle for OpenAPI documentation
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "OurGame API",
                Version = "v1",
                Description = "Football Club Management Platform API - Comprehensive REST API for managing clubs, teams, players, matches, formations, and training sessions.",
                Contact = new OpenApiContact
                {
                    Name = "OurGame",
                    Email = "support@ourgame.com"
                }
            });

            // Include XML comments
            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
            {
                c.IncludeXmlComments(xmlPath);
            }

            // Enable annotations for better documentation
            c.EnableAnnotations();
        });

        // Add MediatR
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
            cfg.RegisterServicesFromAssembly(typeof(DependencyResolutionX).Assembly);
        });

        // Add Application dependencies
        services.AddApplicationDependencies(context.Configuration);
    })
    .Build();

host.Run();


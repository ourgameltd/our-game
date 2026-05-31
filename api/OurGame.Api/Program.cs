using Azure.Core.Serialization;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OurGame.Application;
using System.Text.Json;
using System.Text.Json.Serialization;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices((context, services) =>
    {
        // Configure Application Insights telemetry for isolated worker
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();

        // Configure JSON to use camelCase (for response serialization)
        services.Configure<JsonSerializerOptions>(options =>
        {
            options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            options.PropertyNameCaseInsensitive = true;
            options.Converters.Add(new JsonStringEnumConverter());
        });

        // Configure worker serializer for request deserialization (ReadFromJsonAsync)
        services.Configure<WorkerOptions>(options =>
        {
            var requestOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);
            requestOptions.Converters.Add(new JsonStringEnumConverter());
            options.Serializer = new JsonObjectSerializer(requestOptions);
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


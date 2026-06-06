using Azure.Core.Serialization;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OurGame.Application;
using OurGame.Application.Abstractions;
using OurGame.Application.Services;
using OurGame.Api.Services;
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

        // Register IB2CUserService: LocalB2CUserService for development, B2CGraphService for production
        if (context.HostingEnvironment.IsDevelopment())
        {
            services.AddScoped<IB2CUserService, LocalB2CUserService>();
        }
        else
        {
            services.Configure<B2CGraphOptions>(context.Configuration.GetSection(B2CGraphOptions.SectionName));
            services.AddScoped<IB2CUserService, B2CGraphService>();
        }
    })
    .Build();

host.Run();


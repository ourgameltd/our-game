---
domain: API
technology: [Azure Functions v4, .NET 8, OpenAPI 3.0, MediatR]
categories: [HTTP Triggers, REST API, Authentication]
related:
  - api/OurGame.Api/Program.cs
  - api/OurGame.Api/OurGame.Api.csproj
  - api/OurGame.Api/host.json
  - api/OurGame.Api/openapi.json
  - api/OurGame.Application/UseCases/
---

# OurGame.Api

Azure Functions v4 (.NET 8 Isolated Worker) project containing all HTTP trigger functions. Each function delegates to MediatR handlers in the Application layer.

## Child Folders

| Folder | Purpose |
|---|---|
| `Functions/` | HTTP trigger function classes organised by domain |
| `Attributes/` | Custom attributes (e.g. `AllowAnonymousEndpointAttribute`) |
| `Extensions/` | Extension methods for function context and HTTP request handling |
| `Properties/` | Service dependency configuration files |

## Key Files

| File | Purpose |
|---|---|
| `Program.cs` | Host builder configuration — DI, JSON serialisation, MediatR, App Insights |
| `host.json` | Azure Functions runtime settings, OpenAPI info, Application Insights sampling |
| `openapi.json` | Generated OpenAPI 3.0 specification |
| `local.settings.json` | Local development settings (connection strings, runtime config) |
| `appsettings.json` | Application configuration (frontend base URL) |
| `OurGame.Api.csproj` | Project file with NuGet dependencies |

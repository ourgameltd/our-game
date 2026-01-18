# OpenAPI Client Generation Guide

This guide explains how to generate the TypeScript API client from the OpenAPI specification after adding new endpoints.

## Prerequisites

- Azure Functions Core Tools installed
- Node.js and npm installed
- `swagger-typescript-api` package (already in package.json)

## Step-by-Step Process

### 1. Start the Azure Functions Locally

First, ensure your local database is running (if using Docker):

```powershell
# Check if SQL Server container is running
docker ps

# If not running, start it
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
```

start azurite

```powershell
azurite --queuePort 10011
```

Then start the Azure Functions API:

```powershell
cd api/OurGame.Api
func start
```

The API will start on `http://localhost:7071` and the OpenAPI endpoint will be available at:
- **OpenAPI UI**: `http://localhost:7071/api/swagger/ui`
- **OpenAPI JSON**: `http://localhost:7071/api/swagger.json`

### 2. Verify the New Endpoint in OpenAPI Spec

Open your browser and navigate to:
```
http://localhost:7071/api/swagger/ui
```

You should see the new endpoint `GET /v1/clubs/{clubId}/age-groups` listed under the **Clubs** tag with:
- Path parameters (clubId)
- Query parameters (includeArchived, season)
- Response schemas (AgeGroupListItemDto, CoordinatorDto)

### 3. Generate TypeScript Client

With the API running, open a new terminal and run:

```powershell
cd web
npm run generate:api
```

This command will:
1. Fetch the OpenAPI spec from `http://localhost:7071/api/swagger.json`
2. Generate TypeScript interfaces in `src/api/generated.ts`
3. Include all DTOs, request/response types, and API structures

### 4. Verify Generated Types

Check `web/src/api/generated.ts` for the new types:

```typescript
// Should include:
export interface AgeGroupListItemDto {
  id?: string;
  clubId?: string;
  name?: string;
  code?: string;
  level?: string;
  season?: string;
  seasons?: string[];
  defaultSquadSize?: number;
  description?: string;
  coordinators?: CoordinatorDto[];
  teamCount?: number;
  playerCount?: number;
  isArchived?: boolean;
}

export interface CoordinatorDto {
  id?: string;
  firstName?: string;
  lastName?: string;
}
```

### 5. Update API Client (Already Done)

The `web/src/api/client.ts` file has been updated to include:

```typescript
// New method in clubs namespace
clubs: {
  getAgeGroups: (clubId: string, includeArchived?: boolean, season?: string) => {
    // Implementation with query parameters
  }
}

// New method in ageGroups namespace (same implementation)
ageGroups: {
  getByClub: (clubId: string, includeArchived?: boolean, season?: string) => {
    // Implementation with query parameters
  }
}
```

### 6. Use in Components

Use the new React hooks in your components:

```typescript
import { useClubAgeGroups } from '@/api';

function MyComponent({ clubId }: { clubId: string }) {
  const { data, isLoading, error } = useClubAgeGroups(
    clubId,
    false, // includeArchived
    '2024/25' // season filter
  );
  
  // Use the data...
}
```

## OpenAPI Attributes Reference

When adding new endpoints, ensure you include these attributes:

```csharp
[Function("GetClubAgeGroups")]
[OpenApiOperation(
    operationId: "GetClubAgeGroups",
    tags: new[] { "Clubs" },
    Summary = "Get club age groups",
    Description = "Retrieves a list of age groups within a specific club"
)]
[OpenApiParameter(
    name: "clubId",
    In = ParameterLocation.Path,
    Required = true,
    Type = typeof(string),
    Description = "The club ID (GUID)"
)]
[OpenApiParameter(
    name: "includeArchived",
    In = ParameterLocation.Query,
    Required = false,
    Type = typeof(bool),
    Description = "Include archived age groups (default: false)"
)]
[OpenApiResponseWithBody(
    statusCode: HttpStatusCode.OK,
    contentType: "application/json",
    bodyType: typeof(ApiResponse<List<AgeGroupListItemDto>>),
    Description = "Age groups retrieved successfully"
)]
```

## JSON Serialization Attributes

Ensure all DTOs have `JsonPropertyName` attributes for camelCase serialization:

```csharp
using System.Text.Json.Serialization;

public class AgeGroupListItemDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }
    
    [JsonPropertyName("clubId")]
    public Guid ClubId { get; set; }
    
    // ... more properties
}
```

## Troubleshooting

### API Won't Start
- Check database connection string in `local.settings.json`
- Ensure SQL Server is running (Docker or local instance)
- Check for compilation errors: `dotnet build`

### OpenAPI Spec Not Updated
- Stop and restart the Functions app
- Clear the build output: `dotnet clean` then `dotnet build`
- Check that OpenAPI attributes are on the function method

### TypeScript Generation Fails
- Ensure the Functions app is running
- Check the OpenAPI endpoint is accessible: `curl http://localhost:7071/api/swagger.json`
- Verify `swagger-typescript-api` is installed: `npm install`

### Types Don't Match
- Ensure DTOs have `JsonPropertyName` attributes
- Regenerate the client after API changes
- Check that camelCase is configured in `Program.cs`

## Current Implementation Status

✅ **Backend (API)**
- `GET /v1/clubs/{clubId}/age-groups` endpoint implemented
- DTOs: `AgeGroupListItemDto`, `CoordinatorDto`
- Query handler with EF Core
- OpenAPI attributes configured
- JSON serialization attributes added

✅ **Frontend (Web)**
- TypeScript types defined in `client.ts`
- API client methods: `clubs.getAgeGroups()`, `ageGroups.getByClub()`
- React hooks: `useClubAgeGroups()`, `useAgeGroups()`
- Example component: `ClubAgeGroupsList.tsx`

⏳ **Next Steps**
1. Run Functions app locally
2. Generate TypeScript client: `npm run generate:api`
3. Verify types in `generated.ts`
4. Test the endpoint with Postman or Swagger UI
5. Use the component in your pages

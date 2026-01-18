# GET /api/clubs/{clubId}/age-groups - Implementation Summary

## Overview

This document summarizes the complete implementation of the `GET /api/clubs/{clubId}/age-groups` endpoint, including backend API, OpenAPI documentation, and frontend integration.

---

## Backend Implementation

### 1. DTOs (Data Transfer Objects)

**Location**: `api/OurGame.Application/UseCases/Clubs/DTOs/`

#### CoordinatorDto.cs
```csharp
using System.Text.Json.Serialization;

public class CoordinatorDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }
    
    [JsonPropertyName("firstName")]
    public string FirstName { get; set; } = string.Empty;
    
    [JsonPropertyName("lastName")]
    public string LastName { get; set; } = string.Empty;
}
```

#### AgeGroupListItemDto.cs
Contains full age group information including:
- Basic details (id, clubId, name, code, level)
- Season information (season, seasons array)
- Squad size (defaultSquadSize)
- Counts (teamCount, playerCount)
- Coordinators list
- Archive status

All properties have `[JsonPropertyName]` attributes for camelCase serialization.

### 2. Query & Handler

**Location**: `api/OurGame.Application/UseCases/Clubs/Queries/`

#### GetClubAgeGroupsQuery.cs
```csharp
public class GetClubAgeGroupsQuery : IQuery<List<AgeGroupListItemDto>>
{
    public Guid ClubId { get; }
    public bool IncludeArchived { get; }
    public string? Season { get; }
}
```

#### GetClubAgeGroupsHandler.cs
Key features:
- Validates club exists (throws `NotFoundException`)
- Efficient EF Core queries with `AsNoTracking()`
- Fetches age groups with team/player counts
- Loads coordinators in separate optimized query
- Parses comma-separated seasons string
- Orders by level (senior → reserve → amateur → youth) then by code

### 3. Azure Function Endpoint

**Location**: `api/OurGame.Api/Functions/ClubFunctions.cs`

```csharp
[Function("GetClubAgeGroups")]
[OpenApiOperation(operationId: "GetClubAgeGroups", tags: new[] { "Clubs" })]
[OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true)]
[OpenApiParameter(name: "includeArchived", In = ParameterLocation.Query, Required = false)]
[OpenApiParameter(name: "season", In = ParameterLocation.Query, Required = false)]
[OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, bodyType: typeof(ApiResponse<List<AgeGroupListItemDto>>))]
public async Task<HttpResponseData> GetClubAgeGroups(
    [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/age-groups")] HttpRequestData req,
    string clubId)
```

**Features**:
- Validates GUID format (400 Bad Request)
- Parses query parameters
- Returns 404 if club not found
- Returns 500 on internal errors
- Full OpenAPI documentation

---

## Frontend Implementation

### Important Note on TypeScript Types

**DO NOT manually create TypeScript types!** The types will be auto-generated from the OpenAPI specification.

### Steps to Complete Frontend Integration

1. **Start the API locally**:
   ```powershell
   cd api/OurGame.Api
   func start
   ```

2. **Generate TypeScript client** (in new terminal):
   ```powershell
   cd web
   npm run generate:api
   ```

3. **Verify generated types** in `web/src/api/generated.ts`:
   ```typescript
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

4. **Update imports** in `client.ts` to use generated types:
   ```typescript
   import type { 
     AgeGroupListItemDto,
     CoordinatorDto,
     // ... other generated types
   } from './generated';
   ```

5. **Update API client methods** with proper types:
   ```typescript
   clubs: {
     getAgeGroups: (clubId: string, includeArchived?: boolean, season?: string) => {
       // ... query parameter building
       return fetchApi<ApiResponse<AgeGroupListItemDto[]>>(
         `/v1/clubs/${clubId}/age-groups${queryString ? `?${queryString}` : ''}`
       );
     }
   }
   ```

6. **Update hooks** with generated types:
   ```typescript
   export function useClubAgeGroups(
     clubId: string | undefined,
     includeArchived?: boolean,
     season?: string
   ): UseApiState<AgeGroupListItemDto[]>
   ```

### 1. TypeScript Types (After Generation)

**Location**: `web/src/api/client.ts`

```typescript
export interface CoordinatorDto {
  id: string;
  firstName: string;
  lastName: string;
}

export interface AgeGroupListItemDto {
  id: string;
  clubId: string;
  name: string;
  code: string;
  level: 'youth' | 'amateur' | 'reserve' | 'senior';
  season: string;
  seasons: string[];
  defaultSquadSize: number;
  description?: string;
  coordinators: CoordinatorDto[];
  teamCount: number;
  playerCount: number;
  isArchived: boolean;
}
```

### 2. API Client Methods

**Location**: `web/src/api/client.ts`

```typescript
export const apiClient = {
  clubs: {
    getAgeGroups: (clubId: string, includeArchived?: boolean, season?: string) => {
      // Builds query string with parameters
      // Returns ApiResponse<AgeGroupListItemDto[]>
    }
  },
  
  ageGroups: {
    getByClub: (clubId: string, includeArchived?: boolean, season?: string) => {
      // Same implementation as clubs.getAgeGroups
    }
  }
};
```

### 3. React Hooks

**Location**: `web/src/api/hooks.ts`

```typescript
// Hook using clubs.getAgeGroups
export function useClubAgeGroups(
  clubId: string | undefined,
  includeArchived?: boolean,
  season?: string
): UseApiState<AgeGroupListItemDto[]>

// Hook using ageGroups.getByClub
export function useAgeGroups(
  clubId: string | undefined,
  includeArchived?: boolean,
  season?: string
): UseApiState<AgeGroupListItemDto[]>
```

Both hooks return:
```typescript
{
  data: AgeGroupListItemDto[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

### 4. Example Component

**Location**: `web/src/components/club/ClubAgeGroupsList.tsx`

Features:
- Filter by archived status
- Filter by season
- Grid layout with responsive cards
- Shows coordinators, team/player counts
- Color-coded by level
- Archive status indicator
- Loading and error states

---

## API Request/Response Examples

### Request

```http
GET /api/v1/clubs/8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b/age-groups?includeArchived=false&season=2024/25
Host: api.ourgame.com
api-version: 1.0
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "clubId": "8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b",
      "name": "2014s",
      "code": "2014",
      "level": "youth",
      "season": "2024/25",
      "seasons": ["2024/25", "2023/24"],
      "defaultSquadSize": 7,
      "description": "Under-11 age group",
      "coordinators": [
        {
          "id": "staff-1",
          "firstName": "John",
          "lastName": "Smith"
        }
      ],
      "teamCount": 2,
      "playerCount": 24,
      "isArchived": false
    }
  ]
}
```

---

## OpenAPI Specification

The endpoint is fully documented in the OpenAPI spec with:

- **Operation ID**: `GetClubAgeGroups`
- **Tags**: `Clubs`
- **Path Parameters**: `clubId` (required, UUID)
- **Query Parameters**:
  - `includeArchived` (optional, boolean)
  - `season` (optional, string)
- **Responses**:
  - 200: Success with `AgeGroupListItemDto[]`
  - 400: Bad Request (invalid club ID)
  - 404: Not Found (club doesn't exist)
  - 500: Internal Server Error

---

## Testing

### Using Swagger UI
1. Start Functions: `cd api/OurGame.Api && func start`
2. Open: `http://localhost:7071/api/swagger/ui`
3. Find: **GET /v1/clubs/{clubId}/age-groups**
4. Click "Try it out"
5. Enter clubId and optional parameters
6. Click "Execute"

### Using the React Hook

```typescript
import { useClubAgeGroups } from '@/api';

function AgeGroupsPage() {
  const { data, isLoading, error } = useClubAgeGroups(
    'club-id-here',
    false, // don't include archived
    '2024/25' // season filter
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map(ag => (
        <div key={ag.id}>
          <h3>{ag.name}</h3>
          <p>{ag.teamCount} teams, {ag.playerCount} players</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Files Created/Modified

### Backend (C#)
- ✅ `OurGame.Application/UseCases/Clubs/DTOs/CoordinatorDto.cs` (new)
- ✅ `OurGame.Application/UseCases/Clubs/DTOs/AgeGroupListItemDto.cs` (new)
- ✅ `OurGame.Application/UseCases/Clubs/Queries/GetClubAgeGroupsQuery.cs` (new)
- ✅ `OurGame.Application/UseCases/Clubs/Queries/GetClubAgeGroupsHandler.cs` (new)
- ✅ `OurGame.Api/Functions/ClubFunctions.cs` (modified - added endpoint)

### Frontend (TypeScript)
- ✅ `web/src/api/client.ts` (modified - added types and methods)
- ✅ `web/src/api/index.ts` (modified - exported new types)
- ✅ `web/src/api/hooks.ts` (modified - added/updated hooks)
- ✅ `web/src/components/club/ClubAgeGroupsList.tsx` (new)

### Documentation
- ✅ `docs/api/get-endpoints-task-list.md` (updated - marked completed)
- ✅ `docs/api/openapi-generation-guide.md` (new)
- ✅ `docs/api/endpoints/06-clubs-age-groups.md` (existing spec)

---

## Next Steps

1. **Generate OpenAPI Client**:
   ```bash
   cd api/OurGame.Api
   func start
   # In new terminal:
   cd web
   npm run generate:api
   ```

2. **Test the Endpoint**:
   - Use Swagger UI at `http://localhost:7071/api/swagger/ui`
   - Or use the React component in a page

3. **Deploy**:
   - Backend: Deploy to Azure Functions
   - Frontend: Deploy to Azure Static Web Apps
   - Verify production endpoint works

---

## Related Endpoints (To Be Implemented)

- `GET /api/clubs/{clubId}/teams` - List all teams for a club
- `GET /api/clubs/{clubId}/players` - List all players for a club
- `GET /api/clubs/{clubId}/coaches` - List all coaches for a club
- `GET /api/age-groups/{ageGroupId}` - Get age group details
- `GET /api/age-groups/{ageGroupId}/teams` - List teams in an age group

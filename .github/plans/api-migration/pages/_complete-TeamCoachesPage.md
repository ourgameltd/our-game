# Migration Plan: TeamCoachesPage (Completed)

Status: **Completed**

This plan migrates the team coaching staff page from static demo data to the real API and adds the missing team-coach management endpoints (assign/remove/update role).

---

## Scope

Frontend page:
- `web/src/pages/teams/TeamCoachesPage.tsx`

Static data to remove:
- `getTeamById` from `@data/teams`
- `getCoachesByTeamId` from `@data/coaches`
- `getCoachesByClubId` from `@data/coaches`

Required REST endpoints (public routes are actually `v1/*` in this repo; SWA exposes them under `/api/v1/*`):
- `GET /api/teams/{teamId}/coaches`
- `POST /api/teams/{teamId}/coaches`
- `DELETE /api/teams/{teamId}/coaches/{coachId}`
- `PUT /api/teams/{teamId}/coaches/{coachId}/role`

---

## Repo Reality Check (What Already Exists)

Backend:
- `GET v1/teams/{teamId}/coaches` already exists in `api/OurGame.Api/Functions/TeamFunctions.cs` and is backed by `api/OurGame.Application/UseCases/Teams/Queries/GetCoachesByTeamId/*`.

Frontend:
- `apiClient.teams.getCoaches(teamId)` exists in `web/src/api/client.ts`.
- `useTeamCoaches(teamId)` exists in `web/src/api/hooks.ts`.
- `useClubCoaches(clubId)` exists and can replace `getCoachesByClubId`.

Gaps:
- No API endpoints yet for assign/remove/update-role.
- `TeamCoachesPage.tsx` still uses static demo data.
- Role-string mismatch exists: backend returns `HeadCoach`/`AssistantCoach` etc while UI components (e.g., `CoachCard`) expect kebab-case (`head-coach`). Mapping is required.

---

## Key Design Decision (Must Be Resolved First)

The database table `TeamCoaches` currently has **no Role column** (role exists only on `Coaches.Role`). The required endpoints are team-scoped and imply role is per team assignment.

Choose one:

### Option A (Recommended): Role per team assignment
Add `Role` (int) to `TeamCoaches` and treat it as the authoritative “coach role for this team”.
- Pros: Matches required endpoints exactly; doesn’t force a coach’s role to be the same for every team.
- Cons: Requires a DB migration and small updates to existing queries.

### Option B (Schema-free): Role is global per coach
Implement `PUT /teams/{teamId}/coaches/{coachId}/role` by updating `Coaches.Role`, guarded by “coach is assigned to team”.
- Pros: No DB change.
- Cons: Semantically odd; changing role for one team changes it everywhere.

This plan assumes **Option A**.

---

## Backend Implementation Tasks (Sequential)

### 1) Add DB support for per-team role (Option A)

Files:
- `api/OurGame.Persistence/Migrations/*` (new migration)
- `api/OurGame.Persistence/Models/TeamCoach.cs` (add `Role` property)

Tasks:
- Add `Role INT NOT NULL` to `TeamCoaches`.
- Backfill `TeamCoaches.Role` from `Coaches.Role` for existing rows (one-time SQL in the migration).

Dependency:
- Required before implementing `POST` and `PUT role` in a way that persists the role.

### 2) Application layer: add commands + DTOs

Handlers (new):
- `api/OurGame.Application/UseCases/Teams/Commands/AssignCoachToTeam/AssignCoachToTeamHandler.cs`
- `api/OurGame.Application/UseCases/Teams/Commands/RemoveCoachFromTeam/RemoveCoachFromTeamHandler.cs`
- `api/OurGame.Application/UseCases/Teams/Commands/UpdateTeamCoachRole/UpdateTeamCoachRoleHandler.cs`

DTOs (new; in each action folder under `DTOs/`):
- `AssignCoachToTeamRequestDto` (coachId, role)
- `UpdateTeamCoachRoleRequestDto` (role)
- (Optional) `TeamCoachAssignmentDto` if you want to return a consistent payload on POST/PUT

Notes:
- Keep handlers SQL-first (use `_db.Database.ExecuteSqlInterpolatedAsync` / `_db.Database.SqlQueryRaw<T>`), matching existing patterns (e.g. `UpdateCoachById` command).
- Use `NotFoundException` and `ValidationException` where appropriate; don’t add try/catch in handlers.

Dependency:
- Needed before API Functions can call MediatR.

### 3) API layer: add Azure Functions in `Functions/Teams/`

Create new function files (new):
- `api/OurGame.Api/Functions/Teams/GetTeamCoachesFunction.cs`
- `api/OurGame.Api/Functions/Teams/AssignTeamCoachFunction.cs`
- `api/OurGame.Api/Functions/Teams/RemoveTeamCoachFunction.cs`
- `api/OurGame.Api/Functions/Teams/UpdateTeamCoachRoleFunction.cs`

Also refactor (recommended to avoid route duplication and satisfy “Teams folder” requirement):
- Modify `api/OurGame.Api/Functions/TeamFunctions.cs` to remove the existing `GetTeamCoaches` method once `GetTeamCoachesFunction.cs` is in place.

OpenAPI documentation:
- Add `[OpenApiOperation]`, `[OpenApiParameter]`, `[OpenApiRequestBody]`, and `[OpenApiResponseWithBody]` / `WithoutBody`.
- Use tags: `Teams`.

Routes:
- `GET v1/teams/{teamId}/coaches`
- `POST v1/teams/{teamId}/coaches`
- `DELETE v1/teams/{teamId}/coaches/{coachId}`
- `PUT v1/teams/{teamId}/coaches/{coachId}/role`

Response conventions:
- `GET`: `200 OK` with `ApiResponse<List<TeamCoachDto>>`
- `POST`: `201 Created` with `ApiResponse<TeamCoachDto>` (or `ApiResponse<List<TeamCoachDto>>` if you prefer “return refreshed list”)
- `DELETE`: `204 NoContent` (or `200` with `ApiResponse<object>` if you need the wrapper everywhere)
- `PUT role`: `200 OK` with `ApiResponse<TeamCoachDto>`

Auth:
- Match existing patterns: `AuthorizationLevel.Anonymous` + `req.GetUserId()` check.

Dependency:
- Requires commands/handlers.

### 4) Frontend API client: add methods and (optional) mutation hooks

Client methods (modify):
- `web/src/api/client.ts`
  - `apiClient.teams.assignCoach(teamId, request)`
  - `apiClient.teams.removeCoach(teamId, coachId)`
  - `apiClient.teams.updateCoachRole(teamId, coachId, request)`

Hooks (modify):
- `web/src/api/hooks.ts`
  - `useAssignTeamCoach()`
  - `useRemoveTeamCoach(teamId)`
  - `useUpdateTeamCoachRole(teamId, coachId)`

Dependency:
- Requires backend routes to be stable.

---

## Frontend Implementation Tasks

### 5) Update TeamCoachesPage to use API data

Modify:
- `web/src/pages/teams/TeamCoachesPage.tsx`

Replace data sources:
- Replace `getTeamById(teamId)` with `useTeamOverview(teamId)` (for `isArchived` and “not found” behavior).
- Replace `getCoachesByTeamId(teamId)` with `useTeamCoaches(teamId)`.
- Replace `getCoachesByClubId(team.clubId)` with `useClubCoaches(clubId)`.

Important mapping step (to keep existing components):
- `CoachCard` expects the app’s `Coach` type (full object + kebab-case role).
- Use `ClubCoachDto` (from `useClubCoaches`) as the source of “full coach details” and compute team membership using the IDs from `useTeamCoaches`.
- Add a small mapper utility:
  - New/modify `web/src/api/mappers.ts`: `mapClubCoachDtoToCoach()` + `mapApiCoachRoleToUiRole()`

UI behavior updates:
- Keep the same layout and components; only replace data + wire actions.
- Loading: show skeletons inside the “All Coaches” section and inside the modal list (not a full-page loader).
- Errors: show inline alert/notice near the section title (or reuse the existing “Team not found” block for 404).
- Empty: keep the existing empty-state panel.

### 6) Wire up actions (Assign / Remove / Update Role)

Assign flow (modal):
- Clicking the green `Plus` on an available coach calls `POST`.
- On success: close modal (or keep open) and refetch `useTeamCoaches` (and/or optimistically update).

Remove flow (CoachCard action button):
- Clicking ✕ calls `DELETE`.
- On success: refetch `useTeamCoaches`.

Role update flow (if UI exposes role changes):
- Current `TeamCoachesPage` does not have a role-edit control. Add role editing only if it already exists elsewhere in this page design.
- If role edit is required, reuse existing select controls (from reference data) and call `PUT role`.

Archived teams:
- Preserve existing behavior: if `team.isArchived`, disable assign/remove and show the archived notice.

---

## SQL Required (Handlers)

All SQL should be executed via EF Core raw SQL APIs (interpolated or parameterized), consistent with existing patterns.

### GET coaches for a team
Used by existing handler (update to use `tc.Role` if Option A is chosen):

```sql
SELECT
  c.Id,
  c.FirstName,
  c.LastName,
  c.Photo,
  tc.Role,
  c.IsArchived
FROM TeamCoaches tc
INNER JOIN Coaches c ON c.Id = tc.CoachId
WHERE tc.TeamId = @teamId
ORDER BY tc.Role, c.LastName, c.FirstName;
```

### POST assign coach to team

Validation:

```sql
SELECT t.ClubId, t.IsArchived
FROM Teams t
WHERE t.Id = @teamId;
```

```sql
SELECT c.ClubId, c.IsArchived
FROM Coaches c
WHERE c.Id = @coachId;
```

```sql
SELECT 1
FROM TeamCoaches
WHERE TeamId = @teamId AND CoachId = @coachId;
```

Insert:

```sql
INSERT INTO TeamCoaches (Id, TeamId, CoachId, Role, AssignedAt)
VALUES (@id, @teamId, @coachId, @role, @assignedAt);
```

### DELETE remove coach from team

```sql
DELETE FROM TeamCoaches
WHERE TeamId = @teamId AND CoachId = @coachId;
```

### PUT update coach role for team

```sql
UPDATE TeamCoaches
SET Role = @role
WHERE TeamId = @teamId AND CoachId = @coachId;
```

---

## Dependencies Between Tasks

Hard dependencies:
- DB migration (if Option A) → commands/handlers → API Functions → frontend mutations

Soft dependencies:
- Frontend can migrate “read-only display” to use `useTeamCoaches` + `useClubCoaches` even before POST/DELETE/PUT land, as long as GET and club-coaches endpoints are available.

---

## Parallel vs Sequential Work Plan

### Sequential Phase 0 (Decision)
1) Decide Option A vs B for role persistence.

### Parallel Phase 1 (Backend + Frontend read-only)
Backend stream:
- Add commands/handlers for POST/DELETE/PUT.
- Add function endpoints in `Functions/Teams/`.

Frontend stream:
- Update `TeamCoachesPage.tsx` to use `useTeamOverview`, `useTeamCoaches`, `useClubCoaches`.
- Add mapping utilities in `web/src/api/mappers.ts`.
- Add section-level skeletons.

### Sequential Phase 2 (Mutations + UX)
- Add client methods and mutation hooks.
- Wire assign/remove actions.
- Add refetch/optimistic update.

---

## Edge Cases to Handle

Backend:
- `teamId` / `coachId` invalid GUID → `400 BadRequest`.
- Team not found → `404 NotFound`.
- Coach not found → `404 NotFound`.
- Team archived → `400 BadRequest` (or `409 Conflict`) for POST/DELETE/PUT.
- Coach archived → `400 BadRequest` for POST.
- Coach belongs to a different club than the team → `400 BadRequest`.
- Coach already assigned → `400 BadRequest`.
- Deleting an assignment that doesn’t exist → `404 NotFound`.

Frontend:
- Club coaches loaded but team coaches still loading (and vice versa) → show skeleton only where needed.
- “Assign coach” while list is stale → disable buttons while submitting.
- Show safe fallbacks for missing coach fields (photo, specializations).

---

## Open Questions

1) Do we want coach role per team (`TeamCoaches.Role`) or global (`Coaches.Role`)? The required endpoint design strongly suggests per team.
2) Should POST return the updated full coach object, the assignment, or just `204` with a client refetch?
3) Should DELETE return `204` (pure REST) or a wrapped `ApiResponse` (consistency)?

---

## Completion Checklist

- [x] Identify and replace static data dependencies
- [x] Confirm existing GET endpoint and frontend hook
- [x] Define required new endpoints and their responsibilities
- [x] Specify backend files to add/modify (Functions + Handlers + DTOs)
- [x] Provide SQL strings for GET/POST/DELETE/PUT
- [x] Provide frontend mapping + skeleton-loading approach
- [x] Define task dependencies and parallelization plan

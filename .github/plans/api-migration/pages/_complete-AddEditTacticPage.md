# Migration Plan (Complete): AddEditTacticPage → API

## Status
Plan complete (ready for implementation).

## Scope
Migrate the tactics create/edit page to use API calls instead of static sample data, without recreating UI components.

- Page: `web/src/pages/tactics/AddEditTacticPage.tsx`
- Replace static tactic fetch + save behavior with:
  - `GET /api/v1/tactics/{id}` (edit mode)
  - `POST /api/v1/tactics` (create)
  - `PUT /api/v1/tactics/{id}` (update)
- Keep formations client-side (reference data): `web/src/data/formations.ts` (`sampleFormations`, `getFormationById`).
- Keep “real-time preview” position resolution client-side for UX.

## Repository Findings (Important)
### Data model reality (backend)
“Tactics” are stored in the `Formations` table:
- A tactic is a `Formation` row with `IsSystemFormation = false` and `ParentFormationId != null`.
- Inheritance is modelled via `ParentTacticId` (self-reference on `Formations`).
- Position deltas are stored in `PositionOverrides` keyed by `FormationId` + `PositionIndex`.
- Principles are stored in `TacticPrinciples` keyed by `FormationId`.
- Scope is represented by link tables: `FormationClubs`, `FormationAgeGroups`, `FormationTeams`.

### Existing implemented endpoints (already in repo)
List-by-scope is implemented (and already used by the web app):
- `GET /api/v1/clubs/{clubId}/tactics`
- `GET /api/v1/clubs/{clubId}/age-groups/{ageGroupId}/tactics`
- `GET /api/v1/clubs/{clubId}/age-groups/{ageGroupId}/teams/{teamId}/tactics`

File: `api/OurGame.Api/Functions/TacticFunctions.cs`
Handler: `api/OurGame.Application/UseCases/Tactics/Queries/GetTacticsByScope/GetTacticsByScopeHandler.cs`

### Not yet implemented (required for this migration)
- `GET /api/v1/tactics/{id}`
- `POST /api/v1/tactics`
- `PUT /api/v1/tactics/{id}`

## Plan Summary
Implement new Tactics endpoints (Get-by-id, Create, Update) following the existing Azure Functions isolated worker + MediatR + SQL pattern used by Matches/Players. Expose these via the existing web API client (`web/src/api/client.ts`) and hooks (`web/src/api/hooks.ts`). Update AddEditTacticPage to load existing tactics asynchronously in edit mode, submit to POST/PUT, and display per-section skeleton placeholders and error states.

---

## 1) File Inventory (read/check first)

### Frontend (page + UI contracts)
1. `web/src/pages/tactics/AddEditTacticPage.tsx` (target page)
2. `web/src/components/tactics/TacticPitchEditor.tsx` (expects `tactic` + `parentFormation` and uses `tactic.positionOverrides`)
3. `web/src/components/tactics/PrinciplePanel.tsx` (uses `resolvedPositions` buttons/labels; currently imports `ResolvedPosition` type from `web/src/data/tactics.ts`)
4. `web/src/types/index.ts` (Formation/Tactic/override/principle types)
5. `web/src/data/formations.ts` (reference formations + positions)
6. `web/src/data/tactics.ts` (current static tactic data + position resolution logic)
7. `web/src/api/client.ts` (current API methods; add `tactics.getById/create/update`)
8. `web/src/api/hooks.ts` (add hooks for tactic detail + mutations; follow existing patterns)
9. `web/src/pages/tactics/TacticsListPage.tsx` (existing loading skeleton and error patterns)

### Backend (API + handler patterns)
1. `api/OurGame.Api/Functions/TacticFunctions.cs` (existing tactics list; confirms auth + response wrapper style)
2. `api/OurGame.Api/Functions/MatchFunctions.cs` and `api/OurGame.Api/Functions/Players/UpdatePlayerFunction.cs` (create/update + error handling patterns)
3. `api/OurGame.Api/Extensions/HttpRequestDataX.cs` (auth extraction; `req.GetUserId()`)
4. `api/OurGame.Application/UseCases/Matches/Commands/CreateMatch/*` and `UpdateMatch/*` (command + DTO organization)
5. `api/OurGame.Application/UseCases/Tactics/Queries/GetTacticsByScope/*` (existing tactics area conventions)

### Database schema / EF models / migrations
1. `api/OurGame.Persistence/Models/Formation.cs`
2. `api/OurGame.Persistence/Models/FormationPosition.cs`
3. `api/OurGame.Persistence/Models/PositionOverride.cs`
4. `api/OurGame.Persistence/Models/TacticPrinciple.cs`
5. `api/OurGame.Persistence/Models/FormationClub.cs`, `FormationAgeGroup.cs`, `FormationTeam.cs`
6. `api/OurGame.Persistence/Migrations/OurGameContextModelSnapshot.cs` (authoritative “current schema”)
7. `api/OurGame.Persistence/Data/Configurations/*Formation*.cs` (relationship behaviour)

---

## 2) API Contract (what Add/Edit needs)

### GET /api/v1/tactics/{id} (edit mode)
Purpose: populate the edit form.

Response DTO should include (minimum):
- `id`, `name`, `parentFormationId`, `parentTacticId?`, `squadSize`, `summary`, `style`, `tags[]`
- `scope` (club/ageGroup/team + ids), derived from link tables
- `positionOverrides` keyed by `positionIndex` (x/y/direction)
- `principles[]` with `id`, `title`, `description`, `positionIndices[]`

Notes:
- Do not require formations API for this page (formation positions remain client reference data).
- Do not compute resolved positions server-side for Add/Edit; compute client-side for real-time preview.

### POST /api/v1/tactics (create)
Purpose: persist a new tactic and its related rows.

Request DTO should include:
- `name`, `parentFormationId`, optional `parentTacticId`
- `scope` (type + ids)
- `summary`, `style`, `tags[]`
- `positionOverrides[]` or object-map representation
- `principles[]`

Response DTO:
- Return the created tactic in the same shape as GET-by-id (preferred) so the UI can navigate confidently.

### PUT /api/v1/tactics/{id} (update)
Purpose: update tactic metadata + replace overrides/principles.

Request DTO:
- Same as create, but:
  - `parentFormationId` should be rejected/ignored if it differs from stored value (AddEdit UI doesn’t allow changing it in edit mode).
  - `scope` should be rejected/ignored if it differs from stored value.

Response DTO:
- Return updated tactic (same shape as GET-by-id).

---

## 3) Implementation Steps (with dependencies + exact file assignments)

### Step 0 — Confirm schema + conventions (read-only)
Dependencies: none.

Files to read (no edits):
- `api/OurGame.Persistence/Migrations/OurGameContextModelSnapshot.cs`
- `api/OurGame.Persistence/Models/Formation.cs`
- `api/OurGame.Persistence/Models/PositionOverride.cs`
- `api/OurGame.Persistence/Models/TacticPrinciple.cs`
- `api/OurGame.Api/Functions/MatchFunctions.cs`

Outcome:
- Confirm tables/columns used for tactics, overrides, principles, and scope linking.
- Confirm how tags are stored (CSV vs JSON string) and standardize mapping.

Parallelization:
- Can be done in parallel with Step 1 DTO design.

---

### Step 1 — Backend: Add `GET /v1/tactics/{id}`
Dependencies: Step 0 (schema confirmation).

Create/modify files:
- Create: `api/OurGame.Api/Functions/Tactics/GetTacticByIdFunction.cs`
- Create: `api/OurGame.Application/UseCases/Tactics/Queries/GetTacticById/GetTacticByIdHandler.cs`
- Create: `api/OurGame.Application/UseCases/Tactics/Queries/GetTacticById/DTOs/TacticDetailDto.cs`
- Create: `api/OurGame.Application/UseCases/Tactics/Queries/GetTacticById/DTOs/TacticPrincipleDto.cs`
- Create: `api/OurGame.Application/UseCases/Tactics/Queries/GetTacticById/DTOs/PositionOverrideDto.cs`
- Create (if needed for request shape parity later): `api/OurGame.Application/UseCases/Tactics/Shared/DTOs/TacticScopeDto.cs`

Handler responsibilities (SQL-centric):
- Query `Formations` for the tactic row.
- Query scope link tables to derive scope.
- Query `PositionOverrides` for that `FormationId`.
- Query `TacticPrinciples` for that `FormationId`.
- Map DB direction field types:
  - DB: `PositionOverrides.Direction` is a `string`.
  - UI: `PlayerDirection` is a string union (`N`, `NE`, etc.).
- Parse `TacticPrinciple.PositionIndices` into `int[]` (decide encoding: CSV or JSON; reflect actual DB).
- Normalize tags to a `string[]`.

Function responsibilities:
- Auth: `req.GetUserId()`; return 401 `ApiResponse<T>` error like other endpoints.
- Validate GUID; return 400.
- Not found -> 404.
- OpenAPI attributes: operation, parameter, responses.

Parallelization:
- Can be implemented in parallel with Step 2 (Create) as long as DTOs stay consistent.

---

### Step 2 — Backend: Add `POST /v1/tactics` (create)
Dependencies: Step 0; aligns with Step 1 DTOs.

Create/modify files:
- Create: `api/OurGame.Api/Functions/Tactics/CreateTacticFunction.cs`
- Create: `api/OurGame.Application/UseCases/Tactics/Commands/CreateTactic/CreateTacticHandler.cs`
- Create: `api/OurGame.Application/UseCases/Tactics/Commands/CreateTactic/CreateTacticCommand.cs`
- Create: `api/OurGame.Application/UseCases/Tactics/Commands/CreateTactic/DTOs/CreateTacticRequestDto.cs`
- Create (or reuse): shared DTOs for scope/overrides/principles if not already created

Handler responsibilities:
- Validate request:
  - `name` required and length constraints
  - `parentFormationId` must exist and should be a system formation (`IsSystemFormation = 1`) if that’s the intended rule
  - scope must be coherent:
    - club scope requires `clubId`
    - ageGroup scope requires `clubId` + `ageGroupId`
    - team scope requires `clubId` + `ageGroupId` + `teamId`
- Insert a row into `Formations` with:
  - `IsSystemFormation = 0`
  - `ParentFormationId = request.parentFormationId`
  - `ParentTacticId = request.parentTacticId` (optional)
  - `SquadSize` derived from parent formation
  - `Tags` stored in the same encoding the DB expects
  - `CreatedBy` determined by authenticated user if possible (confirm mapping from SWA azure user id to Coach/User ID; if not available, allow null)
  - `CreatedAt`/`UpdatedAt` = `SYSUTCDATETIME()`
- Insert exactly one scope link:
  - `FormationClubs` OR `FormationAgeGroups` OR `FormationTeams`.
- Insert `PositionOverrides` rows for provided overrides.
- Insert `TacticPrinciples` rows.
- Return a `TacticDetailDto` (either by requerying using Step 1 query pattern, or returning constructed data).

Function responsibilities:
- Auth + error mapping identical to `MatchFunctions.CreateMatch`.
- OpenAPI request body + 201 response.

Parallelization:
- Backend create and frontend client updates can be done in parallel once request/response DTO shape is finalized.

---

### Step 3 — Backend: Add `PUT /v1/tactics/{id}` (update)
Dependencies: Step 1 (detail DTO) + Step 2 (request DTO structure).

Create/modify files:
- Create: `api/OurGame.Api/Functions/Tactics/UpdateTacticFunction.cs`
- Create: `api/OurGame.Application/UseCases/Tactics/Commands/UpdateTactic/UpdateTacticHandler.cs`
- Create: `api/OurGame.Application/UseCases/Tactics/Commands/UpdateTactic/UpdateTacticCommand.cs`
- Create: `api/OurGame.Application/UseCases/Tactics/Commands/UpdateTactic/DTOs/UpdateTacticRequestDto.cs`

Handler responsibilities:
- Validate tactic exists and is not a system formation.
- Enforce invariants:
  - `ParentFormationId` cannot change (reject with validation error or ignore).
  - Scope link cannot change (reject or ignore).
- Update formation fields: `Name`, `Summary`, `Style`, `Tags`, `UpdatedAt`.
- Replace overrides/principles:
  - Delete existing `PositionOverrides` for formation id and insert new set.
  - Delete existing `TacticPrinciples` for formation id and insert new set.
  - Wrap in transaction to avoid partial updates.
- Return updated `TacticDetailDto`.

Parallelization:
- Can be done in parallel with Step 4 client/hook changes once endpoints are stable.

---

### Step 4 — Web: Extend API client (`web/src/api/client.ts`)
Dependencies: Step 1–3 endpoint contracts.

Modify files:
- Modify: `web/src/api/client.ts`
  - Add interfaces:
    - `TacticDetailDto` (matches backend)
    - `CreateTacticRequest` / `UpdateTacticRequest`
    - Supporting types: `PositionOverrideDto`, `TacticPrincipleDto`, `TacticScopeDto`
  - Add client methods under `apiClient.tactics`:
    - `getById(tacticId)` -> `GET /v1/tactics/{tacticId}`
    - `create(request)` -> `POST /v1/tactics`
    - `update(tacticId, request)` -> `PUT /v1/tactics/{tacticId}`
  - Ensure errors go through `handleApiError`.

Parallelization:
- Can be done in parallel with backend work once DTO shape is agreed.

---

### Step 5 — Web: Add hooks for tactic detail + mutations (`web/src/api/hooks.ts`)
Dependencies: Step 4.

Modify files:
- Modify: `web/src/api/hooks.ts`
  - Add `useTactic(tacticId: string | undefined)` using `useApiCall` pattern.
  - Add `useCreateTactic()` mutation hook (pattern-match `useCreateMatch`).
  - Add `useUpdateTactic(tacticId: string)` mutation hook (pattern-match `useUpdateMatch` / `useUpdatePlayer`).

Behavior requirements:
- Preserve validation errors (`validationErrors`) so AddEdit page can display them.
- Do not introduce full-page loaders.

Parallelization:
- Can be done in parallel with Step 6 page changes if placeholder DTO types are stubbed (but better after Step 4).

---

### Step 6 — Web: Migrate AddEditTacticPage to API
Dependencies: Step 4–5 (client/hook availability), Step 1 (detail endpoint).

Modify files:
- Modify: `web/src/pages/tactics/AddEditTacticPage.tsx`
- Modify: `web/src/components/tactics/PrinciplePanel.tsx` (type decoupling; see below)
- Potentially modify: `web/src/data/tactics.ts` (optional: keep as pure helper only; but AddEdit page must not depend on static sample data)

Page behavior changes (no new UI components):
1. **Edit mode loading**
   - Use `useTactic(tacticId)`.
   - While loading, show skeleton placeholders per section:
     - Pitch editor container skeleton (left column)
     - Basic info card skeleton (name + base formation + tags + summary)
     - Principles panel skeleton
     - Form actions skeleton
   - If error: show inline error panel similar to `TacticsListPage` (red bordered box).
2. **Initial state**
   - For “new tactic”: initialize local state as today, but do not fake ids like `tactic-new-*` for submission; the backend will generate the id.
   - For “edit tactic”: once `tacticDetail` arrives, set local state from API data.
3. **Real-time preview**
   - Keep base formation reference data client-side via `getFormationById` + `sampleFormations`.
   - For `resolvedPositions` passed to `PrinciplePanel`, compute client-side from:
     - base formation positions
     - tactic overrides
     - (optional) parent tactic overrides (only if the API returns parent tactic data or you load parent tactic as well)
   - Simplest approach for this page: compute positions as “base formation positions with current overrides applied” (do not require full parent-tactic chain for the editor UI).
4. **Save behavior**
   - On submit:
     - if `isEditing`: call `useUpdateTactic(tacticId).updateTactic(request)`
     - else: call `useCreateTactic().createTactic(request)`
   - Disable save button while submitting (reuse `FormActions` props behavior).
   - On success, navigate to tactic detail page using the created/updated id.
   - On error, show inline error panel and keep user’s edits.

PrinciplePanel type decoupling (required cleanup):
- `PrinciplePanel.tsx` currently imports `ResolvedPosition` type from `web/src/data/tactics.ts`.
- Update it to accept a minimal `resolvedPositions` type that does not depend on static data:
  - Option A: accept `FormationPosition[]` from `web/src/types/index.ts`.
  - Option B: define a local minimal type `{ position: string }` plus x/y/direction if needed.
  - Prefer Option A for consistency.

Parallelization:
- Skeleton UI work can be done in parallel with backend creation once hook contracts exist.

---

### Step 7 — Wire-up follow-ups (optional but recommended)
Dependencies: Step 6.

Potential edits:
- Update `web/src/pages/tactics/TacticDetailPage.tsx` to use the new `GET /v1/tactics/{id}` later (separate migration plan already exists).
- If `web/src/data/tactics.ts` becomes unused by app pages, keep it only for storybook/demo or remove later.

---

## 4) Dependencies Between Steps (clear order)
1. Step 0 (schema confirmation) → informs DTO encoding decisions.
2. Step 1 (GET-by-id) is required before Step 6 (edit mode can load data).
3. Step 2/3 (POST/PUT) are required before Step 6 (save).
4. Step 4/5 (web client/hooks) depend on backend DTO shape but can be developed once contracts are agreed.
5. Step 6 (page migration) depends on Step 4/5 and Step 1.

Parallelizable chunks:
- Backend Step 1 and Step 2 can proceed in parallel.
- Web Step 4 and Step 5 can proceed in parallel.
- Page skeleton work (part of Step 6) can proceed before backend completion.

---

## 5) Edge Cases / Validation to Handle

### Backend
- **Tags encoding mismatch**: DB `Formations.Tags` appears to be a string; existing query splits by comma, but seed data uses JSON-array string. Confirm actual storage and standardize:
  - If JSON string: parse JSON in handlers; stop splitting by comma.
  - If CSV: ensure create/update store CSV and list queries split consistently.
- **Scope link integrity**: ensure exactly one of (club, ageGroup, team) link rows exists for a tactic.
- **Direction values**: validate direction string is one of allowed compass directions; reject invalid values.
- **Position indices bounds**:
  - `PositionOverride.PositionIndex` must be within base formation position count.
  - `TacticPrinciple.PositionIndices` must be within bounds.
- **Parent chain**: if `parentTacticId` provided, verify it exists and is compatible (same squad size, same parentFormationId).
- **Auth**:
  - Must return 401 when `req.GetUserId()` is absent.
  - If there is a domain rule for “user must belong to club/team,” implement access check consistent with other domains (confirm patterns first).

### Frontend
- Route params may be undefined; page should not crash.
- Edit mode: tacticId might be present but fetch fails → show error + “Back” link remains functional.
- Create mode: ensure default formation exists (`sampleFormations[0]`). If not, show an error state.
- Save errors: keep local edits; surface error message inline.

---

## 6) Testing Considerations

### Backend testing (no existing test project found)
Manual/API smoke tests:
- Run Functions locally and call endpoints:
  - `GET /api/v1/tactics/{id}` returns 200 + expected shape.
  - `POST /api/v1/tactics` returns 201; verify rows in:
    - `Formations`
    - one of link tables (`FormationClubs`/`FormationAgeGroups`/`FormationTeams`)
    - `PositionOverrides`
    - `TacticPrinciples`
  - `PUT /api/v1/tactics/{id}` returns 200; verify replacement behavior.
- Negative cases:
  - Invalid GUID → 400
  - Missing auth header → 401
  - Missing base formation → 400/404 depending on rule

### Frontend testing
Manual UI checks (dev server):
- Create new tactic from each scope route:
  - `/dashboard/:clubId/tactics/new`
  - `/dashboard/:clubId/age-groups/:ageGroupId/tactics/new`
  - `/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/tactics/new`
- Edit tactic routes load data and render skeleton sections while fetching.
- Saving disables actions and navigates back correctly.
- Error state renders inline; no full-page loader.

### Regression checks
- Ensure `TacticsListPage` still works (it uses list-by-scope endpoints already implemented).

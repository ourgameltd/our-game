---
domain: Frontend, API Integration
technology: [TypeScript, Axios, "@hey-api/openapi-ts"]
categories: [API Client, Authentication, Code Generation]
related:
  - api/OurGame.Api/openapi.json
  - web/package.json
---

# api

API client layer for communicating with the Azure Functions backend. Includes auto-generated TypeScript client, authentication helpers, and React hooks for data fetching.

## Files

| File | Purpose |
|---|---|
| `index.ts` | Auto-generated API client from OpenAPI spec (via `@hey-api/openapi-ts`) |
| `client.ts` | Axios client configuration (base URL, interceptors, auth headers) |
| `auth.ts` | Authentication helpers for Azure AD B2C token handling |
| `hooks.ts` | React hooks wrapping API calls for data fetching patterns |
| `mappers.ts` | Data transformation functions between API DTOs and UI models |
| `users.ts` | User-specific API operations |

## Client Regeneration

```bash
cd web
npm run generate:api
```

This fetches the OpenAPI spec from `http://localhost:7071/openapi/v3.json` and regenerates the TypeScript client.

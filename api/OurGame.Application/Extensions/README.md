---
domain: Business Logic
technology: [.NET 8, Polly 8]
categories: [Extension Methods, Resilience, Validation]
related:
  - api/OurGame.Api/Extensions/
---

# Extensions

Utility extension methods used across the Application and API layers.

## Files

| File | Purpose |
|---|---|
| `HttpStatusCodeX.cs` | HTTP status code helper methods and standard response creation |
| `PollyX.cs` | Polly resilience policy definitions (retry, circuit breaker) |
| `PreconditionX.cs` | Precondition validation helpers (null checks, range validation) |
| `AgeGroupSeasonX.cs` | Age group season date calculation utilities |
| `RandomX.cs` | Random value generation helpers |
| `StringX.cs` | String manipulation extensions |

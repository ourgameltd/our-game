---
domain: Testing
technology: [.NET 8, xUnit, Moq, Azure Functions]
categories: [Unit Tests, API Testing, Contract Testing]
related:
  - api/OurGame.Api/Functions/
  - api/OurGame.Application/UseCases/
  - .github/workflows/pr-build.yml
  - api/stryker-config.json
---

# OurGame.Api.Tests

Endpoint-focused unit/contract tests for Azure Functions handlers in OurGame.Api.

## Structure

- `TestInfrastructure/`
  - Shared test doubles and helpers for `HttpRequestData`, `HttpResponseData`, `FunctionContext`, mediator stubbing, and response assertions.
- `Templates/`
  - Reference tests showing the baseline assertion style for GET/POST endpoints.
- `Users/`, `Teams/`, `Players/`, etc. (to be added)
  - Domain-focused endpoint tests grouped by function file.

## Endpoint Done Criteria

An endpoint is marked complete only when all relevant scenarios are covered and passing:

1. Success response contract
1. Authentication/authorization branch
1. Validation failure branch
1. Not found branch (if applicable)
1. Unexpected/exception mapping branch

## Test Naming Convention

Use this format:

- `MethodName_ReturnsStatus_WhenCondition`

Examples:

- `GetMe_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing`
- `CreateMatch_ReturnsUnauthorizedAndError_WhenNoAuthenticatedUser`

## Assertion Requirements

Each endpoint test should assert:

1. HTTP status code
1. `ApiResponse<T>.Success` and `StatusCode`
1. `Error` message/code for failure paths
1. Data contract shape for success paths

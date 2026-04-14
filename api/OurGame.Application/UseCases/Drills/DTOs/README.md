---
domain: Drill Use Cases
technology: [C#, .NET 8, MediatR]
categories: [DTOs, Diagram Config, JSON Contracts]
related:
  - api/OurGame.Application/UseCases/Drills/Commands/CreateDrill/DTOs/CreateDrillRequestDto.cs
  - api/OurGame.Application/UseCases/Drills/Commands/UpdateDrill/DTOs/UpdateDrillRequestDto.cs
  - api/OurGame.Application/UseCases/Drills/Queries/GetDrillById/DTOs/DrillDetailDto.cs
---

# Drill DTOs

Shared drill DTOs used by command/query contracts.

## Contents

- `DrillDiagramConfigDto.cs`: flexible JSON-backed schema for drill drawing configuration.
- Supports a `frames` array that is future-ready for animation while current business rules enforce a single frame.

## Notes

- Keep this folder for reusable drill contract types referenced by multiple command/query DTOs.
- Use additive changes with schema versioning to preserve backward compatibility.

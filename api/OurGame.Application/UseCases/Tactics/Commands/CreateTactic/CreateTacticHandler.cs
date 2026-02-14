using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticById;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Tactics.Commands.CreateTactic;

/// <summary>
/// Handler for creating a new tactic (formation with IsSystemFormation=0 and a parent formation)
/// </summary>
public class CreateTacticHandler : IRequestHandler<CreateTacticCommand, TacticDetailDto>
{
    private readonly OurGameContext _db;

    public CreateTacticHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<TacticDetailDto> Handle(CreateTacticCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;

        // Validate name
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new ValidationException("Name", "Name is required.");
        }

        // Validate parent formation exists and get its squad size
        var parentFormation = await _db.Database
            .SqlQueryRaw<ParentFormationRow>(
                "SELECT Id, SquadSize FROM Formations WHERE Id = {0}",
                dto.ParentFormationId)
            .FirstOrDefaultAsync(cancellationToken);

        if (parentFormation == null)
        {
            throw new NotFoundException("Formation", dto.ParentFormationId.ToString());
        }

        // Validate scope
        var scopeType = dto.Scope.Type?.ToLowerInvariant() ?? string.Empty;
        if (scopeType != "club" && scopeType != "agegroup" && scopeType != "team")
        {
            throw new ValidationException("Scope.Type", "Scope type must be 'club', 'ageGroup', or 'team'.");
        }

        if (dto.Scope.ClubId == Guid.Empty)
        {
            throw new ValidationException("Scope.ClubId", "ClubId is required for all scope types.");
        }

        if (scopeType == "agegroup" && (!dto.Scope.AgeGroupId.HasValue || dto.Scope.AgeGroupId == Guid.Empty))
        {
            throw new ValidationException("Scope.AgeGroupId", "AgeGroupId is required for ageGroup scope.");
        }

        if (scopeType == "team" && (!dto.Scope.TeamId.HasValue || dto.Scope.TeamId == Guid.Empty))
        {
            throw new ValidationException("Scope.TeamId", "TeamId is required for team scope.");
        }

        // Generate IDs
        var tacticId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var squadSize = parentFormation.SquadSize;
        var tagsJson = JsonSerializer.Serialize(dto.Tags ?? new List<string>());
        var summary = dto.Summary ?? string.Empty;
        var style = dto.Style ?? string.Empty;

        // Insert into Formations (IsSystemFormation = false)
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO Formations (Id, Name, SquadSize, IsSystemFormation, ParentFormationId, ParentTacticId,
                Summary, Style, Tags, CreatedAt, UpdatedAt)
            VALUES ({tacticId}, {dto.Name}, {squadSize}, {false}, {dto.ParentFormationId}, {dto.ParentTacticId},
                {summary}, {style}, {tagsJson}, {now}, {now})
        ", cancellationToken);

        // Insert scope link row
        var scopeLinkId = Guid.NewGuid();
        switch (scopeType)
        {
            case "club":
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO FormationClubs (Id, FormationId, ClubId, SharedAt)
                    VALUES ({scopeLinkId}, {tacticId}, {dto.Scope.ClubId}, {now})
                ", cancellationToken);
                break;

            case "agegroup":
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO FormationAgeGroups (Id, FormationId, AgeGroupId, SharedAt)
                    VALUES ({scopeLinkId}, {tacticId}, {dto.Scope.AgeGroupId}, {now})
                ", cancellationToken);
                break;

            case "team":
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO FormationTeams (Id, FormationId, TeamId, SharedAt)
                    VALUES ({scopeLinkId}, {tacticId}, {dto.Scope.TeamId}, {now})
                ", cancellationToken);
                break;
        }

        // Insert position overrides
        foreach (var po in dto.PositionOverrides)
        {
            var poId = Guid.NewGuid();
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO PositionOverrides (Id, FormationId, PositionIndex, XCoord, YCoord, Direction)
                VALUES ({poId}, {tacticId}, {po.PositionIndex}, {po.XCoord}, {po.YCoord}, {po.Direction})
            ", cancellationToken);
        }

        // Insert tactic principles
        foreach (var p in dto.Principles)
        {
            var principleId = Guid.NewGuid();
            var positionIndicesCsv = p.PositionIndices != null && p.PositionIndices.Count > 0
                ? string.Join(",", p.PositionIndices)
                : string.Empty;
            var description = p.Description ?? string.Empty;

            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO TacticPrinciples (Id, FormationId, Title, Description, PositionIndices)
                VALUES ({principleId}, {tacticId}, {p.Title}, {description}, {positionIndicesCsv})
            ", cancellationToken);
        }

        // Re-query and return the created tactic using GetTacticByIdHandler
        var result = await new GetTacticByIdHandler(_db)
            .Handle(new GetTacticByIdQuery(tacticId), cancellationToken);

        if (result == null)
        {
            throw new Exception("Failed to retrieve created tactic.");
        }

        return result;
    }
}

/// <summary>
/// Lightweight row for parent formation lookup
/// </summary>
public class ParentFormationRow
{
    public Guid Id { get; set; }
    public int SquadSize { get; set; }
}

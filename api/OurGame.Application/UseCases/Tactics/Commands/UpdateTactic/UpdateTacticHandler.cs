using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Tactics.Commands.UpdateTactic.DTOs;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticById;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Tactics.Commands.UpdateTactic;

/// <summary>
/// Handler for updating an existing tactic.
/// Updates Formations row, replaces PositionOverrides and TacticPrinciples.
/// ParentFormationId and scope links are immutable (ignored if different).
/// </summary>
public class UpdateTacticHandler : IRequestHandler<UpdateTacticCommand, TacticDetailDto>
{
    private readonly OurGameContext _db;

    public UpdateTacticHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<TacticDetailDto> Handle(UpdateTacticCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var tacticId = command.TacticId;

        // Validate required fields
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new ValidationException("Name", "Name is required.");
        }

        // Check tactic exists and is not a system formation
        var existsCheck = await _db.Database
            .SqlQueryRaw<TacticExistsRaw>(
                @"SELECT Id, IsSystemFormation FROM Formations WHERE Id = {0} AND ParentFormationId IS NOT NULL",
                tacticId)
            .FirstOrDefaultAsync(cancellationToken);

        if (existsCheck == null)
        {
            throw new NotFoundException("Tactic", tacticId.ToString());
        }

        if (existsCheck.IsSystemFormation)
        {
            throw new NotFoundException("Tactic", tacticId.ToString());
        }

        // Serialise tags to JSON string for storage
        var tagsJson = dto.Tags.Count > 0
            ? JsonSerializer.Serialize(dto.Tags)
            : null;

        var now = DateTime.UtcNow;
        var summary = dto.Summary ?? string.Empty;
        var style = dto.Style ?? string.Empty;
        var name = dto.Name;

        // Update the Formations row (ParentFormationId, ParentTacticId, SquadSize, scope unchanged)
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE Formations
            SET Name = {name},
                Summary = {summary},
                Style = {style},
                Tags = {tagsJson},
                UpdatedAt = {now}
            WHERE Id = {tacticId}
        ", cancellationToken);

        // Replace PositionOverrides: DELETE existing + INSERT new set
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM PositionOverrides WHERE FormationId = {tacticId}
        ", cancellationToken);

        foreach (var over in dto.PositionOverrides)
        {
            var overrideId = Guid.NewGuid();
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO PositionOverrides (Id, FormationId, PositionIndex, XCoord, YCoord, Direction)
                VALUES ({overrideId}, {tacticId}, {over.PositionIndex}, {over.XCoord}, {over.YCoord}, {over.Direction})
            ", cancellationToken);
        }

        // Replace TacticPrinciples: DELETE existing + INSERT new set
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM TacticPrinciples WHERE FormationId = {tacticId}
        ", cancellationToken);

        foreach (var principle in dto.Principles)
        {
            var principleId = Guid.NewGuid();
            var positionIndicesCsv = principle.PositionIndices.Count > 0
                ? string.Join(",", principle.PositionIndices)
                : null;
            var description = principle.Description ?? string.Empty;

            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO TacticPrinciples (Id, FormationId, Title, Description, PositionIndices)
                VALUES ({principleId}, {tacticId}, {principle.Title}, {description}, {positionIndicesCsv})
            ", cancellationToken);
        }

        // Requery the updated tactic using the existing GetTacticById handler
        var result = await new GetTacticByIdHandler(_db)
            .Handle(new GetTacticByIdQuery(tacticId), cancellationToken);

        if (result == null)
        {
            throw new Exception("Failed to retrieve updated tactic.");
        }

        return result;
    }
}

/// <summary>
/// Raw DTO for checking tactic existence
/// </summary>
public class TacticExistsRaw
{
    public Guid Id { get; set; }
    public bool IsSystemFormation { get; set; }
}

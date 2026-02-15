using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Drills.Commands.UpdateDrill.DTOs;
using OurGame.Application.UseCases.Drills.Queries.GetDrillById;
using OurGame.Application.UseCases.Drills.Queries.GetDrillById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Drills.Commands.UpdateDrill;

/// <summary>
/// Handler for updating an existing drill.
/// Updates Drills row, replaces DrillLinks atomically.
/// Scope links are immutable (cannot be changed after creation).
/// Only the creating coach can update their drill.
/// </summary>
public class UpdateDrillHandler : IRequestHandler<UpdateDrillCommand, DrillDetailDto>
{
    private readonly OurGameContext _db;

    public UpdateDrillHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<DrillDetailDto> Handle(UpdateDrillCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var drillId = command.DrillId;

        // Validate required fields
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new ValidationException("Name", "Name is required.");
        }

        if (string.IsNullOrWhiteSpace(dto.Category))
        {
            throw new ValidationException("Category", "Category is required.");
        }

        // Check drill exists and fetch CreatedBy coach ID
        var drillCheckSql = @"
            SELECT Id, CreatedBy 
            FROM Drills 
            WHERE Id = {0}";

        var drillCheck = await _db.Database
            .SqlQueryRaw<DrillCheckRaw>(drillCheckSql, drillId)
            .FirstOrDefaultAsync(cancellationToken);

        if (drillCheck == null)
        {
            throw new NotFoundException("Drill", drillId.ToString());
        }

        // Resolve current coach ID from AuthId (UserId from command)
        var currentCoachSql = @"
            SELECT c.Id 
            FROM Coaches c
            INNER JOIN Users u ON c.UserId = u.Id
            WHERE u.AuthId = {0}";

        var currentCoachId = await _db.Database
            .SqlQueryRaw<Guid>(currentCoachSql, command.UserId)
            .FirstOrDefaultAsync(cancellationToken);

        if (currentCoachId == Guid.Empty)
        {
            throw new NotFoundException("Coach", "Current user is not a coach");
        }

        // Verify authorization: only the creating coach can update
        if (drillCheck.CreatedBy != currentCoachId)
        {
            throw new UnauthorizedAccessException("Only the creating coach can update this drill");
        }

        // Map category string to enum
        var category = MapCategoryToEnum(dto.Category);

        // Serialize arrays to JSON
        var attributesJson = dto.Attributes.Count > 0
            ? JsonSerializer.Serialize(dto.Attributes)
            : null;

        var equipmentJson = dto.Equipment.Count > 0
            ? JsonSerializer.Serialize(dto.Equipment)
            : null;

        var instructionsJson = dto.Instructions.Count > 0
            ? JsonSerializer.Serialize(dto.Instructions)
            : null;

        var variationsJson = dto.Variations.Count > 0
            ? JsonSerializer.Serialize(dto.Variations)
            : null;

        var now = DateTime.UtcNow;
        var name = dto.Name;
        var description = dto.Description ?? string.Empty;
        var durationMinutes = dto.DurationMinutes;
        var isPublic = dto.IsPublic;

        // Begin transaction
        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            // Update the Drills row (scope links unchanged, CreatedBy unchanged)
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                UPDATE Drills
                SET Name = {name},
                    Description = {description},
                    DurationMinutes = {durationMinutes},
                    Category = {category},
                    Attributes = {attributesJson},
                    Equipment = {equipmentJson},
                    Instructions = {instructionsJson},
                    Variations = {variationsJson},
                    IsPublic = {isPublic},
                    UpdatedAt = {now}
                WHERE Id = {drillId}
            ", cancellationToken);

            // Replace DrillLinks: DELETE existing + INSERT new set
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                DELETE FROM DrillLinks WHERE DrillId = {drillId}
            ", cancellationToken);

            foreach (var link in dto.Links)
            {
                var linkId = Guid.NewGuid();
                var linkType = MapLinkTypeToEnum(link.Type);
                var title = link.Title ?? string.Empty;

                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO DrillLinks (Id, DrillId, Url, Title, Type)
                    VALUES ({linkId}, {drillId}, {link.Url}, {title}, {linkType})
                ", cancellationToken);
            }

            // Commit transaction
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        // Requery the updated drill using the existing GetDrillById handler
        var result = await new GetDrillByIdHandler(_db)
            .Handle(new GetDrillByIdQuery(drillId), cancellationToken);

        if (result == null)
        {
            throw new Exception("Failed to retrieve updated drill.");
        }

        return result;
    }

    /// <summary>
    /// Map category string to DrillCategory enum
    /// </summary>
    private static DrillCategory MapCategoryToEnum(string category)
    {
        return category.ToLowerInvariant() switch
        {
            "technical" => DrillCategory.Technical,
            "tactical" => DrillCategory.Tactical,
            "physical" => DrillCategory.Physical,
            "mental" => DrillCategory.Mental,
            "mixed" => DrillCategory.Mixed,
            _ => throw new ValidationException("Category", $"Invalid category: {category}")
        };
    }

    /// <summary>
    /// Map link type string to LinkType enum
    /// </summary>
    private static LinkType MapLinkTypeToEnum(string type)
    {
        return type.ToLowerInvariant() switch
        {
            "youtube" => LinkType.Youtube,
            "instagram" => LinkType.Instagram,
            "tiktok" => LinkType.TikTok,
            "website" => LinkType.Website,
            "other" => LinkType.Other,
            _ => LinkType.Other
        };
    }
}

/// <summary>
/// Raw DTO for checking drill existence and ownership
/// </summary>
public class DrillCheckRaw
{
    public Guid Id { get; set; }
    public Guid? CreatedBy { get; set; }
}

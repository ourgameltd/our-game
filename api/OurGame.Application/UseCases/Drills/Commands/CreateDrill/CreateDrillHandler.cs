using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Drills.Queries.GetDrillById;
using OurGame.Application.UseCases.Drills.Queries.GetDrillById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Drills.Commands.CreateDrill;

/// <summary>
/// Handler for creating a new drill with multi-table inserts in a transaction
/// </summary>
public class CreateDrillHandler : IRequestHandler<CreateDrillCommand, DrillDetailDto>
{
    private readonly OurGameContext _db;
    private readonly GetDrillByIdHandler _getDrillByIdHandler;

    public CreateDrillHandler(OurGameContext db)
    {
        _db = db;
        _getDrillByIdHandler = new GetDrillByIdHandler(db);
    }

    public async Task<DrillDetailDto> Handle(CreateDrillCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;

        // Validate name
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new ValidationException("Name", "Name is required.");
        }

        // Validate category
        var category = ParseCategory(dto.Category);

        // Validate scope - exactly one scope field must be provided
        var scopeCount = (dto.Scope.ClubId.HasValue && dto.Scope.ClubId != Guid.Empty ? 1 : 0) +
                        (dto.Scope.AgeGroupId.HasValue && dto.Scope.AgeGroupId != Guid.Empty ? 1 : 0) +
                        (dto.Scope.TeamId.HasValue && dto.Scope.TeamId != Guid.Empty ? 1 : 0);

        if (scopeCount != 1)
        {
            throw new ValidationException("Scope", "Exactly one scope (ClubId, AgeGroupId, or TeamId) must be provided.");
        }

        // Resolve CreatedBy coach ID from authenticated user
        Guid? coachId = null;
        if (!string.IsNullOrEmpty(command.UserId))
        {
            var userIdSql = "SELECT Id FROM Users WHERE AuthId = {0}";
            var userId = await _db.Database
                .SqlQueryRaw<Guid>(userIdSql, command.UserId)
                .FirstOrDefaultAsync(cancellationToken);

            if (userId != Guid.Empty)
            {
                var coachIdSql = "SELECT Id FROM Coaches WHERE UserId = {0}";
                var resolvedCoachId = await _db.Database
                    .SqlQueryRaw<Guid>(coachIdSql, userId)
                    .FirstOrDefaultAsync(cancellationToken);

                if (resolvedCoachId != Guid.Empty)
                {
                    coachId = resolvedCoachId;
                }
            }
        }

        // Generate IDs and timestamps
        var drillId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        // Serialize arrays as JSON
        var attributesJson = JsonSerializer.Serialize(dto.Attributes ?? new List<string>());
        var equipmentJson = JsonSerializer.Serialize(dto.Equipment ?? new List<string>());
        var instructionsJson = JsonSerializer.Serialize(dto.Instructions ?? new List<string>());
        var variationsJson = JsonSerializer.Serialize(dto.Variations ?? new List<string>());

        // Begin transaction
        IDbContextTransaction? transaction = null;
        try
        {
            transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

            // Insert into Drills table
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO Drills (Id, Name, Description, DurationMinutes, Category, Attributes, Equipment,
                    Diagram, Instructions, Variations, CreatedBy, IsPublic, CreatedAt, UpdatedAt)
                VALUES ({drillId}, {dto.Name}, {dto.Description}, {dto.DurationMinutes}, {(int)category},
                    {attributesJson}, {equipmentJson}, {(string?)null}, {instructionsJson}, {variationsJson},
                    {coachId}, {dto.IsPublic}, {now}, {now})
            ", cancellationToken);

            // Insert scope link row
            var scopeLinkId = Guid.NewGuid();
            if (dto.Scope.ClubId.HasValue && dto.Scope.ClubId != Guid.Empty)
            {
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO DrillClubs (Id, DrillId, ClubId, SharedAt)
                    VALUES ({scopeLinkId}, {drillId}, {dto.Scope.ClubId}, {now})
                ", cancellationToken);
            }
            else if (dto.Scope.AgeGroupId.HasValue && dto.Scope.AgeGroupId != Guid.Empty)
            {
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO DrillAgeGroups (Id, DrillId, AgeGroupId, SharedAt)
                    VALUES ({scopeLinkId}, {drillId}, {dto.Scope.AgeGroupId}, {now})
                ", cancellationToken);
            }
            else if (dto.Scope.TeamId.HasValue && dto.Scope.TeamId != Guid.Empty)
            {
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO DrillTeams (Id, DrillId, TeamId, SharedAt)
                    VALUES ({scopeLinkId}, {drillId}, {dto.Scope.TeamId}, {now})
                ", cancellationToken);
            }

            // Insert drill links
            foreach (var link in dto.Links)
            {
                var linkId = Guid.NewGuid();
                var linkType = ParseLinkType(link.LinkType);
                var linkTitle = link.Title ?? string.Empty;

                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO DrillLinks (Id, DrillId, Url, Title, Type)
                    VALUES ({linkId}, {drillId}, {link.Url}, {linkTitle}, {(int)linkType})
                ", cancellationToken);
            }

            // Commit transaction
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            if (transaction != null)
            {
                await transaction.RollbackAsync(cancellationToken);
            }
            throw;
        }
        finally
        {
            if (transaction != null)
            {
                await transaction.DisposeAsync();
            }
        }

        // Re-query and return the created drill
        var result = await _getDrillByIdHandler.Handle(new GetDrillByIdQuery(drillId), cancellationToken);

        if (result == null)
        {
            throw new Exception("Failed to retrieve created drill.");
        }

        return result;
    }

    private static DrillCategory ParseCategory(string category)
    {
        return category.ToLowerInvariant() switch
        {
            "technical" => DrillCategory.Technical,
            "tactical" => DrillCategory.Tactical,
            "physical" => DrillCategory.Physical,
            "mental" => DrillCategory.Mental,
            "mixed" => DrillCategory.Mixed,
            _ => throw new ValidationException("Category", $"Invalid category: {category}. Must be one of: technical, tactical, physical, mental, mixed.")
        };
    }

    private static LinkType ParseLinkType(string linkType)
    {
        return linkType.ToLowerInvariant() switch
        {
            "youtube" => LinkType.Youtube,
            "instagram" => LinkType.Instagram,
            "tiktok" => LinkType.TikTok,
            "website" => LinkType.Website,
            "other" => LinkType.Other,
            _ => throw new ValidationException("LinkType", $"Invalid link type: {linkType}. Must be one of: youtube, instagram, tiktok, website, other.")
        };
    }
}

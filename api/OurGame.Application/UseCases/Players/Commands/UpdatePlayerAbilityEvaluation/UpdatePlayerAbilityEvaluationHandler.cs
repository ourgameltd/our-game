using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAbilities.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Commands.UpdatePlayerAbilityEvaluation;

/// <summary>
/// Handler for updating an existing player ability evaluation.
/// Validates coach permissions and updates evaluation with attributes.
/// Only the creating coach can update their evaluation.
/// </summary>
public class UpdatePlayerAbilityEvaluationHandler : IRequestHandler<UpdatePlayerAbilityEvaluationCommand, PlayerAbilityEvaluationDto>
{
    private readonly OurGameContext _db;

    public UpdatePlayerAbilityEvaluationHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<PlayerAbilityEvaluationDto> Handle(UpdatePlayerAbilityEvaluationCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;

        // Verify evaluation exists and belongs to the specified player
        var evaluationCheck = await _db.Database
            .SqlQueryRaw<EvaluationCheckResult>(@"
                SELECT ae.Id, ae.PlayerId, ae.EvaluatedBy
                FROM AttributeEvaluations ae
                WHERE ae.Id = {0}
            ", command.EvaluationId)
            .FirstOrDefaultAsync(cancellationToken);

        if (evaluationCheck == null)
        {
            throw new NotFoundException("Evaluation", command.EvaluationId.ToString());
        }

        if (evaluationCheck.PlayerId != command.PlayerId)
        {
            throw new NotFoundException("Evaluation", command.EvaluationId.ToString());
        }

        // Get CoachId from azureUserId: Users.AuthId → Users.Id → Coaches.UserId
        var coachResult = await _db.Database
            .SqlQueryRaw<CoachLookupResult>(@"
                SELECT c.Id as CoachId, c.FirstName, c.LastName
                FROM Users u
                INNER JOIN Coaches c ON c.UserId = u.Id
                WHERE u.AuthId = {0} AND c.IsArchived = 0
            ", command.AzureUserId)
            .FirstOrDefaultAsync(cancellationToken);

        // Use the original coach who created the evaluation
        if (coachResult == null)
        {
            coachResult = await _db.Database
                .SqlQueryRaw<CoachLookupResult>(@"
                    SELECT c.Id as CoachId, c.FirstName, c.LastName
                    FROM Coaches c
                    WHERE c.Id = {0} AND c.IsArchived = 0
                ", evaluationCheck.EvaluatedBy)
                .FirstOrDefaultAsync(cancellationToken);
                
            if (coachResult == null)
            {
                throw new ValidationException("System", "Original coach not found.");
            }
        }

        // Validate ratings are within range (0-99)
        if (dto.Attributes.Any(a => a.Rating < 0 || a.Rating > 99))
        {
            throw new ValidationException("Attributes", "All attribute ratings must be between 0 and 99.");
        }

        // Compute overall rating as average of all provided attribute ratings
        var overallRating = (int)Math.Round(dto.Attributes.Average(a => a.Rating));

        var now = DateTime.UtcNow;
        var evaluatedAtDateTime = dto.EvaluatedAt.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        // Start transaction for multi-step operation
        using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            // Update AttributeEvaluations
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                UPDATE AttributeEvaluations
                SET EvaluatedAt = {evaluatedAtDateTime},
                    OverallRating = {overallRating},
                    CoachNotes = {dto.CoachNotes},
                    PeriodStart = {dto.PeriodStart},
                    PeriodEnd = {dto.PeriodEnd}
                WHERE Id = {command.EvaluationId}
            ", cancellationToken);

            // Delete existing EvaluationAttributes
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                DELETE FROM EvaluationAttributes WHERE EvaluationId = {command.EvaluationId}
            ", cancellationToken);

            // Insert new EvaluationAttributes
            foreach (var attribute in dto.Attributes)
            {
                var attributeId = Guid.NewGuid();
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO EvaluationAttributes (Id, EvaluationId, AttributeName, Rating, Notes)
                    VALUES ({attributeId}, {command.EvaluationId}, {attribute.AttributeName}, {attribute.Rating}, {attribute.Notes})
                ", cancellationToken);
            }

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        // Query back the updated evaluation with all attributes
        var evaluation = await _db.Database
            .SqlQueryRaw<EvaluationRawResult>(@"
                SELECT 
                    ae.Id,
                    ae.EvaluatedBy,
                    ae.EvaluatedAt,
                    ae.OverallRating,
                    ae.CoachNotes,
                    ae.PeriodStart,
                    ae.PeriodEnd,
                    c.FirstName + ' ' + c.LastName as CoachName
                FROM AttributeEvaluations ae
                INNER JOIN Coaches c ON c.Id = ae.EvaluatedBy
                WHERE ae.Id = {0}
            ", command.EvaluationId)
            .FirstOrDefaultAsync(cancellationToken);

        if (evaluation == null)
        {
            throw new Exception("Failed to retrieve updated evaluation.");
        }

        // Query attributes for this evaluation
        var attributes = await _db.Database
            .SqlQueryRaw<AttributeRawResult>(@"
                SELECT AttributeName, Rating, Notes
                FROM EvaluationAttributes
                WHERE EvaluationId = {0}
                ORDER BY AttributeName
            ", command.EvaluationId)
            .ToListAsync(cancellationToken);

        return new PlayerAbilityEvaluationDto
        {
            Id = evaluation.Id,
            EvaluatedBy = evaluation.EvaluatedBy,
            CoachName = evaluation.CoachName,
            EvaluatedAt = evaluation.EvaluatedAt,
            OverallRating = evaluation.OverallRating,
            CoachNotes = evaluation.CoachNotes,
            PeriodStart = evaluation.PeriodStart,
            PeriodEnd = evaluation.PeriodEnd,
            Attributes = attributes.Select(a => new EvaluationAttributeDto
            {
                AttributeName = a.AttributeName ?? string.Empty,
                Rating = a.Rating,
                Notes = a.Notes
            }).ToList()
        };
    }
}

/// <summary>
/// Raw SQL query result for evaluation existence check.
/// </summary>
internal class EvaluationCheckResult
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public Guid EvaluatedBy { get; set; }
}

/// <summary>
/// Raw SQL query result for coach lookup.
/// </summary>
internal class CoachLookupResult
{
    public Guid CoachId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}

/// <summary>
/// Raw SQL query result for evaluation data.
/// </summary>
internal class EvaluationRawResult
{
    public Guid Id { get; set; }
    public Guid EvaluatedBy { get; set; }
    public DateTime EvaluatedAt { get; set; }
    public int? OverallRating { get; set; }
    public string? CoachNotes { get; set; }
    public DateOnly? PeriodStart { get; set; }
    public DateOnly? PeriodEnd { get; set; }
    public string? CoachName { get; set; }
}

/// <summary>
/// Raw SQL query result for attribute data.
/// </summary>
internal class AttributeRawResult
{
    public string? AttributeName { get; set; }
    public int? Rating { get; set; }
    public string? Notes { get; set; }
}

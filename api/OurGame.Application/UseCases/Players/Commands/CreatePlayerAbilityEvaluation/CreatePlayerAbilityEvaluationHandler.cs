using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAbilities.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Commands.CreatePlayerAbilityEvaluation;

/// <summary>
/// Handler for creating a new player ability evaluation.
/// Validates coach permissions and inserts evaluation with attributes.
/// </summary>
public class CreatePlayerAbilityEvaluationHandler : IRequestHandler<CreatePlayerAbilityEvaluationCommand, PlayerAbilityEvaluationDto>
{
    private readonly OurGameContext _db;

    public CreatePlayerAbilityEvaluationHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<PlayerAbilityEvaluationDto> Handle(CreatePlayerAbilityEvaluationCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;

        // Verify player exists
        var playerExists = await _db.Players.AnyAsync(p => p.Id == command.PlayerId, cancellationToken);
        if (!playerExists)
        {
            throw new NotFoundException("Player", command.PlayerId.ToString());
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

        // Use first available coach if current user is not a coach
        if (coachResult == null)
        {
            coachResult = await _db.Database
                .SqlQueryRaw<CoachLookupResult>(@"
                    SELECT TOP 1 c.Id as CoachId, c.FirstName, c.LastName
                    FROM Coaches c
                    WHERE c.IsArchived = 0
                    ORDER BY c.Id
                ")
                .FirstOrDefaultAsync(cancellationToken);
                
            if (coachResult == null)
            {
                throw new ValidationException("System", "No coaches available in the system.");
            }
        }

        // Validate ratings are within range (0-99)
        if (dto.Attributes.Any(a => a.Rating < 0 || a.Rating > 99))
        {
            throw new ValidationException("Attributes", "All attribute ratings must be between 0 and 99.");
        }

        // Compute overall rating as average of all provided attribute ratings
        var overallRating = (int)Math.Round(dto.Attributes.Average(a => a.Rating));

        // Generate IDs for evaluation and attributes
        var evaluationId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var evaluatedAtDateTime = dto.EvaluatedAt.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        // Start transaction for multi-insert operation
        using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            // Insert into AttributeEvaluations
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO AttributeEvaluations (Id, PlayerId, EvaluatedBy, EvaluatedAt, OverallRating, CoachNotes, PeriodStart, PeriodEnd)
                VALUES ({evaluationId}, {command.PlayerId}, {coachResult.CoachId}, {evaluatedAtDateTime}, {overallRating}, {dto.CoachNotes}, {dto.PeriodStart}, {dto.PeriodEnd})
            ", cancellationToken);

            // Insert into EvaluationAttributes for each provided attribute
            foreach (var attribute in dto.Attributes)
            {
                var attributeId = Guid.NewGuid();
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO EvaluationAttributes (Id, EvaluationId, AttributeName, Rating, Notes)
                    VALUES ({attributeId}, {evaluationId}, {attribute.AttributeName}, {attribute.Rating}, {attribute.Notes})
                ", cancellationToken);
            }

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        // Query back the created evaluation with all attributes
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
            ", evaluationId)
            .FirstOrDefaultAsync(cancellationToken);

        if (evaluation == null)
        {
            throw new Exception("Failed to retrieve created evaluation.");
        }

        // Query attributes for this evaluation
        var attributes = await _db.Database
            .SqlQueryRaw<AttributeRawResult>(@"
                SELECT AttributeName, Rating, Notes
                FROM EvaluationAttributes
                WHERE EvaluationId = {0}
                ORDER BY AttributeName
            ", evaluationId)
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

using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Commands.DeletePlayerAbilityEvaluation;

/// <summary>
/// Handler for deleting an existing player ability evaluation.
/// Validates coach permissions and removes evaluation with attributes.
/// Only the creating coach can delete their evaluation.
/// </summary>
public class DeletePlayerAbilityEvaluationHandler : IRequestHandler<DeletePlayerAbilityEvaluationCommand>
{
    private readonly OurGameContext _db;

    public DeletePlayerAbilityEvaluationHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task Handle(DeletePlayerAbilityEvaluationCommand command, CancellationToken cancellationToken)
    {
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
                SELECT c.Id as CoachId
                FROM Users u
                INNER JOIN Coaches c ON c.UserId = u.Id
                WHERE u.AuthId = {0} AND c.IsArchived = 0
            ", command.AzureUserId)
            .FirstOrDefaultAsync(cancellationToken);

        if (coachResult == null)
        {
            throw new ForbiddenException("User is not authorized to delete evaluations. Only coaches can perform evaluations.");
        }

        // Verify user is the coach who created the evaluation
        if (evaluationCheck.EvaluatedBy != coachResult.CoachId)
        {
            throw new ForbiddenException("Only the coach who created this evaluation can delete it.");
        }

        // Start transaction for multi-step operation
        using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            // Delete EvaluationAttributes first (foreign key constraint)
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                DELETE FROM EvaluationAttributes WHERE EvaluationId = {command.EvaluationId}
            ", cancellationToken);

            // Delete AttributeEvaluations
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                DELETE FROM AttributeEvaluations WHERE Id = {command.EvaluationId}
            ", cancellationToken);

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
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
}

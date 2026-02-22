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

using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Commands.ArchivePlayerAbilityEvaluation;

/// <summary>
/// Handler for archiving or unarchiving an existing player ability evaluation.
/// </summary>
public class ArchivePlayerAbilityEvaluationHandler : IRequestHandler<ArchivePlayerAbilityEvaluationCommand>
{
    private readonly OurGameContext _db;

    public ArchivePlayerAbilityEvaluationHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task Handle(ArchivePlayerAbilityEvaluationCommand command, CancellationToken cancellationToken)
    {
        var evaluation = await _db.AttributeEvaluations
            .FirstOrDefaultAsync(ae => ae.Id == command.EvaluationId, cancellationToken);

        if (evaluation == null || evaluation.PlayerId != command.PlayerId)
        {
            throw new NotFoundException("Evaluation", command.EvaluationId.ToString());
        }

        if (evaluation.IsArchived == command.IsArchived)
        {
            return;
        }

        evaluation.IsArchived = command.IsArchived;
        await _db.SaveChangesAsync(cancellationToken);
    }
}

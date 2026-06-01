using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Competencies.Commands.ArchivePlayerCompetencyEvaluation;

public record ArchivePlayerCompetencyEvaluationCommand(
    Guid PlayerId,
    Guid EvaluationId,
    bool IsArchived) : IRequest<Unit>;

public class ArchivePlayerCompetencyEvaluationHandler : IRequestHandler<ArchivePlayerCompetencyEvaluationCommand, Unit>
{
    private readonly OurGameContext _db;

    public ArchivePlayerCompetencyEvaluationHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(ArchivePlayerCompetencyEvaluationCommand request, CancellationToken cancellationToken)
    {
        var evaluation = await _db.PlayerCompetencyEvaluations
            .FirstOrDefaultAsync(e => e.Id == request.EvaluationId && e.PlayerId == request.PlayerId, cancellationToken)
            ?? throw new NotFoundException("PlayerCompetencyEvaluation", request.EvaluationId.ToString());

        evaluation.IsArchived = request.IsArchived;
        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

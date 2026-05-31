using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Competencies.Commands.DeleteCompetencyFramework;

public record DeleteCompetencyFrameworkCommand(Guid FrameworkId) : IRequest<Unit>;

public class DeleteCompetencyFrameworkHandler : IRequestHandler<DeleteCompetencyFrameworkCommand, Unit>
{
    private readonly OurGameContext _db;

    public DeleteCompetencyFrameworkHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(DeleteCompetencyFrameworkCommand request, CancellationToken cancellationToken)
    {
        var framework = await _db.CompetencyFrameworks
            .FirstOrDefaultAsync(f => f.Id == request.FrameworkId, cancellationToken)
            ?? throw new NotFoundException("CompetencyFramework", request.FrameworkId.ToString());

        if (framework.IsSystemDefault)
        {
            throw new ValidationException("Framework", "System default frameworks cannot be deleted.");
        }

        var assignments = await _db.CompetencyFrameworkAssignments.AnyAsync(a => a.FrameworkId == framework.Id, cancellationToken);
        if (assignments)
        {
            throw new ValidationException("Framework", "Cannot delete a framework that is currently assigned. Reassign affected clubs/age groups/teams first.");
        }

        framework.IsArchived = true;
        framework.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}

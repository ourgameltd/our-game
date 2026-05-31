using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services.CompetencyCalculation;
using OurGame.Application.UseCases.Competencies.Commands.UpdatePlayerCompetencies.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Competencies.Commands.UpdatePlayerCompetencies;

public record UpdatePlayerCompetenciesCommand(
    Guid PlayerId,
    string AzureUserId,
    UpdatePlayerCompetenciesRequestDto Dto) : IRequest<Unit>;

public class UpdatePlayerCompetenciesHandler : IRequestHandler<UpdatePlayerCompetenciesCommand, Unit>
{
    private readonly OurGameContext _db;
    private readonly ICompetencyCalculationService _calculator;

    public UpdatePlayerCompetenciesHandler(OurGameContext db, ICompetencyCalculationService calculator)
    {
        _db = db;
        _calculator = calculator;
    }

    public async Task<Unit> Handle(UpdatePlayerCompetenciesCommand request, CancellationToken cancellationToken)
    {
        var player = await _db.Players
            .FirstOrDefaultAsync(p => p.Id == request.PlayerId, cancellationToken)
            ?? throw new NotFoundException("Player", request.PlayerId.ToString());

        var coachId = await _db.Coaches
            .Where(c => c.User != null && c.User.AuthId == request.AzureUserId && !c.IsArchived)
            .Select(c => (Guid?)c.Id)
            .FirstOrDefaultAsync(cancellationToken);

        var competencyIds = await _db.Competencies.Select(c => c.Id).ToListAsync(cancellationToken);
        var competencyIdSet = competencyIds.ToHashSet();

        foreach (var input in request.Dto.Bands)
        {
            if (!competencyIdSet.Contains(input.CompetencyId))
            {
                throw new ValidationException("CompetencyId", $"Unknown competency id {input.CompetencyId}.");
            }
        }

        var existing = await _db.PlayerCompetencyLevels
            .Where(l => l.PlayerId == request.PlayerId)
            .ToDictionaryAsync(l => l.CompetencyId, cancellationToken);

        var now = DateTime.UtcNow;
        foreach (var input in request.Dto.Bands)
        {
            if (existing.TryGetValue(input.CompetencyId, out var row))
            {
                row.Band = input.Band;
                row.UpdatedAt = now;
                row.UpdatedByCoachId = coachId;
            }
            else
            {
                _db.PlayerCompetencyLevels.Add(new PlayerCompetencyLevel
                {
                    Id = Guid.NewGuid(),
                    PlayerId = request.PlayerId,
                    CompetencyId = input.CompetencyId,
                    Band = input.Band,
                    UpdatedByCoachId = coachId,
                    CreatedAt = now,
                    UpdatedAt = now,
                });
            }
        }

        // Snapshot the change as a historical evaluation row for audit trail.
        if (coachId is not null && request.Dto.Bands.Count > 0)
        {
            var evaluation = new PlayerCompetencyEvaluation
            {
                Id = Guid.NewGuid(),
                PlayerId = request.PlayerId,
                EvaluatedBy = coachId.Value,
                EvaluatedAt = now,
                CoachNotes = request.Dto.CoachNotes ?? string.Empty,
                IsArchived = false,
            };
            evaluation.Levels = request.Dto.Bands.Select(b => new PlayerCompetencyEvaluationLevel
            {
                Id = Guid.NewGuid(),
                EvaluationId = evaluation.Id,
                CompetencyId = b.CompetencyId,
                Band = b.Band,
            }).ToList();
            _db.PlayerCompetencyEvaluations.Add(evaluation);
        }

        await _db.SaveChangesAsync(cancellationToken);

        // Synchronous recalculation: a single player is cheap to recompute.
        await _calculator.RecalculatePlayerScoresAsync(request.PlayerId, cancellationToken);

        return Unit.Value;
    }
}

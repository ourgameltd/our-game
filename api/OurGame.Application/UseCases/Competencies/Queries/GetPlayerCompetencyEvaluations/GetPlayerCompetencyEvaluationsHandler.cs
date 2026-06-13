using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.UseCases.Competencies.Queries.GetPlayerCompetencyEvaluations.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Competencies.Queries.GetPlayerCompetencyEvaluations;

public record GetPlayerCompetencyEvaluationsQuery(Guid PlayerId) : IRequest<List<PlayerCompetencyEvaluationSummaryDto>>;

public class GetPlayerCompetencyEvaluationsHandler : IRequestHandler<GetPlayerCompetencyEvaluationsQuery, List<PlayerCompetencyEvaluationSummaryDto>>
{
    private readonly OurGameContext _db;

    public GetPlayerCompetencyEvaluationsHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<PlayerCompetencyEvaluationSummaryDto>> Handle(GetPlayerCompetencyEvaluationsQuery request, CancellationToken cancellationToken)
    {
        var evaluations = await _db.PlayerCompetencyEvaluations
            .Where(e => e.PlayerId == request.PlayerId)
            .OrderByDescending(e => e.EvaluatedAt)
            .Select(e => new
            {
                e.Id,
                e.EvaluatedAt,
                e.CoachNotes,
                e.OverallBand,
                e.IsArchived,
                CoachName = e.EvaluatedByNavigation != null
                    ? $"{e.EvaluatedByNavigation.FirstName} {e.EvaluatedByNavigation.LastName}".Trim()
                    : "Unknown",
                Levels = e.Levels.Select(l => new
                {
                    l.CompetencyId,
                    CompetencyName = l.Competency.Name,
                    CompetencyGoalkeeperName = l.Competency.GoalkeeperName,
                    l.Competency.DisplayOrder,
                    l.Band,
                }).ToList(),
            })
            .ToListAsync(cancellationToken);

        return evaluations.Select(e => new PlayerCompetencyEvaluationSummaryDto
        {
            Id = e.Id,
            EvaluatedAt = e.EvaluatedAt,
            CoachName = e.CoachName,
            CoachNotes = e.CoachNotes ?? string.Empty,
            OverallBand = e.OverallBand,
            IsArchived = e.IsArchived,
            Levels = e.Levels
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new EvaluationBandDto
                {
                    CompetencyId = l.CompetencyId,
                    CompetencyName = l.CompetencyName,
                    CompetencyGoalkeeperName = l.CompetencyGoalkeeperName,
                    DisplayOrder = l.DisplayOrder,
                    Band = l.Band,
                }).ToList(),
        }).ToList();
    }
}

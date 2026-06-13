using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.UseCases.Competencies.Queries.GetCompetencyFramework.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Competencies.Queries.GetCompetencyFramework;

public record GetCompetencyFrameworkQuery(Guid FrameworkId) : IRequest<CompetencyFrameworkDetailDto?>;

public class GetCompetencyFrameworkHandler : IRequestHandler<GetCompetencyFrameworkQuery, CompetencyFrameworkDetailDto?>
{
    private readonly OurGameContext _db;

    public GetCompetencyFrameworkHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<CompetencyFrameworkDetailDto?> Handle(GetCompetencyFrameworkQuery request, CancellationToken cancellationToken)
    {
        var f = await _db.CompetencyFrameworks
            .Where(x => x.Id == request.FrameworkId && !x.IsArchived)
            .FirstOrDefaultAsync(cancellationToken);
        if (f is null) return null;

        var thresholds = await _db.CompetencyFrameworkBandThresholds
            .Where(t => t.FrameworkId == f.Id)
            .Select(t => new BandThresholdDto { Band = t.Band, Threshold = t.Threshold })
            .ToListAsync(cancellationToken);

        var attributes = await _db.CompetencyAttributes
            .Select(a => new
            {
                a.Id,
                a.Name,
                a.GoalkeeperName,
                a.DisplayOrder,
                a.CategoryId,
                CategoryName = a.Category.Name,
                CategoryOrder = a.Category.DisplayOrder,
                a.CompetencyId,
                CompetencyName = a.Competency.Name,
                CompetencyGoalkeeperName = a.Competency.GoalkeeperName,
            })
            .ToListAsync(cancellationToken);

        var weights = await _db.CompetencyFrameworkAttributeWeights
            .Where(w => w.FrameworkId == f.Id)
            .ToListAsync(cancellationToken);

        var weightsByAttribute = weights
            .Where(w => !w.IsGoalkeeper)
            .GroupBy(w => w.AttributeId)
            .ToDictionary(g => g.Key, g => g.ToDictionary(w => w.Format, w => w.WeightPercent));

        var goalkeeperWeightsByAttribute = weights
            .Where(w => w.IsGoalkeeper)
            .GroupBy(w => w.AttributeId)
            .ToDictionary(g => g.Key, g => g.ToDictionary(w => w.Format, w => w.WeightPercent));

        var categories = attributes
            .GroupBy(a => new { a.CategoryId, a.CategoryName, a.CategoryOrder })
            .OrderBy(g => g.Key.CategoryOrder)
            .Select(g => new CategoryWeightDto
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.CategoryName,
                DisplayOrder = g.Key.CategoryOrder,
                Attributes = g.OrderBy(a => a.DisplayOrder).Select(a => new AttributeWeightDto
                {
                    AttributeId = a.Id,
                    AttributeName = a.Name,
                    AttributeGoalkeeperName = a.GoalkeeperName,
                    DisplayOrder = a.DisplayOrder,
                    CompetencyId = a.CompetencyId,
                    CompetencyName = a.CompetencyName,
                    CompetencyGoalkeeperName = a.CompetencyGoalkeeperName,
                    WeightsByFormat = weightsByAttribute.TryGetValue(a.Id, out var w)
                        ? w
                        : new Dictionary<GameFormat, int>(),
                    GoalkeeperWeightsByFormat = goalkeeperWeightsByAttribute.TryGetValue(a.Id, out var gw)
                        ? gw
                        : new Dictionary<GameFormat, int>(),
                }).ToList(),
            })
            .ToList();

        var descriptions = await _db.CompetencyFrameworkCompetencyDescriptions
            .Where(d => d.FrameworkId == f.Id)
            .ToListAsync(cancellationToken);

        var competencies = await _db.Competencies.OrderBy(c => c.DisplayOrder).ToListAsync(cancellationToken);
        var descriptionDtos = competencies.Select(c => new CompetencyDescriptionDto
        {
            CompetencyId = c.Id,
            CompetencyName = c.Name,
            CompetencyGoalkeeperName = c.GoalkeeperName,
            DisplayOrder = c.DisplayOrder,
            Descriptions = Enum.GetValues<CompetencyBand>().ToDictionary(
                band => band,
                band => descriptions.FirstOrDefault(d => !d.IsGoalkeeper && d.CompetencyId == c.Id && d.Band == band)?.Description ?? string.Empty),
            GoalkeeperDescriptions = Enum.GetValues<CompetencyBand>().ToDictionary(
                band => band,
                band => descriptions.FirstOrDefault(d => d.IsGoalkeeper && d.CompetencyId == c.Id && d.Band == band)?.Description ?? string.Empty),
        }).ToList();

        return new CompetencyFrameworkDetailDto
        {
            Id = f.Id,
            Name = f.Name,
            Description = f.Description,
            IsSystemDefault = f.IsSystemDefault,
            Scope = f.Scope,
            OwnerClubId = f.OwnerClubId,
            OwnerAgeGroupId = f.OwnerAgeGroupId,
            OwnerTeamId = f.OwnerTeamId,
            SourceFrameworkId = f.SourceFrameworkId,
            UpliftPercent = f.UpliftPercent,
            BandThresholds = thresholds,
            Categories = categories,
            CompetencyDescriptions = descriptionDtos,
        };
    }
}

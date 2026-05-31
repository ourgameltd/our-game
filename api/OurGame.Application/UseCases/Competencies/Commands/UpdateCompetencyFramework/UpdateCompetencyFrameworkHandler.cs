using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services.CompetencyCalculation;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Competencies.Commands.UpdateCompetencyFramework;

public class UpdateCompetencyFrameworkRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal UpliftPercent { get; set; } = 5m;
    public Dictionary<CompetencyBand, decimal> BandThresholds { get; set; } = new();
    public List<AttributeWeightInputDto> Weights { get; set; } = new();
    public List<CompetencyDescriptionInputDto> CompetencyDescriptions { get; set; } = new();
}

public class AttributeWeightInputDto
{
    public Guid AttributeId { get; set; }
    public GameFormat Format { get; set; }
    public int WeightPercent { get; set; }
}

public class CompetencyDescriptionInputDto
{
    public Guid CompetencyId { get; set; }
    public CompetencyBand Band { get; set; }
    public string Description { get; set; } = string.Empty;
}

public record UpdateCompetencyFrameworkCommand(Guid FrameworkId, UpdateCompetencyFrameworkRequestDto Dto) : IRequest<Unit>;

public class UpdateCompetencyFrameworkHandler : IRequestHandler<UpdateCompetencyFrameworkCommand, Unit>
{
    private readonly OurGameContext _db;

    public UpdateCompetencyFrameworkHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(UpdateCompetencyFrameworkCommand request, CancellationToken cancellationToken)
    {
        var framework = await _db.CompetencyFrameworks
            .FirstOrDefaultAsync(f => f.Id == request.FrameworkId, cancellationToken)
            ?? throw new NotFoundException("CompetencyFramework", request.FrameworkId.ToString());

        if (framework.IsSystemDefault)
        {
            throw new ValidationException("Framework", "System default frameworks cannot be edited. Clone them first.");
        }

        // Invariant checks first - throw before persisting anything.
        CompetencyFrameworkInvariants.EnsureThresholdsAscending(request.Dto.BandThresholds);
        CompetencyFrameworkInvariants.EnsureFormatTotalsAre100(
            request.Dto.Weights.Select(w => (w.Format, w.WeightPercent)));

        framework.Name = request.Dto.Name.Trim();
        framework.Description = request.Dto.Description;
        framework.UpliftPercent = request.Dto.UpliftPercent;
        framework.UpdatedAt = DateTime.UtcNow;

        // Replace thresholds.
        var existingThresholds = await _db.CompetencyFrameworkBandThresholds.Where(t => t.FrameworkId == framework.Id).ToListAsync(cancellationToken);
        _db.CompetencyFrameworkBandThresholds.RemoveRange(existingThresholds);
        foreach (var kv in request.Dto.BandThresholds)
        {
            _db.CompetencyFrameworkBandThresholds.Add(new CompetencyFrameworkBandThreshold
            {
                Id = Guid.NewGuid(),
                FrameworkId = framework.Id,
                Band = kv.Key,
                Threshold = kv.Value,
            });
        }

        // Replace weights.
        var existingWeights = await _db.CompetencyFrameworkAttributeWeights.Where(w => w.FrameworkId == framework.Id).ToListAsync(cancellationToken);
        _db.CompetencyFrameworkAttributeWeights.RemoveRange(existingWeights);
        foreach (var w in request.Dto.Weights)
        {
            _db.CompetencyFrameworkAttributeWeights.Add(new CompetencyFrameworkAttributeWeight
            {
                Id = Guid.NewGuid(),
                FrameworkId = framework.Id,
                AttributeId = w.AttributeId,
                Format = w.Format,
                WeightPercent = w.WeightPercent,
            });
        }

        // Replace descriptions.
        var existingDescriptions = await _db.CompetencyFrameworkCompetencyDescriptions.Where(d => d.FrameworkId == framework.Id).ToListAsync(cancellationToken);
        _db.CompetencyFrameworkCompetencyDescriptions.RemoveRange(existingDescriptions);
        foreach (var d in request.Dto.CompetencyDescriptions)
        {
            _db.CompetencyFrameworkCompetencyDescriptions.Add(new CompetencyFrameworkCompetencyDescription
            {
                Id = Guid.NewGuid(),
                FrameworkId = framework.Id,
                CompetencyId = d.CompetencyId,
                Band = d.Band,
                Description = string.IsNullOrWhiteSpace(d.Description) ? string.Empty : d.Description,
            });
        }

        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}

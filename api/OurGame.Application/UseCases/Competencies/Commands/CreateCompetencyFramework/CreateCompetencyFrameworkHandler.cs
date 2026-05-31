using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Competencies.Commands.CreateCompetencyFramework;

public class CreateCompetencyFrameworkRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? SourceFrameworkId { get; set; }
    public CompetencyFrameworkScope Scope { get; set; } = CompetencyFrameworkScope.Club;
    public Guid? OwnerClubId { get; set; }
    public Guid? OwnerAgeGroupId { get; set; }
    public Guid? OwnerTeamId { get; set; }
    public decimal UpliftPercent { get; set; } = 5m;
}

public record CreateCompetencyFrameworkCommand(CreateCompetencyFrameworkRequestDto Dto) : IRequest<Guid>;

public class CreateCompetencyFrameworkHandler : IRequestHandler<CreateCompetencyFrameworkCommand, Guid>
{
    private readonly OurGameContext _db;

    public CreateCompetencyFrameworkHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(CreateCompetencyFrameworkCommand request, CancellationToken cancellationToken)
    {
        var d = request.Dto;
        if (string.IsNullOrWhiteSpace(d.Name)) throw new ValidationException("Name", "Name is required.");

        var ownersSet = (new[] { d.OwnerClubId, d.OwnerAgeGroupId, d.OwnerTeamId }).Count(x => x is not null);
        if (d.Scope != CompetencyFrameworkScope.System && ownersSet != 1)
        {
            throw new ValidationException("Owner", "Exactly one of OwnerClubId / OwnerAgeGroupId / OwnerTeamId must be set for non-system frameworks.");
        }

        var newId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var framework = new CompetencyFramework
        {
            Id = newId,
            Name = d.Name.Trim(),
            Description = d.Description,
            IsSystemDefault = false,
            SourceFrameworkId = d.SourceFrameworkId,
            Scope = d.Scope,
            OwnerClubId = d.OwnerClubId,
            OwnerAgeGroupId = d.OwnerAgeGroupId,
            OwnerTeamId = d.OwnerTeamId,
            UpliftPercent = d.UpliftPercent,
            IsArchived = false,
            CreatedAt = now,
            UpdatedAt = now,
        };
        _db.CompetencyFrameworks.Add(framework);

        if (d.SourceFrameworkId is not null)
        {
            var src = await _db.CompetencyFrameworks
                .FirstOrDefaultAsync(f => f.Id == d.SourceFrameworkId.Value, cancellationToken)
                ?? throw new NotFoundException("CompetencyFramework", d.SourceFrameworkId.Value.ToString());

            framework.UpliftPercent = src.UpliftPercent;

            var srcThresholds = await _db.CompetencyFrameworkBandThresholds.Where(t => t.FrameworkId == src.Id).ToListAsync(cancellationToken);
            foreach (var t in srcThresholds)
            {
                _db.CompetencyFrameworkBandThresholds.Add(new CompetencyFrameworkBandThreshold
                {
                    Id = Guid.NewGuid(),
                    FrameworkId = newId,
                    Band = t.Band,
                    Threshold = t.Threshold,
                });
            }

            var srcWeights = await _db.CompetencyFrameworkAttributeWeights.Where(w => w.FrameworkId == src.Id).ToListAsync(cancellationToken);
            foreach (var w in srcWeights)
            {
                _db.CompetencyFrameworkAttributeWeights.Add(new CompetencyFrameworkAttributeWeight
                {
                    Id = Guid.NewGuid(),
                    FrameworkId = newId,
                    AttributeId = w.AttributeId,
                    Format = w.Format,
                    WeightPercent = w.WeightPercent,
                });
            }

            var srcDescriptions = await _db.CompetencyFrameworkCompetencyDescriptions.Where(x => x.FrameworkId == src.Id).ToListAsync(cancellationToken);
            foreach (var x in srcDescriptions)
            {
                _db.CompetencyFrameworkCompetencyDescriptions.Add(new CompetencyFrameworkCompetencyDescription
                {
                    Id = Guid.NewGuid(),
                    FrameworkId = newId,
                    CompetencyId = x.CompetencyId,
                    Band = x.Band,
                    Description = x.Description,
                });
            }
        }
        else
        {
            // Defaults: 18/35/52/70.
            foreach (var (band, threshold) in new[]
            {
                (CompetencyBand.Development, 18m),
                (CompetencyBand.Intermediate, 35m),
                (CompetencyBand.Advanced, 52m),
                (CompetencyBand.Elite, 70m),
            })
            {
                _db.CompetencyFrameworkBandThresholds.Add(new CompetencyFrameworkBandThreshold
                {
                    Id = Guid.NewGuid(),
                    FrameworkId = newId,
                    Band = band,
                    Threshold = threshold,
                });
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
        return newId;
    }
}

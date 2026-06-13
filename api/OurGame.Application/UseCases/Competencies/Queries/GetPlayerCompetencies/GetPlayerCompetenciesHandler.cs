using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.UseCases.Competencies.Queries.GetPlayerCompetencies.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Competencies.Queries.GetPlayerCompetencies;

public record GetPlayerCompetenciesQuery(Guid PlayerId) : IRequest<PlayerCompetenciesDto?>;

public class GetPlayerCompetenciesHandler : IRequestHandler<GetPlayerCompetenciesQuery, PlayerCompetenciesDto?>
{
    private readonly OurGameContext _db;

    public GetPlayerCompetenciesHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<PlayerCompetenciesDto?> Handle(GetPlayerCompetenciesQuery request, CancellationToken cancellationToken)
    {
        var player = await _db.Players
            .Where(p => p.Id == request.PlayerId)
            .Select(p => new { p.Id, p.FirstName, p.LastName, p.OverallRating, p.OverallBand, p.ClubId, p.PreferredPositions })
            .FirstOrDefaultAsync(cancellationToken);

        if (player is null) return null;

        var isGoalkeeper = Services.CompetencyCalculation.GoalkeeperDetection.IsGoalkeeper(player.PreferredPositions);

        // Each competency is listed once. Category is determined by where most of the
        // competency's attributes live (the spec models competencies as primary-category-ish,
        // and the UI groups by category for display only).
        var competencyAttributes = await _db.CompetencyAttributes
            .Select(a => new { a.CompetencyId, CategoryName = a.Category.Name, CategoryOrder = a.Category.DisplayOrder })
            .ToListAsync(cancellationToken);

        var primaryCategoryByCompetency = competencyAttributes
            .GroupBy(x => x.CompetencyId)
            .ToDictionary(
                g => g.Key,
                g => g.GroupBy(x => x.CategoryName)
                      .OrderByDescending(cg => cg.Count())
                      .ThenBy(cg => cg.First().CategoryOrder)
                      .First().Key);

        var competencies = (await _db.Competencies
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new { c.Id, c.Name, c.GoalkeeperName, c.DisplayOrder })
            .ToListAsync(cancellationToken))
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.GoalkeeperName,
                c.DisplayOrder,
                CategoryName = primaryCategoryByCompetency.TryGetValue(c.Id, out var cn) ? cn : "Skills",
            })
            .ToList();

        var bands = await _db.PlayerCompetencyLevels
            .Where(l => l.PlayerId == request.PlayerId)
            .ToDictionaryAsync(l => l.CompetencyId, l => l.Band, cancellationToken);

        // Pick the framework that covers this player's primary team for description text.
        var primaryTeamId = await _db.PlayerTeams
            .Where(pt => pt.PlayerId == request.PlayerId)
            .OrderBy(pt => pt.AssignedAt)
            .Select(pt => (Guid?)pt.TeamId)
            .FirstOrDefaultAsync(cancellationToken);

        Dictionary<(Guid CompetencyId, CompetencyBand Band), string> descriptions = new();
        Dictionary<(Guid CompetencyId, CompetencyBand Band), string> goalkeeperDescriptions = new();
        if (primaryTeamId is not null)
        {
            var team = await _db.Teams
                .Where(t => t.Id == primaryTeamId.Value)
                .Select(t => new { t.AgeGroupId, t.ClubId })
                .FirstOrDefaultAsync(cancellationToken);

            Guid? frameworkId = null;
            if (team is not null)
            {
                frameworkId =
                    (await _db.CompetencyFrameworkAssignments.Where(a => a.TeamId == primaryTeamId.Value).FirstOrDefaultAsync(cancellationToken))?.FrameworkId
                    ?? (await _db.CompetencyFrameworkAssignments.Where(a => a.AgeGroupId == team.AgeGroupId).FirstOrDefaultAsync(cancellationToken))?.FrameworkId
                    ?? (await _db.CompetencyFrameworkAssignments.Where(a => a.ClubId == team.ClubId).FirstOrDefaultAsync(cancellationToken))?.FrameworkId;
            }

            if (frameworkId is not null)
            {
                var descriptionRows = await _db.CompetencyFrameworkCompetencyDescriptions
                    .Where(d => d.FrameworkId == frameworkId.Value)
                    .ToListAsync(cancellationToken);
                descriptions = descriptionRows
                    .Where(d => !d.IsGoalkeeper)
                    .ToDictionary(d => (d.CompetencyId, d.Band), d => d.Description);
                goalkeeperDescriptions = descriptionRows
                    .Where(d => d.IsGoalkeeper)
                    .ToDictionary(d => (d.CompetencyId, d.Band), d => d.Description);
            }
        }

        var competencyDtos = competencies.Select(c => new PlayerCompetencyBandDto
        {
            CompetencyId = c.Id,
            CompetencyName = c.Name,
            CompetencyGoalkeeperName = c.GoalkeeperName,
            DisplayOrder = c.DisplayOrder,
            CategoryName = c.CategoryName,
            Band = bands.TryGetValue(c.Id, out var b) ? b : null,
            Descriptions = Enum.GetValues<CompetencyBand>()
                .ToDictionary(band => band, band => descriptions.TryGetValue((c.Id, band), out var d) ? d : string.Empty),
            GoalkeeperDescriptions = Enum.GetValues<CompetencyBand>()
                .ToDictionary(band => band, band => goalkeeperDescriptions.TryGetValue((c.Id, band), out var d) ? d : string.Empty),
        }).ToList();

        var scores = await _db.PlayerTeamScores
            .Where(s => s.PlayerId == request.PlayerId)
            .Select(s => new PlayerTeamScoreDto
            {
                TeamId = s.TeamId,
                TeamName = s.Team.Name,
                Format = s.Format,
                FrameworkId = s.FrameworkId,
                FrameworkName = s.Framework.Name,
                BaseScore = s.BaseScore,
                BoostedScore = s.BoostedScore,
                Band = s.Band,
                CalculatedAt = s.CalculatedAt,
            })
            .ToListAsync(cancellationToken);

        return new PlayerCompetenciesDto
        {
            PlayerId = player.Id,
            PlayerName = $"{player.FirstName} {player.LastName}".Trim(),
            OverallRating = player.OverallRating,
            OverallBand = player.OverallBand,
            IsGoalkeeper = isGoalkeeper,
            Competencies = competencyDtos,
            TeamScores = scores,
        };
    }
}

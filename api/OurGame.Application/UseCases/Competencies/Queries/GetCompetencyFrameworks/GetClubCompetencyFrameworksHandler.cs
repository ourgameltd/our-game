using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.UseCases.Competencies.Queries.GetCompetencyFrameworks.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Competencies.Queries.GetCompetencyFrameworks;

public record GetClubCompetencyFrameworksQuery(Guid ClubId) : IRequest<List<CompetencyFrameworkListItemDto>>;

public class GetClubCompetencyFrameworksHandler : IRequestHandler<GetClubCompetencyFrameworksQuery, List<CompetencyFrameworkListItemDto>>
{
    private readonly OurGameContext _db;

    public GetClubCompetencyFrameworksHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<CompetencyFrameworkListItemDto>> Handle(GetClubCompetencyFrameworksQuery request, CancellationToken cancellationToken)
    {
        // System defaults + frameworks owned by the club or any of its age groups/teams.
        var ageGroupIds = await _db.AgeGroups.Where(a => a.ClubId == request.ClubId).Select(a => a.Id).ToListAsync(cancellationToken);
        var teamIds = await _db.Teams.Where(t => t.ClubId == request.ClubId).Select(t => t.Id).ToListAsync(cancellationToken);

        var query = _db.CompetencyFrameworks
            .Where(f => !f.IsArchived &&
                (f.IsSystemDefault
                 || f.OwnerClubId == request.ClubId
                 || (f.OwnerAgeGroupId != null && ageGroupIds.Contains(f.OwnerAgeGroupId.Value))
                 || (f.OwnerTeamId != null && teamIds.Contains(f.OwnerTeamId.Value))));

        var rows = await query
            .OrderByDescending(f => f.IsSystemDefault)
            .ThenBy(f => f.Name)
            .Select(f => new CompetencyFrameworkListItemDto
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
                UpdatedAt = f.UpdatedAt,
                AssignmentCount = _db.CompetencyFrameworkAssignments.Count(a => a.FrameworkId == f.Id),
            })
            .ToListAsync(cancellationToken);

        return rows;
    }
}

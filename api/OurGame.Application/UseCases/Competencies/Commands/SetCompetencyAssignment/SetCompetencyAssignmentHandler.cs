using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services.CompetencyCalculation;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Competencies.Commands.SetCompetencyAssignment;

public class SetCompetencyAssignmentRequestDto
{
    public Guid FrameworkId { get; set; }
    public bool? AllowAgeGroupOverride { get; set; }
    public bool? AllowTeamOverride { get; set; }
}

public record SetCompetencyAssignmentCommand(
    CompetencyFrameworkScope Scope,
    Guid ScopeId,
    SetCompetencyAssignmentRequestDto Dto) : IRequest<Unit>;

public class SetCompetencyAssignmentHandler : IRequestHandler<SetCompetencyAssignmentCommand, Unit>
{
    private readonly OurGameContext _db;
    private readonly ICompetencyCalculationService _calculator;

    public SetCompetencyAssignmentHandler(OurGameContext db, ICompetencyCalculationService calculator)
    {
        _db = db;
        _calculator = calculator;
    }

    public async Task<Unit> Handle(SetCompetencyAssignmentCommand request, CancellationToken cancellationToken)
    {
        var framework = await _db.CompetencyFrameworks.FirstOrDefaultAsync(f => f.Id == request.Dto.FrameworkId && !f.IsArchived, cancellationToken)
            ?? throw new NotFoundException("CompetencyFramework", request.Dto.FrameworkId.ToString());

        switch (request.Scope)
        {
            case CompetencyFrameworkScope.Club:
                await SetClubAssignmentAsync(request.ScopeId, framework.Id, request.Dto.AllowAgeGroupOverride, cancellationToken);
                break;
            case CompetencyFrameworkScope.AgeGroup:
                await SetAgeGroupAssignmentAsync(request.ScopeId, framework.Id, request.Dto.AllowTeamOverride, cancellationToken);
                break;
            case CompetencyFrameworkScope.Team:
                await SetTeamAssignmentAsync(request.ScopeId, framework.Id, cancellationToken);
                break;
            default:
                throw new ValidationException("Scope", "Unsupported scope.");
        }

        await _db.SaveChangesAsync(cancellationToken);

        // Enqueue recalculation work. Phase 3 wires a queue worker; for now run inline so the API contract is honoured.
        switch (request.Scope)
        {
            case CompetencyFrameworkScope.Club:
                await _calculator.RecalculateClubAsync(request.ScopeId, cancellationToken);
                break;
            case CompetencyFrameworkScope.AgeGroup:
                await _calculator.RecalculateAgeGroupAsync(request.ScopeId, cancellationToken);
                break;
            case CompetencyFrameworkScope.Team:
                await _calculator.RecalculateTeamAsync(request.ScopeId, cancellationToken);
                break;
        }

        return Unit.Value;
    }

    private async Task SetClubAssignmentAsync(Guid clubId, Guid frameworkId, bool? allowAgeGroupOverride, CancellationToken ct)
    {
        var existing = await _db.CompetencyFrameworkAssignments.FirstOrDefaultAsync(a => a.ClubId == clubId, ct);
        var now = DateTime.UtcNow;
        if (existing is null)
        {
            _db.CompetencyFrameworkAssignments.Add(new CompetencyFrameworkAssignment
            {
                Id = Guid.NewGuid(),
                FrameworkId = frameworkId,
                Scope = CompetencyFrameworkScope.Club,
                ClubId = clubId,
                CreatedAt = now,
                UpdatedAt = now,
            });
        }
        else
        {
            existing.FrameworkId = frameworkId;
            existing.UpdatedAt = now;
        }

        if (allowAgeGroupOverride is not null)
        {
            var settings = await _db.ClubCompetencySettings.FirstOrDefaultAsync(s => s.ClubId == clubId, ct);
            if (settings is null)
            {
                _db.ClubCompetencySettings.Add(new ClubCompetencySettings
                {
                    Id = Guid.NewGuid(),
                    ClubId = clubId,
                    AllowAgeGroupOverride = allowAgeGroupOverride.Value,
                    CreatedAt = now,
                    UpdatedAt = now,
                });
            }
            else
            {
                settings.AllowAgeGroupOverride = allowAgeGroupOverride.Value;
                settings.UpdatedAt = now;
            }
        }
    }

    private async Task SetAgeGroupAssignmentAsync(Guid ageGroupId, Guid frameworkId, bool? allowTeamOverride, CancellationToken ct)
    {
        var ageGroup = await _db.AgeGroups.FirstOrDefaultAsync(a => a.Id == ageGroupId, ct)
            ?? throw new NotFoundException("AgeGroup", ageGroupId.ToString());

        var clubSettings = await _db.ClubCompetencySettings.FirstOrDefaultAsync(s => s.ClubId == ageGroup.ClubId, ct);
        if (clubSettings is null || !clubSettings.AllowAgeGroupOverride)
        {
            throw new ValidationException("Override", "Club does not permit age groups to override the competency framework.");
        }

        var now = DateTime.UtcNow;
        var existing = await _db.CompetencyFrameworkAssignments.FirstOrDefaultAsync(a => a.AgeGroupId == ageGroupId, ct);
        if (existing is null)
        {
            _db.CompetencyFrameworkAssignments.Add(new CompetencyFrameworkAssignment
            {
                Id = Guid.NewGuid(),
                FrameworkId = frameworkId,
                Scope = CompetencyFrameworkScope.AgeGroup,
                AgeGroupId = ageGroupId,
                CreatedAt = now,
                UpdatedAt = now,
            });
        }
        else
        {
            existing.FrameworkId = frameworkId;
            existing.UpdatedAt = now;
        }

        if (allowTeamOverride is not null)
        {
            var settings = await _db.AgeGroupCompetencySettings.FirstOrDefaultAsync(s => s.AgeGroupId == ageGroupId, ct);
            if (settings is null)
            {
                _db.AgeGroupCompetencySettings.Add(new AgeGroupCompetencySettings
                {
                    Id = Guid.NewGuid(),
                    AgeGroupId = ageGroupId,
                    AllowTeamOverride = allowTeamOverride.Value,
                    CreatedAt = now,
                    UpdatedAt = now,
                });
            }
            else
            {
                settings.AllowTeamOverride = allowTeamOverride.Value;
                settings.UpdatedAt = now;
            }
        }
    }

    private async Task SetTeamAssignmentAsync(Guid teamId, Guid frameworkId, CancellationToken ct)
    {
        var team = await _db.Teams.FirstOrDefaultAsync(t => t.Id == teamId, ct)
            ?? throw new NotFoundException("Team", teamId.ToString());

        var ageGroupSettings = await _db.AgeGroupCompetencySettings.FirstOrDefaultAsync(s => s.AgeGroupId == team.AgeGroupId, ct);
        if (ageGroupSettings is null || !ageGroupSettings.AllowTeamOverride)
        {
            throw new ValidationException("Override", "Age group does not permit teams to override the competency framework.");
        }

        var now = DateTime.UtcNow;
        var existing = await _db.CompetencyFrameworkAssignments.FirstOrDefaultAsync(a => a.TeamId == teamId, ct);
        if (existing is null)
        {
            _db.CompetencyFrameworkAssignments.Add(new CompetencyFrameworkAssignment
            {
                Id = Guid.NewGuid(),
                FrameworkId = frameworkId,
                Scope = CompetencyFrameworkScope.Team,
                TeamId = teamId,
                CreatedAt = now,
                UpdatedAt = now,
            });
        }
        else
        {
            existing.FrameworkId = frameworkId;
            existing.UpdatedAt = now;
        }
    }
}

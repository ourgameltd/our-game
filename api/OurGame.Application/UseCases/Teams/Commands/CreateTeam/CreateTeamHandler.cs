using System.Text.RegularExpressions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Teams.Queries.GetTeamOverview.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Commands.CreateTeam;

/// <summary>
/// Handler for creating a new team.
/// </summary>
public class CreateTeamHandler : IRequestHandler<CreateTeamCommand, TeamOverviewTeamDto>
{
    private static readonly Regex HexColorRegex = new(@"^#[0-9A-Fa-f]{6}$", RegexOptions.Compiled);

    private readonly OurGameContext _db;

    public CreateTeamHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<TeamOverviewTeamDto> Handle(CreateTeamCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;

        // Validate ClubId exists
        var clubExists = await _db.Clubs.AnyAsync(c => c.Id == dto.ClubId, cancellationToken);
        if (!clubExists)
        {
            throw new NotFoundException("Club", dto.ClubId.ToString());
        }

        // Validate AgeGroupId exists and belongs to the club
        var ageGroup = await _db.Database
            .SqlQueryRaw<AgeGroupValidationResult>(@"
                SELECT Id, ClubId, IsArchived
                FROM AgeGroups
                WHERE Id = {0}
            ", dto.AgeGroupId)
            .FirstOrDefaultAsync(cancellationToken);

        if (ageGroup == null)
        {
            throw new NotFoundException("AgeGroup", dto.AgeGroupId.ToString());
        }

        if (ageGroup.ClubId != dto.ClubId)
        {
            throw new ValidationException("AgeGroupId",
                "Age group does not belong to the specified club.");
        }

        if (ageGroup.IsArchived)
        {
            throw new ValidationException("AgeGroupId",
                "Cannot create a team in an archived age group.");
        }

        // Validate Level
        if (!Enum.TryParse<Level>(dto.Level, ignoreCase: true, out var level))
        {
            throw new ValidationException("Level",
                "Invalid level. Must be one of: youth, amateur, reserve, senior.");
        }

        // Validate colors are valid hex format
        if (!HexColorRegex.IsMatch(dto.PrimaryColor))
        {
            throw new ValidationException("PrimaryColor",
                "PrimaryColor must be a valid hex color (#RRGGBB).");
        }

        if (!HexColorRegex.IsMatch(dto.SecondaryColor))
        {
            throw new ValidationException("SecondaryColor",
                "SecondaryColor must be a valid hex color (#RRGGBB).");
        }

        var newId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var levelInt = (int)level;
        var shortName = dto.ShortName ?? string.Empty;

        // Insert using parameterized SQL
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO Teams (Id, ClubId, AgeGroupId, Name, ShortName, Level, Season, PrimaryColor, SecondaryColor, IsArchived, CreatedAt, UpdatedAt)
            VALUES ({newId}, {dto.ClubId}, {dto.AgeGroupId}, {dto.Name}, {shortName}, {levelInt}, {dto.Season}, {dto.PrimaryColor}, {dto.SecondaryColor}, {false}, {now}, {now})
        ", cancellationToken);

        // Query back the created team
        var result = await _db.Database
            .SqlQueryRaw<TeamRawResult>(@"
                SELECT
                    t.Id,
                    t.ClubId,
                    t.AgeGroupId,
                    t.Name,
                    t.ShortName,
                    t.Level,
                    t.Season,
                    t.PrimaryColor,
                    t.SecondaryColor,
                    t.IsArchived
                FROM Teams t
                WHERE t.Id = {0}
            ", newId)
            .FirstOrDefaultAsync(cancellationToken);

        if (result == null)
        {
            throw new Exception("Failed to retrieve created team.");
        }

        var levelName = System.Enum.GetName(typeof(Level), result.Level) ?? Level.Youth.ToString();

        return new TeamOverviewTeamDto
        {
            Id = result.Id,
            ClubId = result.ClubId,
            AgeGroupId = result.AgeGroupId,
            Name = result.Name ?? string.Empty,
            ShortName = result.ShortName ?? string.Empty,
            Level = levelName.ToLowerInvariant(),
            Season = result.Season ?? string.Empty,
            Colors = new TeamColorsDto
            {
                Primary = result.PrimaryColor,
                Secondary = result.SecondaryColor
            },
            IsArchived = result.IsArchived
        };
    }
}

/// <summary>
/// Raw SQL query result for age group validation.
/// </summary>
internal class AgeGroupValidationResult
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public bool IsArchived { get; set; }
}

/// <summary>
/// Raw SQL query result for team data.
/// </summary>
internal class TeamRawResult
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public Guid AgeGroupId { get; set; }
    public string? Name { get; set; }
    public string? ShortName { get; set; }
    public int Level { get; set; }
    public string? Season { get; set; }
    public string? PrimaryColor { get; set; }
    public string? SecondaryColor { get; set; }
    public bool IsArchived { get; set; }
}

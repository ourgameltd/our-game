using System.Text.RegularExpressions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Teams.Queries.GetTeamOverview.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Commands.UpdateTeam;

/// <summary>
/// Handler for updating an existing team.
/// </summary>
public class UpdateTeamHandler : IRequestHandler<UpdateTeamCommand, TeamOverviewTeamDto>
{
    private static readonly Regex HexColorRegex = new(@"^#[0-9A-Fa-f]{6}$", RegexOptions.Compiled);

    private readonly OurGameContext _db;

    public UpdateTeamHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<TeamOverviewTeamDto> Handle(UpdateTeamCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var teamId = command.TeamId;

        // Check if team exists
        var existing = await _db.Database
            .SqlQueryRaw<TeamExistsResult>(
                "SELECT Id, IsArchived FROM Teams WHERE Id = {0}", teamId)
            .FirstOrDefaultAsync(cancellationToken);

        if (existing == null)
        {
            throw new NotFoundException("Team", teamId.ToString());
        }

        // Validate not archived
        if (existing.IsArchived)
        {
            throw new ValidationException("Team",
                "Cannot update an archived team. Please unarchive it first.");
        }

        // Parse and validate Level
        if (!Enum.TryParse<Level>(dto.Level, ignoreCase: true, out var level))
        {
            throw new ValidationException("Level",
                "Invalid level. Must be one of: youth, amateur, reserve, senior.");
        }

        // Validate colors are valid hex format
        if (!HexColorRegex.IsMatch(dto.PrimaryColor))
        {
            throw new ValidationException("PrimaryColor",
                "Invalid color format. Must be a valid hex color (#RRGGBB).");
        }

        if (!HexColorRegex.IsMatch(dto.SecondaryColor))
        {
            throw new ValidationException("SecondaryColor",
                "Invalid color format. Must be a valid hex color (#RRGGBB).");
        }

        var levelInt = (int)level;
        var now = DateTime.UtcNow;
        var shortName = dto.ShortName ?? string.Empty;

        // Update using parameterized SQL
        var rowsAffected = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE Teams
            SET 
                Name = {dto.Name},
                ShortName = {shortName},
                Level = {levelInt},
                Season = {dto.Season},
                PrimaryColor = {dto.PrimaryColor},
                SecondaryColor = {dto.SecondaryColor},
                UpdatedAt = {now}
            WHERE Id = {teamId}
        ", cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException("Team", teamId.ToString());
        }

        // Query back the updated team
        var result = await _db.Database
            .SqlQueryRaw<UpdateTeamRawResult>(@"
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
            ", teamId)
            .FirstOrDefaultAsync(cancellationToken);

        if (result == null)
        {
            throw new Exception("Failed to retrieve updated team.");
        }

        var levelName = Enum.GetName(typeof(Level), result.Level) ?? Level.Youth.ToString();

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
/// Raw SQL projection for checking team existence and archive state.
/// </summary>
internal class TeamExistsResult
{
    public Guid Id { get; set; }
    public bool IsArchived { get; set; }
}

/// <summary>
/// Raw SQL query result model for team data after update.
/// </summary>
internal class UpdateTeamRawResult
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

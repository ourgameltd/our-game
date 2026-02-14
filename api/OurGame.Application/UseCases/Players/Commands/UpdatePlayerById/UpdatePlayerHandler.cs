using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Commands.UpdatePlayerById;

/// <summary>
/// Handler for updating an existing player's settings.
/// Updates the Players table, rebuilds PlayerTeams assignments,
/// and derives PlayerAgeGroups from the selected teams.
/// </summary>
public class UpdatePlayerHandler : IRequestHandler<UpdatePlayerCommand, PlayerDto>
{
    private readonly OurGameContext _db;

    public UpdatePlayerHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<PlayerDto> Handle(UpdatePlayerCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var playerId = command.PlayerId;

        // 1. Verify the player exists and check archive state
        var existing = await _db.Database
            .SqlQueryRaw<PlayerExistsResult>(
                "SELECT Id, IsArchived FROM Players WHERE Id = {0}", playerId)
            .FirstOrDefaultAsync(cancellationToken);

        if (existing == null)
        {
            throw new NotFoundException("Player", playerId.ToString());
        }

        // Reject updates to currently-archived players (unless the request is un-archiving)
        if (existing.IsArchived && dto.IsArchived)
        {
            throw new ValidationException("IsArchived",
                "Cannot update an archived player. Please unarchive the player first.");
        }

        // 2. Serialize preferred positions to JSON for storage
        var preferredPositionsJson = JsonSerializer.Serialize(dto.PreferredPositions);
        var now = DateTime.UtcNow;
        var nickname = dto.Nickname ?? string.Empty;
        var associationId = dto.AssociationId ?? string.Empty;
        var emergencyContact = dto.EmergencyContact ?? string.Empty;

        // 3. Update the Players row
        var rowsAffected = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE Players
            SET
                FirstName           = {dto.FirstName},
                LastName            = {dto.LastName},
                Nickname            = {nickname},
                AssociationId       = {associationId},
                DateOfBirth         = {dto.DateOfBirth},
                PreferredPositions  = {preferredPositionsJson},
                IsArchived          = {dto.IsArchived},
                UpdatedAt           = {now}
            WHERE Id = {playerId}
        ", cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException("Player", playerId.ToString());
        }

        // 4. Rebuild PlayerTeams join table (delete existing, insert new)
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM PlayerTeams WHERE PlayerId = {playerId}
        ", cancellationToken);

        foreach (var teamId in dto.TeamIds)
        {
            var ptId = Guid.NewGuid();
            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO PlayerTeams (Id, PlayerId, TeamId, AssignedAt)
                VALUES ({ptId}, {playerId}, {teamId}, {now})
            ", cancellationToken);
        }

        // 5. Derive age groups from the selected teams and rebuild PlayerAgeGroups
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM PlayerAgeGroups WHERE PlayerId = {playerId}
        ", cancellationToken);

        if (dto.TeamIds.Length > 0)
        {
            // Get distinct age group IDs for the assigned teams
            var teamIdList = string.Join("','", dto.TeamIds);
            var ageGroupSql = $"SELECT DISTINCT AgeGroupId AS Id FROM Teams WHERE Id IN ('{teamIdList}')";

            var ageGroupIds = await _db.Database
                .SqlQueryRaw<AgeGroupIdResult>(ageGroupSql)
                .ToListAsync(cancellationToken);

            foreach (var ag in ageGroupIds)
            {
                var pagId = Guid.NewGuid();
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO PlayerAgeGroups (Id, PlayerId, AgeGroupId)
                    VALUES ({pagId}, {playerId}, {ag.Id})
                ", cancellationToken);
            }
        }

        // 6. Query back the updated player to return
        var result = await _db.Database
            .SqlQueryRaw<UpdatedPlayerRawDto>(@"
                SELECT 
                    p.Id,
                    p.FirstName,
                    p.LastName,
                    p.Photo AS PhotoUrl,
                    p.DateOfBirth,
                    p.ClubId,
                    c.Name AS ClubName,
                    pag.AgeGroupId,
                    ag.Name AS AgeGroupName,
                    pt.TeamId,
                    t.Name AS TeamName,
                    p.PreferredPositions AS PreferredPosition
                FROM Players p
                INNER JOIN Clubs c ON c.Id = p.ClubId
                LEFT JOIN PlayerAgeGroups pag ON pag.PlayerId = p.Id
                LEFT JOIN AgeGroups ag ON ag.Id = pag.AgeGroupId
                LEFT JOIN PlayerTeams pt ON pt.PlayerId = p.Id
                LEFT JOIN Teams t ON t.Id = pt.TeamId
                WHERE p.Id = {0}
            ", playerId)
            .FirstOrDefaultAsync(cancellationToken);

        if (result == null)
        {
            throw new Exception("Failed to retrieve updated player.");
        }

        return new PlayerDto
        {
            Id = result.Id,
            FirstName = result.FirstName ?? string.Empty,
            LastName = result.LastName ?? string.Empty,
            PhotoUrl = result.PhotoUrl,
            DateOfBirth = result.DateOfBirth?.ToDateTime(TimeOnly.MinValue),
            ClubId = result.ClubId,
            ClubName = result.ClubName,
            AgeGroupId = result.AgeGroupId,
            AgeGroupName = result.AgeGroupName,
            TeamId = result.TeamId,
            TeamName = result.TeamName,
            PreferredPosition = result.PreferredPosition
        };
    }
}

/// <summary>
/// Raw SQL projection for checking player existence and archive state.
/// </summary>
internal class PlayerExistsResult
{
    public Guid Id { get; set; }
    public bool IsArchived { get; set; }
}

/// <summary>
/// Raw SQL projection for extracting distinct age group IDs from teams.
/// </summary>
internal class AgeGroupIdResult
{
    public Guid Id { get; set; }
}

/// <summary>
/// Raw SQL query result model for the updated player data.
/// </summary>
internal class UpdatedPlayerRawDto
{
    public Guid Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhotoUrl { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public Guid? ClubId { get; set; }
    public string? ClubName { get; set; }
    public Guid? AgeGroupId { get; set; }
    public string? AgeGroupName { get; set; }
    public Guid? TeamId { get; set; }
    public string? TeamName { get; set; }
    public string? PreferredPosition { get; set; }
}

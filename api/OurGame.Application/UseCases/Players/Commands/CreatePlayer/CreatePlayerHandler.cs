using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Application.UseCases.Players.Commands.CreatePlayer.DTOs;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Commands.CreatePlayer;

/// <summary>
/// Command to create a new player within a club.
/// </summary>
public record CreatePlayerCommand(Guid ClubId, CreatePlayerRequestDto Dto, string? UserId = null) : IRequest<PlayerDto>;

/// <summary>
/// Handler for creating a player and related assignments.
/// </summary>
public class CreatePlayerHandler : IRequestHandler<CreatePlayerCommand, PlayerDto>
{
    private readonly OurGameContext _db;
    private readonly IMediator _mediator;
    private readonly IBlobStorageService _blobStorage;

    public CreatePlayerHandler(OurGameContext db, IMediator mediator, IBlobStorageService blobStorage)
    {
        _db = db;
        _mediator = mediator;
        _blobStorage = blobStorage;
    }

    public async Task<PlayerDto> Handle(CreatePlayerCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;

        if (dto.PreferredPositions == null || dto.PreferredPositions.Length == 0)
        {
            throw new ValidationException("PreferredPositions", "At least one preferred position is required.");
        }

        var clubExists = await _db.Clubs.AnyAsync(c => c.Id == command.ClubId, cancellationToken);
        if (!clubExists)
        {
            throw new NotFoundException("Club", command.ClubId.ToString());
        }

        if (dto.TeamIds is { Length: > 0 })
        {
            var teamCount = await _db.Teams
                .Where(t => dto.TeamIds.Contains(t.Id) && t.ClubId == command.ClubId)
                .Select(t => t.Id)
                .Distinct()
                .CountAsync(cancellationToken);

            if (teamCount != dto.TeamIds.Distinct().Count())
            {
                throw new ValidationException("TeamIds", "One or more teams are invalid for this club.");
            }
        }

        var playerId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var preferredPositionsJson = JsonSerializer.Serialize(dto.PreferredPositions);
        var nickname = dto.Nickname ?? string.Empty;
        var associationId = dto.AssociationId ?? string.Empty;
        var photo = await _blobStorage.UploadImageAsync(dto.Photo, "player-photos", playerId.ToString(), cancellationToken);
        var allergies = dto.Allergies ?? string.Empty;
        var medicalConditions = dto.MedicalConditions ?? string.Empty;

        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO Players (
                Id, ClubId, FirstName, LastName, Nickname, DateOfBirth,
                Photo, AssociationId, PreferredPositions, OverallRating,
                UserId, Allergies, MedicalConditions, IsArchived, CreatedAt, UpdatedAt
            )
            VALUES (
                {playerId}, {command.ClubId}, {dto.FirstName}, {dto.LastName}, {nickname}, {dto.DateOfBirth},
                {photo}, {associationId}, {preferredPositionsJson}, NULL,
                NULL, {allergies}, {medicalConditions}, {false}, {now}, {now}
            )
        ", cancellationToken);

        if (dto.EmergencyContacts is { Length: > 0 })
        {
            var hasPrimary = dto.EmergencyContacts.Any(c => c.IsPrimary);

            for (int i = 0; i < dto.EmergencyContacts.Length; i++)
            {
                var contact = dto.EmergencyContacts[i];
                var ecId = Guid.NewGuid();
                var isPrimary = (!hasPrimary && i == 0) ||
                                (hasPrimary && contact.IsPrimary && dto.EmergencyContacts.Take(i).All(c => !c.IsPrimary));

                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO EmergencyContacts (Id, PlayerId, Name, Phone, Email, Relationship, IsPrimary)
                    VALUES ({ecId}, {playerId}, {contact.Name}, {contact.Phone}, {contact.Email}, {contact.Relationship}, {isPrimary})
                ", cancellationToken);
            }
        }

        if (dto.TeamIds is { Length: > 0 })
        {
            foreach (var teamId in dto.TeamIds.Distinct())
            {
                var ptId = Guid.NewGuid();
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO PlayerTeams (Id, PlayerId, TeamId, AssignedAt)
                    VALUES ({ptId}, {playerId}, {teamId}, {now})
                ", cancellationToken);
            }

            var ageGroupIds = await _db.Teams
                .Where(t => dto.TeamIds.Contains(t.Id))
                .Select(t => t.AgeGroupId)
                .Distinct()
                .ToListAsync(cancellationToken);

            foreach (var ageGroupId in ageGroupIds)
            {
                var pagId = Guid.NewGuid();
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO PlayerAgeGroups (Id, PlayerId, AgeGroupId)
                    VALUES ({pagId}, {playerId}, {ageGroupId})
                ", cancellationToken);
            }
        }

        var createdPlayer = await _mediator.Send(new GetPlayerByIdQuery(playerId, command.UserId), cancellationToken);
        if (createdPlayer == null)
        {
            throw new Exception("Failed to load created player.");
        }

        return createdPlayer;
    }
}
using MediatR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Players.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Queries;

/// <summary>
/// Handler for GetPlayerByIdQuery
/// </summary>
public class GetPlayerByIdHandler : IRequestHandler<GetPlayerByIdQuery, PlayerProfileDto>
{
    private readonly OurGameContext _db;

    public GetPlayerByIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<PlayerProfileDto> Handle(GetPlayerByIdQuery query, CancellationToken cancellationToken)
    {
        var player = await _db.Players
            .AsNoTracking()
            .Include(p => p.PlayerAgeGroups)
            .Include(p => p.PlayerTeams)
            .FirstOrDefaultAsync(p => p.Id == query.PlayerId);

        if (player == null)
        {
            throw new NotFoundException("Player", query.PlayerId);
        }

        // Parse JSON arrays
        List<string> preferredPositions = ParseJsonArray(player.PreferredPositions);
        List<string> allergies = ParseJsonArray(player.Allergies);
        List<string> medicalConditions = ParseJsonArray(player.MedicalConditions);

        return new PlayerProfileDto
        {
            Id = player.Id,
            ClubId = player.ClubId,
            FirstName = player.FirstName,
            LastName = player.LastName,
            Nickname = player.Nickname ?? string.Empty,
            DateOfBirth = player.DateOfBirth,
            Photo = player.Photo ?? string.Empty,
            AssociationId = player.AssociationId ?? string.Empty,
            PreferredPositions = preferredPositions,
            OverallRating = player.OverallRating,
            Allergies = allergies,
            MedicalConditions = medicalConditions,
            IsArchived = player.IsArchived,
            CreatedAt = player.CreatedAt,
            UpdatedAt = player.UpdatedAt,
            AgeGroupIds = player.PlayerAgeGroups.Select(pag => pag.AgeGroupId).ToList(),
            TeamIds = player.PlayerTeams.Select(pt => pt.TeamId).ToList()
        };
    }

    private List<string> ParseJsonArray(string? jsonArray)
    {
        if (string.IsNullOrEmpty(jsonArray))
            return new List<string>();

        try
        {
            return JsonConvert.DeserializeObject<List<string>>(jsonArray) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }
}

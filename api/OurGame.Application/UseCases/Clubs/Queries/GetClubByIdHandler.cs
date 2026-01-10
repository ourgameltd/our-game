using MediatR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Clubs.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Queries;

/// <summary>
/// Handler for GetClubByIdQuery
/// </summary>
public class GetClubByIdHandler : IRequestHandler<GetClubByIdQuery, ClubDetailDto>
{
    private readonly OurGameContext _db;

    public GetClubByIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<ClubDetailDto> Handle(GetClubByIdQuery query, CancellationToken cancellationToken)
    {
        var club = await _db.Clubs
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == query.ClubId);

        if (club == null)
        {
            throw new NotFoundException("Club", query.ClubId);
        }

        // Parse principles JSON array
        List<string> principles = new();
        if (!string.IsNullOrEmpty(club.Principles))
        {
            try
            {
                principles = JsonConvert.DeserializeObject<List<string>>(club.Principles) ?? new();
            }
            catch
            {
                // If parsing fails, treat as empty list
            }
        }

        // Get statistics
        var statistics = await GetClubStatistics(query.ClubId);

        return new ClubDetailDto
        {
            Id = club.Id,
            Name = club.Name,
            ShortName = club.ShortName,
            Logo = club.Logo,
            PrimaryColor = club.PrimaryColor,
            SecondaryColor = club.SecondaryColor,
            AccentColor = club.AccentColor,
            City = club.City,
            Country = club.Country,
            Venue = club.Venue,
            Address = club.Address,
            FoundedYear = club.FoundedYear,
            History = club.History ?? string.Empty,
            Ethos = club.Ethos ?? string.Empty,
            Principles = principles,
            CreatedAt = club.CreatedAt,
            UpdatedAt = club.UpdatedAt,
            Statistics = statistics
        };
    }

    private async Task<ClubStatisticsDto> GetClubStatistics(Guid clubId)
    {
        var totalPlayers = await _db.Players.CountAsync(p => p.ClubId == clubId && !p.IsArchived);
        var totalTeams = await _db.Teams.CountAsync(t => t.ClubId == clubId && !t.IsArchived);
        var totalAgeGroups = await _db.AgeGroups.CountAsync(ag => ag.ClubId == clubId);
        var totalCoaches = await _db.Coaches.CountAsync(c => c.ClubId == clubId && !c.IsArchived);

        // Get match statistics
        var matches = await _db.Matches
            .Where(m => m.Team.ClubId == clubId && m.Status == "completed")
            .Select(m => new
            {
                m.IsHome,
                m.HomeScore,
                m.AwayScore
            })
            .ToListAsync();

        int matchesPlayed = matches.Count;
        int matchesWon = 0;
        int matchesDrawn = 0;
        int matchesLost = 0;
        int goalsScored = 0;
        int goalsConceded = 0;

        foreach (var match in matches)
        {
            if (match.HomeScore.HasValue && match.AwayScore.HasValue)
            {
                if (match.IsHome)
                {
                    goalsScored += match.HomeScore.Value;
                    goalsConceded += match.AwayScore.Value;

                    if (match.HomeScore > match.AwayScore) matchesWon++;
                    else if (match.HomeScore == match.AwayScore) matchesDrawn++;
                    else matchesLost++;
                }
                else
                {
                    goalsScored += match.AwayScore.Value;
                    goalsConceded += match.HomeScore.Value;

                    if (match.AwayScore > match.HomeScore) matchesWon++;
                    else if (match.AwayScore == match.HomeScore) matchesDrawn++;
                    else matchesLost++;
                }
            }
        }

        return new ClubStatisticsDto
        {
            TotalPlayers = totalPlayers,
            TotalTeams = totalTeams,
            TotalAgeGroups = totalAgeGroups,
            TotalCoaches = totalCoaches,
            MatchesPlayed = matchesPlayed,
            MatchesWon = matchesWon,
            MatchesDrawn = matchesDrawn,
            MatchesLost = matchesLost,
            GoalsScored = goalsScored,
            GoalsConceded = goalsConceded
        };
    }
}

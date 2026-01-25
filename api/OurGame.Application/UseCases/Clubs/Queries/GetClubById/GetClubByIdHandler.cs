using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Clubs.Queries.GetClubById.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Queries.GetClubById;

/// <summary>
/// Query to get club details by ID
/// </summary>
public record GetClubByIdQuery(Guid ClubId) : IQuery<ClubDetailDto?>;

/// <summary>
/// Handler for GetClubByIdQuery
/// </summary>
public class GetClubByIdHandler : IRequestHandler<GetClubByIdQuery, ClubDetailDto?>
{
    private readonly OurGameContext _db;

    public GetClubByIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<ClubDetailDto?> Handle(GetClubByIdQuery query, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT 
                c.Id,
                c.Name,
                c.ShortName,
                c.Logo,
                c.PrimaryColor,
                c.SecondaryColor,
                c.AccentColor,
                c.City,
                c.Country,
                c.Venue,
                c.Address,
                c.FoundedYear,
                c.History,
                c.Ethos,
                c.Principles
            FROM Clubs c
            WHERE c.Id = {0}";

        var club = await _db.Database
            .SqlQueryRaw<ClubRawDto>(sql, query.ClubId)
            .FirstOrDefaultAsync(cancellationToken);

        if (club == null)
        {
            return null;
        }

        return new ClubDetailDto
        {
            Id = club.Id,
            Name = club.Name ?? string.Empty,
            ShortName = club.ShortName ?? string.Empty,
            Logo = club.Logo,
            Colors = new ClubColorsDto
            {
                Primary = club.PrimaryColor ?? "#000000",
                Secondary = club.SecondaryColor ?? "#FFFFFF",
                Accent = club.AccentColor ?? "#CCCCCC"
            },
            Location = new ClubLocationDto
            {
                City = club.City ?? string.Empty,
                Country = club.Country ?? string.Empty,
                Venue = club.Venue ?? string.Empty,
                Address = club.Address ?? string.Empty
            },
            Founded = club.FoundedYear,
            History = club.History,
            Ethos = club.Ethos,
            Principles = ParsePrinciples(club.Principles)
        };
    }

    /// <summary>
    /// Parse principles from JSON array string or delimited string
    /// </summary>
    private static List<string> ParsePrinciples(string? principles)
    {
        if (string.IsNullOrWhiteSpace(principles))
        {
            return new List<string>();
        }

        // Try to parse as JSON array first
        if (principles.TrimStart().StartsWith("["))
        {
            try
            {
                var parsed = JsonSerializer.Deserialize<List<string>>(principles);
                return parsed ?? new List<string>();
            }
            catch (JsonException)
            {
                // Fall through to delimiter parsing
            }
        }

        // Fall back to delimiter-based parsing
        return principles.Split(new[] { '\n', '|' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(p => p.Trim())
            .Where(p => !string.IsNullOrWhiteSpace(p))
            .ToList();
    }
}

/// <summary>
/// DTO for raw SQL query result
/// </summary>
public class ClubRawDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? ShortName { get; set; }
    public string? Logo { get; set; }
    public string? PrimaryColor { get; set; }
    public string? SecondaryColor { get; set; }
    public string? AccentColor { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? Venue { get; set; }
    public string? Address { get; set; }
    public int? FoundedYear { get; set; }
    public string? History { get; set; }
    public string? Ethos { get; set; }
    public string? Principles { get; set; }
}

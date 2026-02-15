namespace OurGame.Application.UseCases.Users.Queries.GetMyClubs.DTOs;

/// <summary>
/// Club list item for user's accessible clubs
/// </summary>
/// <param name="Id">Unique identifier of the club</param>
/// <param name="Name">Full name of the club</param>
/// <param name="ShortName">Abbreviated club name</param>
/// <param name="Logo">URL to club logo</param>
/// <param name="PrimaryColor">Club's primary color (hex)</param>
/// <param name="SecondaryColor">Club's secondary color (hex)</param>
/// <param name="AccentColor">Club's accent color (hex)</param>
/// <param name="City">City where the club is located</param>
/// <param name="Country">Country where the club is located</param>
/// <param name="TeamCount">Number of active teams in the club</param>
/// <param name="PlayerCount">Number of active players in the club</param>
public record MyClubListItemDto(
    Guid Id,
    string Name,
    string? ShortName,
    string? Logo,
    string? PrimaryColor,
    string? SecondaryColor,
    string? AccentColor,
    string? City,
    string? Country,
    int TeamCount,
    int PlayerCount
);

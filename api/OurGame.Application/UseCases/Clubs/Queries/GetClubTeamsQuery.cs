using MediatR;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Clubs.DTOs;

namespace OurGame.Application.UseCases.Clubs.Queries;

/// <summary>
/// Query to get all teams for a specific club
/// </summary>
public class GetClubTeamsQuery : IQuery<List<TeamListItemDto>>
{
    /// <summary>
    /// Unique identifier of the club
    /// </summary>
    public Guid ClubId { get; }

    /// <summary>
    /// Filter by age group (optional)
    /// </summary>
    public Guid? AgeGroupId { get; }

    /// <summary>
    /// Include archived teams in the results
    /// </summary>
    public bool IncludeArchived { get; }

    /// <summary>
    /// Filter by season (optional)
    /// </summary>
    public string? Season { get; }

    public GetClubTeamsQuery(Guid clubId, Guid? ageGroupId = null, bool includeArchived = false, string? season = null)
    {
        ClubId = clubId;
        AgeGroupId = ageGroupId;
        IncludeArchived = includeArchived;
        Season = season;
    }
}

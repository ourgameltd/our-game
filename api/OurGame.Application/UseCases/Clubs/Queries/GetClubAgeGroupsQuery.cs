using MediatR;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Clubs.DTOs;

namespace OurGame.Application.UseCases.Clubs.Queries;

/// <summary>
/// Query to get all age groups for a specific club
/// </summary>
public class GetClubAgeGroupsQuery : IQuery<List<AgeGroupListItemDto>>
{
    /// <summary>
    /// Unique identifier of the club
    /// </summary>
    public Guid ClubId { get; }

    /// <summary>
    /// Include archived age groups in the results
    /// </summary>
    public bool IncludeArchived { get; }

    /// <summary>
    /// Filter by season (optional)
    /// </summary>
    public string? Season { get; }

    public GetClubAgeGroupsQuery(Guid clubId, bool includeArchived = false, string? season = null)
    {
        ClubId = clubId;
        IncludeArchived = includeArchived;
        Season = season;
    }
}

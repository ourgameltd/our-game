using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Clubs.DTOs;

namespace OurGame.Application.UseCases.Clubs.Queries;

/// <summary>
/// Query to get all clubs
/// </summary>
public record GetAllClubsQuery : IQuery<List<ClubSummaryDto>>;

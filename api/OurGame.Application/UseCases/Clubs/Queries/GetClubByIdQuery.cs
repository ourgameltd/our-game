using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Clubs.DTOs;

namespace OurGame.Application.UseCases.Clubs.Queries;

/// <summary>
/// Query to get a club by ID with detailed information
/// </summary>
public record GetClubByIdQuery(Guid ClubId) : IQuery<ClubDetailDto>;

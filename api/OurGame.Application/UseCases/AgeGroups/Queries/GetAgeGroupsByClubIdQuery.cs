using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.AgeGroups.DTOs;

namespace OurGame.Application.UseCases.AgeGroups.Queries;

/// <summary>
/// Query to get all age groups for a club
/// </summary>
public record GetAgeGroupsByClubIdQuery(Guid ClubId) : IQuery<List<AgeGroupDto>>;

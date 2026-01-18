using MediatR;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.DTOs;

namespace OurGame.Application.UseCases.Clubs.Queries;

/// <summary>
/// Query to get all players for a club with filtering and pagination
/// </summary>
public record GetClubPlayersQuery(
    Guid ClubId,
    int Page = 1,
    int PageSize = 30,
    Guid? AgeGroupId = null,
    Guid? TeamId = null,
    string? Position = null,
    string? Search = null,
    bool IncludeArchived = false
) : IRequest<PagedResponse<PlayerListItemDto>>;

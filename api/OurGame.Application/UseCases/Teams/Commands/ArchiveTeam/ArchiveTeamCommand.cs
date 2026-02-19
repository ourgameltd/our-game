using MediatR;
using OurGame.Application.UseCases.Teams.Commands.ArchiveTeam.DTOs;

namespace OurGame.Application.UseCases.Teams.Commands.ArchiveTeam;

/// <summary>
/// Command to archive or unarchive a team.
/// </summary>
public record ArchiveTeamCommand(Guid TeamId, ArchiveTeamRequestDto Dto) : IRequest;

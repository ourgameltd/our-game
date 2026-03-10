using MediatR;
using OurGame.Application.UseCases.AgeGroups.Commands.ArchiveAgeGroup.DTOs;

namespace OurGame.Application.UseCases.AgeGroups.Commands.ArchiveAgeGroup;

/// <summary>
/// Command to archive or unarchive an age group.
/// </summary>
public record ArchiveAgeGroupCommand(Guid AgeGroupId, ArchiveAgeGroupRequestDto Dto) : IRequest;

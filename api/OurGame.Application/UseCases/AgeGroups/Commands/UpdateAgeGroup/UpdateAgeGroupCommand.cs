using MediatR;
using OurGame.Application.UseCases.AgeGroups.Commands.UpdateAgeGroup.DTOs;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupById.DTOs;

namespace OurGame.Application.UseCases.AgeGroups.Commands.UpdateAgeGroup;

/// <summary>
/// Command to update an existing age group.
/// </summary>
public record UpdateAgeGroupCommand(Guid AgeGroupId, UpdateAgeGroupRequestDto Dto) : IRequest<AgeGroupDetailDto>;

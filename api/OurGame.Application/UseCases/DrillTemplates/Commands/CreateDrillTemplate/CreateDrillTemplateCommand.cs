using MediatR;
using OurGame.Application.UseCases.DrillTemplates.Commands.CreateDrillTemplate.DTOs;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplatesByScope.DTOs;

namespace OurGame.Application.UseCases.DrillTemplates.Commands.CreateDrillTemplate;

/// <summary>
/// Command to create a new drill template with scope assignment
/// </summary>
public record CreateDrillTemplateCommand(CreateDrillTemplateRequestDto Dto, string UserId) : IRequest<DrillTemplateListDto>;

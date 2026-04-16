using MediatR;
using OurGame.Application.UseCases.DrillTemplates.Commands.ArchiveDrillTemplate.DTOs;

namespace OurGame.Application.UseCases.DrillTemplates.Commands.ArchiveDrillTemplate;

/// <summary>
/// Command for archiving or unarchiving a drill template.
/// </summary>
public record ArchiveDrillTemplateCommand(Guid TemplateId, string UserId, ArchiveDrillTemplateRequestDto Dto) : IRequest;

using MediatR;
using OurGame.Application.UseCases.Drills.Commands.ArchiveDrill.DTOs;

namespace OurGame.Application.UseCases.Drills.Commands.ArchiveDrill;

/// <summary>
/// Command for archiving or unarchiving a drill.
/// </summary>
public record ArchiveDrillCommand(Guid DrillId, string UserId, ArchiveDrillRequestDto Dto) : IRequest;

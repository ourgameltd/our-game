using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.DrillTemplates.Commands.ArchiveDrillTemplate;

/// <summary>
/// Handler for archiving or unarchiving a drill template.
/// Only the creating coach can archive/unarchive the template.
/// </summary>
public class ArchiveDrillTemplateHandler : IRequestHandler<ArchiveDrillTemplateCommand>
{
    private readonly OurGameContext _db;

    public ArchiveDrillTemplateHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task Handle(ArchiveDrillTemplateCommand command, CancellationToken cancellationToken)
    {
        var templateId = command.TemplateId;

        var templateCheck = await _db.Database
            .SqlQueryRaw<ArchiveDrillTemplateCheckRaw>(@"
                SELECT Id, CreatedBy
                FROM DrillTemplates
                WHERE Id = {0}
            ", templateId)
            .FirstOrDefaultAsync(cancellationToken);

        if (templateCheck == null)
        {
            throw new NotFoundException("DrillTemplate", templateId.ToString());
        }

        var currentCoachId = await _db.Database
            .SqlQueryRaw<Guid>(@"
                SELECT c.Id AS Value
                FROM Coaches c
                INNER JOIN Users u ON c.UserId = u.Id
                WHERE u.AuthId = {0}
            ", command.UserId)
            .FirstOrDefaultAsync(cancellationToken);

        if (currentCoachId == Guid.Empty)
        {
            throw new NotFoundException("Coach", "Current user is not a coach");
        }

        if (templateCheck.CreatedBy != currentCoachId)
        {
            throw new UnauthorizedAccessException("Only the creating coach can archive this drill template");
        }

        var rowsAffected = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE DrillTemplates
            SET IsArchived = {command.Dto.IsArchived}
            WHERE Id = {templateId}
        ", cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException("DrillTemplate", templateId.ToString());
        }
    }
}

internal class ArchiveDrillTemplateCheckRaw
{
    public Guid Id { get; set; }
    public Guid? CreatedBy { get; set; }
}

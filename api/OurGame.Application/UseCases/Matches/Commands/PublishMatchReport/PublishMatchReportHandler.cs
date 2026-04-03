using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Matches.Commands.PublishMatchReport.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Matches.Commands.PublishMatchReport;

public record PublishMatchReportCommand(Guid MatchId, PublishMatchReportRequestDto Dto) : IRequest;

public class PublishMatchReportHandler : IRequestHandler<PublishMatchReportCommand>
{
    private readonly OurGameContext _db;

    public PublishMatchReportHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task Handle(PublishMatchReportCommand command, CancellationToken cancellationToken)
    {
        var matchExists = await _db.Matches.AnyAsync(m => m.Id == command.MatchId, cancellationToken);
        if (!matchExists)
        {
            throw new NotFoundException("Match", command.MatchId.ToString());
        }

        var rows = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE MatchReports
            SET IsPublished = {command.Dto.IsPublished}
            WHERE MatchId = {command.MatchId}
        ", cancellationToken);

        if (rows == 0)
        {
            throw new NotFoundException("MatchReport", command.MatchId.ToString());
        }
    }
}

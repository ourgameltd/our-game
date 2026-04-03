namespace OurGame.Application.UseCases.Matches.Commands.PublishMatchReport.DTOs;

public record PublishMatchReportRequestDto
{
    public bool IsPublished { get; init; }
}

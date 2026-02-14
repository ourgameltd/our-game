using MediatR;
using OurGame.Application.UseCases.Reports.Commands.UpdateReport.DTOs;
using OurGame.Application.UseCases.Reports.Queries.GetReportById.DTOs;

namespace OurGame.Application.UseCases.Reports.Commands.UpdateReport;

/// <summary>
/// Command to update an existing report card
/// </summary>
public record UpdateReportCommand(Guid ReportId, UpdateReportRequestDto Dto, string AzureUserId) : IRequest<ReportDto?>;

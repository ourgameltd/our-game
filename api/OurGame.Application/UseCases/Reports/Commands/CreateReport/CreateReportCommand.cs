using MediatR;
using OurGame.Application.UseCases.Reports.Commands.CreateReport.DTOs;
using OurGame.Application.UseCases.Reports.Queries.GetReportById.DTOs;

namespace OurGame.Application.UseCases.Reports.Commands.CreateReport;

/// <summary>
/// Command to create a new report card
/// </summary>
public record CreateReportCommand(CreateReportRequestDto Dto, string AzureUserId) : IRequest<ReportDto>;

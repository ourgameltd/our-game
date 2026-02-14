using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.UseCases.Reports.Commands.CreateReport.DTOs;
using OurGame.Application.UseCases.Reports.Queries.GetReportById;
using OurGame.Application.UseCases.Reports.Queries.GetReportById.DTOs;
using OurGame.Persistence.Models;
using System.Text.Json;

namespace OurGame.Application.UseCases.Reports.Commands.CreateReport;

/// <summary>
/// Handler for creating a new player report card.
/// Inserts the report, development actions, and similar professionals.
/// </summary>
public class CreateReportHandler : IRequestHandler<CreateReportCommand, ReportDto>
{
    private readonly OurGameContext _db;
    private readonly IMediator _mediator;

    public CreateReportHandler(OurGameContext db, IMediator mediator)
    {
        _db = db;
        _mediator = mediator;
    }

    public async Task<ReportDto> Handle(CreateReportCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var reportId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        // 1. Get the coach ID from Azure User ID
        var coachId = await GetCoachIdFromAzureUserId(command.AzureUserId, cancellationToken);

        // 2. Serialize arrays to JSON
        var strengthsJson = JsonSerializer.Serialize(dto.Strengths);
        var improvementsJson = JsonSerializer.Serialize(dto.AreasForImprovement);

        // 3. Insert the report card
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO PlayerReports (
                Id, PlayerId, PeriodStart, PeriodEnd, OverallRating,
                Strengths, AreasForImprovement, CoachComments,
                CreatedBy, CreatedAt
            )
            VALUES (
                {reportId}, {dto.PlayerId}, {dto.PeriodStart}, {dto.PeriodEnd}, {dto.OverallRating},
                {strengthsJson}, {improvementsJson}, {dto.CoachComments},
                {coachId}, {now}
            )
        ", cancellationToken);

        // 4. Insert development actions
        foreach (var action in dto.DevelopmentActions)
        {
            var actionId = Guid.NewGuid();
            var actionsJson = JsonSerializer.Serialize(action.Actions);

            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO ReportDevelopmentActions (
                    Id, ReportId, Goal, Actions, StartDate, TargetDate, 
                    Completed, CompletedDate
                )
                VALUES (
                    {actionId}, {reportId}, {action.Goal}, {actionsJson}, 
                    {action.StartDate}, {action.TargetDate}, {action.Completed}, {action.CompletedDate}
                )
            ", cancellationToken);
        }

        // 5. Insert similar professionals
        foreach (var professional in dto.SimilarProfessionals)
        {
            var professionalId = Guid.NewGuid();

            await _db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO SimilarProfessionals (
                    Id, ReportId, Name, Team, Position, Reason
                )
                VALUES (
                    {professionalId}, {reportId}, {professional.Name}, 
                    {professional.Team}, {professional.Position}, {professional.Reason}
                )
            ", cancellationToken);
        }

        // 6. Query back the created report
        var createdReport = await _mediator.Send(new GetReportByIdQuery(reportId), cancellationToken);

        if (createdReport == null)
        {
            throw new Exception("Failed to retrieve created report.");
        }

        return createdReport;
    }

    private async Task<Guid?> GetCoachIdFromAzureUserId(string azureUserId, CancellationToken cancellationToken)
    {
        var sql = "SELECT Id FROM Coaches WHERE AzureUserId = {0}";
        var coach = await _db.Database
            .SqlQueryRaw<CoachIdResult>(sql, azureUserId)
            .FirstOrDefaultAsync(cancellationToken);

        return coach?.Id;
    }
}

/// <summary>
/// Raw SQL result for coach ID lookup
/// </summary>
internal class CoachIdResult
{
    public Guid Id { get; set; }
}

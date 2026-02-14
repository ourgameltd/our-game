using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.UseCases.Reports.Commands.UpdateReport.DTOs;
using OurGame.Application.UseCases.Reports.Queries.GetReportById;
using OurGame.Application.UseCases.Reports.Queries.GetReportById.DTOs;
using OurGame.Persistence.Models;
using System.Text.Json;

namespace OurGame.Application.UseCases.Reports.Commands.UpdateReport;

/// <summary>
/// Handler for updating an existing player report card.
/// Updates the report, and replaces all development actions and similar professionals.
/// </summary>
public class UpdateReportHandler : IRequestHandler<UpdateReportCommand, ReportDto?>
{
    private readonly OurGameContext _db;
    private readonly IMediator _mediator;

    public UpdateReportHandler(OurGameContext db, IMediator mediator)
    {
        _db = db;
        _mediator = mediator;
    }

    public async Task<ReportDto?> Handle(UpdateReportCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;
        var reportId = command.ReportId;

        // 1. Verify the report exists
        var existsSql = "SELECT Id FROM PlayerReports WHERE Id = {0}";
        var exists = await _db.Database
            .SqlQueryRaw<ReportExistsResult>(existsSql, reportId)
            .FirstOrDefaultAsync(cancellationToken);

        if (exists == null)
        {
            return null;
        }

        // 2. Serialize arrays to JSON
        var strengthsJson = JsonSerializer.Serialize(dto.Strengths);
        var improvementsJson = JsonSerializer.Serialize(dto.AreasForImprovement);

        // 3. Update the report card
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE PlayerReports
            SET
                PeriodStart = {dto.PeriodStart},
                PeriodEnd = {dto.PeriodEnd},
                OverallRating = {dto.OverallRating},
                Strengths = {strengthsJson},
                AreasForImprovement = {improvementsJson},
                CoachComments = {dto.CoachComments}
            WHERE Id = {reportId}
        ", cancellationToken);

        // 4. Delete existing development actions and insert new ones
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM ReportDevelopmentActions WHERE ReportId = {reportId}
        ", cancellationToken);

        foreach (var action in dto.DevelopmentActions)
        {
            var actionId = action.Id ?? Guid.NewGuid();
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

        // 5. Delete existing similar professionals and insert new ones
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM SimilarProfessionals WHERE ReportId = {reportId}
        ", cancellationToken);

        foreach (var professional in dto.SimilarProfessionals)
        {
            var professionalId = professional.Id ?? Guid.NewGuid();

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

        // 6. Query back the updated report
        var updatedReport = await _mediator.Send(new GetReportByIdQuery(reportId), cancellationToken);

        return updatedReport;
    }
}

/// <summary>
/// Raw SQL result for checking report existence
/// </summary>
internal class ReportExistsResult
{
    public Guid Id { get; set; }
}

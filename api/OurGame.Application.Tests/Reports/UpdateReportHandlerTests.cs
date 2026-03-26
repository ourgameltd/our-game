using Microsoft.EntityFrameworkCore;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Reports.Commands.UpdateReport;
using OurGame.Application.UseCases.Reports.Commands.UpdateReport.DTOs;
using OurGame.Application.UseCases.Reports.Queries.GetReportById;
using OurGame.Application.UseCases.Reports.Queries.GetReportById.DTOs;

namespace OurGame.Application.Tests.Reports;

public class UpdateReportHandlerTests
{
    [Fact]
    public async Task Handle_WhenReportNotFound_ReturnsNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();

        var mediator = new TestMediator();
        mediator.Register<GetReportByIdQuery, ReportDto?>(
            (q, ct) => new GetReportByIdHandler(db.Context).Handle(q, ct));

        var handler = new UpdateReportHandler(db.Context, mediator);
        var dto = new UpdateReportRequestDto
        {
            OverallRating = 80,
            CoachComments = "Updated"
        };

        var result = await handler.Handle(
            new UpdateReportCommand(Guid.NewGuid(), dto, "some-auth"), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenValid_UpdatesAndReturnsDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId, "Marcus", "Rashford");
        var (coachId, _) = await db.SeedCoachAsync(clubId, "coach-auth-update", "Erik", "Ten Hag");
        var reportId = await db.SeedPlayerReportAsync(playerId, coachId);

        var mediator = new TestMediator();
        mediator.Register<GetReportByIdQuery, ReportDto?>(
            (q, ct) => new GetReportByIdHandler(db.Context).Handle(q, ct));

        var handler = new UpdateReportHandler(db.Context, mediator);
        var dto = new UpdateReportRequestDto
        {
            PeriodStart = new DateOnly(2025, 3, 1),
            PeriodEnd = new DateOnly(2025, 9, 1),
            OverallRating = 85,
            Strengths = ["Leadership", "Tackling"],
            AreasForImprovement = ["Crossing"],
            CoachComments = "Excellent improvement"
        };

        var result = await handler.Handle(
            new UpdateReportCommand(reportId, dto, "coach-auth-update"), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(reportId, result.Id);
        Assert.Equal(playerId, result.PlayerId);
        Assert.Equal("Marcus Rashford", result.PlayerName);
        Assert.Equal(new DateOnly(2025, 3, 1), result.PeriodStart);
        Assert.Equal(new DateOnly(2025, 9, 1), result.PeriodEnd);
        Assert.Equal(85m, result.OverallRating);
        Assert.Contains("Leadership", result.Strengths);
        Assert.Contains("Tackling", result.Strengths);
        Assert.Contains("Crossing", result.AreasForImprovement);
        Assert.Equal("Excellent improvement", result.CoachComments);
        Assert.Equal(coachId, result.CreatedBy);
        Assert.Equal("Erik Ten Hag", result.CreatedByName);
    }

    [Fact]
    public async Task Handle_ReplacesDevelopmentActionsAndSimilarProfessionals()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var (coachId, _) = await db.SeedCoachAsync(clubId, "coach-auth-replace");
        var reportId = await db.SeedPlayerReportAsync(playerId, coachId);

        // Seed existing development action and similar professional
        var oldActionId = Guid.NewGuid();
        await db.Context.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO ReportDevelopmentActions (Id, ReportId, Goal, Actions, StartDate, TargetDate, Completed, CompletedDate)
            VALUES ({oldActionId}, {reportId}, {"Old goal"}, {"[\"Old action\"]"}, {"2025-01-01"}, {"2025-03-01"}, {false}, {(string?)null})");

        var oldProfessionalId = Guid.NewGuid();
        await db.Context.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO SimilarProfessionals (Id, ReportId, Name, Team, Position, Reason)
            VALUES ({oldProfessionalId}, {reportId}, {"Old Player"}, {"Old Team"}, {"ST"}, {"Old reason"})");

        var mediator = new TestMediator();
        mediator.Register<GetReportByIdQuery, ReportDto?>(
            (q, ct) => new GetReportByIdHandler(db.Context).Handle(q, ct));

        var handler = new UpdateReportHandler(db.Context, mediator);
        var dto = new UpdateReportRequestDto
        {
            OverallRating = 80,
            Strengths = ["Pace"],
            AreasForImprovement = ["Heading"],
            CoachComments = "Updated report",
            DevelopmentActions =
            [
                new DevelopmentActionUpdateDto
                {
                    Goal = "New goal",
                    Actions = ["New action one", "New action two"],
                    StartDate = new DateOnly(2025, 4, 1),
                    TargetDate = new DateOnly(2025, 9, 1),
                    Completed = false
                }
            ],
            SimilarProfessionals =
            [
                new SimilarProfessionalUpdateDto
                {
                    Name = "Erling Haaland",
                    Team = "Man City",
                    Position = "ST",
                    Reason = "Clinical finishing"
                }
            ]
        };

        var result = await handler.Handle(
            new UpdateReportCommand(reportId, dto, "coach-auth-replace"), CancellationToken.None);

        Assert.NotNull(result);

        // Verify old actions/professionals were replaced
        Assert.Single(result.DevelopmentActions);
        var action = result.DevelopmentActions[0];
        Assert.NotEqual(oldActionId, action.Id);
        Assert.Equal("New goal", action.Goal);
        Assert.Equal(2, action.Actions.Length);
        Assert.Contains("New action one", action.Actions);
        Assert.Contains("New action two", action.Actions);

        Assert.Single(result.SimilarProfessionals);
        var professional = result.SimilarProfessionals[0];
        Assert.NotEqual(oldProfessionalId, professional.Id);
        Assert.Equal("Erling Haaland", professional.Name);
        Assert.Equal("Man City", professional.Team);
        Assert.Equal("ST", professional.Position);
        Assert.Equal("Clinical finishing", professional.Reason);
    }
}

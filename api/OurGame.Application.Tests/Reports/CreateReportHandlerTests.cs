using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Reports.Commands.CreateReport;
using OurGame.Application.UseCases.Reports.Commands.CreateReport.DTOs;
using OurGame.Application.UseCases.Reports.Queries.GetReportById;
using OurGame.Application.UseCases.Reports.Queries.GetReportById.DTOs;

namespace OurGame.Application.Tests.Reports;

public class CreateReportHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserNotCoach_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await db.SeedUserAsync("non-coach-auth");

        var mediator = new TestMediator();
        mediator.Register<GetReportByIdQuery, ReportDto?>(
            (q, ct) => new GetReportByIdHandler(db.Context).Handle(q, ct));

        var handler = new CreateReportHandler(db.Context, mediator);
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);

        var dto = new CreateReportRequestDto
        {
            PlayerId = playerId,
            PeriodStart = new DateOnly(2025, 1, 1),
            PeriodEnd = new DateOnly(2025, 6, 1),
            OverallRating = 70,
            Strengths = ["Passing"],
            AreasForImprovement = ["Shooting"],
            CoachComments = "Needs work"
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateReportCommand(dto, "non-coach-auth"), CancellationToken.None));
        Assert.Contains("azureUserId", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenValid_CreatesReportAndReturnsDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId, "Marcus", "Rashford");
        var (coachId, _) = await db.SeedCoachAsync(clubId, "coach-auth-create", "Erik", "Ten Hag");

        var mediator = new TestMediator();
        mediator.Register<GetReportByIdQuery, ReportDto?>(
            (q, ct) => new GetReportByIdHandler(db.Context).Handle(q, ct));

        var handler = new CreateReportHandler(db.Context, mediator);

        var dto = new CreateReportRequestDto
        {
            PlayerId = playerId,
            PeriodStart = new DateOnly(2025, 1, 1),
            PeriodEnd = new DateOnly(2025, 6, 1),
            OverallRating = 80,
            Strengths = ["Pace", "Dribbling"],
            AreasForImprovement = ["Finishing"],
            CoachComments = "Strong half-season"
        };

        var result = await handler.Handle(new CreateReportCommand(dto, "coach-auth-create"), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(playerId, result.PlayerId);
        Assert.Equal("Marcus Rashford", result.PlayerName);
        Assert.Equal(new DateOnly(2025, 1, 1), result.PeriodStart);
        Assert.Equal(new DateOnly(2025, 6, 1), result.PeriodEnd);
        Assert.Equal(80m, result.OverallRating);
        Assert.Contains("Pace", result.Strengths);
        Assert.Contains("Dribbling", result.Strengths);
        Assert.Contains("Finishing", result.AreasForImprovement);
        Assert.Equal("Strong half-season", result.CoachComments);
        Assert.Equal(coachId, result.CreatedBy);
        Assert.Equal("Erik Ten Hag", result.CreatedByName);
    }

    [Fact]
    public async Task Handle_CreatesWithDevelopmentActionsAndSimilarProfessionals()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var (coachId, _) = await db.SeedCoachAsync(clubId, "coach-auth-full");

        var mediator = new TestMediator();
        mediator.Register<GetReportByIdQuery, ReportDto?>(
            (q, ct) => new GetReportByIdHandler(db.Context).Handle(q, ct));

        var handler = new CreateReportHandler(db.Context, mediator);

        var dto = new CreateReportRequestDto
        {
            PlayerId = playerId,
            PeriodStart = new DateOnly(2025, 1, 1),
            PeriodEnd = new DateOnly(2025, 6, 1),
            OverallRating = 75,
            Strengths = ["Vision"],
            AreasForImprovement = ["Defending"],
            CoachComments = "Good season",
            DevelopmentActions =
            [
                new DevelopmentActionRequestDto
                {
                    Goal = "Improve shooting",
                    Actions = ["Practice daily", "Watch tutorials"],
                    StartDate = new DateOnly(2025, 1, 1),
                    TargetDate = new DateOnly(2025, 6, 1),
                    Completed = false
                }
            ],
            SimilarProfessionals =
            [
                new SimilarProfessionalRequestDto
                {
                    Name = "Kevin De Bruyne",
                    Team = "Man City",
                    Position = "CAM",
                    Reason = "Similar vision and passing range"
                }
            ]
        };

        var result = await handler.Handle(new CreateReportCommand(dto, "coach-auth-full"), CancellationToken.None);

        Assert.NotNull(result);

        // Verify development actions
        Assert.Single(result.DevelopmentActions);
        var action = result.DevelopmentActions[0];
        Assert.Equal("Improve shooting", action.Goal);
        Assert.Equal(2, action.Actions.Length);
        Assert.Contains("Practice daily", action.Actions);
        Assert.False(action.Completed);

        // Verify similar professionals
        Assert.Single(result.SimilarProfessionals);
        var professional = result.SimilarProfessionals[0];
        Assert.Equal("Kevin De Bruyne", professional.Name);
        Assert.Equal("Man City", professional.Team);
        Assert.Equal("CAM", professional.Position);
        Assert.Equal("Similar vision and passing range", professional.Reason);
    }
}

using Microsoft.EntityFrameworkCore;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Reports.Queries.GetReportById;

namespace OurGame.Application.Tests.Reports;

public class GetReportByIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenReportNotFound_ReturnsNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetReportByIdHandler(db.Context);

        var result = await handler.Handle(new GetReportByIdQuery(Guid.NewGuid()), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenFound_ReturnsReportWithPlayerAndCoachNames()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId, "Marcus", "Rashford");
        var (coachId, _) = await db.SeedCoachAsync(clubId, "coach-auth-1", "Erik", "Ten Hag");
        var reportId = await db.SeedPlayerReportAsync(playerId, coachId);

        var handler = new GetReportByIdHandler(db.Context);
        var result = await handler.Handle(new GetReportByIdQuery(reportId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(reportId, result.Id);
        Assert.Equal(playerId, result.PlayerId);
        Assert.Equal("Marcus Rashford", result.PlayerName);
        Assert.Equal(coachId, result.CreatedBy);
        Assert.Equal("Erik Ten Hag", result.CreatedByName);
        Assert.Equal(75m, result.OverallRating);
        Assert.Contains("Passing", result.Strengths);
        Assert.Contains("Vision", result.Strengths);
        Assert.Contains("Finishing", result.AreasForImprovement);
        Assert.Equal("Good progress this term", result.CoachComments);
    }

    [Fact]
    public async Task Handle_MapsDevelopmentActionsAndSimilarProfessionals()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var (coachId, _) = await db.SeedCoachAsync(clubId, "coach-auth-2");
        var reportId = await db.SeedPlayerReportAsync(playerId, coachId);

        // Insert development action via raw SQL
        var actionId = Guid.NewGuid();
        await db.Context.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO ReportDevelopmentActions (Id, ReportId, Goal, Actions, StartDate, TargetDate, Completed, CompletedDate)
            VALUES ({actionId}, {reportId}, {"Improve shooting"}, {"[\"Practice daily\",\"Watch tutorials\"]"}, {"2025-01-01"}, {"2025-06-01"}, {false}, {(string?)null})");

        // Insert similar professional via raw SQL
        var professionalId = Guid.NewGuid();
        await db.Context.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO SimilarProfessionals (Id, ReportId, Name, Team, Position, Reason)
            VALUES ({professionalId}, {reportId}, {"Marcus Rashford"}, {"Man United"}, {"LW"}, {"Similar pace and dribbling"})");

        var handler = new GetReportByIdHandler(db.Context);
        var result = await handler.Handle(new GetReportByIdQuery(reportId), CancellationToken.None);

        Assert.NotNull(result);

        // Verify development actions
        Assert.Single(result.DevelopmentActions);
        var action = result.DevelopmentActions[0];
        Assert.Equal(actionId, action.Id);
        Assert.Equal("Improve shooting", action.Goal);
        Assert.Equal(2, action.Actions.Length);
        Assert.Contains("Practice daily", action.Actions);
        Assert.Contains("Watch tutorials", action.Actions);
        Assert.False(action.Completed);

        // Verify similar professionals
        Assert.Single(result.SimilarProfessionals);
        var professional = result.SimilarProfessionals[0];
        Assert.Equal(professionalId, professional.Id);
        Assert.Equal("Marcus Rashford", professional.Name);
        Assert.Equal("Man United", professional.Team);
        Assert.Equal("LW", professional.Position);
        Assert.Equal("Similar pace and dribbling", professional.Reason);
    }
}

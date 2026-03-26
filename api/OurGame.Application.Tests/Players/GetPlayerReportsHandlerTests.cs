using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Players.Queries.GetPlayerReports;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Players;

public class GetPlayerReportsHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoReports_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var handler = new GetPlayerReportsHandler(db.Context);

        var result = await handler.Handle(new GetPlayerReportsQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Empty(result!);
    }

    [Fact]
    public async Task Handle_ReturnsMappedReportSummaries()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId, "Alex", "Vale");
        var (coachId, _) = await db.SeedCoachAsync(clubId, firstName: "John", lastName: "Coach");
        var reportId = await db.SeedPlayerReportAsync(playerId, coachId);
        var handler = new GetPlayerReportsHandler(db.Context);

        var result = await handler.Handle(new GetPlayerReportsQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result!);
        var report = result[0];
        Assert.Equal(reportId, report.Id);
        Assert.Equal(playerId, report.PlayerId);
        Assert.Equal("Alex", report.FirstName);
        Assert.Equal("Vale", report.LastName);
        Assert.Equal(75, report.OverallRating);
        Assert.Equal("John", report.CoachFirstName);
        Assert.Equal("Coach", report.CoachLastName);
    }

    [Fact]
    public async Task Handle_CountsJsonArrayItemsForStrengths()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        // Default seed has Strengths = "[\"Passing\",\"Vision\"]" and AreasForImprovement = "[\"Finishing\"]"
        await db.SeedPlayerReportAsync(playerId);
        var handler = new GetPlayerReportsHandler(db.Context);

        var result = await handler.Handle(new GetPlayerReportsQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result!);
        Assert.Equal(2, result[0].StrengthsCount);
        Assert.Equal(1, result[0].AreasForImprovementCount);
    }

    [Fact]
    public async Task Handle_CountsDevelopmentActions()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var reportId = await db.SeedPlayerReportAsync(playerId);

        // Add development actions
        db.Context.ReportDevelopmentActions.AddRange(
            new ReportDevelopmentAction { Id = Guid.NewGuid(), ReportId = reportId, Goal = "Improve finishing", Actions = "[]" },
            new ReportDevelopmentAction { Id = Guid.NewGuid(), ReportId = reportId, Goal = "Better positioning", Actions = "[]" }
        );
        await db.Context.SaveChangesAsync();

        var handler = new GetPlayerReportsHandler(db.Context);
        var result = await handler.Handle(new GetPlayerReportsQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result!);
        Assert.Equal(2, result[0].DevelopmentActionsCount);
    }

    [Fact]
    public async Task Handle_ParsesPreferredPositions()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId, preferredPositions: "[\"CB\",\"RB\"]");
        await db.SeedPlayerReportAsync(playerId);
        var handler = new GetPlayerReportsHandler(db.Context);

        var result = await handler.Handle(new GetPlayerReportsQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(2, result![0].PreferredPositions.Length);
        Assert.Contains("CB", result[0].PreferredPositions);
    }
}

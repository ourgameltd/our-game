using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Queries.GetReportCardsByTeamId;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Teams;

public class GetReportCardsByTeamIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoReportCards_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();

        var handler = new GetReportCardsByTeamIdHandler(db.Context);
        var result = await handler.Handle(new GetReportCardsByTeamIdQuery(teamId), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsReportCardsForTeam()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        db.Context.PlayerTeams.Add(new PlayerTeam
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            TeamId = teamId
        });

        var reportId = Guid.NewGuid();
        db.Context.PlayerReports.Add(new PlayerReport
        {
            Id = reportId,
            PlayerId = playerId,
            OverallRating = 7.0m,
            Strengths = "[\"dribbling\"]",
            AreasForImprovement = "[\"heading\"]",
            CoachComments = "Keep improving",
            CreatedBy = coachId,
            CreatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetReportCardsByTeamIdHandler(db.Context);
        var result = await handler.Handle(new GetReportCardsByTeamIdQuery(teamId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(reportId, result[0].Id);
        Assert.Equal(7.0m, result[0].OverallRating);
    }
}

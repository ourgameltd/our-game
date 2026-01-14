using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class PerformanceRatingSeedData
{
    public static List<PerformanceRating> GetPerformanceRatings()
    {
        return new List<PerformanceRating>
        {
            // Match 3 ratings
            new PerformanceRating
            {
                Id = Guid.NewGuid(),
                MatchReportId = MatchReportSeedData.Match3_Report_Id,
                PlayerId = PlayerSeedData.OliverThompson_Id,
                Rating = 8.5m
            },
            new PerformanceRating
            {
                Id = Guid.NewGuid(),
                MatchReportId = MatchReportSeedData.Match3_Report_Id,
                PlayerId = PlayerSeedData.JamesWilson_Id,
                Rating = 8.0m
            },
            new PerformanceRating
            {
                Id = Guid.NewGuid(),
                MatchReportId = MatchReportSeedData.Match3_Report_Id,
                PlayerId = PlayerSeedData.GeorgeHarris_Id,
                Rating = 8.5m
            },
            new PerformanceRating
            {
                Id = Guid.NewGuid(),
                MatchReportId = MatchReportSeedData.Match3_Report_Id,
                PlayerId = PlayerSeedData.EthanDavies_Id,
                Rating = 7.5m
            },
            new PerformanceRating
            {
                Id = Guid.NewGuid(),
                MatchReportId = MatchReportSeedData.Match3_Report_Id,
                PlayerId = PlayerSeedData.NoahAnderson_Id,
                Rating = 9.5m
            }
        };
    }
}

using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class ReportDevelopmentActionSeedData
{
    public static List<ReportDevelopmentAction> GetReportDevelopmentActions()
    {
        return new List<ReportDevelopmentAction>
        {
            // Development actions for player reports
            new ReportDevelopmentAction
            {
                Id = Guid.NewGuid(),
                ReportId = PlayerReportSeedData.Report1_Id,
                Goal = "Improve distribution accuracy to 75%",
                Actions = "Practice throwing drills; Work on kicking technique; Study distribution patterns",
                StartDate = new DateOnly(2024, 12, 1),
                TargetDate = new DateOnly(2025, 2, 28),
                Completed = false
            },
            new ReportDevelopmentAction
            {
                Id = Guid.NewGuid(),
                ReportId = PlayerReportSeedData.Report1_Id,
                Goal = "Increase confidence in one-on-one situations",
                Actions = "Practice shot-stopping drills; Study professional goalkeeper positioning; Match analysis",
                StartDate = new DateOnly(2024, 12, 1),
                TargetDate = new DateOnly(2025, 2, 28),
                Completed = false
            },
            new ReportDevelopmentAction
            {
                Id = Guid.NewGuid(),
                ReportId = PlayerReportSeedData.Report2_Id,
                Goal = "Improve passing range and accuracy",
                Actions = "Extra passing sessions; Watch professional defenders; Practice long and short distribution",
                StartDate = new DateOnly(2024, 12, 1),
                TargetDate = new DateOnly(2025, 2, 28),
                Completed = false
            },
            new ReportDevelopmentAction
            {
                Id = Guid.NewGuid(),
                ReportId = PlayerReportSeedData.Report3_Id,
                Goal = "Develop consistency in finishing",
                Actions = "Shooting practice twice weekly; Study striker movement patterns; Work on composure in box",
                StartDate = new DateOnly(2024, 12, 1),
                TargetDate = new DateOnly(2025, 1, 31),
                Completed = false
            }
        };
    }
}

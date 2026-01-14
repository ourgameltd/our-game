using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class DevelopmentPlanSeedData
{
    public static readonly Guid Plan1_Id = Guid.Parse("d0000001-0000-0000-0000-000000000001");
    public static readonly Guid Plan2_Id = Guid.Parse("d0000002-0000-0000-0000-000000000002");
    public static readonly Guid Plan3_Id = Guid.Parse("d0000003-0000-0000-0000-000000000003");

    public static List<DevelopmentPlan> GetDevelopmentPlans()
    {
        var now = DateTime.UtcNow;
        
        return new List<DevelopmentPlan>
        {
            new DevelopmentPlan
            {
                Id = Plan1_Id,
                PlayerId = PlayerSeedData.CarlosRodriguez_Id,
                CreatedBy = CoachSeedData.MichaelRobertson_Id,
                Title = "Complete Forward Development - Q1 2025",
                Description = "Focus on developing Carlos into a more complete forward by improving aerial ability, defensive contribution, and physical conditioning.",
                PeriodStart = new DateOnly(2024, 12, 1),
                PeriodEnd = new DateOnly(2025, 2, 28),
                Status = PlanStatus.Active,
                CoachNotes = "Carlos is responding well to the development plan. His weak foot finishing has improved dramatically. Need to maintain focus on aerial work and pressing.",
                CreatedAt = now,
                UpdatedAt = now
            },
            new DevelopmentPlan
            {
                Id = Plan2_Id,
                PlayerId = PlayerSeedData.CarlosRodriguez_Id,
                CreatedBy = CoachSeedData.MichaelRobertson_Id,
                Title = "Pre-Season Development - Autumn 2024",
                Description = "Initial development plan focusing on first-touch control and movement off the ball.",
                PeriodStart = new DateOnly(2024, 9, 1),
                PeriodEnd = new DateOnly(2024, 11, 30),
                Status = PlanStatus.Completed,
                CoachNotes = "Excellent progress throughout the term. Carlos has transformed his first-touch and movement. Ready to progress to more advanced areas.",
                CreatedAt = now,
                UpdatedAt = now
            },
            new DevelopmentPlan
            {
                Id = Plan3_Id,
                PlayerId = PlayerSeedData.JamesWilson_Id,
                CreatedBy = CoachSeedData.MichaelRobertson_Id,
                Title = "Advanced Defensive Skills - Q1 2025",
                Description = "Develop James as an elite center-back by enhancing ball-playing ability, reading of the game, and leadership qualities.",
                PeriodStart = new DateOnly(2024, 12, 1),
                PeriodEnd = new DateOnly(2025, 2, 28),
                Status = PlanStatus.Active,
                CoachNotes = "James is showing great maturity and leadership potential. His communication on the pitch has improved significantly.",
                CreatedAt = now,
                UpdatedAt = now
            }
        };
    }
}

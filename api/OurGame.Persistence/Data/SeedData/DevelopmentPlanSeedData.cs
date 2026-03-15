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
        return new List<DevelopmentPlan>();
    }
}

using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class AttributeEvaluationSeedData
{
    public static readonly Guid Eval1_OliverThompson_Id = Guid.Parse("e1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6");
    public static readonly Guid Eval2_JamesWilson_Id = Guid.Parse("e2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7");
    public static readonly Guid Eval3_GeorgeHarris_Id = Guid.Parse("e3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8");
    
    public static List<AttributeEvaluation> GetAttributeEvaluations()
    {
        return new List<AttributeEvaluation>();
    }
}

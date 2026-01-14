using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class EvaluationAttributeSeedData
{
    public static List<EvaluationAttribute> GetEvaluationAttributes()
    {
        return new List<EvaluationAttribute>
        {
            // Oliver Thompson (Goalkeeper) evaluation attributes
            new EvaluationAttribute
            {
                Id = Guid.NewGuid(),
                EvaluationId = AttributeEvaluationSeedData.Eval1_OliverThompson_Id,
                AttributeName = "reactions",
                Rating = 68,
                Notes = "Excellent shot-stopping reflexes"
            },
            new EvaluationAttribute
            {
                Id = Guid.NewGuid(),
                EvaluationId = AttributeEvaluationSeedData.Eval1_OliverThompson_Id,
                AttributeName = "positioning",
                Rating = 70,
                Notes = "Good positioning for age"
            },
            new EvaluationAttribute
            {
                Id = Guid.NewGuid(),
                EvaluationId = AttributeEvaluationSeedData.Eval1_OliverThompson_Id,
                AttributeName = "composure",
                Rating = 60,
                Notes = "Calm under pressure"
            },
            // James Wilson (Center Back) evaluation attributes
            new EvaluationAttribute
            {
                Id = Guid.NewGuid(),
                EvaluationId = AttributeEvaluationSeedData.Eval2_JamesWilson_Id,
                AttributeName = "marking",
                Rating = 65,
                Notes = "Strong one-on-one defending"
            },
            new EvaluationAttribute
            {
                Id = Guid.NewGuid(),
                EvaluationId = AttributeEvaluationSeedData.Eval2_JamesWilson_Id,
                AttributeName = "awareness",
                Rating = 70,
                Notes = "Excellent game reading"
            },
            new EvaluationAttribute
            {
                Id = Guid.NewGuid(),
                EvaluationId = AttributeEvaluationSeedData.Eval2_JamesWilson_Id,
                AttributeName = "communication",
                Rating = 75,
                Notes = "Natural leader and communicator"
            },
            // George Harris (Left Back) evaluation attributes
            new EvaluationAttribute
            {
                Id = Guid.NewGuid(),
                EvaluationId = AttributeEvaluationSeedData.Eval3_GeorgeHarris_Id,
                AttributeName = "crossing",
                Rating = 60,
                Notes = "Delivers quality crosses"
            },
            new EvaluationAttribute
            {
                Id = Guid.NewGuid(),
                EvaluationId = AttributeEvaluationSeedData.Eval3_GeorgeHarris_Id,
                AttributeName = "pace",
                Rating = 68,
                Notes = "Good recovery speed"
            },
            new EvaluationAttribute
            {
                Id = Guid.NewGuid(),
                EvaluationId = AttributeEvaluationSeedData.Eval3_GeorgeHarris_Id,
                AttributeName = "defensivePositioning",
                Rating = 58,
                Notes = "Solid defensive awareness"
            }
        };
    }
}

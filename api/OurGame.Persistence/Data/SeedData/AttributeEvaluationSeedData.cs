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
        return new List<AttributeEvaluation>
        {
            // Oliver Thompson (Goalkeeper) evaluation
            new AttributeEvaluation
            {
                Id = Eval1_OliverThompson_Id,
                PlayerId = PlayerSeedData.OliverThompson_Id,
                EvaluatedBy = CoachSeedData.MichaelRobertson_Id,
                EvaluatedAt = new DateTime(2024, 11, 15, 0, 0, 0, DateTimeKind.Utc),
                OverallRating = 50,
                CoachNotes = "Oliver is a reliable goalkeeper with excellent reflexes. His positioning has improved significantly this season.",
                PeriodStart = new DateOnly(2024, 9, 1),
                PeriodEnd = new DateOnly(2024, 11, 30)
            },
            // James Wilson (Center Back) evaluation
            new AttributeEvaluation
            {
                Id = Eval2_JamesWilson_Id,
                PlayerId = PlayerSeedData.JamesWilson_Id,
                EvaluatedBy = CoachSeedData.MichaelRobertson_Id,
                EvaluatedAt = new DateTime(2024, 11, 15, 0, 0, 0, DateTimeKind.Utc),
                OverallRating = 55,
                CoachNotes = "James is a strong defender with excellent game reading ability. Natural leader on the pitch.",
                PeriodStart = new DateOnly(2024, 9, 1),
                PeriodEnd = new DateOnly(2024, 11, 30)
            },
            // George Harris (Left Back) evaluation
            new AttributeEvaluation
            {
                Id = Eval3_GeorgeHarris_Id,
                PlayerId = PlayerSeedData.GeorgeHarris_Id,
                EvaluatedBy = CoachSeedData.MichaelRobertson_Id,
                EvaluatedAt = new DateTime(2024, 11, 15, 0, 0, 0, DateTimeKind.Utc),
                OverallRating = 52,
                CoachNotes = "George combines defensive solidity with attacking threat. Excellent overlapping runs and crosses.",
                PeriodStart = new DateOnly(2024, 9, 1),
                PeriodEnd = new DateOnly(2024, 11, 30)
            }
        };
    }
}

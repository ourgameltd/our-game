using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class AppliedTemplateSeedData
{
    public static List<AppliedTemplate> GetAppliedTemplates()
    {
        return new List<AppliedTemplate>
        {
            // Template applied to training session
            new AppliedTemplate
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session1_Technical_Id,
                TemplateId = DrillTemplateSeedData.Template_TechnicalFoundations_Id,
                AppliedAt = new DateTime(2025, 12, 20, 14, 30, 0, DateTimeKind.Utc)
            }
        };
    }
}

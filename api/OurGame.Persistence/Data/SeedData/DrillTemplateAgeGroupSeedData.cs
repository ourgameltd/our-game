namespace OurGame.Persistence.Data.SeedData;

public static class DrillTemplateAgeGroupSeedData
{
    public static List<(Guid Id, Guid DrillTemplateId, Guid AgeGroupId)> GetDrillTemplateAgeGroups()
    {
        return new List<(Guid, Guid, Guid)>
        {
            (Guid.Parse("dfa01a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b"), DrillTemplateSeedData.Template_TechnicalFoundations_Id, AgeGroupSeedData.AgeGroup2014_Id),
            (Guid.Parse("dfa02b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c"), DrillTemplateSeedData.Template_TacticalDevelopment_Id, AgeGroupSeedData.AgeGroup2014_Id),
            (Guid.Parse("dfa03c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"), DrillTemplateSeedData.Template_MatchPreparation_Id, AgeGroupSeedData.AgeGroup2014_Id),
        };
    }
}

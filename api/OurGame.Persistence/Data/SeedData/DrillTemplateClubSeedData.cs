namespace OurGame.Persistence.Data.SeedData;

public static class DrillTemplateClubSeedData
{
    public static List<(Guid Id, Guid DrillTemplateId, Guid ClubId)> GetDrillTemplateClubs()
    {
        return new List<(Guid, Guid, Guid)>
        {
            (Guid.Parse("dtc01a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b"), DrillTemplateSeedData.Template_TechnicalFoundations_Id, ClubSeedData.ValeFC_Id),
            (Guid.Parse("dtc02b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c"), DrillTemplateSeedData.Template_TacticalDevelopment_Id, ClubSeedData.ValeFC_Id),
            (Guid.Parse("dtc03c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"), DrillTemplateSeedData.Template_MatchPreparation_Id, ClubSeedData.ValeFC_Id),
        };
    }
}

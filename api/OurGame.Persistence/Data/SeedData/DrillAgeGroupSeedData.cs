namespace OurGame.Persistence.Data.SeedData;

public static class DrillAgeGroupSeedData
{
    public static List<(Guid Id, Guid DrillId, Guid AgeGroupId)> GetDrillAgeGroups()
    {
        return new List<(Guid, Guid, Guid)>
        {
            (Guid.Parse("da01a2b3-c4d5-e6f7-a8b9-c0d1e2f3a4b5"), DrillSeedData.PassingTriangle_Id, AgeGroupSeedData.AgeGroup2014_Id),
            (Guid.Parse("da02b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6"), DrillSeedData.DribblingGates_Id, AgeGroupSeedData.AgeGroup2014_Id),
            (Guid.Parse("da03c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7"), DrillSeedData.Possession5v5_Id, AgeGroupSeedData.AgeGroup2014_Id),
            (Guid.Parse("da04d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8"), DrillSeedData.FinishingCircuit_Id, AgeGroupSeedData.AgeGroup2014_Id),
            (Guid.Parse("da05e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9"), DrillSeedData.DefensiveShape_Id, AgeGroupSeedData.AgeGroup2014_Id),
            (Guid.Parse("da06f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0"), DrillSeedData.SprintIntervals_Id, AgeGroupSeedData.AgeGroup2014_Id),
            (Guid.Parse("da07a8b9-c0d1-e2f3-a4b5-c6d7e8f9a0b1"), DrillSeedData.Defending1v1_Id, AgeGroupSeedData.AgeGroup2014_Id),
            (Guid.Parse("da08b9c0-d1e2-f3a4-b5c6-d7e8f9a0b1c2"), DrillSeedData.CrossingFinishing_Id, AgeGroupSeedData.AgeGroup2014_Id),
        };
    }
}

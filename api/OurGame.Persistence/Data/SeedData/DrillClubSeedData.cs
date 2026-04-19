namespace OurGame.Persistence.Data.SeedData;

public static class DrillClubSeedData
{
    public static List<(Guid Id, Guid DrillId, Guid ClubId)> GetDrillClubs()
    {
        return new List<(Guid, Guid, Guid)>
        {
            (Guid.Parse("dc01a2b3-c4d5-e6f7-a8b9-c0d1e2f3a4b5"), DrillSeedData.PassingTriangle_Id, ClubSeedData.ValeFC_Id),
            (Guid.Parse("dc02b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6"), DrillSeedData.DribblingGates_Id, ClubSeedData.ValeFC_Id),
            (Guid.Parse("dc03c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7"), DrillSeedData.Possession5v5_Id, ClubSeedData.ValeFC_Id),
            (Guid.Parse("dc04d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8"), DrillSeedData.FinishingCircuit_Id, ClubSeedData.ValeFC_Id),
            (Guid.Parse("dc05e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9"), DrillSeedData.DefensiveShape_Id, ClubSeedData.ValeFC_Id),
            (Guid.Parse("dc06f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0"), DrillSeedData.SprintIntervals_Id, ClubSeedData.ValeFC_Id),
            (Guid.Parse("dc07a8b9-c0d1-e2f3-a4b5-c6d7e8f9a0b1"), DrillSeedData.Defending1v1_Id, ClubSeedData.ValeFC_Id),
            (Guid.Parse("dc08b9c0-d1e2-f3a4-b5c6-d7e8f9a0b1c2"), DrillSeedData.CrossingFinishing_Id, ClubSeedData.ValeFC_Id),
        };
    }
}

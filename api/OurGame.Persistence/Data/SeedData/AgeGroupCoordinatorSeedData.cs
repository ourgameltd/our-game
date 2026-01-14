using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class AgeGroupCoordinatorSeedData
{
    public static List<AgeGroupCoordinator> GetAgeGroupCoordinators()
    {
        return new List<AgeGroupCoordinator>
        {
            // 2014s age group - Michael Robertson
            new AgeGroupCoordinator
            {
                Id = Guid.NewGuid(),
                AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id,
                CoachId = CoachSeedData.MichaelRobertson_Id
            },
            // 2013s age group - Michael Robertson
            new AgeGroupCoordinator
            {
                Id = Guid.NewGuid(),
                AgeGroupId = AgeGroupSeedData.AgeGroup2013_Id,
                CoachId = CoachSeedData.MichaelRobertson_Id
            }
        };
    }
}

using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class PlayerParentSeedData
{
    public static List<PlayerParent> GetPlayerParents()
    {
        return new List<PlayerParent>
        {
            // Oliver Thompson - parent user (would need to exist in Users table)
            new PlayerParent
            {
                Id = Guid.NewGuid(),
                PlayerId = PlayerSeedData.OliverThompson_Id,
                ParentUserId = UserSeedData.ParentUser_Id
            },
            // James Wilson - parent user
            new PlayerParent
            {
                Id = Guid.NewGuid(),
                PlayerId = PlayerSeedData.JamesWilson_Id,
                ParentUserId = UserSeedData.DemoUser_Id
            }
        };
    }
}

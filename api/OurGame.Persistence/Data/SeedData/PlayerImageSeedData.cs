using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class PlayerImageSeedData
{
    public static List<PlayerImage> GetPlayerImages()
    {
        var now = DateTime.UtcNow;
        
        return new List<PlayerImage>
        {
            // Oliver Thompson's album
            new PlayerImage
            {
                Id = Guid.NewGuid(),
                PlayerId = PlayerSeedData.OliverThompson_Id,
                Url = "https://placehold.co/800x600/4A90E2/FFFFFF?text=Training+Day",
                Caption = "Training session - working on reflexes",
                PhotoDate = new DateTime(2024, 10, 15, 0, 0, 0, DateTimeKind.Utc),
                Tags = "training,goalkeeper",
                CreatedAt = now
            },
            new PlayerImage
            {
                Id = Guid.NewGuid(),
                PlayerId = PlayerSeedData.OliverThompson_Id,
                Url = "https://placehold.co/800x600/4A90E2/FFFFFF?text=Match+Save",
                Caption = "Incredible save against Blues",
                PhotoDate = new DateTime(2024, 10, 22, 0, 0, 0, DateTimeKind.Utc),
                Tags = "match,highlight",
                CreatedAt = now
            },
            new PlayerImage
            {
                Id = Guid.NewGuid(),
                PlayerId = PlayerSeedData.OliverThompson_Id,
                Url = "https://placehold.co/800x600/4A90E2/FFFFFF?text=Team+Photo",
                Caption = "Team photo after cup victory",
                PhotoDate = new DateTime(2024, 11, 5, 0, 0, 0, DateTimeKind.Utc),
                Tags = "team,award",
                CreatedAt = now
            },
            new PlayerImage
            {
                Id = Guid.NewGuid(),
                PlayerId = PlayerSeedData.OliverThompson_Id,
                Url = "https://placehold.co/800x600/4A90E2/FFFFFF?text=Award+Ceremony",
                Caption = "Player of the Month - November 2024",
                PhotoDate = new DateTime(2024, 11, 30, 0, 0, 0, DateTimeKind.Utc),
                Tags = "award,achievement",
                CreatedAt = now
            }
        };
    }
}

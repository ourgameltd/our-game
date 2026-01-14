using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class FormationSeedData
{
    // 11-a-side Formation IDs
    public static readonly Guid Formation_442_Classic_Id = Guid.Parse("f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6");
    public static readonly Guid Formation_433_Attack_Id = Guid.Parse("f2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7");
    public static readonly Guid Formation_352_Id = Guid.Parse("f3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8");
    public static readonly Guid Formation_4231_Id = Guid.Parse("f4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9");
    
    // 9-a-side Formation IDs
    public static readonly Guid Formation_332_Id = Guid.Parse("f5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0");
    public static readonly Guid Formation_233_Id = Guid.Parse("f6f7a8b9-c0d1-e2f3-a4b5-c6d7e8f9a0b1");
    
    // 7-a-side Formation IDs
    public static readonly Guid Formation_231_Id = Guid.Parse("f8b9c0d1-e2f3-a4b5-c6d7-e8f9a0b1c2d3");
    public static readonly Guid Formation_222_Id = Guid.Parse("f9c0d1e2-f3a4-b5c6-d7e8-f9a0b1c2d3e4");
    
    // 5-a-side Formation IDs
    public static readonly Guid Formation_5aside_121_Id = Guid.Parse("fbe2f3a4-b5c6-d7e8-f9a0-b1c2d3e4f5a6");
    
    // 4-a-side Formation IDs
    public static readonly Guid Formation_4aside_121_Id = Guid.Parse("f4a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5");

    public static List<Formation> GetFormations()
    {
        var now = DateTime.UtcNow;
        
        return new List<Formation>
        {
            // 11-a-side formations
            new Formation
            {
                Id = Formation_442_Classic_Id,
                Name = "4-4-2 Classic",
                System = "4-4-2",
                SquadSize = SquadSize.ElevenASide,
                Summary = "Traditional 4-4-2 formation with two strikers and flat midfield",
                Tags = "[\"Direct play through the middle\",\"Wide play using full-backs\",\"Two strikers working in partnership\"]",
                IsSystemFormation = true,
                                CreatedAt = now,
                UpdatedAt = now
            },
            new Formation
            {
                Id = Formation_433_Attack_Id,
                Name = "4-3-3 Attack",
                System = "4-3-3",
                SquadSize = SquadSize.ElevenASide,
                Summary = "Attacking 4-3-3 with wingers and central striker",
                Tags = "[\"Width provided by wingers\",\"Central striker as focal point\",\"Defensive midfielder shields back four\"]",
                IsSystemFormation = true,
                                CreatedAt = now,
                UpdatedAt = now
            },
            new Formation
            {
                Id = Formation_352_Id,
                Name = "3-5-2",
                System = "3-5-2",
                SquadSize = SquadSize.ElevenASide,
                Summary = "Three at the back with wing-backs providing width",
                Tags = "[\"Wing-backs push high\",\"Central midfield control\",\"Two strikers partnership\"]",
                IsSystemFormation = true,
                                CreatedAt = now,
                UpdatedAt = now
            },
            new Formation
            {
                Id = Formation_4231_Id,
                Name = "4-2-3-1",
                System = "4-2-3-1",
                SquadSize = SquadSize.ElevenASide,
                Summary = "Modern formation with two holding midfielders and attacking midfielder",
                Tags = "[\"Double pivot in midfield\",\"Attacking midfielder supports striker\",\"Wide players cut inside\"]",
                IsSystemFormation = true,
                                CreatedAt = now,
                UpdatedAt = now
            },
            // 9-a-side formations
            new Formation
            {
                Id = Formation_332_Id,
                Name = "3-3-2",
                System = "3-3-2",
                SquadSize = SquadSize.NineASide,
                Summary = "Solid 9-a-side formation with three defenders and two strikers",
                Tags = "[\"Strong defensive shape\",\"Midfield control in center\",\"Two strikers partnership\"]",
                IsSystemFormation = true,
                                CreatedAt = now,
                UpdatedAt = now
            },
            new Formation
            {
                Id = Formation_233_Id,
                Name = "2-3-3",
                System = "2-3-3",
                SquadSize = SquadSize.NineASide,
                Summary = "Attacking 9-a-side formation with wide players",
                Tags = "[\"Width in attack\",\"Two solid center backs\",\"Central striker supported by wingers\"]",
                IsSystemFormation = true,
                                CreatedAt = now,
                UpdatedAt = now
            },
            // 7-a-side formations
            new Formation
            {
                Id = Formation_231_Id,
                Name = "2-3-1",
                System = "2-3-1",
                SquadSize = SquadSize.SevenASide,
                Summary = "Classic 7-a-side formation with two defenders and lone striker",
                Tags = "[\"Two solid defenders\",\"Strong midfield presence\",\"Support striker from midfield\"]",
                IsSystemFormation = true,
                                CreatedAt = now,
                UpdatedAt = now
            },
            new Formation
            {
                Id = Formation_222_Id,
                Name = "2-2-2",
                System = "2-2-2",
                SquadSize = SquadSize.SevenASide,
                Summary = "Balanced 7-a-side with two strikers",
                Tags = "[\"Balanced shape throughout\",\"Two strikers working together\",\"Central midfield partnership\"]",
                IsSystemFormation = true,
                                CreatedAt = now,
                UpdatedAt = now
            },
            // 5-a-side formations
            new Formation
            {
                Id = Formation_5aside_121_Id,
                Name = "1-2-1",
                System = "1-2-1",
                SquadSize = SquadSize.FiveASide,
                Summary = "Classic 5-a-side diamond formation",
                Tags = "[\"One defender sweeps behind\",\"Two midfielders control center\",\"Lone striker up front\"]",
                IsSystemFormation = true,
                                CreatedAt = now,
                UpdatedAt = now
            },
            // 4-a-side formations
            new Formation
            {
                Id = Formation_4aside_121_Id,
                Name = "1-2-1",
                System = "1-2-1",
                SquadSize = SquadSize.FourASide,
                Summary = "Basic 4-a-side formation with one defender and two midfielders",
                Tags = "[\"Single defender covers back\",\"Two players share attacking duties\",\"Encourage passing and movement\"]",
                IsSystemFormation = true,
                                CreatedAt = now,
                UpdatedAt = now
            }
        };
    }
}

using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class DrillSeedData
{
    // Drill IDs from TypeScript
    public static readonly Guid PassingTriangle_Id = Guid.Parse("d1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6");
    public static readonly Guid DribblingGates_Id = Guid.Parse("d2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7");
    public static readonly Guid Possession5v5_Id = Guid.Parse("d3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8");
    public static readonly Guid FinishingCircuit_Id = Guid.Parse("d4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9");
    public static readonly Guid DefensiveShape_Id = Guid.Parse("d5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0");
    public static readonly Guid SprintIntervals_Id = Guid.Parse("d6f7a8b9-c0d1-e2f3-a4b5-c6d7e8f9a0b1");
    public static readonly Guid Defending1v1_Id = Guid.Parse("d7a8b9c0-d1e2-f3a4-b5c6-d7e8f9a0b1c2");
    public static readonly Guid CrossingFinishing_Id = Guid.Parse("d8b9c0d1-e2f3-a4b5-c6d7-e8f9a0b1c2d3");
    
    // Additional IDs for session drills
    public static readonly Guid Drill_PassingSquares_Id = PassingTriangle_Id; // Reusing PassingTriangle
    public static readonly Guid Drill_1v1_Id = Defending1v1_Id; // Reusing Defending1v1
    public static readonly Guid Drill_PositionalPlay_Id = DefensiveShape_Id; // Reusing DefensiveShape
    public static readonly Guid Drill_SmallSidedGame_Id = Possession5v5_Id; // Reusing Possession5v5
    public static readonly Guid Drill_CoordinationLadder_Id = SprintIntervals_Id; // Reusing SprintIntervals
    public static readonly Guid Drill_ShootingCircuit_Id = FinishingCircuit_Id; // Reusing FinishingCircuit

    public static List<Drill> GetDrills()
    {
        var now = DateTime.UtcNow;

        return new List<Drill>
        {
            new Drill
            {
                Id = PassingTriangle_Id,
                Name = "Passing Triangle",
                Description = "Players form a triangle and pass the ball to each other, focusing on first touch and weight of pass.",
                DurationMinutes = 15,
                Category = DrillCategory.Technical,
                Attributes = "[\"Passing\",\"FirstTouch\",\"BallControl\"]",
                Equipment = "[\"Cones\",\"Balls\"]",
                Diagram = null,
                Instructions = "Set up 3 cones in a triangle, 10m apart. Players pass and follow their pass to the next cone.",
                Variations = "[\"One-touch only\",\"Add a defender\",\"Increase distance\"]",
                CreatedBy = CoachSeedData.MichaelRobertson_Id,
                IsPublic = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Drill
            {
                Id = DribblingGates_Id,
                Name = "Dribbling Gates",
                Description = "Players dribble through a series of gates made from cones, focusing on close control and changes of direction.",
                DurationMinutes = 10,
                Category = DrillCategory.Technical,
                Attributes = "[\"Dribbling\",\"BallControl\",\"Agility\"]",
                Equipment = "[\"Cones\",\"Balls\"]",
                Diagram = null,
                Instructions = "Set up pairs of cones as gates across the area. Players must dribble through as many gates as possible in 60 seconds.",
                Variations = "[\"Weak foot only\",\"Add defenders\",\"Time trial\"]",
                CreatedBy = CoachSeedData.MichaelRobertson_Id,
                IsPublic = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Drill
            {
                Id = Possession5v5_Id,
                Name = "Possession 5v5",
                Description = "Small-sided possession game focusing on keeping the ball under pressure and finding space.",
                DurationMinutes = 20,
                Category = DrillCategory.Tactical,
                Attributes = "[\"Passing\",\"Movement\",\"Awareness\",\"Positioning\"]",
                Equipment = "[\"Cones\",\"Balls\",\"Bibs\"]",
                Diagram = null,
                Instructions = "5v5 in a 30x20m area. Team in possession scores a point for every 5 consecutive passes.",
                Variations = "[\"Add neutral players\",\"Limit touches\",\"Smaller area\"]",
                CreatedBy = CoachSeedData.MichaelRobertson_Id,
                IsPublic = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Drill
            {
                Id = FinishingCircuit_Id,
                Name = "Finishing Circuit",
                Description = "A circuit of finishing drills from different angles and distances.",
                DurationMinutes = 20,
                Category = DrillCategory.Technical,
                Attributes = "[\"Shooting\",\"Finishing\",\"Composure\"]",
                Equipment = "[\"Cones\",\"Balls\",\"Goals\"]",
                Diagram = null,
                Instructions = "Set up 4 stations around the penalty area. Players rotate through each station, taking a shot from different angles.",
                Variations = "[\"Add a goalkeeper\",\"First-time finish only\",\"Volley station\"]",
                CreatedBy = CoachSeedData.MichaelRobertson_Id,
                IsPublic = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Drill
            {
                Id = DefensiveShape_Id,
                Name = "Defensive Shape",
                Description = "Team defensive positioning drill, focusing on compactness and covering passing lanes.",
                DurationMinutes = 15,
                Category = DrillCategory.Tactical,
                Attributes = "[\"Defending\",\"Positioning\",\"Communication\"]",
                Equipment = "[\"Cones\",\"Balls\",\"Bibs\"]",
                Diagram = null,
                Instructions = "Defenders work together to maintain shape against attacking team. Focus on sliding as a unit and communication.",
                Variations = "[\"Add overloads\",\"Quick transitions\",\"Counter-attack on turnover\"]",
                CreatedBy = CoachSeedData.MichaelRobertson_Id,
                IsPublic = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Drill
            {
                Id = SprintIntervals_Id,
                Name = "Sprint Intervals",
                Description = "High-intensity sprint intervals to build speed and recovery fitness.",
                DurationMinutes = 10,
                Category = DrillCategory.Physical,
                Attributes = "[\"Pace\",\"Stamina\",\"Acceleration\"]",
                Equipment = "[\"Cones\"]",
                Diagram = null,
                Instructions = "Sprint 30m, jog back. Repeat 8-10 times with 30-second rest between sets.",
                Variations = "[\"Shuttle runs\",\"With ball\",\"Competition format\"]",
                CreatedBy = CoachSeedData.MichaelRobertson_Id,
                IsPublic = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Drill
            {
                Id = Defending1v1_Id,
                Name = "1v1 Defending",
                Description = "Individual defending drill focusing on jockeying, timing of tackle, and body position.",
                DurationMinutes = 15,
                Category = DrillCategory.Technical,
                Attributes = "[\"Defending\",\"Tackling\",\"Agility\"]",
                Equipment = "[\"Cones\",\"Balls\"]",
                Diagram = null,
                Instructions = "Attacker tries to dribble past defender in a 10x10m area. Defender focuses on staying on feet and channelling attacker.",
                Variations = "[\"2v1 overload\",\"Add a goal to attack\",\"Counter-attack option\"]",
                CreatedBy = CoachSeedData.MichaelRobertson_Id,
                IsPublic = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Drill
            {
                Id = CrossingFinishing_Id,
                Name = "Crossing & Finishing",
                Description = "Combined crossing and finishing drill from wide areas.",
                DurationMinutes = 20,
                Category = DrillCategory.Technical,
                Attributes = "[\"Crossing\",\"Finishing\",\"Heading\",\"Movement\"]",
                Equipment = "[\"Cones\",\"Balls\",\"Goals\"]",
                Diagram = null,
                Instructions = "Wide player delivers crosses from both flanks. Attackers make runs to meet the ball. Rotate positions.",
                Variations = "[\"Low crosses only\",\"Add defenders\",\"First-time finish\"]",
                CreatedBy = CoachSeedData.MichaelRobertson_Id,
                IsPublic = true,
                CreatedAt = now,
                UpdatedAt = now
            }
        };
    }
}

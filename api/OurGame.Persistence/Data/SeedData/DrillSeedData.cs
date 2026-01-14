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
                Description = "Three players form a triangle and practice quick one-touch passing",
                DurationMinutes = 10,
                Category = DrillCategory.Technical,
                Attributes = "[\"shortPassing\",\"ballControl\",\"communication\",\"awareness\"]",
                Equipment = "[\"Cones\",\"Balls\"]",
                Instructions = "[\"Set up three cones in a triangle, 10 yards apart\",\"One player at each cone with one ball\",\"Pass clockwise, move to next cone\",\"After 5 minutes, switch to counter-clockwise\",\"Progress to two-touch, then one-touch\"]",
                Variations = "[\"Increase distance between cones\",\"Use both feet\",\"Add a defender in the middle\"]",
                CreatedAt = now,
                UpdatedAt = now
            },
            new Drill
            {
                Id = DribblingGates_Id,
                Name = "Dribbling Gates",
                Description = "Players dribble through small gates to improve close control",
                DurationMinutes = 15,
                Category = DrillCategory.Technical,
                Attributes = "[\"dribbling\",\"ballControl\",\"agility\",\"acceleration\"]",
                Equipment = "[\"Cones\",\"Balls\"]",
                Instructions = "[\"Set up 10-15 small gates (2 cones, 2 yards apart) in area\",\"Each player with a ball\",\"Dribble through as many gates as possible in time limit\",\"Can only go through each gate once\",\"Use different surfaces of foot\"]",
                CreatedAt = now,
                UpdatedAt = now
            },
            new Drill
            {
                Id = Possession5v5_Id,
                Name = "5v5 Possession",
                Description = "Small-sided game focusing on keeping possession",
                DurationMinutes = 20,
                Category = DrillCategory.Tactical,
                Attributes = "[\"shortPassing\",\"positioning\",\"awareness\",\"vision\",\"ballControl\"]",
                Equipment = "[\"Cones\",\"Balls\",\"Bibs\"]",
                Instructions = "[\"Mark out 30x30 yard area\",\"5v5 in the area\",\"Team scores a point for 10 consecutive passes\",\"Can add neutrals to make easier\",\"Rotate teams every 5 minutes\"]",
                CreatedAt = now,
                UpdatedAt = now
            },
            new Drill
            {
                Id = FinishingCircuit_Id,
                Name = "Finishing Circuit",
                Description = "Rotate through different finishing scenarios",
                DurationMinutes = 20,
                Category = DrillCategory.Technical,
                Attributes = "[\"finishing\",\"shotPower\",\"composure\",\"attackingPosition\",\"volleys\"]",
                Equipment = "[\"Goals\",\"Balls\",\"Cones\"]",
                Instructions = "[\"Set up 4 stations around penalty area\",\"Station 1: Through ball and finish\",\"Station 2: Cross and finish\",\"Station 3: Turn and shoot\",\"Station 4: 1v1 with goalkeeper\",\"Players rotate through stations\"]",
                CreatedAt = now,
                UpdatedAt = now
            },
            new Drill
            {
                Id = DefensiveShape_Id,
                Name = "Defensive Shape",
                Description = "Practice maintaining defensive formation",
                DurationMinutes = 15,
                Category = DrillCategory.Tactical,
                Attributes = "[\"defensivePositioning\",\"marking\",\"communication\",\"interceptions\",\"awareness\"]",
                Equipment = "[\"Cones\",\"Balls\",\"Bibs\"]",
                Instructions = "[\"Set up half pitch\",\"Defensive unit (4 or 5 players)\",\"Attackers try to break through\",\"Focus on holding shape and moving as a unit\",\"Coach calls out scenarios\"]",
                CreatedAt = now,
                UpdatedAt = now
            },
            new Drill
            {
                Id = SprintIntervals_Id,
                Name = "Sprint Intervals",
                Description = "High-intensity sprint training to build speed and endurance",
                DurationMinutes = 20,
                Category = DrillCategory.Physical,
                Attributes = "[\"pace\",\"sprintSpeed\",\"stamina\",\"acceleration\"]",
                Equipment = "[\"Cones\"]",
                Instructions = "[\"Mark 40-yard distance\",\"Sprint full speed, jog back recovery\",\"10 repetitions\",\"Focus on explosive starts\",\"2-minute rest between sets\"]",
                CreatedAt = now,
                UpdatedAt = now
            },
            new Drill
            {
                Id = Defending1v1_Id,
                Name = "1v1 Defending",
                Description = "Practice individual defensive techniques",
                DurationMinutes = 15,
                Category = DrillCategory.Technical,
                Attributes = "[\"standingTackle\",\"slidingTackle\",\"balance\",\"strength\",\"positioning\"]",
                Equipment = "[\"Cones\",\"Balls\",\"Bibs\"]",
                Instructions = "[\"Set up 15x15 yard area with goal\",\"Attacker starts with ball\",\"Defender closes down and defends\",\"Work on jockeying and timing\",\"Switch roles after each attempt\"]",
                CreatedAt = now,
                UpdatedAt = now
            },
            new Drill
            {
                Id = CrossingFinishing_Id,
                Name = "Crossing & Finishing",
                Description = "Wide players deliver crosses for strikers to finish",
                DurationMinutes = 20,
                Category = DrillCategory.Technical,
                Attributes = "[\"crossing\",\"finishing\",\"heading\",\"attackingPosition\",\"timing\"]",
                Equipment = "[\"Goals\",\"Balls\",\"Cones\"]",
                Instructions = "[\"Set up wide positions both sides\",\"Queue of crossers, queue of finishers\",\"Vary cross types: low, high, cut-back\",\"Finishers attack near and far post\",\"Rotate positions every 5 minutes\"]",
                CreatedAt = now,
                UpdatedAt = now
            }
        };
    }
}

using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class PlayerAttributeSeedData
{
    public static List<PlayerAttribute> GetPlayerAttributes()
    {
        var now = DateTime.UtcNow;
        var attributes = new List<PlayerAttribute>();

        // Oliver Thompson (GK) attributes
        attributes.AddRange(CreateAttributesFor(PlayerSeedData.OliverThompson_Id, now,
            ballControl: 45, crossing: 35, weakFoot: 40, dribbling: 40, finishing: 30,
            freeKick: 35, heading: 42, longPassing: 48, longShot: 38, penalties: 50,
            shortPassing: 52, shotPower: 40, slidingTackle: 38, standingTackle: 40, volleys: 35,
            acceleration: 55, agility: 62, balance: 58, jumping: 60, pace: 54,
            reactions: 68, sprintSpeed: 53, stamina: 60, strength: 48,
            aggression: 45, attackingPosition: 35, awareness: 65, communication: 72, composure: 60,
            defensivePositioning: 60, interceptions: 42, marking: 40, positivity: 68, positioning: 70, vision: 50));

        // James Wilson (CB/RB) attributes
        attributes.AddRange(CreateAttributesFor(PlayerSeedData.JamesWilson_Id, now,
            ballControl: 52, crossing: 45, weakFoot: 42, dribbling: 48, finishing: 38,
            freeKick: 40, heading: 65, longPassing: 50, longShot: 42, penalties: 45,
            shortPassing: 55, shotPower: 48, slidingTackle: 60, standingTackle: 62, volleys: 40,
            acceleration: 58, agility: 54, balance: 56, jumping: 64, pace: 57,
            reactions: 58, sprintSpeed: 56, stamina: 62, strength: 60,
            aggression: 55, attackingPosition: 40, awareness: 62, communication: 65, composure: 58,
            defensivePositioning: 68, interceptions: 60, marking: 62, positivity: 58, positioning: 60, vision: 48));

        // Lucas Martinez (CB/LB) attributes
        attributes.AddRange(CreateAttributesFor(PlayerSeedData.LucasMartinez_Id, now,
            ballControl: 58, crossing: 48, weakFoot: 45, dribbling: 52, finishing: 42,
            freeKick: 50, heading: 62, longPassing: 56, longShot: 48, penalties: 50,
            shortPassing: 60, shotPower: 50, slidingTackle: 58, standingTackle: 60, volleys: 45,
            acceleration: 60, agility: 58, balance: 60, jumping: 62, pace: 59,
            reactions: 60, sprintSpeed: 58, stamina: 65, strength: 58,
            aggression: 52, attackingPosition: 70, awareness: 62, communication: 55, composure: 60,
            defensivePositioning: 38, interceptions: 35, marking: 40, positivity: 62, positioning: 68, vision: 55));

        // Ethan Davies (CM/CAM) attributes
        attributes.AddRange(CreateAttributesFor(PlayerSeedData.EthanDavies_Id, now,
            ballControl: 65, crossing: 55, weakFoot: 58, dribbling: 62, finishing: 52,
            freeKick: 60, heading: 48, longPassing: 62, longShot: 58, penalties: 55,
            shortPassing: 68, shotPower: 55, slidingTackle: 48, standingTackle: 50, volleys: 52,
            acceleration: 62, agility: 64, balance: 62, jumping: 52, pace: 60,
            reactions: 62, sprintSpeed: 59, stamina: 68, strength: 50,
            aggression: 48, attackingPosition: 58, awareness: 65, communication: 70, composure: 62,
            defensivePositioning: 55, interceptions: 52, marking: 50, positivity: 75, positioning: 60, vision: 68));

        // Noah Anderson (ST/CF) attributes
        attributes.AddRange(CreateAttributesFor(PlayerSeedData.NoahAnderson_Id, now,
            ballControl: 68, crossing: 48, weakFoot: 52, dribbling: 66, finishing: 72,
            freeKick: 55, heading: 58, longPassing: 48, longShot: 62, penalties: 68,
            shortPassing: 62, shotPower: 65, slidingTackle: 35, standingTackle: 38, volleys: 60,
            acceleration: 70, agility: 68, balance: 66, jumping: 60, pace: 68,
            reactions: 68, sprintSpeed: 67, stamina: 62, strength: 55,
            aggression: 52, attackingPosition: 72, awareness: 66, communication: 60, composure: 65,
            defensivePositioning: 65, interceptions: 35, marking: 32, positivity: 60, positioning: 70, vision: 62));

        // Charlie Roberts (ST/RW) attributes - archived
        attributes.AddRange(CreateAttributesFor(PlayerSeedData.CharlieRoberts_Id, now,
            ballControl: 62, crossing: 58, weakFoot: 55, dribbling: 65, finishing: 64,
            freeKick: 52, heading: 52, longPassing: 50, longShot: 58, penalties: 60,
            shortPassing: 58, shotPower: 60, slidingTackle: 38, standingTackle: 40, volleys: 56,
            acceleration: 68, agility: 66, balance: 64, jumping: 56, pace: 66,
            reactions: 64, sprintSpeed: 65, stamina: 64, strength: 52,
            aggression: 58, attackingPosition: 48, awareness: 68, communication: 75, composure: 62,
            defensivePositioning: 70, interceptions: 68, marking: 65, positivity: 60, positioning: 65, vision: 58));

        // William Brown (CM/CDM) attributes
        attributes.AddRange(CreateAttributesFor(PlayerSeedData.WilliamBrown_Id, now,
            ballControl: 60, crossing: 52, weakFoot: 50, dribbling: 58, finishing: 48,
            freeKick: 55, heading: 55, longPassing: 62, longShot: 55, penalties: 52,
            shortPassing: 65, shotPower: 52, slidingTackle: 58, standingTackle: 60, volleys: 50,
            acceleration: 58, agility: 60, balance: 60, jumping: 58, pace: 57,
            reactions: 62, sprintSpeed: 56, stamina: 70, strength: 58,
            aggression: 50, attackingPosition: 52, awareness: 68, communication: 60, composure: 65,
            defensivePositioning: 65, interceptions: 64, marking: 60, positivity: 60, positioning: 65, vision: 66));

        // Harry Taylor (CB/CDM) attributes - archived
        attributes.AddRange(CreateAttributesFor(PlayerSeedData.HarryTaylor_Id, now,
            ballControl: 50, crossing: 42, weakFoot: 40, dribbling: 45, finishing: 35,
            freeKick: 42, heading: 62, longPassing: 52, longShot: 45, penalties: 48,
            shortPassing: 55, shotPower: 48, slidingTackle: 62, standingTackle: 65, volleys: 40,
            acceleration: 54, agility: 52, balance: 55, jumping: 65, pace: 53,
            reactions: 58, sprintSpeed: 52, stamina: 62, strength: 65,
            aggression: 52, attackingPosition: 55, awareness: 58, communication: 62, composure: 54,
            defensivePositioning: 60, interceptions: 56, marking: 58, positivity: 55, positioning: 56, vision: 50));

        // Mason Evans (RW/LW) attributes
        attributes.AddRange(CreateAttributesFor(PlayerSeedData.MasonEvans_Id, now,
            ballControl: 66, crossing: 64, weakFoot: 60, dribbling: 70, finishing: 58,
            freeKick: 56, heading: 45, longPassing: 52, longShot: 58, penalties: 55,
            shortPassing: 62, shotPower: 58, slidingTackle: 35, standingTackle: 38, volleys: 54,
            acceleration: 72, agility: 70, balance: 68, jumping: 52, pace: 70,
            reactions: 66, sprintSpeed: 71, stamina: 64, strength: 48,
            aggression: 42, attackingPosition: 70, awareness: 60, communication: 58, composure: 58,
            defensivePositioning: 42, interceptions: 40, marking: 38, positivity: 72, positioning: 68, vision: 62));

        // Alexander White (CAM/CM) attributes
        attributes.AddRange(CreateAttributesFor(PlayerSeedData.AlexanderWhite_Id, now,
            ballControl: 70, crossing: 58, weakFoot: 62, dribbling: 68, finishing: 60,
            freeKick: 65, heading: 48, longPassing: 66, longShot: 64, penalties: 62,
            shortPassing: 72, shotPower: 60, slidingTackle: 42, standingTackle: 45, volleys: 58,
            acceleration: 62, agility: 66, balance: 65, jumping: 50, pace: 60,
            reactions: 68, sprintSpeed: 59, stamina: 66, strength: 48,
            aggression: 40, attackingPosition: 72, awareness: 68, communication: 68, composure: 65,
            defensivePositioning: 45, interceptions: 48, marking: 42, positivity: 78, positioning: 70, vision: 75));

        // George Harris (LB/CB) attributes
        attributes.AddRange(CreateAttributesFor(PlayerSeedData.GeorgeHarris_Id, now,
            ballControl: 55, crossing: 52, weakFoot: 48, dribbling: 54, finishing: 40,
            freeKick: 45, heading: 58, longPassing: 54, longShot: 46, penalties: 48,
            shortPassing: 58, shotPower: 48, slidingTackle: 60, standingTackle: 62, volleys: 42,
            acceleration: 64, agility: 62, balance: 60, jumping: 58, pace: 62,
            reactions: 60, sprintSpeed: 63, stamina: 68, strength: 56,
            aggression: 58, attackingPosition: 38, awareness: 60, communication: 63, composure: 56,
            defensivePositioning: 65, interceptions: 58, marking: 60, positivity: 52, positioning: 58, vision: 45));

        // Carlos Rodriguez (ST/CF) attributes - 2012 age group
        attributes.AddRange(CreateAttributesFor(PlayerSeedData.CarlosRodriguez_Id, now,
            ballControl: 75, crossing: 58, weakFoot: 62, dribbling: 72, finishing: 80,
            freeKick: 65, heading: 62, longPassing: 58, longShot: 70, penalties: 75,
            shortPassing: 68, shotPower: 72, slidingTackle: 40, standingTackle: 42, volleys: 70,
            acceleration: 75, agility: 73, balance: 72, jumping: 65, pace: 74,
            reactions: 76, sprintSpeed: 73, stamina: 68, strength: 62,
            aggression: 55, attackingPosition: 82, awareness: 74, communication: 60, composure: 75,
            defensivePositioning: 75, interceptions: 40, marking: 38, positivity: 60, positioning: 80, vision: 68));

        return attributes;
    }

    private static List<PlayerAttribute> CreateAttributesFor(Guid playerId, DateTime now,
        int ballControl, int crossing, int weakFoot, int dribbling, int finishing,
        int freeKick, int heading, int longPassing, int longShot, int penalties,
        int shortPassing, int shotPower, int slidingTackle, int standingTackle, int volleys,
        int acceleration, int agility, int balance, int jumping, int pace,
        int reactions, int sprintSpeed, int stamina, int strength,
        int aggression, int attackingPosition, int awareness, int communication, int composure,
        int defensivePositioning, int interceptions, int marking, int positivity, int positioning, int vision)
    {
        return new List<PlayerAttribute>
        {
            new PlayerAttribute 
            { 
                Id = Guid.NewGuid(), 
                PlayerId = playerId,
                BallControl = ballControl,
                Crossing = crossing,
                WeakFoot = weakFoot,
                Dribbling = dribbling,
                Finishing = finishing,
                FreeKick = freeKick,
                Heading = heading,
                LongPassing = longPassing,
                LongShot = longShot,
                Penalties = penalties,
                ShortPassing = shortPassing,
                ShotPower = shotPower,
                SlidingTackle = slidingTackle,
                StandingTackle = standingTackle,
                Volleys = volleys,
                Acceleration = acceleration,
                Agility = agility,
                Balance = balance,
                Jumping = jumping,
                Pace = pace,
                Reactions = reactions,
                SprintSpeed = sprintSpeed,
                Stamina = stamina,
                Strength = strength,
                Aggression = aggression,
                AttackingPosition = attackingPosition,
                Awareness = awareness,
                Communication = communication,
                Composure = composure,
                DefensivePositioning = defensivePositioning,
                Interceptions = interceptions,
                Marking = marking,
                Positivity = positivity,
                Positioning = positioning,
                Vision = vision,
                UpdatedAt = now
            }
        };
    }
}

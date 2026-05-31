using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

/// <summary>
/// Fixed taxonomy for the competency framework: 3 categories, 9 competencies, 35 attributes.
/// IDs are deterministic so they remain stable across migrations and environments.
/// Maps to docs/competency-framework-overview.md sections 10 and 11.2.
/// </summary>
public static class CompetencyTaxonomySeedData
{
    private static Guid Det(string token) => UserSeedData.CreateDeterministicGuid($"competency-taxonomy|{token}");

    // Categories
    public static readonly Guid CategorySkills_Id = Det("category|skills");
    public static readonly Guid CategoryPhysical_Id = Det("category|physical");
    public static readonly Guid CategoryMental_Id = Det("category|mental");

    // Competencies
    public static readonly Guid CompControlReceiving_Id = Det("competency|control-receiving");
    public static readonly Guid CompPassingDistribution_Id = Det("competency|passing-distribution");
    public static readonly Guid CompDribblingManipulation_Id = Det("competency|dribbling-manipulation");
    public static readonly Guid CompStrikingFinishing_Id = Det("competency|striking-finishing");
    public static readonly Guid CompDefendingTackling_Id = Det("competency|defending-tackling");
    public static readonly Guid CompGameIntelligence_Id = Det("competency|game-intelligence");
    public static readonly Guid CompSpeedAcceleration_Id = Det("competency|speed-acceleration");
    public static readonly Guid CompPhysicalLiteracy_Id = Det("competency|physical-literacy");
    public static readonly Guid CompMentalPsychoSocial_Id = Det("competency|mental-psychosocial");

    public static Guid AttributeId(string name) => Det($"attribute|{name.ToLowerInvariant().Replace(' ', '-')}");

    public static List<CompetencyCategory> GetCategories() => new()
    {
        new CompetencyCategory { Id = CategorySkills_Id,   Name = "Skills",   DisplayOrder = 1 },
        new CompetencyCategory { Id = CategoryPhysical_Id, Name = "Physical", DisplayOrder = 2 },
        new CompetencyCategory { Id = CategoryMental_Id,   Name = "Mental",   DisplayOrder = 3 },
    };

    public static List<Competency> GetCompetencies() => new()
    {
        new Competency { Id = CompControlReceiving_Id,     Name = "Control & Receiving",     DisplayOrder = 1 },
        new Competency { Id = CompPassingDistribution_Id,  Name = "Passing & Distribution",  DisplayOrder = 2 },
        new Competency { Id = CompDribblingManipulation_Id,Name = "Dribbling & Manipulation",DisplayOrder = 3 },
        new Competency { Id = CompStrikingFinishing_Id,    Name = "Striking & Finishing",    DisplayOrder = 4 },
        new Competency { Id = CompDefendingTackling_Id,    Name = "Defending & Tackling",    DisplayOrder = 5 },
        new Competency { Id = CompGameIntelligence_Id,     Name = "Game Intelligence",       DisplayOrder = 6 },
        new Competency { Id = CompSpeedAcceleration_Id,    Name = "Speed & Acceleration",    DisplayOrder = 7 },
        new Competency { Id = CompPhysicalLiteracy_Id,     Name = "Physical Literacy",       DisplayOrder = 8 },
        new Competency { Id = CompMentalPsychoSocial_Id,   Name = "Mental & Psycho-Social",  DisplayOrder = 9 },
    };

    /// <summary>
    /// Per spec §11.2. Order matters for DisplayOrder.
    /// </summary>
    public static List<CompetencyAttribute> GetAttributes()
    {
        var rows = new (string Name, Guid Category, Guid Competency)[]
        {
            // Skills (15)
            ("Ball Control",     CategorySkills_Id,   CompControlReceiving_Id),
            ("Crossing",         CategorySkills_Id,   CompPassingDistribution_Id),
            ("Weak Foot",        CategorySkills_Id,   CompControlReceiving_Id),
            ("Dribbling",        CategorySkills_Id,   CompDribblingManipulation_Id),
            ("Finishing",        CategorySkills_Id,   CompStrikingFinishing_Id),
            ("Free Kick",        CategorySkills_Id,   CompStrikingFinishing_Id),
            ("Heading",          CategorySkills_Id,   CompPhysicalLiteracy_Id),
            ("Long Passing",     CategorySkills_Id,   CompPassingDistribution_Id),
            ("Long Shot",        CategorySkills_Id,   CompStrikingFinishing_Id),
            ("Penalties",        CategorySkills_Id,   CompStrikingFinishing_Id),
            ("Short Passing",    CategorySkills_Id,   CompPassingDistribution_Id),
            ("Shot Power",       CategorySkills_Id,   CompStrikingFinishing_Id),
            ("Sliding Tackle",   CategorySkills_Id,   CompDefendingTackling_Id),
            ("Standing Tackle",  CategorySkills_Id,   CompDefendingTackling_Id),
            ("Volleys",          CategorySkills_Id,   CompControlReceiving_Id),
            // Physical (9)
            ("Acceleration",     CategoryPhysical_Id, CompSpeedAcceleration_Id),
            ("Agility",          CategoryPhysical_Id, CompDribblingManipulation_Id),
            ("Balance",          CategoryPhysical_Id, CompDribblingManipulation_Id),
            ("Jumping",          CategoryPhysical_Id, CompPhysicalLiteracy_Id),
            ("Pace",             CategoryPhysical_Id, CompDribblingManipulation_Id),
            ("Reactions",        CategoryPhysical_Id, CompControlReceiving_Id),
            ("Sprint Speed",     CategoryPhysical_Id, CompSpeedAcceleration_Id),
            ("Stamina",          CategoryPhysical_Id, CompPhysicalLiteracy_Id),
            ("Strength",         CategoryPhysical_Id, CompPhysicalLiteracy_Id),
            // Mental (11)
            ("Aggression",          CategoryMental_Id, CompDefendingTackling_Id),
            ("Attacking Position",  CategoryMental_Id, CompGameIntelligence_Id),
            ("Awareness",           CategoryMental_Id, CompGameIntelligence_Id),
            ("Communication",       CategoryMental_Id, CompMentalPsychoSocial_Id),
            ("Composure",           CategoryMental_Id, CompMentalPsychoSocial_Id),
            ("Defensive Positioning",CategoryMental_Id,CompGameIntelligence_Id),
            ("Interceptions",       CategoryMental_Id, CompGameIntelligence_Id),
            ("Marking",             CategoryMental_Id, CompDefendingTackling_Id),
            ("Positivity",          CategoryMental_Id, CompMentalPsychoSocial_Id),
            ("Positioning",         CategoryMental_Id, CompGameIntelligence_Id),
            ("Vision",              CategoryMental_Id, CompGameIntelligence_Id),
        };

        return rows.Select((r, i) => new CompetencyAttribute
        {
            Id = AttributeId(r.Name),
            Name = r.Name,
            CategoryId = r.Category,
            CompetencyId = r.Competency,
            DisplayOrder = i + 1,
        }).ToList();
    }

    /// <summary>
    /// Default rubric descriptions (spec §10). Reused by every system framework
    /// unless overridden during framework editing.
    /// </summary>
    public static IReadOnlyDictionary<(Guid CompetencyId, CompetencyBand Band), string> GetDefaultDescriptions() =>
        new Dictionary<(Guid, CompetencyBand), string>
        {
            { (CompControlReceiving_Id, CompetencyBand.Development),  "Controls a rolling ball with dominant foot without losing balance." },
            { (CompControlReceiving_Id, CompetencyBand.Intermediate), "Controls rolling/bouncing ball with either foot under passive pressure." },
            { (CompControlReceiving_Id, CompetencyBand.Advanced),     "Controls aerial/driven balls using multiple surfaces under active pressure." },
            { (CompControlReceiving_Id, CompetencyBand.Elite),        "Instantly kills high-velocity balls with any body part under extreme pressure." },

            { (CompPassingDistribution_Id, CompetencyBand.Development),  "Passes accurately over short distances with inside of dominant foot." },
            { (CompPassingDistribution_Id, CompetencyBand.Intermediate), "Completes short passes with both feet and also lofted passes with dominant foot." },
            { (CompPassingDistribution_Id, CompetencyBand.Advanced),     "Consistently hits varied passes with dominant foot to moving targets and short passes with non-dominant foot." },
            { (CompPassingDistribution_Id, CompetencyBand.Elite),        "Breaks defensive lines with single-touch passing and pinpoint long-range distribution." },

            { (CompDribblingManipulation_Id, CompetencyBand.Development),  "Keeps the ball within playing distance at a jogging pace." },
            { (CompDribblingManipulation_Id, CompetencyBand.Intermediate), "Changes direction/speed to bypass a static defender using basic skill moves." },
            { (CompDribblingManipulation_Id, CompetencyBand.Advanced),     "Close control at high speeds utilising dynamic feints to beat active defenders 1v1." },
            { (CompDribblingManipulation_Id, CompetencyBand.Elite),        "Flawless manipulation at maximum sprint speed using micro-touches in tight spaces." },

            { (CompStrikingFinishing_Id, CompetencyBand.Development),  "Strikes a stationary ball cleanly with the laces." },
            { (CompStrikingFinishing_Id, CompetencyBand.Intermediate), "Strikes a moving ball accurately toward the goal with the dominant foot." },
            { (CompStrikingFinishing_Id, CompetencyBand.Advanced),     "Consistently strikes with power and accuracy from various angles/distances using dominant foot and can shoot with weaker foot." },
            { (CompStrikingFinishing_Id, CompetencyBand.Elite),        "Clinical finishing with minimal backlift and exploits minute gaps from distance under duress." },

            { (CompDefendingTackling_Id, CompetencyBand.Development),  "Understands goal-side positioning and tries to recover the ball." },
            { (CompDefendingTackling_Id, CompetencyBand.Intermediate), "Executes clean standing and sliding tackles and understands body positioning." },
            { (CompDefendingTackling_Id, CompetencyBand.Advanced),     "Can tackle at speed and understands slowing opponent attacks down." },
            { (CompDefendingTackling_Id, CompetencyBand.Elite),        "Consistently organises and correctly prioritises defensive responsibilities and structures press and defensive balance." },

            { (CompGameIntelligence_Id, CompetencyBand.Development),  "Understands pitch boundaries and the direction of play." },
            { (CompGameIntelligence_Id, CompetencyBand.Intermediate), "Scans occasionally before receiving and recognises basic team shape." },
            { (CompGameIntelligence_Id, CompetencyBand.Advanced),     "Consistently scans, anticipates play to intercept and creates space off the ball." },
            { (CompGameIntelligence_Id, CompetencyBand.Elite),        "Operates two steps ahead of play, exploits blind spots continuously and dictates match tempo." },

            { (CompSpeedAcceleration_Id, CompetencyBand.Development),  "Demonstrates basic running mechanics with functional linear sprint speed, but lacks a quick burst off the mark." },
            { (CompSpeedAcceleration_Id, CompetencyBand.Intermediate), "Shows noticeable acceleration over short distances and can outpace opponents when given a running start." },
            { (CompSpeedAcceleration_Id, CompetencyBand.Advanced),     "Displays rapid acceleration from a standing start and maintains high sprint speed over distance to separate from active defenders." },
            { (CompSpeedAcceleration_Id, CompetencyBand.Elite),        "Possesses explosive first-step acceleration and elite maximum sprint speed, allowing for instant separation and rapid closing speed." },

            { (CompPhysicalLiteracy_Id, CompetencyBand.Development),  "Fundamental coordination and agility without losing balance during basic movements." },
            { (CompPhysicalLiteracy_Id, CompetencyBand.Intermediate), "Shields the ball using body frame and sustains energy through majority of training and game time." },
            { (CompPhysicalLiteracy_Id, CompetencyBand.Advanced),     "Exhibits strong core stability, contests aerial duels safely, and maintains high-intensity execution late in games." },
            { (CompPhysicalLiteracy_Id, CompetencyBand.Elite),        "Professional-academy biomechanics, elite functional strength for physical duels, and rapid recovery throughout the entire game." },

            { (CompMentalPsychoSocial_Id, CompetencyBand.Development),  "Engages willingly and follows basic coaching instructions." },
            { (CompMentalPsychoSocial_Id, CompetencyBand.Intermediate), "Shows resilience after mistakes and begins verbally interacting with teammates." },
            { (CompMentalPsychoSocial_Id, CompetencyBand.Advanced),     "Communicates tactical info clearly and remains composed under match pressure." },
            { (CompMentalPsychoSocial_Id, CompetencyBand.Elite),        "Absolute psychological resilience drives team standards and exhibits peak composure." },
        };
}

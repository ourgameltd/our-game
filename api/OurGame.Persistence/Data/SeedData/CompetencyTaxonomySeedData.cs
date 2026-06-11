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
            { (CompControlReceiving_Id, CompetencyBand.Development),  "Brings a rolling ball under control with the dominant foot while staying balanced." },
            { (CompControlReceiving_Id, CompetencyBand.Intermediate), "Controls rolling and bouncing balls with either foot under passive pressure." },
            { (CompControlReceiving_Id, CompetencyBand.Advanced),     "Cushions aerial and driven balls with multiple surfaces while under active pressure." },
            { (CompControlReceiving_Id, CompetencyBand.Elite),        "Kills high-velocity balls instantly with any surface, even under intense pressure in tight areas." },

            { (CompPassingDistribution_Id, CompetencyBand.Development),  "Plays accurate short passes with the inside of the dominant foot." },
            { (CompPassingDistribution_Id, CompetencyBand.Intermediate), "Completes short passes with both feet and lofted passes with the dominant foot." },
            { (CompPassingDistribution_Id, CompetencyBand.Advanced),     "Delivers a full range of passes to moving targets with the dominant foot, and reliable short passes with the weaker foot." },
            { (CompPassingDistribution_Id, CompetencyBand.Elite),        "Breaks defensive lines with one-touch passing and lands long-range distribution on a teammate's stride." },

            { (CompDribblingManipulation_Id, CompetencyBand.Development),  "Keeps the ball within playing distance while travelling at a jog." },
            { (CompDribblingManipulation_Id, CompetencyBand.Intermediate), "Uses changes of direction and basic skill moves to beat a static defender." },
            { (CompDribblingManipulation_Id, CompetencyBand.Advanced),     "Keeps close control at high speed and beats active defenders 1v1 with dynamic feints." },
            { (CompDribblingManipulation_Id, CompetencyBand.Elite),        "Manipulates the ball flawlessly at full sprint, using micro-touches to escape pressure in tight spaces." },

            { (CompStrikingFinishing_Id, CompetencyBand.Development),  "Strikes a stationary ball cleanly with the laces." },
            { (CompStrikingFinishing_Id, CompetencyBand.Intermediate), "Strikes a moving ball accurately at goal with the dominant foot." },
            { (CompStrikingFinishing_Id, CompetencyBand.Advanced),     "Finishes with power and accuracy from varied angles and distances, and can shoot with the weaker foot." },
            { (CompStrikingFinishing_Id, CompetencyBand.Elite),        "Finishes clinically with minimal backlift, exploiting the smallest gaps from any range under pressure." },

            { (CompDefendingTackling_Id, CompetencyBand.Development),  "Understands goal-side positioning and works to win the ball back." },
            { (CompDefendingTackling_Id, CompetencyBand.Intermediate), "Times standing and sliding tackles cleanly with good body positioning." },
            { (CompDefendingTackling_Id, CompetencyBand.Advanced),     "Tackles safely at speed and knows when to delay and slow an opponent's attack." },
            { (CompDefendingTackling_Id, CompetencyBand.Elite),        "Organises the defensive unit, prioritising threats and structuring the press and rest-defence." },

            { (CompGameIntelligence_Id, CompetencyBand.Development),  "Knows the pitch boundaries and which way their team is playing." },
            { (CompGameIntelligence_Id, CompetencyBand.Intermediate), "Scans before receiving some of the time and recognises basic team shape." },
            { (CompGameIntelligence_Id, CompetencyBand.Advanced),     "Scans constantly, anticipates play to intercept, and creates space with off-ball movement." },
            { (CompGameIntelligence_Id, CompetencyBand.Elite),        "Plays two steps ahead — exploits blind spots, manipulates opponents and dictates the tempo of the match." },

            { (CompSpeedAcceleration_Id, CompetencyBand.Development),  "Runs with sound basic mechanics but lacks a quick burst off the mark." },
            { (CompSpeedAcceleration_Id, CompetencyBand.Intermediate), "Accelerates noticeably over short distances and outpaces opponents with a running start." },
            { (CompSpeedAcceleration_Id, CompetencyBand.Advanced),     "Explodes from a standing start and holds high sprint speed over distance to separate from defenders." },
            { (CompSpeedAcceleration_Id, CompetencyBand.Elite),        "First-step explosion and elite top speed create instant separation and rapid recovery runs." },

            { (CompPhysicalLiteracy_Id, CompetencyBand.Development),  "Shows fundamental coordination and agility, staying balanced through basic movements." },
            { (CompPhysicalLiteracy_Id, CompetencyBand.Intermediate), "Shields the ball with the body and sustains energy through most of training and matches." },
            { (CompPhysicalLiteracy_Id, CompetencyBand.Advanced),     "Strong core stability, competes safely in aerial duels and maintains intensity late into games." },
            { (CompPhysicalLiteracy_Id, CompetencyBand.Elite),        "Academy-level movement mechanics, dominant in physical duels and recovers rapidly between efforts." },

            { (CompMentalPsychoSocial_Id, CompetencyBand.Development),  "Engages willingly and follows basic coaching instructions." },
            { (CompMentalPsychoSocial_Id, CompetencyBand.Intermediate), "Bounces back from mistakes and starts to talk with teammates during play." },
            { (CompMentalPsychoSocial_Id, CompetencyBand.Advanced),     "Communicates tactical information clearly and stays composed under match pressure." },
            { (CompMentalPsychoSocial_Id, CompetencyBand.Elite),        "Sets and drives team standards with complete composure and psychological resilience." },
        };
}

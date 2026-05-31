#nullable disable
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

/// <summary>
/// Six default tactical frameworks. Each framework is defined as a per-format
/// allocation across the 9 competencies (summing to 100). Attribute weights are
/// derived by dividing each competency allocation evenly across the attributes
/// mapped to it, with rounding residue distributed to the first attributes in
/// display order so every format's grand total is exactly 100.
/// </summary>
public static class SystemCompetencyFrameworkSeed
{
    public static readonly Guid Balanced_Id    = Det("system|framework|balanced");
    public static readonly Guid Tikitaka_Id    = Det("system|framework|tikitaka");
    public static readonly Guid Gegenpress_Id  = Det("system|framework|gegenpress");
    public static readonly Guid LongBall_Id    = Det("system|framework|long-ball");
    public static readonly Guid Physical_Id    = Det("system|framework|physical");
    public static readonly Guid SkillBased_Id  = Det("system|framework|skill-based");

    private static Guid Det(string token) => UserSeedData.CreateDeterministicGuid(token);

    /// <summary>
    /// Per-format competency allocations. The 9 numbers in each row are the totals
    /// (out of 100) for: ControlReceiving, PassingDistribution, DribblingManipulation,
    /// StrikingFinishing, DefendingTackling, GameIntelligence, SpeedAcceleration,
    /// PhysicalLiteracy, MentalPsychoSocial — in that order. Each row sums to 100.
    /// </summary>
    private sealed record FrameworkDefinition(
        Guid Id,
        string Name,
        string Description,
        Dictionary<GameFormat, int[]> Allocations);

    private static readonly Guid[] CompetencyOrder = new[]
    {
        CompetencyTaxonomySeedData.CompControlReceiving_Id,
        CompetencyTaxonomySeedData.CompPassingDistribution_Id,
        CompetencyTaxonomySeedData.CompDribblingManipulation_Id,
        CompetencyTaxonomySeedData.CompStrikingFinishing_Id,
        CompetencyTaxonomySeedData.CompDefendingTackling_Id,
        CompetencyTaxonomySeedData.CompGameIntelligence_Id,
        CompetencyTaxonomySeedData.CompSpeedAcceleration_Id,
        CompetencyTaxonomySeedData.CompPhysicalLiteracy_Id,
        CompetencyTaxonomySeedData.CompMentalPsychoSocial_Id,
    };

    private static readonly FrameworkDefinition[] Definitions = new[]
    {
        // Balanced: mirrors the spec workbook §4.4 distribution.
        new FrameworkDefinition(Balanced_Id, "Balanced",
            "All-round profile that matches the original Grassroot Football Competency Framework distribution. Skill emphasis shifts down and mental emphasis up as the format grows.",
            new Dictionary<GameFormat, int[]>
            {
                { GameFormat.FiveASide,   new[] { 18, 7, 24, 9,  6,  5,  10, 14,  7 } },
                { GameFormat.SevenASide,  new[] { 14, 8, 18, 8,  7,  10, 9,  12, 14 } },
                { GameFormat.NineASide,   new[] { 11, 9, 15, 7,  9,  15, 8,  10, 16 } },
                { GameFormat.ElevenASide, new[] { 8,  9, 13, 3,  10, 25, 7,  17, 8  } },
            }),

        // Tikitaka: passing, control, intelligence dominate. Less defending, less physical.
        new FrameworkDefinition(Tikitaka_Id, "Tiki-Taka",
            "Possession-based football. Passing, control and game intelligence dominate. Less emphasis on raw physicality.",
            new Dictionary<GameFormat, int[]>
            {
                { GameFormat.FiveASide,   new[] { 20, 22, 16, 8,  4,  14, 4,  6,  6 } },
                { GameFormat.SevenASide,  new[] { 18, 22, 14, 8,  4,  18, 4,  6,  6 } },
                { GameFormat.NineASide,   new[] { 16, 22, 12, 6,  4,  22, 4,  6,  8 } },
                { GameFormat.ElevenASide, new[] { 14, 22, 10, 6,  4,  26, 4,  6,  8 } },
            }),

        // Gegenpress: aggressive recovery. Defending, speed, stamina dominate.
        new FrameworkDefinition(Gegenpress_Id, "Gegenpress",
            "High-intensity counter-pressing. Defending, speed and physical literacy dominate, with strong mental discipline.",
            new Dictionary<GameFormat, int[]>
            {
                { GameFormat.FiveASide,   new[] { 10, 8,  12, 6,  18, 10, 14, 16, 6  } },
                { GameFormat.SevenASide,  new[] { 8,  8,  10, 6,  20, 12, 14, 16, 6  } },
                { GameFormat.NineASide,   new[] { 8,  8,  10, 6,  20, 14, 12, 16, 6  } },
                { GameFormat.ElevenASide, new[] { 6,  8,  8,  6,  22, 16, 12, 16, 6  } },
            }),

        // Long ball: direct play. Striking, physicality, speed dominate.
        new FrameworkDefinition(LongBall_Id, "Long Ball",
            "Direct, vertical football. Heavy on striking, long passing, physical strength and pace.",
            new Dictionary<GameFormat, int[]>
            {
                { GameFormat.FiveASide,   new[] { 6,  16, 6,  20, 10, 6,  14, 16, 6  } },
                { GameFormat.SevenASide,  new[] { 6,  18, 6,  20, 10, 8,  12, 14, 6  } },
                { GameFormat.NineASide,   new[] { 6,  18, 6,  20, 10, 10, 12, 12, 6  } },
                { GameFormat.ElevenASide, new[] { 6,  20, 6,  20, 10, 10, 10, 12, 6  } },
            }),

        // Physical: ~50% of total on physical category + mental discipline.
        new FrameworkDefinition(Physical_Id, "Physical",
            "Maximises raw physical attributes and mental resilience. Suited to direct, athletic teams.",
            new Dictionary<GameFormat, int[]>
            {
                { GameFormat.FiveASide,   new[] { 6,  6,  8,  6,  12, 6,  18, 26, 12 } },
                { GameFormat.SevenASide,  new[] { 6,  6,  8,  6,  12, 8,  18, 24, 12 } },
                { GameFormat.NineASide,   new[] { 6,  6,  8,  6,  10, 10, 18, 24, 12 } },
                { GameFormat.ElevenASide, new[] { 6,  6,  6,  6,  10, 12, 18, 24, 12 } },
            }),

        // Skill-based: technical excellence above all. Skills category ~55-60%.
        new FrameworkDefinition(SkillBased_Id, "Skill-Based",
            "Maximises technical skill. Heavy on control, dribbling, striking and passing. De-emphasises physical category.",
            new Dictionary<GameFormat, int[]>
            {
                { GameFormat.FiveASide,   new[] { 18, 14, 18, 14, 6,  10, 4,  8,  8  } },
                { GameFormat.SevenASide,  new[] { 16, 14, 16, 14, 6,  14, 4,  8,  8  } },
                { GameFormat.NineASide,   new[] { 14, 14, 14, 14, 6,  16, 4,  8,  10 } },
                { GameFormat.ElevenASide, new[] { 12, 14, 12, 14, 6,  18, 4,  10, 10 } },
            }),
    };

    public static List<CompetencyFramework> GetFrameworks()
    {
        var now = DateTime.UtcNow;
        return Definitions.Select(d => new CompetencyFramework
        {
            Id = d.Id,
            Name = d.Name,
            Description = d.Description,
            IsSystemDefault = true,
            Scope = CompetencyFrameworkScope.System,
            UpliftPercent = 5m,
            IsArchived = false,
            CreatedAt = now,
            UpdatedAt = now,
        }).ToList();
    }

    public static List<CompetencyFrameworkBandThreshold> GetBandThresholds()
    {
        return Definitions.SelectMany(d => new[]
        {
            (d.Id, CompetencyBand.Development, 18m),
            (d.Id, CompetencyBand.Intermediate, 35m),
            (d.Id, CompetencyBand.Advanced, 52m),
            (d.Id, CompetencyBand.Elite, 70m),
        })
        .Select(t => new CompetencyFrameworkBandThreshold
        {
            Id = UserSeedData.CreateDeterministicGuid($"system|threshold|{t.Id}|{t.Item2}"),
            FrameworkId = t.Id,
            Band = t.Item2,
            Threshold = t.Item3,
        }).ToList();
    }

    public static List<CompetencyFrameworkCompetencyDescription> GetCompetencyDescriptions()
    {
        var defaults = CompetencyTaxonomySeedData.GetDefaultDescriptions();
        return Definitions.SelectMany(d => defaults.Select(kv => new CompetencyFrameworkCompetencyDescription
        {
            Id = UserSeedData.CreateDeterministicGuid($"system|description|{d.Id}|{kv.Key.CompetencyId}|{kv.Key.Band}"),
            FrameworkId = d.Id,
            CompetencyId = kv.Key.CompetencyId,
            Band = kv.Key.Band,
            Description = kv.Value,
        })).ToList();
    }

    public static List<CompetencyFrameworkAttributeWeight> GetAttributeWeights()
    {
        var attributes = CompetencyTaxonomySeedData.GetAttributes();
        var attrsByCompetency = attributes.GroupBy(a => a.CompetencyId).ToDictionary(g => g.Key, g => g.OrderBy(a => a.DisplayOrder).ToList());

        var rows = new List<CompetencyFrameworkAttributeWeight>();
        foreach (var def in Definitions)
        {
            foreach (var (format, allocation) in def.Allocations)
            {
                AssertSumIs100(def.Name, format, allocation);

                for (int i = 0; i < CompetencyOrder.Length; i++)
                {
                    var competencyId = CompetencyOrder[i];
                    var competencyTotal = allocation[i];
                    var attrs = attrsByCompetency[competencyId];
                    var n = attrs.Count;
                    if (n == 0) continue;

                    // Distribute competencyTotal across n attributes (integer split).
                    var basePer = competencyTotal / n;
                    var residue = competencyTotal - (basePer * n);

                    for (int j = 0; j < n; j++)
                    {
                        var w = basePer + (j < residue ? 1 : 0);
                        rows.Add(new CompetencyFrameworkAttributeWeight
                        {
                            Id = UserSeedData.CreateDeterministicGuid($"system|weight|{def.Id}|{format}|{attrs[j].Id}"),
                            FrameworkId = def.Id,
                            AttributeId = attrs[j].Id,
                            Format = format,
                            WeightPercent = w,
                        });
                    }
                }
            }
        }
        return rows;
    }

    private static void AssertSumIs100(string frameworkName, GameFormat format, int[] allocation)
    {
        if (allocation.Length != 9)
            throw new InvalidOperationException($"Framework '{frameworkName}' format {format} must have 9 allocations.");
        var sum = allocation.Sum();
        if (sum != 100)
            throw new InvalidOperationException($"Framework '{frameworkName}' format {format} allocation sums to {sum}, must be 100.");
    }
}

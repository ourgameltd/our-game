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
    /// GoalkeeperAllocations use the same competency order under the GK 1-to-1 mapping:
    /// Handling, Distribution, ShotStopping, Aerial, 1v1s, Positioning, Agility,
    /// PhysicalPower, Communication.
    /// </summary>
    private sealed record FrameworkDefinition(
        Guid Id,
        string Name,
        string Description,
        Dictionary<GameFormat, int[]> Allocations,
        Dictionary<GameFormat, int[]> GoalkeeperAllocations);

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
        // Balanced: all-round development. Skills lead at small formats; intelligence and
        // mental weight grow smoothly toward 11-a-side (no category drops away suddenly).
        new FrameworkDefinition(Balanced_Id, "Balanced",
            "A well-rounded development profile based on the Grassroot Football Competency Framework. Technical skills lead at small-sided formats, with game intelligence and mental qualities growing in weight as players progress to the full-sided game.",
            new Dictionary<GameFormat, int[]>
            {
                { GameFormat.FiveASide,   new[] { 18, 8,  22, 9,  6,  6,  10, 14, 7  } },
                { GameFormat.SevenASide,  new[] { 14, 9,  18, 8,  8,  10, 9,  12, 12 } },
                { GameFormat.NineASide,   new[] { 11, 10, 14, 7,  9,  15, 8,  11, 15 } },
                { GameFormat.ElevenASide, new[] { 9,  10, 11, 6,  10, 20, 7,  12, 15 } },
            },
            // GK: shot stopping and handling lead at smaller formats; aerial dominance
            // and positioning grow heavily in the 11-a-side game.
            new Dictionary<GameFormat, int[]>
            {
                { GameFormat.FiveASide,   new[] { 18, 8,  22, 6,  10, 6,  12, 10, 8  } },
                { GameFormat.SevenASide,  new[] { 16, 10, 18, 8,  10, 8,  10, 10, 10 } },
                { GameFormat.NineASide,   new[] { 14, 12, 16, 10, 10, 12, 8,  10, 8  } },
                { GameFormat.ElevenASide, new[] { 12, 12, 14, 12, 10, 14, 8,  10, 8  } },
            }),

        // Tikitaka: passing held at 22 across all formats; control tapers as
        // intelligence rises. Speed/physical deliberately minimal throughout.
        new FrameworkDefinition(Tikitaka_Id, "Tiki-Taka",
            "Possession-first football built on short passing, first-touch control and constant scanning. Rewards players who keep the ball under pressure and find the spare man; raw pace and physicality are deliberately secondary.",
            new Dictionary<GameFormat, int[]>
            {
                { GameFormat.FiveASide,   new[] { 22, 22, 16, 6,  4,  14, 4,  6,  6 } },
                { GameFormat.SevenASide,  new[] { 20, 22, 14, 6,  4,  18, 4,  6,  6 } },
                { GameFormat.NineASide,   new[] { 17, 22, 12, 6,  4,  21, 4,  6,  8 } },
                { GameFormat.ElevenASide, new[] { 14, 22, 10, 6,  4,  26, 4,  6,  8 } },
            },
            // GK (sweeper keeper): distribution held at 22; sweeping 1v1s and tactical
            // positioning rewarded over raw athleticism.
            new Dictionary<GameFormat, int[]>
            {
                { GameFormat.FiveASide,   new[] { 14, 22, 16, 4,  14, 14, 6,  4,  6 } },
                { GameFormat.SevenASide,  new[] { 12, 22, 14, 6,  14, 16, 6,  4,  6 } },
                { GameFormat.NineASide,   new[] { 10, 22, 12, 8,  14, 18, 6,  4,  6 } },
                { GameFormat.ElevenASide, new[] { 8,  22, 12, 6,  14, 20, 6,  4,  8 } },
            }),

        // Gegenpress: defending and pressing intelligence climb with format size;
        // physical literacy fixed at 16 and mental at 8 (pressing discipline).
        new FrameworkDefinition(Gegenpress_Id, "Gegenpress",
            "High-intensity pressing and rapid ball recovery. Prioritises defensive duels, repeat-sprint capacity and the discipline to press as a unit — players must win the ball back fast and go again.",
            new Dictionary<GameFormat, int[]>
            {
                { GameFormat.FiveASide,   new[] { 10, 8,  12, 6,  18, 8,  14, 16, 8  } },
                { GameFormat.SevenASide,  new[] { 8,  8,  10, 6,  20, 10, 14, 16, 8  } },
                { GameFormat.NineASide,   new[] { 8,  8,  8,  6,  20, 13, 13, 16, 8  } },
                { GameFormat.ElevenASide, new[] { 6,  8,  6,  6,  22, 16, 12, 16, 8  } },
            },
            // GK (aggressive): sweeping 1v1s, agility and aggressive starting positions
            // to clean up long balls over the top of a pressing team.
            new Dictionary<GameFormat, int[]>
            {
                { GameFormat.FiveASide,   new[] { 10, 10, 12, 6,  18, 10, 14, 10, 10 } },
                { GameFormat.SevenASide,  new[] { 10, 10, 10, 6,  18, 12, 14, 10, 10 } },
                { GameFormat.NineASide,   new[] { 8,  10, 10, 8,  20, 14, 12, 10, 8  } },
                { GameFormat.ElevenASide, new[] { 8,  10, 8,  10, 20, 16, 12, 10, 6  } },
            }),

        // Long ball: striking and physical (aerial) emphasis stay high at large
        // formats where direct play depends on winning the second ball.
        new FrameworkDefinition(LongBall_Id, "Long Ball",
            "Direct, vertical football that moves the ball forward early. Built on long-range distribution, clinical finishing, aerial strength and the pace to chase the channels.",
            new Dictionary<GameFormat, int[]>
            {
                { GameFormat.FiveASide,   new[] { 6,  14, 6,  20, 10, 6,  14, 18, 6  } },
                { GameFormat.SevenASide,  new[] { 6,  16, 6,  20, 10, 8,  12, 16, 6  } },
                { GameFormat.NineASide,   new[] { 6,  18, 6,  18, 10, 10, 11, 15, 6  } },
                { GameFormat.ElevenASide, new[] { 6,  20, 6,  18, 10, 10, 9,  15, 6  } },
            },
            // GK (traditional): massive distribution to bypass the midfield, aerial
            // dominance to relieve pressure from crosses, and pure physical power.
            new Dictionary<GameFormat, int[]>
            {
                { GameFormat.FiveASide,   new[] { 10, 16, 14, 10, 6,  8,  10, 16, 10 } },
                { GameFormat.SevenASide,  new[] { 10, 18, 12, 12, 6,  8,  8,  16, 10 } },
                { GameFormat.NineASide,   new[] { 8,  20, 10, 16, 6,  8,  8,  14, 10 } },
                { GameFormat.ElevenASide, new[] { 8,  22, 10, 18, 6,  8,  8,  14, 6  } },
            }),

        // Physical: speed + physical literacy + mental resilience ≈ 52-56% across
        // formats; technical categories pinned at the floor.
        new FrameworkDefinition(Physical_Id, "Physical",
            "An athletic development profile that puts speed, strength, stamina and resilience first. Suited to teams who out-run and out-muscle opponents, with technique developed on top of a powerful physical base.",
            new Dictionary<GameFormat, int[]>
            {
                { GameFormat.FiveASide,   new[] { 6,  6,  8,  6,  12, 6,  18, 26, 12 } },
                { GameFormat.SevenASide,  new[] { 6,  6,  8,  6,  12, 8,  18, 24, 12 } },
                { GameFormat.NineASide,   new[] { 6,  6,  6,  6,  12, 10, 18, 24, 12 } },
                { GameFormat.ElevenASide, new[] { 6,  6,  6,  6,  12, 12, 16, 24, 12 } },
            },
            // GK (athletic): vertical leaps, fast-twitch reflexes and physical box
            // domination over pure technique.
            new Dictionary<GameFormat, int[]>
            {
                { GameFormat.FiveASide,   new[] { 8,  6,  12, 8,  10, 6,  18, 20, 12 } },
                { GameFormat.SevenASide,  new[] { 8,  6,  12, 10, 10, 6,  18, 18, 12 } },
                { GameFormat.NineASide,   new[] { 8,  6,  10, 12, 10, 8,  16, 18, 12 } },
                { GameFormat.ElevenASide, new[] { 8,  6,  10, 14, 10, 10, 14, 18, 10 } },
            }),

        // Skill-based: the four technical competencies carry ~68% at 5-a-side,
        // tapering to ~53% at 11-a-side as game intelligence takes over.
        new FrameworkDefinition(SkillBased_Id, "Skill-Based",
            "A technique-first profile that maximises time on the ball. Control, dribbling, striking and passing carry most of the weight, developing confident ball-players before physical outcomes.",
            new Dictionary<GameFormat, int[]>
            {
                { GameFormat.FiveASide,   new[] { 20, 14, 20, 14, 4,  8,  4,  8,  8  } },
                { GameFormat.SevenASide,  new[] { 18, 14, 18, 14, 4,  12, 4,  8,  8  } },
                { GameFormat.NineASide,   new[] { 15, 14, 15, 14, 5,  15, 4,  8,  10 } },
                { GameFormat.ElevenASide, new[] { 13, 14, 13, 13, 5,  18, 4,  10, 10 } },
            },
            // GK (technical): textbook handling (W-catches), clean footwork and perfect
            // diving technique rather than relying on athleticism.
            new Dictionary<GameFormat, int[]>
            {
                { GameFormat.FiveASide,   new[] { 20, 14, 20, 10, 8,  8,  6,  6,  8  } },
                { GameFormat.SevenASide,  new[] { 18, 14, 18, 10, 8,  10, 6,  6,  10 } },
                { GameFormat.NineASide,   new[] { 16, 14, 16, 12, 8,  12, 6,  6,  10 } },
                { GameFormat.ElevenASide, new[] { 14, 14, 14, 14, 8,  14, 6,  6,  10 } },
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
        var goalkeeper = CompetencyTaxonomySeedData.GetGoalkeeperDescriptions();
        return Definitions.SelectMany(d =>
            defaults.Select(kv => new CompetencyFrameworkCompetencyDescription
            {
                Id = UserSeedData.CreateDeterministicGuid($"system|description|{d.Id}|{kv.Key.CompetencyId}|{kv.Key.Band}"),
                FrameworkId = d.Id,
                CompetencyId = kv.Key.CompetencyId,
                Band = kv.Key.Band,
                Description = kv.Value,
                IsGoalkeeper = false,
            })
            .Concat(goalkeeper.Select(kv => new CompetencyFrameworkCompetencyDescription
            {
                Id = UserSeedData.CreateDeterministicGuid($"system|description|gk|{d.Id}|{kv.Key.CompetencyId}|{kv.Key.Band}"),
                FrameworkId = d.Id,
                CompetencyId = kv.Key.CompetencyId,
                Band = kv.Key.Band,
                Description = kv.Value,
                IsGoalkeeper = true,
            }))).ToList();
    }

    public static List<CompetencyFrameworkAttributeWeight> GetAttributeWeights()
    {
        var attributes = CompetencyTaxonomySeedData.GetAttributes();
        var attrsByCompetency = attributes.GroupBy(a => a.CompetencyId).ToDictionary(g => g.Key, g => g.OrderBy(a => a.DisplayOrder).ToList());

        var rows = new List<CompetencyFrameworkAttributeWeight>();
        foreach (var def in Definitions)
        {
            AddWeightRows(rows, def.Id, def.Name, def.Allocations, attrsByCompetency, isGoalkeeper: false);
            AddWeightRows(rows, def.Id, def.Name, def.GoalkeeperAllocations, attrsByCompetency, isGoalkeeper: true);
        }
        return rows;
    }

    private static void AddWeightRows(
        List<CompetencyFrameworkAttributeWeight> rows,
        Guid frameworkId,
        string frameworkName,
        Dictionary<GameFormat, int[]> allocations,
        Dictionary<Guid, List<CompetencyAttribute>> attrsByCompetency,
        bool isGoalkeeper)
    {
        var tokenPrefix = isGoalkeeper ? "system|weight|gk" : "system|weight";
        foreach (var (format, allocation) in allocations)
        {
            AssertSumIs100(frameworkName, format, allocation);

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
                        Id = UserSeedData.CreateDeterministicGuid($"{tokenPrefix}|{frameworkId}|{format}|{attrs[j].Id}"),
                        FrameworkId = frameworkId,
                        AttributeId = attrs[j].Id,
                        Format = format,
                        WeightPercent = w,
                        IsGoalkeeper = isGoalkeeper,
                    });
                }
            }
        }
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

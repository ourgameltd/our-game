using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class TacticPrincipleSeedData
{
    public static List<TacticPrinciple> GetTacticPrinciples()
    {
        // TODO: TacticPrinciple is actually linked to Formation, not Tactic
        // Model has: Id, FormationId, Title, Description, PositionIndices (no TacticId, Category, Principle, Priority)
        // Need to rethink the seeding strategy to link principles to formations instead
        return new List<TacticPrinciple>();
    }
}

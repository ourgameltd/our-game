using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class SimilarProfessionalSeedData
{
    public static List<SimilarProfessional> GetSimilarProfessionals()
    {
        return new List<SimilarProfessional>
        {
            // Similar professionals for Oliver Thompson (Goalkeeper)
            new SimilarProfessional
            {
                Id = Guid.NewGuid(),
                ReportId = PlayerReportSeedData.Report1_Id,
                Name = "Angus Gunn",
                Team = "Norwich City",
                Position = "GK",
                Reason = "Similar shot-stopping reflexes and distribution style. Good model for development at this age."
            },
            new SimilarProfessional
            {
                Id = Guid.NewGuid(),
                ReportId = PlayerReportSeedData.Report1_Id,
                Name = "Zander Clark",
                Team = "Heart of Midlothian",
                Position = "GK",
                Reason = "Excellent positioning and communication skills - areas Oliver can learn from."
            },
            // Similar professionals for James Wilson (Center Back)
            new SimilarProfessional
            {
                Id = Guid.NewGuid(),
                ReportId = PlayerReportSeedData.Report2_Id,
                Name = "Jack Hendry",
                Team = "Al-Ettifaq",
                Position = "CB",
                Reason = "Strong in the air, good reading of the game, natural leadership qualities."
            },
            new SimilarProfessional
            {
                Id = Guid.NewGuid(),
                ReportId = PlayerReportSeedData.Report2_Id,
                Name = "Liam Cooper",
                Team = "Leeds United",
                Position = "CB",
                Reason = "Defensive organization and communication - key attributes James is developing."
            },
            // Similar professionals for Noah Anderson (Striker)
            new SimilarProfessional
            {
                Id = Guid.NewGuid(),
                ReportId = PlayerReportSeedData.Report3_Id,
                Name = "Lawrence Shankland",
                Team = "Heart of Midlothian",
                Position = "ST",
                Reason = "Clinical finisher with excellent movement in the box. Good positioning sense."
            },
            new SimilarProfessional
            {
                Id = Guid.NewGuid(),
                ReportId = PlayerReportSeedData.Report3_Id,
                Name = "Kyogo Furuhashi",
                Team = "Celtic",
                Position = "ST",
                Reason = "Pace, movement, and instinctive finishing - areas Noah excels in."
            }
        };
    }
}

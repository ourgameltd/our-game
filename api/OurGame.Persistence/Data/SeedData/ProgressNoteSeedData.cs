using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class ProgressNoteSeedData
{
    public static List<ProgressNote> GetProgressNotes()
    {
        return new List<ProgressNote>
        {
            // Progress notes for Carlos Silva's training plan
            new ProgressNote
            {
                Id = Guid.NewGuid(),
                PlanId = TrainingPlanSeedData.Plan1_CarlosSilva_Id,
                NoteDate = new DateTime(2024, 12, 5, 0, 0, 0, DateTimeKind.Utc),
                Note = "Carlos showing good commitment to extra training. Attended first heading session and demonstrated willingness to work on weaknesses.",
                AddedBy = CoachSeedData.MichaelRobertson_Id
            },
            new ProgressNote
            {
                Id = Guid.NewGuid(),
                PlanId = TrainingPlanSeedData.Plan1_CarlosSilva_Id,
                NoteDate = new DateTime(2024, 12, 6, 0, 0, 0, DateTimeKind.Utc),
                Note = "Gym session completed. Good effort on leg strengthening exercises. Will help with aerial duels and overall physicality.",
                AddedBy = CoachSeedData.EmmaWilson_Id
            },
            // Progress notes for Noah Anderson's training plan
            new ProgressNote
            {
                Id = Guid.NewGuid(),
                PlanId = TrainingPlanSeedData.Plan2_MasonEvans_Id,
                NoteDate = new DateTime(2024, 12, 7, 0, 0, 0, DateTimeKind.Utc),
                Note = "Noah worked well on weak foot drills today. Starting to show more confidence using his left foot in tight spaces.",
                AddedBy = CoachSeedData.MichaelRobertson_Id
            }
        };
    }
}

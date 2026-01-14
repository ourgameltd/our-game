using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class EmergencyContactSeedData
{
    public static List<EmergencyContact> GetEmergencyContacts()
    {
        return new List<EmergencyContact>
        {
            // Oliver Thompson's contacts
            new EmergencyContact
            {
                Id = Guid.NewGuid(),
                PlayerId = PlayerSeedData.OliverThompson_Id,
                Name = "Sarah Thompson",
                Phone = "+44 7890 123456",
                Relationship = "Mother",
                IsPrimary = true
            },
            new EmergencyContact
            {
                Id = Guid.NewGuid(),
                PlayerId = PlayerSeedData.OliverThompson_Id,
                Name = "David Thompson",
                Phone = "+44 7891 234567",
                Relationship = "Father",
                IsPrimary = false
            },
            // James Wilson's contacts
            new EmergencyContact
            {
                Id = Guid.NewGuid(),
                PlayerId = PlayerSeedData.JamesWilson_Id,
                Name = "Emma Wilson",
                Phone = "+44 7892 345678",
                Relationship = "Mother",
                IsPrimary = true
            },
            new EmergencyContact
            {
                Id = Guid.NewGuid(),
                PlayerId = PlayerSeedData.JamesWilson_Id,
                Name = "Robert Wilson",
                Phone = "+44 7893 456789",
                Relationship = "Father",
                IsPrimary = false
            },
            // George Harris's contacts
            new EmergencyContact
            {
                Id = Guid.NewGuid(),
                PlayerId = PlayerSeedData.GeorgeHarris_Id,
                Name = "Lisa Harris",
                Phone = "+44 7894 567890",
                Relationship = "Mother",
                IsPrimary = true
            },
            new EmergencyContact
            {
                Id = Guid.NewGuid(),
                PlayerId = PlayerSeedData.GeorgeHarris_Id,
                Name = "Michael Harris",
                Phone = "+44 7895 678901",
                Relationship = "Father",
                IsPrimary = false
            },
            // Ethan Davies's contacts
            new EmergencyContact
            {
                Id = Guid.NewGuid(),
                PlayerId = PlayerSeedData.EthanDavies_Id,
                Name = "Claire Davies",
                Phone = "+44 7896 789012",
                Relationship = "Mother",
                IsPrimary = true
            },
            // Noah Anderson's contacts
            new EmergencyContact
            {
                Id = Guid.NewGuid(),
                PlayerId = PlayerSeedData.NoahAnderson_Id,
                Name = "Rachel Anderson",
                Phone = "+44 7897 890123",
                Relationship = "Mother",
                IsPrimary = true
            },
            new EmergencyContact
            {
                Id = Guid.NewGuid(),
                PlayerId = PlayerSeedData.NoahAnderson_Id,
                Name = "Peter Anderson",
                Phone = "+44 7898 901234",
                Relationship = "Father",
                IsPrimary = false
            }
        };
    }
}

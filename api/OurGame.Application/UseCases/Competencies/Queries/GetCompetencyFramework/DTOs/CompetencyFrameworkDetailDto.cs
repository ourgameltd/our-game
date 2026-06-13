using OurGame.Persistence.Enums;

namespace OurGame.Application.UseCases.Competencies.Queries.GetCompetencyFramework.DTOs;

public class CompetencyFrameworkDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsSystemDefault { get; set; }
    public CompetencyFrameworkScope Scope { get; set; }
    public Guid? OwnerClubId { get; set; }
    public Guid? OwnerAgeGroupId { get; set; }
    public Guid? OwnerTeamId { get; set; }
    public Guid? SourceFrameworkId { get; set; }
    public decimal UpliftPercent { get; set; }

    public List<BandThresholdDto> BandThresholds { get; set; } = new();
    public List<CategoryWeightDto> Categories { get; set; } = new();
    public List<CompetencyDescriptionDto> CompetencyDescriptions { get; set; } = new();
}

public class BandThresholdDto
{
    public CompetencyBand Band { get; set; }
    public decimal Threshold { get; set; }
}

public class CategoryWeightDto
{
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public List<AttributeWeightDto> Attributes { get; set; } = new();
}

public class AttributeWeightDto
{
    public Guid AttributeId { get; set; }
    public string AttributeName { get; set; } = string.Empty;
    public string? AttributeGoalkeeperName { get; set; }
    public Guid CompetencyId { get; set; }
    public string CompetencyName { get; set; } = string.Empty;
    public string? CompetencyGoalkeeperName { get; set; }
    public int DisplayOrder { get; set; }
    public Dictionary<GameFormat, int> WeightsByFormat { get; set; } = new();
    public Dictionary<GameFormat, int> GoalkeeperWeightsByFormat { get; set; } = new();
}

public class CompetencyDescriptionDto
{
    public Guid CompetencyId { get; set; }
    public string CompetencyName { get; set; } = string.Empty;
    public string? CompetencyGoalkeeperName { get; set; }
    public int DisplayOrder { get; set; }
    public Dictionary<CompetencyBand, string> Descriptions { get; set; } = new();
    public Dictionary<CompetencyBand, string> GoalkeeperDescriptions { get; set; } = new();
}

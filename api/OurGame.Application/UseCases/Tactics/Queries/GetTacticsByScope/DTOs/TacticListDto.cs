namespace OurGame.Application.UseCases.Tactics.Queries.GetTacticsByScope.DTOs;

/// <summary>
/// DTO for tactic list item
/// </summary>
public class TacticListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? Style { get; set; }
    public int SquadSize { get; set; }
    public Guid? ParentFormationId { get; set; }
    public string? ParentFormationName { get; set; }
    public TacticScopeDto Scope { get; set; } = new();
    public List<string> Tags { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO representing the scope of a tactic
/// </summary>
public class TacticScopeDto
{
    public string Type { get; set; } = string.Empty;
    public Guid? ClubId { get; set; }
    public Guid? AgeGroupId { get; set; }
    public Guid? TeamId { get; set; }
}

/// <summary>
/// Response containing tactics grouped by scope level
/// </summary>
public class TacticsByScopeResponseDto
{
    /// <summary>
    /// Tactics defined at the current scope level
    /// </summary>
    public List<TacticListDto> ScopeTactics { get; set; } = new();
    
    /// <summary>
    /// Tactics inherited from parent scopes (club or age group level)
    /// </summary>
    public List<TacticListDto> InheritedTactics { get; set; } = new();
}

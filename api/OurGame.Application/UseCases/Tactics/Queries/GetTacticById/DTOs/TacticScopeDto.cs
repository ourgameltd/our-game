namespace OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;

/// <summary>
/// DTO representing the scope assignments for a tactic
/// </summary>
public class TacticScopeDto
{
    public List<Guid> ClubIds { get; set; } = new();
    public List<Guid> AgeGroupIds { get; set; } = new();
    public List<Guid> TeamIds { get; set; } = new();
}

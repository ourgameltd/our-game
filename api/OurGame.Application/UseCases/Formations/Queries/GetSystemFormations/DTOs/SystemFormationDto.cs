namespace OurGame.Application.UseCases.Formations.Queries.GetSystemFormations.DTOs;

/// <summary>
/// Read model for a system formation used by tactic selection and pitch rendering.
/// </summary>
public class SystemFormationDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? System { get; set; }
    public int SquadSize { get; set; }
    public string? Summary { get; set; }
    public List<string> Tags { get; set; } = new();
    public List<SystemFormationPositionDto> Positions { get; set; } = new();
}
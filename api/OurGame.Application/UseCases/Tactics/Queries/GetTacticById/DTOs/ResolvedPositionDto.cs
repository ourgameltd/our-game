namespace OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;

/// <summary>
/// Represents a fully resolved position with inheritance applied from formations and parent tactics
/// </summary>
/// <param name="PositionId">Stable identity for the resolved base position slot</param>
/// <param name="PositionIndex">Original base formation position index used for override matching</param>
/// <param name="Position">The position identifier (e.g., "ST", "CM", "LB")</param>
/// <param name="X">X coordinate on the pitch (0-100)</param>
/// <param name="Y">Y coordinate on the pitch (0-100)</param>
/// <param name="Direction">Directional indicator for the position (e.g., "N", "SW", "E")</param>
/// <param name="SourceFormationId">ID of the formation this position originally came from</param>
/// <param name="OverriddenBy">List of tactic IDs that have overridden this position in the inheritance chain</param>
public record ResolvedPositionDto(
    string PositionId,
    int PositionIndex,
    string Position,
    double X,
    double Y,
    string? Direction,
    string? SourceFormationId,
    List<string>? OverriddenBy
);

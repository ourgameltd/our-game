using OurGame.Persistence.Enums;

namespace OurGame.Application.Services.CompetencyCalculation;

/// <summary>
/// Maps an age group's <see cref="SquadSize"/> ("pitch size") onto the
/// <see cref="GameFormat"/> whose weighting profile is used to score a player's
/// competencies. The game format is always derived from the age group rather
/// than stored per team. Frameworks define weights only for 5s/7s/9s/11s, so a
/// 4-a-side squad is scored on the closest small-sided profile (5s).
/// </summary>
public static class GameFormatMapping
{
    public static GameFormat FromSquadSize(SquadSize squadSize) => squadSize switch
    {
        SquadSize.FourASide => GameFormat.FiveASide,
        SquadSize.FiveASide => GameFormat.FiveASide,
        SquadSize.SevenASide => GameFormat.SevenASide,
        SquadSize.NineASide => GameFormat.NineASide,
        SquadSize.ElevenASide => GameFormat.ElevenASide,
        _ => GameFormat.ElevenASide,
    };
}

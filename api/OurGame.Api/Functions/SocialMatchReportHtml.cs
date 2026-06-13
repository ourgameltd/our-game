using System.Globalization;
using System.Net;
using System.Text;
using Markdig;
using OurGame.Application.UseCases.Matches.Queries.GetMatchById.DTOs;

namespace OurGame.Api.Functions;

internal static class SocialMatchReportHtml
{
    // Render markdown but disable raw HTML so user-authored summaries can't inject scripts.
    private static readonly MarkdownPipeline MarkdownPipeline = new MarkdownPipelineBuilder()
        .DisableHtml()
        .UseAutoLinks()
        .Build();

    private static readonly string[] PeriodOrder = ["first", "second", "third", "etFirst", "etSecond", "penalties"];

    private static readonly Dictionary<string, string> PeriodLabels = new()
    {
        ["first"] = "First Half",
        ["second"] = "Second Half",
        ["third"] = "Third Period",
        ["etFirst"] = "Extra Time — 1st Half",
        ["etSecond"] = "Extra Time — 2nd Half",
        ["penalties"] = "Penalty Shootout",
    };

    private static string H(string? s) => WebUtility.HtmlEncode(s ?? string.Empty);

    public static string Build(
        MatchDetailDto match,
        string ogTitle,
        string ogDescription,
        string ogImage,
        string pageUrl)
    {
        var primary = match.ClubPrimaryColor ?? "#0284c7";
        var secondary = match.ClubSecondaryColor ?? "#075985";
        var homeTeam = match.IsHome ? match.TeamName : match.Opposition;
        var awayTeam = match.IsHome ? match.Opposition : match.TeamName;
        var matchDateStr = match.MatchDate.ToString("dddd, d MMMM yyyy",
            CultureInfo.GetCultureInfo("en-GB"));

        var css = """
                  *, *::before, *::after { box-sizing: border-box; }
                  body { margin: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; color: #111827; }
                  .card { background: #fff; }
                  .muted { color: #6b7280; }
                  .txt { color: #111827; }
                  .sep { border-color: #f3f4f6; }
                  .vsep { background: #e5e7eb; }
                  .lineup-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; align-items: start; }
                  @media (min-width: 640px) { .lineup-grid { grid-template-columns: 1fr 1fr; } }
                  .md > :first-child { margin-top: 0; }
                  .md > :last-child { margin-bottom: 0; }
                  .md p { margin: 0.5rem 0; }
                  .md h1, .md h2, .md h3, .md h4 { margin: 1rem 0 0.5rem; line-height: 1.3; font-weight: 700; }
                  .md h1 { font-size: 1.25rem; }
                  .md h2 { font-size: 1.1rem; }
                  .md h3 { font-size: 1rem; }
                  .md h4 { font-size: 0.9rem; }
                  .md ul, .md ol { margin: 0.5rem 0; padding-left: 1.5rem; }
                  .md li { margin: 0.25rem 0; }
                  .md a { color: #2563eb; }
                  .md blockquote { margin: 0.75rem 0; padding: 0.25rem 0 0.25rem 0.75rem; border-left: 3px solid #d1d5db; color: #6b7280; }
                  .md code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.85em; background: #f3f4f6; padding: 0.1rem 0.3rem; border-radius: 0.25rem; }
                  .md pre { background: #f3f4f6; padding: 0.75rem; border-radius: 0.375rem; overflow-x: auto; }
                  .md pre code { background: none; padding: 0; }
                  .md img { max-width: 100%; height: auto; }
                  @media (prefers-color-scheme: dark) {
                    body { background: #111827; color: #f9fafb; }
                    .card { background: #1f2937; }
                    .muted { color: #9ca3af; }
                    .txt { color: #f9fafb; }
                    .sep { border-color: #374151; }
                    .vsep { background: #4b5563; }
                    .md a { color: #60a5fa; }
                    .md blockquote { border-left-color: #4b5563; color: #9ca3af; }
                    .md code, .md pre { background: #374151; }
                  }
                  """;

        return $"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>{H(ogTitle)}</title>
              <meta property="og:title" content="{H(ogTitle)}" />
              <meta property="og:description" content="{H(ogDescription)}" />
              <meta property="og:image" content="{H(ogImage)}" />
              <meta property="og:url" content="{H(pageUrl)}" />
              <meta property="og:type" content="website" />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content="{H(ogTitle)}" />
              <meta name="twitter:description" content="{H(ogDescription)}" />
              <meta name="twitter:image" content="{H(ogImage)}" />
              <style>{css}</style>
            </head>
            <body>
              <header style="background:linear-gradient(135deg,{primary} 0%,{secondary} 100%);padding:2rem 1rem 2.5rem;">
                <div style="max-width:48rem;margin:0 auto;">
                  {ClubIdentityHtml(match)}
                  {ScoreRowHtml(homeTeam, awayTeam, match.HomeScore, match.AwayScore)}
                  <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:0.25rem 1rem;margin-top:1.5rem;font-size:0.75rem;color:rgba(255,255,255,0.65);text-align:center;">
                    <span>{H(match.Competition)}</span><span aria-hidden="true">·</span>
                    <span>{H(matchDateStr)}</span><span aria-hidden="true">·</span>
                    <span>{H(match.Location)}</span>
                  </div>
                </div>
              </header>
              <main style="max-width:48rem;margin:0 auto;padding:1.5rem 1rem;display:flex;flex-direction:column;gap:1rem;">
                {PotmHtml(match.Report!.PlayerOfMatchName, match.Report.PlayerOfMatchPhoto)}
                {EventsHtml(match)}
                {SummaryHtml(match.Report.Summary)}
                {LineupHtml(match)}
                <p style="text-align:center;font-size:0.75rem;padding-bottom:0.5rem;" class="muted">
                  Shared via <a href="/" style="color:inherit;text-decoration:underline;">OurGame</a>
                </p>
              </main>
            </body>
            </html>
            """;
    }

    private static string ClubIdentityHtml(MatchDetailDto match)
    {
        var logo = !string.IsNullOrEmpty(match.ClubLogo)
            ? $"""<img src="{H(match.ClubLogo)}" alt="{H(match.ClubName)}" style="width:3rem;height:3rem;border-radius:0.25rem;object-fit:contain;flex-shrink:0;" />"""
            : """<div style="width:3rem;height:3rem;border-radius:0.25rem;background:rgba(255,255,255,0.15);flex-shrink:0;"></div>""";
        return $"""
            <div style="display:flex;align-items:center;gap:0.75rem;">
              {logo}
              <div>
                <p style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:rgba(255,255,255,0.65);margin:0;">{H(match.ClubName)}</p>
                <p style="font-size:0.875rem;font-weight:500;color:#fff;margin:0;">{H(match.TeamName)}</p>
              </div>
            </div>
            """;
    }

    private static string ScoreRowHtml(string homeTeam, string awayTeam, int? homeScore, int? awayScore)
    {
        var middle = homeScore.HasValue && awayScore.HasValue
            ? $"""
                <span style="font-size:3.5rem;font-weight:900;color:#fff;line-height:1;">{homeScore}</span>
                <span style="font-size:1.5rem;color:rgba(255,255,255,0.5);">–</span>
                <span style="font-size:3.5rem;font-weight:900;color:#fff;line-height:1;">{awayScore}</span>
              """
            : """<span style="font-size:1.5rem;color:rgba(255,255,255,0.5);">vs</span>""";
        return $"""
            <div style="display:flex;align-items:center;justify-content:center;gap:1.5rem;margin-top:1.5rem;flex-wrap:wrap;">
              <span style="font-size:0.9rem;font-weight:600;color:#fff;text-align:center;max-width:9rem;line-height:1.3;">{H(homeTeam)}</span>
              <div style="display:flex;align-items:center;gap:0.75rem;">{middle}</div>
              <span style="font-size:0.9rem;font-weight:600;color:#fff;text-align:center;max-width:9rem;line-height:1.3;">{H(awayTeam)}</span>
            </div>
            """;
    }

    private static string PotmHtml(string? name, string? photo)
    {
        if (string.IsNullOrEmpty(name)) return string.Empty;
        var img = !string.IsNullOrEmpty(photo)
            ? $"""<img src="{H(photo)}" alt="{H(name)}" style="width:3.5rem;height:3.5rem;border-radius:9999px;object-fit:cover;flex-shrink:0;" />"""
            : """<div style="width:3.5rem;height:3.5rem;border-radius:9999px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.5rem;">⭐</div>""";
        return $"""
            <div class="card" style="border-radius:0.5rem;padding:1rem;box-shadow:0 1px 3px rgba(0,0,0,0.08);display:flex;align-items:center;gap:1rem;">
              {img}
              <div>
                <p style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0;" class="muted">Player of the match</p>
                <p style="font-size:1.1rem;font-weight:700;margin:0.25rem 0 0;" class="txt">{H(name)}</p>
              </div>
            </div>
            """;
    }

    private static string LineupHtml(MatchDetailDto match)
    {
        var players = match.Lineup?.Players;
        if (players is null || players.Count == 0) return string.Empty;

        var starting = players
            .Where(p => p.IsStarting)
            .OrderBy(p => p.PositionIndex ?? int.MaxValue)
            .ToList();
        var subs = players.Where(p => !p.IsStarting).ToList();
        if (starting.Count == 0 && subs.Count == 0) return string.Empty;

        return $"""
            <div class="card" style="border-radius:0.5rem;padding:1rem;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
              <div class="lineup-grid">
                {LineupColumnHtml("Starting XI", starting)}
                {LineupColumnHtml("Substitutes", subs)}
              </div>
            </div>
            """;
    }

    private static string LineupColumnHtml(string heading, List<LineupPlayerDto> players)
    {
        if (players.Count == 0) return string.Empty;

        var sb = new StringBuilder();
        sb.Append($"""<div><h2 style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 0.5rem;" class="muted">{H(heading)}</h2>""");
        sb.Append("""<ol style="list-style:none;margin:0;padding:0;">""");
        foreach (var p in players)
        {
            var num = p.SquadNumber.HasValue
                ? $"""<span style="width:1.5rem;flex-shrink:0;text-align:right;font-size:0.75rem;font-variant-numeric:tabular-nums;" class="muted">{p.SquadNumber}</span>"""
                : """<span style="width:1.5rem;flex-shrink:0;"></span>""";
            sb.Append($"""
                <li style="display:flex;align-items:center;gap:0.5rem;padding:0.375rem 0;border-bottom:1px solid;" class="sep">
                  {num}
                  <span style="flex:1;font-size:0.875rem;" class="txt">{H(p.FirstName)} {H(p.LastName)}</span>
                </li>
                """);
        }
        sb.Append("</ol></div>");
        return sb.ToString();
    }

    private sealed record SocialEvent(string Period, int? Minute, bool IsHome, string Icon, string Label);

    private static string EventsHtml(MatchDetailDto match)
    {
        var goals = match.Report!.Goals;
        var cards = match.Report.Cards;
        if (goals.Count == 0 && cards.Count == 0) return string.Empty;

        var homeTeam = match.IsHome ? match.TeamName : match.Opposition;
        var awayTeam = match.IsHome ? match.Opposition : match.TeamName;

        var events = goals.Select(g => new SocialEvent(
                g.Period ?? "first",
                g.Minute,
                IsHomeColumn(match, g.IsOpponent),
                """<span style="font-size:1rem;line-height:1;">⚽</span>""",
                GoalLabel(g, match.Opposition)
            )).Concat(cards.Select(c => new SocialEvent(
                c.Period ?? "first",
                c.Minute,
                IsHomeColumn(match, c.IsOpponent),
                CardIcon(c),
                H(ResolveName(c.PlayerName, c.IsOpponent, c.OpponentName, match.Opposition))
            )))
            .OrderBy(e => PeriodIndexOf(e.Period))
            .ThenBy(e => e.Minute ?? 999)
            .ToList();

        var grouped = events
            .GroupBy(e => e.Period)
            .OrderBy(g => PeriodIndexOf(g.Key));

        var sb = new StringBuilder();
        sb.Append("""<div class="card" style="border-radius:0.5rem;padding:1rem;box-shadow:0 1px 3px rgba(0,0,0,0.08);">""");
        sb.Append("""<h2 style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 0.75rem;" class="muted">Events</h2>""");

        // Column headers: home team · away team
        sb.Append($"""
            <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;column-gap:0.5rem;margin-bottom:0.5rem;">
              <span style="font-size:0.75rem;font-weight:600;" class="txt">{H(homeTeam)}</span>
              <span style="width:1px;height:1rem;" class="vsep"></span>
              <span style="font-size:0.75rem;font-weight:600;text-align:right;" class="txt">{H(awayTeam)}</span>
            </div>
            """);

        foreach (var group in grouped)
        {
            var label = PeriodLabels.TryGetValue(group.Key, out var l) ? l : group.Key;
            var home = group.Where(e => e.IsHome).ToList();
            var away = group.Where(e => !e.IsHome).ToList();
            var rowCount = Math.Max(home.Count, away.Count);

            sb.Append($"""<div style="margin-top:0.75rem;"><p style="font-size:0.7rem;font-weight:500;margin:0 0 0.25rem;" class="muted">{H(label)}</p>""");
            for (var i = 0; i < rowCount; i++)
            {
                var left = i < home.Count ? RowSide(home[i], right: false) : string.Empty;
                var rightSide = i < away.Count ? RowSide(away[i], right: true) : string.Empty;
                sb.Append($"""
                    <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;column-gap:0.5rem;padding:0.375rem 0;border-bottom:1px solid;" class="sep">
                      <div>{left}</div>
                      <span style="width:1px;align-self:stretch;min-height:1.25rem;" class="vsep"></span>
                      <div>{rightSide}</div>
                    </div>
                    """);
            }
            sb.Append("</div>");
        }
        sb.Append("</div>");
        return sb.ToString();
    }

    private static bool IsHomeColumn(MatchDetailDto match, bool isOpponent)
        => match.IsHome ? !isOpponent : isOpponent;

    private static string ResolveName(string? clubName, bool isOpponent, string? opponentName, string opposition)
    {
        if (!isOpponent) return clubName ?? string.Empty;
        return string.IsNullOrWhiteSpace(opponentName) ? opposition : opponentName;
    }

    private static string GoalLabel(GoalDetailDto g, string opposition)
    {
        var name = H(ResolveName(g.ScorerName, g.IsOpponent, g.OpponentName, opposition));
        var pen = g.IsPenalty ? """<span style="margin-left:0.25rem;font-size:0.7rem;" class="muted">(pen)</span>""" : "";
        return $"{name}{pen}";
    }

    private static string CardIcon(CardDetailDto c)
    {
        var color = string.Equals(c.Type, "red", StringComparison.OrdinalIgnoreCase) ? "#ef4444" : "#facc15";
        return $"""<div style="width:0.75rem;height:1rem;border-radius:2px;background:{color};flex-shrink:0;"></div>""";
    }

    private static string RowSide(SocialEvent e, bool right)
    {
        var min = e.Minute.HasValue
            ? $"""<span style="font-size:0.7rem;font-variant-numeric:tabular-nums;" class="muted">{e.Minute}'</span>"""
            : string.Empty;
        var dir = right ? "flex-direction:row-reverse;" : string.Empty;
        var ta = right ? "text-align:right;" : string.Empty;
        return $"""<div style="display:flex;align-items:center;gap:0.5rem;{dir}">{e.Icon}<span style="flex:1;font-size:0.875rem;{ta}" class="txt">{e.Label}</span>{min}</div>""";
    }

    private static string SummaryHtml(string? summary)
    {
        if (string.IsNullOrWhiteSpace(summary)) return string.Empty;
        var rendered = Markdown.ToHtml(summary, MarkdownPipeline);
        return $"""
            <div class="card" style="border-radius:0.5rem;padding:1.25rem;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
              <h2 style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 0.75rem;" class="muted">Match report</h2>
              <div class="md txt" style="font-size:0.875rem;line-height:1.6;">{rendered}</div>
            </div>
            """;
    }

    private static int PeriodIndexOf(string period)
    {
        var i = Array.IndexOf(PeriodOrder, period);
        return i >= 0 ? i : 99;
    }
}

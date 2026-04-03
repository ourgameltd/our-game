# Club Public Websites — Design Options

Prepared: 2026-04-03

## 1 Problem Statement

Club administrators want to publish selected content (squad, matches, results, upcoming fixtures, club info, landing pages) to a **public-facing static website** that anyone can visit without logging in. Each club should get its own site, ideally with its own subdomain (e.g. `valefc.ourgame.app`). Content should update automatically when an admin saves changes inside the OurGame management portal.

The market analysis (`docs/market-competitive-analysis.md`) identifies this as competitive gap #4:

> **Public website / community engagement tooling** where Pitchero is particularly strong.

This document explores architectural options, trade-offs, costs, and a recommended approach. **No implementation should start until a direction is agreed.**

---

## 2 Requirements

| # | Requirement | Priority |
|---|-------------|----------|
| R1 | Each club gets a publicly accessible website | Must |
| R2 | Club admins choose which sections are public (squad, matches, results, fixtures, ethos, news) via settings toggles | Must |
| R3 | Public sites update automatically when content is saved in the management portal | Must |
| R4 | Each club gets a subdomain (e.g. `valefc.ourgame.app`) | Should |
| R5 | Clubs can optionally bring a custom domain (e.g. `www.valefc.co.uk`) | Could |
| R6 | Public sites are fast, SEO-friendly, and crawlable | Should |
| R7 | Club branding (colours, logo, crest) applied to public site | Must |
| R8 | Cost scales with number of clubs, not per-resource fixed costs | Should |
| R9 | Minimal operational overhead — no manual deployment per club | Must |
| R10 | Works within existing Azure infrastructure (Bicep, SWA, Functions, SQL) | Should |

---

## 3 Current Architecture Context

Understanding the current stack is essential for evaluating options.

| Layer | Technology | Reference |
|-------|------------|-----------|
| Frontend | React 18 + Vite SPA, Azure Static Web App (Standard tier) | `web/`, `infrastructure/main.bicep` |
| Backend | Azure Functions v4, .NET 8 Isolated Worker | `api/OurGame.Api/` |
| Database | Azure SQL Serverless (GP_S_Gen5) | `infrastructure/main.bicep` |
| Auth | Azure AD B2C via SWA custom OpenID Connect | `web/public/staticwebapp.config.json` |
| DNS | Not yet managed (SWA default hostname) | — |
| CDN | None (SWA has built-in edge) | — |
| Storage | Azure Storage (table service, function diagnostics) | `infrastructure/main.bicep` |
| CI/CD | GitHub Actions → Bicep → SWA deploy | `.github/workflows/tag-release.yml` |

Key club data model (`api/OurGame.Persistence/Models/Club.cs`):

```
Club: Id, Name, ShortName, Logo, PrimaryColor, SecondaryColor, AccentColor,
      City, Country, Venue, Address, FoundedYear, History, Ethos, Principles,
      → AgeGroups, Coaches, Kits, Players, Teams
```

Club settings are currently managed in `web/src/pages/clubs/ClubSettingsPage.tsx` covering name, colours, location, history, ethos, and principles. There is no existing concept of "public site settings" or content visibility toggles.

---

## 4 Architectural Options

### Option A — Azure Blob Storage Static Sites + CDN + Azure DNS

**How it works:**

1. Add a `PublicSiteSettings` JSON column (or related table) to the `Club` model with toggles for each publishable section.
2. When an admin saves content in the portal, an Azure Function (event-driven or called directly) **renders static HTML/CSS/JS** for that club and uploads it to an Azure Blob Storage container with [static website hosting](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website) enabled.
3. An Azure CDN profile sits in front of blob storage, providing HTTPS, custom domains, and edge caching.
4. An Azure DNS zone for `ourgame.app` manages CNAME records per club (e.g. `valefc.ourgame.app → cdn-endpoint.azureedge.net`).
5. For custom domains, clubs add a CNAME pointing to their `{slug}.ourgame.app` and the CDN + DNS validate it.

**Static site rendering** could use:
- A lightweight HTML template engine in .NET (Razor pages, Scriban, or Fluid) running inside an Azure Function.
- Pre-built HTML templates with club CSS variables injected for branding.

```
┌─────────────────┐    save     ┌───────────────────┐   render    ┌──────────────┐
│  Admin Portal    │───────────▶│  Azure Function    │───────────▶│  Blob Storage │
│  (React SWA)     │            │  (render + upload) │            │  ($web cont.) │
└─────────────────┘            └───────────────────┘            └──────┬───────┘
                                                                        │
                                                                  ┌─────▼───────┐
                                                           ┌──────│  Azure CDN   │
                                                           │      └─────────────┘
                                                           │
                                                    ┌──────▼──────────┐
                                                    │  Azure DNS       │
                                                    │  valefc.ourgame  │
                                                    │  .app CNAME      │
                                                    └─────────────────┘
```

| Pros | Cons |
|------|------|
| Truly static — fastest possible load times, excellent SEO | Need to build and maintain HTML templates / renderer |
| Very cheap at scale (~$0.01/GB storage, CDN pay-per-request) | Blob static site only supports a single custom domain per storage account without CDN |
| Content updates are near-instant (function renders + uploads in seconds) | CDN cache invalidation adds a few seconds of staleness |
| No SPA hydration needed — works without JS | Template changes require re-rendering all clubs |
| Can host thousands of clubs in a single storage account | More moving parts (storage + CDN + DNS + function) |

**Estimated monthly cost (100 clubs):**
- Blob Storage: ~$1 (< 1 GB total)
- CDN (Standard Microsoft tier): ~$5–10 (low traffic grassroots clubs)
- DNS Zone: ~$0.50/zone + $0.40/million queries
- Azure Function (rendering): negligible (consumption plan, runs on save)
- **Total: ~$7–12/month**

---

### Option B — Single SWA with Subdomain Routing (Client-Rendered)

**How it works:**

1. Keep the existing SWA deployment.
2. Add a wildcard custom domain `*.clubs.ourgame.app` → SWA default hostname.
3. Add a `/play/:clubSlug/*` public route group to the React app (the SWA config already has `/play*` as anonymous).
4. The React app reads the subdomain (or path-based slug) and fetches club data from the API to render the public page.
5. Club visibility settings control which API data is returned for unauthenticated requests.

```
┌────────────────────┐   fetch     ┌───────────────────┐
│  Public visitor     │───────────▶│  Azure Functions   │
│  valefc.clubs.      │            │  GET /api/v1/clubs │
│  ourgame.app        │            │  /{slug}/public/*  │
└────────────────────┘            └───────────────────┘
         │
         ▼
┌────────────────────┐
│  Same React SWA    │
│  /play/:clubSlug   │
│  (client-side)     │
└────────────────────┘
```

| Pros | Cons |
|------|------|
| Minimal infrastructure change — reuse existing SWA | Client-rendered: poor SEO, blank page before JS loads |
| No new Azure resources needed | SWA Standard supports max 2 custom domains (no wildcard) |
| Single deployment, single codebase | Public pages are slower (API round-trip before rendering) |
| Uses existing React components | Mixing public and private in one SWA complicates auth config |
| Cheapest option ($0 additional) | All public pages share the same SWA quota/bandwidth |

**Estimated monthly cost (100 clubs):** ~$0 additional (within SWA Standard tier limits).

**Key limitation:** Azure SWA Standard tier supports only **2 custom domains**. Wildcard domains are not supported on SWA. This means each club cannot get a true subdomain unless we move to a different hosting model. Path-based routing (`ourgame.app/play/valefc`) is possible but less attractive.

---

### Option C — Azure Static Web Apps Environments (Preview Feature)

**How it works:**

1. SWA supports [preview environments](https://learn.microsoft.com/en-us/azure/static-web-apps/preview-environments) tied to branches/PRs but these are temporary.
2. We could create separate SWA resources per club, each with its own custom domain.
3. A management function provisions new SWA resources via the Azure SDK when a club enables its public site.

| Pros | Cons |
|------|------|
| True isolation per club | One SWA per club = $9/month each (Standard) or free tier (limited) |
| Full custom domain support | Resource sprawl — 100 clubs = 100 SWAs |
| Independent deployments | Deployment pipeline complexity grows linearly |
| | Free tier: 2 custom domains, 100 GB/month bandwidth |
| | Provisioning requires Azure SDK/ARM calls — operational complexity |

**Estimated monthly cost (100 clubs):** $0 (Free tier) to $900 (Standard tier) — **not scalable**.

---

### Option D — Azure Functions SSR + Blob Cache

**How it works:**

1. An Azure Function renders HTML server-side on each request using Razor or a template engine.
2. Rendered pages are cached in Blob Storage (or Azure Redis) with a TTL.
3. When content is saved, the cache for that club is invalidated.
4. Azure Front Door or CDN sits in front for custom domains and edge caching.

```
┌────────────┐   request   ┌─────────────────┐  cache miss  ┌──────────┐
│  Visitor    │────────────▶│  Azure Front     │─────────────▶│  Azure   │
│             │             │  Door / CDN      │              │  Function│
└────────────┘             └─────────────────┘              │  (SSR)   │
                                    │                        └────┬─────┘
                                    │ cache hit                   │
                                    ▼                             ▼
                            ┌───────────────┐            ┌──────────────┐
                            │  Edge Cache    │            │  SQL Database │
                            └───────────────┘            └──────────────┘
```

| Pros | Cons |
|------|------|
| Dynamic content, always fresh | Functions consume CPU on every cache miss |
| Good SEO with server-rendered HTML | Azure Front Door Premium: ~$35/month minimum |
| Single function handles all clubs | Cold start latency on consumption plan |
| Custom domains via Front Door | More complex than pure static |
| | Consumption plan may sleep, causing slow first loads |

**Estimated monthly cost (100 clubs):**
- Azure Front Door Standard: ~$35/month
- Function consumption: ~$1–5
- **Total: ~$36–40/month**

---

### Option E — Pre-Rendered Static + Azure Front Door (Recommended Hybrid)

**How it works:**

This combines the best of Options A and D:

1. **On content save**, an Azure Function pre-renders static HTML for the affected club pages using a .NET template engine (Razor Pages in a library, Scriban, or Fluid templates).
2. Rendered HTML is uploaded to **Azure Blob Storage** (`$web` container, organised by club slug: `/{clubSlug}/index.html`, `/{clubSlug}/squad/index.html`, etc.).
3. **Azure Front Door** (Standard tier) provides:
   - Wildcard custom domain: `*.ourgame.app`
   - HTTPS with managed certificates
   - Origin group pointing to blob storage
   - Routing rules: `{clubSlug}.ourgame.app/*` → blob `/{clubSlug}/*`
   - Edge caching with cache invalidation API
4. **Azure DNS zone** for `ourgame.app` with:
   - Wildcard CNAME `*.ourgame.app` → Front Door endpoint
   - Individual CNAME records for clubs with custom domains (verified via TXT records)
5. Club settings UI extends with a **"Public Site"** section containing toggles per content area.

```
Admin saves ──▶ Azure Function ──▶ Render HTML ──▶ Upload to Blob
                                       │
                                       ▼
                               Invalidate CDN cache
                                       │
                                       ▼
              Visitor ──▶ Azure Front Door ──▶ Blob Storage
              (valefc.ourgame.app)      (/{valefc}/index.html)
```

**Page structure per club:**

```
/{clubSlug}/
├── index.html              (landing page — club overview, crest, colours)
├── squad/index.html        (player list with positions, photos)
├── matches/index.html      (fixtures & results)
├── results/index.html      (past match results)
├── fixtures/index.html     (upcoming matches)
├── about/index.html        (history, ethos, principles)
├── css/
│   └── styles.css          (Tailwind output + club CSS custom properties)
├── images/
│   └── crest.png
└── assets/
    └── ...
```

| Pros | Cons |
|------|------|
| Truly static — fast, SEO-friendly, crawlable | Front Door Standard has a base cost (~$35/month) |
| Wildcard domain support via Front Door | Need to build template engine + renderer |
| Custom domains with managed TLS certificates | Slightly more complex infrastructure |
| Near-instant updates (render on save, < 5s) | Template maintenance overhead |
| Scales to thousands of clubs on single storage account | |
| Club branding via CSS custom properties | |
| Works offline / no JS required | |
| Can add progressive enhancement later | |

**Estimated monthly cost (100 clubs):**

| Resource | Monthly Cost |
|----------|-------------|
| Azure Front Door Standard | ~$35 |
| Blob Storage (< 5 GB) | ~$1 |
| DNS Zone | ~$0.50 |
| Function Consumption (rendering) | ~$1 |
| Managed TLS Certificates | Free (with Front Door) |
| **Total** | **~$38/month** |

At 1,000 clubs the cost would be ~$40–45/month (storage and bandwidth grow marginally). Cost scales very well.

---

## 5 Option Comparison

| Criteria | A: Blob+CDN | B: SWA Routing | C: SWA per Club | D: SSR+Cache | **E: Blob+FrontDoor** |
|----------|:-----------:|:--------------:|:---------------:|:------------:|:--------------------:|
| SEO / Crawlability | ✅ Excellent | ❌ Poor (SPA) | ✅ N/A (static) | ✅ Good | ✅ Excellent |
| Subdomain per club | ⚠️ CDN limits | ❌ SWA limit (2) | ✅ Yes | ✅ Yes | ✅ Yes (wildcard) |
| Custom domain support | ⚠️ Manual CDN | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| Cost at 100 clubs | $7–12 | $0 | $0–900 | $36–40 | **$38** |
| Cost at 1,000 clubs | $10–20 | $0 | Prohibitive | $40–60 | **$40–45** |
| Operational complexity | Medium | Low | High | Medium | Medium |
| Infrastructure fit | Good | Best | Poor | Good | **Good** |
| Time to implement | Medium | Low | High | Medium | Medium |
| Performance | Fast | Slow (SPA) | Fast | Medium | **Fast** |
| Content freshness | Near-instant | Real-time | Per-deploy | Cached | **Near-instant** |

---

## 6 Recommendation

**Option E (Pre-Rendered Static + Azure Front Door)** provides the best balance of:

- **SEO and performance** (static HTML)
- **Subdomain flexibility** (wildcard domain + custom domains)
- **Cost efficiency** (scales to thousands of clubs for ~$40/month)
- **Operational simplicity** (single storage account, single CDN, automated rendering)
- **Integration** with the existing Azure Functions and Bicep infrastructure

Option B (SWA path-based routing) is a viable **Phase 0 / MVP** if we want to validate the concept quickly with zero infrastructure cost before investing in the full static site pipeline.

---

## 7 Proposed Phased Approach

### Phase 0 — Validate with Path-Based Public Pages (low cost, fast)

**Goal:** Prove the feature has value with minimal investment.

1. Add `PublicSiteSettings` to the Club model (toggles for: squad, matches, results, fixtures, about).
2. Add public API endpoints: `GET /api/v1/public/clubs/{slug}/overview`, `GET /api/v1/public/clubs/{slug}/squad`, etc.
3. Extend the existing `/play/:clubSlug` route in the React SPA to render public pages.
4. Add a "Public Site" settings section in ClubSettingsPage with toggle switches.
5. Public pages accessible at `ourgame.app/play/valefc`.

**Changes:**
- `api/OurGame.Persistence/Models/`: New `ClubPublicSiteSettings` entity
- `api/OurGame.Api/Functions/`: New `PublicClubFunctions.cs` (anonymous endpoints)
- `web/src/pages/clubs/`: Update `ClubSettingsPage.tsx` with public site toggles
- `web/src/pages/`: New `public/` folder with public page components
- `web/public/staticwebapp.config.json`: Already has `/play*` as anonymous

**Cost:** $0 additional. **Timeline:** ~1–2 sprints.

### Phase 1 — Static Site Generation Pipeline

**Goal:** Generate real static HTML for SEO and performance.

1. Create a .NET template project (`OurGame.SiteGenerator`) using Razor/Scriban to render club pages.
2. Azure Function trigger: on club content save → render → upload to Blob Storage `$web` container.
3. Add Blob Storage static website hosting to Bicep.
4. Serve via Storage static website URL initially (no custom domains yet).

**Changes:**
- New project: `api/OurGame.SiteGenerator/`
- `infrastructure/main.bicep`: Enable blob static website on existing storage account
- `api/OurGame.Api/Functions/`: Add render trigger on club/match/player save

**Cost:** ~$1/month (storage). **Timeline:** ~2–3 sprints.

### Phase 2 — Azure Front Door + Custom Subdomains

**Goal:** Give each club a subdomain and support custom domains.

1. Add Azure Front Door Standard to Bicep.
2. Add Azure DNS zone for `ourgame.app` to Bicep.
3. Wildcard CNAME `*.ourgame.app` → Front Door endpoint.
4. Routing rules map `{slug}.ourgame.app` to `/{slug}/` origin path in blob storage.
5. API endpoint for clubs to request custom domain verification (TXT record + CNAME).

**Changes:**
- `infrastructure/main.bicep`: Azure Front Door, DNS zone, routing rules
- `api/OurGame.Api/Functions/`: Custom domain management endpoints
- `web/src/pages/clubs/ClubSettingsPage.tsx`: Custom domain configuration UI

**Cost:** ~$35–40/month. **Timeline:** ~2 sprints.

### Phase 3 — Advanced Features

- Club news / blog posts with markdown editor
- Sponsor logos and banner placement
- Match day live updates (optional SSR for live pages)
- Analytics dashboard (page views per club site)
- Theme templates (multiple layouts clubs can choose from)
- PWA support for public sites

---

## 8 Data Model Extension

Below is the proposed data model for club public site settings. This would be added to the persistence layer.

```csharp
// New entity: api/OurGame.Persistence/Models/ClubPublicSiteSettings.cs
public class ClubPublicSiteSettings
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    
    // Whether the public site is enabled at all
    public bool IsEnabled { get; set; }
    
    // URL slug for the club (e.g. "valefc") — unique
    public string Slug { get; set; }
    
    // Custom domain (optional, e.g. "www.valefc.co.uk")
    public string? CustomDomain { get; set; }
    public bool CustomDomainVerified { get; set; }
    
    // Content visibility toggles
    public bool ShowSquad { get; set; }
    public bool ShowMatches { get; set; }
    public bool ShowResults { get; set; }
    public bool ShowFixtures { get; set; }
    public bool ShowAbout { get; set; }         // History, ethos, principles
    public bool ShowTraining { get; set; }
    public bool ShowLeagueTable { get; set; }
    public bool ShowNews { get; set; }
    
    // Branding overrides (null = use club defaults)
    public string? HeroImageUrl { get; set; }
    public string? TagLine { get; set; }
    
    // Theme template selection
    public string Theme { get; set; } = "default";
    
    // Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Last time the static site was regenerated
    public DateTime? LastPublishedAt { get; set; }
    
    // Navigation
    public virtual Club Club { get; set; }
}
```

---

## 9 Azure DNS + Subdomain Automation

For Phase 2, Azure DNS would be provisioned via Bicep and managed programmatically:

```bicep
// Azure DNS Zone (in main.bicep)
resource dnsZone 'Microsoft.Network/dnsZones@2023-07-01-preview' = {
  name: 'ourgame.app'
  location: 'global'
  properties: {
    zoneType: 'Public'
  }
}

// Wildcard CNAME to Front Door
resource wildcardCname 'Microsoft.Network/dnsZones/CNAME@2023-07-01-preview' = {
  parent: dnsZone
  name: '*'
  properties: {
    TTL: 3600
    CNAMERecord: {
      cname: frontDoor.properties.frontDoorId // Front Door endpoint hostname
    }
  }
}
```

For **per-club CNAME records** (when clubs bring custom domains), an Azure Function would use the Azure SDK:

```csharp
// Programmatic DNS record creation
var dnsClient = new DnsManagementClient(credentials);
await dnsClient.RecordSets.CreateOrUpdateAsync(
    resourceGroupName, "ourgame.app",
    clubSlug, RecordType.CNAME,
    new RecordSet {
        CnameRecord = new CnameRecord { Cname = $"{clubSlug}.ourgame.app" }
    });
```

---

## 10 Security Considerations

| Concern | Mitigation |
|---------|------------|
| Slug squatting (registering offensive or reserved slugs) | Maintain a block list; admin approval for slug changes |
| XSS in published content | HTML-encode all user content during static rendering; no raw HTML in templates |
| Unauthorized content publishing | Require club admin role to toggle public site settings |
| Custom domain hijacking | Require TXT record verification before activating custom domains |
| Cost abuse (massive sites) | Rate-limit rendering; cap storage per club; monitor blob size |
| Data leakage (private content on public site) | Public API endpoints only return data for sections with `Show*` enabled |

---

## 11 Questions for Discussion

1. **Phase 0 vs jump to Phase 1?** — Is a client-rendered MVP (path-based, `/play/valefc`) sufficient to validate demand, or should we go straight to static generation?

2. **Domain ownership** — Does OurGame already own `ourgame.app` or a similar domain? The DNS zone and wildcard CNAME depend on this.

3. **Template strategy** — Should we invest in a rich theme system from the start (multiple templates, drag-and-drop sections) or ship a single clean template and iterate?

4. **Content types** — Beyond squad/matches/results/fixtures/about, are there other content types clubs would want on their public site? (News/blog, sponsors, photo galleries, social feeds?)

5. **Real-time updates** — For match days, is there appetite for live score updates on the public site (would require SSR or WebSocket, not pure static)?

6. **Cost appetite** — Is the ~$35/month Azure Front Door baseline acceptable for the public site infrastructure, or should we aim for a $0 Phase 0 first?

7. **Existing SWA custom domains** — The current SWA Standard tier allows 2 custom domains. Should one of these be reserved for a vanity domain (e.g. `app.ourgame.app`) to free the default hostname?

---

## 12 References

- [Azure Blob Storage Static Website Hosting](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website)
- [Azure Front Door Standard/Premium](https://learn.microsoft.com/en-us/azure/frontdoor/front-door-overview)
- [Azure DNS Zones](https://learn.microsoft.com/en-us/azure/dns/dns-overview)
- [Azure SWA Custom Domains](https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain)
- [Scriban .NET Template Engine](https://github.com/scriban/scriban)
- [Fluid .NET Template Engine](https://github.com/sebastienros/fluid)
- OurGame Market Analysis: `docs/market-competitive-analysis.md` (gap #4)
- Current infrastructure: `infrastructure/main.bicep`
- Club model: `api/OurGame.Persistence/Models/Club.cs`
- Club settings UI: `web/src/pages/clubs/ClubSettingsPage.tsx`
- SWA config (public routes): `web/public/staticwebapp.config.json`

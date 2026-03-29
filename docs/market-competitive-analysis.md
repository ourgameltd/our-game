# OurGame Market, Competitor, and Go-To-Market Report

Prepared: 2026-03-29

## Executive summary

OurGame is well positioned to become a strong operating system for volunteer-run football clubs because the repository already covers the hardest day-to-day club workflows: club structure, age groups, teams, player profiles, player development, training, match reporting, drills, tactics, and role-aware navigation (`README.md`, `web/README.md`, `web/src/App.tsx`, `api/OurGame.Api/Functions`, `api/OurGame.Application/UseCases`).

The strongest strategic opportunity is **not** to become another generic sports team chat app. The best path is to become the **football-specific club operations and development platform** for grassroots and community clubs, then expand upward into association-connected registration, compliance, participation insight, and national reporting.

The biggest competitive gaps today are:

1. **Payments, registration, and fundraising maturity** relative to Pitchero, Spond, TeamSnap, TeamStats, and PlayHQ.
2. **Association-grade integrations and compliance workflows** relative to COMET, PlayHQ, and FIFA Connect ecosystems.
3. **Mobile/PWA engagement and notifications**, although an open PR is already addressing this.
4. **Public website/community engagement tooling** where Pitchero is particularly strong.
5. **Deep video/performance analysis integrations** where Hudl and Veo are stronger.

The biggest edge available to OurGame is to combine:

- volunteer-friendly club operations,
- football-specific player development,
- multi-team / multi-age-group structure,
- association connectivity,
- and national-level insight products for federations.

That combination is rarer than any one feature by itself.

---

## 1. What the app already does well

### 1.1 Product aim

The repository frames the product as football management “at all levels” with a goal of organizing under-supported grassroots football better (`README.md`). The frontend README describes a “responsive, mobile-first web portal” for managing clubs, teams, players, matches, training, and community workflows (`web/README.md`).

This fits a clear market problem: most grassroots clubs are run by volunteers using a mix of WhatsApp, spreadsheets, paper forms, shared drives, text messages, and league/association portals that do not work together.

### 1.2 Current capability set in the repository

The routed frontend already spans a large football operating model (`web/src/App.tsx`):

- club dashboards and settings,
- club ethos / principles,
- age groups,
- teams,
- player profiles and settings,
- player abilities,
- player report cards,
- player development plans,
- player albums,
- coach profiles and settings,
- matches and match reports,
- training sessions,
- drills and drill templates,
- tactics,
- club / age-group / team report cards,
- club / age-group / team development plans,
- notifications and help pages.

The API surface mirrors those domains (`api/OurGame.Api/Functions`), including:

- clubs,
- age groups,
- teams,
- players,
- matches,
- training sessions,
- formations,
- tactics,
- drills,
- drill templates,
- development plans,
- reports,
- users.

The application layer indicates strong domain depth, not just UI mockups (`api/OurGame.Application/UseCases`). In particular, the repository already leans into football-specific value:

- player abilities and evaluations,
- report cards,
- development plans,
- training content,
- tactical structures,
- match reporting,
- multi-level hierarchy from club to age group to team.

### 1.3 Why this matters for volunteer-run clubs

This app is most compelling where volunteer burden is high:

- organizing squads across multiple age groups,
- keeping parents informed,
- tracking player development over time,
- managing coach and player data,
- planning training consistently,
- recording matches and attendance,
- preserving club culture and operating knowledge as volunteers change.

That is more ambitious than a scheduling app. It positions OurGame as a **club operating system**, not just a messaging tool.

### 1.4 Evidence of future association readiness

There are early signs of association-aligned thinking already in the repo:

- `AssociationId` exists on `Player` and `Coach` models (`api/OurGame.Persistence/Models/Player.cs`, `api/OurGame.Persistence/Models/Coach.cs`).
- Association ID is exposed in player and coach UI (`web/src/pages/players/PlayerSettingsPage.tsx`, `web/src/pages/coaches/CoachSettingsPage.tsx`, `web/src/pages/coaches/CoachProfilePage.tsx`, `web/src/pages/clubs/ClubPlayerSettingsPage.tsx`).
- Infrastructure is already cloud-oriented and scalable using Azure Static Web Apps, Azure Functions, Application Insights, Log Analytics, and Azure SQL Serverless (`infrastructure/main.bicep`).

That means the product can credibly evolve from club software into **club + association infrastructure**.

---

## 2. What is in flight right now (open PRs)

Open pull requests suggest the near-term direction is strong and aligned with the product thesis:

### PR #28 — Invite and account association system

This adds invite-based onboarding for coach / player / parent identities, linking user accounts to real domain records. That is important because it moves the product toward:

- proper role-based onboarding,
- safer identity linking,
- better parent access,
- cleaner real-world club adoption.

Strategic value: this is foundational for serious club rollouts and eventually association-backed identity flows.

### PR #29 — Browser notifications and add-to-home-screen support

This adds:

- push notifications,
- PWA manifest,
- service worker support,
- deep linking into notifications or relevant pages.

Strategic value: this is critical for day-to-day volunteer use because match changes, training reminders, payment nudges, and safeguarding/availability notices must reach users immediately.

### This report PR

This report establishes positioning, gaps, and market direction so product investment can be prioritized around defensibility rather than feature sprawl.

---

## 3. Competitor landscape

The market splits into five overlapping categories:

1. **Volunteer-first club admin platforms**  
   Example: Spond, TeamStats, Heja.
2. **All-in-one club operations + websites + payments platforms**  
   Example: Pitchero, TeamSnap, SportsEngine.
3. **Association / league / federation operating systems**  
   Example: PlayHQ, COMET.
4. **Football identity / registration infrastructure**  
   Example: FIFA Connect.
5. **Best-of-breed performance/video tools**  
   Example: Hudl, Veo.

### 3.1 Competitor snapshot

| Competitor | Strongest value | Where they are stronger today | Where OurGame can win |
| --- | --- | --- | --- |
| **Spond** | Volunteer-friendly team communication, event management, payments, fundraising | Simplicity, low-friction adoption, communication-first UX, payment collection | Football-specific development, deeper club structure, tactical/training workflows, association integration |
| **Pitchero** | Club websites, membership, payments, content, sponsor/community presence | Public-facing websites, monetization, club communications, member self-service | Better player development, football operations depth, analytics, association connectivity |
| **TeamSnap** | Mature operations suite for teams/clubs/leagues | Registration, communication, payments, scheduling, family workflows, operational polish | Football-specific workflows, development plans, report cards, tactical assets, club ethos/culture |
| **TeamStats** | Grassroots football team management | FA/grassroots workflows, availability, fixtures, stats, practical manager tools | Broader club-wide operating model, richer development model, multi-role ecosystem, association data strategy |
| **PlayHQ** | Association/league/club operating platform | Competition management, payments, reporting, integrations, federation-scale administration | Football-specific coaching/development UX, volunteer empathy, broader club culture and player growth product |
| **COMET** | Federation-grade competition and registration system | Referees, discipline, licensing, registrations, formal governance, compliance | Better club UX, training/plans/reports, volunteer-friendly experience, modern club intelligence |
| **FIFA Connect** | Global football identity and registration backbone | Standardized IDs, cross-border data exchange, federation legitimacy | Better club-level daily workflow and engagement layer on top of formal identity infrastructure |
| **Hudl / Veo** | Video capture, analysis, scouting, highlights | Match video, tagging, analytics, recruitment, AI capture | Club administration, parent/volunteer workflows, integrated operational platform |

---

## 4. Detailed competitive assessment

### 4.1 Spond

Spond is strong because it removes friction for volunteers. Its pitch centers on communication, event management, payments, and fundraising, and it is especially attractive because its core usage is simple and accessible for non-technical club admins.[^spond]

**Where Spond is stronger**

- Faster “time to value” for a small volunteer club.
- Strong communication-first adoption loop.
- Payments and fundraising are more mature.
- Mobile-first engagement is proven.

**Where OurGame can be stronger**

- Player development and coaching workflows.
- True club hierarchy with age-group and team-level reporting.
- Football-specific drills, tactics, and development plans.
- Association-aligned data and identity.

### 4.2 Pitchero

Pitchero is especially strong at the **club as a public organization**, not just the club as an internal admin unit. Its website builder, membership management, payments, content publishing, and sponsor-facing tooling are a major advantage for grassroots clubs that need a credible public presence and revenue support.[^pitchero]

**Where Pitchero is stronger**

- Club websites and public communication.
- Membership/payment collection.
- Community and sponsor engagement.
- Professionalization for small clubs with limited internal resources.

**Where OurGame can be stronger**

- Player progression and longitudinal development.
- Internal football operations depth.
- Coach/player/parent relationship model.
- Insight products for clubs and associations, not just public content.

### 4.3 TeamSnap

TeamSnap is one of the best examples of a mature sports operations platform: registration, scheduling, payments, communication, club/league management, and family workflows are all more polished than most younger products.[^teamsnap]

**Where TeamSnap is stronger**

- Operational maturity.
- Registration/payment workflows.
- Messaging and communication at scale.
- Family-oriented participation workflows.

**Where OurGame can be stronger**

- Football-specific coaching and player evaluation.
- Club ethos, development, and tactical structure.
- Association and federation data interoperability designed around football identity.

### 4.4 TeamStats

TeamStats is closer to OurGame’s domain than general sports tools because it is built around grassroots football teams and manager realities, including fixtures, availability, communication, and practical grassroots workflows.[^teamstats]

**Where TeamStats is stronger**

- Grassroots football day-to-day practicality.
- Availability and fixture workflow maturity.
- Grassroots-specific manager muscle memory.
- Existing football market familiarity.

**Where OurGame can be stronger**

- Whole-club platform depth, not only team management.
- Rich player development and report-card model.
- Better alignment to volunteer succession and institutional club memory.
- Association-grade future vision.

### 4.5 PlayHQ / COMET / FIFA Connect

These systems matter because they show what the **upper layer of the market** looks like: not just club admin, but federation operations, registrations, discipline, reporting, identity, and data exchange.[^playhq] [^comet] [^fifaconnect]

**Where they are stronger**

- Formal registrations and competition administration.
- Governance, discipline, licensing, and official workflows.
- National reporting and integration.
- Ecosystem legitimacy with governing bodies.

**Where OurGame can be stronger**

- Daily club UX.
- Coaching/player experience.
- Volunteer usability.
- Flexible club operations above and beyond formal registration systems.

### 4.6 Hudl / Veo

These are not direct club admin competitors, but they matter because they own a high-value part of football operations: video analysis, tactical learning, player development evidence, and recruiting/scouting.[^hudlveo]

**Where they are stronger**

- Match video capture and review.
- Clip-based coaching feedback.
- Highlighting and recruitment.
- Performance insight depth.

**Where OurGame can respond**

- Add integrations rather than rebuild everything.
- Make player reports and development plans reference video events and clips.
- Become the place where logistics + development + evidence meet.

---

## 5. Gap analysis: where other platforms are currently stronger

### 5.1 Must-close gaps

These are the gaps most likely to block market adoption:

#### A. Registration, payments, and fundraising

Competitors consistently treat these as core club workflows. OurGame’s current repository depth is stronger in development and operations than in monetization or fee collection. That is a risk because clubs often buy software first to solve:

- membership collection,
- training/match fees,
- installment plans,
- fundraising,
- event payments,
- registration renewals.

#### B. Communications and notifications

Open PR #29 addresses this, but the market expects:

- push,
- SMS/email options,
- schedule reminders,
- payment reminders,
- targeted groups,
- parent-specific comms,
- urgent alerts.

#### C. Public-facing club presence

Pitchero proves that a club website, fixtures, news, sponsorship, and public legitimacy matter. Many volunteer clubs need outward communication as much as inward administration.

#### D. Association-grade workflows

If the product wants to scale globally, it cannot stop at club administration. It needs an integration layer for:

- player registration,
- club affiliation,
- coach licensing,
- safeguarding/compliance,
- discipline/eligibility,
- competition and results sync.

### 5.2 Important but differentiating gaps

These are not day-one blockers, but they build edge:

#### E. Video and evidence-based player development

If OurGame connects development plans and report cards to video, session evidence, match events, and longitudinal performance, it becomes more defensible than a generic admin app.

#### F. Volunteer automation

There is room to become the “AI admin assistant for football clubs” by automating:

- registration reminders,
- squad availability chasing,
- fixture change propagation,
- session planning from templates,
- season-end reports,
- coach development prompts,
- sponsor/community updates.

#### G. Association insight layer

This is one of the biggest strategic opportunities. Most club tools stop at the club. A federation-facing insight layer could aggregate:

- participation by age, gender, area, and club,
- coach qualification coverage,
- retention and dropout signals,
- training and match availability trends,
- safeguarding/compliance status,
- player movement and progression,
- club health and at-risk indicators.

---

## 6. What to add to gain an edge

### 6.1 Priority 1: features that unlock adoption

1. **Membership, fees, and payments**
   - membership billing,
   - match/training fees,
   - installments,
   - donations,
   - fundraiser workflows,
   - sponsor invoicing.

2. **Parent and family operating model**
   - parent accounts,
   - sibling grouping,
   - guardian permissions,
   - transport/help rotas,
   - attendance and availability from parents for youth players.

3. **Notification orchestration**
   - push + email + SMS abstraction,
   - delivery rules by urgency,
   - team / age group / club / guardian segments.

4. **Registration and onboarding**
   - complete invite flow,
   - identity-proofed acceptance,
   - club / team self-service onboarding,
   - import from spreadsheets and association exports.

5. **Volunteer-friendly mobile workflow**
   - one-tap availability,
   - one-tap attendance,
   - quick match event capture,
   - simple post-match reporting,
   - offline-first or poor-connection resilience.

### 6.2 Priority 2: features that differentiate

1. **Football development graph**
   - link abilities, evaluations, reports, development plans, and match/training evidence.

2. **Coach operating system**
   - session builder,
   - drill library,
   - tactical boards,
   - seasonal objectives,
   - coach certification tracking,
   - recommended training based on squad development needs.

3. **Club health dashboard**
   - participation,
   - payments outstanding,
   - player growth,
   - attendance trends,
   - volunteer capacity,
   - team coverage by coach qualifications.

4. **Video integrations**
   - Hudl / Veo / YouTube / file upload references inside reports and plans,
   - clip attachments in player reports,
   - match review workflows tied to development actions.

### 6.3 Priority 3: features that build moat

1. **Association integration hub**
   - API adapters for FIFA Connect, COMET, PlayHQ, and country-specific systems.

2. **National insight product**
   - dashboards for associations and federations,
   - participation and compliance analytics,
   - club benchmarking,
   - early-warning indicators for struggling clubs.

3. **Benchmarking and recommendations**
   - “clubs like yours” insight,
   - squad development benchmarks,
   - volunteer load scoring,
   - facility utilization insight,
   - grant-readiness metrics for clubs applying for funding.

4. **AI assistant**
   - draft communications,
   - summarize match and training data,
   - build player development summaries,
   - identify missing compliance tasks,
   - create recommended season plans.

---

## 7. Business value by user level

### Club administrator / committee

Value:

- fewer systems,
- fewer manual chases,
- cleaner records,
- stronger compliance,
- better continuity when volunteers change,
- easier fee collection and communication.

### Coach

Value:

- clear squads,
- availability and attendance tracking,
- development plans,
- tactical/training resources,
- simpler communication with players and parents,
- better match and training evidence.

### Parent / guardian

Value:

- one place for schedules, kit, notices, fees, availability, and updates,
- less confusion,
- easier family logistics,
- greater trust and transparency.

### Player

Value:

- clearer development pathway,
- visible goals and progress,
- better communication,
- more professional club experience.

### Club leadership / board

Value:

- real insight into club health,
- stronger safeguarding/compliance posture,
- funding/grant evidence,
- easier growth across teams and age groups.

### Association / federation

Value:

- more reliable grassroots data,
- reduced manual administration,
- better compliance and participation visibility,
- easier policy and funding decisions,
- stronger national picture of player/coach/club activity.

---

## 8. How this can scale globally

### 8.1 Why the architecture can support global growth

The current deployment model is already compatible with scale:

- Azure Static Web Apps for frontend distribution,
- Azure Functions for API elasticity,
- Azure SQL Serverless for cost-managed persistence,
- Application Insights + Log Analytics for observability (`infrastructure/main.bicep`).

This is a good base for:

- multi-region read/write strategies later,
- country/association-specific deployments,
- white-labeled association environments,
- event-driven integrations.

### 8.2 What global scale will require beyond infrastructure

To scale globally, the product needs a domain model beyond “one club app”:

1. **Multi-tenant architecture**
   - tenant boundaries by club, league, association, country.

2. **Localization**
   - language,
   - date/time formats,
   - local football terminology,
   - country-specific registration fields.

3. **Compliance layers**
   - GDPR and equivalent privacy rules,
   - youth consent and safeguarding controls,
   - data residency options for larger partners.

4. **Payment abstraction**
   - country-specific methods,
   - local tax and invoicing support.

5. **Association adapter model**
   - one core platform,
   - separate connectors per country/system.

### 8.3 Best expansion model

The best sequencing is:

1. win a clear home market,
2. prove club value with volunteer-heavy football clubs,
3. land one or two association/league partnerships,
4. productize integration patterns,
5. expand country-by-country via partner-led rollouts.

---

## 9. Association collaboration strategy

This is one of the most important long-term plays.

### 9.1 Why associations should care

Associations want:

- more complete registrations,
- better compliance,
- real participation data,
- improved coach/player tracking,
- easier communication to clubs,
- stronger insight for funding and national strategy.

Most association systems are good at formal workflows, but weaker at daily club life. That is the opening for OurGame.

### 9.2 The right product position with associations

Do **not** position OurGame as “we replace your core registration/compliance platform” at first.

Position it as:

> “The club operating and engagement layer that improves data quality, volunteer efficiency, and participation outcomes — and syncs into your official systems.”

That is a much easier sell.

### 9.3 Integration opportunities

#### FIFA Connect

FIFA Connect is becoming the global identity and registration backbone for football stakeholders, with APIs and synchronization expectations for member associations.[^fifaconnect]

Opportunity for OurGame:

- use association/player identifiers consistently,
- sync official registration states,
- improve eligibility confidence,
- reduce duplicate records,
- help clubs maintain cleaner official data.

#### COMET

COMET is widely used by federations for competition management, registration, referees, discipline, and reporting.[^comet]

Opportunity for OurGame:

- pull fixtures and official results,
- sync team/player registrations,
- surface sanctions/eligibility,
- sync match reports or team sheets where permitted.

#### PlayHQ and similar national stacks

PlayHQ shows the importance of integrated registrations, competitions, payments, reporting, and automations at league/federation level.[^playhq]

Opportunity for OurGame:

- connect club operations to official competition layers,
- provide better club UX on top of association data,
- feed cleaner and richer operational data back upward.

### 9.4 Association-facing products to build

1. **Club health dashboards**
2. **Participation and retention analytics**
3. **Coach qualification and safeguarding coverage**
4. **Regional engagement maps**
5. **Club benchmarking**
6. **Grant-readiness / intervention recommendations**
7. **National player pathway insight**

This becomes a second revenue line beyond club subscriptions.

---

## 10. Best avenue to market

### 10.1 Recommended market entry

The strongest entry path is:

### Phase 1 — Own a sharp niche

Target:

- grassroots football clubs,
- especially youth and community clubs,
- especially clubs run by volunteers,
- especially multi-team clubs where admin pain is worst.

Messaging:

> “Run your football club in one place — teams, players, training, matches, reports, parents, and club admin — without the spreadsheet chaos.”

### Phase 2 — Win local football ecosystems

Target:

- local leagues,
- district associations,
- county/regional bodies,
- coach education networks.

Offer:

- preferred software partnership,
- rollout support,
- import/migration services,
- data insights for local governing bodies.

### Phase 3 — Land association partnerships

Target:

- national associations or sub-national federations.

Offer:

- club engagement layer,
- volunteer tooling,
- data quality improvement,
- operational dashboards.

### Phase 4 — Expand internationally through integration-led templates

Replicate using:

- localized workflows,
- adapter integrations,
- white-label or co-branded deployments,
- regional channel partners.

### 10.2 Best commercial model

Recommended monetization mix:

1. **Freemium or low-friction entry tier**
   - one team / small club free or very low cost.

2. **Club subscription tiers**
   - based on team count, active members, or premium modules.

3. **Payments revenue**
   - transaction fee share or premium finance tooling.

4. **Association licensing**
   - per-club rollout, regional contract, or national agreement.

5. **Premium analytics / AI modules**
   - club intelligence,
   - development analytics,
   - association dashboards.

### 10.3 Key go-to-market motions

1. **Product-led adoption**
   - easy setup,
   - import existing spreadsheets,
   - invite coaches/parents quickly.

2. **Community proof**
   - case studies from early clubs,
   - testimonials from volunteer secretaries and coaches,
   - before/after admin-time savings.

3. **Association/channel distribution**
   - league and association endorsements,
   - pilot programs,
   - white-labeled rollouts.

4. **Content-led trust building**
   - guides for running grassroots clubs,
   - safeguarding/compliance checklists,
   - parent communication templates,
   - player development resources.

---

## 11. Where the real moat is

The moat is **not** a calendar, a chat tool, or a fixture list by itself.

The moat is the combination of:

- football-specific operational data,
- player development history,
- multi-role club workflows,
- association interoperability,
- volunteer-saving automation,
- and benchmark insight across many clubs.

If executed well, OurGame can sit between:

- the messy daily reality of clubs,
- and the formal data/compliance world of associations.

That is valuable and difficult to replace.

---

## 12. Recommended roadmap

### Next 3 months

- finish invite/account association rollout,
- finish push notifications and PWA support,
- add payments + membership foundations,
- add parent/guardian workflows,
- improve imports/onboarding,
- define integration architecture for association systems.

### Next 6 months

- launch club-wide communication and reminder engine,
- launch payments and fundraising,
- launch public club pages / lightweight club website features,
- add club health dashboard,
- add video-link support in reports/development plans,
- pilot one association connector.

### Next 12 months

- add country/association configuration model,
- add federation dashboards,
- add FIFA Connect / COMET / national system adapters where commercially viable,
- add AI operations assistant,
- launch benchmarking and participation analytics.

---

## Bottom line

OurGame already has a stronger football-specific product core than many generic sports tools, especially around structure, coaching, player development, training, tactics, and internal club operations.

To win the market, it should **not** chase every competitor feature equally. The best route is:

1. close the adoption gaps first: onboarding, comms, payments, parent workflows;
2. double down on football-specific development and club intelligence;
3. build a serious association integration and analytics layer;
4. sell both to clubs and to governing bodies.

If that happens, OurGame can become more than club software. It can become the operating and insight layer for grassroots football ecosystems.

---

## Sources

### Repository evidence

- Product and local-development overview: `README.md`
- Frontend product summary: `web/README.md`
- Frontend routed capability map: `web/src/App.tsx`
- Backend capability map: `api/OurGame.Api/Functions`
- Application use cases: `api/OurGame.Application/UseCases`
- Association ID fields: `api/OurGame.Persistence/Models/Player.cs`, `api/OurGame.Persistence/Models/Coach.cs`
- Association ID UI: `web/src/pages/players/PlayerSettingsPage.tsx`, `web/src/pages/coaches/CoachSettingsPage.tsx`, `web/src/pages/coaches/CoachProfilePage.tsx`, `web/src/pages/clubs/ClubPlayerSettingsPage.tsx`
- Deployment and scale foundation: `infrastructure/main.bicep`

### External research

[^spond]: Spond Club and related product/review material: https://www.spond.com/club-management/ , https://www.spond.com/en-us/news-and-blog/club-management-software-spond-club/
[^pitchero]: Pitchero product pages: https://www.pitchero.com/ , https://www.pitchero.com/features , https://www.pitchero.com/features/membership , https://www.pitchero.com/features/website-app , https://www.pitchero.com/sports/football
[^teamsnap]: TeamSnap product and market sources: https://www.teamsnap.com/ , https://www.prnewswire.com/news-releases/teamsnap-unveils-teamsnap-one-a-next-generation-platform-poised-to-redefine-the-future-of-youth-sports-technology-302617954.html
[^teamstats]: TeamStats product and market sources: https://www.teamstats.net/blog/essential-tools-every-grassroots-club-should-use , https://www.teamstats.net/blog/digital-platforms-changing-the-game-for-grassroots-teams , https://play.google.com/store/apps/details?id=net.teamstats.app&hl=en , https://apps.apple.com/gb/app/teamstats-football-team-app/id1275644100
[^playhq]: PlayHQ product sources: https://get.playhq.com/ , https://get.playhq.com/features , https://get.playhq.com/roles/clubs-associations , https://get.playhq.com/organisations
[^comet]: COMET / Analyticom and federation references: https://www.analyticom.de/products/comet/ , https://www.analyticom.de/products/comet/competition/ , https://www.analyticom.de/products/comet/registration/ , https://www.concacaf.com/news/concacaf-new-football-management-system/
[^fifaconnect]: FIFA Connect and associated references: https://inside.fifa.com/advancing-football/fifa-connect , https://inside.fifa.com/advancing-football/fifa-connect/programme-details , https://inside.fifa.com/transfer-system/clearing-house/systems-integration
[^hudlveo]: Hudl / Veo references: https://www.hudl.com/solutions/club , https://www.hudl.com/products/insight , https://sourceforge.net/software/compare/Hudl-vs-Veo/

# Competency Frameworks Reference

Six system default frameworks ship with OurGame. Each defines how the 9 competencies are weighted across four game formats (5-a-side, 7-a-side, 9-a-side, 11-a-side), with all weights summing to exactly 100 per format.

Source of truth: `api/OurGame.Persistence/Data/SeedData/SystemCompetencyFrameworkSeed.cs` (descriptions + weightings) and `CompetencyTaxonomySeedData.cs → GetDefaultDescriptions()` (band rubrics). Keep this document in sync when either changes.

---

## Competency Order

All allocation tables below follow this column order:

| # | Competency |
|---|-----------|
| 1 | Control & Receiving |
| 2 | Passing & Distribution |
| 3 | Dribbling & Manipulation |
| 4 | Striking & Finishing |
| 5 | Defending & Tackling |
| 6 | Game Intelligence |
| 7 | Speed & Acceleration |
| 8 | Physical Literacy |
| 9 | Mental / Psycho-Social |

---

## Band Thresholds (all frameworks)

| Band | Threshold |
|------|-----------|
| Development | 18 |
| Intermediate | 35 |
| Advanced | 52 |
| Elite | 70 |

---

## 1. Balanced

> A well-rounded development profile based on the Grassroot Football Competency Framework. Technical skills lead at small-sided formats, with game intelligence and mental qualities growing in weight as players progress to the full-sided game.

| Format | Ctrl | Pass | Drib | Strike | Defend | Intel | Speed | Phys | Mental | Total |
|--------|------|------|------|--------|--------|-------|-------|------|--------|-------|
| 5-a-side | 18 | 8 | 22 | 9 | 6 | 6 | 10 | 14 | 7 | 100 |
| 7-a-side | 14 | 9 | 18 | 8 | 8 | 10 | 9 | 12 | 12 | 100 |
| 9-a-side | 11 | 10 | 14 | 7 | 9 | 15 | 8 | 11 | 15 | 100 |
| 11-a-side | 9 | 10 | 11 | 6 | 10 | 20 | 7 | 12 | 15 | 100 |

**Key emphasis:** Dribbling and control lead at small formats; game intelligence and mental weight rise smoothly with format size — no category drops away suddenly.

---

## 2. Tiki-Taka

> Possession-first football built on short passing, first-touch control and constant scanning. Rewards players who keep the ball under pressure and find the spare man; raw pace and physicality are deliberately secondary.

| Format | Ctrl | Pass | Drib | Strike | Defend | Intel | Speed | Phys | Mental | Total |
|--------|------|------|------|--------|--------|-------|-------|------|--------|-------|
| 5-a-side | 22 | 22 | 16 | 6 | 4 | 14 | 4 | 6 | 6 | 100 |
| 7-a-side | 20 | 22 | 14 | 6 | 4 | 18 | 4 | 6 | 6 | 100 |
| 9-a-side | 17 | 22 | 12 | 6 | 4 | 21 | 4 | 6 | 8 | 100 |
| 11-a-side | 14 | 22 | 10 | 6 | 4 | 26 | 4 | 6 | 8 | 100 |

**Key emphasis:** Passing held at 22 across every format; control tapers as game intelligence climbs to 26 at 11-a-side. Speed and physicality pinned at the floor throughout.

---

## 3. Gegenpress

> High-intensity pressing and rapid ball recovery. Prioritises defensive duels, repeat-sprint capacity and the discipline to press as a unit — players must win the ball back fast and go again.

| Format | Ctrl | Pass | Drib | Strike | Defend | Intel | Speed | Phys | Mental | Total |
|--------|------|------|------|--------|--------|-------|-------|------|--------|-------|
| 5-a-side | 10 | 8 | 12 | 6 | 18 | 8 | 14 | 16 | 8 | 100 |
| 7-a-side | 8 | 8 | 10 | 6 | 20 | 10 | 14 | 16 | 8 | 100 |
| 9-a-side | 8 | 8 | 8 | 6 | 20 | 13 | 13 | 16 | 8 | 100 |
| 11-a-side | 6 | 8 | 6 | 6 | 22 | 16 | 12 | 16 | 8 | 100 |

**Key emphasis:** Defending climbs to 22 at 11-a-side as pressing intelligence rises with it. Physical literacy fixed at 16 and mental at 8 — pressing as a unit demands discipline and resilience, not just legs.

---

## 4. Long Ball

> Direct, vertical football that moves the ball forward early. Built on long-range distribution, clinical finishing, aerial strength and the pace to chase the channels.

| Format | Ctrl | Pass | Drib | Strike | Defend | Intel | Speed | Phys | Mental | Total |
|--------|------|------|------|--------|--------|-------|-------|------|--------|-------|
| 5-a-side | 6 | 14 | 6 | 20 | 10 | 6 | 14 | 18 | 6 | 100 |
| 7-a-side | 6 | 16 | 6 | 20 | 10 | 8 | 12 | 16 | 6 | 100 |
| 9-a-side | 6 | 18 | 6 | 18 | 10 | 10 | 11 | 15 | 6 | 100 |
| 11-a-side | 6 | 20 | 6 | 18 | 10 | 10 | 9 | 15 | 6 | 100 |

**Key emphasis:** Striking and physical (aerial) weight stay high even at large formats — direct play at 11-a-side depends on winning the second ball. Long passing grows to 20 as distribution distances increase.

---

## 5. Physical

> An athletic development profile that puts speed, strength, stamina and resilience first. Suited to teams who out-run and out-muscle opponents, with technique developed on top of a powerful physical base.

| Format | Ctrl | Pass | Drib | Strike | Defend | Intel | Speed | Phys | Mental | Total |
|--------|------|------|------|--------|--------|-------|-------|------|--------|-------|
| 5-a-side | 6 | 6 | 8 | 6 | 12 | 6 | 18 | 26 | 12 | 100 |
| 7-a-side | 6 | 6 | 8 | 6 | 12 | 8 | 18 | 24 | 12 | 100 |
| 9-a-side | 6 | 6 | 6 | 6 | 12 | 10 | 18 | 24 | 12 | 100 |
| 11-a-side | 6 | 6 | 6 | 6 | 12 | 12 | 16 | 24 | 12 | 100 |

**Key emphasis:** Speed + Physical Literacy + Mental = 52–56% of the total across all formats. Technical categories pinned at the floor.

---

## 6. Skill-Based

> A technique-first profile that maximises time on the ball. Control, dribbling, striking and passing carry most of the weight, developing confident ball-players before physical outcomes.

| Format | Ctrl | Pass | Drib | Strike | Defend | Intel | Speed | Phys | Mental | Total |
|--------|------|------|------|--------|--------|-------|-------|------|--------|-------|
| 5-a-side | 20 | 14 | 20 | 14 | 4 | 8 | 4 | 8 | 8 | 100 |
| 7-a-side | 18 | 14 | 18 | 14 | 4 | 12 | 4 | 8 | 8 | 100 |
| 9-a-side | 15 | 14 | 15 | 14 | 5 | 15 | 4 | 8 | 10 | 100 |
| 11-a-side | 13 | 14 | 13 | 13 | 5 | 18 | 4 | 10 | 10 | 100 |

**Key emphasis:** The four technical competencies (Ctrl + Pass + Drib + Strike) total 68 at 5-a-side, tapering to 53 at 11-a-side as game intelligence takes over. Speed is the lowest of any framework.

---

## Competency Band Descriptions

These rubric descriptions are shared across all six system frameworks. Edit them here to refine, then update `CompetencyTaxonomySeedData.cs → GetDefaultDescriptions()`.

---

### Control & Receiving

| Band | Description |
|------|-------------|
| Development | Brings a rolling ball under control with the dominant foot while staying balanced. |
| Intermediate | Controls rolling and bouncing balls with either foot under passive pressure. |
| Advanced | Cushions aerial and driven balls with multiple surfaces while under active pressure. |
| Elite | Kills high-velocity balls instantly with any surface, even under intense pressure in tight areas. |

---

### Passing & Distribution

| Band | Description |
|------|-------------|
| Development | Plays accurate short passes with the inside of the dominant foot. |
| Intermediate | Completes short passes with both feet and lofted passes with the dominant foot. |
| Advanced | Delivers a full range of passes to moving targets with the dominant foot, and reliable short passes with the weaker foot. |
| Elite | Breaks defensive lines with one-touch passing and lands long-range distribution on a teammate's stride. |

---

### Dribbling & Manipulation

| Band | Description |
|------|-------------|
| Development | Keeps the ball within playing distance while travelling at a jog. |
| Intermediate | Uses changes of direction and basic skill moves to beat a static defender. |
| Advanced | Keeps close control at high speed and beats active defenders 1v1 with dynamic feints. |
| Elite | Manipulates the ball flawlessly at full sprint, using micro-touches to escape pressure in tight spaces. |

---

### Striking & Finishing

| Band | Description |
|------|-------------|
| Development | Strikes a stationary ball cleanly with the laces. |
| Intermediate | Strikes a moving ball accurately at goal with the dominant foot. |
| Advanced | Finishes with power and accuracy from varied angles and distances, and can shoot with the weaker foot. |
| Elite | Finishes clinically with minimal backlift, exploiting the smallest gaps from any range under pressure. |

---

### Defending & Tackling

| Band | Description |
|------|-------------|
| Development | Understands goal-side positioning and works to win the ball back. |
| Intermediate | Times standing and sliding tackles cleanly with good body positioning. |
| Advanced | Tackles safely at speed and knows when to delay and slow an opponent's attack. |
| Elite | Organises the defensive unit, prioritising threats and structuring the press and rest-defence. |

---

### Game Intelligence

| Band | Description |
|------|-------------|
| Development | Knows the pitch boundaries and which way their team is playing. |
| Intermediate | Scans before receiving some of the time and recognises basic team shape. |
| Advanced | Scans constantly, anticipates play to intercept, and creates space with off-ball movement. |
| Elite | Plays two steps ahead — exploits blind spots, manipulates opponents and dictates the tempo of the match. |

---

### Speed & Acceleration

| Band | Description |
|------|-------------|
| Development | Runs with sound basic mechanics but lacks a quick burst off the mark. |
| Intermediate | Accelerates noticeably over short distances and outpaces opponents with a running start. |
| Advanced | Explodes from a standing start and holds high sprint speed over distance to separate from defenders. |
| Elite | First-step explosion and elite top speed create instant separation and rapid recovery runs. |

---

### Physical Literacy

| Band | Description |
|------|-------------|
| Development | Shows fundamental coordination and agility, staying balanced through basic movements. |
| Intermediate | Shields the ball with the body and sustains energy through most of training and matches. |
| Advanced | Strong core stability, competes safely in aerial duels and maintains intensity late into games. |
| Elite | Academy-level movement mechanics, dominant in physical duels and recovers rapidly between efforts. |

---

### Mental & Psycho-Social

| Band | Description |
|------|-------------|
| Development | Engages willingly and follows basic coaching instructions. |
| Intermediate | Bounces back from mistakes and starts to talk with teammates during play. |
| Advanced | Communicates tactical information clearly and stays composed under match pressure. |
| Elite | Sets and drives team standards with complete composure and psychological resilience. |

---

## Framework Comparison (11-a-side)

| Framework | Ctrl | Pass | Drib | Strike | Defend | Intel | Speed | Phys | Mental |
|-----------|------|------|------|--------|--------|-------|-------|------|--------|
| Balanced | 9 | 10 | 11 | 6 | 10 | 20 | 7 | 12 | 15 |
| Tiki-Taka | 14 | 22 | 10 | 6 | 4 | 26 | 4 | 6 | 8 |
| Gegenpress | 6 | 8 | 6 | 6 | 22 | 16 | 12 | 16 | 8 |
| Long Ball | 6 | 20 | 6 | 18 | 10 | 10 | 9 | 15 | 6 |
| Physical | 6 | 6 | 6 | 6 | 12 | 12 | 16 | 24 | 12 |
| Skill-Based | 13 | 14 | 13 | 13 | 5 | 18 | 4 | 10 | 10 |

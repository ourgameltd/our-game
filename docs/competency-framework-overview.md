# Grassroot Football Competency Framework - Detailed Technical Overview

Source workbook: docs/Grassroot Football Competency Framework.xlsx

## 1. What this framework does

This workbook converts coach-assigned competency levels into:

- weighted attribute scores,
- a total numeric player score,
- a boosted score (+10%),
- and a final overall band (Development, Intermediate, Advanced, Elite).

It supports multiple game formats (5s, 7s, 9s, 11s), each with different weighting profiles.

## 2. Workbook architecture

The model is split across 5 sheets:

1. Players
- Stores each player and their 9 competency ratings.
- Pulls final numeric score from PlayerAttributes.
- Applies +10% uplift.
- Converts boosted score to an overall band.

2. PlayerAttributes
- Core calculation engine.
- For each player and attribute, calculates: competency score x weighting factor.
- Sums all attribute contributions into a total out of 70.

3. Attributes
- Mapping table: competency -> attributes.
- Defines which competency drives each individual attribute.

4. Scoring
- Converts competency levels to numeric scores:
  - Development = 18
  - Intermediate = 35
  - Advanced = 52
  - Elite = 70

5. Weightings
- Defines attribute weights per game format (5s/7s/9s/11s).
- Derives the active weighting factor based on selected game type.
- Includes control totals to ensure each game format sums to 100%.

## 3. End-to-end calculation flow

## Step A. Coach inputs competency levels per player

On Players sheet columns B to J, each player is assigned one level for each competency:

- Control & Receiving
- Passing & Distribution
- Dribbling & Manipulation
- Striking & Finishing
- Defending & Tackling
- Game Intelligence
- Speed & Acceleration
- Physical Literacy
- Mental & Psycho-Social

## Step B. Game format selects the active weighting model

Players!B21 controls the active game type (for example: 11s).

Weightings!I uses this game type to select the right percentage from columns D:G and converts it to a decimal factor:

- formula pattern in Weightings!I2:I36:
  - XLOOKUP(Players!B21, D1:G1, XLOOKUP(AttributeName, C2:C36, D2:G36)) / 100

So if an attribute is weighted 4 in 11s, the factor becomes 0.04.

## Step C. Competency level is converted to numeric score

Scoring table maps text level to numeric score:

- Development -> 18
- Intermediate -> 35
- Advanced -> 52
- Elite -> 70

This is done in PlayerAttributes with XLOOKUP against Scoring sheet.

## Step D. Attribute contribution is calculated

For each player and attribute, PlayerAttributes computes:

Attribute contribution = LevelScore x ActiveAttributeWeightFactor

Example formula pattern:

- XLOOKUP(PlayerCompetencyLevel, Scoring!A:A, Scoring!B:B, "", 1)
  x
- XLOOKUP(AttributeName, Weightings!C2:C36, Weightings!I2:I36, "", 1)

This happens for all 35 attributes.

## Step E. All attribute contributions are summed

PlayerAttributes!AK sums each player row:

- SUM(Ax:AJx)

This total is the base score and is pulled into Players!K.

Important behavior:
- Because all weight factors sum to 1.00 (100%), the base score behaves like a weighted average of competency numeric scores.
- If all competencies are Elite, score approaches 70.
- If all competencies are Development, score approaches 18.

## Step F. +10% uplift is applied

Players!L = Players!K x 1.1

This boosted score is used for final banding.

## Step G. Boosted score is converted into overall band

Players!M uses approximate XLOOKUP:

- XLOOKUP(BoostedScore, Scoring!B2:B5, Scoring!A2:A5, "Needs Improvement", -1)

Thresholds used:

- 18 -> Development
- 35 -> Intermediate
- 52 -> Advanced
- 70 -> Elite

With +10% uplift, effective base-score thresholds are lower:

- Development starts at 18 base (practically always true in this model)
- Intermediate starts around 31.82 base
- Advanced starts around 47.27 base
- Elite starts around 63.64 base

## 4. How weightings are created and managed

## 4.1 Weighting table structure

Weightings rows 2:36 contain one row per attribute with:

- Category (Skills, Physical, Mental)
- Competency (auto-derived from Attributes mapping)
- Attribute name
- 5s weight
- 7s weight
- 9s weight
- 11s weight
- Active factor (from selected game type, decimal)

## 4.2 Competency mapping automation

Weightings column B auto-fills competency based on attribute name using Attributes sheet.

This ensures attribute-to-competency linkage is centrally controlled in one place.

## 4.3 Validation totals (control checks)

Weightings has built-in totals:

- Skills total (row 38)
- Physical total (row 39)
- Mental total (row 40)
- Combined total (row 41)

Combined totals for each game format are all 100, so the model is normalized.

## 4.4 Current category distribution by game format

From the current workbook setup:

- 5s: Skills 45, Physical 35, Mental 20
- 7s: Skills 40, Physical 30, Mental 30
- 9s: Skills 35, Physical 30, Mental 35
- 11s: Skills 30, Physical 30, Mental 40

Interpretation:
- Smaller formats prioritize technical skill.
- Larger formats increase mental/game-intelligence emphasis.

## 4.5 Current competency emphasis (high level)

Examples from current totals:

- 5s heavily favors Dribbling & Manipulation (24) and Control & Receiving (18).
- 11s heavily favors Game Intelligence (25) and Physical Literacy (17), with Striking & Finishing reduced (3).

This creates format-specific player profiling behavior.

## 5. Worked example (Alan)

Current stored values:

- Base score (Players!K2): 60.10
- Boosted score (Players!L2): 66.11
- Overall (Players!M2): Advanced

Why:

- His 9 competency levels are converted to numeric values (mostly Elite/Advanced).
- Those values are multiplied by active 11s attribute factors.
- The 35 contributions sum to 60.10.
- Applying +10% gives 66.11.
- 66.11 falls below Elite threshold 70, so overall is Advanced.

## 6. Important behaviors and edge cases

1. +10% materially shifts grading
- The uplift effectively lowers required base performance for each band.

2. Needs Improvement is unlikely in current design
- Minimum competency score is 18 and model is normalized, so boosted score is typically >= 19.8.
- The fallback label mostly protects against formula/mapping failures.

3. Fixed-range formulas
- Several formulas use fixed ranges ending at row 36.
- If you add attributes, these ranges must be extended.

4. Adding players requires formula extension
- Current player formula areas are populated for existing rows; new player rows may need copied formulas if not table-driven.

5. Text matching risk
- Competency labels and game-type labels must match expected values exactly (for example 11s).

## 7. How to safely update this framework

## Updating weightings

1. Edit Weightings D:G percentages for each attribute.
2. Verify rows 38 to 41 still show combined total 100 for every format.
3. Check a few PlayerAttributes rows for expected directional change.

## Updating competency-to-attribute mapping

1. Update Attributes sheet mapping.
2. Confirm Weightings column B auto-resolves expected competency names.
3. Recheck player totals for sanity.

## Adding an attribute

1. Add it in Attributes and Weightings.
2. Extend formula ranges that currently stop at row 36 (Weightings and PlayerAttributes lookups).
3. Verify totals still normalize to 100 for each game format.

## Adding a new game format

1. Add a new column in Weightings with percentages.
2. Update game-type lookup ranges (header and value ranges).
3. Ensure all dependent formulas include the new format.

## 8. Formula summary (quick reference)

1. Level to score:
- Scoring table lookup (text -> numeric)

2. Active attribute factor:
- selected game type percentage / 100

3. Attribute contribution:
- LevelScore x ActiveFactor

4. Player total:
- sum of 35 attribute contributions

5. Boosted score:
- total x 1.1

6. Overall band:
- approximate lookup of boosted score into 18/35/52/70 thresholds

## 9. Practical interpretation for coaches

Operationally, this framework is a weighted competency index:

- Coaches rate broad competencies once.
- The model translates those into granular attributes via mapping + weights.
- Game format selection changes what "good" means.
- Final overall is not a raw average; it is context-weighted and then uplifted.

That means the same competency profile can produce different effective outcomes depending on selected format weighting.

## 10. Competencies and current descriptions

The current competency descriptions below are taken from the Players sheet competency rubric.

### 10.1 Control & Receiving

- Development: Controls a rolling ball with dominant foot without losing balance.
- Intermediate: Controls rolling/bouncing ball with either foot under passive pressure.
- Advanced: Controls aerial/driven balls using multiple surfaces under active pressure.
- Elite: Instantly kills high-velocity balls with any body part under extreme pressure.

### 10.2 Passing & Distribution

- Development: Passes accurately over short distances with inside of dominant foot.
- Intermediate: Completes short passes with both feet and also lofted passes with dominant foot.
- Advanced: Consistently hits varied passes with dominant foot to moving targets and short passes with none dominant foot.
- Elite: Breaks defensive lines with single-touch passing and pinpoint long-range distribution.

### 10.3 Dribbling & Manipulation

- Development: Keeps the ball within playing distance at a jogging pace.
- Intermediate: Changes direction/speed to bypass a static defender using basic skill moves.
- Advanced: Close control at high speeds utilizing dynamic feints to beat active defenders 1v1.
- Elite: Flawless manipulation at maximum sprint speed using micro-touches in tight spaces.

### 10.4 Striking & Finishing

- Development: Strikes a stationary ball cleanly with the laces.
- Intermediate: Strikes a moving ball accurately toward the goal with the dominant foot.
- Advanced: Consistently strikes with power and accuracy from various angles/distances using dominant foot and can shoot with weaker foot.
- Elite: Clinical finishing with minimal backlift and exploits minute gaps from distance under duress.

### 10.5 Defending & Tackling

- Development: Understands goal-side positioning and tries to recover the ball.
- Intermediate: Executes clean standing and sliding tackles and understands body positioning.
- Advanced: Can tackle at speed and understands slowing opponent attacks down.
- Elite: Consitently organises and correct prioritises defensive responsibilities and structure press and defensive balance.

### 10.6 Game Intelligence

- Development: Understands pitch boundaries and the direction of play.
- Intermediate: Scans occasionally before receiving and recognizes basic team shape.
- Advanced: Consistently scans anticipates play to intercept and creates space off the ball.
- Elite: Operates two steps ahead of play exploits blind spots continuously and dictates match tempo.

### 10.7 Speed & Acceleration

- Development: Demonstrates basic running mechanics with functional linear sprint speed, but lacks a quick burst off the mark.
- Intermediate: Shows noticeable acceleration over short distances and can outpace opponents when given a running start.
- Advanced: Displays rapid acceleration from a standing start and maintains high sprint speed over distance to separate from active defenders.
- Elite: Possesses explosive first-step acceleration and elite maximum sprint speed, allowing for instant separation and rapid closing speed.

### 10.8 Physical Literacy

- Development: Fundamental coordination and agility without losing balance during basic movements.
- Intermediate: Shields the ball using body frame and sustains energy through majority of training and game time.
- Advanced: Exhibits strong core stability, contests aerial duels safely, and maintains high-intensity execution late in games.
- Elite: Professional-academy biomechanics, elite functional strength for physical duels, and rapid recovery throughout the entire game.

### 10.9 Mental & Psycho-Social

- Development: Engages willingly and follows basic coaching instructions.
- Intermediate: Shows resilience after mistakes and begins verbally interacting with teammates.
- Advanced: Communicates tactical info clearly and remains composed under match pressure.
- Elite: Absolute psychological resilience drives team standards and exhibits peak composure.

## 11. Categories and attributes

### 11.1 Current categories in use

| Category | Attribute count | Category totals by game format |
| --- | ---: | --- |
| Skills | 15 | 5s=45, 7s=40, 9s=35, 11s=30 |
| Physical | 9 | 5s=35, 7s=30, 9s=30, 11s=30 |
| Mental | 11 | 5s=20, 7s=30, 9s=35, 11s=40 |

### 11.2 Full attribute map (category + competency)

| Category | Competency | Attribute |
| --- | --- | --- |
| Skills | Control & Receiving | Ball Control |
| Skills | Passing & Distribution | Crossing |
| Skills | Control & Receiving | Weak Foot |
| Skills | Dribbling & Manipulation | Dribbling |
| Skills | Striking & Finishing | Finishing |
| Skills | Striking & Finishing | Free Kick |
| Skills | Physical Literacy | Heading |
| Skills | Passing & Distribution | Long Passing |
| Skills | Striking & Finishing | Long Shot |
| Skills | Striking & Finishing | Penalties |
| Skills | Passing & Distribution | Short Passing |
| Skills | Striking & Finishing | Shot Power |
| Skills | Defending & Tackling | Sliding Tackle |
| Skills | Defending & Tackling | Standing Tackle |
| Skills | Control & Receiving | Volleys |
| Physical | Speed & Acceleration | Acceleration |
| Physical | Dribbling & Manipulation | Agility |
| Physical | Dribbling & Manipulation | Balance |
| Physical | Physical Literacy | Jumping |
| Physical | Dribbling & Manipulation | Pace |
| Physical | Control & Receiving | Reactions |
| Physical | Speed & Acceleration | Sprint Speed |
| Physical | Physical Literacy | Stamina |
| Physical | Physical Literacy | Strength |
| Mental | Defending & Tackling | Aggression |
| Mental | Game Intelligence | Attacking Position |
| Mental | Game Intelligence | Awareness |
| Mental | Mental & Psycho-Social | Communication |
| Mental | Mental & Psycho-Social | Composure |
| Mental | Game Intelligence | Defensive Positioning |
| Mental | Game Intelligence | Interceptions |
| Mental | Defending & Tackling | Marking |
| Mental | Mental & Psycho-Social | Positivity |
| Mental | Game Intelligence | Positioning |
| Mental | Game Intelligence | Vision |
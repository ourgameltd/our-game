# Kit Management System

This document describes the kit management system for the football club portal.

## Overview

The kit management system allows clubs and teams to create, manage, and use custom football kits with various patterns and colors. Kits can be defined at both the club level (available to all teams) and the team level (specific to individual teams).

## Kit Structure

Each kit consists of:
- **Name**: Descriptive name (e.g., "Home Kit", "Away Kit")
- **Type**: home, away, third, goalkeeper, or training
- **Shirt**: Pattern and colors
  - Pattern types: solid, vertical-stripes, horizontal-stripes, hoops, diagonal-stripes, halves, quarters, sash, colored-sleeves, v-neck
  - Primary color (hex)
  - Secondary color (hex, optional for patterns)
  - Sleeve color (hex, optional)
- **Shorts**: Color (hex)
- **Socks**: Color (hex)
- **Active status**: Whether the kit is available for selection

## Kit Hierarchy

1. **Team Kits** (highest priority)
   - Defined at the team level
   - Override club kits when present
   - Managed via `/clubs/{clubId}/age-groups/{ageGroupId}/teams/{teamId}/kits`

2. **Club Kits**
   - Defined at the club level
   - Available to all teams in the club
   - Managed via `/clubs/{clubId}/kits`

3. **Default Kits** (fallback)
   - Simple defaults based on club colors
   - Used when no custom kits are defined

## Usage

### Creating a Kit

1. Navigate to the Kits page (club or team level)
2. Click "Create Kit"
3. Use the Kit Builder to:
   - Enter a kit name
   - Select kit type
   - Choose shirt pattern
   - Pick colors using color pickers or hex codes
   - Preview the kit in real-time
4. Save the kit

### Selecting a Kit for a Match

When creating or editing a match:
1. In the match details form, find the "Kit" dropdown
2. Kits are organized by:
   - Team Kits (if available)
   - Club Kits (if available)
   - Default Kits (always available)
3. Select the desired kit
4. The kit name will be saved with the match

## Kit Builder Features

The Kit Builder component (`src/components/kit/KitBuilder.tsx`) provides:
- Real-time preview of shirt, shorts, and socks
- Color picker with hex input
- Pattern selection with 10+ options
- Optional sleeve color customization
- Active/inactive status toggle

## Pattern Examples

- **Solid**: Single color
- **Vertical Stripes**: Classic vertical stripe pattern
- **Horizontal Stripes/Hoops**: Horizontal bands
- **Diagonal Stripes**: Angled stripes
- **Halves**: Split left/right
- **Quarters**: Four quadrants
- **Sash**: Diagonal sash across the shirt
- **Colored Sleeves**: Different color sleeves
- **V-Neck**: V-shaped neck detail

## Components

### KitBuilder
Full kit creation/editing interface with live preview
- Location: `src/components/kit/KitBuilder.tsx`

### KitCard
Compact display of a kit with preview
- Location: `src/components/kit/KitCard.tsx`

### KitSelector
Inline kit display with small preview
- Location: `src/components/kit/KitSelector.tsx`

## Pages

### ClubKitsPage
Manage all kits for a club
- Route: `/clubs/:clubId/kits`
- Location: `src/pages/clubs/ClubKitsPage.tsx`

### TeamKitsPage
Manage team-specific kits and view available club kits
- Route: `/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/kits`
- Location: `src/pages/teams/TeamKitsPage.tsx`

## Data Structure

```typescript
interface Kit {
  id: string;
  name: string;
  type: 'home' | 'away' | 'third' | 'goalkeeper' | 'training';
  shirt: {
    pattern: KitPattern;
    primaryColor: string;
    secondaryColor?: string;
    sleeveColor?: string;
  };
  shorts: {
    color: string;
  };
  socks: {
    color: string;
  };
  season?: string;
  isActive: boolean;
}
```

## Sample Data

Sample kits are defined in `src/data/clubs.ts`:
- Vale FC has 3 kits (home, away, third)
- Renton United has 1 kit (home)

## Future Enhancements

Potential future features:
- Kit history/archive by season
- Kit manufacturer logos
- Player number and name customization
- Badge placement options
- Sponsor logos
- Kit ordering/purchase integration
- Kit clash detection for fixture planning

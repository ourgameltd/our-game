# OurGame Frontend Style Guide

This is the canonical reference for all UI patterns in the OurGame frontend. Follow these patterns exactly when building or modifying any page or component. All patterns support both light and dark mode — no exceptions.

---

## Dark / Light Mode

Every colour class **must** have a `dark:` counterpart. Never use a light-mode colour without its dark equivalent.

| Token | Light | Dark |
|-------|-------|------|
| Page background | `bg-gray-50` | `dark:bg-gray-900` |
| Card / panel | `bg-white` | `dark:bg-gray-800` |
| Border | `border-gray-200` | `dark:border-gray-700` |
| Input border | `border-gray-300` | `dark:border-gray-600` |
| Input background | `bg-white` | `dark:bg-gray-800` |
| Primary text | `text-gray-900` | `dark:text-white` |
| Secondary / muted text | `text-gray-600` | `dark:text-gray-400` |
| Placeholder text | `placeholder:text-gray-400` | `dark:placeholder:text-gray-500` |
| Accent / brand | `text-primary-600` | `dark:text-primary-400` |
| Hover row / item | `hover:bg-gray-50` | `dark:hover:bg-gray-700` |
| Section heading | `text-gray-500 uppercase tracking-wider` | `dark:text-gray-400` |
| Loading skeleton | `bg-gray-200 animate-pulse` | `dark:bg-gray-700` |
| Destructive text | `text-red-600` | `dark:text-red-400` |
| Destructive border | `border-red-200` | `dark:border-red-800` |
| Destructive hover bg | `hover:bg-red-50` | `dark:hover:bg-red-900/20` |

---

## Page Layout

Pages inside the sidebar layout should use the full available width of the primary content container. Do **not** apply `max-w-*` constraints on content/data/form pages — let the sidebar handle the boundary.

```tsx
<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
  <main className="mx-auto px-4 py-4">
    {/* page content */}
  </main>
</div>
```

**Auth / standalone pages** (no sidebar, single centred form) are the only exception:

```tsx
<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
  <div className="max-w-md w-full">
    {/* centred form */}
  </div>
</div>
```

### Cards within pages

Use the `.card` utility class for content panels:

```tsx
<div className="card">
  {/* bg-white dark:bg-gray-800 rounded-lg shadow-card p-6 */}
</div>
```

For interactive/clickable cards use `.card-hover` instead.

---

## Form Fields

### CSS Classes

Use the pre-defined utility classes from `src/styles/globals.css` — do not inline equivalent Tailwind strings.

| Element | Class |
|---------|-------|
| `<input>`, `<textarea>`, `<select>` | `.input` |
| `<label>` | `.label` |

`.input` expands to:
```
w-full rounded-lg border border-gray-300 dark:border-gray-600
bg-white dark:bg-gray-800 text-gray-900 dark:text-white
px-3 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500
focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
disabled:cursor-not-allowed disabled:opacity-50
```

`.label` expands to:
```
block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5
```

### Field Structure

```tsx
<div>
  <label htmlFor="fieldId" className="label">Field Label</label>
  <input id="fieldId" className="input" />
</div>
```

Spacing between fields is handled by the parent container (`space-y-4`), not by margin on individual fields.

### Validation Error State

Add `border-red-500 dark:border-red-500` to the `.input` when invalid, and render the message below:

```tsx
<div>
  <label htmlFor="name" className="label">Name</label>
  <input
    id="name"
    className={`input ${errors.name ? 'border-red-500 dark:border-red-500' : ''}`}
  />
  {errors.name && (
    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
  )}
</div>
```

### Multi-Column Field Rows

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* field */}
  {/* field */}
</div>
```

Use `md:grid-cols-3` for three equal-width fields.

### Form Sections

Group related fields in a bordered card. Space sections with `space-y-6` on the form root.

```tsx
<form className="space-y-6">
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      Section Title
    </h2>
    <div className="space-y-4">
      {/* fields */}
    </div>
  </div>
</form>
```

### Page-Level Error Alert

```tsx
<div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
  <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
</div>
```

---

## Small Action Buttons

All small action buttons use `.btn-sm` paired with a semantic colour variant. Icon size is `w-4 h-4`. When showing icon + label text, add `gap-1.5` to the button.

### Colour Convention

| Action | Button classes | Icon (lucide-react) |
|--------|---------------|---------------------|
| Edit | `btn-sm btn-secondary` | `Pencil` |
| View / Open | `btn-sm btn-secondary` | `Eye` or `ArrowRight` |
| Copy / Clone | `btn-sm btn-secondary` | `Copy` |
| Copy success (short-lived feedback) | `btn-sm btn-success` | `Check` |
| Add / Create | `btn-sm btn-primary` | `Plus` |
| Save / Confirm | `btn-sm btn-primary` | `Check` |
| Remove (soft / reversible) | `btn-sm btn-outline-danger` | `X` or `Minus` |
| Delete (destructive) | `btn-sm btn-danger` | `Trash2` |

### Examples

**Icon + label (standard):**
```tsx
<button type="button" className="btn-sm btn-secondary gap-1.5">
  <Pencil className="w-4 h-4" />
  Edit
</button>

<button type="button" className="btn-sm btn-danger gap-1.5">
  <Trash2 className="w-4 h-4" />
  Delete
</button>
```

**Icon-only (must include `aria-label` and `title`):**
```tsx
<button
  type="button"
  className="btn-sm btn-secondary p-1.5"
  aria-label="Edit item"
  title="Edit item"
>
  <Pencil className="w-4 h-4" />
</button>

<button
  type="button"
  className="btn-sm btn-secondary p-1.5"
  aria-label="Copy link"
  title="Copy link"
>
  <Copy className="w-4 h-4" />
</button>
```

### Button Size Reference

| Class | Padding | Font size |
|-------|---------|-----------|
| `.btn-sm` | `px-3 py-1.5` | `text-sm` |
| `.btn-md` | `px-4 py-2` | `text-base` |
| `.btn-lg` | `px-6 py-3` | `text-lg` |

---

## Listing Pipe Indicator

List rows and resource cards must include a left-side narrow rounded pill to communicate status or ownership at a glance.

**This is required on all listing pages**: place the pill as the first child inside each list row/panel container (desktop and mobile).

**Use the pill approach (`w-1 rounded-full`) — not `border-l-4`, which is reserved for informational callout blocks (coach comments, blockquotes, alerts).**

### States

| State | Classes |
|-------|---------|
| Active / club-owned | `bg-primary-500 dark:bg-primary-400` |
| Shared / system default / inactive | `bg-gray-300 dark:bg-gray-600` |
| Club custom colour (age groups etc.) | `style={{ background: gradient }}` on same shell |
| Loading skeleton | `bg-gray-200 dark:bg-gray-700 animate-pulse` |

### Pattern

```tsx
<div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-3">
  {/* Pipe indicator */}
  <div
    className={`w-1 self-stretch rounded-full shrink-0 ${
      item.isActive
        ? 'bg-primary-500 dark:bg-primary-400'
        : 'bg-gray-300 dark:bg-gray-600'
    }`}
  />
  {/* Row content */}
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
  </div>
</div>
```

Use `self-stretch` so the pill fills the full row height. For fixed-height rows use `h-10` or `h-12` instead.

**Custom gradient (e.g. age group colours):**
```tsx
<div
  className="w-1 self-stretch rounded-full shrink-0"
  style={{ backgroundImage: `linear-gradient(180deg, ${primaryColor}, ${secondaryColor})` }}
/>
```

**Loading skeleton:**
```tsx
<div className="w-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse shrink-0" />
```

---

## Informational Callout Blocks

Use `border-l-4` **only** for prose-style callout blocks — not for list row indicators.

```tsx
{/* Coach comment / quote block */}
<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-600 dark:border-blue-400">
  <p className="text-gray-700 dark:text-gray-300">{comment}</p>
</div>
```

---

## Badges

```tsx
<span className="badge-primary">{label}</span>   {/* brand colour */}
<span className="badge-success">{label}</span>   {/* green */}
<span className="badge-warning">{label}</span>   {/* yellow */}
<span className="badge-danger">{label}</span>    {/* red */}
```

All badge classes are defined in `globals.css` and include dark-mode variants.

---

## Section Headings

```tsx
<h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
  Section Name
</h3>
```

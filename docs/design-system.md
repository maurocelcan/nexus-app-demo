# Nexus Design System

## Overview

Nexus uses a CSS-first design system built on **Tailwind CSS v4** with semantic token definitions in `src/app/globals.css`. TypeScript counterparts for non-CSS contexts (ECharts, Framer Motion) live in `src/theme/`.

Design principles:
- **Premium dark aesthetic** — deep backgrounds, purple/teal accents, high-contrast data
- **Data clarity** — numbers and charts are heroes; chrome stays minimal
- **Consistency via tokens** — no hardcoded colors, no magic numbers

---

## Token Reference

### CSS Tokens (`globals.css @theme inline`)

All tokens are available as Tailwind utility classes without any config.

#### Colors

| Token | Value | Tailwind class | Usage |
|---|---|---|---|
| `--color-background` | `#050509` | `bg-background` | App root, deepest level |
| `--color-surface` | `#0B0B10` | `bg-surface` | Cards, sidebar, panels |
| `--color-surface-elevated` | `#12121A` | `bg-surface-elevated` | Inputs, modals, elevated cards |
| `--color-surface-soft` | `#181824` | `bg-surface-soft` | Hover fills, subtle containers |
| `--color-surface-hover` | `#1C1C2C` | `bg-surface-hover` | Active hover state |
| `--color-border` | `#27273A` | `border-border` | Default borders |
| `--color-border-soft` | `#1B1B29` | `border-border-soft` | Subtle dividers |
| `--color-text-primary` | `#F4F4F7` | `text-text-primary` | Body text, headings |
| `--color-text-secondary` | `#A6A6B8` | `text-text-secondary` | Supporting labels |
| `--color-text-muted` | `#6F6F82` | `text-text-muted` | Metadata, hints |
| `--color-primary` | `#8B5CF6` | `text-primary`, `bg-primary` | CTAs, AI identity, active states |
| `--color-primary-soft` | `#A78BFA` | `text-primary-soft` | Secondary text on primary bg |
| `--color-primary-dark` | `#6D28D9` | `bg-primary-dark` | Hover state for primary buttons |
| `--color-accent` | `#00E0B8` | `text-accent`, `bg-accent` | Live data, key highlights |
| `--color-accent-soft` | `#5FFFE0` | `text-accent-soft` | Light accent text |
| `--color-success` | `#10B981` | `text-success`, `bg-success/15` | Positive trends, achieved goals |
| `--color-danger` | `#FB7185` | `text-danger`, `bg-danger/15` | Errors, destructive, negative |
| `--color-warning` | `#FACC15` | `text-warning`, `bg-warning/15` | Caution, pending |
| `--color-info` | `#38BDF8` | `text-info`, `bg-info/15` | Neutral informational |

#### Shadows

| Token | Tailwind class | Usage |
|---|---|---|
| `--shadow-card` | `shadow-card` | Default card depth |
| `--shadow-elevated` | `shadow-elevated` | Elevated panels |
| `--shadow-modal` | `shadow-modal` | Modals, dialogs |
| `--shadow-dropdown` | `shadow-dropdown` | Dropdown menus |
| `--shadow-glow-primary` | `shadow-glow-primary` | Primary button (resting) |
| `--shadow-glow-primary-lg` | `shadow-glow-primary-lg` | Primary button (hover) |
| `--shadow-glow-accent` | `shadow-glow-accent` | Accent elements |

#### Border Radius

| Token | Value | Tailwind mapping | Usage |
|---|---|---|---|
| `--radius-sm` | `6px` | `rounded` (approx) | Chips, small badges |
| `--radius-md` | `10px` | `rounded-lg` | Buttons, inputs |
| `--radius-lg` | `14px` | `rounded-xl` | Cards, dropdowns |
| `--radius-xl` | `20px` | `rounded-2xl` | Modals, large panels |
| — | `9999px` | `rounded-full` | Badges, avatars, pills |

> In practice: `rounded-md` on buttons/inputs, `rounded-lg` on cards, `rounded-xl` on modals, `rounded-full` on pills.

#### Typography Extras

| Token | Value | Tailwind class | Usage |
|---|---|---|---|
| `--text-caption` | `11px` | `text-caption` | Metadata, timestamps |
| `--text-metric-xl` | `40px` | `text-metric-xl` | Hero KPI values |
| `--text-metric-lg` | `32px` | `text-metric-lg` | Large KPI values |
| `--text-metric-md` | `24px` | `text-metric-md` | Standard KPI values |

#### Motion

| Token | Value | Tailwind class | Usage |
|---|---|---|---|
| `--duration-fast` | `150ms` | `duration-fast` | Micro-interactions |
| `--duration-normal` | `200ms` | `duration-normal` | Standard transitions |
| `--duration-slow` | `300ms` | `duration-slow` | Layout changes |

### TypeScript Tokens (`src/theme/`)

For non-CSS contexts (ECharts configs, Framer Motion, inline styles):

```ts
import { tokens, chartTheme } from "@/theme/tokens";
import { palette } from "@/theme/palette";
import { shadows, shadowClasses } from "@/theme/shadows";
import { typeScale, iconSizes } from "@/theme/typography";
import { spacing, layout } from "@/theme/spacing";
```

---

## Typography

**Font:** Geist Sans (primary), Geist Mono (code/data).

### Scale

| Tailwind classes | Size | Weight | Usage |
|---|---|---|---|
| `text-3xl font-bold` | 30px / 700 | — | Page heroes |
| `text-2xl font-bold` | 24px / 700 | — | Module titles |
| `text-xl font-semibold` | 20px / 600 | — | Section headings |
| `text-lg font-semibold` | 18px / 600 | — | Card title large |
| `text-base font-medium` | 16px / 500 | — | Body (rare in dense UI) |
| `text-sm` | 14px / 400 | — | **Default UI text** |
| `text-xs` | 12px / 400 | — | Labels, secondary |
| `text-caption` | 11px / 500 | — | Metadata, timestamps |
| `text-metric-xl font-bold` | 40px / 700 | — | Hero metrics |
| `text-metric-lg font-bold` | 32px / 700 | — | KPI values |
| `text-metric-md font-bold` | 24px / 700 | — | Small KPIs |
| `text-2xl font-bold` | 24px / 700 | — | Inline metrics (KpiCard) |

### Uppercase Label Pattern

Field names, section categories, and status labels use:

```tsx
<span className="text-xs font-medium text-text-muted uppercase tracking-wide">
  Revenue
</span>
```

---

## Spacing

Base unit: **4px** (`0.25rem`). All spacing via Tailwind scale.

| Classes | Value | Common use |
|---|---|---|
| `p-2 / gap-2` | 8px | Chips, badge padding |
| `p-3 / gap-3` | 12px | Button padding (sm), compact lists |
| `p-4 / gap-4` | 16px | Card padding, standard gap |
| `p-5 / gap-5` | 20px | Card header padding |
| `p-6 / gap-6` | 24px | Modal padding, section spacing |
| `p-8 / gap-8` | 32px | Major section gaps |

**Layout dimensions:**
- Sidebar: `w-60` (240px), `border-r border-border`
- Topbar: `h-14`, `border-b border-border`
- Page padding: `p-6` standard, `p-4` compact

---

## Components

### Button

**File:** `src/components/ui/button.tsx`

```tsx
// Variants
<Button variant="primary">Submit</Button>      // Purple CTA with glow
<Button variant="secondary">Cancel</Button>    // Elevated bg + border
<Button variant="ghost">Menu item</Button>     // No bg, subtle hover
<Button variant="outline">View more</Button>   // Primary border
<Button variant="danger">Delete</Button>       // Red destructive
<Button variant="link">Learn more</Button>     // Inline text link

// Sizes
<Button size="sm">Small</Button>    // h-8 px-3
<Button size="md">Default</Button>  // h-9 px-4 (default)
<Button size="lg">Large</Button>    // h-11 px-6
<Button size="icon"><Plus /></Button>     // h-9 w-9 (square)
<Button size="icon-sm"><X /></Button>    // h-7 w-7 (tight square)

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>
```

### Badge

**File:** `src/components/ui/badge.tsx`

```tsx
<Badge variant="default">Label</Badge>    // Gray chip
<Badge variant="primary">Active</Badge>   // Purple
<Badge variant="accent">Live</Badge>      // Teal
<Badge variant="success">Done</Badge>     // Green
<Badge variant="warning">Pending</Badge>  // Yellow
<Badge variant="danger">Error</Badge>     // Red
<Badge variant="info">Info</Badge>        // Blue
<Badge variant="outline">Tag</Badge>      // Border-only
```

### Card

**File:** `src/components/ui/card.tsx`

```tsx
<Card>Default surface card</Card>
<Card elevated>Elevated bg (surface-elevated)</Card>
<Card hoverable>Clickable — hover highlights primary border</Card>
<Card selectable>Selectable — softer hover for radio-style selection</Card>

// Sub-components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Body</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>
```

### Input

**File:** `src/components/ui/input.tsx`

```tsx
<Input label="Email" placeholder="mauro@example.com" />
<Input label="Search" leftIcon={<Search className="h-4 w-4" />} />
<Input error="Required field" />
<Input hint="Use your company email" />
```

Height: `h-10`. Focus: `border-primary ring-1 ring-primary/40`.

### Select

**File:** `src/components/ui/select.tsx`

Same height and styling as Input. Includes ChevronDown icon overlay.

### Modal

**File:** `src/components/ui/modal.tsx`

```tsx
<Modal open={open} onClose={close} title="Title" description="Subtitle" size="md">
  {/* content */}
</Modal>
```

Sizes: `sm` (384px), `md` (448px), `lg` (672px), `xl` (896px).

### KpiCard

**File:** `src/components/ui/kpi-card.tsx`

Takes a `SalesKpi` object. Shows: label (uppercase), value + unit, change badge with trend icon, description text.

### EmptyState

**File:** `src/components/ui/empty-state.tsx`

```tsx
<EmptyState
  icon={<FolderOpen className="h-6 w-6" />}
  title="No projects yet"
  description="Create a project to organise your analysis and track progress."
  action={<Button variant="primary" size="sm">New project</Button>}
/>

<EmptyState compact title="No results" description="Try adjusting your filters." />
```

### SectionHeader

**File:** `src/components/ui/section-header.tsx`

```tsx
<SectionHeader title="Recent Projects" description="Your 5 most recent projects">
  <Button size="sm" variant="ghost">View all</Button>
</SectionHeader>

<SectionHeader as="h3" title="Files" />
```

### Avatar

**File:** `src/components/ui/avatar.tsx`

Sizes: `sm` (h-7), `md` (h-9), `lg` (h-12). Shows image or initials with auto-assigned color.

### Spinner

**File:** `src/components/ui/spinner.tsx`

Sizes: `sm`, `md` (default), `lg`.

---

## Icons

Library: **Lucide React** exclusively. No mixing with other icon sets.

| Class | px | Usage |
|---|---|---|
| `h-3 w-3` | 12 | Inline badge icons, tiny indicators |
| `h-3.5 w-3.5` | 14 | Dense UI — sidebar, chip icons |
| `h-4 w-4` | 16 | **Default** — form icons, list icons |
| `h-5 w-5` | 20 | Section icons, button icons |
| `h-6 w-6` | 24 | Feature icons, empty states |
| `h-8 w-8` | 32 | Large illustrations |

---

## Motion

Animations use **Framer Motion**. Consistent values:

```tsx
// Enter animation (list items, cards)
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.2 }}

// Staggered list
transition={{ duration: 0.2, delay: index * 0.07 }}

// Fade only (overlays, tooltips)
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.15 }}

// Dialog
initial={{ opacity: 0, scale: 0.95, y: 8 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
transition={{ duration: 0.15 }}
```

Standard durations: fast=150ms, normal=200ms, slow=300ms.

---

## Patterns

### Section divider
```tsx
<div className="border-t border-border my-4" />
```

### Loading skeleton
```tsx
<div className="h-4 w-32 bg-surface-soft rounded animate-pulse" />
```

### Scrollable panel
```tsx
<div className="overflow-y-auto scrollbar-thin" style={{ maxHeight: "320px" }}>
```

### Contextual menu item
```tsx
<button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-soft rounded-md transition-colors">
  <Icon className="h-4 w-4" />
  Label
</button>
```

### Status badge (area / category)
```tsx
<Badge variant="default">{area}</Badge>
// or for priority:
<Badge variant="danger">Crítica</Badge>
<Badge variant="warning">Alta</Badge>
<Badge variant="info">Media</Badge>
<Badge variant="outline">Baja</Badge>
```

---

## ECharts Chart Theme

All charts share these base settings. Import from `@/theme/tokens`:

```ts
import { chartTheme, tokens } from "@/theme/tokens";

// Use in any ECharts option:
const option = {
  tooltip: { ...chartTheme.tooltip },
  legend: { textStyle: chartTheme.legend.textStyle },
  xAxis: { axisLabel: { color: chartTheme.axisLabel.color } },
  splitLine: { lineStyle: chartTheme.splitLine.lineStyle },
  // series colors:
  series: [
    { color: tokens.colors.primary },   // Sell-in
    { color: tokens.colors.accent },    // Sell-out
  ],
};
```

Default series palette: `primary (#8B5CF6)` → `accent (#00E0B8)` → `success (#10B981)` → `danger (#FB7185)`.

---

## Responsive

All layouts are mobile-first. Key breakpoints in use:

| Breakpoint | Width | Changes |
|---|---|---|
| (base) | 0–640px | Sidebar hidden, compact padding |
| `sm` | 640px | — |
| `md` | 768px | Some topbar items visible |
| `lg` | 1024px | Sidebar visible (`lg:flex`), full layout |
| `xl` | 1280px | Max content widths apply |

Sidebar: `hidden lg:flex`. Mobile: overlay drawer triggered by menu button.

---

## File Structure

```
src/
  app/globals.css          ← CSS tokens (@theme inline)
  theme/
    tokens.ts              ← All tokens as TS constants + chartTheme
    palette.ts             ← Color system documentation
    typography.ts          ← Type scale + icon sizes
    shadows.ts             ← Shadow values + Tailwind classes
    spacing.ts             ← Spacing scale + layout dimensions
  components/
    ui/
      button.tsx           ← Button (primary/secondary/ghost/danger/outline/link)
      input.tsx            ← Input with label/error/hint/icons
      select.tsx           ← Select with chevron overlay
      card.tsx             ← Card with sub-components
      badge.tsx            ← Badge (8 variants)
      modal.tsx            ← Animated modal with backdrop
      kpi-card.tsx         ← SalesKpi display card
      avatar.tsx           ← Avatar with initials fallback
      spinner.tsx          ← Loading spinner
      empty-state.tsx      ← Standardised empty state
      section-header.tsx   ← Section title + actions bar
```

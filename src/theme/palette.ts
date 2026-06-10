/**
 * Nexus Color Palette
 *
 * Semantic color system for the Nexus design language.
 * All values map 1:1 to CSS custom properties in globals.css.
 */

export const palette = {
  /** ── Brand ── */
  brand: {
    /** Primary: Nexus Purple — CTAs, AI agent identity, active states */
    primary: "#8B5CF6",
    primarySoft: "#A78BFA",
    primaryDark: "#6D28D9",
    /** Accent: Insight Teal — live data, key highlights, secondary charts */
    accent: "#00E0B8",
    accentSoft: "#5FFFE0",
  },

  /** ── Dark Surface Scale ── */
  surface: {
    /** Deepest background — app root, behind sidebars */
    background: "#050509",
    /** Default surface — cards, panels, sidebar */
    default: "#0B0B10",
    /** Elevated surface — inputs, modals, elevated cards */
    elevated: "#12121A",
    /** Soft surface — hover fills, subtle containers */
    soft: "#181824",
    /** Hover surface — interactive hover state */
    hover: "#1C1C2C",
  },

  /** ── Border Scale ── */
  border: {
    /** Default border — cards, inputs, dividers */
    default: "#27273A",
    /** Soft border — subtle separators */
    soft: "#1B1B29",
    /** Primary border — focused inputs, active cards */
    focus: "#8B5CF6",
    /** Primary border at 25% opacity — use with border-primary/25 */
    primaryGhost: "rgba(139, 92, 246, 0.25)",
  },

  /** ── Text Scale ── */
  text: {
    /** High-contrast body text */
    primary: "#F4F4F7",
    /** Secondary labels, descriptions */
    secondary: "#A6A6B8",
    /** De-emphasized metadata, hints */
    muted: "#6F6F82",
  },

  /** ── Semantic Feedback ── */
  semantic: {
    success: "#10B981",
    /** Use for errors, destructive actions, negative trends */
    danger: "#FB7185",
    /** Use for caution states, pending items */
    warning: "#FACC15",
    info: "#38BDF8",
  },
} as const;

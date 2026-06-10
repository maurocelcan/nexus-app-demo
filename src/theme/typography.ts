/**
 * Nexus Typography Scale
 *
 * Maps to Tailwind CSS utilities. Custom tokens (caption, metric-*)
 * are defined in globals.css @theme and available as text-caption, text-metric-xl, etc.
 */

export const typeScale = {
  /** Page hero / large landing headings */
  displayLg: { size: "2.25rem", weight: "700", lineHeight: "1.1" },
  /** Module-level headings */
  h1: { size: "1.875rem", weight: "700", lineHeight: "1.2" },
  /** Section headings */
  h2: { size: "1.5rem", weight: "700", lineHeight: "1.25" },
  /** Card / panel titles */
  h3: { size: "1.25rem", weight: "600", lineHeight: "1.3" },
  /** Subsection titles */
  h4: { size: "1.125rem", weight: "600", lineHeight: "1.4" },
  /** Default UI text — buttons, labels, most content */
  bodySm: { size: "0.875rem", weight: "400", lineHeight: "1.5" },
  /** Supporting text, descriptions */
  bodyXs: { size: "0.75rem", weight: "400", lineHeight: "1.4" },
  /** Metadata, timestamps, tiny labels */
  caption: { size: "0.6875rem", weight: "500", lineHeight: "1.3" },
  /** Large KPI values (hero metrics) */
  metricXl: { size: "2.5rem", weight: "700", lineHeight: "1" },
  /** Standard KPI values */
  metricLg: { size: "2rem", weight: "700", lineHeight: "1" },
  /** Small KPI values */
  metricMd: { size: "1.5rem", weight: "700", lineHeight: "1" },
} as const;

/**
 * Uppercase label pattern — used for field names, category labels, section headers.
 * Tailwind classes: "text-xs font-medium text-text-muted uppercase tracking-wide"
 */
export const uppercaseLabel = "text-xs font-medium text-text-muted uppercase tracking-wide";

/** Primary font stack */
export const fontFamily = "Geist, system-ui, -apple-system, sans-serif";

/** Monospace font stack — code, datasets, metric values in code blocks */
export const fontFamilyMono = "Geist Mono, ui-monospace, monospace";

/** Standard icon sizes (Lucide React) */
export const iconSizes = {
  /** Inline badges, tiny indicators */
  "2xs": "h-3 w-3",
  /** Dense UI — sidebar icons, chip icons */
  xs: "h-3.5 w-3.5",
  /** Default — form icons, list icons */
  sm: "h-4 w-4",
  /** Section icons, button icons */
  md: "h-5 w-5",
  /** Feature icons, empty states */
  lg: "h-6 w-6",
  /** Large illustrations */
  xl: "h-8 w-8",
} as const;

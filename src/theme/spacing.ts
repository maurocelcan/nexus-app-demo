/**
 * Nexus Spacing System
 *
 * Tailwind v4 base: 1 unit = 4px (0.25rem).
 * All spacing should derive from this scale via Tailwind utility classes.
 *
 * Standard spacing values in use across the app:
 */

export const spacing = {
  /** 4px — icon gap, tiny internal spacing */
  "1": "0.25rem",
  /** 8px — chip padding, badge gap */
  "2": "0.5rem",
  /** 12px — compact component padding */
  "3": "0.75rem",
  /** 16px — standard padding (cards, panels) */
  "4": "1rem",
  /** 20px — comfortable padding (card headers) */
  "5": "1.25rem",
  /** 24px — spacious padding (modals, sections) */
  "6": "1.5rem",
  /** 32px — major section gaps */
  "8": "2rem",
  /** 40px — hero spacing */
  "10": "2.5rem",
  /** 48px — section-level vertical rhythm */
  "12": "3rem",
  /** 64px — large vertical gaps */
  "16": "4rem",
} as const;

/**
 * Component-level spacing conventions:
 *
 * Sidebar:       px-3 py-2 (items), p-4 (header)
 * Cards:         p-4 (compact), p-5 (standard)
 * Modals:        p-6 header, px-6 pb-6 content
 * Form fields:   gap-1.5 (label+input), gap-4 (between fields)
 * Sections:      gap-4 (tight), gap-6 (standard), gap-8 (relaxed)
 * Page content:  p-6 (standard), p-4 (compact mobile)
 */

/** Sidebar dimensions */
export const layout = {
  sidebarWidth: "240px",   // w-60
  topbarHeight: "56px",    // h-14
  contentPadding: "24px",  // p-6
} as const;

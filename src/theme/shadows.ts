/**
 * Nexus Shadow System
 *
 * Named shadow values that map to --shadow-* tokens in globals.css.
 * Available as Tailwind utilities: shadow-card, shadow-elevated, etc.
 *
 * For ECharts or inline styles, import these constants directly.
 */

export const shadows = {
  /** Subtle depth for default cards */
  card: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.24)",
  /** Depth for elevated panels and popovers */
  elevated: "0 4px 16px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.24)",
  /** Full-screen dialogs and modals */
  modal: "0 20px 60px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.4)",
  /** Dropdown menus and floating panels */
  dropdown: "0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.24)",
  /** Primary button glow — resting state */
  glowPrimary: "0 0 20px rgba(139,92,246,0.25)",
  /** Primary button glow — hover state */
  glowPrimaryLg: "0 0 32px rgba(139,92,246,0.4)",
  /** Accent / teal element glow */
  glowAccent: "0 0 20px rgba(0,224,184,0.2)",
} as const;

/**
 * Tailwind shadow utility classes
 * Use these when composing component classNames.
 */
export const shadowClasses = {
  card: "shadow-card",
  elevated: "shadow-elevated",
  modal: "shadow-modal",
  dropdown: "shadow-dropdown",
  glowPrimary: "shadow-glow-primary",
  glowPrimaryLg: "shadow-glow-primary-lg",
  glowAccent: "shadow-glow-accent",
} as const;

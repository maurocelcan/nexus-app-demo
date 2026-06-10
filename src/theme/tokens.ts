/**
 * Nexus Design Tokens — TypeScript reference
 *
 * Source of truth for all design values used in non-CSS contexts:
 * ECharts configurations, Framer Motion values, dynamic styles.
 *
 * CSS counterparts live in src/app/globals.css (@theme inline).
 */

export const tokens = {
  colors: {
    // Surfaces (dark → light)
    background: "#050509",
    surface: "#0B0B10",
    surfaceElevated: "#12121A",
    surfaceSoft: "#181824",
    surfaceHover: "#1C1C2C",

    // Borders
    border: "#27273A",
    borderSoft: "#1B1B29",

    // Text
    textPrimary: "#F4F4F7",
    textSecondary: "#A6A6B8",
    textMuted: "#6F6F82",

    // Brand
    primary: "#8B5CF6",
    primarySoft: "#A78BFA",
    primaryDark: "#6D28D9",
    accent: "#00E0B8",
    accentSoft: "#5FFFE0",

    // Semantic
    success: "#10B981",
    danger: "#FB7185",
    warning: "#FACC15",
    info: "#38BDF8",
  },

  shadows: {
    card: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.24)",
    elevated: "0 4px 16px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.24)",
    modal: "0 20px 60px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.4)",
    dropdown: "0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.24)",
    glowPrimary: "0 0 20px rgba(139,92,246,0.25)",
    glowPrimaryLg: "0 0 32px rgba(139,92,246,0.4)",
    glowAccent: "0 0 20px rgba(0,224,184,0.2)",
  },

  radii: {
    sm: "6px",
    md: "10px",
    lg: "14px",
    xl: "20px",
    full: "9999px",
  },

  duration: {
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
  },

  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  /** Stagger delay increment for list animations (seconds) */
  staggerDelay: 0.07,
} as const;

/**
 * Chart theme preset for ECharts — keeps all chart configs in sync with the design system.
 *
 * Usage:
 *   import { chartTheme } from "@/theme/tokens";
 *   option = { ...yourOption, tooltip: { ...chartTheme.tooltip, ... } };
 */
export const chartTheme = {
  backgroundColor: tokens.colors.surfaceElevated,
  textStyle: {
    color: tokens.colors.textSecondary,
    fontFamily: "Geist, system-ui, sans-serif",
  },
  tooltip: {
    backgroundColor: tokens.colors.surfaceElevated,
    borderColor: tokens.colors.border,
    borderRadius: 10,
    textStyle: { color: tokens.colors.textPrimary, fontSize: 12 },
    extraCssText: `box-shadow: ${tokens.shadows.dropdown}`,
  },
  axisLine: { lineStyle: { color: tokens.colors.border } },
  axisLabel: { color: tokens.colors.textSecondary, fontSize: 11 },
  splitLine: { lineStyle: { color: tokens.colors.borderSoft } },
  legend: { textStyle: { color: tokens.colors.textSecondary, fontSize: 12 } },
  /** Default series color palette */
  series: {
    primary: tokens.colors.primary,
    accent: tokens.colors.accent,
    success: tokens.colors.success,
    danger: tokens.colors.danger,
    warning: tokens.colors.warning,
    info: tokens.colors.info,
    primarySoft: tokens.colors.primarySoft,
  },
} as const;

export type ColorToken = keyof typeof tokens.colors;
export type ShadowToken = keyof typeof tokens.shadows;
export type RadiusToken = keyof typeof tokens.radii;

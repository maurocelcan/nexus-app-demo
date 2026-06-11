import { tokens, type ColorToken } from "@/theme/tokens";

export function tokenColor(color: ColorToken) {
  return tokens.colors[color];
}

export function alpha(color: ColorToken, opacity: number) {
  const hex = tokenColor(color).replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

export function radialGlow(color: ColorToken, opacity: number) {
  return `radial-gradient(ellipse, ${alpha(color, opacity)} 0%, transparent 70%)`;
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number, decimals = 0): string {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatVolume(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function formatPercentage(n: number, decimals = 1): string {
  return `${new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(n)}%`;
}

export function formatRatio(n: number, decimals = 2): string {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(decimals)}%`;
}

export function formatCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 }).format(n / 1_000_000)}M`;
  if (Math.abs(n) >= 1_000) return `$${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(n / 1_000)}K`;
  return `$${formatCount(n)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

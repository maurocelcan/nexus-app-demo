"use client";
import * as React from "react";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import type { SalesKpi } from "@/types/analytics";

export function KpiCard({ kpi }: { kpi: SalesKpi }) {
  const isPositive = kpi.changeType === "positive";
  const isNegative = kpi.changeType === "negative";
  const isNA = kpi.value === "N/A";

  const changeDisplay = kpi.change !== 0
    ? `${kpi.change > 0 ? "+" : ""}${Math.round(kpi.change * 10) / 10}%`
    : "–";

  const labelEl = (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-xs font-medium text-text-muted uppercase tracking-wide leading-tight truncate">
        {kpi.label}
      </span>
      {kpi.tooltip && (
        <Tooltip content={kpi.tooltip} maxWidth={260}>
          <Info className="h-3 w-3 text-text-muted/60 hover:text-text-muted shrink-0 transition-colors cursor-default" />
        </Tooltip>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 hover:border-border-soft hover:bg-surface-elevated transition-all h-full min-h-[128px]">
      {/* Row 1: label + info icon | change badge */}
      <div className="flex items-center justify-between gap-1">
        {labelEl}
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full shrink-0",
            isPositive && "text-success bg-success/10",
            isNegative && "text-danger bg-danger/10",
            (!isPositive && !isNegative) && "text-text-muted bg-surface-soft"
          )}
        >
          {isPositive && <TrendingUp className="h-3 w-3" />}
          {isNegative && <TrendingDown className="h-3 w-3" />}
          {!isPositive && !isNegative && <Minus className="h-3 w-3" />}
          {changeDisplay}
        </span>
      </div>

      {/* Row 2: value */}
      <div className="flex items-baseline gap-1 flex-wrap">
        <span className={cn(
          "text-2xl font-bold leading-none",
          isNA ? "text-text-muted" : "text-text-primary"
        )}>
          {kpi.value}
        </span>
        {kpi.unit && !isNA && (
          <span className="text-sm text-text-muted">{kpi.unit}</span>
        )}
      </div>

      {/* Row 3: short description (period / context) — no source, no long reasons */}
      {kpi.description && (
        <p className="text-xs text-text-muted leading-relaxed line-clamp-1 mt-auto">
          {kpi.description}
        </p>
      )}
    </div>
  );
}

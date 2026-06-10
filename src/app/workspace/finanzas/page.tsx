"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import type { EChartsOption } from "echarts";
import {
  AlertTriangle, Lightbulb, AlertCircle,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getActiveDataset, getWorkspaceDatasetState, useDataSourceStore } from "@/stores/data-source-store";
import { ModuleDatasetEmptyState } from "@/components/workspace/dataset-state-panels";
import { ModuleDataSourceBanner } from "@/components/workspace/module-data-source-banner";
import { ModuleHeader } from "@/components/workspace/module-chrome";
import type {
  FinanzasChannelRow,
  FinanzasHeadcountRow,
  FinanzasMonthlyEbitdaRow,
  FinanzasPnlMatrix,
} from "@/lib/finanzas-real";
import { buildFinanzasViewModel } from "@/lib/view-models/finanzas-view-model";
import { ROUTES } from "@/lib/routes";
import {
  FINANZAS_INSIGHTS,
  FINANZAS_QUESTIONS,
} from "@/data/mock-finanzas";
import type { SalesFilterPeriod } from "@/types/sales";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const CHART_COLORS = {
  primary: "#8B5CF6",
  accent: "#00E0B8",
  success: "#10B981",
  danger: "#FB7185",
  warning: "#FACC15",
  grid: "#1B1B29",
  axis: "#6F6F82",
  tooltip: { bg: "#12121A", border: "#27273A" },
};

const PERIODS: { value: SalesFilterPeriod; label: string }[] = [
  { value: "YTD", label: "YTD" },
  { value: "QTD", label: "QTD" },
  { value: "6M", label: "Últimos 6M" },
  { value: "MTD", label: "MTD" },
];

const REFERENCE_YEARS = [2024, 2025, 2026];

// ─── Gráfico EBITDA mensual — componente unificado ────────────────────────────
function EbitdaMonthlyChart({ rows }: { rows: FinanzasMonthlyEbitdaRow[] }) {
  if (rows.length === 0) {
    return <EmptyChartState message="No hay serie mensual de EBITDA para el período seleccionado." />;
  }
  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: CHART_COLORS.tooltip.bg,
      borderColor: CHART_COLORS.tooltip.border,
      textStyle: { color: "#F4F4F7", fontSize: 12 },
    },
    legend: { data: ["EBITDA", "EBITDA %"], textStyle: { color: "#A6A6B8", fontSize: 11 }, top: 4, right: 8 },
    grid: { left: 54, right: 50, top: 42, bottom: 30 },
    xAxis: {
      type: "category",
      data: rows.map((row) => row.month),
      axisLabel: { color: CHART_COLORS.axis, fontSize: 10 },
      axisLine: { lineStyle: { color: "#27273A" } },
    },
    yAxis: [
      { type: "value", name: "$", axisLabel: { color: CHART_COLORS.axis, fontSize: 10, formatter: (v: number) => `${(v / 1000).toFixed(0)}K` }, splitLine: { lineStyle: { color: CHART_COLORS.grid } } },
      { type: "value", name: "%", axisLabel: { color: CHART_COLORS.axis, fontSize: 10, formatter: (v: number) => `${v}%` }, splitLine: { show: false } },
    ],
    series: [
      { name: "EBITDA", type: "bar", data: rows.map((row) => row.ebitda), yAxisIndex: 0, itemStyle: { color: CHART_COLORS.primary, borderRadius: [4, 4, 0, 0] } },
      { name: "EBITDA %", type: "line", data: rows.map((row) => row.ebitdaPct ?? null), yAxisIndex: 1, smooth: true, lineStyle: { color: CHART_COLORS.accent, width: 2 }, symbol: "circle", symbolSize: 5, itemStyle: { color: CHART_COLORS.accent } },
    ],
  };
  return <ReactECharts option={option} style={{ height: 240 }} notMerge />;
}

// ─── Gráfico Headcount — componente unificado ─────────────────────────────────
function HeadcountChart({ rows }: { rows: FinanzasHeadcountRow[] }) {
  if (rows.length === 0) {
    return <EmptyChartState message="No hay datos de headcount para el período seleccionado." />;
  }
  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: CHART_COLORS.tooltip.bg,
      borderColor: CHART_COLORS.tooltip.border,
      textStyle: { color: "#F4F4F7", fontSize: 12 },
      formatter: (params) => {
        const list = Array.isArray(params) ? params : [params];
        const label = String(list[0]?.name ?? "");
        const row = rows.find((item) => item.label === label);
        const lines = list.map((item) => `${item.marker} ${item.seriesName}: ${Number(item.value ?? 0).toFixed(1)}`);
        if (row?.variationPct !== undefined) lines.push(`Var %: ${Math.round(row.variationPct * 10) / 10}%`);
        if (row?.variationAbs !== undefined) lines.push(`Var nominal: ${Math.round(row.variationAbs * 10) / 10}`);
        return [label, ...lines].join("<br/>");
      },
    },
    legend: { data: ["2025", "2026"], textStyle: { color: "#A6A6B8", fontSize: 11 }, top: 4 },
    grid: { left: 32, right: 16, top: 42, bottom: 34, containLabel: true },
    xAxis: { type: "category", data: rows.map((row) => row.label), axisLabel: { color: CHART_COLORS.axis, fontSize: 11 }, axisLine: { lineStyle: { color: "#27273A" } } },
    yAxis: { type: "value", axisLabel: { color: CHART_COLORS.axis, fontSize: 10 }, splitLine: { lineStyle: { color: CHART_COLORS.grid } } },
    series: [
      { name: "2025", type: "bar", data: rows.map((row) => row.priorValue ?? 0), barMaxWidth: 72, itemStyle: { color: CHART_COLORS.axis, borderRadius: [3, 3, 0, 0] } },
      { name: "2026", type: "bar", data: rows.map((row) => row.value ?? 0), barMaxWidth: 72, itemStyle: { color: CHART_COLORS.accent, borderRadius: [3, 3, 0, 0] } },
    ],
  };
  return <ReactECharts option={option} style={{ height: 260 }} notMerge />;
}

// ─── Tabla Revenue por Canal — componente unificado ───────────────────────────
function ChannelTable({ rows }: { rows: FinanzasChannelRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-xs text-text-muted">No hay granularidad financiera por canal para el período seleccionado.</p>
      </div>
    );
  }
  return (
    <div className="max-h-[360px] overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-surface z-10">
          <tr className="border-b border-border text-text-muted text-xs">
            <th className="text-left py-2 font-medium">Canal</th>
            <th className="text-right py-2 font-medium">Net Revenue</th>
            <th className="text-right py-2 font-medium">EBITDA</th>
            <th className="text-right py-2 font-medium">Trade Spend</th>
            <th className="text-right py-2 font-medium">EBITDA %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.label} className="text-text-secondary hover:bg-surface-soft transition-colors">
              <td className="py-2.5 pr-3 text-text-primary font-medium">{row.label}</td>
              <td className="py-2.5 text-right">{row.netRevenue !== undefined ? formatCurrency(row.netRevenue) : "N/A"}</td>
              <td className="py-2.5 text-right">{row.ebitda !== undefined ? formatCurrency(row.ebitda) : "N/A"}</td>
              <td className="py-2.5 text-right">{row.tradeSpend !== undefined ? formatCurrency(row.tradeSpend) : "N/A"}</td>
              <td className="py-2.5 text-right">
                <span className={cn("font-medium", (row.marginPct ?? 0) >= 15 ? "text-success" : (row.marginPct ?? 0) > 0 ? "text-warning" : "text-text-muted")}>
                  {row.marginPct !== undefined ? `${row.marginPct}%` : "N/A"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Empty state genérico para gráficos ───────────────────────────────────────
function EmptyChartState({ message }: { message?: string }) {
  return (
    <div className="h-[220px] rounded-lg border border-dashed border-border bg-surface-soft flex items-center justify-center px-6 text-center">
      <p className="text-xs text-text-muted leading-relaxed">
        {message ?? "No hay datos suficientes para este gráfico con los filtros seleccionados."}
      </p>
    </div>
  );
}

function formatPnlValue(value: number | undefined, unit?: string): string {
  if (value === undefined) return "N/A";
  if (unit === "pct") {
    return formatPercentage(value * (Math.abs(value) <= 1 ? 100 : 1));
  }
  const isNegative = value < 0;
  return `${isNegative ? "-" : ""}${formatCurrency(Math.abs(value))}`;
}

function PnlMatrixTable({ matrix }: { matrix: FinanzasPnlMatrix }) {
  if (!matrix.hasMonthlyData) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-soft px-6 py-10 text-center">
        <p className="text-sm font-medium text-text-primary">No hay datos mensuales de P&amp;L para este año.</p>
        <p className="mt-1 text-xs text-text-muted">Elegí otro año disponible o cargá una fuente con bloque mensual de Finanzas BIS.</p>
      </div>
    );
  }

  const tableMinWidth = 230 + 132 + matrix.months.length * 112;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface">
      <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-10 bg-gradient-to-l from-surface to-transparent" />
      <div className="max-h-[520px] overflow-auto scroll-smooth">
        <table className="w-full border-separate border-spacing-0 text-sm" style={{ minWidth: tableMinWidth }}>
          <thead className="sticky top-0 z-20 bg-surface-elevated">
            <tr className="text-[11px] uppercase tracking-wide text-text-muted">
              <th className="sticky left-0 z-30 min-w-[230px] border-b border-border bg-surface-elevated px-4 py-3 text-left font-medium">
                Concepto
              </th>
              <th className="min-w-[132px] border-b border-border bg-surface-elevated px-4 py-3 text-right font-medium text-text-secondary">
                {matrix.totalLabel}
              </th>
              {matrix.months.map((month) => (
                <th key={month.key} className="min-w-[112px] border-b border-border bg-surface-elevated px-4 py-3 text-right font-medium">
                  {month.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map((row, index) => {
              const isSection = row.isTotal;
              return (
                <tr key={`${row.key}-${row.name}-${index}`} className={cn("group", isSection && "font-semibold")}>
                  <td className={cn(
                    "sticky left-0 z-10 border-b border-border bg-surface px-4 py-3 text-left text-text-secondary group-hover:bg-surface-soft",
                    isSection && "bg-surface-elevated text-text-primary"
                  )}>
                    {row.name}
                  </td>
                  <td className={cn(
                    "border-b border-border px-4 py-3 text-right font-mono text-text-primary group-hover:bg-surface-soft",
                    row.total !== undefined && row.total < 0 && "text-danger",
                    row.unit === "pct" && "text-accent"
                  )}>
                    {formatPnlValue(row.total, row.unit)}
                  </td>
                  {matrix.months.map((month) => {
                    const value = row.months[month.key];
                    return (
                      <td
                        key={month.key}
                        className={cn(
                          "border-b border-border px-4 py-3 text-right font-mono text-text-secondary group-hover:bg-surface-soft",
                          value !== undefined && value < 0 && "text-danger",
                          row.unit === "pct" && "text-accent"
                        )}
                      >
                        {formatPnlValue(value, row.unit)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const INSIGHT_CONFIG = {
  alert: { icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10 border-danger/25" },
  opportunity: { icon: Lightbulb, color: "text-accent", bg: "bg-accent/10 border-accent/25" },
  warning: { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10 border-warning/25" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FinanzasPage() {
  const router = useRouter();
  const { hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource } = useDataSourceStore();
  const datasetState = getWorkspaceDatasetState({ hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource });
  const activeDataset = getActiveDataset({ hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource });
  const isRealDataset = datasetState === "real";

  const [period, setPeriod] = useState<SalesFilterPeriod>("YTD");
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const vm = buildFinanzasViewModel(isRealDataset ? "real" : "demo", activeDataset, period, selectedYear);
  const yearOptions = Array.from(new Set([...REFERENCE_YEARS, ...vm.pnlMatrix.years])).sort((a, b) => b - a);

  const showInsights = !isRealDataset;
  const headcountCutLabel = vm.headcountRows[0]?.label ?? (period === "QTD" ? "Q1" : period === "6M" ? "U6M" : period);

  if (datasetState === "empty") return <ModuleDatasetEmptyState moduleId="finanzas" />;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-7xl mx-auto">
      <ModuleHeader moduleId="finanzas" />

      <ModuleDataSourceBanner datasetState={datasetState} dataset={activeDataset} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide mr-1">Período</span>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                period === p.value
                  ? "bg-primary text-white"
                  : "bg-surface-elevated border border-border text-text-secondary hover:border-primary/30 hover:text-text-primary"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        {yearOptions.length > 0 && (
          <label className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Año</span>
            <select
              value={vm.pnlMatrix.selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="h-8 rounded-md border border-border bg-surface-elevated px-3 text-xs font-medium text-text-primary outline-none transition-colors hover:border-primary/30 focus:border-primary"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* KPI Strip — 2 filas de 4 */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {vm.kpis.slice(0, 4).map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </div>
        {vm.kpis.length > 4 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {vm.kpis.slice(4, 8).map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        )}
      </div>

      {/* P&L mensual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">
            P&amp;L mensual — {vm.pnlMatrix.selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PnlMatrixTable matrix={vm.pnlMatrix} />
        </CardContent>
      </Card>

      {/* Gráficos — misma estructura demo y real */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">EBITDA mensual y EBITDA %</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <EbitdaMonthlyChart rows={vm.ebitdaRows} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">
              Headcount — {headcountCutLabel} 25 vs {headcountCutLabel} 26
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <HeadcountChart rows={vm.headcountRows} />
          </CardContent>
        </Card>
      </div>

      {/* Revenue por canal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">Revenue y Margen por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <ChannelTable rows={vm.channelRows} />
        </CardContent>
      </Card>

      {/* Insights — sólo demo */}
      {showInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {FINANZAS_INSIGHTS.map((insight, i) => {
            const config = INSIGHT_CONFIG[insight.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn("rounded-xl border p-4", config.bg)}
              >
                <div className="flex items-start gap-2 mb-2">
                  <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", config.color)} />
                  <p className="text-sm font-medium text-text-primary leading-snug">{insight.title}</p>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-3">{insight.description}</p>
                {insight.impact && (
                  <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", config.bg, config.color)}>
                    {insight.impact}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Preguntas IA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">Preguntale a la IA sobre Finanzas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FINANZAS_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => router.push(ROUTES.WORKSPACE)}
                className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg border border-border bg-surface hover:bg-surface-soft hover:border-primary/30 transition-all text-left group"
              >
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{q}</span>
                <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-primary transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

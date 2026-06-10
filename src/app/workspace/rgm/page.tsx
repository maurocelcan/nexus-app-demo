"use client";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import {
  AlertTriangle, Lightbulb, AlertCircle,
  ArrowRight, TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getActiveDataset, getWorkspaceDatasetState, useDataSourceStore } from "@/stores/data-source-store";
import { ModuleDatasetEmptyState } from "@/components/workspace/dataset-state-panels";
import { ModuleDataSourceBanner } from "@/components/workspace/module-data-source-banner";
import { ModuleHeader } from "@/components/workspace/module-chrome";
import { resolveModuleKpis } from "@/data/module-dataset-state";
import { ROUTES } from "@/lib/routes";
import {
  RGM_KPIS, PRICE_INDEX_SKU, MIX_EVOLUCION, REVENUE_POR_BANDA,
  ESCENARIOS_PRECIO, ASP_TREND, RGM_INSIGHTS, RGM_QUESTIONS,
} from "@/data/mock-rgm";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const COLORS = {
  primary: "#8B5CF6", accent: "#00E0B8", success: "#10B981",
  danger: "#FB7185", warning: "#FACC15", grid: "#1B1B29", axis: "#6F6F82",
  tooltip: { bg: "#12121A", border: "#27273A" },
};

function AspTrendChart() {
  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", backgroundColor: COLORS.tooltip.bg, borderColor: COLORS.tooltip.border, textStyle: { color: "#F4F4F7", fontSize: 12 } },
    legend: { data: ["ASP Real", "ASP Target"], textStyle: { color: "#A6A6B8", fontSize: 11 }, top: 4, right: 8 },
    grid: { left: 44, right: 16, top: 36, bottom: 28 },
    xAxis: { type: "category", data: ASP_TREND.labels, axisLabel: { color: COLORS.axis, fontSize: 11 }, axisLine: { lineStyle: { color: "#27273A" } } },
    yAxis: {
      type: "value", min: 34,
      axisLabel: { color: COLORS.axis, fontSize: 10, formatter: (v: number) => `$${v}` },
      splitLine: { lineStyle: { color: COLORS.grid } },
    },
    series: [
      { name: "ASP Real", type: "line", data: ASP_TREND.asp, smooth: true, lineStyle: { color: COLORS.primary, width: 2.5 }, areaStyle: { color: `${COLORS.primary}20` }, symbol: "circle", symbolSize: 6, itemStyle: { color: COLORS.primary } },
      { name: "ASP Target", type: "line", data: ASP_TREND.target, smooth: true, lineStyle: { color: COLORS.accent, width: 1.5, type: "dashed" }, symbol: "none", itemStyle: { color: COLORS.accent } },
    ],
  };
  return <ReactECharts option={option} style={{ height: 200 }} notMerge />;
}

function MixEvolucionChart() {
  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", backgroundColor: COLORS.tooltip.bg, borderColor: COLORS.tooltip.border, textStyle: { color: "#F4F4F7", fontSize: 12 } },
    legend: { data: ["Premium %", "Standard %"], textStyle: { color: "#A6A6B8", fontSize: 11 }, top: 4, right: 8 },
    grid: { left: 44, right: 16, top: 36, bottom: 28 },
    xAxis: { type: "category", data: MIX_EVOLUCION.labels, axisLabel: { color: COLORS.axis, fontSize: 11 }, axisLine: { lineStyle: { color: "#27273A" } } },
    yAxis: { type: "value", axisLabel: { color: COLORS.axis, fontSize: 10, formatter: (v: number) => `${v}%` }, splitLine: { lineStyle: { color: COLORS.grid } } },
    series: [
      { name: "Premium %", type: "bar", data: MIX_EVOLUCION.premium, stack: "mix", itemStyle: { color: COLORS.accent } },
      { name: "Standard %", type: "bar", data: MIX_EVOLUCION.standard, stack: "mix", itemStyle: { color: `${COLORS.primary}60` } },
    ],
  };
  return <ReactECharts option={option} style={{ height: 200 }} notMerge />;
}

const INSIGHT_CONFIG = {
  alert: { icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10 border-danger/25" },
  opportunity: { icon: Lightbulb, color: "text-accent", bg: "bg-accent/10 border-accent/25" },
  warning: { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10 border-warning/25" },
};

export default function RgmPage() {
  const router = useRouter();
  const { hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource } = useDataSourceStore();
  const datasetState = getWorkspaceDatasetState({ hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource });
  const activeDataset = getActiveDataset({ hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource });

  const demoKpis = [
    { label: "Price Index", value: "0.96", unit: "vs Competencia", change: RGM_KPIS.priceIndex.change, changeType: RGM_KPIS.priceIndex.changeType, description: "Promedio portafolio" },
    { label: "ASP", value: "$37.4", unit: "por caja", change: RGM_KPIS.asp.change, changeType: RGM_KPIS.asp.changeType, description: "YTD 2026" },
    { label: "Mix Premium", value: "23.1%", unit: "del volumen", change: RGM_KPIS.mixPremium.change, changeType: RGM_KPIS.mixPremium.changeType, description: "vs 19.8% ene" },
    { label: "Revenue Uplift", value: "$180K", unit: "USD", change: RGM_KPIS.revenueUplift.change, changeType: RGM_KPIS.revenueUplift.changeType, description: "vs plan base" },
  ];
  const kpis = resolveModuleKpis({ moduleId: "rgm", datasetState, activeDataset, demoKpis });

  if (datasetState === "empty") return <ModuleDatasetEmptyState moduleId="rgm" />;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-7xl mx-auto">
      <ModuleHeader moduleId="rgm" />

      <ModuleDataSourceBanner datasetState={datasetState} dataset={activeDataset} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">ASP Real vs Target ($/caja)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <AspTrendChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">Evolución de Mix Premium vs Standard</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <MixEvolucionChart />
          </CardContent>
        </Card>
      </div>

      {/* Price Index by SKU */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">Price Index y Elasticidad por SKU</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted text-xs">
                  <th className="text-left py-2 font-medium">SKU</th>
                  <th className="text-right py-2 font-medium">ASP Real</th>
                  <th className="text-right py-2 font-medium">Competidor</th>
                  <th className="text-right py-2 font-medium">Price Index</th>
                  <th className="text-right py-2 font-medium">Elasticidad</th>
                  <th className="text-right py-2 font-medium">Potencial %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PRICE_INDEX_SKU.map((row) => (
                  <tr key={row.sku} className="text-text-secondary hover:bg-surface-soft transition-colors">
                    <td className="py-2.5 text-text-primary font-medium">{row.sku}</td>
                    <td className="py-2.5 text-right">${row.asp}</td>
                    <td className="py-2.5 text-right text-text-muted">${row.competidor}</td>
                    <td className="py-2.5 text-right">
                      <span className={cn("font-semibold", row.priceIndex < 0.95 ? "text-warning" : row.priceIndex > 1.02 ? "text-danger" : "text-success")}>
                        {row.priceIndex.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-text-secondary">{row.elasticidad}</td>
                    <td className="py-2.5 text-right">
                      {row.potencial > 0 ? (
                        <span className="flex items-center justify-end gap-1 text-success font-medium">
                          <TrendingUp className="h-3.5 w-3.5" />
                          +{row.potencial}%
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Revenue por banda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">Revenue por Banda de Precio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {REVENUE_POR_BANDA.map((band) => (
              <div key={band.banda}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-sm text-text-primary font-medium">{band.banda}</span>
                    <span className="text-xs text-text-muted ml-2">{band.share}% del revenue</span>
                  </div>
                  <span className="text-sm font-semibold text-text-secondary">${(band.revenue / 1000).toFixed(0)}K</span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${band.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Escenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">Simulador de Escenarios de Precio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ESCENARIOS_PRECIO.map((esc, i) => (
              <div key={i} className={cn("flex items-center justify-between px-3 py-3 rounded-lg border transition-colors", i === 0 ? "border-border bg-surface" : "border-border bg-surface hover:bg-surface-soft")}>
                <div>
                  <p className="text-sm font-medium text-text-primary">{esc.escenario}</p>
                  {esc.uptickPrecio > 0 && <p className="text-xs text-text-muted">Precio +{esc.uptickPrecio}% · Volumen {esc.impactoVolumen}%</p>}
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-text-muted">Revenue</p>
                    <p className={cn("text-sm font-semibold", esc.impactoRevenue > 0 ? "text-success" : "text-text-muted")}>
                      {esc.impactoRevenue > 0 ? `+$${(esc.impactoRevenue / 1000).toFixed(0)}K` : "Base"}
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-text-muted">Margen</p>
                    <p className={cn("text-sm font-semibold", esc.impactoMargen > 0 ? "text-success" : "text-text-muted")}>
                      {esc.impactoMargen > 0 ? `+${esc.impactoMargen}pp` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {RGM_INSIGHTS.map((insight, i) => {
          const config = INSIGHT_CONFIG[insight.type];
          const Icon = config.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={cn("rounded-xl border p-4", config.bg)}>
              <div className="flex items-start gap-2 mb-2">
                <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", config.color)} />
                <p className="text-sm font-medium text-text-primary leading-snug">{insight.title}</p>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">{insight.description}</p>
              {insight.impact && <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", config.bg, config.color)}>{insight.impact}</span>}
            </motion.div>
          );
        })}
      </div>

      {/* AI Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">Preguntale a la IA sobre RGM</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {RGM_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => router.push(ROUTES.WORKSPACE)} className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg border border-border bg-surface hover:bg-surface-soft hover:border-primary/30 transition-all text-left group">
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

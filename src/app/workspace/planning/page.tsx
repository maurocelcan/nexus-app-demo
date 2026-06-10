"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import {
  AlertTriangle, Lightbulb, AlertCircle,
  ArrowRight,
  CheckCircle2, Clock, Circle,
} from "lucide-react";
import { motion } from "framer-motion";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getActiveDataset, getWorkspaceDatasetState, useDataSourceStore } from "@/stores/data-source-store";
import { ROUTES } from "@/lib/routes";
import { ModuleDatasetEmptyState } from "@/components/workspace/dataset-state-panels";
import { ModuleDataSourceBanner } from "@/components/workspace/module-data-source-banner";
import { ModuleHeader } from "@/components/workspace/module-chrome";
import { resolveModuleKpis } from "@/data/module-dataset-state";
import {
  PLANNING_KPIS, FORECAST_VS_ACTUAL, ESCENARIOS_H2, REVENUE_PROJECTION,
  DEMAND_PLAN_SKU, HITOS_PLANIFICACION, PLANNING_INSIGHTS, PLANNING_QUESTIONS,
} from "@/data/mock-planning";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const COLORS = {
  primary: "#8B5CF6", accent: "#00E0B8", success: "#10B981",
  danger: "#FB7185", warning: "#FACC15", grid: "#1B1B29", axis: "#6F6F82",
  tooltip: { bg: "#12121A", border: "#27273A" },
};

function ForecastChart() {
  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", backgroundColor: COLORS.tooltip.bg, borderColor: COLORS.tooltip.border, textStyle: { color: "#F4F4F7", fontSize: 12 } },
    legend: { data: ["Forecast", "Real"], textStyle: { color: "#A6A6B8", fontSize: 11 }, top: 4, right: 8 },
    grid: { left: 44, right: 16, top: 36, bottom: 28 },
    xAxis: { type: "category", data: FORECAST_VS_ACTUAL.labels, axisLabel: { color: COLORS.axis, fontSize: 10 }, axisLine: { lineStyle: { color: "#27273A" } } },
    yAxis: {
      type: "value",
      axisLabel: { color: COLORS.axis, fontSize: 10, formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
      splitLine: { lineStyle: { color: COLORS.grid } },
    },
    series: [
      {
        name: "Forecast",
        type: "bar",
        data: FORECAST_VS_ACTUAL.forecast,
        itemStyle: { color: `${COLORS.primary}60`, borderRadius: [3, 3, 0, 0] },
      },
      {
        name: "Real",
        type: "bar",
        data: FORECAST_VS_ACTUAL.actual.map((v) => v ?? 0),
        itemStyle: { color: COLORS.accent, borderRadius: [3, 3, 0, 0] },
      },
    ],
  };
  return <ReactECharts option={option} style={{ height: 220 }} notMerge />;
}

function RevenueProjectionChart() {
  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", backgroundColor: COLORS.tooltip.bg, borderColor: COLORS.tooltip.border, textStyle: { color: "#F4F4F7", fontSize: 12 } },
    legend: { data: ["Base", "Optimista", "Pesimista"], textStyle: { color: "#A6A6B8", fontSize: 11 }, top: 4, right: 8 },
    grid: { left: 44, right: 16, top: 36, bottom: 28 },
    xAxis: { type: "category", data: REVENUE_PROJECTION.labels, axisLabel: { color: COLORS.axis, fontSize: 10 }, axisLine: { lineStyle: { color: "#27273A" } } },
    yAxis: {
      type: "value",
      axisLabel: { color: COLORS.axis, fontSize: 10, formatter: (v: number) => `$${(v / 1000000).toFixed(1)}M` },
      splitLine: { lineStyle: { color: COLORS.grid } },
    },
    series: [
      { name: "Base", type: "line", data: REVENUE_PROJECTION.base, smooth: true, lineStyle: { color: COLORS.primary, width: 2 }, symbol: "circle", symbolSize: 5, itemStyle: { color: COLORS.primary } },
      { name: "Optimista", type: "line", data: REVENUE_PROJECTION.optimista, smooth: true, lineStyle: { color: COLORS.success, width: 1.5, type: "dashed" }, symbol: "none" },
      { name: "Pesimista", type: "line", data: REVENUE_PROJECTION.pesimista, smooth: true, lineStyle: { color: COLORS.danger, width: 1.5, type: "dashed" }, symbol: "none" },
    ],
  };
  return <ReactECharts option={option} style={{ height: 220 }} notMerge />;
}

const HITO_CONFIG = {
  completed: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10 border-success/25", label: "Completado" },
  in_progress: { icon: Clock, color: "text-primary", bg: "bg-primary/10 border-primary/25", label: "En curso" },
  pending: { icon: Circle, color: "text-text-muted", bg: "bg-surface border-border", label: "Pendiente" },
};

const RIESGO_CONFIG = {
  alto: { color: "text-danger", bg: "bg-danger/10 border-danger/25" },
  medio: { color: "text-warning", bg: "bg-warning/10 border-warning/25" },
  bajo: { color: "text-success", bg: "bg-success/10 border-success/25" },
};

const INSIGHT_CONFIG = {
  alert: { icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10 border-danger/25" },
  opportunity: { icon: Lightbulb, color: "text-accent", bg: "bg-accent/10 border-accent/25" },
  warning: { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10 border-warning/25" },
};

export default function PlanningPage() {
  const router = useRouter();
  const { hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource } = useDataSourceStore();
  const [selectedScenario, setSelectedScenario] = useState(1);
  const datasetState = getWorkspaceDatasetState({ hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource });
  const activeDataset = getActiveDataset({ hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource });

  const demoKpis = [
    { label: "Forecast Accuracy", value: "76.3%", unit: "Precisión", change: PLANNING_KPIS.forecastAccuracy.change, changeType: PLANNING_KPIS.forecastAccuracy.changeType, description: "Target 85%" },
    { label: "Variance YTD", value: "-2.6%", unit: "vs Plan", change: PLANNING_KPIS.varianceYtd.change, changeType: PLANNING_KPIS.varianceYtd.changeType, description: "YTD 2026" },
    { label: "Revenue Proyectado H2", value: "$5.62M", unit: "Escenario base", change: PLANNING_KPIS.revenueProjection.change, changeType: PLANNING_KPIS.revenueProjection.changeType, description: "H2 2026" },
    { label: "EBITDA Proyectado H2", value: "$610K", unit: "10.9% margen", change: PLANNING_KPIS.ebitdaProjection.change, changeType: PLANNING_KPIS.ebitdaProjection.changeType, description: "H2 2026" },
  ];
  const kpis = resolveModuleKpis({ moduleId: "planning", datasetState, activeDataset, demoKpis });

  const activeScenario = ESCENARIOS_H2[selectedScenario];

  if (datasetState === "empty") {
    return <ModuleDatasetEmptyState moduleId="planning" />;
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-7xl mx-auto">
      <ModuleHeader moduleId="planning" />

      <ModuleDataSourceBanner datasetState={datasetState} dataset={activeDataset} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
      </div>

      {/* Scenarios selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">Escenarios H2 2026</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {ESCENARIOS_H2.map((esc, i) => (
              <button
                key={i}
                onClick={() => setSelectedScenario(i)}
                className={cn(
                  "text-left p-4 rounded-xl border transition-all",
                  selectedScenario === i
                    ? "border-primary/40 bg-primary/10"
                    : "border-border bg-surface hover:bg-surface-soft"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-semibold text-text-primary">{esc.nombre}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface border border-border text-text-muted">{esc.probabilidad}%</span>
                </div>
                <p className="text-2xl font-bold text-text-primary">${(esc.revenue / 1000000).toFixed(2)}M</p>
                <p className="text-xs text-text-muted mt-0.5">EBITDA: ${(esc.ebitda / 1000).toFixed(0)}K ({esc.ebitdaMargin}%)</p>
              </button>
            ))}
          </div>
          <div className="px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-text-secondary">
            <span className="font-medium text-text-primary">{activeScenario.nombre}:</span> {activeScenario.supuesto}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">Forecast vs Real — Cajas</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ForecastChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">Proyección Revenue por Trimestre</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <RevenueProjectionChart />
          </CardContent>
        </Card>
      </div>

      {/* Demand Plan por SKU */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">Demand Plan H2 por SKU</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {DEMAND_PLAN_SKU.map((row) => {
              const riesgoCfg = RIESGO_CONFIG[row.riesgo];
              return (
                <div key={row.sku} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-surface hover:bg-surface-soft transition-colors">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{row.sku}</p>
                    <p className="text-xs text-text-muted">Plan H2: {row.planH2.toLocaleString()} cajas</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-text-muted">Forecast Acc.</p>
                      <p className={cn("text-sm font-semibold", row.forecastAccuracy >= 80 ? "text-success" : row.forecastAccuracy >= 70 ? "text-warning" : "text-danger")}>{row.forecastAccuracy}%</p>
                    </div>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border capitalize", riesgoCfg.bg, riesgoCfg.color)}>{row.riesgo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hitos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">Hitos de Planificación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {HITOS_PLANIFICACION.map((hito, i) => {
              const cfg = HITO_CONFIG[hito.estado];
              const Icon = cfg.icon;
              return (
                <div key={i} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg border", cfg.bg)}>
                  <Icon className={cn("h-4 w-4 flex-shrink-0", cfg.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{hito.hito}</p>
                    <p className="text-xs text-text-muted">{hito.responsable}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-text-muted">Fecha</p>
                    <p className="text-xs font-medium text-text-secondary">{hito.fecha}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {PLANNING_INSIGHTS.map((insight, i) => {
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
          <CardTitle className="text-sm font-medium text-text-secondary">Preguntale a la IA sobre Planning</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PLANNING_QUESTIONS.map((q, i) => (
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

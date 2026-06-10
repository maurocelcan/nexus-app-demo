"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import {
  AlertTriangle, Lightbulb, AlertCircle,
  ArrowRight, CheckCircle2,
  Clock, XCircle,
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
  TRADE_KPIS, PROMOTIONS, EJECUCION_POR_CADENA, ROI_POR_MECANICA,
  SPEND_ROI_TREND, TRADE_INSIGHTS, TRADE_QUESTIONS,
} from "@/data/mock-trade";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const COLORS = {
  primary: "#8B5CF6", accent: "#00E0B8", success: "#10B981",
  danger: "#FB7185", warning: "#FACC15", grid: "#1B1B29", axis: "#6F6F82",
  tooltip: { bg: "#12121A", border: "#27273A" },
};

function RoiBarChart() {
  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", backgroundColor: COLORS.tooltip.bg, borderColor: COLORS.tooltip.border, textStyle: { color: "#F4F4F7", fontSize: 12 } },
    grid: { left: 80, right: 24, top: 16, bottom: 16 },
    xAxis: { type: "value", axisLabel: { color: COLORS.axis, fontSize: 10, formatter: (v: number) => `${v}x` }, splitLine: { lineStyle: { color: COLORS.grid } } },
    yAxis: { type: "category", data: ROI_POR_MECANICA.map((d) => d.mechanic), axisLabel: { color: COLORS.axis, fontSize: 11 }, axisLine: { lineStyle: { color: "#27273A" } } },
    series: [{
      type: "bar",
      data: ROI_POR_MECANICA.map((d) => ({
        value: d.roi,
        itemStyle: { color: d.roi < 0 ? COLORS.danger : d.roi < 1.5 ? COLORS.warning : COLORS.success, borderRadius: [0, 4, 4, 0] },
      })),
    }],
  };
  return <ReactECharts option={option} style={{ height: 180 }} notMerge />;
}

function SpendRoiTrendChart() {
  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", backgroundColor: COLORS.tooltip.bg, borderColor: COLORS.tooltip.border, textStyle: { color: "#F4F4F7", fontSize: 12 } },
    legend: { data: ["Trade Spend (USD)", "ROI (x)"], textStyle: { color: "#A6A6B8", fontSize: 11 }, top: 4, right: 8 },
    grid: { left: 48, right: 48, top: 36, bottom: 28 },
    xAxis: { type: "category", data: SPEND_ROI_TREND.labels, axisLabel: { color: COLORS.axis, fontSize: 11 }, axisLine: { lineStyle: { color: "#27273A" } } },
    yAxis: [
      { type: "value", axisLabel: { color: COLORS.axis, fontSize: 10, formatter: (v: number) => `${(v / 1000).toFixed(0)}K` }, splitLine: { lineStyle: { color: COLORS.grid } } },
      { type: "value", axisLabel: { color: COLORS.axis, fontSize: 10, formatter: (v: number) => `${v}x` }, splitLine: { show: false } },
    ],
    series: [
      { name: "Trade Spend (USD)", type: "bar", data: SPEND_ROI_TREND.spend, yAxisIndex: 0, itemStyle: { color: COLORS.primary, borderRadius: [4, 4, 0, 0] } },
      { name: "ROI (x)", type: "line", data: SPEND_ROI_TREND.roi, yAxisIndex: 1, smooth: true, lineStyle: { color: COLORS.accent, width: 2 }, symbol: "circle", symbolSize: 5, itemStyle: { color: COLORS.accent } },
    ],
  };
  return <ReactECharts option={option} style={{ height: 200 }} notMerge />;
}

const STATUS_CONFIG = {
  active: { label: "Activa", icon: CheckCircle2, color: "text-success", bg: "bg-success/10 border-success/25" },
  planned: { label: "Planificada", icon: Clock, color: "text-primary", bg: "bg-primary/10 border-primary/25" },
  completed: { label: "Completada", icon: XCircle, color: "text-text-muted", bg: "bg-surface border-border" },
};

const INSIGHT_CONFIG = {
  alert: { icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10 border-danger/25" },
  opportunity: { icon: Lightbulb, color: "text-accent", bg: "bg-accent/10 border-accent/25" },
  warning: { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10 border-warning/25" },
};

export default function TradeMarketingPage() {
  const router = useRouter();
  const { hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource } = useDataSourceStore();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const datasetState = getWorkspaceDatasetState({ hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource });
  const activeDataset = getActiveDataset({ hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource });

  const demoKpis = [
    { label: "ROI Promocional", value: "1.8x", unit: "Promedio", change: TRADE_KPIS.roiPromocional.change, changeType: TRADE_KPIS.roiPromocional.changeType, description: "YTD 2026" },
    { label: "Trade Spend", value: "$890K", unit: "USD", change: TRADE_KPIS.tradeSpend.change, changeType: TRADE_KPIS.tradeSpend.changeType, description: "16.5% de VB" },
    { label: "Activaciones", value: "47", unit: "Activas", change: TRADE_KPIS.activaciones.change, changeType: TRADE_KPIS.activaciones.changeType, description: "YTD 2026" },
    { label: "Ejecución vs Target", value: "71.2%", unit: "PDV", change: TRADE_KPIS.ejecucionTarget.change, changeType: TRADE_KPIS.ejecucionTarget.changeType, description: "Target: 83%" },
  ];
  const kpis = resolveModuleKpis({ moduleId: "trade-marketing", datasetState, activeDataset, demoKpis });

  const filteredPromos = selectedStatus === "all" ? PROMOTIONS : PROMOTIONS.filter((p) => p.status === selectedStatus);

  if (datasetState === "empty") return <ModuleDatasetEmptyState moduleId="trade-marketing" />;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-7xl mx-auto">
      <ModuleHeader moduleId="trade-marketing" />

      <ModuleDataSourceBanner datasetState={datasetState} dataset={activeDataset} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">ROI por Mecánica Promocional</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <RoiBarChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">Trade Spend y ROI Mensual</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <SpendRoiTrendChart />
          </CardContent>
        </Card>
      </div>

      {/* Promotions table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-text-secondary">Promotions Portfolio</CardTitle>
            <div className="flex gap-1">
              {(["all", "active", "planned", "completed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs transition-colors",
                    selectedStatus === s ? "bg-primary/10 border border-primary/25 text-primary-soft" : "text-text-muted hover:text-text-secondary hover:bg-surface-soft"
                  )}
                >
                  {s === "all" ? "Todas" : STATUS_CONFIG[s]?.label ?? s}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredPromos.map((promo) => {
              const statusCfg = STATUS_CONFIG[promo.status];
              const StatusIcon = statusCfg.icon;
              return (
                <div key={promo.id} className="flex items-center gap-3 px-3 py-3 rounded-lg border border-border bg-surface hover:bg-surface-soft transition-colors">
                  <div className={cn("p-1.5 rounded-md border flex-shrink-0", statusCfg.bg)}>
                    <StatusIcon className={cn("h-3.5 w-3.5", statusCfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{promo.name}</p>
                    <p className="text-xs text-text-muted">{promo.mechanic} · {promo.channel} · {promo.startDate} → {promo.endDate}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-text-muted">Spend</p>
                      <p className="text-sm font-medium text-text-secondary">${(promo.spend / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-text-muted">Uplift Vol</p>
                      <p className={cn("text-sm font-medium", promo.volumeUplift >= 0 ? "text-success" : "text-danger")}>{promo.volumeUplift > 0 ? "+" : ""}{promo.volumeUplift}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-muted">ROI</p>
                      <p className={cn("text-sm font-semibold", promo.roi < 0 ? "text-danger" : promo.roi < 1.5 ? "text-warning" : "text-success")}>{promo.roi}x</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ejecución por cadena */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">Ejecución por Cadena</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {EJECUCION_POR_CADENA.map((row) => {
              const pct = Math.round((row.ejecucion / row.target) * 100);
              const isGood = row.ejecucion >= row.target;
              return (
                <div key={row.cadena}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text-primary">{row.cadena}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">Target {row.target}%</span>
                      <span className={cn("text-sm font-semibold", isGood ? "text-success" : row.ejecucion >= row.target * 0.85 ? "text-warning" : "text-danger")}>
                        {row.ejecucion}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", isGood ? "bg-success" : row.ejecucion >= row.target * 0.85 ? "bg-warning" : "bg-danger")}
                      style={{ width: `${Math.min(100, row.ejecucion)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {TRADE_INSIGHTS.map((insight, i) => {
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
          <CardTitle className="text-sm font-medium text-text-secondary">Preguntale a la IA sobre Trade Marketing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TRADE_QUESTIONS.map((q, i) => (
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

"use client";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import {
  AlertTriangle, Lightbulb, AlertCircle,
  ArrowRight,
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
  SUPPLY_KPIS, OTIF_TREND, INVENTARIO_POR_SKU, OOS_POR_CANAL,
  PDVS_CRITICOS, LOGISTICA_DISTRIBUIDOR, SUPPLY_INSIGHTS, SUPPLY_QUESTIONS,
} from "@/data/mock-supply";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const COLORS = {
  primary: "#8B5CF6", accent: "#00E0B8", success: "#10B981",
  danger: "#FB7185", warning: "#FACC15", grid: "#1B1B29", axis: "#6F6F82",
  tooltip: { bg: "#12121A", border: "#27273A" },
};

function OtifTrendChart() {
  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", backgroundColor: COLORS.tooltip.bg, borderColor: COLORS.tooltip.border, textStyle: { color: "#F4F4F7", fontSize: 12 } },
    legend: { data: ["OTIF %", "Fill Rate %"], textStyle: { color: "#A6A6B8", fontSize: 11 }, top: 4, right: 8 },
    grid: { left: 44, right: 16, top: 36, bottom: 28 },
    xAxis: { type: "category", data: OTIF_TREND.labels, axisLabel: { color: COLORS.axis, fontSize: 11 }, axisLine: { lineStyle: { color: "#27273A" } } },
    yAxis: {
      type: "value", min: 80, max: 100,
      axisLabel: { color: COLORS.axis, fontSize: 10, formatter: (v: number) => `${v}%` },
      splitLine: { lineStyle: { color: COLORS.grid } },
    },
    series: [
      { name: "OTIF %", type: "line", data: OTIF_TREND.otif, smooth: true, lineStyle: { color: COLORS.primary, width: 2 }, areaStyle: { color: `${COLORS.primary}20` }, symbol: "circle", symbolSize: 5, itemStyle: { color: COLORS.primary } },
      { name: "Fill Rate %", type: "line", data: OTIF_TREND.fillRate, smooth: true, lineStyle: { color: COLORS.accent, width: 2 }, symbol: "circle", symbolSize: 5, itemStyle: { color: COLORS.accent } },
    ],
  };
  return <ReactECharts option={option} style={{ height: 200 }} notMerge />;
}

function OosByChannelChart() {
  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", backgroundColor: COLORS.tooltip.bg, borderColor: COLORS.tooltip.border, textStyle: { color: "#F4F4F7", fontSize: 12 } },
    grid: { left: 120, right: 40, top: 12, bottom: 20 },
    xAxis: { type: "value", axisLabel: { color: COLORS.axis, fontSize: 10, formatter: (v: number) => `${v}%` }, splitLine: { lineStyle: { color: COLORS.grid } } },
    yAxis: { type: "category", data: OOS_POR_CANAL.map((d) => d.canal), axisLabel: { color: COLORS.axis, fontSize: 11 }, axisLine: { lineStyle: { color: "#27273A" } } },
    series: [{
      type: "bar",
      data: OOS_POR_CANAL.map((d) => ({
        value: d.oos,
        itemStyle: { color: d.oos > 5 ? COLORS.danger : d.oos > 3 ? COLORS.warning : COLORS.success, borderRadius: [0, 4, 4, 0] },
      })),
    }],
  };
  return <ReactECharts option={option} style={{ height: 180 }} notMerge />;
}

const RIESGO_CONFIG = {
  crítico: { color: "text-danger", bg: "bg-danger/10 border-danger/25", label: "Crítico" },
  alto: { color: "text-warning", bg: "bg-warning/10 border-warning/25", label: "Alto" },
  medio: { color: "text-primary", bg: "bg-primary/10 border-primary/25", label: "Medio" },
  bajo: { color: "text-success", bg: "bg-success/10 border-success/25", label: "Bajo" },
};

const INSIGHT_CONFIG = {
  alert: { icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10 border-danger/25" },
  opportunity: { icon: Lightbulb, color: "text-accent", bg: "bg-accent/10 border-accent/25" },
  warning: { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10 border-warning/25" },
};

export default function SupplyPage() {
  const router = useRouter();
  const { hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource } = useDataSourceStore();
  const datasetState = getWorkspaceDatasetState({ hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource });
  const activeDataset = getActiveDataset({ hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource });

  const demoKpis = [
    { label: "OTIF", value: "87.3%", unit: "On Time In Full", change: SUPPLY_KPIS.otif.change, changeType: SUPPLY_KPIS.otif.changeType, description: "Target 92%" },
    { label: "Fill Rate", value: "91.2%", unit: "Fill Rate", change: SUPPLY_KPIS.fillRate.change, changeType: SUPPLY_KPIS.fillRate.changeType, description: "Target 95%" },
    { label: "OOS Rate", value: "4.2%", unit: "Out of Stock", change: SUPPLY_KPIS.oos.change, changeType: SUPPLY_KPIS.oos.changeType, description: "Target <2%" },
    { label: "Cobertura", value: "4.8 sem", unit: "Promedio", change: SUPPLY_KPIS.cobertura.change, changeType: SUPPLY_KPIS.cobertura.changeType, description: "Target 6 sem" },
  ];
  const kpis = resolveModuleKpis({ moduleId: "supply", datasetState, activeDataset, demoKpis });

  if (datasetState === "empty") return <ModuleDatasetEmptyState moduleId="supply" />;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-7xl mx-auto">
      <ModuleHeader moduleId="supply" />

      <ModuleDataSourceBanner datasetState={datasetState} dataset={activeDataset} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">OTIF y Fill Rate — Tendencia Mensual</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <OtifTrendChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">OOS Rate por Canal (%)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <OosByChannelChart />
          </CardContent>
        </Card>
      </div>

      {/* Inventario por SKU */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">Inventario y Cobertura por SKU</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {INVENTARIO_POR_SKU.map((row) => {
              const cfg = RIESGO_CONFIG[row.riesgo];
              const coveragePct = Math.min(100, (row.cobertura / 8) * 100);
              return (
                <div key={row.sku} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-text-primary font-medium truncate">{row.sku}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-text-muted">{row.cobertura} sem</span>
                        <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded-full border", cfg.bg, cfg.color)}>{cfg.label}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", row.riesgo === "alto" ? "bg-warning" : row.riesgo === "medio" ? "bg-primary" : "bg-success")}
                        style={{ width: `${coveragePct}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 w-20 hidden sm:block">
                    <p className="text-xs text-text-muted">OOS</p>
                    <p className={cn("text-sm font-medium", row.oos > 5 ? "text-danger" : row.oos > 3 ? "text-warning" : "text-success")}>{row.oos}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* PDVs críticos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">PDVs con Riesgo de Quiebre</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {PDVS_CRITICOS.map((pdv, i) => {
              const cfg = RIESGO_CONFIG[pdv.riesgo];
              return (
                <div key={i} className={cn("flex items-center justify-between px-3 py-2.5 rounded-lg border", cfg.bg)}>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{pdv.pdv}</p>
                    <p className="text-xs text-text-muted">{pdv.canal} · {pdv.sku}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-text-muted">Cobertura</p>
                      <p className={cn("text-sm font-semibold", cfg.color)}>{pdv.cobertura} sem</p>
                    </div>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", cfg.bg, cfg.color)}>{cfg.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Logistics performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">Performance Logística por Distribuidor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted text-xs">
                  <th className="text-left py-2 font-medium">Distribuidor</th>
                  <th className="text-right py-2 font-medium">OTIF</th>
                  <th className="text-right py-2 font-medium">Fill Rate</th>
                  <th className="text-right py-2 font-medium">Pedidos</th>
                  <th className="text-right py-2 font-medium">Demora prom.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {LOGISTICA_DISTRIBUIDOR.map((d) => (
                  <tr key={d.distribuidor} className="text-text-secondary hover:bg-surface-soft transition-colors">
                    <td className="py-2.5 text-text-primary font-medium">{d.distribuidor}</td>
                    <td className="py-2.5 text-right">
                      <span className={cn("font-medium", d.otif >= 90 ? "text-success" : d.otif >= 85 ? "text-warning" : "text-danger")}>{d.otif}%</span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={cn("font-medium", d.fillRate >= 93 ? "text-success" : d.fillRate >= 88 ? "text-warning" : "text-danger")}>{d.fillRate}%</span>
                    </td>
                    <td className="py-2.5 text-right">{d.pedidos}</td>
                    <td className="py-2.5 text-right">
                      <span className={cn(d.demora > 2 ? "text-danger" : d.demora > 1.2 ? "text-warning" : "text-success")}>{d.demora} días</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {SUPPLY_INSIGHTS.map((insight, i) => {
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
          <CardTitle className="text-sm font-medium text-text-secondary">Preguntale a la IA sobre Supply Chain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SUPPLY_QUESTIONS.map((q, i) => (
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

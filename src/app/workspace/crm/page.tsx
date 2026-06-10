"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import {
  AlertTriangle, Lightbulb, AlertCircle,
  ArrowRight,
  TrendingUp, TrendingDown, UserCheck, UserX,
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
  CRM_KPIS, TOP_CLIENTES, CLIENTES_EN_RIESGO, REVENUE_POR_CANAL_CRM,
  SEGMENTOS_CRECIMIENTO, CLIENTES_ACTIVOS_TREND, CRM_INSIGHTS, CRM_QUESTIONS,
} from "@/data/mock-crm";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const COLORS = {
  primary: "#8B5CF6", accent: "#00E0B8", success: "#10B981",
  danger: "#FB7185", warning: "#FACC15", grid: "#1B1B29", axis: "#6F6F82",
  tooltip: { bg: "#12121A", border: "#27273A" },
};

function ClientesTrendChart() {
  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", backgroundColor: COLORS.tooltip.bg, borderColor: COLORS.tooltip.border, textStyle: { color: "#F4F4F7", fontSize: 12 } },
    legend: { data: ["Activos", "Nuevos", "Perdidos"], textStyle: { color: "#A6A6B8", fontSize: 11 }, top: 4, right: 8 },
    grid: { left: 44, right: 16, top: 36, bottom: 28 },
    xAxis: { type: "category", data: CLIENTES_ACTIVOS_TREND.labels, axisLabel: { color: COLORS.axis, fontSize: 11 }, axisLine: { lineStyle: { color: "#27273A" } } },
    yAxis: [
      { type: "value", axisLabel: { color: COLORS.axis, fontSize: 10 }, splitLine: { lineStyle: { color: COLORS.grid } } },
      { type: "value", axisLabel: { color: COLORS.axis, fontSize: 10 }, splitLine: { show: false } },
    ],
    series: [
      { name: "Activos", type: "line", data: CLIENTES_ACTIVOS_TREND.activos, yAxisIndex: 0, smooth: true, lineStyle: { color: COLORS.primary, width: 2.5 }, areaStyle: { color: `${COLORS.primary}15` }, symbol: "circle", symbolSize: 5, itemStyle: { color: COLORS.primary } },
      { name: "Nuevos", type: "bar", data: CLIENTES_ACTIVOS_TREND.nuevos, yAxisIndex: 1, itemStyle: { color: COLORS.success, borderRadius: [3, 3, 0, 0] }, barMaxWidth: 20 },
      { name: "Perdidos", type: "bar", data: CLIENTES_ACTIVOS_TREND.perdidos, yAxisIndex: 1, itemStyle: { color: COLORS.danger, borderRadius: [3, 3, 0, 0] }, barMaxWidth: 20 },
    ],
  };
  return <ReactECharts option={option} style={{ height: 200 }} notMerge />;
}

function RevenueByChannelChart() {
  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "item", backgroundColor: COLORS.tooltip.bg, borderColor: COLORS.tooltip.border, textStyle: { color: "#F4F4F7", fontSize: 12 }, formatter: "{b}: {d}%" },
    legend: { orient: "vertical", right: 8, top: "center", textStyle: { color: "#A6A6B8", fontSize: 11 } },
    series: [{
      type: "pie",
      radius: ["45%", "70%"],
      center: ["35%", "50%"],
      data: REVENUE_POR_CANAL_CRM.map((d, i) => ({
        name: d.canal,
        value: d.revenue,
        itemStyle: { color: [COLORS.primary, COLORS.accent, COLORS.success, COLORS.warning, `${COLORS.primary}60`][i] },
      })),
      label: { show: false },
      labelLine: { show: false },
    }],
  };
  return <ReactECharts option={option} style={{ height: 200 }} notMerge />;
}

const RIESGO_CONFIG = {
  bajo: { color: "text-success", bg: "bg-success/10 border-success/25" },
  medio: { color: "text-warning", bg: "bg-warning/10 border-warning/25" },
  alto: { color: "text-danger", bg: "bg-danger/10 border-danger/25" },
};

const INSIGHT_CONFIG = {
  alert: { icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10 border-danger/25" },
  opportunity: { icon: Lightbulb, color: "text-accent", bg: "bg-accent/10 border-accent/25" },
  warning: { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10 border-warning/25" },
};

export default function CrmPage() {
  const router = useRouter();
  const { hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource } = useDataSourceStore();
  const [activeTab, setActiveTab] = useState<"top" | "risk">("top");
  const datasetState = getWorkspaceDatasetState({ hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource });
  const activeDataset = getActiveDataset({ hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource });

  const demoKpis = [
    { label: "Clientes Directos", value: "1,396", unit: "Activos", change: CRM_KPIS.clientesActivos.change, changeType: CRM_KPIS.clientesActivos.changeType, description: "YTD 2026" },
    { label: "Clientes en Riesgo", value: "87", unit: "Detectados", change: CRM_KPIS.clientesEnRiesgo.change, changeType: CRM_KPIS.clientesEnRiesgo.changeType, description: "Churn en 90 días" },
    { label: "NPS", value: "67", unit: "Net Promoter Score", change: CRM_KPIS.nps.change, changeType: CRM_KPIS.nps.changeType, description: "Benchmark: 65" },
    { label: "Retención 12M", value: "91.4%", unit: "Retención", change: CRM_KPIS.retencion.change, changeType: CRM_KPIS.retencion.changeType, description: "vs 92.6% PY" },
  ];
  const kpis = resolveModuleKpis({ moduleId: "crm", datasetState, activeDataset, demoKpis });

  if (datasetState === "empty") {
    return <ModuleDatasetEmptyState moduleId="crm" />;
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-7xl mx-auto">
      <ModuleHeader moduleId="crm" />

      <ModuleDataSourceBanner datasetState={datasetState} dataset={activeDataset} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">Evolución de Clientes Activos</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ClientesTrendChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">Revenue por Canal</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <RevenueByChannelChart />
          </CardContent>
        </Card>
      </div>

      {/* Client view tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-text-secondary">Vista de Clientes</CardTitle>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("top")}
                className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors", activeTab === "top" ? "bg-primary/10 border border-primary/25 text-primary-soft" : "text-text-muted hover:text-text-secondary hover:bg-surface-soft")}
              >
                <UserCheck className="h-3.5 w-3.5" />
                Top Clientes
              </button>
              <button
                onClick={() => setActiveTab("risk")}
                className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors", activeTab === "risk" ? "bg-danger/10 border border-danger/25 text-danger" : "text-text-muted hover:text-text-secondary hover:bg-surface-soft")}
              >
                <UserX className="h-3.5 w-3.5" />
                En Riesgo
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === "top" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted text-xs">
                    <th className="text-left py-2 font-medium">Cliente</th>
                    <th className="text-left py-2 font-medium hidden sm:table-cell">Canal</th>
                    <th className="text-right py-2 font-medium">Revenue</th>
                    <th className="text-right py-2 font-medium">Crecimiento</th>
                    <th className="text-right py-2 font-medium">NPS</th>
                    <th className="text-right py-2 font-medium">Riesgo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {TOP_CLIENTES.map((cli) => {
                    const riesgoCfg = RIESGO_CONFIG[cli.riesgo];
                    return (
                      <tr key={cli.id} className="text-text-secondary hover:bg-surface-soft transition-colors">
                        <td className="py-2.5 text-text-primary font-medium">{cli.nombre}</td>
                        <td className="py-2.5 hidden sm:table-cell text-text-muted text-xs">{cli.canal}</td>
                        <td className="py-2.5 text-right">${(cli.revenue / 1000).toFixed(0)}K</td>
                        <td className="py-2.5 text-right">
                          <span className={cn("flex items-center justify-end gap-1 font-medium", cli.growth >= 0 ? "text-success" : "text-danger")}>
                            {cli.growth >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                            {cli.growth > 0 ? "+" : ""}{cli.growth}%
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <span className={cn("font-medium", cli.nps >= 70 ? "text-success" : cli.nps >= 55 ? "text-warning" : "text-danger")}>{cli.nps}</span>
                        </td>
                        <td className="py-2.5 text-right">
                          <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded-full border capitalize", riesgoCfg.bg, riesgoCfg.color)}>{cli.riesgo}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-3">
              {CLIENTES_EN_RIESGO.map((cli, i) => (
                <div key={i} className="px-4 py-3 rounded-xl border border-danger/25 bg-danger/10">
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-sm font-semibold text-text-primary">{cli.nombre}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-danger">{cli.probabilidadChurn}% churn</span>
                      <span className="text-xs text-text-muted">${(cli.revenue / 1000).toFixed(0)}K en riesgo</span>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary mb-1.5">{cli.motivo}</p>
                  <div className="flex items-center gap-1.5 text-xs text-primary-soft">
                    <ArrowRight className="h-3 w-3" />
                    <span>{cli.accion}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Growth segments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">Segmentación por Crecimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SEGMENTOS_CRECIMIENTO.map((seg, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-3 rounded-lg border border-border bg-surface hover:bg-surface-soft transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{seg.segmento}</p>
                  <p className="text-xs text-text-muted mt-0.5">{seg.accion}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-text-muted">Clientes</p>
                    <p className="text-sm font-semibold text-text-secondary">{seg.clientes}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-muted">Revenue</p>
                    <p className="text-sm font-semibold text-text-primary">${(seg.revenue / 1000000).toFixed(1)}M</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {CRM_INSIGHTS.map((insight, i) => {
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
          <CardTitle className="text-sm font-medium text-text-secondary">Preguntale a la IA sobre CRM</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CRM_QUESTIONS.map((q, i) => (
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

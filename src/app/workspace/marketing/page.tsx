"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import {
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  getActiveDataset,
  getWorkspaceDatasetState,
  useDataSourceStore,
} from "@/stores/data-source-store";
import { ModuleDatasetEmptyState } from "@/components/workspace/dataset-state-panels";
import { ModuleDataSourceBanner } from "@/components/workspace/module-data-source-banner";
import { ModuleHeader } from "@/components/workspace/module-chrome";
import { resolveModuleKpis } from "@/data/module-dataset-state";
import { ROUTES } from "@/lib/routes";
import {
  MARKETING_KPIS,
  CAMPAIGNS,
  INVERSION_POR_MEDIO,
  ROI_POR_MEDIO,
  MARKET_SHARE_TREND,
  PENETRACION_POR_CANAL,
  MARKETING_INSIGHTS,
  MARKETING_QUESTIONS,
  type CampaignStatus,
} from "@/data/mock-marketing";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const COLORS = {
  primary: "#8B5CF6",
  accent: "#00E0B8",
  success: "#10B981",
  danger: "#FB7185",
  warning: "#FACC15",
  info: "#38BDF8",
  grid: "#1B1B29",
  axis: "#6F6F82",
  tooltip: { bg: "#12121A", border: "#27273A" },
};

const MEDIO_COLORS: Record<string, string> = {
  TV: COLORS.primary,
  Digital: COLORS.accent,
  OOH: COLORS.warning,
  "In-store": COLORS.success,
  Radio: COLORS.info,
  Influencer: "#E879F9",
};

function InversionPorMedioChart() {
  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: COLORS.tooltip.bg,
      borderColor: COLORS.tooltip.border,
      textStyle: { color: "#F4F4F7", fontSize: 12 },
      formatter: (params: unknown) => {
        const p = (params as { name: string; value: number }[])[0];
        return `${p.name}: $${(p.value / 1000).toFixed(0)}K`;
      },
    },
    grid: { left: 72, right: 24, top: 16, bottom: 16 },
    xAxis: {
      type: "value",
      axisLabel: {
        color: COLORS.axis,
        fontSize: 10,
        formatter: (v: number) => `$${(v / 1000).toFixed(0)}K`,
      },
      splitLine: { lineStyle: { color: COLORS.grid } },
    },
    yAxis: {
      type: "category",
      data: INVERSION_POR_MEDIO.map((d) => d.medio),
      axisLabel: { color: COLORS.axis, fontSize: 11 },
      axisLine: { lineStyle: { color: "#27273A" } },
    },
    series: [
      {
        type: "bar",
        data: INVERSION_POR_MEDIO.map((d) => ({
          value: d.inversion,
          itemStyle: {
            color: MEDIO_COLORS[d.medio] ?? COLORS.primary,
            borderRadius: [0, 4, 4, 0],
          },
        })),
      },
    ],
  };
  return <ReactECharts option={option} style={{ height: 200 }} notMerge />;
}

function MarketShareTrendChart() {
  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: COLORS.tooltip.bg,
      borderColor: COLORS.tooltip.border,
      textStyle: { color: "#F4F4F7", fontSize: 12 },
    },
    legend: {
      data: ["Andes", "Competidor #1"],
      textStyle: { color: "#A6A6B8", fontSize: 11 },
      top: 4,
      right: 8,
    },
    grid: { left: 40, right: 16, top: 36, bottom: 28 },
    xAxis: {
      type: "category",
      data: MARKET_SHARE_TREND.labels,
      axisLabel: { color: COLORS.axis, fontSize: 10 },
      axisLine: { lineStyle: { color: "#27273A" } },
    },
    yAxis: {
      type: "value",
      min: 14,
      max: 26,
      axisLabel: {
        color: COLORS.axis,
        fontSize: 10,
        formatter: (v: number) => `${v}%`,
      },
      splitLine: { lineStyle: { color: COLORS.grid } },
    },
    series: [
      {
        name: "Andes",
        type: "line",
        data: MARKET_SHARE_TREND.values,
        smooth: true,
        lineStyle: { color: COLORS.accent, width: 2.5 },
        symbol: "circle",
        symbolSize: 4,
        itemStyle: { color: COLORS.accent },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(0,224,184,0.18)" },
              { offset: 1, color: "rgba(0,224,184,0.01)" },
            ],
          },
        },
      },
      {
        name: "Competidor #1",
        type: "line",
        data: MARKET_SHARE_TREND.competitor,
        smooth: true,
        lineStyle: { color: COLORS.danger, width: 2, type: "dashed" },
        symbol: "none",
        itemStyle: { color: COLORS.danger },
      },
    ],
  };
  return <ReactECharts option={option} style={{ height: 200 }} notMerge />;
}

function RoiPorMedioChart() {
  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: COLORS.tooltip.bg,
      borderColor: COLORS.tooltip.border,
      textStyle: { color: "#F4F4F7", fontSize: 12 },
      formatter: (params: unknown) => {
        const p = (params as { name: string; value: number }[])[0];
        return `${p.name}: ${p.value}x ROI`;
      },
    },
    grid: { left: 72, right: 24, top: 16, bottom: 16 },
    xAxis: {
      type: "value",
      axisLabel: {
        color: COLORS.axis,
        fontSize: 10,
        formatter: (v: number) => `${v}x`,
      },
      splitLine: { lineStyle: { color: COLORS.grid } },
    },
    yAxis: {
      type: "category",
      data: ROI_POR_MEDIO.map((d) => d.medio),
      axisLabel: { color: COLORS.axis, fontSize: 11 },
      axisLine: { lineStyle: { color: "#27273A" } },
    },
    series: [
      {
        type: "bar",
        data: ROI_POR_MEDIO.map((d) => ({
          value: d.roi,
          itemStyle: {
            color:
              d.roi >= 4
                ? COLORS.success
                : d.roi >= 2.5
                  ? COLORS.accent
                  : d.roi >= 1.5
                    ? COLORS.warning
                    : COLORS.danger,
            borderRadius: [0, 4, 4, 0],
          },
        })),
      },
    ],
  };
  return <ReactECharts option={option} style={{ height: 200 }} notMerge />;
}

const STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  active: {
    label: "Activa",
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10 border-success/25",
  },
  planned: {
    label: "Planificada",
    icon: Clock,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/25",
  },
  completed: {
    label: "Completada",
    icon: XCircle,
    color: "text-text-muted",
    bg: "bg-surface border-border",
  },
};

const INSIGHT_CONFIG = {
  alert: {
    icon: AlertTriangle,
    color: "text-danger",
    bg: "bg-danger/10 border-danger/25",
  },
  opportunity: {
    icon: Lightbulb,
    color: "text-accent",
    bg: "bg-accent/10 border-accent/25",
  },
  success: {
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10 border-success/25",
  },
};

export default function MarketingPage() {
  const router = useRouter();
  const {
    hasDemoLoaded,
    fileDataset,
    integrationDataset,
    activeDatasetSource,
  } = useDataSourceStore();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const datasetState = getWorkspaceDatasetState({
    hasDemoLoaded,
    fileDataset,
    integrationDataset,
    activeDatasetSource,
  });
  const activeDataset = getActiveDataset({
    hasDemoLoaded,
    fileDataset,
    integrationDataset,
    activeDatasetSource,
  });

  const demoKpis = [
    {
      label: "Inversión Marketing",
      value: "$2.1M",
      unit: "YTD",
      change: MARKETING_KPIS.inversionTotal.change,
      changeType: MARKETING_KPIS.inversionTotal.changeType,
      description: "Total medios 2026",
    },
    {
      label: "ROI Campañas",
      value: "3.2x",
      unit: "Promedio",
      change: MARKETING_KPIS.roiCampanas.change,
      changeType: MARKETING_KPIS.roiCampanas.changeType,
      description: "vs 2.8x AACP",
    },
    {
      label: "Market Share",
      value: "18.4%",
      unit: "Unidades",
      change: MARKETING_KPIS.marketShare.change,
      changeType: MARKETING_KPIS.marketShare.changeType,
      description: "+1.2pp vs AACP",
    },
    {
      label: "Penetración Hogares",
      value: "42.1%",
      unit: "Hogares",
      change: MARKETING_KPIS.penetracionHogares.change,
      changeType: MARKETING_KPIS.penetracionHogares.changeType,
      description: "+2.8pp vs AACP",
    },
  ];

  const kpis = resolveModuleKpis({
    moduleId: "marketing",
    datasetState,
    activeDataset,
    demoKpis,
  });

  const filteredCampaigns =
    selectedStatus === "all"
      ? CAMPAIGNS
      : CAMPAIGNS.filter((c) => c.status === selectedStatus);

  if (datasetState === "empty")
    return <ModuleDatasetEmptyState moduleId="marketing" />;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-7xl mx-auto">
      <ModuleHeader moduleId="marketing" />

      <ModuleDataSourceBanner
        datasetState={datasetState}
        dataset={activeDataset}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* Charts row 1: Inversión por medio + Market Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">
              Inversión por Medio — YTD 2026
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <InversionPorMedioChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">
              Market Share — Últimos 13 meses
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <MarketShareTrendChart />
          </CardContent>
        </Card>
      </div>

      {/* ROI por medio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">
            ROI por Medio
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <RoiPorMedioChart />
        </CardContent>
      </Card>

      {/* Brand Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">
            Brand Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Brand Awareness",
                value: "71.2%",
                change: 3.1,
                suffix: "pp",
              },
              {
                label: "Share of Voice",
                value: "22.8%",
                change: -0.5,
                suffix: "pp",
              },
              { label: "NPS", value: "42", change: 6, suffix: "pts" },
              {
                label: "Brand Preference",
                value: "31.4%",
                change: 1.8,
                suffix: "pp",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="text-center p-3 rounded-lg bg-surface-soft border border-border"
              >
                <p className="text-xs text-text-muted mb-1">{item.label}</p>
                <p className="text-2xl font-semibold text-text-primary">
                  {item.value}
                </p>
                <p
                  className={cn(
                    "text-xs font-medium mt-1",
                    item.change >= 0 ? "text-success" : "text-danger",
                  )}
                >
                  {item.change >= 0 ? "+" : ""}
                  {item.change}
                  {item.suffix} vs AACP
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaigns portfolio */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Campaign Portfolio
            </CardTitle>
            <div className="flex gap-1">
              {(["all", "active", "planned", "completed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs transition-colors",
                    selectedStatus === s
                      ? "bg-primary/10 border border-primary/25 text-primary-soft"
                      : "text-text-muted hover:text-text-secondary hover:bg-surface-soft",
                  )}
                >
                  {s === "all" ? "Todas" : (STATUS_CONFIG[s]?.label ?? s)}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredCampaigns.map((campaign) => {
              const statusCfg = STATUS_CONFIG[campaign.status];
              const StatusIcon = statusCfg.icon;
              const medioColor =
                MEDIO_COLORS[campaign.medium] ?? COLORS.primary;
              return (
                <div
                  key={campaign.id}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg border border-border bg-surface hover:bg-surface-soft transition-colors"
                >
                  <div
                    className={cn(
                      "p-1.5 rounded-md border flex-shrink-0",
                      statusCfg.bg,
                    )}
                  >
                    <StatusIcon
                      className={cn("h-3.5 w-3.5", statusCfg.color)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {campaign.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {campaign.brand} ·{" "}
                      <span style={{ color: medioColor }}>
                        {campaign.medium}
                      </span>{" "}
                      · {campaign.startDate} → {campaign.endDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-text-muted">Inversión</p>
                      <p className="text-sm font-medium text-text-secondary">
                        ${(campaign.investment / 1000).toFixed(0)}K
                      </p>
                    </div>
                    {campaign.reach > 0 && (
                      <div className="text-right hidden md:block">
                        <p className="text-xs text-text-muted">Reach</p>
                        <p className="text-sm font-medium text-text-secondary">
                          {(campaign.reach / 1_000_000).toFixed(1)}M
                        </p>
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-xs text-text-muted">ROI</p>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          campaign.roi < 1.5
                            ? "text-danger"
                            : campaign.roi < 2.5
                              ? "text-warning"
                              : "text-success",
                        )}
                      >
                        {campaign.roi}x
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Penetración por canal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">
            Penetración de Hogares por Canal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {PENETRACION_POR_CANAL.map((row) => {
              const isGood = row.penetracion >= row.target;
              const pct = Math.round((row.penetracion / row.target) * 100);
              return (
                <div key={row.canal}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text-primary">
                      {row.canal}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">
                        Target {row.target}%
                      </span>
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          isGood
                            ? "text-success"
                            : pct >= 85
                              ? "text-warning"
                              : "text-danger",
                        )}
                      >
                        {row.penetracion}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        isGood
                          ? "bg-success"
                          : pct >= 85
                            ? "bg-warning"
                            : "bg-danger",
                      )}
                      style={{ width: `${Math.min(100, row.penetracion)}%` }}
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
        {MARKETING_INSIGHTS.map((insight, i) => {
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
                <Icon
                  className={cn("h-4 w-4 mt-0.5 flex-shrink-0", config.color)}
                />
                <p className="text-sm font-medium text-text-primary leading-snug">
                  {insight.title}
                </p>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                {insight.description}
              </p>
              {insight.impact && (
                <span
                  className={cn(
                    "text-[11px] font-medium px-2 py-0.5 rounded-full border",
                    config.bg,
                    config.color,
                  )}
                >
                  {insight.impact}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* AI Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">
            Preguntale a la IA sobre Marketing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MARKETING_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => router.push(ROUTES.WORKSPACE)}
                className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg border border-border bg-surface hover:bg-surface-soft hover:border-primary/30 transition-all text-left group"
              >
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                  {q}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-primary transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

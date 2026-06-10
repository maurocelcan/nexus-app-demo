"use client";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export type SkuByChannelData = {
  skus: string[];
  series: { name: string; data: number[] }[];
};

const CANAL_COLORS = [
  "#8B5CF6", "#00E0B8", "#FACC15", "#FB7185", "#60A5FA",
  "#34D399", "#F97316", "#A78BFA", "#38BDF8", "#4ADE80",
];

/**
 * Gráfico de barras agrupadas — Ranking de SKU por canal.
 * X-axis: SKUs (top 5-8), series: un canal por serie.
 * En modo real/BIS reemplaza "Sell-in vs Sell-out por canal".
 */
export function SkuByChannelChart({
  height = 300,
  data,
}: {
  height?: number;
  data: SkuByChannelData;
}) {
  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "#12121A",
      borderColor: "#27273A",
      borderWidth: 1,
      padding: 12,
      extraCssText: "box-shadow:0 18px 44px rgba(0,0,0,0.35);border-radius:10px;",
      textStyle: { color: "#F4F4F7", fontSize: 12 },
    },
    legend: {
      textStyle: { color: "#A6A6B8", fontSize: 11 },
      top: 4,
      type: "scroll",
    },
    grid: { left: 12, right: 18, top: 46, bottom: 68, containLabel: true },
    xAxis: {
      type: "category",
      data: data.skus,
      axisLabel: {
        color: "#A6A6B8",
        fontSize: 10,
        interval: 0,
        rotate: 22,
        margin: 12,
        width: 80,
        overflow: "truncate" as const,
      },
      axisLine: { lineStyle: { color: "#27273A" } },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#6F6F82",
        fontSize: 10,
        formatter: (v: number) => `${Math.round(v / 1000)}K`,
      },
      splitLine: { lineStyle: { color: "#1B1B29" } },
    },
    series: data.series.map((serie, i) => ({
      name: serie.name,
      type: "bar" as const,
      stack: "canal",
      data: serie.data,
      itemStyle: {
        color: CANAL_COLORS[i % CANAL_COLORS.length],
        borderRadius: i === data.series.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0],
      },
      barMaxWidth: 32,
    })),
    media: [
      {
        query: { maxWidth: 520 },
        option: {
          grid: { left: 8, right: 10, top: 46, bottom: 90, containLabel: true },
          xAxis: { axisLabel: { rotate: 35, fontSize: 9, margin: 14 } },
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: "100%" }} theme="dark" />;
}

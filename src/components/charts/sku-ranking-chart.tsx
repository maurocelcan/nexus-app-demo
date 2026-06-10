"use client";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import type { CallbackDataParams } from "echarts/types/dist/shared";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export type SkuRankingRow = { name: string; sellIn: number; sellOut?: number };

/**
 * Gráfico de barras horizontales — Ranking de SKU por Sell-in (dimensión TOTAL).
 * En modo real/BIS reemplaza el gráfico "Distribución numérica por cadena".
 */
export function SkuRankingChart({
  height = 280,
  data,
}: {
  height?: number;
  data: SkuRankingRow[];
}) {
  const sorted = [...data].sort((a, b) => a.sellIn - b.sellIn); // ascending = bottom-heavy in bar chart
  const names = sorted.map((d) => d.name);
  const siValues = sorted.map((d) => d.sellIn);
  const soValues = sorted.map((d) => d.sellOut ?? 0);
  const hasOut = soValues.some((v) => v > 0);

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
      formatter: (params: unknown) => {
        const rows = Array.isArray(params) ? params : [params];
        const name = (rows[0] as { name?: string })?.name ?? "";
        const lines = rows
          .filter((r) => (r as { value?: number }).value)
          .map((r) => {
            const row = r as { seriesName?: string; value?: number; color?: string };
            return `<div style="display:flex;align-items:center;gap:6px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${row.color}"></span>
              <span style="color:#A6A6B8">${row.seriesName}:</span>
              <span style="font-weight:600">${(row.value ?? 0).toLocaleString("es-AR")} cajas</span>
            </div>`;
          })
          .join("");
        return `<div style="min-width:180px"><div style="font-weight:700;margin-bottom:6px">${name}</div>${lines}</div>`;
      },
    },
    legend: hasOut
      ? { data: ["Sell-in", "Sell-out"], textStyle: { color: "#A6A6B8", fontSize: 11 }, top: 4, right: 8 }
      : undefined,
    grid: {
      left: 10,
      right: 24,
      top: hasOut ? 40 : 16,
      bottom: 8,
      containLabel: true,
    },
    xAxis: {
      type: "value",
      axisLabel: { color: "#6F6F82", fontSize: 10, formatter: (v: number) => `${Math.round(v / 1000)}K` },
      splitLine: { lineStyle: { color: "#1B1B29" } },
    },
    yAxis: {
      type: "category",
      data: names,
      axisLabel: {
        color: "#A6A6B8",
        fontSize: 10,
        width: 110,
        overflow: "truncate" as const,
      },
      axisLine: { lineStyle: { color: "#27273A" } },
    },
    series: [
      {
        name: "Sell-in",
        type: "bar",
        data: siValues,
        itemStyle: { color: "#8B5CF6", borderRadius: [0, 3, 3, 0] },
        barMaxWidth: 20,
        label: {
          show: true,
          position: "right",
          color: "#A6A6B8",
          fontSize: 9,
          formatter: (p: CallbackDataParams) =>
            `${((Number(p.value) || 0) / 1000).toFixed(0)}K`,
        },
      },
      ...(hasOut
        ? [
            {
              name: "Sell-out",
              type: "bar" as const,
              data: soValues,
              itemStyle: { color: "#00E0B8", borderRadius: [0, 3, 3, 0] },
              barMaxWidth: 20,
            },
          ]
        : []),
    ],
  };

  return <ReactECharts option={option} style={{ height, width: "100%" }} theme="dark" />;
}

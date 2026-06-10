"use client";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import { WEEKS_LABELS, SELL_IN_SERIES, SELL_OUT_SERIES } from "@/data/mock-sales";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type SeriesPoint = { label: string; sellIn: number; sellOut: number };

export function SellInSellOutChart({ height = 240, data }: { height?: number; data?: SeriesPoint[] }) {
  const labels = data?.map((point) => point.label) ?? WEEKS_LABELS;
  const sellIn = data?.map((point) => point.sellIn) ?? SELL_IN_SERIES;
  const sellOut = data?.map((point) => point.sellOut) ?? SELL_OUT_SERIES;
  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "#12121A",
      borderColor: "#27273A",
      borderWidth: 1,
      padding: 12,
      extraCssText: "box-shadow:0 18px 44px rgba(0,0,0,0.35);border-radius:10px;",
      textStyle: { color: "#F4F4F7", fontSize: 12 },
    },
    legend: {
      data: ["Sell-in", "Sell-out"],
      textStyle: { color: "#A6A6B8", fontSize: 11 },
      top: 4,
      right: 8,
    },
    grid: { left: 44, right: 18, top: 38, bottom: 32, containLabel: true },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { color: "#6F6F82", fontSize: 10, hideOverlap: true },
      axisLine: { lineStyle: { color: "#27273A" } },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#6F6F82", fontSize: 10 },
      splitLine: { lineStyle: { color: "#1B1B29" } },
    },
    series: [
      {
        name: "Sell-in",
        type: "line",
        data: sellIn,
        smooth: true,
        lineStyle: { color: "#8B5CF6", width: 2 },
        itemStyle: { color: "#8B5CF6" },
        areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(139,92,246,0.2)" }, { offset: 1, color: "rgba(139,92,246,0)" }] } },
        symbol: "none",
      },
      {
        name: "Sell-out",
        type: "line",
        data: sellOut,
        smooth: true,
        lineStyle: { color: "#00E0B8", width: 2 },
        itemStyle: { color: "#00E0B8" },
        areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(0,224,184,0.15)" }, { offset: 1, color: "rgba(0,224,184,0)" }] } },
        symbol: "none",
      },
    ],
    media: [
      {
        query: { maxWidth: 520 },
        option: {
          grid: { left: 36, right: 10, top: 42, bottom: 38, containLabel: true },
          xAxis: { axisLabel: { fontSize: 9, interval: 2 } },
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: "100%" }} theme="dark" />;
}

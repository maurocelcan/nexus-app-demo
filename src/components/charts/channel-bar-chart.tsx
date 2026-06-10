"use client";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import { CHANNELS } from "@/data/mock-sales";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type ChannelPoint = { name: string; sellIn: number; sellOut: number };

export function ChannelBarChart({ height = 260, data }: { height?: number; data?: ChannelPoint[] }) {
  const rows = data ?? CHANNELS;
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
    },
    grid: { left: 64, right: 22, top: 46, bottom: 76, containLabel: true },
    xAxis: {
      type: "category",
      data: rows.map((c) => c.name),
      axisLabel: { color: "#A6A6B8", fontSize: 10, interval: 0, rotate: 22, margin: 14 },
      axisLine: { lineStyle: { color: "#27273A" } },
    },
    yAxis: {
      type: "value",
      splitNumber: 4,
      axisLabel: { color: "#6F6F82", fontSize: 10, formatter: (v: number) => `${Math.round(v / 1000)}K` },
      splitLine: { lineStyle: { color: "#1B1B29" } },
    },
    series: [
      {
        name: "Sell-in",
        type: "bar",
        data: rows.map((c) => c.sellIn),
        itemStyle: { color: "#8B5CF6", borderRadius: [3, 3, 0, 0] },
        barMaxWidth: 24,
      },
      {
        name: "Sell-out",
        type: "bar",
        data: rows.map((c) => c.sellOut),
        itemStyle: { color: "#00E0B8", borderRadius: [3, 3, 0, 0] },
        barMaxWidth: 24,
      },
    ],
    media: [
      {
        query: { maxWidth: 520 },
        option: {
          grid: { left: 44, right: 12, top: 46, bottom: 92, containLabel: true },
          xAxis: { axisLabel: { rotate: 35, fontSize: 9, margin: 16 } },
          series: [{ barMaxWidth: 18 }, { barMaxWidth: 18 }],
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: "100%" }} theme="dark" />;
}

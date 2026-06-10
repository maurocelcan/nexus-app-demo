"use client";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import { DISTRIBUTION_BY_CHAIN } from "@/data/mock-sales";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type DistributionPoint = { chain: string; value: number };

export function DistributionChart({ height = 260, data }: { height?: number; data?: DistributionPoint[] }) {
  const rows = data ?? DISTRIBUTION_BY_CHAIN;
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
      formatter: "{b}: {c}%",
    },
    grid: { left: 112, right: 36, top: 10, bottom: 20, containLabel: true },
    xAxis: {
      type: "value",
      max: 100,
      axisLabel: { color: "#6F6F82", fontSize: 10, formatter: "{value}%" },
      splitLine: { lineStyle: { color: "#1B1B29" } },
    },
    yAxis: {
      type: "category",
      data: rows.map((d) => d.chain),
      axisLabel: { color: "#A6A6B8", fontSize: 11, overflow: "truncate", width: 96 },
      axisLine: { lineStyle: { color: "#27273A" } },
    },
    series: [
      {
        type: "bar",
        data: rows.map((d) => d.value),
        itemStyle: {
          color: (params: { dataIndex: number }) =>
            params.dataIndex === 0 ? "#8B5CF6" : params.dataIndex < 3 ? "#A78BFA" : "#6F6F82",
          borderRadius: [0, 4, 4, 0],
        },
        label: { show: true, position: "right", color: "#6F6F82", fontSize: 10, formatter: "{c}%" },
        barMaxWidth: 20,
      },
    ],
    media: [
      {
        query: { maxWidth: 520 },
        option: {
          grid: { left: 86, right: 28, top: 10, bottom: 18, containLabel: true },
          yAxis: { axisLabel: { fontSize: 9, width: 74, overflow: "truncate" } },
          series: [{ label: { fontSize: 9 }, barMaxWidth: 16 }],
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: "100%" }} theme="dark" />;
}

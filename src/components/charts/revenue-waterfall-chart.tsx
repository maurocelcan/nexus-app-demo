"use client";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import type { SalesKpis } from "@/types/dataset";
import { REVENUE_WATERFALL } from "@/data/mock-sales";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type WaterfallItem = {
  shortName: string;
  mobileName: string;
  fullName: string;
  value: number;
  description: string;
  type: "total" | "increase" | "decrease" | "negative";
};

/**
 * Construye los items del waterfall a partir de SalesKpis reales.
 * Usa los valores disponibles; ignora los que faltan.
 */
function buildRealWaterfall(sk: SalesKpis): WaterfallItem[] | null {
  const grossRev = sk.grossRevenue;
  const netRev = sk.netRevenueYtd;
  const ebitda = sk.ebitdaYtd;

  // Necesitamos al menos Gross Revenue o Net Revenue para dibujar algo útil
  if (!grossRev && !netRev) return null;

  const items: WaterfallItem[] = [];

  if (grossRev) {
    items.push({
      shortName: "Venta Bruta",
      mobileName: "V.Bruta",
      fullName: "Gross Revenue / Venta Bruta",
      value: grossRev,
      description: "Facturación antes de descuentos",
      type: "total",
    });
  }

  if (sk.tradeSpend) {
    items.push({
      shortName: "Trade Spend",
      mobileName: "Trade",
      fullName: "Trade Discounts",
      value: -sk.tradeSpend,
      description: "Descuentos y bonificaciones al canal",
      type: "decrease",
    });
  }

  if (netRev) {
    items.push({
      shortName: "Net Revenue",
      mobileName: "Net Rev",
      fullName: "Net Revenue / Facturación Neta",
      value: netRev,
      description: "Venta neta tras descuentos",
      type: "total",
    });
  }

  if (sk.cogsPct) {
    items.push({
      shortName: "COGS",
      mobileName: "COGS",
      fullName: "Costo de Ventas (COGS)",
      value: -sk.cogsPct,
      description: "Costo de mercadería vendida",
      type: "negative",
    });
  }

  if (sk.grossMargin && sk.grossMargin !== sk.netRevenueYtd) {
    items.push({
      shortName: "Gross Profit",
      mobileName: "G.Profit",
      fullName: "Gross Profit",
      value: sk.grossMargin,
      description: "Margen bruto (Net Revenue - COGS)",
      type: "total",
    });
  }

  if (sk.opex) {
    items.push({
      shortName: "Opex / G&A",
      mobileName: "Opex",
      fullName: "Gastos Estructura / Opex",
      value: -sk.opex,
      description: "Gastos operativos y estructura",
      type: "decrease",
    });
  }

  if (ebitda) {
    items.push({
      shortName: "EBITDA",
      mobileName: "EBITDA",
      fullName: "EBITDA",
      value: ebitda,
      description: "Resultado operativo antes de impuestos y amortizaciones",
      type: "total",
    });
  }

  return items.length >= 2 ? items : null;
}

export function RevenueWaterfallChart({
  height = 260,
  salesKpis,
}: {
  height?: number;
  salesKpis?: SalesKpis;
}) {
  const positiveColor = "#8B5CF6";
  const negativeColor = "#FB7185";
  const totalColor = "#00E0B8";
  const connectorColor = "rgba(166,166,184,0.62)";

  // Si se pasan salesKpis reales, intentar construir el waterfall desde ellos
  const realItems = salesKpis ? buildRealWaterfall(salesKpis) : null;
  const data: WaterfallItem[] = realItems ?? [...REVENUE_WATERFALL];

  const placeholders: number[] = [];
  const bars: number[] = [];
  const cumulativeLine: number[] = [];
  const connectorValues: (number | null)[] = [];
  let cumulative = 0;
  data.forEach((item) => {
    if (item.type === "total") {
      placeholders.push(0);
      bars.push(Math.abs(item.value));
      cumulative = item.value;
    } else {
      const base = item.value < 0 ? cumulative + item.value : cumulative;
      placeholders.push(base < 0 ? 0 : base);
      bars.push(Math.abs(item.value));
      cumulative += item.value;
    }
    cumulativeLine.push(cumulative);
    connectorValues.push(item.type === "total" ? null : cumulative);
  });

  const maxValue = Math.max(...data.map((d) => Math.abs(d.value)));
  const yMax = Math.ceil(maxValue / 1_000_000) * 1_000_000 + 1_000_000;
  const yInterval = Math.ceil(yMax / 5 / 500_000) * 500_000;

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
      formatter: (params: unknown) => {
        const rows = Array.isArray(params) ? params : [params];
        const dataIndex = Number((rows[0] as { dataIndex?: number })?.dataIndex ?? 0);
        const item = data[dataIndex];
        if (!item) return "";
        const value = new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(item.value);
        return `
          <div style="min-width:190px">
            <div style="font-weight:700;margin-bottom:4px">${item.fullName}</div>
            <div style="color:#A6A6B8;margin-bottom:6px">${value}</div>
            <div style="color:#6F6F82;line-height:1.35">${item.description}</div>
          </div>
        `;
      },
    },
    grid: { left: 70, right: 24, top: 32, bottom: 82, containLabel: true },
    xAxis: {
      type: "category",
      data: data.map((d) => d.shortName),
      axisLabel: { color: "#A6A6B8", fontSize: 10, interval: 0, rotate: 28, margin: 14 },
      axisLine: { lineStyle: { color: "#27273A" } },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: yMax,
      interval: yInterval,
      axisLabel: { color: "#6F6F82", fontSize: 10, formatter: (v: number) => `$${(v / 1000000).toFixed(1)}M` },
      splitLine: { lineStyle: { color: "#1B1B29" } },
    },
    series: [
      {
        type: "bar",
        stack: "total",
        data: placeholders,
        itemStyle: { color: "transparent", borderColor: "transparent" },
        silent: true,
      },
      {
        type: "bar",
        stack: "total",
        data: data.map((item, i) => {
          const isDecrease = item.type === "negative" || item.type === "decrease" || item.value < 0;
          const v = item.value / 1_000_000;
          const labelText = isDecrease
            ? `−$${Math.abs(v).toFixed(1)}M`
            : `$${Math.abs(v).toFixed(1)}M`;
          return {
            value: bars[i],
            itemStyle: {
              color: item.type === "total" ? totalColor : isDecrease ? negativeColor : positiveColor,
              borderRadius: isDecrease ? [0, 0, 4, 4] : [4, 4, 0, 0],
            },
            label: {
              show: true,
              position: isDecrease ? "insideTop" : "top",
              color: isDecrease ? "#FB7185" : "#A6A6B8",
              fontSize: 9,
              formatter: () => labelText,
            },
          };
        }),
        barMaxWidth: 48,
        z: 3,
      },
      {
        name: "Acumulado",
        type: "line",
        data: cumulativeLine,
        step: "end",
        symbol: "circle",
        symbolSize: 4,
        itemStyle: { color: connectorColor },
        lineStyle: { color: connectorColor, width: 1, type: "dashed" },
        silent: true,
        z: 2,
      },
      {
        name: "Conectores",
        type: "scatter",
        data: connectorValues,
        symbol: "rect",
        symbolSize: [34, 2],
        itemStyle: { color: connectorColor },
        silent: true,
        z: 4,
      },
    ],
    media: [
      {
        query: { maxWidth: 520 },
        option: {
          grid: { left: 50, right: 12, top: 28, bottom: 92, containLabel: true },
          xAxis: {
            data: data.map((d) => d.mobileName),
            axisLabel: { rotate: 35, fontSize: 9, margin: 16 },
          },
          series: [{}, { barMaxWidth: 34, label: { fontSize: 8 } }, {}, { symbolSize: [24, 2] }],
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: "100%" }} theme="dark" />;
}

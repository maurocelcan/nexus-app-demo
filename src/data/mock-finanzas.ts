// Mock data — Finanzas module (consistent with Demo CPG Portfolio 2025-2026)
// Net Revenue $5.39M, EBITDA $550K, Gross Margin 38.1%
import type { FinanzasChannelRow, FinanzasHeadcountRow, FinanzasMonthlyEbitdaRow } from "@/lib/finanzas-real";
import type { FinanceMonthlyPoint } from "@/types/dataset";

export const FINANZAS_KPIS = {
  netRevenue: { value: 5390000, label: "Net Revenue", unit: "USD", change: 8.4, changeType: "positive" as const },
  grossMargin: { value: 38.1, label: "Gross Margin", unit: "%", change: -1.2, changeType: "negative" as const },
  ebitda: { value: 550000, label: "EBITDA", unit: "USD", change: -4.3, changeType: "negative" as const },
  ebitdaMargin: { value: 10.2, label: "EBITDA Margin", unit: "%", change: -1.4, changeType: "negative" as const },
  tradeSpend: { value: 890000, label: "Trade Spend", unit: "USD", change: 12.1, changeType: "negative" as const },
  tradeSpendPct: { value: 16.5, label: "Trade Spend %", unit: "%", change: 0.6, changeType: "negative" as const },
  opex: { value: 1500000, label: "Opex", unit: "USD", change: 5.2, changeType: "neutral" as const },
  contributionMargin: { value: 27.9, label: "Contribution Margin", unit: "%", change: -1.8, changeType: "negative" as const },
};

// P&L Waterfall data
export const PNL_WATERFALL = [
  { name: "Venta Bruta", value: 6280000 },
  { name: "Bonificaciones", value: -420000 },
  { name: "Descuentos", value: -180000 },
  { name: "Trade Spend", value: -290000 },
  { name: "Net Revenue", value: 5390000, isTotal: true },
  { name: "COGS", value: -3340000 },
  { name: "Gross Profit", value: 2050000, isTotal: true },
  { name: "Opex", value: -1500000 },
  { name: "EBITDA", value: 550000, isTotal: true },
];

function demoFinanceMonth(month: string, netRevenue: number, marginPct: number, ebitdaPct: number): FinanceMonthlyPoint {
  const grossRevenue = Math.round(netRevenue / 0.9);
  const tradeSpend = grossRevenue - netRevenue;
  const grossProfit = Math.round(netRevenue * marginPct);
  const cogs = netRevenue - grossProfit;
  const ebitda = Math.round(grossRevenue * ebitdaPct);
  const ga = Math.round(netRevenue * 0.055);
  const structuralExpenses = grossProfit - ga - ebitda;
  return {
    month,
    grossRevenue,
    tradeSpend,
    netRevenue,
    cogs,
    grossProfit,
    ga,
    structuralExpenses,
    ebitda,
    grossMarginPct: grossProfit / netRevenue,
    cogsPct: cogs / netRevenue,
    ebitdaPct: ebitda / grossRevenue,
  };
}

export const FINANCE_MONTHLY_DEMO: FinanceMonthlyPoint[] = [
  demoFinanceMonth("2025-01", 650000, 0.39, 0.085),
  demoFinanceMonth("2025-02", 680000, 0.385, 0.089),
  demoFinanceMonth("2025-03", 720000, 0.382, 0.094),
  demoFinanceMonth("2025-04", 760000, 0.381, 0.098),
  demoFinanceMonth("2025-05", 790000, 0.379, 0.101),
  demoFinanceMonth("2025-06", 820000, 0.38, 0.103),
  demoFinanceMonth("2025-07", 805000, 0.383, 0.104),
  demoFinanceMonth("2025-08", 835000, 0.386, 0.106),
  demoFinanceMonth("2025-09", 860000, 0.389, 0.108),
  demoFinanceMonth("2025-10", 875000, 0.392, 0.109),
  demoFinanceMonth("2025-11", 910000, 0.394, 0.111),
  demoFinanceMonth("2025-12", 965000, 0.397, 0.113),
  demoFinanceMonth("2026-01", 820000, 0.374, 0.091),
  demoFinanceMonth("2026-02", 880000, 0.379, 0.098),
  demoFinanceMonth("2026-03", 950000, 0.384, 0.106),
  demoFinanceMonth("2026-04", 930000, 0.383, 0.109),
  demoFinanceMonth("2026-05", 905000, 0.381, 0.104),
  demoFinanceMonth("2026-06", 905000, 0.385, 0.102),
];

// Monthly EBITDA trend (Jan–May 2026)
export const EBITDA_TREND = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May"],
  ebitda: [82000, 95000, 118000, 127000, 128000],
  margin: [9.1, 9.8, 10.6, 10.9, 10.4],
};

// Margin breakdown by SKU
export const MARGIN_BY_SKU = [
  { sku: "Espumante Brut", netRevenue: 1180000, grossMargin: 28.4, ebitdaMargin: 5.1, tradeSpend: 21.2 },
  { sku: "Aperitivo de Hierbas", netRevenue: 1420000, grossMargin: 44.3, ebitdaMargin: 15.6, tradeSpend: 12.8 },
  { sku: "Gin Botánico Premium", netRevenue: 980000, grossMargin: 41.2, ebitdaMargin: 13.1, tradeSpend: 14.5 },
  { sku: "Cerveza Artesanal IPA", netRevenue: 890000, grossMargin: 36.8, ebitdaMargin: 10.4, tradeSpend: 15.9 },
  { sku: "Vino Malbec Reserva", netRevenue: 920000, grossMargin: 39.5, ebitdaMargin: 11.2, tradeSpend: 13.3 },
];

// Revenue by channel
export const REVENUE_BY_CHANNEL = [
  { channel: "Supermercados", revenue: 2100000, margin: 36.2, tradeSpend: 18.4 },
  { channel: "Mayoristas", revenue: 1480000, margin: 41.5, tradeSpend: 11.2 },
  { channel: "Cadenas Especializadas", revenue: 870000, margin: 42.8, tradeSpend: 10.8 },
  { channel: "Gastronomía", revenue: 580000, margin: 38.1, tradeSpend: 14.2 },
  { channel: "E-commerce", revenue: 360000, margin: 33.6, tradeSpend: 22.1 },
];

// Cost drivers comparison vs prior year
export const COST_DRIVERS = {
  labels: ["COGS", "Trade Spend", "Opex", "Bonificaciones", "Descuentos"],
  current: [62.0, 16.5, 27.8, 7.8, 3.3],
  prior: [60.8, 15.9, 27.3, 7.2, 3.1],
};

export const FINANZAS_INSIGHTS = [
  {
    type: "alert" as const,
    title: "Espumante destruye EBITDA — margen del 5.1%",
    description: "Espumante Brut tiene el menor EBITDA del portafolio (5.1% vs 10.2% promedio). Trade spend del 21.2% supera en 4.7pp la media. Acción urgente requerida en pricing o estructura de costos.",
    impact: "USD -280K vs promedio portafolio",
    area: "Finanzas",
  },
  {
    type: "opportunity" as const,
    title: "Aperitivo de Hierbas: mejor rentabilidad del portafolio",
    description: "Gross margin del 44.3% y EBITDA del 15.6%. Incrementar participación en mix podría agregar USD +120K de EBITDA en H2.",
    impact: "USD +120K potencial",
    area: "Finanzas",
  },
  {
    type: "warning" as const,
    title: "Trade spend E-commerce fuera de benchmark",
    description: "Canal E-commerce muestra trade spend del 22.1% vs benchmark del 15%. Renegociación de condiciones requerida antes de Q3.",
    impact: "USD -25K en rentabilidad canal",
    area: "Finanzas",
  },
];

export const FINANZAS_QUESTIONS = [
  "¿Qué SKUs destruyen EBITDA?",
  "¿Qué categoría tiene peor margen?",
  "¿Qué promociones destruyeron valor?",
  "¿Cómo evolucionó el trade spend en los últimos 3 meses?",
];

// ─── Demo data for unified structure (used when datasetState !== "real") ────

/** Monthly EBITDA rows — same shape as FinanzasMonthlyEbitdaRow from finanzas-real.ts */
export const MONTHLY_EBITDA_DEMO: FinanzasMonthlyEbitdaRow[] = EBITDA_TREND.labels.map(
  (month, i) => ({
    month,
    ebitda: EBITDA_TREND.ebitda[i],
    ebitdaPct: EBITDA_TREND.margin[i],
  })
);

/** Headcount agregado — YTD 25 vs YTD 26 (mock) */
export const HEADCOUNT_DEMO: FinanzasHeadcountRow[] = [
  {
    label: "YTD",
    priorValue: 38,
    value: 43,
    variationPct: 13.2,
    variationAbs: 5,
    details: [
      { area: "Comercial", priorValue: 12, value: 14 },
      { area: "Trade Marketing", priorValue: 6, value: 7 },
      { area: "Supply Chain", priorValue: 8, value: 8 },
      { area: "Finanzas", priorValue: 4, value: 5 },
      { area: "RR.HH.", priorValue: 3, value: 3 },
      { area: "Tecnología", priorValue: 5, value: 6 },
    ],
  },
];

/** Revenue por canal — mismas columnas que FinanzasChannelRow */
export const CHANNEL_ROWS_DEMO: FinanzasChannelRow[] = REVENUE_BY_CHANNEL.map((row) => ({
  label: row.channel,
  netRevenue: row.revenue,
  // Aproximar EBITDA: gross margin menos opex proporcionado
  ebitda: Math.round(row.revenue * ((row.margin - row.tradeSpend * 0.35 - 8) / 100)),
  tradeSpend: Math.round(row.revenue * (row.tradeSpend / 100)),
  marginPct: Math.round((row.margin - row.tradeSpend * 0.35 - 8) * 10) / 10,
}));

/** 8 KPIs completos para demo (misma estructura que finanzasKpisFromDataset) */
import type { SalesKpi } from "@/types/analytics";
export const FINANZAS_DEMO_KPIS: SalesKpi[] = [
  // Fila 1
  { label: "Net Revenue", value: "$5.39M", change: 8.4, changeType: "positive", description: "YTD 2026", tooltip: "Fuente: Demo CPG · Net Revenue = Venta Bruta - Trade Spend - Bonificaciones - Descuentos" },
  { label: "EBITDA", value: "$550K", change: -4.3, changeType: "negative", description: "YTD 2026", tooltip: "Fuente: Demo CPG · EBITDA = Gross Profit - Opex" },
  { label: "Gross Profit", value: "$2.05M", change: -1.2, changeType: "negative", description: "38.1% margen bruto", tooltip: "Fuente: Demo CPG · Gross Profit = Net Revenue - COGS" },
  { label: "Trade Spend", value: "$890K", change: 12.1, changeType: "negative", description: "16.5% de Venta Bruta", tooltip: "Fuente: Demo CPG · Inversión comercial sobre Venta Bruta" },
  // Fila 2
  { label: "Días de cobro", value: "32 días", change: -2, changeType: "positive", description: "", tooltip: "Fuente: Demo CPG · DSO (Days Sales Outstanding) — días promedio hasta cobro efectivo" },
  { label: "Días de atraso", value: "8 días", change: 1, changeType: "negative", description: "", tooltip: "Fuente: Demo CPG · Retraso promedio de cobro en la cartera de clientes" },
  { label: "Monto facturado", value: "$6.28M", change: 7.1, changeType: "positive", description: "Gross Revenue YTD", tooltip: "Fuente: Demo CPG · Monto total facturado antes de deducciones comerciales" },
  { label: "Monto cobrado", value: "$5.91M", change: 6.4, changeType: "positive", description: "YTD 2026", tooltip: "Fuente: Demo CPG · Monto efectivamente cobrado en el período" },
];

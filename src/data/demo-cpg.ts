import type { SalesKpi } from "@/types/analytics";
import type { ChannelData, SkuData } from "@/types/sales";

export const DEMO_CPG_META = {
  datasetName: "Demo CPG Portfolio 2025-2026",
  companyName: "Andes Consumer Goods",
  industry: "CPG / Consumo Masivo",
  period: "YTD 2026",
  keyAccounts: ["Carrefour", "Coto"],
} as const;

export const DEMO_CPG_TOTALS = {
  sellIn: 144100,
  sellOut: 118900,
  netRevenue: 5390000,
  ebitda: 550000,
  priceIndex: 0.96,
  clientesDirectos: 1396,
  pdvsActivos: 812,
  passthrough: 82.5,
  dn: 71.4,
  otif: 88.2,
  fillRate: 91.5,
  oos: 8.3,
} as const;

export const MONTHLY_LABELS = [
  "Ene 25", "Feb 25", "Mar 25", "Abr 25", "May 25", "Jun 25",
  "Jul 25", "Ago 25", "Sep 25", "Oct 25", "Nov 25", "Dic 25",
  "Ene 26", "Feb 26", "Mar 26", "Abr 26", "May 26", "Jun 26",
];

export const MONTHLY_SELL_IN = [
  10200, 9800, 11400, 10900, 11800, 12200,
  12600, 11900, 13100, 13800, 14200, 12900,
  22400, 22600, 23800, 24800, 25200, 25300,
];

export const MONTHLY_SELL_OUT = [
  8900, 8600, 9800, 9400, 10100, 10600,
  10900, 10300, 11400, 11900, 12100, 11200,
  18400, 18600, 19500, 20100, 20900, 21400,
];

export const MONTHLY_NET_REVENUE = [
  368000, 352000, 410000, 392000, 425000, 441000,
  454000, 429000, 472000, 497000, 512000, 465000,
  820000, 835000, 880000, 925000, 955000, 975000,
];

export const MONTHLY_OBJETIVO = [
  10800, 10400, 11900, 11500, 12400, 12800,
  13200, 12500, 13700, 14400, 14800, 13500,
  23000, 23200, 24600, 25400, 26000, 26200,
];

export const WEEKS_LABELS = Array.from({ length: 26 }, (_, i) => `S${i + 1}`);

export const SELL_IN_SERIES = [
  4831, 4931, 5031, 5131, 5231, 5331, 5431, 5531, 5631, 5731, 5831, 5931, 5031,
  5131, 5231, 5331, 5431, 5531, 5631, 5731, 5831, 5931, 6031, 6131, 6228, 6328,
];

export const SELL_OUT_SERIES = [
  3808, 3908, 4008, 4108, 4208, 4308, 4408, 4508, 4608, 4708, 4808, 4908, 4108,
  4208, 4308, 4408, 4508, 4608, 4708, 4808, 4908, 5008, 5108, 5208, 5302, 5406,
];

export const SKUS: SkuData[] = [
  {
    id: "sku-001",
    name: "Espumante Brut 750ml",
    category: "Espumantes",
    sellIn: 28400,
    sellOut: 15052,
    passthrough: 53,
    distributionNum: 64,
    buyingCustomers: 218,
    netRevenue: 1280000,
    margin: 34,
    tradeSpend: 8.2,
    stock: 13348,
    vsbudget: -12,
    channel: "Supermercados",
  },
  {
    id: "sku-002",
    name: "Aperitivo de Hierbas 700ml",
    category: "Aperitivos",
    sellIn: 22400,
    sellOut: 22000,
    passthrough: 98,
    distributionNum: 78,
    buyingCustomers: 305,
    netRevenue: 980000,
    margin: 41,
    tradeSpend: 12.5,
    stock: 400,
    vsbudget: 5,
    channel: "Mayoristas",
  },
  {
    id: "sku-003",
    name: "Gin Botánico Premium 750ml",
    category: "Destilados",
    sellIn: 18600,
    sellOut: 15000,
    passthrough: 81,
    distributionNum: 55,
    buyingCustomers: 189,
    netRevenue: 890000,
    margin: 48,
    tradeSpend: 6.8,
    stock: 3600,
    vsbudget: -8,
    channel: "Cadenas Especializadas",
  },
  {
    id: "sku-004",
    name: "Cerveza Artesanal IPA 473ml",
    category: "Cervezas",
    sellIn: 42600,
    sellOut: 39000,
    passthrough: 92,
    distributionNum: 88,
    buyingCustomers: 512,
    netRevenue: 1280000,
    margin: 28,
    tradeSpend: 5.1,
    stock: 3600,
    vsbudget: 18,
    channel: "Supermercados",
  },
  {
    id: "sku-005",
    name: "Vino Malbec Reserva 750ml",
    category: "Vinos",
    sellIn: 32100,
    sellOut: 27848,
    passthrough: 87,
    distributionNum: 82,
    buyingCustomers: 374,
    netRevenue: 960000,
    margin: 38,
    tradeSpend: 7.4,
    stock: 4252,
    vsbudget: 3,
    channel: "Múltiple",
  },
];

export const CHANNELS: ChannelData[] = [
  { name: "Supermercados", sellIn: 62000, sellOut: 51000, passthrough: 82, distribution: 64, customers: 218 },
  { name: "Mayoristas", sellIn: 38000, sellOut: 32000, passthrough: 84, distribution: 78, customers: 305 },
  { name: "Cadenas Especializadas", sellIn: 24000, sellOut: 19500, passthrough: 81, distribution: 55, customers: 189 },
  { name: "Gastronomía", sellIn: 12200, sellOut: 9900, passthrough: 81, distribution: 72, customers: 143 },
  { name: "E-commerce", sellIn: 7900, sellOut: 6500, passthrough: 82, distribution: 95, customers: 890 },
];

export const DISTRIBUTION_BY_CHAIN = [
  { chain: "Carrefour", value: 82 },
  { chain: "Día", value: 74 },
  { chain: "Coto", value: 68 },
  { chain: "Walmart", value: 65 },
  { chain: "Jumbo", value: 58 },
  { chain: "La Anónima", value: 52 },
  { chain: "Disco", value: 48 },
  { chain: "Vea", value: 41 },
];

export const REVENUE_WATERFALL = [
  {
    name: "Venta Bruta",
    shortName: "Venta Bruta",
    mobileName: "Bruta",
    fullName: "Venta Bruta",
    description: "Facturación bruta antes de bonificaciones, descuentos e inversión comercial.",
    value: 7200000,
    type: "total",
  },
  {
    name: "Bonif.",
    shortName: "Bonif.",
    mobileName: "Bonif.",
    fullName: "Bonificaciones",
    description: "Bonificaciones comerciales otorgadas a clientes y cadenas.",
    value: -580000,
    type: "negative",
  },
  {
    name: "Desc.",
    shortName: "Desc.",
    mobileName: "Desc.",
    fullName: "Descuentos",
    description: "Descuentos comerciales aplicados sobre venta bruta.",
    value: -420000,
    type: "negative",
  },
  {
    name: "Trade",
    shortName: "Trade",
    mobileName: "Trade",
    fullName: "Trade Spend",
    description: "Inversión comercial en ejecución, promociones y activaciones.",
    value: -810000,
    type: "negative",
  },
  {
    name: "Net Revenue",
    shortName: "Net Rev.",
    mobileName: "Net",
    fullName: "Net Revenue",
    description: "Venta neta luego de bonificaciones, descuentos y trade spend.",
    value: DEMO_CPG_TOTALS.netRevenue,
    type: "total",
  },
  {
    name: "COGS",
    shortName: "COGS",
    mobileName: "COGS",
    fullName: "Cost of Goods Sold",
    description: "Costo de producto vendido.",
    value: -3850000,
    type: "negative",
  },
  {
    name: "Opex",
    shortName: "Opex",
    mobileName: "Opex",
    fullName: "Operating Expenses",
    description: "Gastos operativos comerciales y administrativos.",
    value: -990000,
    type: "negative",
  },
  {
    name: "EBITDA",
    shortName: "EBITDA",
    mobileName: "EBITDA",
    fullName: "EBITDA",
    description: "Resultado operativo antes de intereses, impuestos, depreciación y amortización.",
    value: DEMO_CPG_TOTALS.ebitda,
    type: "total",
  },
] as const;

export const SALES_KPIS: SalesKpi[] = [
  {
    label: "Sell-in YTD 2026",
    value: "144.100",
    unit: "cajas",
    change: 14,
    changeType: "positive",
    description: "Cajas despachadas al canal",
    tooltip: "Ventas del fabricante al canal. Fuente: Fact_Ventas_Sell_In",
  },
  {
    label: "Sell-out YTD 2026",
    value: "118.900",
    unit: "cajas",
    change: 10,
    changeType: "positive",
    description: "Cajas salidas de los PDVs",
    tooltip: "Ventas del canal al consumidor. Fuente: Fact_Ventas_Sell_Out_y_Precios",
  },
  {
    label: "Passthrough",
    value: "82,5",
    unit: "%",
    change: -5,
    changeType: "negative",
    description: "Sell-out ÷ Sell-in en el período",
    tooltip: "118.900 ÷ 144.100 = 82,5%",
  },
  {
    label: "Net Revenue",
    value: "USD 5,39M",
    unit: "",
    change: 12,
    changeType: "positive",
    description: "Facturación neta YTD 2026",
    tooltip: "Fuente: Fact_Finanzas_P&L",
  },
  {
    label: "EBITDA",
    value: "USD 550K",
    unit: "",
    change: 8,
    changeType: "positive",
    description: "Margen operativo antes de D&A",
    tooltip: "Net Revenue menos COGS y Opex. Fuente: Fact_Finanzas_P&L",
  },
  {
    label: "Price Index",
    value: "0,96",
    unit: "",
    change: -4,
    changeType: "negative",
    description: "Precio promedio vs. competencia",
    tooltip: "Precio promedio relativo a referencia de mercado.",
  },
  {
    label: "Clientes directos",
    value: "1.396",
    unit: "activos",
    change: 7,
    changeType: "positive",
    description: "Compradores con al menos 1 pedido",
    tooltip: "Fuente: Dim_Clientes_Directos",
  },
  {
    label: "PDVs activos",
    value: "812",
    unit: "PDVs",
    change: 3,
    changeType: "positive",
    description: "Puntos de venta con sell-out",
    tooltip: "Fuente: Dim_Clientes_Indirectos",
  },
];

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

function assertEqual(label: string, actual: number, expected: number, tolerance = 0): string | null {
  return Math.abs(actual - expected) <= tolerance ? null : `${label}: esperado ${expected}, actual ${actual}`;
}

export function validateDemoCpgData(): string[] {
  const skuSellIn = sum(SKUS.map((sku) => sku.sellIn));
  const skuSellOut = sum(SKUS.map((sku) => sku.sellOut));
  const skuNetRevenue = sum(SKUS.map((sku) => sku.netRevenue));
  const channelSellIn = sum(CHANNELS.map((channel) => channel.sellIn));
  const channelSellOut = sum(CHANNELS.map((channel) => channel.sellOut));
  const weeklySellIn = sum(SELL_IN_SERIES);
  const weeklySellOut = sum(SELL_OUT_SERIES);
  const monthlySellIn2026 = sum(MONTHLY_SELL_IN.slice(12));
  const monthlySellOut2026 = sum(MONTHLY_SELL_OUT.slice(12));
  const grossToNet =
    REVENUE_WATERFALL[0].value +
    REVENUE_WATERFALL[1].value +
    REVENUE_WATERFALL[2].value +
    REVENUE_WATERFALL[3].value;
  const netToEbitda =
    REVENUE_WATERFALL[4].value +
    REVENUE_WATERFALL[5].value +
    REVENUE_WATERFALL[6].value;
  const passthrough = Number(((DEMO_CPG_TOTALS.sellOut / DEMO_CPG_TOTALS.sellIn) * 100).toFixed(1));

  return [
    assertEqual("SKUs sell-in", skuSellIn, DEMO_CPG_TOTALS.sellIn),
    assertEqual("SKUs sell-out", skuSellOut, DEMO_CPG_TOTALS.sellOut),
    assertEqual("SKUs net revenue", skuNetRevenue, DEMO_CPG_TOTALS.netRevenue),
    assertEqual("Canales sell-in", channelSellIn, DEMO_CPG_TOTALS.sellIn),
    assertEqual("Canales sell-out", channelSellOut, DEMO_CPG_TOTALS.sellOut),
    assertEqual("Series semanales sell-in", weeklySellIn, DEMO_CPG_TOTALS.sellIn),
    assertEqual("Series semanales sell-out", weeklySellOut, DEMO_CPG_TOTALS.sellOut),
    assertEqual("Series mensuales 2026 sell-in", monthlySellIn2026, DEMO_CPG_TOTALS.sellIn),
    assertEqual("Series mensuales 2026 sell-out", monthlySellOut2026, DEMO_CPG_TOTALS.sellOut),
    assertEqual("Waterfall gross to net", grossToNet, DEMO_CPG_TOTALS.netRevenue),
    assertEqual("Waterfall net to EBITDA", netToEbitda, DEMO_CPG_TOTALS.ebitda),
    assertEqual("Passthrough", passthrough, DEMO_CPG_TOTALS.passthrough, 0.05),
  ].filter((error): error is string => error !== null);
}

const validationErrors = validateDemoCpgData();
if (validationErrors.length > 0) {
  console.warn("[Demo CPG] Inconsistencias detectadas", validationErrors);
}

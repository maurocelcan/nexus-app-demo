import type {
  NormalizedClient,
  NormalizedPdv,
  NormalizedProduct,
  NormalizedSellInRow,
  NormalizedSellOutRow,
  ProcessedDataset,
} from "@/types/dataset";
import { CHANNELS, DEMO_CPG_TOTALS, MONTHLY_SELL_IN, SKUS } from "@/data/demo-cpg";

const MONTHS = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];

const CLIENTS: NormalizedClient[] = [
  { id: "cli-carrefour", name: "Carrefour", channel: "Supermercados" },
  { id: "cli-coto", name: "Coto", channel: "Supermercados" },
  { id: "cli-jumbo", name: "Jumbo", channel: "Supermercados" },
  { id: "cli-yaguar", name: "Yaguar", channel: "Mayoristas" },
  { id: "cli-diarco", name: "Diarco", channel: "Mayoristas" },
  { id: "cli-farmacity", name: "Farmacity", channel: "Cadenas Especializadas" },
  { id: "cli-onpremise", name: "On Premise BA", channel: "Gastronomía" },
  { id: "cli-mercadolibre", name: "Mercado Libre", channel: "E-commerce" },
];

const CLIENT_WEIGHTS: Record<string, { clientId: string; weight: number }[]> = {
  Supermercados: [
    { clientId: "cli-carrefour", weight: 0.42 },
    { clientId: "cli-coto", weight: 0.34 },
    { clientId: "cli-jumbo", weight: 0.24 },
  ],
  Mayoristas: [
    { clientId: "cli-yaguar", weight: 0.54 },
    { clientId: "cli-diarco", weight: 0.46 },
  ],
  "Cadenas Especializadas": [{ clientId: "cli-farmacity", weight: 1 }],
  Gastronomía: [{ clientId: "cli-onpremise", weight: 1 }],
  "E-commerce": [{ clientId: "cli-mercadolibre", weight: 1 }],
};

const MULTIPLE_CHANNEL_WEIGHTS = [
  { channel: "Supermercados", weight: 0.38 },
  { channel: "Mayoristas", weight: 0.24 },
  { channel: "Cadenas Especializadas", weight: 0.16 },
  { channel: "Gastronomía", weight: 0.12 },
  { channel: "E-commerce", weight: 0.1 },
];

const PRICE_INDEX_BY_SKU: Record<string, number> = {
  "sku-001": 0.93,
  "sku-002": 0.98,
  "sku-003": 1.04,
  "sku-004": 0.95,
  "sku-005": 0.99,
};

function splitNumber(total: number, weights: number[]): number[] {
  const raw = weights.map((weight) => total * weight);
  const base = raw.map(Math.floor);
  const remainder = Math.round(total) - base.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  for (let i = 0; i < remainder; i++) base[order[i % order.length].index] += 1;
  return base;
}

function channelSplits(channel: string) {
  return channel === "Múltiple" ? MULTIPLE_CHANNEL_WEIGHTS : [{ channel, weight: 1 }];
}

const monthWeights = MONTHLY_SELL_IN.slice(12).map((value) => value / DEMO_CPG_TOTALS.sellIn);
const products: NormalizedProduct[] = SKUS.map((sku) => ({ id: sku.id, name: sku.name }));
const pdvs: NormalizedPdv[] = CLIENTS.flatMap((client, index) =>
  Array.from({ length: client.channel === "Supermercados" ? 4 : 2 }, (_, itemIndex) => ({
    id: `pdv-${index + 1}-${itemIndex + 1}`,
    clientId: client.id,
    name: `${client.name} PDV ${itemIndex + 1}`,
    channel: client.channel,
  }))
);

function buildSellInRows(): NormalizedSellInRow[] {
  const rows: NormalizedSellInRow[] = [];
  for (const sku of SKUS) {
    const monthlySellIn = splitNumber(sku.sellIn, monthWeights);
    const monthlyRevenue = splitNumber(sku.netRevenue, monthWeights);
    const skuEbitda = Math.round(DEMO_CPG_TOTALS.ebitda * (sku.netRevenue / DEMO_CPG_TOTALS.netRevenue));
    const monthlyEbitda = splitNumber(skuEbitda, monthWeights);
    MONTHS.forEach((month, monthIndex) => {
      const channelParts = channelSplits(sku.channel);
      const sellInByChannel = splitNumber(monthlySellIn[monthIndex], channelParts.map((part) => part.weight));
      const revenueByChannel = splitNumber(monthlyRevenue[monthIndex], channelParts.map((part) => part.weight));
      const ebitdaByChannel = splitNumber(monthlyEbitda[monthIndex], channelParts.map((part) => part.weight));
      channelParts.forEach((channelPart, channelIndex) => {
        const clientParts = CLIENT_WEIGHTS[channelPart.channel];
        const sellInByClient = splitNumber(sellInByChannel[channelIndex], clientParts.map((part) => part.weight));
        const revenueByClient = splitNumber(revenueByChannel[channelIndex], clientParts.map((part) => part.weight));
        const ebitdaByClient = splitNumber(ebitdaByChannel[channelIndex], clientParts.map((part) => part.weight));
        clientParts.forEach((clientPart, clientIndex) => {
          const client = CLIENTS.find((item) => item.id === clientPart.clientId);
          rows.push({
            month,
            skuId: sku.id,
            skuName: sku.name,
            clientId: client?.id,
            clientName: client?.name,
            channel: channelPart.channel,
            volumeCajas: sellInByClient[clientIndex],
            netRevenue: revenueByClient[clientIndex],
            ebitda: ebitdaByClient[clientIndex],
          });
        });
      });
    });
  }
  return rows;
}

function buildSellOutRows(): NormalizedSellOutRow[] {
  const rows: NormalizedSellOutRow[] = [];
  for (const sku of SKUS) {
    const monthlySellOut = splitNumber(sku.sellOut, monthWeights);
    MONTHS.forEach((month, monthIndex) => {
      const channelParts = channelSplits(sku.channel);
      const sellOutByChannel = splitNumber(monthlySellOut[monthIndex], channelParts.map((part) => part.weight));
      channelParts.forEach((channelPart, channelIndex) => {
        const clientParts = CLIENT_WEIGHTS[channelPart.channel];
        const sellOutByClient = splitNumber(sellOutByChannel[channelIndex], clientParts.map((part) => part.weight));
        clientParts.forEach((clientPart, clientIndex) => {
          const client = CLIENTS.find((item) => item.id === clientPart.clientId);
          const clientPdvs = pdvs.filter((pdv) => pdv.clientId === clientPart.clientId);
          const sellOutByPdv = splitNumber(sellOutByClient[clientIndex], clientPdvs.map(() => 1 / clientPdvs.length));
          clientPdvs.forEach((pdv, pdvIndex) => {
            rows.push({
              month,
              skuId: sku.id,
              skuName: sku.name,
              pdvId: pdv.id,
              clientId: client?.id,
              clientName: client?.name,
              channel: channelPart.channel,
              volumeCajasOut: sellOutByPdv[pdvIndex],
              priceIndex: PRICE_INDEX_BY_SKU[sku.id],
            });
          });
        });
      });
    });
  }
  return rows;
}

const sellInRows = buildSellInRows();
const sellOutRows = buildSellOutRows();

export const DEMO_PROCESSED_DATASET: ProcessedDataset = {
  id: "dataset-demo-cpg",
  fileName: "Demo CPG Portfolio 2025-2026",
  fileSize: 4_800_000,
  uploadedAt: "2026-05-13T07:45:00Z",
  sheets: [
    { name: "Fact_Ventas_Sell_In", rows: sellInRows.length, columns: ["Mes", "SKU", "Cliente", "Canal", "Volumen_Cajas", "Net_Revenue"], domain: "sales", status: "processed" },
    { name: "Fact_Ventas_Sell_Out_y_Precios", rows: sellOutRows.length, columns: ["Mes", "SKU", "PDV", "Cliente", "Canal", "Vol_Cajas_Out", "Price_Index"], domain: "sales", status: "processed" },
    { name: "Dim_Productos", rows: products.length, columns: ["ID_SKU", "SKU_Nombre"], domain: "dimension", status: "processed" },
    { name: "Dim_Clientes_Directos", rows: CLIENTS.length, columns: ["ID_Cliente", "Cliente", "Canal"], domain: "dimension", status: "processed" },
    { name: "Dim_Clientes_Indirectos", rows: pdvs.length, columns: ["ID_PDV", "Cliente", "Canal"], domain: "dimension", status: "processed" },
  ],
  salesKpis: {
    sellInYtd: DEMO_CPG_TOTALS.sellIn,
    sellOutYtd: DEMO_CPG_TOTALS.sellOut,
    netRevenueYtd: DEMO_CPG_TOTALS.netRevenue,
    ebitdaYtd: DEMO_CPG_TOTALS.ebitda,
    passthrough: DEMO_CPG_TOTALS.sellOut / DEMO_CPG_TOTALS.sellIn,
    activeDirectClients: CLIENTS.length,
    activePdvs: pdvs.length,
    priceIndexAvg: DEMO_CPG_TOTALS.priceIndex,
    sellInVarPct: 14,
    sellOutVarPct: 10,
    netRevenueVarPct: 12,
    ebitdaVarPct: 8,
    passthroughVarPct: -5,
    priceIndexVarPct: -4,
  },
  salesTables: {},
  salesData: {
    sellInRows,
    sellOutRows,
    products,
    directClients: CLIENTS,
    indirectClients: pdvs,
  },
  availableFilters: {
    months: MONTHS,
    skus: products,
    channels: CHANNELS.map((channel) => channel.name),
    clients: CLIENTS.map((client) => ({ id: client.id, name: client.name })),
  },
  mapping: [],
  validation: {
    warnings: [],
    errors: [],
    sheetsFound: ["Fact_Ventas_Sell_In", "Fact_Ventas_Sell_Out_y_Precios", "Dim_Productos", "Dim_Clientes_Directos", "Dim_Clientes_Indirectos"],
    sheetsMissing: [],
    columnMappings: [],
  },
};

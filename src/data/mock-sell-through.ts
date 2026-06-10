import { DEMO_CPG_META, DEMO_CPG_TOTALS, MONTHLY_LABELS, MONTHLY_NET_REVENUE, MONTHLY_SELL_OUT, SKUS } from "./demo-cpg";

export type SellThroughPdvStatus = "buyer" | "non-buyer" | "potential";
export type SellThroughChannel = string;
export type SellThroughPeriod = "YTD" | "QTD" | "MTD" | "12M";
export type PromotionMechanic = "Precio especial" | "Descuento porcentual" | "Combo" | "Bundle" | "Bonificación" | "2x1 / segunda unidad";
export type DynamicStatus = "Borrador" | "En planificación" | "En ejecución" | "Finalizada";

export interface SellThroughZone {
  id: string;
  name: string;
  description: string;
  bounds: { left: number; top: number; width: number; height: number };
}

export interface SellThroughDistributor {
  id: string;
  name: string;
  zone: string;
  servicedPdvs: number;
}

export interface SellThroughPdv {
  id: string;
  name: string;
  channel: SellThroughChannel;
  zoneId: string;
  distributorId: string;
  status: SellThroughPdvStatus;
  x: number;
  y: number;
  lat?: number;
  lng?: number;
  address?: string;
  averageTicket?: number;
  visitFrequency?: string;
  revenue: number;
  volume: number;
  skusBought: string[];
  lastPurchase: string;
  opportunity: number;
  mixReal: number;
  mixTarget: number;
  served: boolean;
}

export interface SellThroughSku {
  id: string;
  name: string;
  category: string;
  buyerCustomers: number;
  distribution: number;
  targetDistribution: number;
  volume: number;
  revenue: number;
  trend: number;
}

export interface SellThroughMixRow {
  id: string;
  label: string;
  real: number;
  target: number;
}

export interface SellThroughDynamic {
  id: string;
  name: string;
  status: DynamicStatus;
  startDate: string;
  endDate: string;
  targetPdvs: number;
  activatedPdvs: number;
  targetVolume: number;
  realVolume: number;
  targetRevenue: number;
  realRevenue: number;
  margin: number;
  deviation: number;
  nextAction: string;
  evolution: { label: string; expected: number; actual: number }[];
}

export const SELL_THROUGH_META = {
  title: "Sell-Through",
  subtitle: "Command Center de clientes, PDVs y ejecución comercial",
  dataset: DEMO_CPG_META.datasetName,
  company: DEMO_CPG_META.companyName,
  period: DEMO_CPG_META.period,
} as const;

export const SELL_THROUGH_PERIODS: { value: SellThroughPeriod; label: string; factor: number }[] = [
  { value: "YTD", label: "YTD 2026", factor: 1 },
  { value: "QTD", label: "Q2 2026", factor: 0.44 },
  { value: "MTD", label: "Jun 2026", factor: 0.18 },
  { value: "12M", label: "Últimos 12M", factor: 1.28 },
];

export const SELL_THROUGH_ZONES: SellThroughZone[] = [
  { id: "palermo", name: "Palermo / Colegiales", description: "Zona norte CABA con alto peso de autoservicios premium.", bounds: { left: 15, top: 16, width: 34, height: 33 } },
  { id: "recoleta", name: "Recoleta / Retiro", description: "Densidad alta de supermercados, gastronomía y minimarkets.", bounds: { left: 48, top: 21, width: 31, height: 29 } },
  { id: "caballito", name: "Caballito / Almagro", description: "Zona de volumen medio con oportunidades de distribución.", bounds: { left: 26, top: 54, width: 39, height: 31 } },
];

export const SELL_THROUGH_DISTRIBUTORS: SellThroughDistributor[] = [
  { id: "dist-norte", name: "Distribuidora Norte SA", zone: "CABA Norte", servicedPdvs: 236 },
  { id: "bebidas-elite", name: "Bebidas Elite", zone: "CABA Premium", servicedPdvs: 184 },
  { id: "dist-centro", name: "Distribuidora Centro SRL", zone: "CABA Centro", servicedPdvs: 211 },
  { id: "grupo-bebidas", name: "Grupo Bebidas", zone: "CABA Oeste", servicedPdvs: 172 },
];

export const SELL_THROUGH_PDVS: SellThroughPdv[] = [
  { id: "pdv-001", name: "Carrefour Palermo", channel: "Supermercado", zoneId: "palermo", distributorId: "dist-norte", status: "buyer", x: 24, y: 27, revenue: 184000, volume: 4200, skusBought: ["sku-001", "sku-003", "sku-004", "sku-005"], lastPurchase: "2026-06-12", opportunity: 34000, mixReal: 78, mixTarget: 86, served: true },
  { id: "pdv-002", name: "Mini Soho Market", channel: "Minimarket", zoneId: "palermo", distributorId: "bebidas-elite", status: "potential", x: 31, y: 36, revenue: 42000, volume: 980, skusBought: ["sku-004"], lastPurchase: "2026-05-28", opportunity: 26000, mixReal: 46, mixTarget: 74, served: true },
  { id: "pdv-003", name: "Almacén Nicaragua", channel: "Almacén", zoneId: "palermo", distributorId: "dist-norte", status: "non-buyer", x: 42, y: 29, revenue: 0, volume: 0, skusBought: [], lastPurchase: "-", opportunity: 18000, mixReal: 0, mixTarget: 68, served: false },
  { id: "pdv-004", name: "Kiosco Plaza Italia", channel: "Kiosco", zoneId: "palermo", distributorId: "bebidas-elite", status: "buyer", x: 18, y: 43, revenue: 38000, volume: 760, skusBought: ["sku-002", "sku-004"], lastPurchase: "2026-06-15", opportunity: 12000, mixReal: 51, mixTarget: 70, served: true },
  { id: "pdv-005", name: "Disco Recoleta", channel: "Supermercado", zoneId: "recoleta", distributorId: "dist-centro", status: "buyer", x: 59, y: 30, revenue: 156000, volume: 3600, skusBought: ["sku-001", "sku-002", "sku-003", "sku-005"], lastPurchase: "2026-06-14", opportunity: 28000, mixReal: 82, mixTarget: 88, served: true },
  { id: "pdv-006", name: "Coto Recoleta", channel: "Supermercado", zoneId: "recoleta", distributorId: "dist-centro", status: "buyer", x: 71, y: 39, revenue: 120000, volume: 2800, skusBought: ["sku-001", "sku-004", "sku-005"], lastPurchase: "2026-06-10", opportunity: 31000, mixReal: 76, mixTarget: 85, served: true },
  { id: "pdv-007", name: "Gastro Arenales", channel: "Gastronomía", zoneId: "recoleta", distributorId: "grupo-bebidas", status: "potential", x: 54, y: 45, revenue: 24000, volume: 420, skusBought: ["sku-003"], lastPurchase: "2026-05-21", opportunity: 22000, mixReal: 38, mixTarget: 72, served: true },
  { id: "pdv-008", name: "Despensa Libertad", channel: "Almacén", zoneId: "recoleta", distributorId: "grupo-bebidas", status: "non-buyer", x: 78, y: 26, revenue: 0, volume: 0, skusBought: [], lastPurchase: "-", opportunity: 15000, mixReal: 0, mixTarget: 66, served: false },
  { id: "pdv-009", name: "Carrefour Caballito", channel: "Supermercado", zoneId: "caballito", distributorId: "dist-centro", status: "buyer", x: 39, y: 66, revenue: 180000, volume: 4100, skusBought: ["sku-001", "sku-002", "sku-004", "sku-005"], lastPurchase: "2026-06-16", opportunity: 21000, mixReal: 80, mixTarget: 86, served: true },
  { id: "pdv-010", name: "Mini Primera Junta", channel: "Minimarket", zoneId: "caballito", distributorId: "grupo-bebidas", status: "buyer", x: 52, y: 73, revenue: 24000, volume: 550, skusBought: ["sku-004"], lastPurchase: "2026-06-08", opportunity: 19000, mixReal: 42, mixTarget: 70, served: true },
  { id: "pdv-011", name: "Almacén Acoyte", channel: "Almacén", zoneId: "caballito", distributorId: "grupo-bebidas", status: "potential", x: 29, y: 78, revenue: 16000, volume: 370, skusBought: ["sku-002"], lastPurchase: "2026-05-30", opportunity: 24000, mixReal: 34, mixTarget: 68, served: true },
  { id: "pdv-012", name: "Kiosco Rivadavia", channel: "Kiosco", zoneId: "caballito", distributorId: "dist-centro", status: "non-buyer", x: 62, y: 59, revenue: 0, volume: 0, skusBought: [], lastPurchase: "-", opportunity: 11000, mixReal: 0, mixTarget: 62, served: false },
  { id: "pdv-013", name: "Jumbo Palermo", channel: "Supermercado", zoneId: "palermo", distributorId: "dist-norte", status: "buyer", x: 36, y: 19, revenue: 230000, volume: 5200, skusBought: ["sku-001", "sku-002", "sku-003", "sku-004", "sku-005"], lastPurchase: "2026-06-17", opportunity: 14000, mixReal: 85, mixTarget: 88, served: true },
  { id: "pdv-014", name: "Market Pueyrredón", channel: "Minimarket", zoneId: "recoleta", distributorId: "dist-centro", status: "buyer", x: 66, y: 48, revenue: 29000, volume: 670, skusBought: ["sku-002", "sku-004"], lastPurchase: "2026-06-03", opportunity: 17000, mixReal: 50, mixTarget: 72, served: true },
  { id: "pdv-015", name: "Café Botánico Norte", channel: "Gastronomía", zoneId: "palermo", distributorId: "bebidas-elite", status: "potential", x: 47, y: 45, revenue: 18000, volume: 310, skusBought: ["sku-003"], lastPurchase: "2026-06-01", opportunity: 30000, mixReal: 44, mixTarget: 76, served: true },
  { id: "pdv-016", name: "Autoservicio Billinghurst", channel: "Almacén", zoneId: "caballito", distributorId: "grupo-bebidas", status: "buyer", x: 45, y: 84, revenue: 31000, volume: 720, skusBought: ["sku-001", "sku-004"], lastPurchase: "2026-06-11", opportunity: 16000, mixReal: 55, mixTarget: 70, served: true },
  { id: "pdv-017", name: "Gastro Santa Fe", channel: "Gastronomía", zoneId: "recoleta", distributorId: "bebidas-elite", status: "non-buyer", x: 73, y: 50, revenue: 0, volume: 0, skusBought: [], lastPurchase: "-", opportunity: 27000, mixReal: 0, mixTarget: 74, served: false },
  { id: "pdv-018", name: "Minimarket Yerbal", channel: "Minimarket", zoneId: "caballito", distributorId: "dist-centro", status: "potential", x: 34, y: 58, revenue: 12000, volume: 240, skusBought: ["sku-004"], lastPurchase: "2026-05-19", opportunity: 20000, mixReal: 32, mixTarget: 68, served: true },
  { id: "pdv-019", name: "Autoservicio Honduras", channel: "Almacén", zoneId: "palermo", distributorId: "dist-norte", status: "buyer", x: 22, y: 22, revenue: 46000, volume: 920, skusBought: ["sku-002", "sku-003", "sku-004"], lastPurchase: "2026-06-13", opportunity: 17000, mixReal: 58, mixTarget: 74, served: true },
  { id: "pdv-020", name: "Kiosco Thames", channel: "Kiosco", zoneId: "palermo", distributorId: "bebidas-elite", status: "potential", x: 27, y: 18, revenue: 9000, volume: 190, skusBought: ["sku-004"], lastPurchase: "2026-05-22", opportunity: 14000, mixReal: 28, mixTarget: 62, served: true },
  { id: "pdv-021", name: "Market Dorrego", channel: "Minimarket", zoneId: "palermo", distributorId: "dist-norte", status: "buyer", x: 44, y: 22, revenue: 52000, volume: 1180, skusBought: ["sku-001", "sku-003", "sku-005"], lastPurchase: "2026-06-09", opportunity: 23000, mixReal: 61, mixTarget: 78, served: true },
  { id: "pdv-022", name: "Almacén Güemes", channel: "Almacén", zoneId: "palermo", distributorId: "bebidas-elite", status: "non-buyer", x: 16, y: 31, revenue: 0, volume: 0, skusBought: [], lastPurchase: "-", opportunity: 16000, mixReal: 0, mixTarget: 64, served: false },
  { id: "pdv-023", name: "Café Serrano", channel: "Gastronomía", zoneId: "palermo", distributorId: "bebidas-elite", status: "potential", x: 39, y: 39, revenue: 15000, volume: 260, skusBought: ["sku-003"], lastPurchase: "2026-06-02", opportunity: 25000, mixReal: 36, mixTarget: 76, served: true },
  { id: "pdv-024", name: "Despensa Malabia", channel: "Almacén", zoneId: "palermo", distributorId: "dist-norte", status: "buyer", x: 48, y: 43, revenue: 27000, volume: 610, skusBought: ["sku-002", "sku-004"], lastPurchase: "2026-06-07", opportunity: 15000, mixReal: 48, mixTarget: 68, served: true },
  { id: "pdv-025", name: "Super Express Anchorena", channel: "Supermercado", zoneId: "recoleta", distributorId: "dist-centro", status: "buyer", x: 62, y: 27, revenue: 74000, volume: 1620, skusBought: ["sku-001", "sku-002", "sku-004"], lastPurchase: "2026-06-12", opportunity: 24000, mixReal: 66, mixTarget: 82, served: true },
  { id: "pdv-026", name: "Minimarket Junín", channel: "Minimarket", zoneId: "recoleta", distributorId: "grupo-bebidas", status: "potential", x: 69, y: 30, revenue: 11000, volume: 230, skusBought: ["sku-003"], lastPurchase: "2026-05-26", opportunity: 19000, mixReal: 30, mixTarget: 70, served: true },
  { id: "pdv-027", name: "Bar Montevideo", channel: "Gastronomía", zoneId: "recoleta", distributorId: "bebidas-elite", status: "buyer", x: 75, y: 34, revenue: 36000, volume: 640, skusBought: ["sku-003", "sku-005"], lastPurchase: "2026-06-04", opportunity: 22000, mixReal: 52, mixTarget: 76, served: true },
  { id: "pdv-028", name: "Kiosco Callao", channel: "Kiosco", zoneId: "recoleta", distributorId: "grupo-bebidas", status: "non-buyer", x: 82, y: 41, revenue: 0, volume: 0, skusBought: [], lastPurchase: "-", opportunity: 13000, mixReal: 0, mixTarget: 60, served: false },
  { id: "pdv-029", name: "Autoservicio Pacheco", channel: "Almacén", zoneId: "recoleta", distributorId: "dist-centro", status: "buyer", x: 56, y: 52, revenue: 28000, volume: 580, skusBought: ["sku-002", "sku-004"], lastPurchase: "2026-06-01", opportunity: 16000, mixReal: 45, mixTarget: 68, served: true },
  { id: "pdv-030", name: "Restó Libertador", channel: "Gastronomía", zoneId: "recoleta", distributorId: "bebidas-elite", status: "potential", x: 86, y: 24, revenue: 17000, volume: 300, skusBought: ["sku-003"], lastPurchase: "2026-05-27", opportunity: 28000, mixReal: 42, mixTarget: 78, served: true },
  { id: "pdv-031", name: "Super Acoyte", channel: "Supermercado", zoneId: "caballito", distributorId: "dist-centro", status: "buyer", x: 43, y: 67, revenue: 68000, volume: 1510, skusBought: ["sku-001", "sku-002", "sku-004", "sku-005"], lastPurchase: "2026-06-15", opportunity: 18000, mixReal: 70, mixTarget: 82, served: true },
  { id: "pdv-032", name: "Almacén Guayaquil", channel: "Almacén", zoneId: "caballito", distributorId: "grupo-bebidas", status: "potential", x: 58, y: 69, revenue: 13000, volume: 280, skusBought: ["sku-004"], lastPurchase: "2026-05-25", opportunity: 21000, mixReal: 35, mixTarget: 68, served: true },
  { id: "pdv-033", name: "Kiosco Río de Janeiro", channel: "Kiosco", zoneId: "caballito", distributorId: "dist-centro", status: "buyer", x: 31, y: 72, revenue: 19000, volume: 420, skusBought: ["sku-002", "sku-004"], lastPurchase: "2026-06-08", opportunity: 12000, mixReal: 44, mixTarget: 65, served: true },
  { id: "pdv-034", name: "Café Parque Rivadavia", channel: "Gastronomía", zoneId: "caballito", distributorId: "grupo-bebidas", status: "potential", x: 50, y: 82, revenue: 16000, volume: 290, skusBought: ["sku-003"], lastPurchase: "2026-05-29", opportunity: 26000, mixReal: 39, mixTarget: 74, served: true },
  { id: "pdv-035", name: "Despensa Neuquén", channel: "Almacén", zoneId: "caballito", distributorId: "dist-centro", status: "non-buyer", x: 66, y: 78, revenue: 0, volume: 0, skusBought: [], lastPurchase: "-", opportunity: 14500, mixReal: 0, mixTarget: 62, served: false },
  { id: "pdv-036", name: "Minimarket Directorio", channel: "Minimarket", zoneId: "caballito", distributorId: "grupo-bebidas", status: "buyer", x: 24, y: 86, revenue: 22000, volume: 490, skusBought: ["sku-001", "sku-004"], lastPurchase: "2026-06-05", opportunity: 15000, mixReal: 50, mixTarget: 70, served: true },
  { id: "pdv-037", name: "Mayorista Corrientes", channel: "Supermercado", zoneId: "caballito", distributorId: "dist-centro", status: "buyer", x: 70, y: 62, revenue: 82000, volume: 1810, skusBought: ["sku-001", "sku-002", "sku-003", "sku-004"], lastPurchase: "2026-06-16", opportunity: 26000, mixReal: 72, mixTarget: 84, served: true },
  { id: "pdv-038", name: "Almacén Medrano", channel: "Almacén", zoneId: "palermo", distributorId: "dist-centro", status: "potential", x: 52, y: 57, revenue: 12000, volume: 250, skusBought: ["sku-004"], lastPurchase: "2026-05-24", opportunity: 19000, mixReal: 33, mixTarget: 68, served: true },
  { id: "pdv-039", name: "Gastro Scalabrini", channel: "Gastronomía", zoneId: "palermo", distributorId: "bebidas-elite", status: "buyer", x: 57, y: 40, revenue: 33000, volume: 590, skusBought: ["sku-003", "sku-005"], lastPurchase: "2026-06-10", opportunity: 27000, mixReal: 56, mixTarget: 78, served: true },
  { id: "pdv-040", name: "Kiosco Uruguay", channel: "Kiosco", zoneId: "recoleta", distributorId: "grupo-bebidas", status: "potential", x: 74, y: 55, revenue: 8000, volume: 160, skusBought: ["sku-004"], lastPurchase: "2026-05-18", opportunity: 12500, mixReal: 24, mixTarget: 60, served: true },
];

export const SELL_THROUGH_SKUS: SellThroughSku[] = SKUS.map((sku) => ({
  id: sku.id,
  name: sku.name,
  category: sku.category,
  buyerCustomers: sku.buyingCustomers,
  distribution: sku.distributionNum,
  targetDistribution: sku.id === "sku-001" ? 76 : sku.id === "sku-003" ? 72 : sku.distributionNum + 6,
  volume: sku.sellOut,
  revenue: sku.netRevenue,
  trend: sku.vsbudget,
}));

export const SELL_THROUGH_MIX: SellThroughMixRow[] = [
  { id: "sku-001", label: "Espumante Brut", real: 17, target: 24 },
  { id: "sku-002", label: "Aperitivo de Hierbas", real: 22, target: 19 },
  { id: "sku-003", label: "Gin Botánico", real: 13, target: 19 },
  { id: "sku-004", label: "Cerveza IPA", real: 33, target: 24 },
  { id: "sku-005", label: "Vino Malbec", real: 15, target: 14 },
];

export const SELL_THROUGH_PROMOTION_MECHANICS: PromotionMechanic[] = [
  "Precio especial",
  "Descuento porcentual",
  "Combo",
  "Bundle",
  "Bonificación",
  "2x1 / segunda unidad",
];

export const SELL_THROUGH_DYNAMICS: SellThroughDynamic[] = [
  {
    id: "dyn-001",
    name: "Impulso Vodka Premium en CABA Norte",
    status: "En ejecución",
    startDate: "2026-06-03",
    endDate: "2026-07-01",
    targetPdvs: 42,
    activatedPdvs: 27,
    targetVolume: 1680,
    realVolume: 1040,
    targetRevenue: 75600,
    realRevenue: 46800,
    margin: 35,
    deviation: -18,
    nextAction: "Acelerar activación en PDVs con compra de Gin Botánico y sin Vodka Premium.",
    evolution: [
      { label: "S1", expected: 22, actual: 18 },
      { label: "S2", expected: 38, actual: 30 },
      { label: "S3", expected: 56, actual: 43 },
      { label: "S4", expected: 74, actual: 61 },
    ],
  },
  {
    id: "dyn-002",
    name: "Recuperación Espumante Brut en supermercados",
    status: "En planificación",
    startDate: "2026-06-24",
    endDate: "2026-07-21",
    targetPdvs: 36,
    activatedPdvs: 0,
    targetVolume: 1440,
    realVolume: 0,
    targetRevenue: 64800,
    realRevenue: 0,
    margin: 32,
    deviation: 0,
    nextAction: "Validar inversión con RGM y alinear exhibición con distribuidores.",
    evolution: [
      { label: "S1", expected: 18, actual: 0 },
      { label: "S2", expected: 36, actual: 0 },
      { label: "S3", expected: 54, actual: 0 },
      { label: "S4", expected: 72, actual: 0 },
    ],
  },
];

export const SELL_THROUGH_MONTHLY = MONTHLY_LABELS.slice(12).map((label, index) => ({
  label,
  revenue: MONTHLY_NET_REVENUE.slice(12)[index],
  volume: MONTHLY_SELL_OUT.slice(12)[index],
  target: Math.round(MONTHLY_SELL_OUT.slice(12)[index] * (index < 3 ? 1.08 : 1.03)),
}));

/**
 * Sell-in vs Sell-out mock mensual — same shape as SellInOutRow from sell-through-real.ts
 * Derivado de SELL_THROUGH_MONTHLY con sell-in ~15% sobre sell-out.
 */
export const SELL_THROUGH_SELL_IN_OUT = SELL_THROUGH_MONTHLY.map((row) => {
  const sellIn = Math.round(row.volume * 1.14);
  const sellOut = row.volume;
  return {
    label: row.label,
    sellIn,
    sellOut,
    passthrough: sellOut / Math.max(sellIn, 1),
  };
});

export const SELL_THROUGH_BASE_KPIS = {
  netRevenue: DEMO_CPG_TOTALS.netRevenue,
  volume: DEMO_CPG_TOTALS.sellOut,
  numericDistribution: DEMO_CPG_TOTALS.dn,
  buyerCustomers: SKUS.reduce((acc, sku) => acc + sku.buyingCustomers, 0),
  successPhoto: 68,
  mixReal: 73,
  mixTarget: 84,
  margin: 36,
};

export const SELL_THROUGH_REFERENCE_KPIS = {
  mixReal: 73,
  mixTarget: 84,
  margin: 36,
  pdvOpportunityUsd: 244_000,
};

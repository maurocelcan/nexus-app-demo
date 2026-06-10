import type { CommercialBusinessArea, CommercialKpiKey, ProcessedDataset } from "@/types/dataset";
import type { SalesKpi } from "@/types/analytics";
import type { WorkspaceDatasetState } from "@/stores/data-source-store";
import { formatCurrency, formatPercentage, formatRatio, formatVolume } from "@/lib/utils";

export type EnterpriseModuleId =
  | "finanzas"
  | "trade-marketing"
  | "supply"
  | "rgm"
  | "planning"
  | "crm"
  | "sell-through"
  | "marketing";

export type EnterpriseModuleDatasetConfig = {
  id: EnterpriseModuleId;
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyDescription: string;
  compatibleDatasets: string[];
  areas: CommercialBusinessArea[];
  kpis: CommercialKpiKey[];
};

export const ENTERPRISE_MODULE_DATASET_CONFIG: Record<EnterpriseModuleId, EnterpriseModuleDatasetConfig> = {
  finanzas: {
    id: "finanzas",
    title: "Finanzas",
    subtitle: "P&L · rentabilidad · EBITDA · cash discipline",
    emptyTitle: "Finanzas sin dataset activo",
    emptyDescription: "Cargá un Excel con P&L, revenue, COGS, EBITDA o activá la Demo CPG para ver el módulo financiero.",
    compatibleDatasets: ["P&L mensual", "Fact_Finanzas", "KPIs EBITDA", "cuentas por cobrar"],
    areas: ["finance"],
    kpis: ["netRevenue", "grossRevenue", "ebitda", "grossMargin", "cogs", "opex", "tradeSpend", "dso"],
  },
  "trade-marketing": {
    id: "trade-marketing",
    title: "Trade Marketing",
    subtitle: "promociones · ejecución PDV · inversión comercial",
    emptyTitle: "Trade Marketing sin dataset activo",
    emptyDescription: "Conectá promociones, activaciones, ejecución en PDV o trade spend para analizar performance comercial.",
    compatibleDatasets: ["plan promocional", "ejecución PDV", "trade spend", "foto de éxito"],
    areas: ["trade-marketing"],
    kpis: ["tradeSpend", "promotionalRoi", "shareOfShelf", "numericDistribution", "sellOutVolume"],
  },
  supply: {
    id: "supply",
    title: "Supply Chain",
    subtitle: "OTIF · fill rate · inventario · riesgo de quiebre",
    emptyTitle: "Supply Chain sin dataset activo",
    emptyDescription: "Cargá inventario, OTIF, fill rate o stock por SKU para monitorear servicio y disponibilidad.",
    compatibleDatasets: ["inventario", "OTIF", "fill rate", "stock por SKU"],
    areas: ["supply-chain"],
    kpis: ["inventory", "otif", "fillRate", "cogs", "sellInVolume"],
  },
  rgm: {
    id: "rgm",
    title: "RGM",
    subtitle: "pricing · mix · elasticidad · price index",
    emptyTitle: "RGM sin dataset activo",
    emptyDescription: "Cargá pricing, price index, mix o revenue por SKU para activar análisis de Revenue Growth Management.",
    compatibleDatasets: ["price index", "ASP", "mix SKU", "promos ROI"],
    areas: ["rgm"],
    kpis: ["priceIndex", "asp", "netRevenue", "grossMargin", "promotionalRoi", "passthrough"],
  },
  planning: {
    id: "planning",
    title: "Planning",
    subtitle: "objetivos · forecast · presupuesto · escenarios",
    emptyTitle: "Planning sin dataset activo",
    emptyDescription: "Cargá objetivos, budget, forecast o top-down mensual para comparar plan vs realidad.",
    compatibleDatasets: ["objetivos mensuales", "budget", "forecast", "top-down"],
    areas: ["planning", "control"],
    kpis: ["sellInVolume", "sellOutVolume", "netRevenue", "ebitda", "numericDistribution", "passthrough"],
  },
  crm: {
    id: "crm",
    title: "CRM",
    subtitle: "clientes · cobranzas · riesgo · cuentas",
    emptyTitle: "CRM sin dataset activo",
    emptyDescription: "Cargá maestros de clientes, facturas, cobranza o performance por cuenta para activar CRM.",
    compatibleDatasets: ["clientes", "facturas", "DSO", "cobranza"],
    areas: ["crm"],
    kpis: ["dso", "netRevenue", "sellInVolume", "sellOutVolume"],
  },
  "sell-through": {
    id: "sell-through",
    title: "Sell-Through",
    subtitle: "PDVs · cobertura · compradores · rotación",
    emptyTitle: "Sell-Through sin dataset activo",
    emptyDescription: "Cargá sell-out, PDVs, distribución o datos de comprador para activar el command center.",
    compatibleDatasets: ["sell-out por PDV", "universo PDV", "compradores SKU", "DN"],
    areas: ["sell-through"],
    kpis: ["sellOutVolume", "sellThrough", "numericDistribution", "passthrough", "priceIndex"],
  },
  marketing: {
    id: "marketing",
    title: "Marketing",
    subtitle: "campañas · market share · brand awareness · inversión",
    emptyTitle: "Marketing sin dataset activo",
    emptyDescription: "Cargá campañas, inversión por medio, market share o datos de brand tracking para activar el módulo de Marketing.",
    compatibleDatasets: ["campañas", "inversión media", "market share", "brand tracking"],
    areas: ["marketing"],
    kpis: ["marketingSpend", "campaignRoi", "marketShare", "householdPenetration"],
  },
};

export function realDatasetKpisForModule(dataset: ProcessedDataset, config: EnterpriseModuleDatasetConfig): SalesKpi[] {
  const semanticKpis = dataset.semanticProfile?.kpis.filter((kpi) => config.kpis.includes(kpi.key)) ?? [];
  const result: SalesKpi[] = [];

  function ct(v: number | undefined): SalesKpi["changeType"] {
    if (v === undefined) return "neutral";
    return v >= 0 ? "positive" : "negative";
  }
  const sk = dataset.salesKpis;
  if (config.kpis.includes("netRevenue") && sk.netRevenueYtd !== undefined) {
    result.push({ label: "Net Revenue", value: formatCurrency(sk.netRevenueYtd), change: sk.netRevenueVarPct ?? 0, changeType: ct(sk.netRevenueVarPct), description: "Calculado desde dataset real" });
  }
  if (config.kpis.includes("grossRevenue") && sk.grossRevenue !== undefined) {
    result.push({ label: "Gross Revenue", value: formatCurrency(sk.grossRevenue), change: sk.grossRevenueVarPct ?? 0, changeType: ct(sk.grossRevenueVarPct), description: "Detectado en dataset real" });
  }
  if (config.kpis.includes("ebitda") && sk.ebitdaYtd !== undefined) {
    result.push({ label: "EBITDA", value: formatCurrency(sk.ebitdaYtd), change: sk.ebitdaVarPct ?? 0, changeType: ct(sk.ebitdaVarPct), description: "Calculado desde dataset real" });
  }
  if (config.kpis.includes("grossMargin") && sk.grossMargin !== undefined) {
    result.push({ label: "Gross Profit", value: formatCurrency(sk.grossMargin), change: sk.grossMarginVarPct ?? 0, changeType: ct(sk.grossMarginVarPct), description: "Detectado en dataset real" });
  }
  if (config.kpis.includes("cogs") && sk.cogsPct !== undefined) {
    result.push({ label: "COGS", value: formatCurrency(sk.cogsPct), change: sk.cogsPctVarPct ?? 0, changeType: ct(sk.cogsPctVarPct), description: "Detectado en dataset real" });
  }
  if (config.kpis.includes("opex") && sk.opex !== undefined) {
    result.push({ label: "Opex / G&A", value: formatCurrency(sk.opex), change: sk.opexVarPct ?? 0, changeType: ct(sk.opexVarPct), description: "Detectado en dataset real" });
  }
  if (config.kpis.includes("tradeSpend") && sk.tradeSpend !== undefined) {
    result.push({ label: "Trade Spend", value: formatCurrency(sk.tradeSpend), change: sk.tradeSpendVarPct ?? 0, changeType: ct(sk.tradeSpendVarPct), description: "Detectado en dataset real" });
  }
  if (config.kpis.includes("sellInVolume") && sk.sellInYtd !== undefined) {
    result.push({ label: "Sell-in", value: formatVolume(sk.sellInYtd), unit: "cajas", change: sk.sellInVarPct ?? 0, changeType: ct(sk.sellInVarPct), description: "Volumen real normalizado" });
  }
  if (config.kpis.includes("sellOutVolume") && sk.sellOutYtd !== undefined) {
    result.push({ label: "Sell-out", value: formatVolume(sk.sellOutYtd), unit: "cajas", change: sk.sellOutVarPct ?? 0, changeType: ct(sk.sellOutVarPct), description: "Volumen real normalizado" });
  }
  if (config.kpis.includes("passthrough") && sk.passthrough !== undefined) {
    const passthrough = Math.abs(sk.passthrough) <= 1 ? sk.passthrough * 100 : sk.passthrough;
    result.push({ label: "Passthrough", value: formatPercentage(passthrough), change: sk.passthroughVarPct ?? 0, changeType: ct(sk.passthroughVarPct), description: "Sell-out / sell-in real" });
  }
  if (config.kpis.includes("priceIndex") && sk.priceIndexAvg !== undefined) {
    result.push({ label: "Price Index", value: formatRatio(sk.priceIndexAvg), change: sk.priceIndexVarPct ?? 0, changeType: ct(sk.priceIndexVarPct), description: "Promedio detectado en dataset real" });
  }
  if (config.kpis.includes("numericDistribution") && sk.numericDistribution !== undefined) {
    const dn = Math.abs(sk.numericDistribution) <= 1 ? sk.numericDistribution * 100 : sk.numericDistribution;
    result.push({ label: "Distribución numérica", value: formatPercentage(dn), change: sk.numericDistributionVarPct ?? 0, changeType: ct(sk.numericDistributionVarPct), description: "Detectado en dataset real" });
  }

  for (const semanticKpi of semanticKpis) {
    if (result.some((item) => item.label.toLowerCase() === semanticKpi.label.toLowerCase())) continue;
    result.push({
      label: semanticKpi.label,
      value: "Detectado",
      change: Math.round(semanticKpi.confidence * 100),
      changeType: "neutral",
      description: `${semanticKpi.sheets.length} hoja${semanticKpi.sheets.length === 1 ? "" : "s"} · ${semanticKpi.columns.slice(0, 2).join(", ")}`,
    });
  }

  return result.slice(0, 4);
}

/**
 * Resuelve los KPIs para un módulo enterprise.
 *
 * Regla crítica:
 * - En modo "demo": siempre demoKpis.
 * - En modo "real": usar datos del dataset real.
 *   Si hay datos reales → mostrarlos.
 *   Si no hay datos → devolver tarjetas N/A (nunca fallback silencioso a demo).
 * - En modo "empty": no debería llamarse; devuelve [].
 */
export function resolveModuleKpis({
  moduleId,
  datasetState,
  activeDataset,
  demoKpis,
}: {
  moduleId: EnterpriseModuleId;
  datasetState: WorkspaceDatasetState;
  activeDataset: ProcessedDataset | null;
  demoKpis: SalesKpi[];
}): SalesKpi[] {
  if (datasetState !== "real" || !activeDataset) return demoKpis;

  const realKpis = realDatasetKpisForModule(activeDataset, ENTERPRISE_MODULE_DATASET_CONFIG[moduleId]);

  if (realKpis.length > 0) return realKpis;

  // Modo real pero sin KPIs mapeados → emitir tarjetas N/A honestas
  // para los KPIs esperados del módulo (máximo 4 para no romper el layout)
  const config = ENTERPRISE_MODULE_DATASET_CONFIG[moduleId];
  const naCards: SalesKpi[] = config.kpis.slice(0, 4).map((kpiKey) => ({
    label: kpiKey
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim(),
    value: "N/A",
    change: 0,
    changeType: "neutral" as const,
    description: "La fuente cargada no contiene este KPI. Verificá el mapeo de columnas.",
  }));

  return naCards;
}

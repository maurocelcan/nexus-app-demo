import type {
  CommercialKpiFact,
  CommercialKpiKey,
  GeoPdvFact,
  KpiFactPeriod,
  ProcessedDataset,
} from "@/types/dataset";
import type { SellThroughPdv, SellThroughPdvStatus } from "@/data/mock-sell-through";
import { SELL_THROUGH_REFERENCE_KPIS } from "@/data/mock-sell-through";
import { SELL_THROUGH_MAP_BOUNDS } from "@/lib/sell-through-map";
import { formatCount, formatCurrency, formatPercentage, formatVolume } from "@/lib/utils";

export type SellThroughUiPeriod = "YTD" | "QTD" | "MTD" | "12M";

export type RealKpiTile = {
  id: string;
  label: string;
  value: string;
  /** Texto corto bajo el valor (opcional). Sin frases técnicas largas. */
  detail?: string;
  /** Texto completo para el tooltip del ícono. */
  tooltip: string;
  tone: "primary" | "accent" | "success" | "warning" | "danger" | "info";
};

export type MiniBarRow = { label: string; value: number; target?: number };
export type SellInOutRow = { label: string; sellIn?: number; sellOut?: number; passthrough?: number };
export type SellThroughRealFilters = {
  sku?: string;
  channel?: string;
  distributor?: string;
  zone?: string;
};
export type FilteredSeriesResult = {
  rows: MiniBarRow[];
  message?: string;
};

const PERIOD_MAP: Record<SellThroughUiPeriod, KpiFactPeriod | undefined> = {
  YTD: "YTD",
  QTD: "QTD",
  MTD: "MTD",
  "12M": "MA",
};

function compact(value: unknown): string {
  return String(value ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

function isSellThroughFact(fact: CommercialKpiFact): boolean {
  return compact(fact.sourceSheet).includes("sellthrough");
}

export function hasRealSellThroughData(dataset: ProcessedDataset | null): boolean {
  return Boolean(dataset?.kpiFacts?.some(isSellThroughFact) || dataset?.sellThroughMonthly?.length || dataset?.geoPdvFacts?.length);
}

function resolveFact(
  dataset: ProcessedDataset,
  key: CommercialKpiKey,
  period: KpiFactPeriod,
): CommercialKpiFact | undefined {
  const facts = dataset.kpiFacts ?? [];
  return facts.find((fact) => fact.key === key && fact.period === period && fact.grain === "TOTAL" && isSellThroughFact(fact))
    ?? facts.find((fact) => fact.key === key && fact.period === period && fact.grain === "TOTAL")
    ?? facts.find((fact) => fact.key === key && fact.period === period);
}

function factValue(dataset: ProcessedDataset, key: CommercialKpiKey, period: KpiFactPeriod): number | undefined {
  const fact = resolveFact(dataset, key, period);
  return fact?.isAvailable && fact.value !== undefined ? fact.value : undefined;
}

function formatFact(fact: CommercialKpiFact | undefined): string {
  if (!fact?.isAvailable || fact.value === undefined) return "N/A";
  if (fact.unit === "currency") return formatCurrency(fact.value);
  if (fact.unit === "volume") return formatVolume(fact.value);
  if (fact.unit === "count") return formatCount(fact.value);
  if (fact.unit === "pct") return formatPercentage(fact.value * (Math.abs(fact.value) <= 1 ? 100 : 1));
  return String(fact.value);
}

function factDetail(fact: CommercialKpiFact | undefined, fallback: string): string {
  if (!fact) return fallback;
  if (!fact.isAvailable) return fact.unavailableReason ?? fallback;
  return `Fuente: ${fact.sourceSheet ?? "archivo real"}`;
}

export function buildRealSellThroughKpis(
  dataset: ProcessedDataset,
  period: SellThroughUiPeriod,
  selectedPdvs: SellThroughPdv[] = geoFactsToSellThroughPdvs(dataset.geoPdvFacts ?? []),
): RealKpiTile[] {
  const factPeriod = PERIOD_MAP[period];
  if (!factPeriod) return [];
  const get = (key: CommercialKpiKey) => resolveFact(dataset, key, factPeriod);
  const netRevenue = get("netRevenue");
  const sellOut = get("sellOutVolume");
  const buyers = get("buyerCustomers");
  const successPhoto = get("successPhoto");
  const mixReal = get("mixReal");
  const mixTarget = get("mixTarget");
  const margin = get("estimatedMargin");
  const opportunity = get("pdvOpportunity");
  const calculatedOpportunity = calculatePdvOpportunityFromPdvs(selectedPdvs);

  // ── Helpers locales para separar detail (corto) y tooltip (completo) ────────
  function tileDetail(fact: CommercialKpiFact | undefined): string | undefined {
    // Solo muestra el período en el cuerpo — sin frases técnicas
    if (!fact?.isAvailable || fact.value === undefined) return undefined;
    return period;
  }
  function tileTooltip(fact: CommercialKpiFact | undefined, fallback: string): string {
    if (!fact) return fallback;
    if (!fact.isAvailable) return fact.unavailableReason ?? fallback;
    return `Fuente: ${fact.sourceSheet ?? "archivo real"}`;
  }

  const mixAvailable = mixReal?.value !== undefined && mixTarget?.value !== undefined;

  const result: RealKpiTile[] = [
    {
      id: "netRevenue",
      label: "Net Revenue",
      value: formatFact(netRevenue),
      detail: tileDetail(netRevenue),
      tooltip: tileTooltip(netRevenue, `Sin Net Revenue para ${period}`),
      tone: "accent",
    },
    {
      id: "sellOut",
      label: "Sell Out",
      value: formatFact(sellOut),
      detail: tileDetail(sellOut),
      tooltip: tileTooltip(sellOut, `Sin Sell Out para ${period}`),
      tone: "primary",
    },
    {
      id: "buyers",
      label: "Clientes compradores",
      value: formatFact(buyers),
      detail: tileDetail(buyers),
      tooltip: tileTooltip(buyers, `Sin clientes compradores para ${period}`),
      tone: "info",
    },
    {
      id: "successPhoto",
      label: "Foto Éxito",
      value: formatFact(successPhoto),
      detail: tileDetail(successPhoto),
      tooltip: tileTooltip(successPhoto, "Sin dato de Foto Éxito en SellThrough BIS."),
      tone: "success",
    },
    {
      id: "activePdvs",
      label: "PDVs activos",
      value: formatFact(get("activePdvs")),
      detail: tileDetail(get("activePdvs")),
      tooltip: tileTooltip(get("activePdvs"), "Sin PDVs activos en SellThrough BIS."),
      tone: "success",
    },
    {
      id: "mix",
      label: "Mix real vs objetivo",
      value: mixAvailable
        ? `${formatPercentage(mixReal!.value! * (Math.abs(mixReal!.value!) <= 1 ? 100 : 1))} / ${formatPercentage(mixTarget!.value! * (Math.abs(mixTarget!.value!) <= 1 ? 100 : 1))}`
        : `${SELL_THROUGH_REFERENCE_KPIS.mixReal}% / ${SELL_THROUGH_REFERENCE_KPIS.mixTarget}%`,
      detail: mixAvailable ? undefined : `${SELL_THROUGH_REFERENCE_KPIS.mixTarget - SELL_THROUGH_REFERENCE_KPIS.mixReal}pp de brecha`,
      tooltip: mixAvailable
        ? "Fuente: SellThrough BIS"
        : "Dato demo/referencial solicitado para mantener lectura visual cuando el archivo real no trae mix real/objetivo.",
      tone: "warning",
    },
    {
      id: "margin",
      label: "Margen estimado",
      value: margin?.isAvailable ? formatFact(margin) : `${SELL_THROUGH_REFERENCE_KPIS.margin}%`,
      detail: tileDetail(margin),
      tooltip: margin?.isAvailable
        ? tileTooltip(margin, "Fuente: SellThrough BIS")
        : "Dato demo/referencial solicitado para mantener lectura visual cuando el archivo real no trae margen sell-through.",
      tone: "accent",
    },
    {
      id: "opportunity",
      label: "Oportunidad PDV",
      value: opportunity?.isAvailable
        ? formatFact(opportunity)
        : `USD ${formatCurrency(SELL_THROUGH_REFERENCE_KPIS.pdvOpportunityUsd).replace("$", "")}`,
      detail: undefined,
      tooltip: opportunity?.isAvailable
        ? tileTooltip(opportunity, "Fuente: SellThrough BIS")
        : selectedPdvs.length > 0
          ? `Dato demo/referencial solicitado. Oportunidad calculada con PDVs filtrados disponible como contexto: ${formatVolume(calculatedOpportunity)}.`
          : "Dato demo/referencial solicitado para mantener lectura visual cuando el archivo real no trae oportunidad PDV.",
      tone: "primary",
    },
  ];

  return result;
}

export function buildRevenueEvolution(dataset: ProcessedDataset, period: SellThroughUiPeriod, filters: SellThroughRealFilters = {}): FilteredSeriesResult {
  const unsupportedFilter = unsupportedEvolutionFilter(filters);
  if (unsupportedFilter) return { rows: [], message: unsupportedFilter };
  if (hasDimensionalFilter(filters)) {
    const rows = filteredPeriodSnapshots(dataset, "netRevenue", filters);
    return {
      rows,
      message: rows.length > 0 ? "La fuente no contiene evolución mensual para este filtro; se muestran cortes disponibles." : "La fuente no contiene facturación para este filtro.",
    };
  }
  const monthly = dataset.sellThroughMonthly?.filter((row) => row.netRevenue !== undefined) ?? [];
  if (monthly.length > 0) {
    const rows = monthly.map((row) => ({ label: monthLabel(row.month), value: row.netRevenue ?? 0 }));
    return { rows: period === "MTD" ? rows.slice(-1) : rows };
  }
  return { rows: periodSnapshots(dataset, "netRevenue") };
}

export function buildVolumeEvolution(dataset: ProcessedDataset, period: SellThroughUiPeriod, filters: SellThroughRealFilters = {}): FilteredSeriesResult {
  const unsupportedFilter = unsupportedEvolutionFilter(filters);
  if (unsupportedFilter) return { rows: [], message: unsupportedFilter };
  if (hasDimensionalFilter(filters)) {
    const rows = filteredPeriodSnapshots(dataset, "sellOutVolume", filters);
    return {
      rows,
      message: rows.length > 0 ? "La fuente no contiene evolución mensual para este filtro; se muestran cortes disponibles." : "La fuente no contiene volumen para este filtro.",
    };
  }
  const monthly = dataset.sellThroughMonthly?.filter((row) => row.volume !== undefined) ?? [];
  if (monthly.length > 0) {
    const rows = monthly.map((row) => ({ label: monthLabel(row.month), value: row.volume ?? 0 }));
    return { rows: period === "MTD" ? rows.slice(-1) : rows };
  }
  return { rows: periodSnapshots(dataset, "sellOutVolume") };
}

function unsupportedEvolutionFilter(filters: SellThroughRealFilters): string | undefined {
  if (filters.zone && filters.zone !== "all") return "La fuente BIS no contiene evolución temporal por zona. El filtro de zona aplica al mapa y KPIs geográficos.";
  if (filters.distributor && filters.distributor !== "all") return "La fuente BIS no contiene evolución temporal por distribuidor.";
  return undefined;
}

function hasDimensionalFilter(filters: SellThroughRealFilters): boolean {
  return Boolean((filters.sku && filters.sku !== "all") || (filters.channel && filters.channel !== "all"));
}

function filteredPeriodSnapshots(dataset: ProcessedDataset, key: CommercialKpiKey, filters: SellThroughRealFilters): MiniBarRow[] {
  const grain = filters.sku && filters.sku !== "all" ? "SKU" : filters.channel && filters.channel !== "all" ? "CANAL" : "TOTAL";
  const needle = compact(filters.sku && filters.sku !== "all" ? filters.sku : filters.channel ?? "");
  return (["YTD", "QTD", "U6M", "MA"] as KpiFactPeriod[]).flatMap((period) => {
    const fact = (dataset.kpiFacts ?? []).find((item) =>
      item.key === key &&
      item.period === period &&
      item.grain === grain &&
      item.isAvailable &&
      item.value !== undefined &&
      (grain === "TOTAL" || compact(item.label).includes(needle))
    );
    return fact?.value === undefined ? [] : [{ label: friendlyPeriodLabel(period), value: fact.value }];
  });
}

function periodSnapshots(dataset: ProcessedDataset, key: CommercialKpiKey): MiniBarRow[] {
  return (["YTD", "QTD", "U6M", "MA"] as KpiFactPeriod[]).flatMap((period) => {
    const value = factValue(dataset, key, period);
    return value === undefined ? [] : [{ label: period, value }];
  });
}

export function buildSellInOutPassthrough(dataset: ProcessedDataset): SellInOutRow[] {
  const monthly = dataset.sellThroughMonthly ?? [];
  if (monthly.some((row) => row.sellIn !== undefined || row.sellOut !== undefined)) {
    return monthly.map((row) => ({
      label: monthLabel(row.month),
      sellIn: row.sellIn,
      sellOut: row.sellOut,
      passthrough: row.passthrough ?? (row.sellIn ? (row.sellOut ?? 0) / row.sellIn : undefined),
    }));
  }
  return (["YTD", "QTD", "U6M", "MA"] as KpiFactPeriod[]).flatMap((period) => {
    const sellIn = factValue(dataset, "sellInVolume", period);
    const sellOut = factValue(dataset, "sellOutVolume", period);
    if (sellIn === undefined && sellOut === undefined) return [];
    return [{ label: friendlyPeriodLabel(period), sellIn, sellOut, passthrough: sellIn ? (sellOut ?? 0) / sellIn : undefined }];
  });
}

export function buildSkuRanking(dataset: ProcessedDataset, period: SellThroughUiPeriod, channel = "all", sku = "all"): MiniBarRow[] {
  const factPeriod = PERIOD_MAP[period];
  if (!factPeriod) return [];
  const facts = (dataset.kpiFacts ?? []).filter((fact) =>
    fact.period === factPeriod &&
    fact.isAvailable &&
    fact.value !== undefined &&
    fact.key === "sellOutVolume" &&
    fact.grain === "SKU" &&
    isSellThroughFact(fact)
  );
  const groupedFacts = new Map<string, number>();
  for (const fact of facts) {
    if (channel !== "all") continue;
    if (sku !== "all" && compact(fact.label) !== compact(sku) && !compact(fact.label).includes(compact(sku))) continue;
    groupedFacts.set(fact.label, (groupedFacts.get(fact.label) ?? 0) + (fact.value ?? 0));
  }
  const rows = [...groupedFacts]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
  if (rows.length > 0) return rows.slice(0, 8);

  const sellOutRows = dataset.salesData?.sellOutRows ?? [];
  const grouped = new Map<string, number>();
  for (const row of sellOutRows) {
    if (channel !== "all" && row.channel !== channel) continue;
    if (sku !== "all" && row.skuId !== sku) continue;
    const key = row.skuName ?? row.skuId;
    if (!key) continue;
    grouped.set(key, (grouped.get(key) ?? 0) + (row.volumeCajasOut ?? 0));
  }
  return [...grouped].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 8);
}

export function geoFactsToSellThroughPdvs(facts: GeoPdvFact[]): SellThroughPdv[] {
  const buyers = facts.filter((pdv) => pdv.hasPurchase);
  const avgBuyerVolume = buyers.reduce((sum, pdv) => sum + (pdv.volume ?? 0), 0) / Math.max(buyers.length, 1);
  return facts.map((pdv) => {
    const status: SellThroughPdvStatus = pdv.hasPurchase ? "buyer" : pdv.isAttended ? "potential" : "non-buyer";
    const x = pdv.lng === undefined ? 50 : ((pdv.lng - SELL_THROUGH_MAP_BOUNDS.west) / (SELL_THROUGH_MAP_BOUNDS.east - SELL_THROUGH_MAP_BOUNDS.west)) * 100;
    const y = pdv.lat === undefined ? 50 : ((SELL_THROUGH_MAP_BOUNDS.north - pdv.lat) / (SELL_THROUGH_MAP_BOUNDS.north - SELL_THROUGH_MAP_BOUNDS.south)) * 100;
    return {
      id: pdv.id,
      name: pdv.name,
      channel: pdv.channel,
      zoneId: pdv.zone,
      distributorId: "real-pdv-file",
      status,
      x,
      y,
      lat: pdv.lat,
      lng: pdv.lng,
      address: pdv.address,
      averageTicket: pdv.averageTicket,
      visitFrequency: pdv.visitFrequency,
      revenue: pdv.revenue ?? 0,
      volume: pdv.volume ?? 0,
      skusBought: pdv.hasPurchase ? ["real-purchase"] : [],
      lastPurchase: pdv.hasPurchase ? "Archivo PDV" : "-",
      opportunity: pdv.opportunity ?? (pdv.hasPurchase ? 0 : Math.round(avgBuyerVolume)),
      mixReal: 0,
      mixTarget: 0,
      served: pdv.isAttended,
    };
  });
}

export function calculatePdvOpportunity(pdvs: GeoPdvFact[]): number {
  const buyers = pdvs.filter((pdv) => pdv.hasPurchase);
  const noBuyers = pdvs.length - buyers.length;
  const avgVolume = buyers.reduce((sum, pdv) => sum + (pdv.volume ?? 0), 0) / Math.max(buyers.length, 1);
  return Math.round(avgVolume * noBuyers);
}

export function calculatePdvOpportunityFromPdvs(pdvs: Pick<SellThroughPdv, "status" | "volume">[]): number {
  const buyers = pdvs.filter((pdv) => pdv.status === "buyer");
  const noBuyers = pdvs.length - buyers.length;
  const avgVolume = buyers.reduce((sum, pdv) => sum + pdv.volume, 0) / Math.max(buyers.length, 1);
  return Math.round(avgVolume * noBuyers);
}

function monthLabel(month: string): string {
  const [year, rawMonth] = month.split("-");
  const labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const index = Number(rawMonth) - 1;
  return `${labels[index] ?? rawMonth} ${year?.slice(-2) ?? ""}`;
}

function friendlyPeriodLabel(period: KpiFactPeriod): string {
  if (period === "YTD") return "Acumulado año";
  if (period === "QTD") return "Trimestre";
  if (period === "U6M") return "Últimos 6 meses";
  if (period === "MA") return "Móvil anual";
  return period;
}

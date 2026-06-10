/**
 * buildSellThroughViewModel
 *
 * Fuente única de verdad para el módulo Sell-Through.
 * Devuelve la misma forma de datos en demo y real.
 * La página consume este objeto sin bifurcar layout.
 */
import type { ProcessedDataset } from "@/types/dataset";
import type {
  FilteredSeriesResult,
  MiniBarRow,
  RealKpiTile,
  SellInOutRow,
} from "@/lib/sell-through-real";
import {
  buildRealSellThroughKpis,
  buildRevenueEvolution,
  buildSellInOutPassthrough,
  buildSkuRanking,
  buildVolumeEvolution,
  hasRealSellThroughData,
  geoFactsToSellThroughPdvs,
} from "@/lib/sell-through-real";
import {
  SELL_THROUGH_BASE_KPIS,
  SELL_THROUGH_MONTHLY,
  SELL_THROUGH_PDVS,
  SELL_THROUGH_SELL_IN_OUT,
  SELL_THROUGH_SKUS,
  type SellThroughPdv,
  type SellThroughPeriod,
} from "@/data/mock-sell-through";

function scale(value: number, factor: number): number {
  return Math.round(value * factor);
}

export type SellThroughFilters = {
  period: SellThroughPeriod;
  sku: string;
  channel: string;
  distributor: string;
  zone: string;
  factor: number;
};

export type SellThroughViewModel = {
  /** 8 KPI tiles */
  kpis: RealKpiTile[];
  /** Evolución de facturación */
  revenue: FilteredSeriesResult;
  /** Evolución de volumen */
  volume: FilteredSeriesResult;
  /** Sell-in vs Sell-out por mes */
  sellInOutRows: SellInOutRow[];
  /** Ranking de SKUs */
  skuRows: MiniBarRow[];
  /** PDVs para mapa y análisis */
  pdvs: SellThroughPdv[];
  /** true = datos reales disponibles */
  isReal: boolean;
};

export function buildSellThroughViewModel(
  datasetState: "demo" | "real",
  activeDataset: ProcessedDataset | null,
  filters: SellThroughFilters,
  selectedPdvs: SellThroughPdv[],
): SellThroughViewModel {
  const { period, sku, channel, distributor, zone, factor } = filters;
  const isReal = datasetState === "real" && Boolean(activeDataset) && hasRealSellThroughData(activeDataset);

  if (!isReal || !activeDataset) {
    // Demo
    const scaledRevenue = scale(SELL_THROUGH_BASE_KPIS.netRevenue, factor);
    const scaledVolume = scale(SELL_THROUGH_BASE_KPIS.volume, factor);
    const activePdvs = SELL_THROUGH_PDVS.filter((pdv) => pdv.served).length;

    const demoKpis: RealKpiTile[] = [
      { id: "netRevenue", label: "Net Revenue", value: `$${(scaledRevenue / 1_000_000).toFixed(2)}M`, tone: "accent", tooltip: "Net Revenue sell-through acumulado" },
      { id: "sellOut", label: "Sell Out", value: String(scaledVolume), tone: "primary", tooltip: "Cajas vendidas en PDVs" },
      { id: "buyers", label: "Clientes compradores", value: String(scale(SELL_THROUGH_BASE_KPIS.buyerCustomers, factor)), tone: "info", tooltip: "PDVs con compra en el período" },
      { id: "successPhoto", label: "Foto de éxito", value: `${SELL_THROUGH_BASE_KPIS.successPhoto}%`, tone: "success", tooltip: "Cumplimiento promedio de ejecución" },
      { id: "activePdvs", label: "PDVs activos", value: String(activePdvs), tone: "success", tooltip: "PDVs con distribuidor activo asignado" },
      { id: "mix", label: "Mix real vs objetivo", value: `${SELL_THROUGH_BASE_KPIS.mixReal}% / ${SELL_THROUGH_BASE_KPIS.mixTarget}%`, tone: "warning", tooltip: "Mix real vs objetivo por SKU" },
      { id: "margin", label: "Margen estimado", value: `${SELL_THROUGH_BASE_KPIS.margin}%`, tone: "accent", tooltip: "Margen de contribución estimado" },
      { id: "opportunity", label: "Oportunidad PDV", value: `$${(SELL_THROUGH_PDVS.reduce((acc, pdv) => acc + pdv.opportunity, 0) / 1_000_000).toFixed(2)}M`, tone: "primary", tooltip: "Revenue incremental estimado" },
    ];

    return {
      kpis: demoKpis,
      revenue: {
        rows: SELL_THROUGH_MONTHLY.map((row) => ({ label: row.label, value: scale(row.revenue, factor), target: scale(row.revenue * 1.06, factor) })),
        message: undefined,
      },
      volume: {
        rows: SELL_THROUGH_MONTHLY.map((row) => ({ label: row.label, value: scale(row.volume, factor), target: scale(row.target, factor) })),
        message: undefined,
      },
      sellInOutRows: SELL_THROUGH_SELL_IN_OUT.map((row) => ({
        label: row.label,
        sellIn: scale(row.sellIn, factor),
        sellOut: scale(row.sellOut, factor),
        passthrough: row.passthrough,
      })),
      skuRows: SELL_THROUGH_SKUS
        .map((sku_) => ({ label: sku_.name.replace(" 750ml", "").replace(" 700ml", ""), value: scale(sku_.volume, factor), target: Math.round(scale(sku_.volume, factor) * (sku_.trend < 0 ? 1.12 : 1.04)) }))
        .sort((a, b) => b.value - a.value),
      pdvs: SELL_THROUGH_PDVS,
      isReal: false,
    };
  }

  // Real
  const realPdvs = activeDataset.geoPdvFacts ? geoFactsToSellThroughPdvs(activeDataset.geoPdvFacts) : [];
  return {
    kpis: buildRealSellThroughKpis(activeDataset, period, selectedPdvs),
    revenue: buildRevenueEvolution(activeDataset, period, { sku, channel, distributor, zone }),
    volume: buildVolumeEvolution(activeDataset, period, { sku, channel, distributor, zone }),
    sellInOutRows: buildSellInOutPassthrough(activeDataset),
    skuRows: buildSkuRanking(activeDataset, period, channel, sku),
    pdvs: realPdvs,
    isReal: true,
  };
}

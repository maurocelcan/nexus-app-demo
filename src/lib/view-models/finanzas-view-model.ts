/**
 * buildFinanzasViewModel
 *
 * Fuente única de verdad para el módulo Finanzas.
 * Devuelve la misma forma de datos en demo y real.
 * La página consume este objeto sin saber de dónde vienen los datos.
 */
import type { SalesFilterPeriod } from "@/types/sales";
import type { ProcessedDataset } from "@/types/dataset";
import type { FinanzasChannelRow, FinanzasHeadcountRow, FinanzasMonthlyEbitdaRow, FinanzasPnlMatrix } from "@/lib/finanzas-real";
import {
  buildFinanzasHeadcount,
  buildFinanzasKpisFromMonthly,
  buildFinanzasMonthlyEbitda,
  buildFinanzasPnlMatrix,
  buildFinanzasRevenueByChannel,
  pnlFromKpiFacts,
} from "@/lib/finanzas-real";
import { datasetHasKpiFacts } from "@/lib/kpi-facts";
import {
  CHANNEL_ROWS_DEMO,
  FINANCE_MONTHLY_DEMO,
  HEADCOUNT_DEMO,
  MONTHLY_EBITDA_DEMO,
  PNL_WATERFALL,
} from "@/data/mock-finanzas";
import type { SalesKpi } from "@/types/analytics";

/** Row compatible con FinanzasPnlRow y mock PNL_WATERFALL */
export type PnlRow = { key?: string; name: string; value: number; isTotal: boolean; isDeduction?: boolean; unit?: "currency" | "volume" | "ratio" | "count" | "pct" };

export type FinanzasViewModel = {
  /** 8 KPI cards — 2 filas de 4 */
  kpis: SalesKpi[];
  /** Filas del P&L simplificado */
  pnlRows: PnlRow[];
  /** Matriz mensual de P&L */
  pnlMatrix: FinanzasPnlMatrix;
  /** Serie mensual de EBITDA */
  ebitdaRows: FinanzasMonthlyEbitdaRow[];
  /** Headcount agregado período anterior vs actual */
  headcountRows: FinanzasHeadcountRow[];
  /** Revenue y margen por canal */
  channelRows: FinanzasChannelRow[];
  /** true = dataset real cargado */
  isReal: boolean;
  /** true = kpiFacts BIS disponibles */
  hasKpiFacts: boolean;
};

export function buildFinanzasViewModel(
  datasetState: "demo" | "real",
  activeDataset: ProcessedDataset | null,
  period: SalesFilterPeriod,
  selectedYear: number,
): FinanzasViewModel {
  const isReal = datasetState === "real";
  const hasKpiFacts = Boolean(activeDataset && datasetHasKpiFacts(activeDataset));

  // Demo
  if (!isReal || !activeDataset) {
    return {
      kpis: buildFinanzasKpisFromMonthly(FINANCE_MONTHLY_DEMO, selectedYear, period),
      pnlRows: PNL_WATERFALL.map((row) => ({ ...row, isTotal: row.isTotal ?? false })),
      pnlMatrix: buildFinanzasPnlMatrix(FINANCE_MONTHLY_DEMO, selectedYear, period),
      ebitdaRows: MONTHLY_EBITDA_DEMO,
      headcountRows: HEADCOUNT_DEMO,
      channelRows: CHANNEL_ROWS_DEMO,
      isReal: false,
      hasKpiFacts: false,
    };
  }

  // Real sin kpiFacts — KPIs N/A, gráficos con empty state
  if (!hasKpiFacts) {
    return {
      kpis: buildFinanzasKpisFromMonthly(activeDataset.financeMonthly ?? [], selectedYear, period, activeDataset.kpiFacts ?? []),
      pnlRows: [],
      pnlMatrix: buildFinanzasPnlMatrix(activeDataset.financeMonthly ?? [], selectedYear, period),
      ebitdaRows: [],
      headcountRows: [],
      channelRows: [],
      isReal: true,
      hasKpiFacts: false,
    };
  }

  // Real con kpiFacts BIS
  return {
    kpis: buildFinanzasKpisFromMonthly(activeDataset.financeMonthly ?? [], selectedYear, period, activeDataset.kpiFacts ?? []),
    pnlRows: pnlFromKpiFacts(activeDataset, period) as PnlRow[],
    pnlMatrix: buildFinanzasPnlMatrix(activeDataset.financeMonthly ?? [], selectedYear, period),
    ebitdaRows: buildFinanzasMonthlyEbitda(activeDataset, period),
    headcountRows: buildFinanzasHeadcount(activeDataset, period),
    channelRows: buildFinanzasRevenueByChannel(activeDataset, period),
    isReal: true,
    hasKpiFacts: true,
  };
}

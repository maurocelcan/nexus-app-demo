import type { CommercialKpiFact, CommercialKpiKey, FinanceMonthlyPoint, KpiFactPeriod, KpiGrain, ProcessedDataset } from "@/types/dataset";
import type { SalesFilterPeriod } from "@/types/sales";
import type { SalesKpi } from "@/types/analytics";
import { filterPeriodToFactPeriod, resolveKpiFact } from "@/lib/kpi-facts";
import { formatCurrency, formatPercentage } from "@/lib/utils";

export interface FinanzasPnlRow {
  key: CommercialKpiKey;
  name: string;
  value: number;
  isTotal: boolean;
  isDeduction?: boolean;
  unit: CommercialKpiFact["unit"];
  sourceLabel?: string;
}

export interface FinanzasPnlMatrixMonth {
  key: string;
  label: string;
}

export interface FinanzasPnlMatrixRow {
  key: CommercialKpiKey;
  name: string;
  unit: CommercialKpiFact["unit"];
  isTotal: boolean;
  isDeduction?: boolean;
  total?: number;
  months: Record<string, number | undefined>;
}

export interface FinanzasPnlMatrix {
  years: number[];
  selectedYear: number;
  months: FinanzasPnlMatrixMonth[];
  rows: FinanzasPnlMatrixRow[];
  period: SalesFilterPeriod;
  totalLabel: string;
  hasMonthlyData: boolean;
}

export interface FinanzasSnapshotRow {
  label: string;
  ebitda: number;
  marginPct?: number;
}

export interface FinanzasMonthlyEbitdaRow {
  month: string;
  ebitda: number;
  ebitdaPct?: number;
}

export interface FinanzasHeadcountRow {
  label: string;
  priorValue?: number;
  value?: number;
  variationPct?: number;
  variationAbs?: number;
  details?: {
    area: string;
    priorValue?: number;
    value?: number;
    variationPct?: number;
    variationAbs?: number;
  }[];
}

export interface FinanzasSkuRow {
  label: string;
  netRevenue?: number;
  grossProfit?: number;
  ebitda?: number;
  tradeSpend?: number;
  marginPct?: number;
  priorNetRevenue?: number;
  priorMarginPct?: number;
}

export interface FinanzasChannelRow {
  label: string;
  netRevenue?: number;
  ebitda?: number;
  tradeSpend?: number;
  marginPct?: number;
}

const PNL_LINES: { key: CommercialKpiKey; name: string; factLabel: string; isTotal: boolean; isDeduction?: boolean }[] = [
  { key: "grossRevenue", name: "Gross Revenue / Venta Bruta", factLabel: "Gross Revenue", isTotal: false },
  { key: "tradeSpend", name: "Descuentos Trade", factLabel: "Descuentos Trade", isTotal: false, isDeduction: true },
  { key: "netRevenue", name: "Net Revenue", factLabel: "Net Revenue", isTotal: true },
  { key: "cogs", name: "COGS", factLabel: "COGS", isTotal: false, isDeduction: true },
  { key: "grossMargin", name: "Gross Profit", factLabel: "Gross Profit", isTotal: false },
  { key: "opex", name: "G&A", factLabel: "G&A", isTotal: false, isDeduction: true },
  { key: "opex", name: "Gastos Estructura", factLabel: "Gastos estructura", isTotal: false, isDeduction: true },
  { key: "ebitda", name: "EBITDA", factLabel: "EBITDA", isTotal: true },
  { key: "grossMarginPct", name: "Gross Margin %", factLabel: "Gross Margin %", isTotal: false },
  { key: "cogsPct", name: "COGS %", factLabel: "COGS %", isTotal: false },
  { key: "ebitdaPct", name: "EBITDA %", factLabel: "EBITDA %", isTotal: true },
];

const PNL_MONTHLY_LINES: {
  key: CommercialKpiKey;
  name: string;
  field: keyof FinanceMonthlyPoint;
  unit: CommercialKpiFact["unit"];
  isTotal: boolean;
  isDeduction?: boolean;
}[] = [
  { key: "grossRevenue", name: "Gross Revenue / Venta Bruta", field: "grossRevenue", unit: "currency", isTotal: false },
  { key: "tradeSpend", name: "Descuentos Trade", field: "tradeSpend", unit: "currency", isTotal: false, isDeduction: true },
  { key: "netRevenue", name: "Net Revenue", field: "netRevenue", unit: "currency", isTotal: true },
  { key: "cogs", name: "COGS", field: "cogs", unit: "currency", isTotal: false, isDeduction: true },
  { key: "grossMargin", name: "Gross Profit", field: "grossProfit", unit: "currency", isTotal: false },
  { key: "opex", name: "G&A", field: "ga", unit: "currency", isTotal: false, isDeduction: true },
  { key: "opex", name: "Gastos Estructura", field: "structuralExpenses", unit: "currency", isTotal: false, isDeduction: true },
  { key: "ebitda", name: "EBITDA", field: "ebitda", unit: "currency", isTotal: true },
  { key: "grossMarginPct", name: "Gross Margin %", field: "grossMarginPct", unit: "pct", isTotal: false },
  { key: "cogsPct", name: "COGS %", field: "cogsPct", unit: "pct", isTotal: false },
  { key: "ebitdaPct", name: "EBITDA %", field: "ebitdaPct", unit: "pct", isTotal: true },
];

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const SNAPSHOT_PERIODS: KpiFactPeriod[] = ["YTD", "QTD", "U6M"];

function availableValue(fact: CommercialKpiFact | undefined): number | undefined {
  return fact?.isAvailable && fact.value !== undefined ? fact.value : undefined;
}

function isFinanceFact(fact: CommercialKpiFact): boolean {
  return fact.module === "finance" || Boolean(fact.sourceSheet?.toLowerCase().includes("finanzas"));
}

function resolveFinanceFact(dataset: ProcessedDataset, key: CommercialKpiKey, period: KpiFactPeriod, grain: KpiGrain = "TOTAL"): CommercialKpiFact | undefined {
  const facts = dataset.kpiFacts ?? [];
  return facts.find((fact) => fact.key === key && fact.period === period && fact.grain === grain && isFinanceFact(fact))
    ?? resolveKpiFact(facts, key, period, grain);
}

function resolveFinanceLineFact(dataset: ProcessedDataset, key: CommercialKpiKey, period: KpiFactPeriod, label: string): CommercialKpiFact | undefined {
  const normalized = label.trim().toLowerCase();
  const facts = dataset.kpiFacts ?? [];
  return facts.find((fact) =>
    fact.key === key &&
    fact.period === period &&
    fact.grain === "TOTAL" &&
    fact.label.trim().toLowerCase() === normalized &&
    isFinanceFact(fact)
  ) ?? resolveFinanceFact(dataset, key, period, "TOTAL");
}

function findFact(dataset: ProcessedDataset, key: CommercialKpiKey, period: KpiFactPeriod, grain: KpiGrain, label: string): CommercialKpiFact | undefined {
  const normalized = label.trim().toLowerCase();
  return (dataset.kpiFacts ?? []).find((fact) =>
    fact.key === key &&
    fact.period === period &&
    fact.grain === grain &&
    fact.label.trim().toLowerCase() === normalized &&
    isFinanceFact(fact)
  );
}

function aggregateFact(dataset: ProcessedDataset, key: CommercialKpiKey, period: KpiFactPeriod, grain: KpiGrain, label: string): { value?: number; priorValue?: number } {
  const normalized = label.trim().toLowerCase();
  const facts = (dataset.kpiFacts ?? []).filter((fact) =>
    fact.key === key &&
    fact.period === period &&
    fact.grain === grain &&
    fact.label.trim().toLowerCase() === normalized &&
    fact.isAvailable &&
    isFinanceFact(fact)
  );
  const values = facts.map((fact) => fact.value).filter((value): value is number => value !== undefined);
  const priorValues = facts.map((fact) => fact.priorValue).filter((value): value is number => value !== undefined);
  return {
    value: values.length > 0 ? values.reduce((sum, value) => sum + value, 0) : undefined,
    priorValue: priorValues.length > 0 ? priorValues.reduce((sum, value) => sum + value, 0) : undefined,
  };
}

function groupLabels(dataset: ProcessedDataset, period: KpiFactPeriod, grain: KpiGrain): string[] {
  return [...new Set((dataset.kpiFacts ?? [])
    .filter((fact) => fact.period === period && fact.grain === grain && fact.isAvailable && fact.value !== undefined && isFinanceFact(fact))
    .map((fact) => fact.label)
  )].sort((a, b) => a.localeCompare(b));
}

function monthInPeriod(month: string, period: SalesFilterPeriod, rows: { month: string }[]): boolean {
  if (period === "MTD") return false;
  const year = month.slice(0, 4);
  if (period === "YTD") return month >= `${year}-01` && month <= `${year}-06`;
  if (period === "QTD") return month.endsWith("-01") || month.endsWith("-02") || month.endsWith("-03");
  if (period === "6M") {
    const last = rows.at(-1)?.month;
    if (!last) return true;
    const [lastYear, lastMonth] = last.split("-").map(Number);
    const [rowYear, rowMonth] = month.split("-").map(Number);
    const index = rowYear * 12 + rowMonth;
    const lastIndex = lastYear * 12 + lastMonth;
    return index > lastIndex - 6 && index <= lastIndex;
  }
  return true;
}

function pct(numerator: number | undefined, denominator: number | undefined): number | undefined {
  if (numerator === undefined || denominator === undefined || denominator === 0) return undefined;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function sumDefined(values: (number | undefined)[]): number | undefined {
  const defined = values.filter((value): value is number => value !== undefined);
  if (defined.length === 0) return undefined;
  return defined.reduce((sum, value) => sum + value, 0);
}

function headcountPeriodLabel(period: KpiFactPeriod): string {
  if (period === "QTD") return "Q1";
  if (period === "U6M") return "U6M";
  if (period === "MA") return "MA";
  return period;
}

function monthYear(month: string): number | undefined {
  const year = Number(month.slice(0, 4));
  return Number.isFinite(year) ? year : undefined;
}

function monthNumber(month: string): number | undefined {
  const value = Number(month.slice(5, 7));
  return Number.isFinite(value) ? value : undefined;
}

function monthDisplayLabel(month: string): string {
  const monthIndex = (monthNumber(month) ?? 1) - 1;
  return `${MONTH_LABELS[monthIndex] ?? month.slice(5, 7)} ${month.slice(2, 4)}`;
}

function monthlyValue(row: FinanceMonthlyPoint, field: keyof FinanceMonthlyPoint): number | undefined {
  const value = row[field];
  return typeof value === "number" ? value : undefined;
}

function signedDisplayValue(value: number | undefined, unit: CommercialKpiFact["unit"], isDeduction?: boolean): number | undefined {
  if (value === undefined) return undefined;
  if (unit === "pct") return value;
  return isDeduction ? -Math.abs(value) : value;
}

function periodRows(rows: FinanceMonthlyPoint[], selectedYear: number, period: SalesFilterPeriod): FinanceMonthlyPoint[] {
  if (period === "MTD") return [];
  const yearRows = rows.filter((row) => monthYear(row.month) === selectedYear);
  if (period === "QTD") return yearRows.filter((row) => (monthNumber(row.month) ?? 0) >= 1 && (monthNumber(row.month) ?? 0) <= 3);
  if (period === "6M") return yearRows.slice(-6);
  if (period === "YTD") {
    const latestYear = Math.max(...rows.map((row) => monthYear(row.month) ?? 0));
    const latestYearLastMonth = Math.max(...rows.filter((row) => monthYear(row.month) === latestYear).map((row) => monthNumber(row.month) ?? 0));
    const cutoff = Number.isFinite(latestYearLastMonth) && latestYearLastMonth > 0 ? latestYearLastMonth : 12;
    return yearRows.filter((row) => (monthNumber(row.month) ?? 0) <= cutoff);
  }
  return yearRows;
}

function sumMonthly(rows: FinanceMonthlyPoint[], field: keyof FinanceMonthlyPoint): number | undefined {
  const values = rows.map((row) => monthlyValue(row, field)).filter((value): value is number => value !== undefined);
  if (values.length === 0) return undefined;
  return values.reduce((sum, value) => sum + value, 0);
}

function periodTotal(rows: FinanceMonthlyPoint[], field: keyof FinanceMonthlyPoint): number | undefined {
  if (field === "grossMarginPct") {
    const value = pct(sumMonthly(rows, "grossProfit"), sumMonthly(rows, "netRevenue"));
    return value === undefined ? undefined : value / 100;
  }
  if (field === "cogsPct") {
    const value = pct(sumMonthly(rows, "cogs"), sumMonthly(rows, "netRevenue"));
    return value === undefined ? undefined : value / 100;
  }
  if (field === "ebitdaPct") {
    const value = pct(sumMonthly(rows, "ebitda"), sumMonthly(rows, "grossRevenue"));
    return value === undefined ? undefined : value / 100;
  }
  return sumMonthly(rows, field);
}

function periodLabel(period: SalesFilterPeriod): string {
  if (period === "QTD") return "Total Q1";
  if (period === "6M") return "Total últimos 6M";
  if (period === "MTD") return "Total MTD";
  return "Total período";
}

export function availableFinanceYearsFromMonthly(rows: FinanceMonthlyPoint[]): number[] {
  return [...new Set(rows.map((row) => monthYear(row.month)).filter((year): year is number => year !== undefined))]
    .sort((a, b) => b - a);
}

export function buildFinanzasPnlMatrix(
  rows: FinanceMonthlyPoint[],
  selectedYear: number,
  period: SalesFilterPeriod,
): FinanzasPnlMatrix {
  const years = availableFinanceYearsFromMonthly(rows);
  const yearRows = rows.filter((row) => monthYear(row.month) === selectedYear);
  const totalRows = periodRows(rows, selectedYear, period);
  const months = yearRows.map((row) => ({ key: row.month, label: monthDisplayLabel(row.month) }));

  return {
    years,
    selectedYear,
    months,
    period,
    totalLabel: periodLabel(period),
    hasMonthlyData: yearRows.length > 0,
    rows: PNL_MONTHLY_LINES.map((line) => ({
      key: line.key,
      name: line.name,
      unit: line.unit,
      isTotal: line.isTotal,
      isDeduction: line.isDeduction,
      total: signedDisplayValue(periodTotal(totalRows, line.field), line.unit, line.isDeduction),
      months: Object.fromEntries(yearRows.map((row) => [
        row.month,
        signedDisplayValue(monthlyValue(row, line.field), line.unit, line.isDeduction),
      ])),
    })),
  };
}

function formatKpiValue(value: number | undefined, unit: CommercialKpiFact["unit"]): string {
  if (value === undefined) return "N/A";
  if (unit === "currency") return formatCurrency(value);
  if (unit === "pct") return formatPercentage(value * (Math.abs(value) <= 1 ? 100 : 1));
  return String(Math.round(value));
}

function variationPct(current: number | undefined, prior: number | undefined): number {
  if (current === undefined || prior === undefined || prior === 0) return 0;
  return Math.round(((current - prior) / Math.abs(prior)) * 1000) / 10;
}

function changeType(change: number): SalesKpi["changeType"] {
  if (change > 0) return "positive";
  if (change < 0) return "negative";
  return "neutral";
}

function unavailableFinanceKpi(label: string, year: number, period: SalesFilterPeriod): SalesKpi {
  return {
    label,
    value: "N/A",
    change: 0,
    changeType: "neutral",
    description: "",
    tooltip: `No hay datos mensuales de Finanzas BIS para ${year} · ${period}.`,
  };
}

export function buildFinanzasKpisFromMonthly(
  rows: FinanceMonthlyPoint[],
  selectedYear: number,
  period: SalesFilterPeriod,
  kpiFacts: CommercialKpiFact[] = [],
): SalesKpi[] {
  const currentRows = periodRows(rows, selectedYear, period);
  const priorRows = periodRows(rows, selectedYear - 1, period);
  const hasCurrentRows = currentRows.length > 0;
  const source = `Fuente: Finanzas BIS mensual · ${selectedYear} · ${period}`;
  const factPeriod = filterPeriodToFactPeriod(period);

  const definitions: { label: string; field: keyof FinanceMonthlyPoint; unit: CommercialKpiFact["unit"] }[] = [
    { label: "Net Revenue", field: "netRevenue", unit: "currency" },
    { label: "EBITDA", field: "ebitda", unit: "currency" },
    { label: "Gross Profit", field: "grossProfit", unit: "currency" },
    { label: "Descuentos Trade", field: "tradeSpend", unit: "currency" },
  ];

  const financialKpis = definitions.map((definition) => {
    if (!hasCurrentRows) return unavailableFinanceKpi(definition.label, selectedYear, period);
    const value = periodTotal(currentRows, definition.field);
    const priorValue = periodTotal(priorRows, definition.field);
    const change = variationPct(value, priorValue);
    return {
      label: definition.label,
      value: formatKpiValue(value, definition.unit),
      change,
      changeType: changeType(change),
      description: "",
      tooltip: source,
    };
  });

  function operationalKpi(key: CommercialKpiKey, label: string, suffix?: string): SalesKpi {
    if (!hasCurrentRows || !factPeriod) return unavailableFinanceKpi(label, selectedYear, period);
    const fact = kpiFacts.find((item) =>
      item.key === key &&
      item.period === factPeriod &&
      item.grain === "TOTAL" &&
      isFinanceFact(item)
    );
    if (!fact) return unavailableFinanceKpi(label, selectedYear, period);

    const value = selectedYear === fact.year
      ? fact.value
      : selectedYear === fact.year - 1
        ? fact.priorValue
        : undefined;
    if (value === undefined || !fact.isAvailable) return unavailableFinanceKpi(label, selectedYear, period);

    return {
      label,
      value: suffix ? `${Math.round(value)}${suffix}` : formatKpiValue(value, fact.unit),
      change: selectedYear === fact.year ? Math.round((fact.variationPct ?? 0) * 10) / 10 : 0,
      changeType: selectedYear === fact.year ? changeType(fact.variationPct ?? 0) : "neutral",
      description: "",
      tooltip: `Fuente: Finanzas BIS · ${selectedYear} · ${period}`,
    };
  }

  return [
    ...financialKpis,
    operationalKpi("dso", "Días de cobro", " días"),
    operationalKpi("daysLate", "Días de atraso", " días"),
    operationalKpi("invoiceAmount", "Monto facturado"),
    operationalKpi("collectedAmount", "Monto cobrado"),
  ];
}

export function pnlFromKpiFacts(dataset: ProcessedDataset, period: SalesFilterPeriod): FinanzasPnlRow[] {
  const factPeriod = filterPeriodToFactPeriod(period);
  if (!factPeriod) return [];

  return PNL_LINES.flatMap((line) => {
    const fact = resolveFinanceLineFact(dataset, line.key, factPeriod, line.factLabel);
    const value = availableValue(fact);
    if (value === undefined || !fact) return [];
    return [{
      key: line.key,
      name: line.name,
      isTotal: line.isTotal,
      isDeduction: line.isDeduction,
      unit: fact.unit,
      sourceLabel: fact.sourceSheet,
      value: line.isDeduction && fact.unit !== "pct" ? -Math.abs(value) : value,
    }];
  });
}

export function buildFinanzasEbitdaSnapshots(dataset: ProcessedDataset): FinanzasSnapshotRow[] {
  const rows: FinanzasSnapshotRow[] = [];

  for (const period of SNAPSHOT_PERIODS) {
    const ebitda = resolveFinanceFact(dataset, "ebitda", period, "TOTAL");
    const netRevenue = resolveFinanceFact(dataset, "netRevenue", period, "TOTAL");
    if (ebitda?.priorValue !== undefined) {
      rows.push({
        label: `${period} 25`,
        ebitda: ebitda.priorValue,
        marginPct: pct(ebitda.priorValue, netRevenue?.priorValue),
      });
    }
  }

  for (const period of SNAPSHOT_PERIODS) {
    const ebitda = resolveFinanceFact(dataset, "ebitda", period, "TOTAL");
    const netRevenue = resolveFinanceFact(dataset, "netRevenue", period, "TOTAL");
    if (ebitda?.isAvailable && ebitda.value !== undefined) {
      rows.push({
        label: `${period} 26`,
        ebitda: ebitda.value,
        marginPct: pct(ebitda.value, netRevenue?.value),
      });
    }
  }

  return rows;
}

export function buildFinanzasMonthlyEbitda(dataset: ProcessedDataset, period: SalesFilterPeriod): FinanzasMonthlyEbitdaRow[] {
  const rows = dataset.financeMonthly ?? [];
  if (rows.length === 0 || period === "MTD") return [];
  return rows
    .filter((row) => row.ebitda !== undefined && monthInPeriod(row.month, period, rows))
    .map((row) => ({ month: row.month, ebitda: row.ebitda ?? 0, ebitdaPct: row.ebitdaPct !== undefined ? Math.round(row.ebitdaPct * 1000) / 10 : undefined }));
}

export function buildFinanzasHeadcount(dataset: ProcessedDataset, period: SalesFilterPeriod): FinanzasHeadcountRow[] {
  const factPeriod = filterPeriodToFactPeriod(period);
  if (!factPeriod || factPeriod === "MTD") return [];

  const details = (dataset.financeHeadcount ?? [])
    .filter((fact) => fact.period === factPeriod && (fact.value !== undefined || fact.priorValue !== undefined))
    .map((fact) => ({
      area: fact.area,
      value: fact.value,
      priorValue: fact.priorValue,
      variationPct: fact.variationPct,
      variationAbs: fact.variationAbs,
    }));

  if (details.length === 0) return [];

  const value = sumDefined(details.map((fact) => fact.value));
  const priorValue = sumDefined(details.map((fact) => fact.priorValue));
  const variationAbs = value !== undefined && priorValue !== undefined ? value - priorValue : undefined;
  const variationPct = pct(variationAbs, priorValue);

  return [{
    label: headcountPeriodLabel(factPeriod),
    value,
    priorValue,
    variationPct,
    variationAbs,
    details,
  }];
}

export function buildFinanzasMarginBySku(dataset: ProcessedDataset, period: SalesFilterPeriod): FinanzasSkuRow[] {
  const factPeriod = filterPeriodToFactPeriod(period);
  if (!factPeriod) return [];

  return groupLabels(dataset, factPeriod, "SKU")
    .map((label) => {
      const netRevenue = aggregateFact(dataset, "netRevenue", factPeriod, "SKU", label);
      const grossProfit = aggregateFact(dataset, "grossMargin", factPeriod, "SKU", label);
      const ebitda = aggregateFact(dataset, "ebitda", factPeriod, "SKU", label);
      const tradeSpend = aggregateFact(dataset, "tradeSpend", factPeriod, "SKU", label);
      const marginNumerator = ebitda.value ?? grossProfit.value;
      const revenue = netRevenue.value;
      return {
        label,
        netRevenue: revenue,
        grossProfit: grossProfit.value,
        ebitda: ebitda.value,
        tradeSpend: tradeSpend.value,
        marginPct: pct(marginNumerator, revenue),
        priorNetRevenue: netRevenue.priorValue,
        priorMarginPct: pct(ebitda.priorValue ?? grossProfit.priorValue, netRevenue.priorValue),
      };
    })
    .filter((row) => row.netRevenue !== undefined || row.ebitda !== undefined || row.tradeSpend !== undefined)
    .sort((a, b) => (b.ebitda ?? b.grossProfit ?? b.netRevenue ?? 0) - (a.ebitda ?? a.grossProfit ?? a.netRevenue ?? 0))
    .slice(0, 8);
}

export function buildFinanzasRevenueByChannel(dataset: ProcessedDataset, period: SalesFilterPeriod): FinanzasChannelRow[] {
  const factPeriod = filterPeriodToFactPeriod(period);
  if (!factPeriod) return [];

  return groupLabels(dataset, factPeriod, "CANAL")
    .map((label) => {
      const netRevenue = availableValue(findFact(dataset, "netRevenue", factPeriod, "CANAL", label));
      const ebitda = availableValue(findFact(dataset, "ebitda", factPeriod, "CANAL", label));
      const tradeSpend = availableValue(findFact(dataset, "tradeSpend", factPeriod, "CANAL", label));
      return {
        label,
        netRevenue,
        ebitda,
        tradeSpend,
        marginPct: pct(ebitda, netRevenue),
      };
    })
    .filter((row) => row.netRevenue !== undefined || row.ebitda !== undefined || row.tradeSpend !== undefined)
    .sort((a, b) => (b.netRevenue ?? 0) - (a.netRevenue ?? 0));
}

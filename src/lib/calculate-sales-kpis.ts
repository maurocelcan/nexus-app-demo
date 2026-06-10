import type { ProcessedDataset, SalesFilters, SalesKpis } from "@/types/dataset";

function extractYear(month: string): number {
  const m = month.match(/^(20\d{2})/);
  return m ? parseInt(m[1], 10) : 0;
}

function includeByPeriod(month: string | undefined, allowedMonths: Set<string> | null): boolean {
  if (!allowedMonths || !month) return true;
  return allowedMonths.has(month);
}

/**
 * Returns the set of months for the given period, based on the latest month in the dataset.
 * For YTD: current year only (year of the latest month found in the dataset).
 * Null means "no filter" (all data), used when period cannot be determined.
 */
function recentMonths(months: string[], period: SalesFilters["period"]): Set<string> | null {
  const ordered = [...months].sort(); // YYYY-MM sorts correctly lexicographically
  if (ordered.length === 0) return null;

  if (period === "MTD") return new Set([ordered[ordered.length - 1]]);
  if (period === "QTD") return new Set(ordered.slice(-3));
  if (period === "6M") return new Set(ordered.slice(-6));
  if (period === "12M") return new Set(ordered.slice(-12));

  // YTD: accumulate the current year only (derived from the latest month in the dataset)
  if (period === "YTD") {
    const latestYear = extractYear(ordered[ordered.length - 1]);
    if (!latestYear) return null;
    const ytd = ordered.filter((m) => extractYear(m) === latestYear);
    return ytd.length > 0 ? new Set(ytd) : null;
  }

  return null;
}

/**
 * Maps a set of YYYY-MM months to the same months in the prior year.
 * Used for YoY comparisons.
 */
function priorYearMonths(months: Set<string>): Set<string> {
  return new Set([...months].map((m) => {
    const year = extractYear(m);
    return year ? `${year - 1}${m.substring(4)}` : m;
  }));
}

function varPct(current: number, prior: number): number | undefined {
  if (prior === 0 || !Number.isFinite(prior) || !Number.isFinite(current)) return undefined;
  return Math.round(((current - prior) / prior) * 1000) / 10;
}

export function calculateSalesKpis(dataset: ProcessedDataset, filters: SalesFilters): SalesKpis {
  const salesData = dataset.salesData;
  if (!salesData) return dataset.salesKpis;

  const months = dataset.availableFilters?.months ?? [];
  const allowedMonths = recentMonths(months, filters.period);

  function matchesFilters<T extends { month?: string; skuId?: string; channel?: string; clientId?: string }>(row: T): boolean {
    if (!includeByPeriod(row.month, allowedMonths)) return false;
    if (filters.skuId && row.skuId !== filters.skuId) return false;
    if (filters.channel && row.channel !== filters.channel) return false;
    if (filters.clientId && row.clientId !== filters.clientId) return false;
    return true;
  }

  const sellInRows = salesData.sellInRows.filter(matchesFilters);
  const sellOutRows = salesData.sellOutRows.filter(matchesFilters);

  const sellInYtd = sellInRows.reduce((sum, row) => sum + (row.volumeCajas ?? 0), 0);
  const sellOutYtd = sellOutRows.reduce((sum, row) => sum + (row.volumeCajasOut ?? 0), 0);
  const netRevenueYtd = sellInRows.reduce((sum, row) => sum + (row.netRevenue ?? 0), 0);
  const ebitdaYtd = sellInRows.reduce((sum, row) => sum + (row.ebitda ?? 0), 0);
  const priceRows = sellOutRows.filter((row) => row.priceIndex !== undefined);
  const priceIndexAvg = priceRows.length > 0
    ? priceRows.reduce((sum, row) => sum + (row.priceIndex ?? 0), 0) / priceRows.length
    : undefined;

  const directClients = new Set(sellInRows.map((row) => row.clientId).filter(Boolean));
  const pdvs = new Set(sellOutRows.map((row) => row.pdvId).filter(Boolean));

  const kpis: SalesKpis = {
    sellInYtd: sellInYtd > 0 ? sellInYtd : undefined,
    sellOutYtd: sellOutYtd > 0 ? sellOutYtd : undefined,
    netRevenueYtd: netRevenueYtd > 0 ? netRevenueYtd : undefined,
    ebitdaYtd: ebitdaYtd > 0 ? ebitdaYtd : undefined,
    passthrough: sellInYtd > 0 && sellOutYtd > 0 ? sellOutYtd / sellInYtd : undefined,
    activeDirectClients: directClients.size > 0 ? directClients.size : undefined,
    activePdvs: pdvs.size > 0 ? pdvs.size : undefined,
    priceIndexAvg,
  };

  // YoY variations: compute prior-year equivalent period when possible
  if (allowedMonths && allowedMonths.size > 0) {
    const priorMonths = priorYearMonths(allowedMonths);

    function matchesPrior<T extends { month?: string; skuId?: string; channel?: string; clientId?: string }>(row: T): boolean {
      if (!row.month || !priorMonths.has(row.month)) return false;
      if (filters.skuId && row.skuId !== filters.skuId) return false;
      if (filters.channel && row.channel !== filters.channel) return false;
      if (filters.clientId && row.clientId !== filters.clientId) return false;
      return true;
    }

    const priorSellIn = salesData.sellInRows.filter(matchesPrior);
    const priorSellOut = salesData.sellOutRows.filter(matchesPrior);

    const priorSellInVol = priorSellIn.reduce((s, r) => s + (r.volumeCajas ?? 0), 0);
    const priorSellOutVol = priorSellOut.reduce((s, r) => s + (r.volumeCajasOut ?? 0), 0);
    const priorNetRevenue = priorSellIn.reduce((s, r) => s + (r.netRevenue ?? 0), 0);
    const priorEbitda = priorSellIn.reduce((s, r) => s + (r.ebitda ?? 0), 0);

    // Only set if we actually have prior-year data (prevents false zeros when dataset doesn't span 2 years)
    if (priorSellInVol > 0 && sellInYtd > 0) kpis.sellInVarPct = varPct(sellInYtd, priorSellInVol);
    if (priorSellOutVol > 0 && sellOutYtd > 0) kpis.sellOutVarPct = varPct(sellOutYtd, priorSellOutVol);
    if (priorNetRevenue > 0 && netRevenueYtd > 0) kpis.netRevenueVarPct = varPct(netRevenueYtd, priorNetRevenue);
    if (priorEbitda > 0 && ebitdaYtd > 0) kpis.ebitdaVarPct = varPct(ebitdaYtd, priorEbitda);

    if (kpis.passthrough !== undefined && priorSellIn.length > 0) {
      const priorPassthrough = priorSellInVol > 0 ? priorSellOutVol / priorSellInVol : undefined;
      if (priorPassthrough !== undefined) kpis.passthroughVarPct = varPct(kpis.passthrough, priorPassthrough);
    }
  }

  return kpis;
}

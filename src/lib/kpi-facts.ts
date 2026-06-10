/**
 * kpi-facts.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Helpers para trabajar con la capa canónica CommercialKpiFact.
 *
 * Reglas:
 * - Cuando el dataset tiene kpiFacts (formato BIS), usar estos en lugar de
 *   salesKpis o calculateSalesKpis para resolver KPIs por período.
 * - MTD siempre devuelve unavailable para BIS.
 * - Cuando no hay fact para un período/key → devolver undefined (mostrar N/A).
 * - Nunca inventar datos ni usar fallback demo silencioso.
 */

import type {
  CommercialKpiFact,
  CommercialKpiKey,
  KpiFactPeriod,
  KpiGrain,
  ProcessedDataset,
  SalesKpis,
} from "@/types/dataset";
import type { SalesKpi } from "@/types/analytics";
import type { SalesFilterPeriod } from "@/types/sales";
import { formatCurrency, formatPercentage, formatRatio, formatVolume, formatCount } from "@/lib/utils";

// ─── Mapping SalesFilterPeriod → KpiFactPeriod ────────────────────────────────

/**
 * Mapea el período seleccionado en la UI al KpiFactPeriod del BIS.
 * 12M → no hay equivalente en BIS, devuelve undefined.
 */
export function filterPeriodToFactPeriod(period: SalesFilterPeriod): KpiFactPeriod | undefined {
  switch (period) {
    case "YTD": return "YTD";
    case "QTD": return "QTD";
    case "6M":  return "U6M";
    case "MTD": return "MTD";
    case "12M": return undefined; // BIS no tiene acumulado 12M
    default:    return undefined;
  }
}

// ─── Resolución de un KPI fact ────────────────────────────────────────────────

/**
 * Busca el mejor CommercialKpiFact para la clave y período dados.
 * Prioriza grain=TOTAL. Devuelve undefined si no existe ningún fact
 * (distinto de un fact con isAvailable=false, que sí devuelve).
 */
export function resolveKpiFact(
  kpiFacts: CommercialKpiFact[],
  key: CommercialKpiKey,
  period: KpiFactPeriod,
  grain: KpiGrain = "TOTAL",
): CommercialKpiFact | undefined {
  // Coincidencia exacta key+period+grain
  const exact = kpiFacts.find(
    (f) => f.key === key && f.period === period && f.grain === grain
  );
  if (exact) return exact;

  // Coincidencia key+period (cualquier grain)
  return kpiFacts.find((f) => f.key === key && f.period === period);
}

// ─── Verifica si el dataset tiene kpiFacts (formato BIS) ──────────────────────

export function datasetHasKpiFacts(dataset: ProcessedDataset): boolean {
  return Array.isArray(dataset.kpiFacts) && dataset.kpiFacts.length > 0;
}

// ─── Construcción de SalesKpi desde un CommercialKpiFact ─────────────────────

function formatFactValue(fact: CommercialKpiFact): string {
  if (!fact.isAvailable || fact.value === undefined) return "N/A";
  switch (fact.unit) {
    case "currency": return formatCurrency(fact.value);
    case "volume":   return formatVolume(fact.value);
    // ratio: pure ratio like Price Index (1.02 → "1,02")
    case "ratio":    return formatRatio(fact.value);
    // pct: ratio stored as 0-1 decimal to be displayed as % (0.659 → "65,9%")
    case "pct":      return formatPercentage(fact.value * (Math.abs(fact.value) <= 1 ? 100 : 1));
    case "count":    return formatCount(fact.value);
    default:         return String(Math.round(fact.value));
  }
}

/**
 * Normaliza variationPct para display en KpiCard.
 * El adaptor ya devuelve valores en escala porcentual (30.7, no 0.307).
 * Esta función es una línea de defensa extra por si el adapter cambia.
 */
function safeVariationPct(fact: CommercialKpiFact): number {
  const v = fact.variationPct ?? 0;
  // Si por error llega un valor decimal (ej. 0.307 en vez de 30.7),
  // convertir. El threshold 1.5 cubre la mayoría de variaciones razonables.
  if (Math.abs(v) <= 1.5 && v !== 0) return Math.round(v * 1000) / 10;
  return Math.round(v * 10) / 10;
}

function changeType(fact: CommercialKpiFact): SalesKpi["changeType"] {
  if (!fact.isAvailable || fact.variationPct === undefined) return "neutral";
  return fact.variationPct >= 0 ? "positive" : "negative";
}

function toSalesKpi(
  fact: CommercialKpiFact,
  options?: { label?: string; unit?: string; description?: string; tooltip?: string }
): SalesKpi {
  const source = fact.sourceSheet ?? "BIS";
  return {
    label: options?.label ?? fact.label,
    value: formatFactValue(fact),
    unit: fact.unit === "volume" && fact.isAvailable && fact.value !== undefined ? "cajas" : options?.unit,
    change: safeVariationPct(fact),
    changeType: changeType(fact),
    // description: short context only (period, unit label) — never "Fuente:"
    description: options?.description ?? "",
    // tooltip: source, formula, or reason — shown on (i) icon hover
    tooltip: fact.isAvailable
      ? (options?.tooltip ?? `Fuente: ${source}`)
      : (fact.unavailableReason ?? `Sin dato en ${source} para este período`),
  };
}

// ─── unavailableKpi: KPI card que muestra N/A con razón ──────────────────────

function unavailableKpi(label: string, reason: string): SalesKpi {
  return {
    label,
    value: "N/A",
    change: 0,
    changeType: "neutral",
    description: "",
    tooltip: reason,
  };
}

// ─── Builder principal: kpiFacts → SalesKpi[] para un período ────────────────

/**
 * Resuelve la lista de SalesKpi para el módulo Ventas desde kpiFacts,
 * usando el período de filtro seleccionado.
 *
 * Siempre muestra los KPIs principales; si un período no tiene dato,
 * muestra N/A con razón explicativa.
 *
 * No mezcla datos demo. No inventa valores.
 */
export function kpisFromKpiFacts(
  dataset: ProcessedDataset,
  period: SalesFilterPeriod,
): SalesKpi[] {
  const rawFacts = dataset.kpiFacts;
  if (!rawFacts || rawFacts.length === 0) return [];
  const kpiFacts: CommercialKpiFact[] = rawFacts;

  const factPeriod = filterPeriodToFactPeriod(period);
  const MTD_REASON = "Sin MTD en BIS.";
  const NO_12M_REASON = "Sin 12M en BIS. Usar YTD o U6M.";

  function getKpi(key: CommercialKpiKey, label: string, options?: { unit?: string }): SalesKpi {
    if (!factPeriod) {
      return unavailableKpi(label, period === "MTD" ? MTD_REASON : NO_12M_REASON);
    }
    const fact = resolveKpiFact(kpiFacts, key, factPeriod);
    if (!fact) {
      return unavailableKpi(label, `Dato no disponible para ${label} en ${period}.`);
    }
    if (!fact.isAvailable) {
      return unavailableKpi(label, fact.unavailableReason ?? `Sin dato para ${period}`);
    }
    return toSalesKpi(fact, { label, ...options });
  }

  // Cards fijas para dataset real/BIS:
  // Sell-in | Sell-out | Passthrough | Net Revenue | EBITDA | Clientes compradores
  // NO Price Index, NO PDVs Activos, NO Distribución numérica, NO ASP, NO Gross Revenue
  const ptFact = factPeriod ? resolveKpiFact(kpiFacts, "passthrough", factPeriod) : undefined;
  const passthroughTooltip = ptFact?.isAvailable
    ? "Calculado como Sell-out / Sell-in · Fuente: Ventas BIS"
    : (ptFact?.unavailableReason ?? "No disponible para este período");
  const result: SalesKpi[] = [
    getKpi("sellInVolume", "Sell-in", { unit: "cajas" }),
    getKpi("sellOutVolume", "Sell-out", { unit: "cajas" }),
    { ...getKpi("passthrough", "Passthrough"), tooltip: passthroughTooltip },
    getKpi("netRevenue", "Net Revenue"),
    getKpi("ebitda", "EBITDA"),
  ];

  // Clientes compradores solo si el archivo lo trae (no es N/A vacío)
  const hasBuyers = kpiFacts.some((f) => f.key === "buyerCustomers" && f.isAvailable);
  if (hasBuyers) result.push(getKpi("buyerCustomers", "Clientes compradores"));

  return result;
}

/**
 * Resuelve KPIs para el módulo Finanzas desde kpiFacts + salesKpis.
 * Muestra N/A para los que no están disponibles, sin fallback demo.
 */
export function finanzasKpisFromDataset(
  dataset: ProcessedDataset,
  period: SalesFilterPeriod = "YTD",
): SalesKpi[] {
  const kpiFacts = dataset.kpiFacts;
  const sk = dataset.salesKpis;
  const factPeriod = filterPeriodToFactPeriod(period);
  const MTD_REASON = "El archivo BIS no contiene datos del mes corriente (MTD).";
  const NO_PERIOD_REASON = "El archivo BIS no contiene datos para este período.";

  function resolveFinanceFact(key: CommercialKpiKey, grain: KpiGrain = "TOTAL"): CommercialKpiFact | undefined {
    if (!factPeriod || !kpiFacts) return undefined;
    return kpiFacts.find((fact) =>
      fact.key === key &&
      fact.period === factPeriod &&
      fact.grain === grain &&
      (fact.module === "finance" || fact.sourceSheet?.toLowerCase().includes("finanzas"))
    ) ?? resolveKpiFact(kpiFacts, key, factPeriod, grain);
  }

  // Helper inline
  function getKpi(key: CommercialKpiKey, label: string): SalesKpi {
    if (!factPeriod) {
      return unavailableKpi(label, period === "MTD" ? MTD_REASON : NO_PERIOD_REASON);
    }
    if (kpiFacts && kpiFacts.length > 0) {
      const fact = resolveFinanceFact(key);
      if (fact) {
        if (!fact.isAvailable) return unavailableKpi(label, fact.unavailableReason ?? `Sin dato para ${period}`);
        return toSalesKpi(fact, { label });
      }
    }
    // Fallback: leer desde salesKpis (para archivos no-BIS con estos campos)
    return unavailableKpi(label, `Dato no mapeado para ${label} en ${period}.`);
  }

  // Para YTD podemos leer desde salesKpis directamente cuando los kpiFacts no cubren finanzas
  function fromSalesKpisYtd(
    key: keyof SalesKpis,
    varKey: keyof SalesKpis,
    label: string,
    unit: CommercialKpiFact["unit"],
    _description = "",
    tooltip = "Fuente: archivo real",
  ): SalesKpi | null {
    const v = sk[key];
    if (v === undefined) return null;
    const variation = typeof sk[varKey] === "number" ? sk[varKey] : 0;
    const formatted = unit === "currency" ? formatCurrency(v as number)
      : unit === "ratio" ? formatPercentage((v as number) * 100)
      : unit === "pct" ? formatPercentage(v as number)
      : String(v);
    return {
      label,
      value: formatted,
      change: Math.round(variation * 10) / 10,
      changeType: variation === 0 ? "neutral" : variation > 0 ? "positive" : "negative",
      description: "",
      tooltip,
    };
  }

  const result: SalesKpi[] = [];

  // Operational KPI: value suffix (e.g. " días"), tooltip always "Fuente: Finanzas BIS"
  function operationalKpi(key: CommercialKpiKey, label: string, suffix?: string): SalesKpi {
    const kpi = getKpi(key, label);
    if (kpi.value !== "N/A" && suffix) {
      return { ...kpi, value: `${kpi.value}${suffix}`, unit: undefined, description: "", tooltip: kpi.tooltip ?? "Fuente: Finanzas BIS" };
    }
    return { ...kpi, description: "", tooltip: kpi.tooltip ?? "Fuente: Finanzas BIS" };
  }

  // Net Revenue — tooltip: Fuente: Finanzas BIS (already set by toSalesKpi/unavailableKpi)
  const nrKpi = getKpi("netRevenue", "Net Revenue");
  if (nrKpi.value === "N/A" && factPeriod === "YTD" && sk.netRevenueYtd !== undefined) {
    result.push(fromSalesKpisYtd("netRevenueYtd", "netRevenueVarPct", "Net Revenue", "currency") ?? nrKpi);
  } else {
    result.push(nrKpi);
  }

  // EBITDA
  const ebitdaKpi = getKpi("ebitda", "EBITDA");
  if (ebitdaKpi.value === "N/A" && factPeriod === "YTD" && sk.ebitdaYtd !== undefined) {
    result.push(fromSalesKpisYtd("ebitdaYtd", "ebitdaVarPct", "EBITDA", "currency") ?? ebitdaKpi);
  } else {
    result.push(ebitdaKpi);
  }

  // Gross Profit / Gross Margin
  const gpKpi = getKpi("grossMargin", "Gross Profit");
  if (gpKpi.value === "N/A" && factPeriod === "YTD" && sk.grossMargin !== undefined) {
    result.push(fromSalesKpisYtd("grossMargin", "grossMarginVarPct", "Gross Profit", "currency") ?? gpKpi);
  } else {
    result.push(gpKpi);
  }

  // Trade Spend
  const tradeKpi = getKpi("tradeSpend", "Trade Spend");
  if (tradeKpi.value === "N/A" && factPeriod === "YTD" && sk.tradeSpend !== undefined) {
    result.push(fromSalesKpisYtd("tradeSpend", "tradeSpendVarPct", "Trade Spend", "currency") ?? tradeKpi);
  } else {
    result.push(tradeKpi);
  }

  result.push(
    operationalKpi("dso", "Días de cobro", " días"),
    operationalKpi("daysLate", "Días de atraso", " días"),
    operationalKpi("invoiceAmount", "Monto facturado"),
    operationalKpi("collectedAmount", "Monto cobrado"),
  );

  return result;
}

/**
 * Resuelve KPIs de Sell-Through desde kpiFacts + salesKpis.
 */
export function sellThroughKpisFromDataset(
  dataset: ProcessedDataset,
  period: SalesFilterPeriod = "YTD",
): SalesKpi[] {
  const kpiFacts = dataset.kpiFacts;
  const sk = dataset.salesKpis;
  const factPeriod = filterPeriodToFactPeriod(period) ?? "YTD";

  function getKpi(key: CommercialKpiKey, label: string): SalesKpi {
    if (kpiFacts && kpiFacts.length > 0) {
      const fact = resolveKpiFact(kpiFacts, key, factPeriod);
      if (fact) {
        if (!fact.isAvailable) return unavailableKpi(label, fact.unavailableReason ?? `Sin dato para ${period}`);
        return toSalesKpi(fact, { label });
      }
    }
    return unavailableKpi(label, `Dato no disponible para ${label} en ${period}.`);
  }

  const result: SalesKpi[] = [
    getKpi("netRevenue", "Net Revenue"),
    getKpi("sellOutVolume", "Sell-out"),
    getKpi("buyerCustomers", "Clientes compradores"),
    getKpi("passthrough", "Passthrough"),
  ];

  // Numeric distribution si existe
  if (sk.numericDistribution !== undefined || kpiFacts?.some((f) => f.key === "numericDistribution" && f.isAvailable)) {
    result.push(getKpi("numericDistribution", "Distribución numérica"));
  }

  return result;
}

// ─── salesKpisFromKpiFacts: SalesKpis parcial para un período ──────────────────

/**
 * Construye un objeto SalesKpis con los valores del período seleccionado
 * desde kpiFacts. Útil para pasar datos period-correctos al waterfall y otros
 * componentes que esperan SalesKpis en lugar de CommercialKpiFact[].
 */
export function salesKpisFromKpiFacts(
  dataset: ProcessedDataset,
  period: SalesFilterPeriod,
): Partial<SalesKpis> | null {
  const rawFacts = dataset.kpiFacts;
  if (!rawFacts || rawFacts.length === 0) return null;
  const kpiFacts: CommercialKpiFact[] = rawFacts;

  const factPeriod = filterPeriodToFactPeriod(period);
  if (!factPeriod) return null;

  function getValue(key: CommercialKpiKey): number | undefined {
    const f = resolveKpiFact(kpiFacts, key, factPeriod!);
    return f?.isAvailable && f.value !== undefined ? f.value : undefined;
  }

  return {
    grossRevenue: getValue("grossRevenue"),
    tradeSpend: getValue("tradeSpend"),
    netRevenueYtd: getValue("netRevenue"),
    cogsPct: getValue("cogs"),
    grossMargin: getValue("grossMargin"),
    opex: getValue("opex"),
    ebitdaYtd: getValue("ebitda"),
    sellInYtd: getValue("sellInVolume"),
    sellOutYtd: getValue("sellOutVolume"),
  };
}

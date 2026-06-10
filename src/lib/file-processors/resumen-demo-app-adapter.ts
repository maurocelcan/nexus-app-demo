import type {
  ColumnMapping,
  CommercialBusinessArea,
  CommercialKpiKey,
  CommercialKpiFact,
  KpiGrain,
  KpiFactPeriod,
  FinanceHeadcountFact,
  FinanceMonthlyPoint,
  NormalizedClient,
  NormalizedProduct,
  NormalizedSellInRow,
  NormalizedSellOutRow,
  ProcessedDataset,
  ProcessedSheet,
  SalesKpis,
  SemanticDatasetProfile,
  SheetDomain,
  SellThroughMonthlyPoint,
} from "@/types/dataset";
import type { WorkBook } from "xlsx";
import { buildSemanticProfile, normalizeSemanticText, type RawSheetProfile } from "@/lib/semantic-commercial-engine";
import { generateId } from "@/lib/utils";

type XlsxModule = typeof import("xlsx");
type MatrixRow = unknown[];

type ProcessResumenDemoOptions = {
  fileName: string;
  fileSize: number;
  workbook: WorkBook;
  XLSX: XlsxModule;
};

type KpiDefinition = {
  field: keyof SalesKpis;
  varField?: keyof SalesKpis;
  semanticKey: CommercialKpiKey;
  label: string;
  area: CommercialBusinessArea;
  unit: "currency" | "volume" | "ratio" | "count" | "pct";
};

type CanonicalRow = {
  channel: string;
  sku: string;
  metric: string;
  ytd25?: number;
  ytd26?: number;
  ytdVarPct?: number;
  ma25?: number;
  ma26?: number;
  q125?: number;
  q126?: number;
  u6m25?: number;
  u6m26?: number;
};

const REQUIRED_SHEET_KEYS = ["ventas", "sellthrough", "finanzas"];
const SUMMARY_SHEET_PATTERNS = ["ventasbis", "ventaswizz", "ventasresumen", "resumenventas"];

const IGNORE_TEXT_PATTERNS = [
  "quitar",
  "este es igual",
  "lo tengo que calcular",
  "ranking sku",
];

const KPI_DEFINITIONS: Record<string, KpiDefinition> = {
  netrevenue: {
    field: "netRevenueYtd",
    varField: "netRevenueVarPct",
    semanticKey: "netRevenue",
    label: "Net Revenue",
    area: "finance",
    unit: "currency",
  },
  sellincajas: {
    field: "sellInYtd",
    varField: "sellInVarPct",
    semanticKey: "sellInVolume",
    label: "Sell-in",
    area: "sales",
    unit: "volume",
  },
  selloutcajas: {
    field: "sellOutYtd",
    varField: "sellOutVarPct",
    semanticKey: "sellOutVolume",
    label: "Sell-out",
    area: "sell-through",
    unit: "volume",
  },
  ebitda: {
    field: "ebitdaYtd",
    varField: "ebitdaVarPct",
    semanticKey: "ebitda",
    label: "EBITDA",
    area: "finance",
    unit: "currency",
  },
  clientescompradores: {
    field: "buyerCustomers",
    varField: "buyerCustomersVarPct",
    semanticKey: "buyerCustomers",
    label: "Clientes compradores",
    area: "sell-through",
    unit: "count",
  },
  grossrevenue: {
    field: "grossRevenue",
    varField: "grossRevenueVarPct",
    semanticKey: "grossRevenue",
    label: "Gross Revenue",
    area: "finance",
    unit: "currency",
  },
  grossprofit: {
    field: "grossMargin",
    varField: "grossMarginVarPct",
    semanticKey: "grossMargin",
    label: "Gross Profit",
    area: "finance",
    unit: "currency",
  },
  cogs: {
    field: "cogsPct",
    varField: "cogsPctVarPct",
    semanticKey: "cogs",
    label: "COGS",
    area: "finance",
    unit: "currency",
  },
  cogspct: {
    field: "cogsPct",
    varField: "cogsPctVarPct",
    semanticKey: "cogsPct",
    label: "COGS %",
    area: "finance",
    unit: "pct",
  },
  tradediscounts: {
    field: "tradeSpend",
    varField: "tradeSpendVarPct",
    semanticKey: "tradeSpend",
    label: "Trade Spend",
    area: "trade-marketing",
    unit: "currency",
  },
  descuentostrade: {
    field: "tradeSpend",
    varField: "tradeSpendVarPct",
    semanticKey: "tradeSpend",
    label: "Descuentos Trade",
    area: "finance",
    unit: "currency",
  },
  ga: {
    field: "opex",
    varField: "opexVarPct",
    semanticKey: "opex",
    label: "G&A",
    area: "finance",
    unit: "currency",
  },
  gastosestructura: {
    field: "opex",
    varField: "opexVarPct",
    semanticKey: "opex",
    label: "Gastos estructura",
    area: "finance",
    unit: "currency",
  },
  grossmarginpct: {
    field: "grossMargin",
    varField: "grossMarginVarPct",
    semanticKey: "grossMarginPct",
    label: "Gross Margin %",
    area: "finance",
    unit: "pct",
  },
  ebitdapct: {
    field: "ebitdaYtd",
    varField: "ebitdaVarPct",
    semanticKey: "ebitdaPct",
    label: "EBITDA %",
    area: "finance",
    unit: "pct",
  },
  diascobro: {
    field: "priceIndexAvg",
    semanticKey: "dso",
    label: "Días de cobro",
    area: "finance",
    unit: "count",
  },
  diasatraso: {
    field: "priceIndexAvg",
    semanticKey: "daysLate",
    label: "Días de atraso",
    area: "finance",
    unit: "count",
  },
  montofacturausd: {
    field: "grossRevenue",
    varField: "grossRevenueVarPct",
    semanticKey: "invoiceAmount",
    label: "Monto facturado",
    area: "finance",
    unit: "currency",
  },
  montocobradousd: {
    field: "netRevenueYtd",
    varField: "netRevenueVarPct",
    semanticKey: "collectedAmount",
    label: "Monto cobrado",
    area: "finance",
    unit: "currency",
  },
  saldoabiertousd: {
    field: "netRevenueYtd",
    semanticKey: "openBalance",
    label: "Saldo abierto",
    area: "finance",
    unit: "currency",
  },
  distribucionnumerica: {
    field: "numericDistribution",
    varField: "numericDistributionVarPct",
    semanticKey: "numericDistribution",
    label: "Distribución numérica",
    area: "sell-through",
    unit: "pct", // shown as % (0-1 value → 82,5%)
  },
  distnumerica: {
    field: "numericDistribution",
    varField: "numericDistributionVarPct",
    semanticKey: "numericDistribution",
    label: "Distribución numérica",
    area: "sell-through",
    unit: "pct",
  },
  passthrough: {
    field: "passthrough",
    varField: "passthroughVarPct",
    semanticKey: "passthrough",
    label: "Passthrough",
    area: "sales",
    unit: "pct", // shown as % (0-1 value → 65,9%)
  },
  cumplefotoexito: {
    field: "successPhoto",
    varField: "successPhotoVarPct",
    semanticKey: "successPhoto",
    label: "Foto Éxito",
    area: "sell-through",
    unit: "count",
  },
  pdvsactivos: {
    field: "activePdvs",
    varField: "activePdvsVarPct",
    semanticKey: "activePdvs",
    label: "PDVs activos",
    area: "sell-through",
    unit: "count",
  },
  pdvsuniversoasignado: {
    field: "pdvUniverse",
    varField: "pdvUniverseVarPct",
    semanticKey: "pdvUniverse",
    label: "Universo PDV asignado",
    area: "sell-through",
    unit: "count",
  },
  priceindex: {
    field: "priceIndexAvg",
    varField: "priceIndexVarPct",
    semanticKey: "priceIndex",
    label: "Price Index",
    area: "rgm",
    unit: "ratio",
  },
  asp: {
    field: "asp",
    varField: "aspVarPct",
    semanticKey: "asp",
    label: "ASP",
    area: "rgm",
    unit: "currency",
  },
};

function compact(value: unknown): string {
  return normalizeSemanticText(String(value ?? "")).replace(/\s+/g, "");
}

function sheetKey(value: string): string {
  return compact(value);
}

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (value === null || value === undefined || value === "") return undefined;
  let raw = String(value).trim().replace(/USD\s*/gi, "").replace(/[$€£R$]/g, "");
  if (!raw) return undefined;
  const isPct = raw.endsWith("%");
  if (isPct) raw = raw.slice(0, -1).trim();
  const dots = (raw.match(/\./g) ?? []).length;
  const commas = (raw.match(/,/g) ?? []).length;
  if (dots > 1) raw = raw.replace(/\./g, "").replace(",", ".");
  else if (commas > 1) raw = raw.replace(/,/g, "");
  else if (dots === 1 && commas === 1) raw = raw.lastIndexOf(",") > raw.lastIndexOf(".") ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(/,/g, "");
  else if (commas === 1) raw = (raw.split(",")[1] ?? "").length === 3 ? raw.replace(",", "") : raw.replace(",", ".");
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeVarPct(value: unknown): number | undefined {
  const parsed = toNumber(value);
  if (parsed === undefined) return undefined;
  return Math.abs(parsed) <= 1.5 ? Math.round(parsed * 1000) / 10 : Math.round(parsed * 10) / 10;
}

function normalizeRatio(value: unknown): number | undefined {
  const parsed = toNumber(value);
  if (parsed === undefined) return undefined;
  return Math.abs(parsed) > 1.5 ? parsed / 100 : parsed;
}

function hasIgnoredText(row: MatrixRow): boolean {
  const joined = compact(row.join(" "));
  return IGNORE_TEXT_PATTERNS.some((pattern) => joined.includes(compact(pattern)));
}

function isEmptyRow(row: MatrixRow): boolean {
  return row.every((cell) => text(cell) === "");
}

function isAuxiliaryMarkerRow(row: MatrixRow): boolean {
  const values = row.map((cell) => compact(cell)).filter(Boolean);
  return values.length > 0 && values.every((value) => value === "x");
}

function rowToSheetCells(row: MatrixRow): string[] {
  return row.map((cell) => text(cell)).filter(Boolean);
}

function matrixForSheet(XLSX: XlsxModule, workbook: WorkBook, sheetName: string): MatrixRow[] {
  return XLSX.utils.sheet_to_json<MatrixRow>(workbook.Sheets[sheetName], { header: 1, defval: "" });
}

function findResumenSheet(sheetNames: string[]): string | undefined {
  return sheetNames.find((name) => SUMMARY_SHEET_PATTERNS.some((pattern) => sheetKey(name).includes(pattern)));
}

function findSheetByPatterns(sheetNames: string[], patterns: string[]): string | undefined {
  return sheetNames.find((name) => patterns.some((pattern) => sheetKey(name).includes(pattern)));
}

export function isResumenDemoAppWorkbook(workbook: WorkBook): boolean {
  const keys = workbook.SheetNames.map(sheetKey);
  const hasRequired = REQUIRED_SHEET_KEYS.every((required) => keys.some((key) => key === required || key.includes(required)));
  return hasRequired && Boolean(findResumenSheet(workbook.SheetNames));
}

function sheetDomain(name: string): SheetDomain {
  const key = sheetKey(name);
  if (key.includes("finanzas")) return "finance";
  if (key.includes("sellthrough")) return "sales";
  if (key.includes("ventas")) return "sales";
  return "unknown";
}

function processedSheet(XLSX: XlsxModule, workbook: WorkBook, name: string, columns: string[]): ProcessedSheet {
  const sheet = workbook.Sheets[name];
  const range = sheet["!ref"] ? XLSX.utils.decode_range(sheet["!ref"]) : null;
  return {
    name,
    rows: range ? Math.max(0, range.e.r - range.s.r) : 0,
    columns,
    domain: sheetDomain(name),
    status: "processed",
  };
}

function findHeaderIndex(rows: MatrixRow[]): number {
  return rows.findIndex((row) => {
    const values = row.map(compact);
    return values.includes("canal") && values.includes("sku") && values.includes("kpi");
  });
}

function kpiDefinition(metric: string): KpiDefinition | undefined {
  return KPI_DEFINITIONS[normalizeMetricKey(metric)] ?? KPI_DEFINITIONS[compact(metric)];
}

function normalizeMetricKey(metric: string): string {
  const compacted = compact(metric).replace(/^obj/, "");
  const isPctMetric = metric.includes("%") || metric.toLowerCase().includes("_pct");
  if (!isPctMetric) return compacted;
  if (compacted === "grossmargin") return "grossmarginpct";
  if (compacted === "cogs") return "cogspct";
  if (compacted === "ebitda") return "ebitdapct";
  return compacted;
}

function canonicalRows(rows: MatrixRow[], ignoredBlocks: string[]): CanonicalRow[] {
  const headerIndex = findHeaderIndex(rows);
  if (headerIndex < 0) return [];
  const result: CanonicalRow[] = [];

  for (const [index, row] of rows.entries()) {
    if (index <= headerIndex) continue;
    if (isEmptyRow(row)) continue;
    if (isAuxiliaryMarkerRow(row) || hasIgnoredText(row)) {
      ignoredBlocks.push(`Ventas Bis fila ${index + 1}: ${rowToSheetCells(row).slice(0, 4).join(" | ")}`);
      continue;
    }

    const metric = text(row[2]);
    if (!metric || !kpiDefinition(metric)) continue;

    result.push({
      channel: text(row[0]) || "Total",
      sku: text(row[1]),
      metric,
      ytd25: toNumber(row[4]),
      ytd26: toNumber(row[5]),
      ytdVarPct: normalizeVarPct(row[6]),
      ma25: toNumber(row[11]),
      ma26: toNumber(row[12]),
      q125: toNumber(row[13]),
      q126: toNumber(row[14]),
      u6m25: toNumber(row[15]),
      u6m26: toNumber(row[16]),
    });
  }

  return result;
}

function preferTotalRow(rows: CanonicalRow[], metricKey: string): CanonicalRow | undefined {
  const matching = rows.filter((row) => normalizeMetricKey(row.metric) === metricKey);
  const totalRows = matching.filter((row) => compact(row.channel) === "total");
  return (
    totalRows.find((row) => compact(row.sku) === "") ??
    totalRows.find((row) => compact(row.sku) === "total") ??
    matching.find((row) => compact(row.sku).includes("cantidaddeclientes")) ??
    matching[0]
  );
}

function setKpiValue(kpis: SalesKpis, row: CanonicalRow, source: Record<string, string>) {
  const definition = kpiDefinition(row.metric);
  if (!definition || row.ytd26 === undefined) return;
  const rowMetricKey = normalizeMetricKey(row.metric);

  const value = definition.unit === "ratio" ? normalizeRatio(row.ytd26) : row.ytd26;
  if (value === undefined) return;

  if (definition.field === "opex" && kpis.opex !== undefined && rowMetricKey === "ga") return;
  kpis[definition.field] = value;
  source[String(definition.field)] = `Ventas Bis · ${definition.label}`;

  if (definition.varField && row.ytdVarPct !== undefined) {
    kpis[definition.varField] = row.ytdVarPct;
    source[String(definition.varField)] = `Ventas Bis · ${definition.label} · YTD 26 vs YTD 25 %`;
  }
}

function buildKpis(rows: CanonicalRow[], kpiSources: Record<string, string>, warnings: string[]): SalesKpis {
  const kpis: SalesKpis = {};
  const expected = ["netrevenue", "sellincajas", "selloutcajas", "ebitda"];

  for (const key of Object.keys(KPI_DEFINITIONS)) {
    const row = preferTotalRow(rows, key);
    if (row) setKpiValue(kpis, row, kpiSources);
  }

  const buyerRow = rows.find((row) =>
    normalizeMetricKey(row.metric) === "clientescompradores" && compact(row.channel) === "total" && compact(row.sku).includes("cantidaddeclientes")
  );
  if (buyerRow) {
    setKpiValue(kpis, buyerRow, kpiSources);
    kpis.activeDirectClients = buyerRow.ytd26;
    if (buyerRow.ytdVarPct !== undefined) kpis.buyerCustomersVarPct = buyerRow.ytdVarPct;
    kpiSources.activeDirectClients = "Ventas Bis · Clientes compradores";
  }

  if (kpis.passthrough === undefined && kpis.sellInYtd && kpis.sellOutYtd) {
    kpis.passthrough = kpis.sellOutYtd / kpis.sellInYtd;
    kpiSources.passthrough = "Calculado desde Ventas Bis · Sell-out / Sell-in";
  }

  for (const expectedKey of expected) {
    const definition = KPI_DEFINITIONS[expectedKey];
    if (definition && kpis[definition.field] === undefined) {
      warnings.push(`Resumen Demo App: no se pudo mapear ${definition.label} desde Ventas Bis.`);
    }
  }

  return kpis;
}

function rowKey(channel: string, sku: string): string {
  return `${compact(channel)}|${compact(sku)}`;
}

function buildMetricMap(rows: CanonicalRow[], metricKey: string): Map<string, CanonicalRow> {
  return new Map(
    rows
      .filter((row) => normalizeMetricKey(row.metric) === metricKey)
      .map((row) => [rowKey(row.channel, row.sku), row])
  );
}

function isDetailRow(row: CanonicalRow): boolean {
  const channel = compact(row.channel);
  const sku = compact(row.sku);
  return channel !== "total" && Boolean(sku) && sku !== "total" && !sku.includes("cantidaddeclientes") && !sku.includes("universototal");
}

type CanonicalPeriodField = "ytd26" | "q126" | "u6m26" | "ma26";

function getCanonicalField(row: CanonicalRow, field: CanonicalPeriodField): number | undefined {
  switch (field) {
    case "ytd26": return row.ytd26;
    case "q126":  return row.q126;
    case "u6m26": return row.u6m26;
    case "ma26":  return row.ma26;
  }
}

/** BIS period labels used as `month` on NormalizedSellInRow/SellOutRow. */
const BIS_PERIODS: { month: string; field: CanonicalPeriodField }[] = [
  { month: "2026-YTD", field: "ytd26" },
  { month: "2026-QTD", field: "q126" },
  { month: "2026-U6M", field: "u6m26" },
  { month: "2026-MA",  field: "ma26" },
];

function buildNormalizedData(rows: CanonicalRow[]) {
  const sellInMap = buildMetricMap(rows, "sellincajas");
  const sellOutMap = buildMetricMap(rows, "selloutcajas");
  const revenueMap = buildMetricMap(rows, "netrevenue");
  const ebitdaMap = buildMetricMap(rows, "ebitda");
  const detailRows = [...sellInMap.values()].filter(isDetailRow);

  const productsById = new Map<string, NormalizedProduct>();
  const clientsById = new Map<string, NormalizedClient>();
  const sellInRows: NormalizedSellInRow[] = [];
  const sellOutRows: NormalizedSellOutRow[] = [];
  const availableMonths = new Set<string>();

  for (const row of detailRows) {
    const sku = row.sku;
    const channel = row.channel;
    const key = rowKey(channel, sku);
    productsById.set(sku, { id: sku, name: sku, displayName: sku });
    clientsById.set(channel, { id: channel, name: channel, channel });

    const siRow = sellInMap.get(key);
    const soRow = sellOutMap.get(key);
    const revRow = revenueMap.get(key);
    const ebRow = ebitdaMap.get(key);

    for (const { month, field } of BIS_PERIODS) {
      const siValue = siRow ? getCanonicalField(siRow, field) : undefined;
      if (!siValue || siValue === 0) continue;

      availableMonths.add(month);

      sellInRows.push({
        month,
        skuId: sku,
        skuName: sku,
        clientId: channel,
        clientName: channel,
        channel,
        volumeCajas: siValue,
        netRevenue: revRow ? getCanonicalField(revRow, field) : undefined,
        ebitda: ebRow ? getCanonicalField(ebRow, field) : undefined,
      });

      if (soRow) {
        const soValue = getCanonicalField(soRow, field);
        if (soValue !== undefined && soValue > 0) {
          sellOutRows.push({
            month,
            skuId: sku,
            skuName: sku,
            clientId: channel,
            clientName: channel,
            channel,
            pdvId: `${channel}-${sku}`,
            volumeCajasOut: soValue,
          });
        }
      }
    }
  }

  return {
    sellInRows,
    sellOutRows,
    products: [...productsById.values()].sort((a, b) => a.name.localeCompare(b.name)),
    directClients: [...clientsById.values()].sort((a, b) => a.name.localeCompare(b.name)),
    availableMonths: [...availableMonths].sort(),
  };
}

function rawRowsForMetric(rows: CanonicalRow[], metricKey: string): Record<string, unknown>[] {
  return rows
    .filter((row) => normalizeMetricKey(row.metric) === metricKey)
    .map((row) => ({
      Canal: row.channel,
      SKU: row.sku,
      KPI: row.metric,
      "YTD 25": row.ytd25,
      "YTD 26": row.ytd26,
      "YTD 26 vs YTD 25 %": row.ytdVarPct,
      "MA 2026": row.ma26,
      "Q1 2026": row.q126,
      "U6M 2026": row.u6m26,
    }));
}

/** Mapeo de clave semántica al valor de NEXUS_FIELD_OPTIONS en el UI de mapping. */
const SEMANTIC_TO_NEXUS_FIELD: Partial<Record<CommercialKpiKey, string>> = {
  sellInVolume: "Volumen Sell-in",
  sellOutVolume: "Volumen Sell-out",
  netRevenue: "Net Revenue",
  grossRevenue: "Gross Revenue",
  grossMargin: "Gross Margin",
  ebitda: "EBITDA",
  tradeSpend: "Trade Spend",
  passthrough: "Passthrough",
  numericDistribution: "Distribución numérica",
  priceIndex: "Price Index",
  asp: "ASP",
  cogs: "COGS",
  opex: "Opex",
  successPhoto: "Foto Éxito",
  activePdvs: "PDVs activos",
  pdvUniverse: "Universo PDV asignado",
};

function buildMappings(sheetName: string, rows: CanonicalRow[]): ColumnMapping[] {
  const metrics = [...new Set(rows.map((row) => normalizeMetricKey(row.metric)))]
    .map((key) => KPI_DEFINITIONS[key])
    .filter((definition): definition is KpiDefinition => Boolean(definition));
  const base: ColumnMapping[] = [
    { fileColumn: "Canal", nexusField: "Canal", sheet: sheetName, confidence: 1, semanticKey: "channel", detectedType: "dimension" },
    { fileColumn: "SKU", nexusField: "SKU ID", sheet: sheetName, confidence: 1, semanticKey: "skuId", detectedType: "entity" },
    { fileColumn: "KPI", nexusField: "Ignorar", sheet: sheetName, confidence: 1, detectedType: "dimension" },
  ];
  for (const metric of metrics) {
    const nexusField = SEMANTIC_TO_NEXUS_FIELD[metric.semanticKey] ?? metric.label;
    base.push({
      fileColumn: metric.label,
      nexusField,
      sheet: sheetName,
      confidence: 0.95,
      semanticKey: metric.semanticKey,
      detectedType: "metric",
    });
  }
  return base;
}

function buildSemanticDatasetProfile(sheetName: string, sourceSheets: string[], rows: CanonicalRow[], warnings: string[]): SemanticDatasetProfile {
  const detectedDefinitions = [...new Set(rows.map((row) => normalizeMetricKey(row.metric)))]
    .map((key) => KPI_DEFINITIONS[key])
    .filter((definition): definition is KpiDefinition => Boolean(definition));
  const columns = ["Canal", "SKU", "KPI", "YTD 25", "YTD 26", "YTD 26 vs YTD 25 %", ...detectedDefinitions.map((item) => item.label)];
  const base = buildSemanticProfile([
    { name: sheetName, rows: rows.length, columns, headerRowIndex: 5 },
    ...sourceSheets.filter((sheet) => sheet !== sheetName).map<RawSheetProfile>((sheet) => ({ name: sheet, rows: 0, columns: [], headerRowIndex: 0 })),
  ]);
  const kpis = detectedDefinitions.map((definition) => ({
    id: `kpi-${definition.semanticKey}`,
    key: definition.semanticKey,
    label: definition.label,
    confidence: 0.95,
    evidence: [`Ventas Bis contiene ${definition.label} con YTD 25, YTD 26 y variación`],
    columns: [definition.label, "YTD 26", "YTD 26 vs YTD 25 %"],
    sheets: [sheetName],
    area: definition.area,
  }));
  return {
    ...base,
    summary: `Formato Resumen Demo App: ${kpis.length} KPIs resumidos detectados en ${sheetName}`,
    kpis,
    quality: {
      ...base.quality,
      confidence: 0.95,
      warnings,
    },
  };
}

// ─── KPI Facts builder ─────────────────────────────────────────────────────────

type BisFactPeriod = { period: CommercialKpiFact["period"]; year: number; current: number | undefined; prior: number | undefined };

function bisFactPeriods(row: CanonicalRow): BisFactPeriod[] {
  return [
    { period: "YTD", year: 2026, current: row.ytd26, prior: row.ytd25 },
    { period: "QTD", year: 2026, current: row.q126, prior: row.q125 },
    { period: "U6M", year: 2026, current: row.u6m26, prior: row.u6m25 },
    { period: "MA",  year: 2026, current: row.ma26,  prior: row.ma25  },
  ];
}

function bisVarPct(current: number | undefined, prior: number | undefined): number | undefined {
  if (current === undefined || prior === undefined || prior === 0) return undefined;
  return Math.round(((current - prior) / Math.abs(prior)) * 1000) / 10;
}

/**
 * Construye la capa canónica de KPI facts desde las filas BIS de Ventas Bis.
 * Para cada métrica × período, emite un CommercialKpiFact con value + variación.
 * Si el valor del período no existe en el archivo, isAvailable = false.
 * MTD siempre se marca como no disponible (BIS no tiene ese corte).
 */
function buildKpiFacts(rows: CanonicalRow[], sheetName: string): CommercialKpiFact[] {
  const facts: CommercialKpiFact[] = [];
  const YEAR = 2026;

  // MTD siempre unavailable para formato BIS
  const MTD_UNAVAILABLE_REASON = "El archivo BIS no contiene datos del mes corriente (MTD). Use YTD, QTD o U6M.";

  for (const [metricKey, definition] of Object.entries(KPI_DEFINITIONS)) {
    const totalRow = preferTotalRow(rows, metricKey);

    // Agregar MTD como N/A siempre
    facts.push({
      key: definition.semanticKey,
      label: definition.label,
      period: "MTD",
      year: YEAR,
      unit: definition.unit as CommercialKpiFact["unit"],
      grain: "TOTAL" as KpiGrain,
      sourceSheet: sheetName,
      module: definition.area,
      isAvailable: false,
      unavailableReason: MTD_UNAVAILABLE_REASON,
    });

    // Para cada período BIS disponible, emitir un fact
    if (!totalRow) continue;

    const metricRows = rows.filter((row) => normalizeMetricKey(row.metric) === metricKey);
    const rowsToFact = [
      { row: totalRow, grain: "TOTAL" as KpiGrain, label: definition.label },
      ...metricRows
        .filter((row) => isDetailRow(row))
        .map((row) => ({ row, grain: "SKU" as KpiGrain, label: row.sku })),
      ...metricRows
        .filter((row) => compact(row.channel) !== "total" && (!compact(row.sku) || compact(row.sku) === "total"))
        .map((row) => ({ row, grain: "CANAL" as KpiGrain, label: row.channel })),
    ];

    for (const { row, grain, label } of rowsToFact) {
      const periods = bisFactPeriods(row);
      for (const { period, year, current, prior } of periods) {
      const isRatio = definition.unit === "ratio";
      const normalizedCurrent = isRatio && current !== undefined ? normalizeRatio(current) : current;
      const normalizedPrior = isRatio && prior !== undefined ? normalizeRatio(prior) : prior;

      // Para YTD, usar la variación calculada que viene del archivo (más precisa)
      let variationPct: number | undefined;
      if (period === "YTD" && totalRow.ytdVarPct !== undefined) {
        variationPct = totalRow.ytdVarPct;
      } else {
        variationPct = bisVarPct(normalizedCurrent, normalizedPrior);
      }

      facts.push({
        key: definition.semanticKey,
        label,
        period,
        year,
        value: normalizedCurrent,
        priorValue: normalizedPrior,
        variationPct,
        unit: definition.unit as CommercialKpiFact["unit"],
        grain,
        sourceSheet: sheetName,
        module: definition.area,
        isAvailable: normalizedCurrent !== undefined,
        unavailableReason: normalizedCurrent === undefined
          ? `El archivo BIS no contiene datos para ${definition.label} en el período ${period}.`
          : undefined,
      });
      }
    }
  }

  // ── Derivar Passthrough desde Sell-in / Sell-out si no existe explícitamente ──
  const DERIVED_PERIODS: CommercialKpiFact["period"][] = ["YTD", "QTD", "U6M", "MA"];
  for (const p of DERIVED_PERIODS) {
    const hasPT = facts.some((f) => f.key === "passthrough" && f.period === p && f.isAvailable);
    if (hasPT) continue;

    const siF = facts.find((f) => f.key === "sellInVolume" && f.period === p && f.isAvailable);
    const soF = facts.find((f) => f.key === "sellOutVolume" && f.period === p && f.isAvailable);
    if (!siF?.value || siF.value === 0 || !soF?.value) continue;

    const ptValue = soF.value / siF.value;
    const ptPrior =
      siF.priorValue && soF.priorValue && siF.priorValue > 0
        ? soF.priorValue / siF.priorValue
        : undefined;
    // Variación en puntos porcentuales (ej. de 63,5% a 65,9% = +2,4pp)
    const varPpt = ptPrior !== undefined ? Math.round((ptValue - ptPrior) * 1000) / 10 : undefined;

    const derivedFact: CommercialKpiFact = {
      key: "passthrough",
      label: "Passthrough",
      period: p,
      year: YEAR,
      value: ptValue,
      priorValue: ptPrior,
      variationPct: varPpt,
      unit: "pct",
      grain: "TOTAL" as KpiGrain,
      sourceSheet: sheetName,
      module: "sales",
      isAvailable: true,
    };

    // Reemplazar fact unavailable existente o agregar
    const idx = facts.findIndex((f) => f.key === "passthrough" && f.period === p && !f.isAvailable);
    if (idx >= 0) {
      facts[idx] = derivedFact;
    } else {
      facts.push(derivedFact);
    }
  }

  return facts;
}

function excelSerialToMonth(value: unknown): string | undefined {
  if (typeof value === "string" && /^\d{4}-\d{2}$/.test(value.trim())) return value.trim();
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const epoch = Date.UTC(1899, 11, 30);
  const date = new Date(epoch + value * 24 * 60 * 60 * 1000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function buildSellThroughMonthly(rows: MatrixRow[]): SellThroughMonthlyPoint[] {
  const byMonth = new Map<string, SellThroughMonthlyPoint>();

  const performanceHeader = rows.findIndex((row) =>
    compact(row[1]) === "sellin" && compact(row[4]) === "sellout" && compact(row[8]) === "passthrough"
  );
  if (performanceHeader >= 0) {
    for (const row of rows.slice(performanceHeader + 2)) {
      const month = excelSerialToMonth(row[0]);
      if (!month) break;
      byMonth.set(month, {
        ...(byMonth.get(month) ?? { month }),
        sellIn: toNumber(row[2]),
        sellOut: toNumber(row[5]),
        passthrough: normalizeRatio(row[8]),
      });
    }
  }

  const evolutionHeader = rows.findIndex((row) =>
    compact(row[0]) === "mes" && compact(row[1]).includes("evolucionfacturacion") && compact(row[3]).includes("evolucionvolumen")
  );
  if (evolutionHeader >= 0) {
    for (const row of rows.slice(evolutionHeader + 1)) {
      const month = text(row[0]);
      if (!/^\d{4}-\d{2}$/.test(month)) break;
      byMonth.set(month, {
        ...(byMonth.get(month) ?? { month }),
        netRevenue: toNumber(row[1]),
        volume: toNumber(row[3]),
      });
    }
  }

  return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
}

function buildFinanceMonthly(rows: MatrixRow[]): FinanceMonthlyPoint[] {
  const start = rows.findIndex((row) => compact(row[0]) === "mes" && compact(row[1]) === "grossrevenue");
  if (start < 0) return [];
  const result: FinanceMonthlyPoint[] = [];

  for (const row of rows.slice(start + 1)) {
    const month = text(row[0]);
    if (!/^\d{4}-\d{2}$/.test(month)) break;
    result.push({
      month,
      grossRevenue: toNumber(row[1]),
      tradeSpend: toNumber(row[2]),
      netRevenue: toNumber(row[3]),
      cogs: toNumber(row[4]),
      grossProfit: toNumber(row[5]),
      ga: toNumber(row[6]),
      structuralExpenses: toNumber(row[7]),
      ebitda: toNumber(row[8]),
      grossMarginPct: normalizeRatio(row[9]),
      cogsPct: normalizeRatio(row[10]),
      ebitdaPct: normalizeRatio(row[11]),
    });
  }

  return result.sort((a, b) => a.month.localeCompare(b.month));
}

function buildFinanceHeadcount(rows: MatrixRow[]): FinanceHeadcountFact[] {
  const start = rows.findIndex((row) => compact(row[0]) === "headcountxarea");
  if (start < 0) return [];
  const result: FinanceHeadcountFact[] = [];

  for (const row of rows.slice(start + 2)) {
    const area = text(row[0]);
    if (!area) break;
    if (compact(area).includes("gastosestructura")) break;
    const periods: { period: KpiFactPeriod; current: unknown; prior: unknown; variation: unknown; variationAbs: unknown }[] = [
      { period: "YTD", current: row[3], prior: row[2], variation: row[20], variationAbs: row[24] },
      { period: "MA", current: row[10], prior: row[9], variation: row[17], variationAbs: row[21] },
      { period: "QTD", current: row[12], prior: row[11], variation: row[18], variationAbs: row[22] },
      { period: "U6M", current: row[14], prior: row[13], variation: row[19], variationAbs: row[23] },
    ];
    for (const item of periods) {
      result.push({
        area,
        period: item.period,
        year: 2026,
        value: toNumber(item.current),
        priorValue: toNumber(item.prior),
        variationPct: normalizeVarPct(item.variation),
        variationAbs: toNumber(item.variationAbs),
      });
    }
  }

  return result;
}

function buildFinanceSummaryFacts(rows: MatrixRow[], sheetName: string): CommercialKpiFact[] {
  const facts: CommercialKpiFact[] = [];
  const metricRows = rows.filter((row) => {
    const definition = kpiDefinition(text(row[0]));
    return Boolean(definition) && ["diascobro", "diasatraso", "montofacturausd", "montocobradousd", "saldoabiertousd"].includes(compact(row[0]));
  });

  for (const row of metricRows) {
    const definition = kpiDefinition(text(row[0]));
    if (!definition) continue;
    const periods: { period: KpiFactPeriod; current: unknown; prior: unknown; variation: unknown }[] = [
      { period: "YTD", current: row[3], prior: row[2], variation: row[4] },
      { period: "MA", current: row[10], prior: row[9], variation: row[17] },
      { period: "QTD", current: row[12], prior: row[11], variation: row[18] },
      { period: "U6M", current: row[14], prior: row[13], variation: row[19] },
    ];
    for (const item of periods) {
      const current = toNumber(item.current);
      facts.push({
        key: definition.semanticKey,
        label: definition.label,
        period: item.period,
        year: 2026,
        value: current,
        priorValue: toNumber(item.prior),
        variationPct: normalizeVarPct(item.variation),
        unit: definition.unit,
        grain: "TOTAL",
        sourceSheet: sheetName,
        module: "finance",
        isAvailable: current !== undefined,
        unavailableReason: current === undefined ? `Finanzas BIS no contiene ${definition.label} para ${item.period}.` : undefined,
      });
    }
    facts.push({
      key: definition.semanticKey,
      label: definition.label,
      period: "MTD",
      year: 2026,
      unit: definition.unit,
      grain: "TOTAL",
      sourceSheet: sheetName,
      module: "finance",
      isAvailable: false,
      unavailableReason: "Finanzas BIS no trae MTD para este indicador.",
    });
  }

  return facts;
}

export function processResumenDemoAppWorkbook(options: ProcessResumenDemoOptions): ProcessedDataset {
  const { workbook, XLSX } = options;
  const sourceSheets = workbook.SheetNames.filter((name) =>
    ["ventas", "sellthrough", "finanzas"].some((required) => sheetKey(name).includes(required))
  );
  const primarySheet = findResumenSheet(workbook.SheetNames) ?? workbook.SheetNames[0];
  const sellThroughBisSheet = findSheetByPatterns(workbook.SheetNames, ["sellthroughbis", "sellthroughwizz", "sellthroughresumen"]);
  const financeBisSheet = findSheetByPatterns(workbook.SheetNames, ["finanzasbis", "finanzaswizz", "finanzasresumen"]);
  const rows = matrixForSheet(XLSX, workbook, primarySheet);
  const sellThroughRows = sellThroughBisSheet ? matrixForSheet(XLSX, workbook, sellThroughBisSheet) : [];
  const financeRows = financeBisSheet ? matrixForSheet(XLSX, workbook, financeBisSheet) : [];
  const ignoredBlocks: string[] = [];
  const warnings: string[] = [];
  const canonical = canonicalRows(rows, ignoredBlocks);
  const sellThroughCanonical = sellThroughBisSheet ? canonicalRows(sellThroughRows, ignoredBlocks) : [];
  const financeCanonical = financeBisSheet ? canonicalRows(financeRows, ignoredBlocks) : [];
  const kpiSources: Record<string, string> = {};
  const salesKpis = buildKpis(canonical, kpiSources, warnings);
  const kpiFacts = [
    ...buildKpiFacts(canonical, primarySheet),
    ...buildKpiFacts(sellThroughCanonical, sellThroughBisSheet ?? primarySheet),
    ...buildKpiFacts(financeCanonical, financeBisSheet ?? primarySheet),
    ...buildFinanceSummaryFacts(financeRows, financeBisSheet ?? primarySheet),
  ];
  const sellThroughMonthly = buildSellThroughMonthly(sellThroughRows);
  const financeMonthly = buildFinanceMonthly(financeRows);
  const financeHeadcount = buildFinanceHeadcount(financeRows);
  const normalized = buildNormalizedData(canonical);
  const processedSheets = workbook.SheetNames.map((name) => processedSheet(
    XLSX,
    workbook,
    name,
    name === primarySheet ? ["Canal", "SKU", "KPI", "YTD 25", "YTD 26", "YTD 26 vs YTD 25 %", "MA", "Q1", "U6M"] : []
  ));
  const mapping = buildMappings(primarySheet, canonical);
  const detectedKpis = [...new Set(Object.values(KPI_DEFINITIONS).map((definition) => definition.label))]
    .filter((label) => canonical.some((row) => kpiDefinition(row.metric)?.label === label));
  const semanticProfile = buildSemanticDatasetProfile(primarySheet, sourceSheets, canonical, warnings);

  if (canonical.length === 0) {
    warnings.push("Resumen Demo App: no se encontró una tabla consumible con columnas Canal, SKU y KPI en Ventas Bis.");
  }
  if (ignoredBlocks.length === 0) {
    ignoredBlocks.push("Se ignoraron filas vacías, marcas X, notas Quitar y bloques sin patrón métrica/período/valor.");
  }

  return {
    id: `dataset-${generateId()}`,
    fileName: options.fileName,
    fileSize: options.fileSize,
    uploadedAt: new Date().toISOString(),
    sheets: processedSheets,
    salesKpis,
    salesTables: {
      sellIn: rawRowsForMetric(canonical, "sellincajas").slice(0, 500),
      sellOut: rawRowsForMetric(canonical, "selloutcajas").slice(0, 500),
      products: normalized.products.map((product) => ({ ...product })).slice(0, 500),
      directClients: normalized.directClients.map((client) => ({ ...client })).slice(0, 500),
      indirectClients: [],
    },
    salesData: {
      sellInRows: normalized.sellInRows,
      sellOutRows: normalized.sellOutRows,
      products: normalized.products,
      directClients: normalized.directClients,
      indirectClients: [],
    },
    availableFilters: {
      months: normalized.availableMonths,
      skus: normalized.products.map((product) => ({ id: product.id, name: product.displayName ?? product.name })),
      channels: normalized.directClients.map((client) => client.channel ?? client.name).filter(Boolean).sort(),
      clients: normalized.directClients.map((client) => ({ id: client.id, name: client.name })),
    },
    kpiFacts,
    sellThroughMonthly,
    financeMonthly,
    financeHeadcount,
    mapping,
    semanticProfile,
    metadata: {
      sourceFormat: "resumen-demo-app",
      sourceSheets,
      primarySheet,
      ignoredBlocks,
      detectedKpis,
      warnings,
      kpiSources,
    },
    validation: {
      warnings,
      errors: [],
      sheetsFound: sourceSheets,
      sheetsMissing: [],
      columnMappings: mapping,
    },
  };
}

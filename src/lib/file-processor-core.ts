import type {
  ColumnMapping,
  NormalizedClient,
  NormalizedPdv,
  NormalizedProduct,
  NormalizedSellInRow,
  NormalizedSellOutRow,
  ProcessedDataset,
  ProcessedSheet,
  SalesKpis,
  SheetDomain,
} from "@/types/dataset";
import type { WorkBook } from "xlsx";
import { calculateSalesKpis } from "@/lib/calculate-sales-kpis";
import {
  buildSemanticProfile,
  detectSemanticMappings,
  detectSheetDomainSemantic,
  enrichProcessedSheetsWithSemantics,
  normalizeSemanticText,
  semanticKeyForNexusField,
  type RawSheetProfile,
} from "@/lib/semantic-commercial-engine";
import { isResumenDemoAppWorkbook, processResumenDemoAppWorkbook } from "@/lib/file-processors/resumen-demo-app-adapter";
import { isPdvGeoWorkbook, processPdvGeoWorkbook } from "@/lib/file-processors/pdv-geo-adapter";
import { generateId } from "./utils";

type RawRow = Record<string, unknown>;
type XlsxModule = typeof import("xlsx");

export type FileProcessorProgress = {
  step: number;
  label?: string;
};

type ProcessFileBufferOptions = {
  fileName: string;
  fileSize: number;
  buffer: ArrayBuffer;
  mapping?: ColumnMapping[];
  onProgress?: (progress: FileProcessorProgress) => void;
};

export const NEXUS_FIELD_OPTIONS = [
  { value: "Ignorar", label: "Ignorar" },
  { value: "Mes", label: "Mes" },
  { value: "SKU ID", label: "SKU ID" },
  { value: "SKU Nombre", label: "SKU Nombre" },
  { value: "Marca", label: "Marca" },
  { value: "Formato", label: "Formato" },
  { value: "Cliente ID", label: "Cliente ID" },
  { value: "Cliente Nombre", label: "Cliente Nombre" },
  { value: "Canal", label: "Canal" },
  { value: "Volumen Sell-in", label: "Volumen Sell-in" },
  { value: "Volumen Sell-out", label: "Volumen Sell-out" },
  { value: "Net Revenue", label: "Net Revenue" },
  { value: "Gross Revenue", label: "Gross Revenue" },
  { value: "Price Index", label: "Price Index" },
  { value: "ASP", label: "ASP" },
  { value: "EBITDA", label: "EBITDA" },
  { value: "Gross Margin", label: "Gross Margin" },
  { value: "COGS", label: "COGS" },
  { value: "Opex", label: "Opex" },
  { value: "Trade Spend", label: "Trade Spend" },
  { value: "Passthrough", label: "Passthrough" },
  { value: "Distribución numérica", label: "Distribución numérica" },
  { value: "Inventory", label: "Inventory" },
  { value: "Fill Rate", label: "Fill Rate" },
  { value: "OTIF", label: "OTIF" },
  { value: "DSO", label: "DSO" },
  { value: "PDV ID", label: "PDV ID" },
  { value: "PDV Nombre", label: "PDV Nombre" },
  { value: "Zona", label: "Zona" },
  { value: "Latitud", label: "Latitud" },
  { value: "Longitud", label: "Longitud" },
  { value: "Distribuidor ID", label: "Distribuidor ID" },
  { value: "Factura ID", label: "Factura ID" },
  { value: "Cuenta contable", label: "Cuenta contable" },
];

const PRIORITY_SHEETS = [
  "KPIs_Calculados",
  "Fact_Ventas_Sell_In",
  "Fact_Ventas_Sell_Out_y_Precios",
  "Dim_Productos",
  "Dim_Clientes_Directos",
  "Dim_Clientes_Indirectos",
  "Control_Objetivos_Mensual",
];

const SHEET_ALIASES: Record<string, string[]> = {
  sellIn: ["Fact_Ventas_Sell_In", "Ventas Sell In", "Sell In", "sell_in", "SellIn", "Fact Ventas Sell In"],
  sellOut: ["Fact_Ventas_Sell_Out_y_Precios", "Ventas Sell Out", "Sell Out", "sell_out", "SellOut", "Fact Ventas Sell Out"],
  products: ["Dim_Productos", "Productos", "Products", "SKU", "Dim Productos"],
  directClients: ["Dim_Clientes_Directos", "Clientes Directos", "Direct Clients", "Clientes Dir"],
  indirectClients: ["Dim_Clientes_Indirectos", "PDVs", "Clientes Indirectos", "Indirect Clients"],
  control: ["Control_Objetivos_Mensual", "Control Objetivos", "Objetivos Mensual"],
  kpis: ["KPIs_Calculados", "KPIs Calculados", "KPIs", "Kpis", "kpis_calculados"],
};

const COLUMN_ALIASES: Record<string, string[]> = {
  month: ["Mes", "month", "Periodo", "Periodo_Mes", "Fecha", "Date", "Mes_Anio", "MesAnio"],
  skuId: ["ID_SKU", "SKU_ID", "SKU", "idSku", "Sku", "ID_Sku", "Sku_Id"],
  skuName: ["SKU_Nombre", "Nombre_SKU", "Producto", "Nombre_Producto", "Descripcion_SKU", "SKU Name"],
  sellInVolume: ["Volumen_Cajas", "Sell_In_Cajas", "SellIn_Cajas", "SellIn", "Vol_Cajas_In", "Cajas_Sell_In", "Cajas", "Vol_SI", "Volumen"],
  sellOutVolume: ["Vol_Cajas_Out", "Sell_Out_Cajas", "SellOut_Cajas", "SellOut", "Cajas_Sell_Out", "Vol_SO", "Volumen_SO", "Cajas_SO"],
  netRevenue: ["Net_Revenue", "Net Revenue", "Net_Revenue_USD", "Revenue_Neto", "Venta_Neta", "NR", "NetRev", "Revenue"],
  grossRevenue: ["Gross_Revenue", "Gross Revenue", "Venta_Bruta", "Revenue_Bruto"],
  ebitda: ["EBITDA", "EBITDA_USD", "Monto_EBITDA", "EBITDA_Proxy", "Ebitda", "ebitda"],
  grossMargin: ["Gross_Margin", "Gross_Margin_%", "Gross Margin", "Gross Profit", "Margen_Bruto", "Gross_Margin_Pct"],
  cogs: ["COGS", "COGS_%", "COGS_Pct", "Costo_Venta", "Costo_de_Ventas"],
  opex: ["Opex", "Gasto_Total_USD", "Gastos_Estructura", "G&A", "GA"],
  tradeSpend: ["Trade Spend", "Trade_Spend", "Descuentos_Trade", "Inversion_Trade"],
  brand: ["Marca", "Brand", "Familia_Marca", "Nombre_Marca"],
  format: ["Formato", "Format", "Presentacion", "Empaque", "Tamano", "Tamaño", "Size"],
  directClientId: ["ID_Cliente_Dir", "Cliente_ID", "ID_Cliente", "ID_Distribuidor", "ID_Dist", "ID_Distribuidor_Padre"],
  clientName: ["Cliente", "Nombre_Cliente", "Cliente_Nombre", "Razon_Social", "Distribuidor", "Nombre_Distribuidor"],
  channel: ["Canal", "Channel", "Canal_Comercial", "Tipo_Canal"],
  pdvId: ["ID_PDV", "PDV_ID", "ID_Pdv", "PDV", "Pdv_Id", "ID_PDV_o_Cliente"],
  pdvName: ["PDV", "Nombre_PDV", "Punto_de_Venta", "Nombre_Punto_de_Venta"],
  priceIndex: ["Price_Index", "Indice_Precio", "PriceIndex", "Price Index", "Idx_Precio"],
  passthrough: ["Passthrough", "PassThrough_%", "PassThrough_Pct", "Passthrough_Pct", "PassThrough_%"],
  numericDistribution: ["DN_Efectiva_Pct", "Distribucion_Numerica_Pct", "Distribucion_Numerica_Pct", "PDV_Con_SKU", "PDV_Universo"],
  asp: ["ASP", "ASP_USD_x_Caja", "Precio_Gondola_Real", "Precio_Lista_Sugerido", "Precio_Promedio"],
  kpiName: ["Nombre_KPI", "KPI", "KPI_Name", "Nombre", "nombre_kpi", "Indicador", "Metrica"],
  actual: ["Actual", "Valor_Actual", "Valor", "Value", "actual", "Realizado", "Real"],
  varPct: ["Var_%", "Var_Pct", "Variacion_%", "variation_pct", "var_pct", "Var%", "Delta_%"],
};

const FIELD_TO_CANONICAL: Record<string, string> = {
  Mes: "month",
  "SKU ID": "skuId",
  "SKU Nombre": "skuName",
  Marca: "brand",
  Formato: "format",
  "Cliente ID": "directClientId",
  "Cliente Nombre": "clientName",
  Canal: "channel",
  "Volumen Sell-in": "sellInVolume",
  "Volumen Sell-out": "sellOutVolume",
  "Net Revenue": "netRevenue",
  "Gross Revenue": "grossRevenue",
  "Price Index": "priceIndex",
  ASP: "asp",
  EBITDA: "ebitda",
  "Gross Margin": "grossMargin",
  COGS: "cogs",
  Opex: "opex",
  "Trade Spend": "tradeSpend",
  Passthrough: "passthrough",
  "Distribución numérica": "numericDistribution",
  "PDV ID": "pdvId",
  "PDV Nombre": "pdvName",
  "Distribuidor ID": "directClientId",
  "Factura ID": "invoiceId",
  "Cuenta contable": "account",
};

/** Spanish and English month abbreviations for text-based date parsing */
const MONTH_MAP_ES: Record<string, number> = {
  ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6,
  jul: 7, ago: 8, sep: 9, oct: 10, nov: 11, dic: 12,
};
const MONTH_MAP_EN: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const columnLookupCache = new Map<string, string | undefined>();

function emit(onProgress: ProcessFileBufferOptions["onProgress"], step: number, label?: string) {
  onProgress?.({ step, label });
}

export function normalizeKey(value: string): string {
  return normalizeSemanticText(value).replace(/[^a-z0-9]/g, "");
}

export function parseNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value === null || value === undefined || value === "") return 0;
  let s = String(value).trim().replace(/USD\s*/gi, "").replace(/[$€£R\$]/g, "");
  const isPct = s.endsWith("%");
  if (isPct) s = s.slice(0, -1).trim();
  const dots = (s.match(/\./g) ?? []).length;
  const commas = (s.match(/,/g) ?? []).length;
  if (dots > 1) s = s.replace(/\./g, "").replace(",", ".");
  else if (commas > 1) s = s.replace(/,/g, "");
  else if (dots === 1 && commas === 1) s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  else if (commas === 1) s = (s.split(",")[1] ?? "").length === 3 ? s.replace(",", "") : s.replace(",", ".");
  else if (dots === 1 && (s.split(".")[1] ?? "").length === 3) s = s.replace(".", "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function toVarPct(raw: number): number {
  return Math.abs(raw) > 1.5 ? Math.round(raw * 10) / 10 : Math.round(raw * 1000) / 10;
}

function toPassthroughRatio(raw: number): number {
  return raw > 1.5 ? raw / 100 : raw;
}

function findSheetName(sheetNames: string[], aliases: string[]): string | undefined {
  const normalizedAliases = aliases.map(normalizeKey);
  return sheetNames.find((name) => normalizedAliases.includes(normalizeKey(name)));
}

function findColumnName(headers: string[], canonicalKey: string, sheetName: string, mapping?: ColumnMapping[]): string | undefined {
  const cacheKey = `${sheetName}|${canonicalKey}|${headers.join("¦")}|${(mapping ?? []).filter((m) => m.sheet === sheetName).map((m) => `${m.fileColumn}:${m.nexusField}:${m.semanticKey ?? ""}`).join("¦")}`;
  if (columnLookupCache.has(cacheKey)) return columnLookupCache.get(cacheKey);
  const mapped = mapping?.find((m) => {
    const mappedKey = m.semanticKey ?? FIELD_TO_CANONICAL[m.nexusField] ?? semanticKeyForNexusField(m.nexusField);
    return m.sheet === sheetName && mappedKey === canonicalKey;
  });
  if (mapped && headers.includes(mapped.fileColumn)) {
    columnLookupCache.set(cacheKey, mapped.fileColumn);
    return mapped.fileColumn;
  }
  const semanticMapped = detectSemanticMappings(headers, sheetName).find((m) => m.semanticKey === canonicalKey);
  if (semanticMapped && headers.includes(semanticMapped.fileColumn)) {
    columnLookupCache.set(cacheKey, semanticMapped.fileColumn);
    return semanticMapped.fileColumn;
  }
  const aliases = COLUMN_ALIASES[canonicalKey] ?? [];
  const normalizedAliases = aliases.map(normalizeKey);
  const found = headers.find((h) => normalizedAliases.includes(normalizeKey(h)));
  columnLookupCache.set(cacheKey, found);
  return found;
}

function value(row: RawRow, canonicalKey: string, sheetName: string, mapping?: ColumnMapping[]): unknown {
  const headers = Object.keys(row).filter((h) => !h.startsWith("__EMPTY"));
  const column = findColumnName(headers, canonicalKey, sheetName, mapping);
  return column ? row[column] : undefined;
}

function detectSheetDomain(name: string): SheetDomain {
  const n = normalizeKey(name);
  if (n.includes("sellout") || n.includes("sellin") || n.includes("ventas") || n.includes("venta")) return "sales";
  if (n.includes("ebitda") || n.includes("revenue") || n.includes("pl") || n.includes("finanz") || n.includes("pnl")) return "finance";
  if (n.includes("trade") || n.includes("pdv") || n.includes("ejecucion")) return "trade";
  if (n.includes("supply") || n.includes("inventario") || n.includes("stock")) return "supply";
  if (n.includes("rgm") || n.includes("price") || n.includes("precio") || n.includes("asp")) return "rgm";
  if (n.includes("budget") || n.includes("forecast") || n.includes("plan")) return "planning";
  if (n.includes("crm") || n.includes("factura") || n.includes("cobro")) return "crm";
  if (n.includes("dim") || n.includes("producto") || n.includes("cliente") || n.includes("sku")) return "dimension";
  if (n.includes("control") || n.includes("objetivo") || n.includes("kpi")) return "control";
  return "unknown";
}

function isPrioritySheet(name: string): boolean {
  const normalized = normalizeKey(name);
  return PRIORITY_SHEETS.some((sheet) => normalizeKey(sheet) === normalized);
}

function sheetRows(XLSX: XlsxModule, workbook: WorkBook, sheetName: string, headerRowIndex = 0): RawRow[] {
  return XLSX.utils.sheet_to_json<RawRow>(workbook.Sheets[sheetName], { defval: "", range: headerRowIndex });
}

function detectHeaderRow(rows: unknown[][]): number {
  let best = 0;
  let bestScore = -1;
  rows.slice(0, 20).forEach((row, index) => {
    const cells = row.map((cell) => String(cell ?? "").trim()).filter(Boolean);
    const uniqueCells = new Set(cells.map(normalizeKey)).size;
    const semanticHits = detectSemanticMappings(cells, "").length;
    const textCells = cells.filter((cell) => Number.isNaN(Number(cell))).length;
    const score = semanticHits * 4 + uniqueCells + textCells * 0.25;
    if (cells.length >= 2 && score > bestScore) {
      best = index;
      bestScore = score;
    }
  });
  return best;
}

function sheetProfile(XLSX: XlsxModule, workbook: WorkBook, name: string): RawSheetProfile {
  try {
    const sheet = workbook.Sheets[name];
    const range = sheet["!ref"] ? XLSX.utils.decode_range(sheet["!ref"]) : null;
    const rows = range ? Math.max(0, range.e.r - range.s.r) : 0;
    const headerRows: unknown[][] = [];
    if (range) {
      const maxRow = Math.min(range.e.r, range.s.r + 24);
      for (let r = range.s.r; r <= maxRow; r++) {
        const row: unknown[] = [];
        for (let c = range.s.c; c <= range.e.c; c++) {
          const cell = sheet[XLSX.utils.encode_cell({ r, c })];
          row.push(cell?.v ?? "");
        }
        headerRows.push(row);
      }
    }
    const headerRowIndex = detectHeaderRow(headerRows);
    const columns = (headerRows[headerRowIndex] ?? [])
      .map((column) => String(column).trim())
      .filter((c) => c && !c.startsWith("__EMPTY") && !c.startsWith("__empty"));
    return { name, rows, columns, headerRowIndex };
  } catch {
    return { name, rows: 0, columns: [], headerRowIndex: 0 };
  }
}

function sheetMeta(profile: RawSheetProfile): ProcessedSheet {
  try {
    return {
      name: profile.name,
      rows: profile.rows,
      columns: profile.columns,
      domain: detectSheetDomainSemantic(profile.name, profile.columns) ?? detectSheetDomain(profile.name),
      status: "processed",
    };
  } catch {
    return { name: profile.name, rows: 0, columns: [], domain: "unknown", status: "error" };
  }
}

function addMapping(mappings: ColumnMapping[], fileColumn: string | undefined, nexusField: string, sheet: string) {
  if (!fileColumn) return;
  if (mappings.some((m) => m.fileColumn === fileColumn && m.nexusField === nexusField && m.sheet === sheet)) return;
  mappings.push({ fileColumn, nexusField, sheet, semanticKey: semanticKeyForNexusField(nexusField) });
}

/**
 * Checks whether a set of column headers matches the "kpiName + actual + varPct" pattern.
 * Used to detect objectives/variations sheets regardless of their name.
 */
function isObjectivesSheet(headers: string[]): boolean {
  const normalizedHeaders = headers.map(normalizeKey);
  const hasKpiName = normalizedHeaders.some((h) =>
    COLUMN_ALIASES.kpiName?.map(normalizeKey).includes(h)
  );
  const hasActual = normalizedHeaders.some((h) =>
    COLUMN_ALIASES.actual?.map(normalizeKey).includes(h)
  );
  const hasVar = normalizedHeaders.some((h) =>
    COLUMN_ALIASES.varPct?.map(normalizeKey).includes(h)
  );
  return hasKpiName && hasActual && hasVar;
}

function readKpis(rows: RawRow[], warnings: string[], sheetName: string, mapping?: ColumnMapping[]): { kpis: Partial<SalesKpis>; mappings: ColumnMapping[] } {
  const headers = (rows[0] ? Object.keys(rows[0]) : []).filter((h) => h && !h.startsWith("__EMPTY"));
  const kpis: Partial<SalesKpis> = {};
  const mappings: ColumnMapping[] = [];
  const nameCol = findColumnName(headers, "kpiName", sheetName, mapping);
  const actualCol = findColumnName(headers, "actual", sheetName, mapping);
  const varPctCol = findColumnName(headers, "varPct", sheetName, mapping);
  if (!nameCol || !actualCol) {
    if (rows.length > 0) warnings.push(`${sheetName}: no se encontraron columnas Nombre_KPI/Actual`);
    return { kpis, mappings };
  }
  addMapping(mappings, nameCol, "Ignorar", sheetName);
  addMapping(mappings, actualCol, "Ignorar", sheetName);
  addMapping(mappings, varPctCol, "Ignorar", sheetName);

  for (const row of rows) {
    const key = normalizeKey(String(row[nameCol] ?? ""));
    const actual = parseNumber(row[actualCol]);
    const rawVar = varPctCol ? parseNumber(row[varPctCol]) : undefined;
    const varPct = rawVar !== undefined ? toVarPct(rawVar) : undefined;
    if (!key) continue;
    if (key.includes("sellin") && !key.includes("sellout")) {
      kpis.sellInYtd = actual;
      if (varPct !== undefined) kpis.sellInVarPct = varPct;
    } else if (key.includes("sellout")) {
      kpis.sellOutYtd = actual;
      if (varPct !== undefined) kpis.sellOutVarPct = varPct;
    } else if ((key.includes("net") && key.includes("revenue")) || key.includes("ventaneta")) {
      kpis.netRevenueYtd = actual;
      if (varPct !== undefined) kpis.netRevenueVarPct = varPct;
    } else if (key.includes("ebitda")) {
      kpis.ebitdaYtd = actual;
      if (varPct !== undefined) kpis.ebitdaVarPct = varPct;
    } else if (key.includes("passthrough") || key.includes("passtrough")) {
      kpis.passthrough = toPassthroughRatio(actual);
      if (varPct !== undefined) kpis.passthroughVarPct = varPct;
    } else if (key.includes("priceindex") || key.includes("indiceprecio")) {
      kpis.priceIndexAvg = actual;
      if (varPct !== undefined) kpis.priceIndexVarPct = varPct;
    }
  }
  return { kpis, mappings };
}

function readMetricTableKpis(rows: RawRow[], sheetName: string, mapping?: ColumnMapping[]): { kpis: Partial<SalesKpis>; mappings: ColumnMapping[] } {
  const headers = (rows[0] ? Object.keys(rows[0]) : []).filter((h) => h && !h.startsWith("__EMPTY"));
  const mappings = detectSemanticMappings(headers, sheetName, mapping);
  const kpis: Partial<SalesKpis> = {};
  const monthCol = findColumnName(headers, "month", sheetName, mapping);

  // Detect the latest year from data so YTD is always relative to actual dataset range
  const allMonths = monthCol
    ? rows.map((row) => normalizeMonth(row[monthCol])).filter((m): m is string => Boolean(m))
    : [];
  const latestYear = allMonths.reduce((max, m) => {
    const y = parseInt(m.substring(0, 4), 10);
    return Number.isFinite(y) ? Math.max(max, y) : max;
  }, 0);

  const ytdRows = monthCol && latestYear > 0
    ? rows.filter((row) => {
        const month = normalizeMonth(row[monthCol]);
        return month?.startsWith(String(latestYear));
      })
    : rows;

  const sumByKey = (key: string): number | undefined => {
    const column = findColumnName(headers, key, sheetName, mapping);
    if (!column) return undefined;
    const total = ytdRows.reduce((sum, row) => sum + parseNumber(row[column]), 0);
    return total !== 0 ? total : undefined;
  };
  const avgByKey = (key: string): number | undefined => {
    const column = findColumnName(headers, key, sheetName, mapping);
    if (!column) return undefined;
    const values = ytdRows.map((row) => parseNumber(row[column])).filter((value) => value !== 0);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined;
  };

  kpis.sellInYtd = sumByKey("sellInVolume");
  kpis.sellOutYtd = sumByKey("sellOutVolume");
  kpis.netRevenueYtd = sumByKey("netRevenue");
  kpis.ebitdaYtd = sumByKey("ebitda");
  kpis.priceIndexAvg = avgByKey("priceIndex");
  kpis.passthrough = avgByKey("passthrough");
  return { kpis, mappings };
}

/**
 * Robust month normalization. Returns YYYY-MM string or undefined.
 * Handles: Date objects, ISO strings (2025-01), reversed (01/2025),
 * Spanish text ("Ene-25", "ene 25"), English text ("Jan-25", "jan 25").
 */
export function normalizeMonth(raw: unknown): string | undefined {
  if (raw === null || raw === undefined || raw === "") return undefined;
  if (raw instanceof Date) {
    if (!Number.isFinite(raw.getTime())) return undefined;
    return `${raw.getFullYear()}-${String(raw.getMonth() + 1).padStart(2, "0")}`;
  }
  const text = String(raw).trim();
  if (!text) return undefined;

  // Already YYYY-MM (most common from caso1.xlsx)
  const iso = text.match(/^(20\d{2})[-/](\d{1,2})$/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}`;

  // YYYY-MM-DD datetime string (truncate to month)
  const isoLong = text.match(/^(20\d{2})[-/](\d{1,2})[-/]\d/);
  if (isoLong) return `${isoLong[1]}-${isoLong[2].padStart(2, "0")}`;

  // Reversed: MM/YYYY or MM-YYYY
  const reversed = text.match(/^(\d{1,2})[-/](20\d{2})$/);
  if (reversed) return `${reversed[2]}-${reversed[1].padStart(2, "0")}`;

  // Text month: "Ene-25", "Jan 25", "ene25", "enero 2025", etc.
  const textMonth = text.match(/^([a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]{3,})[.\s\-_]?(\d{2,4})$/i);
  if (textMonth) {
    const abbr = textMonth[1]
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .substring(0, 3);
    const yearPart = textMonth[2];
    const year = yearPart.length === 2 ? `20${yearPart}` : yearPart;
    const month = MONTH_MAP_ES[abbr] ?? MONTH_MAP_EN[abbr];
    if (month) return `${year}-${String(month).padStart(2, "0")}`;
  }

  // Numeric only: YYYYMM (e.g. 202501)
  const compact6 = text.match(/^(20\d{2})(\d{2})$/);
  if (compact6) return `${compact6[1]}-${compact6[2]}`;

  // Already valid YYYY-MM that passed through
  if (/^\d{4}-\d{2}$/.test(text)) return text;

  return undefined; // Cannot parse — don't return garbage that would corrupt sorting
}

/**
 * Builds a display name for a product, preferring original data names over composed labels.
 * Only falls back to brand+format composition when no real name is available.
 */
function buildProductDisplayName(brand: string, format: string, skuName: string, id: string): string {
  // Always prefer the original name from the dataset
  if (skuName && skuName !== id) return skuName;
  // Fall back to composed name only when no descriptive name exists
  if (brand && format) return `${brand} ${format}`.trim();
  if (brand) return brand;
  if (format) return format;
  return id;
}

function normalizeProducts(rows: RawRow[], sheetName: string, mapping?: ColumnMapping[]): NormalizedProduct[] {
  const seen = new Map<string, NormalizedProduct>();
  for (const row of rows) {
    const id = String(value(row, "skuId", sheetName, mapping) ?? "").trim();
    if (!id) continue;
    const skuName = String(value(row, "skuName", sheetName, mapping) ?? "").trim();
    const brand = String(value(row, "brand", sheetName, mapping) ?? "").trim();
    const format = String(value(row, "format", sheetName, mapping) ?? "").trim();
    const category = String(value(row, "category", sheetName, mapping) ?? "").trim();
    const displayName = buildProductDisplayName(brand, format, skuName, id);
    seen.set(id, { id, name: skuName || id, displayName, brand: brand || undefined, format: format || undefined, category: category || undefined });
  }
  return [...seen.values()];
}

function normalizeClients(rows: RawRow[], sheetName: string, mapping?: ColumnMapping[]): NormalizedClient[] {
  const seen = new Map<string, NormalizedClient>();
  for (const row of rows) {
    const id = String(value(row, "directClientId", sheetName, mapping) ?? "").trim();
    if (!id) continue;
    seen.set(id, {
      id,
      name: String(value(row, "clientName", sheetName, mapping) ?? id).trim() || id,
      channel: String(value(row, "channel", sheetName, mapping) ?? "").trim() || undefined,
    });
  }
  return [...seen.values()];
}

function normalizePdvs(rows: RawRow[], sheetName: string, mapping?: ColumnMapping[]): NormalizedPdv[] {
  const seen = new Map<string, NormalizedPdv>();
  for (const row of rows) {
    const id = String(value(row, "pdvId", sheetName, mapping) ?? "").trim();
    if (!id) continue;
    seen.set(id, {
      id,
      clientId: String(value(row, "directClientId", sheetName, mapping) ?? "").trim() || undefined,
      name: String(value(row, "pdvName", sheetName, mapping) ?? id).trim() || id,
      channel: String(value(row, "channel", sheetName, mapping) ?? "").trim() || undefined,
    });
  }
  return [...seen.values()];
}

/**
 * Resolves the SKU display name. Prefers the product map (from dimension table),
 * then falls back to the fact table's raw name, then the ID.
 */
function resolveSkuName(skuId: string | undefined, productMap: Map<string, string>, rowSkuName: string): string | undefined {
  if (skuId && productMap.has(skuId)) return productMap.get(skuId);
  return rowSkuName || undefined;
}

function normalizeSellIn(rows: RawRow[], sheetName: string, products: Map<string, string>, clients: Map<string, NormalizedClient>, mapping?: ColumnMapping[]): NormalizedSellInRow[] {
  return rows.map((row) => {
    const skuId = String(value(row, "skuId", sheetName, mapping) ?? "").trim() || undefined;
    const clientId = String(value(row, "directClientId", sheetName, mapping) ?? "").trim() || undefined;
    const rowSkuName = String(value(row, "skuName", sheetName, mapping) ?? "").trim();
    return {
      month: normalizeMonth(value(row, "month", sheetName, mapping)),
      skuId,
      skuName: resolveSkuName(skuId, products, rowSkuName),
      clientId,
      clientName: String(value(row, "clientName", sheetName, mapping) ?? (clientId ? clients.get(clientId)?.name : "") ?? "").trim() || undefined,
      channel: String(value(row, "channel", sheetName, mapping) ?? (clientId ? clients.get(clientId)?.channel : "") ?? "").trim() || undefined,
      volumeCajas: parseNumber(value(row, "sellInVolume", sheetName, mapping)) || undefined,
      netRevenue: parseNumber(value(row, "netRevenue", sheetName, mapping)) || undefined,
      ebitda: parseNumber(value(row, "ebitda", sheetName, mapping)) || undefined,
    };
  });
}

function normalizeSellOut(rows: RawRow[], sheetName: string, products: Map<string, string>, clients: Map<string, NormalizedClient>, pdvs: Map<string, NormalizedPdv>, mapping?: ColumnMapping[]): NormalizedSellOutRow[] {
  return rows.map((row) => {
    const skuId = String(value(row, "skuId", sheetName, mapping) ?? "").trim() || undefined;
    const pdvId = String(value(row, "pdvId", sheetName, mapping) ?? "").trim() || undefined;
    const pdv = pdvId ? pdvs.get(pdvId) : undefined;
    const clientId = String(value(row, "directClientId", sheetName, mapping) ?? pdv?.clientId ?? "").trim() || undefined;
    const rowSkuName = String(value(row, "skuName", sheetName, mapping) ?? "").trim();
    return {
      month: normalizeMonth(value(row, "month", sheetName, mapping)),
      skuId,
      skuName: resolveSkuName(skuId, products, rowSkuName),
      pdvId,
      clientId,
      clientName: String(value(row, "clientName", sheetName, mapping) ?? (clientId ? clients.get(clientId)?.name : "") ?? "").trim() || undefined,
      channel: String(value(row, "channel", sheetName, mapping) ?? pdv?.channel ?? (clientId ? clients.get(clientId)?.channel : "") ?? "").trim() || undefined,
      volumeCajasOut: parseNumber(value(row, "sellOutVolume", sheetName, mapping)) || undefined,
      priceIndex: parseNumber(value(row, "priceIndex", sheetName, mapping)) || undefined,
    };
  });
}

function detectedMappings(rows: RawRow[], sheetName: string, fields: { key: string; label: string }[], mapping?: ColumnMapping[]): ColumnMapping[] {
  const headers = (rows[0] ? Object.keys(rows[0]) : []).filter((h) => h && !h.startsWith("__EMPTY"));
  const result: ColumnMapping[] = [];
  for (const field of fields) addMapping(result, findColumnName(headers, field.key, sheetName, mapping), field.label, sheetName);
  for (const semanticMapping of detectSemanticMappings(headers, sheetName, mapping)) {
    addMapping(result, semanticMapping.fileColumn, semanticMapping.nexusField, sheetName);
  }
  return result;
}

/**
 * Returns true if the semantic profile has entity columns (SKU / client / PDV) for this table.
 * Used to prefer granular fact tables over aggregate summary tables when detecting sell-in/sell-out sheets.
 */
function tableHasEntities(sheetName: string, profile: ReturnType<typeof buildSemanticProfile>): boolean {
  return profile.entities.some(
    (e) => e.sheets.includes(sheetName) && (e.type === "sku" || e.type === "client" || e.type === "pdv")
  );
}

function buildAvailableFilters(sellInRows: NormalizedSellInRow[], sellOutRows: NormalizedSellOutRow[], productDisplayNames?: Map<string, string>) {
  const months = new Set<string>();
  const skus = new Map<string, string>();
  const channels = new Set<string>();
  const clients = new Map<string, string>();
  for (const row of [...sellInRows, ...sellOutRows]) {
    if (row.month) months.add(row.month);
    if (row.skuId) {
      const label = productDisplayNames?.get(row.skuId) ?? row.skuName ?? row.skuId;
      skus.set(row.skuId, label);
    }
    if (row.channel) channels.add(row.channel);
    if (row.clientId) clients.set(row.clientId, row.clientName ?? row.clientId);
  }
  return {
    months: [...months].sort(), // YYYY-MM lexicographic sort is correct
    skus: [...skus].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
    channels: [...channels].sort(),
    clients: [...clients].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export async function processFileBuffer(options: ProcessFileBufferOptions): Promise<ProcessedDataset> {
  columnLookupCache.clear();
  const warnings: string[] = [];
  const errors: string[] = [];
  const sheetsFound: string[] = [];
  const sheetsMissing: string[] = [];
  const columnMappings: ColumnMapping[] = [];
  const mapping = options.mapping;

  emit(options.onProgress, 0, "Archivo recibido");
  const XLSX = await import("xlsx");
  emit(options.onProgress, 1, "Leyendo hojas");
  const workbook = XLSX.read(new Uint8Array(options.buffer), { type: "array", cellDates: true });
  if (isResumenDemoAppWorkbook(workbook)) {
    emit(options.onProgress, 2, "Detectando formato Resumen Demo App");
    const dataset = processResumenDemoAppWorkbook({
      fileName: options.fileName,
      fileSize: options.fileSize,
      workbook,
      XLSX,
    });
    emit(options.onProgress, 5, "Dataset listo");
    return dataset;
  }
  if (isPdvGeoWorkbook(workbook, XLSX)) {
    emit(options.onProgress, 2, "Detectando archivo geográfico de PDVs");
    const dataset = processPdvGeoWorkbook({
      fileName: options.fileName,
      fileSize: options.fileSize,
      workbook,
      XLSX,
    });
    emit(options.onProgress, 5, "Dataset listo");
    return dataset;
  }
  emit(options.onProgress, 2, "Detectando tablas comerciales");

  const sheetProfiles = workbook.SheetNames.map((name) => sheetProfile(XLSX, workbook, name));
  const semanticProfile = buildSemanticProfile(sheetProfiles);
  const processedSheets = enrichProcessedSheetsWithSemantics(
    sheetProfiles.map(sheetMeta),
    semanticProfile
  );
  const missingPriority = PRIORITY_SHEETS.filter((sheet) => !workbook.SheetNames.some((name) => normalizeKey(name) === normalizeKey(sheet)));
  sheetsMissing.push(...missingPriority);

  const isCsv = /\.csv$/i.test(options.fileName);
  const firstSheetName = workbook.SheetNames[0];
  const kpiSheetName = findSheetName(workbook.SheetNames, SHEET_ALIASES.kpis);
  let sellInSheetName = findSheetName(workbook.SheetNames, SHEET_ALIASES.sellIn);
  let sellOutSheetName = findSheetName(workbook.SheetNames, SHEET_ALIASES.sellOut);
  const productsSheetName = findSheetName(workbook.SheetNames, SHEET_ALIASES.products);
  const directClientsName = findSheetName(workbook.SheetNames, SHEET_ALIASES.directClients);
  const indirectClientsName = findSheetName(workbook.SheetNames, SHEET_ALIASES.indirectClients);

  const semanticTables = semanticProfile.tables;

  // Prefer granular fact tables (with SKU/client entity columns) over aggregate summaries
  // when detecting sell-in/sell-out sheets semantically
  const semanticSellIn = semanticTables
    .filter((table) =>
      table.columns.some((col) =>
        detectSemanticMappings([col], table.sheetName).some((m) => m.semanticKey === "sellInVolume")
      )
    )
    .sort((a, b) => {
      // Granular tables (with entities) come first
      const aHasEntities = tableHasEntities(a.sheetName, semanticProfile) ? 1 : 0;
      const bHasEntities = tableHasEntities(b.sheetName, semanticProfile) ? 1 : 0;
      return bHasEntities - aHasEntities;
    })[0];

  const semanticSellOut = semanticTables
    .filter((table) =>
      table.sheetName !== semanticSellIn?.sheetName &&
      table.columns.some((col) =>
        detectSemanticMappings([col], table.sheetName).some((m) => m.semanticKey === "sellOutVolume")
      )
    )
    .sort((a, b) => {
      const aHasEntities = tableHasEntities(a.sheetName, semanticProfile) ? 1 : 0;
      const bHasEntities = tableHasEntities(b.sheetName, semanticProfile) ? 1 : 0;
      return bHasEntities - aHasEntities;
    })[0];

  const semanticProducts = semanticTables.find((table) =>
    table.role === "dimension" && table.columns.some((col) =>
      detectSemanticMappings([col], table.sheetName).some((m) => m.semanticKey === "skuId")
    )
  );
  const semanticClients = semanticTables.find((table) =>
    table.role === "dimension" && table.columns.some((col) =>
      detectSemanticMappings([col], table.sheetName).some((m) => m.semanticKey === "directClientId")
    )
  );
  const semanticPdvs = semanticTables.find((table) =>
    table.columns.some((col) =>
      detectSemanticMappings([col], table.sheetName).some((m) => m.semanticKey === "pdvId")
    )
  );

  sellInSheetName = sellInSheetName ?? semanticSellIn?.sheetName;
  sellOutSheetName = sellOutSheetName ?? semanticSellOut?.sheetName;
  const detectedProductsSheetName = productsSheetName ?? semanticProducts?.sheetName;
  const detectedDirectClientsName = directClientsName ?? semanticClients?.sheetName;
  const detectedIndirectClientsName = indirectClientsName ?? semanticPdvs?.sheetName;

  if (isCsv && firstSheetName) {
    sellInSheetName = sellInSheetName ?? firstSheetName;
    sellOutSheetName = sellOutSheetName ?? firstSheetName;
  }

  const rowsBySheet = new Map<string, RawRow[]>();
  const sheetsToLoad = new Set([
    ...workbook.SheetNames.filter(isPrioritySheet),
    ...semanticTables
      .filter((table) => table.role === "fact" || table.role === "dimension" || table.role === "kpi" || table.confidence >= 0.7)
      .slice(0, 12)
      .map((table) => table.sheetName),
  ]);
  if (isCsv && firstSheetName) sheetsToLoad.add(firstSheetName);
  for (const name of sheetsToLoad) {
    const headerRowIndex = sheetProfiles.find((profile) => profile.name === name)?.headerRowIndex ?? 0;
    rowsBySheet.set(name, sheetRows(XLSX, workbook, name, headerRowIndex));
  }

  emit(options.onProgress, 3, "Mapeando columnas");
  let salesKpis: SalesKpis = {};

  // Named KPI sheet (e.g. KPIs_Calculados from legacy structure)
  if (kpiSheetName) {
    sheetsFound.push(kpiSheetName);
    const rows = rowsBySheet.get(kpiSheetName) ?? sheetRows(XLSX, workbook, kpiSheetName, sheetProfiles.find((p) => p.name === kpiSheetName)?.headerRowIndex ?? 0);
    const { kpis, mappings } = readKpis(rows, warnings, kpiSheetName, mapping);
    salesKpis = { ...salesKpis, ...kpis };
    columnMappings.push(...mappings);
  }

  // Semantic detection: find any sheet matching the objectives/variations pattern (KPI + Actual + Var_Pct)
  // Works for sheets with numeric names like "14" in caso1.xlsx
  if (!kpiSheetName) {
    const objectivesSheet = semanticTables.find((table) => isObjectivesSheet(table.columns));
    if (objectivesSheet) {
      sheetsFound.push(objectivesSheet.sheetName);
      const rows = rowsBySheet.get(objectivesSheet.sheetName) ?? sheetRows(
        XLSX, workbook, objectivesSheet.sheetName,
        sheetProfiles.find((p) => p.name === objectivesSheet.sheetName)?.headerRowIndex ?? 0
      );
      // Only use the latest-year rows to get YTD KPIs (not monthly per-row data)
      const monthCol = rows[0] ? findColumnName(Object.keys(rows[0]).filter((h) => !h.startsWith("__EMPTY")), "month", objectivesSheet.sheetName, mapping) : undefined;
      const allMonths = monthCol ? rows.map((r) => normalizeMonth(r[monthCol])).filter((m): m is string => Boolean(m)) : [];
      const latestYear = allMonths.reduce((max, m) => {
        const y = parseInt(m.substring(0, 4), 10);
        return Number.isFinite(y) ? Math.max(max, y) : max;
      }, 0);
      const ytdRows = monthCol && latestYear > 0
        ? rows.filter((r) => normalizeMonth(r[monthCol])?.startsWith(String(latestYear)))
        : rows;
      if (ytdRows.length > 0) {
        const { kpis, mappings } = readKpis(ytdRows, warnings, objectivesSheet.sheetName, mapping);
        salesKpis = { ...salesKpis, ...Object.fromEntries(Object.entries(kpis).filter(([, v]) => v !== undefined)) };
        columnMappings.push(...mappings);
      }
    }
  }

  // Aggregate metric table: sheet with both sell-in and sell-out volumes + financial KPIs
  // Prefer sheets with fewer entity columns (they are summaries, good for KPI totals)
  const metricTable = semanticTables.find((table) => {
    if (table.sheetName === sellInSheetName || table.sheetName === sellOutSheetName) return false;
    const semanticKeys = detectSemanticMappings(table.columns, table.sheetName).map((item) => item.semanticKey);
    return (semanticKeys.includes("sellInVolume") || semanticKeys.includes("sellOutVolume"))
      && (semanticKeys.includes("netRevenue") || semanticKeys.includes("ebitda") || semanticKeys.includes("passthrough"));
  }) ?? semanticTables.find((table) => {
    // Broader fallback: any table with both volumes (even if same as sell-in/out sheet)
    const semanticKeys = detectSemanticMappings(table.columns, table.sheetName).map((item) => item.semanticKey);
    return semanticKeys.includes("sellInVolume") && semanticKeys.includes("sellOutVolume");
  });

  if (metricTable && metricTable.sheetName !== kpiSheetName) {
    sheetsFound.push(metricTable.sheetName);
    const rows = rowsBySheet.get(metricTable.sheetName) ?? sheetRows(
      XLSX, workbook, metricTable.sheetName,
      sheetProfiles.find((p) => p.name === metricTable.sheetName)?.headerRowIndex ?? 0
    );
    const { kpis, mappings } = readMetricTableKpis(rows, metricTable.sheetName, mapping);
    salesKpis = { ...salesKpis, ...Object.fromEntries(Object.entries(kpis).filter(([, v]) => v !== undefined)) };
    columnMappings.push(...mappings);
  }

  const productRows = detectedProductsSheetName
    ? rowsBySheet.get(detectedProductsSheetName) ?? sheetRows(XLSX, workbook, detectedProductsSheetName, sheetProfiles.find((p) => p.name === detectedProductsSheetName)?.headerRowIndex ?? 0)
    : [];
  const clientRows = detectedDirectClientsName
    ? rowsBySheet.get(detectedDirectClientsName) ?? sheetRows(XLSX, workbook, detectedDirectClientsName, sheetProfiles.find((p) => p.name === detectedDirectClientsName)?.headerRowIndex ?? 0)
    : [];
  const pdvRows = detectedIndirectClientsName
    ? rowsBySheet.get(detectedIndirectClientsName) ?? sheetRows(XLSX, workbook, detectedIndirectClientsName, sheetProfiles.find((p) => p.name === detectedIndirectClientsName)?.headerRowIndex ?? 0)
    : [];

  if (detectedProductsSheetName) sheetsFound.push(detectedProductsSheetName);
  if (detectedDirectClientsName) sheetsFound.push(detectedDirectClientsName);
  if (detectedIndirectClientsName) sheetsFound.push(detectedIndirectClientsName);

  if (detectedProductsSheetName && productRows.length > 0) {
    columnMappings.push(...detectedMappings(productRows, detectedProductsSheetName, [
      { key: "skuId", label: "SKU ID" },
      { key: "skuName", label: "SKU Nombre" },
      { key: "brand", label: "Marca" },
      { key: "format", label: "Formato" },
      { key: "category", label: "Categoría" },
    ], mapping));
  }

  const products = detectedProductsSheetName ? normalizeProducts(productRows, detectedProductsSheetName, mapping) : [];
  const directClients = detectedDirectClientsName ? normalizeClients(clientRows, detectedDirectClientsName, mapping) : [];
  const indirectClients = detectedIndirectClientsName ? normalizePdvs(pdvRows, detectedIndirectClientsName, mapping) : [];
  const productMap = new Map(products.map((product) => [product.id, product.displayName ?? product.name]));
  const clientMap = new Map(directClients.map((client) => [client.id, client]));
  const pdvMap = new Map(indirectClients.map((pdv) => [pdv.id, pdv]));

  let sellInRawRows: RawRow[] = [];
  let sellOutRawRows: RawRow[] = [];
  if (sellInSheetName) {
    sheetsFound.push(sellInSheetName);
    sellInRawRows = rowsBySheet.get(sellInSheetName) ?? sheetRows(XLSX, workbook, sellInSheetName, sheetProfiles.find((p) => p.name === sellInSheetName)?.headerRowIndex ?? 0);
    columnMappings.push(...detectedMappings(sellInRawRows, sellInSheetName, [
      { key: "month", label: "Mes" },
      { key: "skuId", label: "SKU ID" },
      { key: "skuName", label: "SKU Nombre" },
      { key: "directClientId", label: "Cliente ID" },
      { key: "clientName", label: "Cliente Nombre" },
      { key: "channel", label: "Canal" },
      { key: "sellInVolume", label: "Volumen Sell-in" },
      { key: "netRevenue", label: "Net Revenue" },
      { key: "ebitda", label: "EBITDA" },
    ], mapping));
  } else {
    warnings.push("No se encontró hoja de Sell-in");
  }

  if (sellOutSheetName) {
    sheetsFound.push(sellOutSheetName);
    sellOutRawRows = rowsBySheet.get(sellOutSheetName) ?? sheetRows(XLSX, workbook, sellOutSheetName, sheetProfiles.find((p) => p.name === sellOutSheetName)?.headerRowIndex ?? 0);
    columnMappings.push(...detectedMappings(sellOutRawRows, sellOutSheetName, [
      { key: "month", label: "Mes" },
      { key: "skuId", label: "SKU ID" },
      { key: "skuName", label: "SKU Nombre" },
      { key: "directClientId", label: "Distribuidor ID" },
      { key: "clientName", label: "Cliente Nombre" },
      { key: "channel", label: "Canal" },
      { key: "pdvId", label: "PDV ID" },
      { key: "sellOutVolume", label: "Volumen Sell-out" },
      { key: "priceIndex", label: "Price Index" },
    ], mapping));
  } else {
    warnings.push("No se encontró hoja de Sell-out");
  }

  const sellInRows = sellInSheetName ? normalizeSellIn(sellInRawRows, sellInSheetName, productMap, clientMap, mapping) : [];
  const sellOutRows = sellOutSheetName ? normalizeSellOut(sellOutRawRows, sellOutSheetName, productMap, clientMap, pdvMap, mapping) : [];
  const availableFilters = buildAvailableFilters(sellInRows, sellOutRows, productMap);

  emit(options.onProgress, 4, "Calculando KPIs");
  const normalizedDataset: ProcessedDataset = {
    id: `dataset-${generateId()}`,
    fileName: options.fileName,
    fileSize: options.fileSize,
    uploadedAt: new Date().toISOString(),
    sheets: processedSheets,
    salesKpis,
    salesTables: {
      sellIn: sellInRawRows.slice(0, 500),
      sellOut: sellOutRawRows.slice(0, 500),
      products: productRows.slice(0, 500),
      directClients: clientRows.slice(0, 500),
      indirectClients: pdvRows.slice(0, 500),
    },
    salesData: { sellInRows, sellOutRows, products, directClients, indirectClients },
    availableFilters,
    mapping: columnMappings,
    semanticProfile,
    validation: { warnings, errors, sheetsFound: [...new Set(sheetsFound)], sheetsMissing: [...new Set(sheetsMissing)], columnMappings },
  };

  const calculated = calculateSalesKpis(normalizedDataset, { period: "YTD" });

  // Merge strategy:
  // - Metric table (salesKpis) may come from a pre-aggregated summary sheet that covers all
  //   channels. It is authoritative for aggregate volume KPIs.
  // - Raw data calculation (calculated) provides YoY variation KPIs the metric table never has,
  //   and fills in any volume KPIs the metric table did not provide.
  // - Variation KPIs are always re-applied from raw calculation (metric table never has them).
  const VARIATION_KPI_KEYS = new Set<string>(["sellInVarPct", "sellOutVarPct", "netRevenueVarPct", "ebitdaVarPct", "passthroughVarPct", "priceIndexVarPct"]);
  const merged: SalesKpis = {
    // 1. Raw calculation as baseline (covers everything including YoY variations)
    ...Object.fromEntries(Object.entries(calculated).filter(([, v]) => v !== undefined)),
    // 2. Metric table overrides all volume KPIs (authoritative aggregate, covers all channels)
    ...Object.fromEntries(Object.entries(salesKpis).filter(([, v]) => v !== undefined)),
    // 3. Re-apply variation KPIs from raw calculation (metric table never provides these)
    ...Object.fromEntries(Object.entries(calculated).filter(([k, v]) => v !== undefined && VARIATION_KPI_KEYS.has(k))),
  };
  normalizedDataset.salesKpis = merged;

  if (isCsv && (sellInRows.length === 0 || sellOutRows.length === 0 || productRows.length === 0)) {
    warnings.push("El archivo fue procesado correctamente, pero al tratarse de un CSV simplificado no contiene todas las tablas necesarias para calcular KPIs comerciales completos. Para una demo más rica, se recomienda utilizar el archivo XLSX con múltiples hojas.");
  }

  emit(options.onProgress, 5, "Dataset listo");
  return normalizedDataset;
}

import type {
  ColumnMapping,
  GeoPdvFact,
  ProcessedDataset,
  ProcessedSheet,
  SheetDomain,
} from "@/types/dataset";
import type { WorkBook } from "xlsx";
import { buildSemanticProfile, normalizeSemanticText, type RawSheetProfile } from "@/lib/semantic-commercial-engine";
import { generateId } from "@/lib/utils";

type XlsxModule = typeof import("xlsx");
type MatrixRow = unknown[];

type ProcessPdvGeoOptions = {
  fileName: string;
  fileSize: number;
  workbook: WorkBook;
  XLSX: XlsxModule;
};

const REQUIRED_COLUMNS = [
  "id",
  "zona",
  "canal",
  "nombrepdv",
  "direccion",
  "latitud",
  "longitud",
  "estado",
];

function compact(value: unknown): string {
  return normalizeSemanticText(String(value ?? "")).replace(/[^a-z0-9]/g, "");
}

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (value === null || value === undefined || value === "") return undefined;
  let raw = String(value).trim().replace(/[$€£R$]/g, "");
  if (!raw) return undefined;
  const dots = (raw.match(/\./g) ?? []).length;
  const commas = (raw.match(/,/g) ?? []).length;
  if (dots > 1) raw = raw.replace(/\./g, "").replace(",", ".");
  else if (commas > 1) raw = raw.replace(/,/g, "");
  else if (dots === 1 && commas === 1) raw = raw.lastIndexOf(",") > raw.lastIndexOf(".") ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(/,/g, "");
  else if (commas === 1) raw = (raw.split(",")[1] ?? "").length === 3 ? raw.replace(",", "") : raw.replace(",", ".");
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function matrixForSheet(XLSX: XlsxModule, workbook: WorkBook, sheetName: string): MatrixRow[] {
  return XLSX.utils.sheet_to_json<MatrixRow>(workbook.Sheets[sheetName], { header: 1, defval: "" });
}

function headerIndex(rows: MatrixRow[]): number {
  return rows.findIndex((row) => {
    const keys = row.map(compact);
    return REQUIRED_COLUMNS.every((required) => keys.includes(required));
  });
}

function pdvSheetName(XLSX: XlsxModule, workbook: WorkBook): string | undefined {
  return workbook.SheetNames.find((sheetName) => headerIndex(matrixForSheet(XLSX, workbook, sheetName)) >= 0);
}

export function isPdvGeoWorkbook(workbook: WorkBook, XLSX: XlsxModule): boolean {
  return Boolean(pdvSheetName(XLSX, workbook));
}

function processedSheet(XLSX: XlsxModule, workbook: WorkBook, name: string, columns: string[]): ProcessedSheet {
  const sheet = workbook.Sheets[name];
  const range = sheet["!ref"] ? XLSX.utils.decode_range(sheet["!ref"]) : null;
  const domain: SheetDomain = compact(name).includes("resumen") ? "control" : "trade";
  return {
    name,
    rows: range ? Math.max(0, range.e.r - range.s.r) : 0,
    columns,
    domain,
    status: "processed",
  };
}

function buildGeoPdvFacts(rows: MatrixRow[], sheetName: string): GeoPdvFact[] {
  const header = headerIndex(rows);
  if (header < 0) return [];
  const columns = rows[header].map(compact);
  const index = (name: string) => columns.indexOf(name);
  const idCol = index("id");
  const zoneCol = index("zona");
  const channelCol = index("canal");
  const nameCol = index("nombrepdv");
  const addressCol = index("direccion");
  const latCol = index("latitud");
  const lngCol = index("longitud");
  const statusCol = index("estado");
  const volumeCol = columns.findIndex((col) => col.includes("volumenmensual"));
  const revenueCol = columns.findIndex((col) => col.includes("facturacionmensual"));
  const ticketCol = columns.findIndex((col) => col.includes("ticketpromedio"));
  const frequencyCol = columns.findIndex((col) => col.includes("frecuenciadevisita"));
  const opportunityCol = columns.findIndex((col) => col.includes("oportunidad"));

  return rows.slice(header + 1).flatMap((row): GeoPdvFact[] => {
    const id = text(row[idCol]);
    const name = text(row[nameCol]);
    const zone = text(row[zoneCol]);
    const channel = text(row[channelCol]);
    if (!id || !name || !zone || !channel) return [];

    const volume = volumeCol >= 0 ? toNumber(row[volumeCol]) : undefined;
    const revenue = revenueCol >= 0 ? toNumber(row[revenueCol]) : undefined;
    const status = text(row[statusCol]);
    const isAttended = compact(status) === "atendido" || Boolean((volume ?? 0) > 0 || (revenue ?? 0) > 0);
    const hasPurchase = Boolean((volume ?? 0) > 0 || (revenue ?? 0) > 0);

    return [{
      id: `pdv-${id}`,
      name,
      zone,
      channel,
      address: text(row[addressCol]) || undefined,
      lat: latCol >= 0 ? toNumber(row[latCol]) : undefined,
      lng: lngCol >= 0 ? toNumber(row[lngCol]) : undefined,
      status: status || undefined,
      isAttended,
      hasPurchase,
      volume,
      revenue,
      averageTicket: ticketCol >= 0 ? toNumber(row[ticketCol]) : undefined,
      visitFrequency: frequencyCol >= 0 ? text(row[frequencyCol]) || undefined : undefined,
      opportunity: opportunityCol >= 0 ? toNumber(row[opportunityCol]) : undefined,
      sourceSheet: sheetName,
    }];
  });
}

function buildMappings(sheetName: string): ColumnMapping[] {
  return [
    { fileColumn: "ID", nexusField: "PDV ID", sheet: sheetName, confidence: 1, semanticKey: "pdvId", detectedType: "entity" },
    { fileColumn: "Nombre PDV", nexusField: "PDV Nombre", sheet: sheetName, confidence: 1, semanticKey: "pdvName", detectedType: "entity" },
    { fileColumn: "Canal", nexusField: "Canal", sheet: sheetName, confidence: 1, semanticKey: "channel", detectedType: "dimension" },
    { fileColumn: "Zona", nexusField: "Zona", sheet: sheetName, confidence: 1, semanticKey: "zone", detectedType: "dimension" },
    { fileColumn: "Latitud", nexusField: "Latitud", sheet: sheetName, confidence: 1, semanticKey: "lat", detectedType: "dimension" },
    { fileColumn: "Longitud", nexusField: "Longitud", sheet: sheetName, confidence: 1, semanticKey: "lng", detectedType: "dimension" },
  ];
}

export function processPdvGeoWorkbook(options: ProcessPdvGeoOptions): ProcessedDataset {
  const { workbook, XLSX } = options;
  const sourceSheet = pdvSheetName(XLSX, workbook) ?? workbook.SheetNames[0];
  const rows = matrixForSheet(XLSX, workbook, sourceSheet);
  const header = headerIndex(rows);
  const columns = header >= 0 ? rows[header].map(text).filter(Boolean) : [];
  const geoPdvFacts = buildGeoPdvFacts(rows, sourceSheet);
  const warnings: string[] = [];
  const withoutCoordinates = geoPdvFacts.filter((pdv) => pdv.lat === undefined || pdv.lng === undefined).length;
  if (withoutCoordinates > 0) {
    warnings.push(`${withoutCoordinates} PDVs no tienen coordenadas y se excluyen del mapa.`);
  }
  const zones = [...new Set(geoPdvFacts.map((pdv) => pdv.zone).filter(Boolean))].sort();
  const channels = [...new Set(geoPdvFacts.map((pdv) => pdv.channel).filter(Boolean))].sort();
  const mapping = buildMappings(sourceSheet);
  const processedSheets = workbook.SheetNames.map((name) => processedSheet(
    XLSX,
    workbook,
    name,
    name === sourceSheet ? columns : ["Categoría", "Total PDV", "Atendidos", "No Atendidos"]
  ));
  const semanticProfile = buildSemanticProfile(
    processedSheets.map<RawSheetProfile>((sheet) => ({
      name: sheet.name,
      rows: sheet.rows,
      columns: sheet.columns,
      headerRowIndex: sheet.name === sourceSheet ? header : 0,
    }))
  );

  return {
    id: `dataset-${generateId()}`,
    fileName: options.fileName,
    fileSize: options.fileSize,
    uploadedAt: new Date().toISOString(),
    sheets: processedSheets,
    salesKpis: {},
    salesTables: {
      indirectClients: geoPdvFacts.map((pdv) => ({
        ID: pdv.id,
        Zona: pdv.zone,
        Canal: pdv.channel,
        "Nombre PDV": pdv.name,
        Direccion: pdv.address,
        Latitud: pdv.lat,
        Longitud: pdv.lng,
        Estado: pdv.status,
        Volumen: pdv.volume,
        Facturacion: pdv.revenue,
      })),
    },
    salesData: {
      sellInRows: [],
      sellOutRows: [],
      products: [],
      directClients: [],
      indirectClients: geoPdvFacts.map((pdv) => ({
        id: pdv.id,
        name: pdv.name,
        channel: pdv.channel,
      })),
    },
    availableFilters: {
      months: [],
      skus: [],
      channels,
      clients: [],
      zones,
    },
    geoPdvFacts,
    mapping,
    semanticProfile: {
      ...semanticProfile,
      summary: `Archivo geográfico de PDVs: ${geoPdvFacts.length} PDVs detectados en ${sourceSheet}`,
      quality: {
        ...semanticProfile.quality,
        confidence: 0.96,
        warnings,
      },
    },
    metadata: {
      sourceFormat: "pdv-geo",
      sourceSheets: workbook.SheetNames,
      primarySheet: sourceSheet,
      warnings,
      detectedKpis: ["PDVs atendidos", "Clientes compradores", "Cobertura", "Facturación", "Volumen", "Oportunidad"],
    },
    validation: {
      warnings,
      errors: [],
      sheetsFound: workbook.SheetNames,
      sheetsMissing: [],
      columnMappings: mapping,
    },
  };
}

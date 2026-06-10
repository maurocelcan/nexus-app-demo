import type {
  ColumnMapping,
  CommercialBusinessArea,
  CommercialEntityType,
  CommercialKpiKey,
  DetectedTable,
  ProcessedSheet,
  SemanticBusinessArea,
  SemanticDatasetProfile,
  SemanticEntity,
  SemanticKpi,
  SemanticRelationship,
  SheetDomain,
} from "@/types/dataset";

export type RawSheetProfile = {
  name: string;
  rows: number;
  columns: string[];
  headerRowIndex: number;
};

type FieldKind = "entity" | "metric" | "dimension" | "time" | "ignore";

type FieldDefinition = {
  key: string;
  label: string;
  kind: FieldKind;
  aliases: string[];
  areas: CommercialBusinessArea[];
  entityType?: CommercialEntityType;
  kpiKey?: CommercialKpiKey;
};

type AreaDefinition = {
  area: CommercialBusinessArea;
  label: string;
  domain: SheetDomain;
  terms: string[];
};

const AREA_DEFINITIONS: AreaDefinition[] = [
  { area: "sales", label: "Ventas", domain: "sales", terms: ["venta", "ventas", "sellin", "sell in", "revenue", "fact ventas", "canal sku cliente"] },
  { area: "sell-through", label: "Sell-Through", domain: "sales", terms: ["sellout", "sell out", "sellthrough", "sell through", "pdv", "compradores", "rotacion"] },
  { area: "finance", label: "Finanzas", domain: "finance", terms: ["finanzas", "finance", "p&l", "pl", "pnl", "ebitda", "cogs", "gross profit", "deuda", "dso", "factura", "cobro"] },
  { area: "trade-marketing", label: "Trade Marketing", domain: "trade", terms: ["trade", "promocion", "promociones", "promo", "share of shelf", "sos", "planograma", "gondola"] },
  { area: "supply-chain", label: "Supply Chain", domain: "supply", terms: ["supply", "stock", "inventario", "inventory", "otif", "fill", "warehouse", "warehousing", "logistica", "slob"] },
  { area: "rgm", label: "RGM", domain: "rgm", terms: ["rgm", "price", "precio", "asp", "elasticidad", "mix", "roi", "indice precio", "price index"] },
  { area: "planning", label: "Planning", domain: "planning", terms: ["objetivo", "budget", "plan", "forecast", "topdown", "control"] },
  { area: "crm", label: "CRM", domain: "crm", terms: ["cliente", "clientes", "cuenta", "factura", "cobranza", "crm"] },
  { area: "master-data", label: "Master Data", domain: "dimension", terms: ["dim", "dimension", "maestro", "sku", "producto", "cliente", "pdv", "distribuidor"] },
  { area: "control", label: "Control", domain: "control", terms: ["control", "kpi", "trazabilidad", "diccionario", "stg"] },
];

const FIELD_DEFINITIONS: FieldDefinition[] = [
  { key: "month", label: "Mes", kind: "time", areas: ["sales", "finance", "planning"], aliases: ["mes", "month", "periodo", "periodo mes", "fecha", "date", "mes anio", "anio mes", "mes anio"] },
  { key: "skuId", label: "SKU ID", kind: "entity", entityType: "sku", areas: ["sales", "sell-through", "rgm", "master-data"], aliases: ["id sku", "sku id", "sku", "idsku", "codigo sku", "producto id", "id producto", "id sku"] },
  { key: "skuName", label: "SKU Nombre", kind: "entity", entityType: "product", areas: ["sales", "sell-through", "master-data"], aliases: ["sku nombre", "nombre sku", "producto", "nombre producto", "descripcion sku", "sku name", "product"] },
  { key: "brand", label: "Marca", kind: "entity", entityType: "brand", areas: ["sales", "rgm", "master-data"], aliases: ["marca", "brand", "familia marca", "nombre marca", "marca producto"] },
  { key: "format", label: "Formato", kind: "dimension", areas: ["sales", "rgm", "master-data"], aliases: ["formato", "format", "presentacion", "empaque", "tamano", "tamaño", "volumen presentacion", "size"] },
  { key: "category", label: "Categoría", kind: "entity", entityType: "category", areas: ["sales", "rgm", "master-data"], aliases: ["categoria", "category", "subcategoria", "segmento", "linea", "tipo producto"] },
  { key: "directClientId", label: "Cliente ID", kind: "entity", entityType: "client", areas: ["sales", "finance", "crm"], aliases: ["id cliente dir", "cliente id", "id cliente", "id distribuidor", "id dist", "id distribuidor padre", "customer id", "account id", "id cliente dir"] },
  { key: "clientName", label: "Cliente Nombre", kind: "entity", entityType: "client", areas: ["sales", "finance", "crm"], aliases: ["cliente", "nombre cliente", "cliente nombre", "razon social", "distribuidor", "nombre distribuidor", "customer", "account"] },
  { key: "channel", label: "Canal", kind: "dimension", entityType: "channel", areas: ["sales", "sell-through", "rgm"], aliases: ["canal", "channel", "canal comercial", "tipo canal"] },
  { key: "region", label: "Región", kind: "dimension", entityType: "region", areas: ["sales", "supply-chain"], aliases: ["region", "zona", "territorio", "provincia", "area geografica"] },
  { key: "pdvId", label: "PDV ID", kind: "entity", entityType: "pdv", areas: ["sell-through", "trade-marketing"], aliases: ["id pdv", "pdv id", "id punto venta", "punto venta id", "pdv", "id pdv o cliente"] },
  { key: "pdvName", label: "PDV Nombre", kind: "entity", entityType: "pdv", areas: ["sell-through", "trade-marketing"], aliases: ["nombre pdv", "pdv nombre", "punto de venta", "nombre punto de venta"] },
  { key: "invoiceId", label: "Factura ID", kind: "entity", entityType: "invoice", areas: ["finance", "crm"], aliases: ["factura id", "id factura", "invoice id", "documento"] },
  { key: "account", label: "Cuenta contable", kind: "entity", entityType: "account", areas: ["finance"], aliases: ["cuenta contable", "cuenta", "nivel 1", "linea pnl", "pl line", "cuenta contable"] },
  { key: "sellInVolume", label: "Volumen Sell-in", kind: "metric", kpiKey: "sellInVolume", areas: ["sales"], aliases: ["volumen cajas", "sell in cajas", "sellin cajas", "sellin", "sell in", "vol cjs", "cases sold", "volume cs", "sellin volume", "sell in volume", "volumen si", "vol si", "cajas si", "sell in cajas", "sellin cajas"] },
  { key: "sellOutVolume", label: "Volumen Sell-out", kind: "metric", kpiKey: "sellOutVolume", areas: ["sales", "sell-through"], aliases: ["vol cajas out", "volumen cajas out", "sell out cajas", "sellout cajas", "sellout", "sell out", "sellout real", "sell out real", "volumen so", "cajas so", "vol so", "cajas out", "unidades so", "casos so", "vol cajas out"] },
  { key: "netRevenue", label: "Net Revenue", kind: "metric", kpiKey: "netRevenue", areas: ["sales", "finance", "rgm"], aliases: ["net revenue", "net revenue usd", "revenue neto", "venta neta", "nr", "netrev", "facturacion neta", "net revenue usd"] },
  { key: "grossRevenue", label: "Gross Revenue", kind: "metric", kpiKey: "grossRevenue", areas: ["sales", "finance"], aliases: ["gross revenue", "gross revenue usd", "venta bruta", "revenue bruto"] },
  { key: "ebitda", label: "EBITDA", kind: "metric", kpiKey: "ebitda", areas: ["finance"], aliases: ["ebitda", "ebitda usd", "ebitda proxy", "monto ebitda", "ebitda proxy"] },
  { key: "grossMargin", label: "Gross Margin", kind: "metric", kpiKey: "grossMargin", areas: ["finance", "rgm"], aliases: ["gross margin", "gross margin pct", "gross margin %", "margen bruto", "gross profit", "gross margin pct"] },
  { key: "cogs", label: "COGS", kind: "metric", kpiKey: "cogs", areas: ["finance", "supply-chain"], aliases: ["cogs", "cogs pct", "cogs %", "costo venta", "costo de ventas", "cogs pct"] },
  { key: "opex", label: "Opex", kind: "metric", kpiKey: "opex", areas: ["finance"], aliases: ["opex", "gasto total", "gastos estructura", "gastos de estructura", "g&a", "ga", "otros gastos", "gasto total usd"] },
  { key: "tradeSpend", label: "Trade Spend", kind: "metric", kpiKey: "tradeSpend", areas: ["trade-marketing", "finance"], aliases: ["trade spend", "descuentos trade", "inversion trade", "gasto promo", "promo spend", "descuentos trade"] },
  { key: "passthrough", label: "Passthrough", kind: "metric", kpiKey: "passthrough", areas: ["sales", "sell-through"], aliases: ["passthrough", "pass through", "passthrough pct", "passthrough %", "pass through %", "passthrough pct", "passthrough raw"] },
  { key: "priceIndex", label: "Price Index", kind: "metric", kpiKey: "priceIndex", areas: ["rgm", "sales"], aliases: ["price index", "indice precio", "indice de precio", "idx precio", "price index"] },
  { key: "asp", label: "ASP", kind: "metric", kpiKey: "asp", areas: ["rgm"], aliases: ["asp", "precio promedio", "precio unitario", "precio gondola real", "precio lista sugerido", "asp usd x caja"] },
  { key: "numericDistribution", label: "Distribución numérica", kind: "metric", kpiKey: "numericDistribution", areas: ["sales", "trade-marketing"], aliases: ["dn efectiva pct", "distribucion numerica pct", "distribucion numerica", "dn", "pdv con sku", "pdv universo", "distribucion numerica pct"] },
  { key: "inventory", label: "Inventory", kind: "metric", kpiKey: "inventory", areas: ["supply-chain"], aliases: ["inventory", "inventario", "stock", "dias inventario", "dio", "dias inventario dio"] },
  { key: "fillRate", label: "Fill Rate", kind: "metric", kpiKey: "fillRate", areas: ["supply-chain"], aliases: ["fill rate", "fill", "nivel cumplimiento pedido", "pedido completo", "fill rate pct"] },
  { key: "otif", label: "OTIF", kind: "metric", kpiKey: "otif", areas: ["supply-chain"], aliases: ["otif", "on time in full", "entregas a tiempo", "entregas completas", "otif pct"] },
  { key: "dso", label: "DSO", kind: "metric", kpiKey: "dso", areas: ["finance", "crm"], aliases: ["dso", "dias cobro", "dias atraso", "saldo abierto", "deuda vencida", "dias cobro"] },
  { key: "promotionalRoi", label: "ROI Promo", kind: "metric", kpiKey: "promotionalRoi", areas: ["trade-marketing", "rgm"], aliases: ["roi promo", "retorno promo", "promo roi", "roi promocional"] },
  { key: "shareOfShelf", label: "Share of Shelf", kind: "metric", kpiKey: "shareOfShelf", areas: ["trade-marketing"], aliases: ["share of shelf", "sos", "share gondola", "participacion gondola", "share of shelf pct"] },
];

const NEXUS_FIELD_LABEL_BY_KEY = new Map(FIELD_DEFINITIONS.map((field) => [field.key, field.label]));
const FIELD_BY_NEXUS_LABEL = new Map(FIELD_DEFINITIONS.map((field) => [field.label, field]));

export function normalizeSemanticText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[%_./-]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compact(value: string): string {
  return normalizeSemanticText(value).replace(/\s+/g, "");
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function tokens(value: string): string[] {
  return normalizeSemanticText(value).split(" ").filter((token) => token.length > 1);
}

function scoreText(value: string, aliases: string[], context = ""): { score: number; evidence: string[] } {
  const normalizedContext = normalizeSemanticText(context);
  const compactValue = compact(value);
  const valueTokens = new Set(tokens(value));
  let score = 0;
  const evidence: string[] = [];

  for (const alias of aliases) {
    const aliasNormalized = normalizeSemanticText(alias);
    const aliasCompact = compact(alias);
    const aliasTokens = tokens(alias);
    if (!aliasNormalized) continue;

    if (compactValue === aliasCompact) {
      score = Math.max(score, 1);
      evidence.push(`match exacto: ${alias}`);
    } else if (compactValue.includes(aliasCompact) || aliasCompact.includes(compactValue)) {
      score = Math.max(score, 0.82);
      evidence.push(`alias cercano: ${alias}`);
    } else {
      const overlap = aliasTokens.filter((token) => valueTokens.has(token)).length;
      if (overlap > 0) {
        score = Math.max(score, Math.min(0.72, overlap / aliasTokens.length));
        evidence.push(`tokens compartidos: ${aliasTokens.filter((token) => valueTokens.has(token)).join(", ")}`);
      }
    }

    if (normalizedContext.includes(aliasNormalized) || compact(normalizedContext).includes(aliasCompact)) {
      score = Math.max(score, 0.55);
      evidence.push(`contexto: ${alias}`);
    }
  }

  return { score: clamp(score), evidence: [...new Set(evidence)].slice(0, 3) };
}

export function nexusFieldForSemanticKey(key: string): string {
  return NEXUS_FIELD_LABEL_BY_KEY.get(key) ?? "Ignorar";
}

export function semanticKeyForNexusField(label: string): string | undefined {
  return FIELD_BY_NEXUS_LABEL.get(label)?.key;
}

export function detectSemanticMappingForColumn(column: string, sheetName: string): ColumnMapping | null {
  let best: { field: FieldDefinition; score: number; evidence: string[] } | null = null;
  for (const field of FIELD_DEFINITIONS) {
    const scored = scoreText(column, field.aliases, sheetName);
    if (!best || scored.score > best.score) best = { field, score: scored.score, evidence: scored.evidence };
  }
  if (!best || best.score < 0.5) return null;
  return {
    fileColumn: column,
    nexusField: best.field.label,
    sheet: sheetName,
    confidence: Math.round(best.score * 100) / 100,
    semanticKey: best.field.key,
    detectedType: best.field.kind,
  };
}

export function detectSemanticMappings(columns: string[], sheetName: string, existingMapping?: ColumnMapping[]): ColumnMapping[] {
  const result: ColumnMapping[] = [];
  const manuallyMapped = new Map<string, ColumnMapping>();
  for (const mapping of existingMapping ?? []) {
    if (mapping.sheet === sheetName) manuallyMapped.set(mapping.fileColumn, mapping);
  }

  for (const column of columns.filter((c) => c && !c.startsWith("__EMPTY"))) {
    const manual = manuallyMapped.get(column);
    if (manual) {
      const semanticKey = semanticKeyForNexusField(manual.nexusField);
      result.push({ ...manual, semanticKey, confidence: manual.confidence ?? 1 });
      continue;
    }
    const detected = detectSemanticMappingForColumn(column, sheetName);
    if (detected) result.push(detected);
  }

  return result;
}

function roleForSheet(sheetName: string, columns: string[]): DetectedTable["role"] {
  const text = `${sheetName} ${columns.join(" ")}`;
  const n = normalizeSemanticText(text);
  if (n.includes("dim ") || n.includes("dimension") || compact(sheetName).startsWith("dim")) return "dimension";
  if (n.includes("fact ") || compact(sheetName).startsWith("fact")) return "fact";
  if (n.includes("bridge") || n.includes("puente")) return "bridge";
  if (n.includes("kpi")) return "kpi";
  if (n.includes("control")) return "control";
  if (n.includes("stg") || n.includes("staging")) return "staging";
  return "unknown";
}

export function detectBusinessAreasForSheet(sheetName: string, columns: string[]): { area: CommercialBusinessArea; label: string; domain: SheetDomain; score: number; evidence: string[] }[] {
  const context = `${sheetName} ${columns.join(" ")}`;
  return AREA_DEFINITIONS
    .map((definition) => {
      const scored = scoreText(context, definition.terms);
      return { area: definition.area, label: definition.label, domain: definition.domain, score: scored.score, evidence: scored.evidence };
    })
    .filter((item) => item.score >= 0.25)
    .sort((a, b) => b.score - a.score);
}

export function detectSheetDomainSemantic(sheetName: string, columns: string[]): SheetDomain {
  const areas = detectBusinessAreasForSheet(sheetName, columns);
  return areas[0]?.domain ?? "unknown";
}

export function buildSemanticProfile(sheets: RawSheetProfile[]): SemanticDatasetProfile {
  const tables: DetectedTable[] = [];
  const areaBuckets = new Map<CommercialBusinessArea, { label: string; sheets: Set<string>; confidence: number; evidence: Set<string> }>();
  const entityBuckets = new Map<CommercialEntityType, { columns: Set<string>; sheets: Set<string>; confidence: number; evidence: Set<string> }>();
  const kpiBuckets = new Map<CommercialKpiKey, { label: string; columns: Set<string>; sheets: Set<string>; area: CommercialBusinessArea; confidence: number; evidence: Set<string> }>();
  let mappedColumns = 0;
  let unmappedColumns = 0;

  for (const sheet of sheets) {
    const areas = detectBusinessAreasForSheet(sheet.name, sheet.columns);
    const role = roleForSheet(sheet.name, sheet.columns);
    const domain = areas[0]?.domain ?? "unknown";
    const confidence = areas[0]?.score ?? 0.25;
    tables.push({
      id: `table-${compact(sheet.name)}`,
      sheetName: sheet.name,
      headerRowIndex: sheet.headerRowIndex,
      rows: sheet.rows,
      columns: sheet.columns,
      domain,
      areas: areas.length ? areas.map((item) => item.area) : ["unknown"],
      role,
      confidence: Math.round(confidence * 100) / 100,
    });

    for (const area of areas) {
      const bucket = areaBuckets.get(area.area) ?? { label: area.label, sheets: new Set<string>(), confidence: 0, evidence: new Set<string>() };
      bucket.sheets.add(sheet.name);
      bucket.confidence = Math.max(bucket.confidence, area.score);
      area.evidence.forEach((item) => bucket.evidence.add(item));
      areaBuckets.set(area.area, bucket);
    }

    for (const column of sheet.columns.filter((c) => c && !c.startsWith("__EMPTY"))) {
      const mapping = detectSemanticMappingForColumn(column, sheet.name);
      if (!mapping?.semanticKey) {
        unmappedColumns += 1;
        continue;
      }
      mappedColumns += 1;
      const field = FIELD_DEFINITIONS.find((item) => item.key === mapping.semanticKey);
      if (!field) continue;
      if (field.entityType) {
        const bucket = entityBuckets.get(field.entityType) ?? { columns: new Set<string>(), sheets: new Set<string>(), confidence: 0, evidence: new Set<string>() };
        bucket.columns.add(column);
        bucket.sheets.add(sheet.name);
        bucket.confidence = Math.max(bucket.confidence, mapping.confidence ?? 0);
        bucket.evidence.add(`${column} → ${field.label}`);
        entityBuckets.set(field.entityType, bucket);
      }
      if (field.kpiKey) {
        const bucket = kpiBuckets.get(field.kpiKey) ?? {
          label: field.label,
          columns: new Set<string>(),
          sheets: new Set<string>(),
          area: field.areas[0] ?? "unknown",
          confidence: 0,
          evidence: new Set<string>(),
        };
        bucket.columns.add(column);
        bucket.sheets.add(sheet.name);
        bucket.confidence = Math.max(bucket.confidence, mapping.confidence ?? 0);
        bucket.evidence.add(`${column} → ${field.label}`);
        kpiBuckets.set(field.kpiKey, bucket);
      }
    }
  }

  const relationships = detectRelationships(tables);
  const areas: SemanticBusinessArea[] = [...areaBuckets.entries()]
    .map(([area, bucket]) => ({
      id: `area-${area}`,
      area,
      label: bucket.label,
      confidence: Math.round(bucket.confidence * 100) / 100,
      evidence: [...bucket.evidence].slice(0, 4),
      sheets: [...bucket.sheets],
    }))
    .sort((a, b) => b.confidence - a.confidence || b.sheets.length - a.sheets.length);

  const entities: SemanticEntity[] = [...entityBuckets.entries()]
    .map(([type, bucket]) => ({
      id: `entity-${type}`,
      type,
      label: entityLabel(type),
      confidence: Math.round(bucket.confidence * 100) / 100,
      evidence: [...bucket.evidence].slice(0, 4),
      columns: [...bucket.columns],
      sheets: [...bucket.sheets],
    }))
    .sort((a, b) => b.sheets.length - a.sheets.length);

  const kpis: SemanticKpi[] = [...kpiBuckets.entries()]
    .map(([key, bucket]) => ({
      id: `kpi-${key}`,
      key,
      label: bucket.label,
      confidence: Math.round(bucket.confidence * 100) / 100,
      evidence: [...bucket.evidence].slice(0, 4),
      columns: [...bucket.columns],
      sheets: [...bucket.sheets],
      area: bucket.area,
    }))
    .sort((a, b) => b.confidence - a.confidence || b.sheets.length - a.sheets.length);

  const confidence = mappedColumns + unmappedColumns > 0 ? mappedColumns / (mappedColumns + unmappedColumns) : 0;
  const warnings = [
    ...(areas.length === 0 ? ["No se detectaron áreas comerciales con alta confianza."] : []),
    ...(kpis.length === 0 ? ["No se detectaron KPIs comerciales reconocibles."] : []),
    ...(entities.length === 0 ? ["No se detectaron entidades comerciales reconocibles."] : []),
  ];

  return {
    sourceFingerprint: buildSourceFingerprint(sheets),
    summary: `${areas.length} áreas, ${kpis.length} KPIs, ${entities.length} entidades y ${relationships.length} relaciones detectadas`,
    areas,
    entities,
    kpis,
    relationships,
    tables,
    quality: {
      mappedColumns,
      unmappedColumns,
      confidence: Math.round(confidence * 100) / 100,
      warnings,
    },
  };
}

function entityLabel(type: CommercialEntityType): string {
  const labels: Record<CommercialEntityType, string> = {
    sku: "SKU",
    brand: "Marca",
    product: "Producto",
    client: "Cliente",
    pdv: "PDV",
    channel: "Canal",
    region: "Región",
    distributor: "Distribuidor",
    category: "Categoría",
    period: "Período",
    invoice: "Factura",
    account: "Cuenta contable",
    warehouse: "Depósito",
  };
  return labels[type];
}

function detectRelationships(tables: DetectedTable[]): SemanticRelationship[] {
  const relationships: SemanticRelationship[] = [];
  for (let i = 0; i < tables.length; i++) {
    for (let j = i + 1; j < tables.length; j++) {
      const left = tables[i];
      const right = tables[j];
      const shared = left.columns.filter((column) => right.columns.some((candidate) => compact(candidate) === compact(column)));
      const semanticShared = shared.filter((column) => {
        const mapping = detectSemanticMappingForColumn(column, `${left.sheetName} ${right.sheetName}`);
        return mapping?.detectedType === "entity" || mapping?.detectedType === "time" || mapping?.detectedType === "dimension";
      });
      if (semanticShared.length === 0) continue;
      const factDim = (left.role === "fact" && right.role === "dimension") || (left.role === "dimension" && right.role === "fact");
      relationships.push({
        id: `rel-${compact(left.sheetName)}-${compact(right.sheetName)}`,
        type: factDim ? "fact-dimension" : left.role === "kpi" || right.role === "kpi" ? "kpi-lineage" : "shared-key",
        fromSheet: left.sheetName,
        toSheet: right.sheetName,
        columns: semanticShared.slice(0, 5),
        confidence: factDim ? 0.86 : 0.68,
        description: `${left.sheetName} comparte ${semanticShared.slice(0, 3).join(", ")} con ${right.sheetName}`,
      });
    }
  }
  return relationships.slice(0, 40);
}

function buildSourceFingerprint(sheets: RawSheetProfile[]): string {
  const signature = sheets
    .map((sheet) => `${compact(sheet.name)}:${sheet.rows}:${sheet.columns.map(compact).slice(0, 12).join(",")}`)
    .join("|");
  let hash = 0;
  for (let i = 0; i < signature.length; i++) {
    hash = (hash * 31 + signature.charCodeAt(i)) >>> 0;
  }
  return `sem-${hash.toString(16)}`;
}

export function enrichProcessedSheetsWithSemantics(sheets: ProcessedSheet[], profile: SemanticDatasetProfile): ProcessedSheet[] {
  return sheets.map((sheet) => {
    const table = profile.tables.find((item) => item.sheetName === sheet.name);
    return table ? { ...sheet, domain: table.domain } : sheet;
  });
}

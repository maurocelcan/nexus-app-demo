/**
 * Período al que corresponde un KPI fact.
 * - YTD  = acumulado del año (año comparativo: año anterior)
 * - QTD  = trimestre corriente (Q1 en BIS)
 * - U6M  = últimos 6 meses (U6M en BIS)
 * - MA   = Móvil Anual (MA en BIS)
 * - MTD  = mes corriente (no siempre disponible)
 * - CUSTOM = corte ad-hoc
 */
export type KpiFactPeriod = "YTD" | "QTD" | "U6M" | "MA" | "MTD" | "CUSTOM";

/**
 * Granularidad de un KPI fact.
 */
export type KpiGrain =
  | "TOTAL"
  | "SKU"
  | "CANAL"
  | "CLIENTE"
  | "SKU_CANAL"
  | "PDV"
  | "ZONA"
  | "DISTRIBUIDOR";

/**
 * Un hecho de KPI canonicalizado. Permite expresar un valor + variación
 * para un período y granularidad específicos, con trazabilidad a la fuente.
 * Si `isAvailable === false`, el valor no existe en el archivo y se muestra N/A.
 */
export interface CommercialKpiFact {
  /** Clave semántica del KPI */
  key: CommercialKpiKey;
  /** Etiqueta legible */
  label: string;
  /** Período al que corresponde el valor */
  period: KpiFactPeriod;
  /** Año del valor (ej. 2026) */
  year: number;
  /** Valor del período actual (undefined = no disponible) */
  value?: number;
  /** Valor del período equivalente del año anterior */
  priorValue?: number;
  /** Variación % vs año anterior */
  variationPct?: number;
  /** Variación absoluta vs año anterior */
  variationAbs?: number;
  /** Unidad del valor */
  unit: "currency" | "volume" | "ratio" | "count" | "pct";
  /** Granularidad del fact */
  grain: KpiGrain;
  /** Hoja de origen */
  sourceSheet?: string;
  /** Área comercial de referencia */
  module?: CommercialBusinessArea;
  /** Hay dato disponible para este período/granularidad */
  isAvailable: boolean;
  /** Si !isAvailable, razón para mostrar al usuario */
  unavailableReason?: string;
}

export type SheetDomain =
  | "sales"
  | "finance"
  | "trade"
  | "supply"
  | "rgm"
  | "planning"
  | "crm"
  | "dimension"
  | "control"
  | "unknown";

export type CommercialBusinessArea =
  | "sales"
  | "sell-through"
  | "finance"
  | "trade-marketing"
  | "supply-chain"
  | "rgm"
  | "planning"
  | "crm"
  | "marketing"
  | "master-data"
  | "control"
  | "unknown";

export type CommercialEntityType =
  | "sku"
  | "brand"
  | "product"
  | "client"
  | "pdv"
  | "channel"
  | "region"
  | "distributor"
  | "category"
  | "period"
  | "invoice"
  | "account"
  | "warehouse";

export type CommercialKpiKey =
  | "sellInVolume"
  | "sellOutVolume"
  | "sellThrough"
  | "netRevenue"
  | "grossRevenue"
  | "ebitda"
  | "grossMargin"
  | "grossMarginPct"
  | "cogs"
  | "cogsPct"
  | "opex"
  | "tradeSpend"
  | "passthrough"
  | "priceIndex"
  | "asp"
  | "numericDistribution"
  | "buyerCustomers"
  | "buyerPdvs"
  | "activePdvs"
  | "pdvUniverse"
  | "successPhoto"
  | "mixReal"
  | "mixTarget"
  | "estimatedMargin"
  | "pdvOpportunity"
  | "ebitdaPct"
  | "inventory"
  | "fillRate"
  | "otif"
  | "dso"
  | "daysLate"
  | "invoiceAmount"
  | "collectedAmount"
  | "openBalance"
  | "promotionalRoi"
  | "shareOfShelf"
  | "marketShare"
  | "householdPenetration"
  | "brandAwareness"
  | "shareOfVoice"
  | "marketingSpend"
  | "campaignRoi";

export interface SemanticDetection {
  id: string;
  label: string;
  confidence: number;
  evidence: string[];
}

export interface SemanticBusinessArea extends SemanticDetection {
  area: CommercialBusinessArea;
  sheets: string[];
}

export interface SemanticEntity extends SemanticDetection {
  type: CommercialEntityType;
  columns: string[];
  sheets: string[];
}

export interface SemanticKpi extends SemanticDetection {
  key: CommercialKpiKey;
  columns: string[];
  sheets: string[];
  area: CommercialBusinessArea;
}

export interface SemanticRelationship {
  id: string;
  type: "shared-key" | "fact-dimension" | "kpi-lineage";
  fromSheet: string;
  toSheet: string;
  columns: string[];
  confidence: number;
  description: string;
}

export interface DetectedTable {
  id: string;
  sheetName: string;
  headerRowIndex: number;
  rows: number;
  columns: string[];
  domain: SheetDomain;
  areas: CommercialBusinessArea[];
  role: "fact" | "dimension" | "kpi" | "bridge" | "control" | "staging" | "unknown";
  confidence: number;
}

export interface SemanticDatasetProfile {
  sourceFingerprint: string;
  summary: string;
  areas: SemanticBusinessArea[];
  entities: SemanticEntity[];
  kpis: SemanticKpi[];
  relationships: SemanticRelationship[];
  tables: DetectedTable[];
  quality: {
    mappedColumns: number;
    unmappedColumns: number;
    confidence: number;
    warnings: string[];
  };
}

export interface ProcessedSheet {
  name: string;
  rows: number;
  columns: string[];
  domain: SheetDomain;
  status: "processed" | "warning" | "error";
}

export interface SalesKpis {
  sellInYtd?: number;
  sellOutYtd?: number;
  netRevenueYtd?: number;
  grossRevenue?: number;
  grossRevenueVarPct?: number;
  ebitdaYtd?: number;
  passthrough?: number;
  activeDirectClients?: number;
  activePdvs?: number;
  priceIndexAvg?: number;
  sellInVarPct?: number;
  sellOutVarPct?: number;
  netRevenueVarPct?: number;
  ebitdaVarPct?: number;
  passthroughVarPct?: number;
  priceIndexVarPct?: number;
  buyerCustomers?: number;
  buyerCustomersVarPct?: number;
  buyerPdvs?: number;
  buyerPdvsVarPct?: number;
  activePdvsVarPct?: number;
  pdvUniverse?: number;
  pdvUniverseVarPct?: number;
  successPhoto?: number;
  successPhotoVarPct?: number;
  numericDistribution?: number;
  numericDistributionVarPct?: number;
  grossMargin?: number;
  grossMarginVarPct?: number;
  /**
   * Monto monetario de COGS. El nombre histórico `cogsPct` se conserva por
   * compatibilidad con adapters/componentes existentes; no representa un %.
   */
  cogsPct?: number;
  cogsPctVarPct?: number;
  asp?: number;
  aspVarPct?: number;
  tradeSpend?: number;
  tradeSpendVarPct?: number;
  opex?: number;
  opexVarPct?: number;
}

export interface ColumnMapping {
  fileColumn: string;
  nexusField: string;
  sheet: string;
  confidence?: number;
  semanticKey?: string;
  detectedType?: "entity" | "metric" | "dimension" | "time" | "ignore";
}

export interface NormalizedSellInRow {
  month?: string;
  skuId?: string;
  skuName?: string;
  clientId?: string;
  clientName?: string;
  channel?: string;
  volumeCajas?: number;
  netRevenue?: number;
  ebitda?: number;
}

export interface NormalizedSellOutRow {
  month?: string;
  skuId?: string;
  skuName?: string;
  pdvId?: string;
  clientId?: string;
  clientName?: string;
  channel?: string;
  volumeCajasOut?: number;
  priceIndex?: number;
}

export interface NormalizedProduct {
  id: string;
  name: string;
  displayName?: string; // user-editable or auto-composed label (e.g. "Coca Cola 473ml")
  brand?: string;
  format?: string;
  category?: string;
}

export interface EntityLabelOverride {
  entityType: "product" | "client" | "channel" | "pdv";
  entityId: string;
  displayName: string;
}

export interface NormalizedClient {
  id: string;
  name: string;
  channel?: string;
}

export interface NormalizedPdv {
  id: string;
  clientId?: string;
  name?: string;
  channel?: string;
}

export interface GeoPdvFact {
  id: string;
  name: string;
  zone: string;
  channel: string;
  address?: string;
  lat?: number;
  lng?: number;
  status?: string;
  isAttended: boolean;
  hasPurchase: boolean;
  volume?: number;
  revenue?: number;
  averageTicket?: number;
  visitFrequency?: string;
  opportunity?: number;
  sourceSheet: string;
}

export interface SellThroughMonthlyPoint {
  month: string;
  netRevenue?: number;
  volume?: number;
  sellIn?: number;
  sellOut?: number;
  passthrough?: number;
}

export interface FinanceMonthlyPoint {
  month: string;
  grossRevenue?: number;
  tradeSpend?: number;
  netRevenue?: number;
  cogs?: number;
  grossProfit?: number;
  ga?: number;
  structuralExpenses?: number;
  ebitda?: number;
  grossMarginPct?: number;
  cogsPct?: number;
  ebitdaPct?: number;
}

export interface FinanceHeadcountFact {
  area: string;
  period: KpiFactPeriod;
  year: number;
  value?: number;
  priorValue?: number;
  variationPct?: number;
  variationAbs?: number;
}

export interface SalesFilters {
  period: "MTD" | "QTD" | "YTD" | "6M" | "12M";
  skuId?: string;
  channel?: string;
  clientId?: string;
}

export interface ValidationResult {
  warnings: string[];
  errors: string[];
  sheetsFound: string[];
  sheetsMissing: string[];
  columnMappings: ColumnMapping[];
}

export interface ProcessedDataset {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  sourceType?: "file" | "integration";
  sourceProvider?: string;
  sourceProviderName?: string;
  sheets: ProcessedSheet[];
  salesKpis: SalesKpis;
  salesTables: {
    sellIn?: Record<string, unknown>[];
    sellOut?: Record<string, unknown>[];
    products?: Record<string, unknown>[];
    directClients?: Record<string, unknown>[];
    indirectClients?: Record<string, unknown>[];
  };
  salesData?: {
    sellInRows: NormalizedSellInRow[];
    sellOutRows: NormalizedSellOutRow[];
    products: NormalizedProduct[];
    directClients: NormalizedClient[];
    indirectClients: NormalizedPdv[];
  };
  availableFilters?: {
    months: string[];
    skus: { id: string; name: string }[];
    channels: string[];
    clients: { id: string; name: string }[];
    zones?: string[];
    distributors?: { id: string; name: string }[];
  };
  mapping?: ColumnMapping[];
  semanticProfile?: SemanticDatasetProfile;
  metadata?: {
    sourceFormat?: string;
    sourceSheets?: string[];
    primarySheet?: string;
    ignoredBlocks?: string[];
    detectedKpis?: string[];
    warnings?: string[];
    kpiSources?: Record<string, string>;
  };
  entityOverrides?: EntityLabelOverride[];
  /**
   * Capa canónica de KPI facts por período y granularidad.
   * Generada por el adapter BIS (Resumen Demo App) y futuros adapters específicos.
   * Permite resolver KPIs correctos para cada período de filtro sin ambigüedad.
   */
  kpiFacts?: CommercialKpiFact[];
  geoPdvFacts?: GeoPdvFact[];
  sellThroughMonthly?: SellThroughMonthlyPoint[];
  financeMonthly?: FinanceMonthlyPoint[];
  financeHeadcount?: FinanceHeadcountFact[];
  validation: ValidationResult;
}

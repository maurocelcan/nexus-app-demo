export type DataSourceType =
  | "file"
  | "google-sheets"
  | "hubspot"
  | "salesforce"
  | "bigquery"
  | "snowflake"
  | "sap"
  | "power-bi"
  | "looker"
  | "sql"
  | "csv-excel"
  | "custom";

export type DataSourceStatus = "connected" | "disconnected" | "error" | "syncing" | "processing" | "processed";

export type DataCategory =
  | "sell-in"
  | "sell-out"
  | "clientes"
  | "promociones"
  | "stock"
  | "finanzas"
  | "trade-marketing"
  | "demo";

export interface DataFile {
  id: string;
  name: string;
  type: string;
  size: string;
  area: string;
  category: DataCategory;
  status: DataSourceStatus;
  period: string;
  description?: string;
  uploadedAt: string;
  owner: string;
  rows?: number;
  datasetId?: string;
  sourceFingerprint?: string;
  origin?: "file" | "demo" | "google-sheets" | "bigquery" | "snowflake" | "sql" | "hubspot" | "salesforce";
  sourceIntegrationType?: DataSourceType;
  externalSourceName?: string;
  lastSync?: string;
}

export interface Integration {
  id: string;
  type: DataSourceType;
  name: string;
  description: string;
  status: DataSourceStatus;
  icon: string;
  connectedAt?: string;
  lastSync?: string;
}

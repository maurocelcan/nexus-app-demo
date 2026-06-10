import { DEMO_PROCESSED_DATASET } from "@/data/demo-processed-dataset";
import type { ProcessedDataset } from "@/types/dataset";
import { generateId } from "@/lib/utils";

const PROVIDER_LABELS: Record<string, string> = {
  "google-sheets": "Google Sheets",
  bigquery: "BigQuery",
  snowflake: "Snowflake",
  sql: "SQL Database",
  hubspot: "HubSpot",
  salesforce: "Salesforce",
  sap: "SAP",
};

export function generateIntegrationDataset(
  providerType: string,
  providerName?: string,
  tableNames?: string[]
): ProcessedDataset {
  const now = new Date().toISOString();
  const label = providerName ?? PROVIDER_LABELS[providerType] ?? providerType;
  const tables = tableNames?.length ? tableNames : ["Fact_Ventas_Sell_In", "Fact_Ventas_Sell_Out", "KPIs_Calculados"];

  return {
    ...DEMO_PROCESSED_DATASET,
    id: `int-dataset-${generateId()}`,
    fileName: `${label} · CPG Portfolio 2025-2026`,
    fileSize: 0,
    uploadedAt: now,
    sourceType: "integration",
    sourceProvider: providerType,
    sourceProviderName: label,
    sheets: tables.map((name, i) => ({
      name,
      rows: 5200 + i * 840,
      columns: ["Mes", "SKU_ID", "Cliente_ID", "Canal", "Volumen_Cajas", "Net_Revenue"],
      domain: (["sales", "sales", "control", "finance", "dimension"] as const)[i % 5],
      status: "processed" as const,
    })),
    validation: {
      ...DEMO_PROCESSED_DATASET.validation,
      sheetsFound: tables,
      sheetsMissing: [],
      warnings: [],
    },
  };
}

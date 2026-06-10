"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DataFile, Integration } from "@/types/data-source";
import type { EntityLabelOverride, ProcessedDataset } from "@/types/dataset";
import { DEMO_FILES, INTEGRATIONS } from "@/data/mock-data-sources";
import { DEMO_PROCESSED_DATASET } from "@/data/demo-processed-dataset";
import { generateId } from "@/lib/utils";

export type DataConnectionStatus = "empty" | "processing" | "ready" | "error";

// "file" = real uploaded xlsx/csv; "integration" = mock integration; "demo" = Demo CPG
export type DatasetSource = "file" | "integration" | "demo";
export type WorkspaceDatasetState = "empty" | "demo" | "real";

export interface AvailableDataset {
  id: DatasetSource;
  name: string;
  sourceType: DatasetSource;
  provider?: string;
  dataset: ProcessedDataset | null; // null means use DEMO_PROCESSED_DATASET
  lastUpdated?: string;
}

interface DataSourceStore {
  files: DataFile[];
  integrations: Integration[];
  hasDemoLoaded: boolean;
  dataConnectionStatus: DataConnectionStatus;
  lastProcessedFileName?: string;
  activeDatasetSource: DatasetSource | null; // persisted: which logical dataset is active
  // in-memory only (lost on page reload — acceptable for prototype)
  fileDataset: ProcessedDataset | null;
  integrationDataset: ProcessedDataset | null;

  loadDemo: () => void;
  addFile: (file: Omit<DataFile, "id">) => DataFile;
  replaceFileDataset: (dataset: ProcessedDataset, files: Omit<DataFile, "id">[]) => void;
  removeFile: (id: string) => void;
  removeFilesByIntegration: (type: NonNullable<DataFile["sourceIntegrationType"]>) => void;
  addIntegration: (integration: Omit<Integration, "id">) => Integration;
  updateIntegration: (id: string, patch: Partial<Integration>) => void;
  setDataConnectionStatus: (status: DataConnectionStatus) => void;
  setLastProcessedFileName: (name: string) => void;
  setFileDataset: (dataset: ProcessedDataset | null) => void;
  setIntegrationDataset: (dataset: ProcessedDataset | null) => void;
  setActiveDatasetSource: (source: DatasetSource | null) => void;
  updateEntityLabel: (source: DatasetSource, override: EntityLabelOverride) => void;
  reset: () => void;
}

function mergeDemoFiles(files: DataFile[]): DataFile[] {
  const nonDemoFiles = files.filter((file) => file.origin !== "demo");
  const customDemoFiles = files.filter(
    (file) => file.origin === "demo" && !DEMO_FILES.some((demoFile) => demoFile.id === file.id)
  );
  return [...DEMO_FILES, ...customDemoFiles, ...nonDemoFiles];
}

function datasetFormat(dataset: ProcessedDataset | null): string | undefined {
  return dataset?.metadata?.sourceFormat;
}

function canMergeFileDatasets(current: ProcessedDataset | null, incoming: ProcessedDataset): boolean {
  const currentFormat = datasetFormat(current);
  const incomingFormat = datasetFormat(incoming);
  if (!current || !currentFormat || !incomingFormat) return false;
  if (currentFormat === incomingFormat) return false;
  return [currentFormat, incomingFormat].includes("resumen-demo-app") && [currentFormat, incomingFormat].includes("pdv-geo");
}

function mergeById<T extends { id: string }>(left: T[] = [], right: T[] = []): T[] {
  const map = new Map<string, T>();
  for (const item of left) map.set(item.id, item);
  for (const item of right) map.set(item.id, item);
  return [...map.values()];
}

function mergeFileDatasets(current: ProcessedDataset, incoming: ProcessedDataset): ProcessedDataset {
  const newest = incoming.uploadedAt >= current.uploadedAt ? incoming : current;
  return {
    ...current,
    id: `dataset-${generateId()}`,
    fileName: `${current.fileName.replace(/\.[^.]+$/, "")} + ${incoming.fileName}`,
    fileSize: current.fileSize + incoming.fileSize,
    uploadedAt: newest.uploadedAt,
    sheets: [...current.sheets, ...incoming.sheets],
    salesKpis: { ...current.salesKpis, ...incoming.salesKpis },
    salesTables: {
      sellIn: [...(current.salesTables.sellIn ?? []), ...(incoming.salesTables.sellIn ?? [])],
      sellOut: [...(current.salesTables.sellOut ?? []), ...(incoming.salesTables.sellOut ?? [])],
      products: [...(current.salesTables.products ?? []), ...(incoming.salesTables.products ?? [])],
      directClients: [...(current.salesTables.directClients ?? []), ...(incoming.salesTables.directClients ?? [])],
      indirectClients: [...(current.salesTables.indirectClients ?? []), ...(incoming.salesTables.indirectClients ?? [])],
    },
    salesData: {
      sellInRows: [...(current.salesData?.sellInRows ?? []), ...(incoming.salesData?.sellInRows ?? [])],
      sellOutRows: [...(current.salesData?.sellOutRows ?? []), ...(incoming.salesData?.sellOutRows ?? [])],
      products: mergeById(current.salesData?.products, incoming.salesData?.products),
      directClients: mergeById(current.salesData?.directClients, incoming.salesData?.directClients),
      indirectClients: mergeById(current.salesData?.indirectClients, incoming.salesData?.indirectClients),
    },
    availableFilters: {
      months: [...new Set([...(current.availableFilters?.months ?? []), ...(incoming.availableFilters?.months ?? [])])].sort(),
      skus: mergeById(current.availableFilters?.skus, incoming.availableFilters?.skus).sort((a, b) => a.name.localeCompare(b.name)),
      channels: [...new Set([...(current.availableFilters?.channels ?? []), ...(incoming.availableFilters?.channels ?? [])])].sort(),
      clients: mergeById(current.availableFilters?.clients, incoming.availableFilters?.clients).sort((a, b) => a.name.localeCompare(b.name)),
      zones: [...new Set([...(current.availableFilters?.zones ?? []), ...(incoming.availableFilters?.zones ?? [])])].sort(),
      distributors: mergeById(current.availableFilters?.distributors, incoming.availableFilters?.distributors).sort((a, b) => a.name.localeCompare(b.name)),
    },
    mapping: [...(current.mapping ?? []), ...(incoming.mapping ?? [])],
    kpiFacts: [...(current.kpiFacts ?? []), ...(incoming.kpiFacts ?? [])],
    geoPdvFacts: mergeById(current.geoPdvFacts, incoming.geoPdvFacts),
    sellThroughMonthly: [...(current.sellThroughMonthly ?? []), ...(incoming.sellThroughMonthly ?? [])]
      .sort((a, b) => a.month.localeCompare(b.month)),
    financeMonthly: [...(current.financeMonthly ?? []), ...(incoming.financeMonthly ?? [])]
      .sort((a, b) => a.month.localeCompare(b.month)),
    financeHeadcount: [...(current.financeHeadcount ?? []), ...(incoming.financeHeadcount ?? [])],
    metadata: {
      sourceFormat: "combined-real-datasets",
      sourceSheets: [...new Set([...(current.metadata?.sourceSheets ?? []), ...(incoming.metadata?.sourceSheets ?? [])])],
      primarySheet: current.metadata?.primarySheet,
      ignoredBlocks: [...(current.metadata?.ignoredBlocks ?? []), ...(incoming.metadata?.ignoredBlocks ?? [])],
      detectedKpis: [...new Set([...(current.metadata?.detectedKpis ?? []), ...(incoming.metadata?.detectedKpis ?? [])])],
      warnings: [...(current.metadata?.warnings ?? []), ...(incoming.metadata?.warnings ?? [])],
      kpiSources: { ...(current.metadata?.kpiSources ?? {}), ...(incoming.metadata?.kpiSources ?? {}) },
    },
    validation: {
      warnings: [...current.validation.warnings, ...incoming.validation.warnings],
      errors: [...current.validation.errors, ...incoming.validation.errors],
      sheetsFound: [...new Set([...current.validation.sheetsFound, ...incoming.validation.sheetsFound])],
      sheetsMissing: [...new Set([...current.validation.sheetsMissing, ...incoming.validation.sheetsMissing])],
      columnMappings: [...current.validation.columnMappings, ...incoming.validation.columnMappings],
    },
  };
}

export const useDataSourceStore = create<DataSourceStore>()(
  persist(
    (set) => ({
      files: [],
      integrations: INTEGRATIONS,
      hasDemoLoaded: false,
      dataConnectionStatus: "empty" as DataConnectionStatus,
      lastProcessedFileName: undefined,
      activeDatasetSource: null,
      fileDataset: null,
      integrationDataset: null,

      loadDemo: () =>
        set((s) => ({
          files: mergeDemoFiles(s.files),
          hasDemoLoaded: true,
          dataConnectionStatus: "ready",
          activeDatasetSource: "demo",
        })),

      addFile: (file) => {
        const newFile: DataFile = { ...file, id: `file-${generateId()}` };
        set((s) => ({
          files: [newFile, ...s.files],
          dataConnectionStatus: "ready",
        }));
        return newFile;
      },

      replaceFileDataset: (dataset, files) =>
        set((s) => {
          const shouldMerge = canMergeFileDatasets(s.fileDataset, dataset);
          const nextDataset = shouldMerge && s.fileDataset ? mergeFileDatasets(s.fileDataset, dataset) : dataset;
          const sourceFingerprint = nextDataset.semanticProfile?.sourceFingerprint;
          const nextFiles = files.map((file, index) => ({
            ...file,
            id: `file-${generateId()}-${index}`,
            datasetId: nextDataset.id,
            sourceFingerprint,
            origin: "file" as const,
          }));
          return {
            files: [
              ...nextFiles,
              ...s.files.filter((file) => file.origin !== "file" || shouldMerge),
            ],
            fileDataset: nextDataset,
            dataConnectionStatus: "ready" as DataConnectionStatus,
            lastProcessedFileName: nextDataset.fileName.replace(/\.[^.]+$/, ""),
            activeDatasetSource: "file" as DatasetSource,
          };
        }),

      removeFile: (id) =>
        set((s) => {
          const removed = s.files.find((f) => f.id === id);
          const files = s.files.filter((f) => f.id !== id);
          const wasRealFile = removed && (removed.origin === "file" || (!removed.origin && ["csv", "xlsx", "xls"].includes(removed.type)));
          const realFilesLeft = files.filter((f) => f.origin === "file" || (!f.origin && ["csv", "xlsx", "xls"].includes(f.type)));
          const clearFileDataset = wasRealFile && realFilesLeft.length === 0;
          let nextSource = s.activeDatasetSource;
          if (clearFileDataset && s.activeDatasetSource === "file") {
            nextSource = s.integrationDataset ? "integration" : s.hasDemoLoaded ? "demo" : null;
          }
          return {
            files,
            dataConnectionStatus: files.length > 0 || s.hasDemoLoaded ? "ready" : "empty",
            fileDataset: clearFileDataset ? null : s.fileDataset,
            activeDatasetSource: nextSource,
          };
        }),

      removeFilesByIntegration: (type) =>
        set((s) => {
          const files = s.files.filter((f) => f.sourceIntegrationType !== type && f.origin !== type);
          const nextSource = s.activeDatasetSource === "integration"
            ? (s.fileDataset ? "file" : s.hasDemoLoaded ? "demo" : null)
            : s.activeDatasetSource;
          return {
            files,
            dataConnectionStatus: files.length > 0 || s.hasDemoLoaded ? "ready" : "empty",
            integrationDataset: null,
            activeDatasetSource: nextSource,
          };
        }),

      addIntegration: (integration) => {
        const newIntegration: Integration = { ...integration, id: `int-${generateId()}` };
        set((s) => ({ integrations: [newIntegration, ...s.integrations] }));
        return newIntegration;
      },

      updateIntegration: (id, patch) =>
        set((s) => ({
          integrations: s.integrations.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),

      setDataConnectionStatus: (status) => set({ dataConnectionStatus: status }),

      setLastProcessedFileName: (name) => set({ lastProcessedFileName: name }),

      setFileDataset: (dataset) =>
        set((s) => ({
          fileDataset: dataset,
          // auto-activate if nothing is active yet
          activeDatasetSource: s.activeDatasetSource === null && dataset !== null ? "file" : s.activeDatasetSource,
        })),

      setIntegrationDataset: (dataset) =>
        set((s) => ({
          integrationDataset: dataset,
          activeDatasetSource: s.activeDatasetSource === null && dataset !== null ? "integration" : s.activeDatasetSource,
        })),

      setActiveDatasetSource: (source) => set({ activeDatasetSource: source }),

      updateEntityLabel: (source, override) =>
        set((s) => {
          function applyOverride(dataset: ProcessedDataset | null): ProcessedDataset | null {
            if (!dataset) return null;
            const existing = (dataset.entityOverrides ?? []).filter(
              (o) => !(o.entityType === override.entityType && o.entityId === override.entityId)
            );
            const entityOverrides = [...existing, override];
            const salesData = dataset.salesData
              ? {
                  ...dataset.salesData,
                  products: dataset.salesData.products.map((p) =>
                    override.entityType === "product" && p.id === override.entityId
                      ? { ...p, displayName: override.displayName }
                      : p
                  ),
                }
              : dataset.salesData;
            return { ...dataset, entityOverrides, salesData };
          }
          if (source === "file") return { fileDataset: applyOverride(s.fileDataset) };
          if (source === "integration") return { integrationDataset: applyOverride(s.integrationDataset) };
          return {};
        }),

      reset: () =>
        set({
          files: [],
          integrations: INTEGRATIONS,
          hasDemoLoaded: false,
          dataConnectionStatus: "empty",
          lastProcessedFileName: undefined,
          activeDatasetSource: null,
          fileDataset: null,
          integrationDataset: null,
        }),
    }),
    {
      name: "nexus-data-sources",
      version: 4,
      partialize: (state) => ({
        files: state.files,
        integrations: state.integrations,
        hasDemoLoaded: state.hasDemoLoaded,
        dataConnectionStatus: state.dataConnectionStatus,
        lastProcessedFileName: state.lastProcessedFileName,
        activeDatasetSource: state.activeDatasetSource,
      }),
      migrate: (_persistedState: unknown, version: number) => {
        if (version < 3) {
          return {
            files: [],
            integrations: INTEGRATIONS,
            hasDemoLoaded: false,
            dataConnectionStatus: "empty" as DataConnectionStatus,
            lastProcessedFileName: undefined,
            activeDatasetSource: null,
          };
        }
        const state = _persistedState as Partial<DataSourceStore>;
        if (state.hasDemoLoaded) {
          return {
            ...state,
            files: mergeDemoFiles(state.files ?? []),
            integrations: state.integrations ?? INTEGRATIONS,
            dataConnectionStatus: "ready" as DataConnectionStatus,
          };
        }
        return _persistedState;
      },
    }
  )
);

export function hasAnyDataSource(store: { files: DataFile[]; hasDemoLoaded: boolean }): boolean {
  return store.files.length > 0 || store.hasDemoLoaded;
}

export function getWorkspaceDatasetState(store: {
  activeDatasetSource: DatasetSource | null;
  fileDataset: ProcessedDataset | null;
  integrationDataset: ProcessedDataset | null;
  hasDemoLoaded: boolean;
}): WorkspaceDatasetState {
  if (store.activeDatasetSource === "demo" && store.hasDemoLoaded) return "demo";
  if (store.activeDatasetSource === "file" && store.fileDataset) return "real";
  if (store.activeDatasetSource === "integration" && store.integrationDataset) return "real";
  return "empty";
}

export function getWorkspaceDatasetLabel(state: WorkspaceDatasetState): string {
  if (state === "demo") return "Demo CPG activa";
  if (state === "real") return "Dataset real activo";
  return "Sin datasets activos";
}

/**
 * Returns the ProcessedDataset for the currently active source.
 * "demo" returns DEMO_PROCESSED_DATASET (not null) for convenience.
 */
export function getActiveDataset(store: {
  activeDatasetSource: DatasetSource | null;
  fileDataset: ProcessedDataset | null;
  integrationDataset: ProcessedDataset | null;
  hasDemoLoaded: boolean;
}): ProcessedDataset | null {
  switch (store.activeDatasetSource) {
    case "file": return store.fileDataset;
    case "integration": return store.integrationDataset;
    case "demo": return store.hasDemoLoaded ? DEMO_PROCESSED_DATASET : null;
    default: return null;
  }
}

/**
 * Returns the list of logical datasets the user has connected.
 * One entry per source type (file, integration, demo) — not one per file/table.
 */
export function getAvailableDatasets(store: {
  fileDataset: ProcessedDataset | null;
  integrationDataset: ProcessedDataset | null;
  hasDemoLoaded: boolean;
}): AvailableDataset[] {
  const result: AvailableDataset[] = [];
  if (store.fileDataset) {
    result.push({
      id: "file",
      name: store.fileDataset.fileName,
      sourceType: "file",
      dataset: store.fileDataset,
      lastUpdated: store.fileDataset.uploadedAt,
    });
  }
  if (store.integrationDataset) {
    result.push({
      id: "integration",
      name: store.integrationDataset.sourceProviderName ?? store.integrationDataset.fileName,
      sourceType: "integration",
      provider: store.integrationDataset.sourceProvider,
      dataset: store.integrationDataset,
      lastUpdated: store.integrationDataset.uploadedAt,
    });
  }
  if (store.hasDemoLoaded) {
    result.push({
      id: "demo",
      name: "Demo CPG Portfolio 2025-2026",
      sourceType: "demo",
      provider: "demo_cpg",
      dataset: DEMO_PROCESSED_DATASET,
    });
  }
  return result;
}

/** Backward-compat helper: resolves whichever non-demo dataset is present */
export function resolveDataset(store: {
  fileDataset: ProcessedDataset | null;
  integrationDataset: ProcessedDataset | null;
}): ProcessedDataset | null {
  return store.fileDataset ?? store.integrationDataset ?? null;
}

/** Returns the resolved display name for a product, respecting user overrides */
export function resolveProductDisplayName(dataset: ProcessedDataset | null, skuId: string, fallback: string): string {
  if (!dataset) return fallback;
  const override = dataset.entityOverrides?.find((o) => o.entityType === "product" && o.entityId === skuId);
  if (override) return override.displayName;
  const product = dataset.salesData?.products.find((p) => p.id === skuId);
  return product?.displayName ?? product?.name ?? fallback;
}

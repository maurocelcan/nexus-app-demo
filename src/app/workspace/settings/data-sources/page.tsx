"use client";
import React, { useMemo, useState, useRef } from "react";
import {
  Database, Upload, RefreshCw, CheckCircle,
  Loader2, FileText, Plus, AlertTriangle, Zap, RotateCcw,
  Search, MoreVertical, Eye, Trash2, Download, Map, ArrowUpDown,
  Cloud, Table2, ShieldCheck, CheckSquare, Square, X, Pencil, Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useDataSourceStore, resolveDataset } from "@/stores/data-source-store";
import { useAuthStore } from "@/stores/auth-store";
import { canConnectDataSource, canDeleteDataSource, canSyncDataSource } from "@/lib/permissions";
import {
  GOOGLE_SHEETS_DOCUMENTS,
  INTEGRATION_PROVIDERS,
  INTEGRATION_TABLES,
  PROVIDER_CONTAINERS,
  PROVIDER_OBJECTS,
} from "@/data/mock-data-sources";
import { NEXUS_FIELD_OPTIONS, processExcelFile } from "@/lib/file-processor";
import { activateFullDemo } from "@/lib/demo";
import { resetWorkspace } from "@/lib/reset";
import { generateIntegrationDataset } from "@/lib/integration-dataset";
import { cn, sleep } from "@/lib/utils";
import type { DataFile, DataSourceType } from "@/types/data-source";
import type { ColumnMapping, NormalizedProduct, ProcessedDataset, SheetDomain } from "@/types/dataset";

const fmtInt = (n: number) => n.toLocaleString("es-AR");
const fmtUsd = (n: number) =>
  n >= 1_000_000
    ? `USD ${(n / 1_000_000).toFixed(1)}M`
    : `USD ${Math.round(n / 1000)}K`;
const fmtPct = (n: number) => `${Math.round(n * 1000) / 10}%`;

function domainToArea(domain: SheetDomain): string {
  const map: Record<SheetDomain, string> = {
    sales: "Ventas",
    finance: "Finanzas",
    trade: "Trade Marketing",
    supply: "Supply",
    rgm: "RGM",
    planning: "Planning",
    crm: "CRM",
    dimension: "Dimensiones",
    control: "Control",
    unknown: "Otro",
  };
  return map[domain];
}

function domainToCategory(domain: SheetDomain): DataFile["category"] {
  const map: Record<SheetDomain, DataFile["category"]> = {
    sales: "sell-in",
    finance: "finanzas",
    trade: "trade-marketing",
    supply: "stock",
    rgm: "promociones",
    planning: "sell-in",
    crm: "clientes",
    dimension: "clientes",
    control: "sell-in",
    unknown: "sell-in",
  };
  return map[domain];
}

function IntegrationIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  const labels: Record<string, string> = {
    "google-sheets": "GS",
    hubspot: "HS",
    salesforce: "SF",
    sap: "SAP",
    "power-bi": "PBI",
    looker: "L",
    sql: "SQL",
    bigquery: "BQ",
    snowflake: "SF",
    "csv-excel": "XLS",
    custom: "API",
  };
  return (
    <span className={cn("text-[10px] font-bold tracking-wide text-text-secondary", className)}>
      {labels[iconKey] ?? "DB"}
    </span>
  );
}

const statusBadge = {
  connected: { variant: "success" as const, label: "Conectado" },
  disconnected: { variant: "default" as const, label: "No conectado" },
  error: { variant: "danger" as const, label: "Error" },
  syncing: { variant: "info" as const, label: "Sincronizando" },
  processing: { variant: "warning" as const, label: "Procesando" },
  processed: { variant: "success" as const, label: "Procesado" },
};

type SortKey = "name" | "type" | "area" | "rows" | "status" | "uploadedAt";
type SortDirection = "asc" | "desc";
type FileAction = "detail" | "delete" | "download" | "reprocess" | "mapping";
type IntegrationStep = "provider" | "auth" | "container" | "tables" | "mapping" | "processing" | "done";
type IntegrationImportTable = { name: string; area: string; category: DataFile["category"]; rows: number };

const ORIGIN_LABELS: Record<NonNullable<DataFile["origin"]>, string> = {
  file: "Archivo",
  demo: "Demo",
  "google-sheets": "Google Sheets",
  bigquery: "BigQuery",
  snowflake: "Snowflake",
  sql: "SQL",
  hubspot: "HubSpot",
  salesforce: "Salesforce",
};

function getFileOrigin(file: DataFile): NonNullable<DataFile["origin"]> {
  if (file.origin) return file.origin;
  if (file.type === "demo" || file.type === "table" || file.category === "demo") return "demo";
  if (["google-sheets", "bigquery", "snowflake", "sql", "hubspot", "salesforce"].includes(file.type)) {
    return file.type as NonNullable<DataFile["origin"]>;
  }
  return "file";
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}

function uniqueValues(files: DataFile[], key: keyof Pick<DataFile, "area" | "type" | "status">): string[] {
  return [...new Set(files.map((file) => String(file[key])).filter(Boolean))].sort();
}

const PROCESSING_STEPS = [
  "Archivo recibido",
  "Leyendo hojas",
  "Detectando áreas y tablas",
  "Mapeando columnas semánticas",
  "Calculando KPIs",
  "Dataset listo",
];

// ─── Upload modal ──────────────────────────────────────────────────────────────

type UploadStep = "select" | "processing" | "done";

function UploadModal({
  onClose,
  onProcessed,
}: {
  onClose: () => void;
  onProcessed: (dataset: ProcessedDataset) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<UploadStep>("select");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [dataset, setDataset] = useState<ProcessedDataset | null>(null);
  const [editableMappings, setEditableMappings] = useState<ColumnMapping[]>([]);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isXlsx = selectedFile ? /\.xlsx?$/i.test(selectedFile.name) : false;

  function handleFileSelect(file: File) {
    setSelectedFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  async function handleProcess() {
    if (!selectedFile) return;
    setStep("processing");
    setProcessingStep(0);
    setDataset(null);
    setError(null);

    try {
      const result = await processExcelFile(selectedFile, (s) => {
        setProcessingStep(s + 1);
      });
      setDataset(result);
      setEditableMappings(result.mapping ?? result.validation.columnMappings);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al procesar el archivo");
      setStep("done");
    }
  }

  async function handleReprocess() {
    if (!selectedFile) return;
    setIsReprocessing(true);
    setError(null);
    try {
      const result = await processExcelFile(selectedFile, (s) => setProcessingStep(s + 1), editableMappings);
      setDataset(result);
      setEditableMappings(result.mapping ?? result.validation.columnMappings);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al reprocesar el archivo");
    } finally {
      setIsReprocessing(false);
    }
  }

  function updateMapping(index: number, nexusField: string) {
    setEditableMappings((prev) => prev.map((mapping, i) => (i === index ? { ...mapping, nexusField } : mapping)));
  }

  function handleContinue() {
    if (dataset) onProcessed({ ...dataset, mapping: editableMappings, validation: { ...dataset.validation, columnMappings: editableMappings } });
    onClose();
  }

  const sk = dataset?.salesKpis;
  const kpiRows: { label: string; value: string; ok: boolean }[] = sk ? [
    { label: "Sell-in YTD", value: sk.sellInYtd !== undefined ? `${fmtInt(sk.sellInYtd)} cajas` : "No disponible", ok: sk.sellInYtd !== undefined && sk.sellInYtd > 0 },
    { label: "Sell-out YTD", value: sk.sellOutYtd !== undefined ? `${fmtInt(sk.sellOutYtd)} cajas` : "No disponible", ok: sk.sellOutYtd !== undefined && sk.sellOutYtd > 0 },
    ...(sk.passthrough !== undefined ? [{ label: "Passthrough", value: fmtPct(sk.passthrough), ok: true }] : [{ label: "Passthrough", value: "No disponible", ok: false }]),
    ...(sk.netRevenueYtd !== undefined ? [{ label: "Net Revenue", value: fmtUsd(sk.netRevenueYtd), ok: true }] : []),
    ...(sk.ebitdaYtd !== undefined ? [{ label: "EBITDA", value: fmtUsd(sk.ebitdaYtd), ok: true }] : []),
    ...(sk.priceIndexAvg !== undefined ? [{ label: "Price Index", value: sk.priceIndexAvg.toFixed(2), ok: true }] : []),
    ...(sk.activeDirectClients !== undefined ? [{ label: "Clientes directos", value: fmtInt(sk.activeDirectClients), ok: true }] : []),
    ...(sk.activePdvs !== undefined ? [{ label: "PDVs activos", value: fmtInt(sk.activePdvs), ok: true }] : []),
  ] : [];

  const isIncomplete = !isXlsx && dataset && (
    dataset.salesKpis.sellInYtd === undefined || dataset.salesKpis.sellOutYtd === undefined
  );

  const columnMappings = editableMappings;
  const commercialSheets = dataset?.sheets.filter((s) => ["sales", "finance", "trade", "supply", "rgm", "planning", "crm"].includes(s.domain)) ?? [];
  const totalColumns = dataset?.sheets.reduce((sum, s) => sum + s.columns.length, 0) ?? 0;
  const semantic = dataset?.semanticProfile;

  return (
    <Modal open onClose={step === "processing" ? () => {} : onClose} title="Cargar archivo" size="lg">
      {/* ── Step: select ── */}
      {step === "select" && (
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              dragOver ? "border-primary/60 bg-primary/8" : "border-border hover:border-primary/40 hover:bg-surface-soft",
              selectedFile ? "border-success/40 bg-success/5" : ""
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-success" />
                <div className="text-left">
                  <p className="text-sm font-medium text-text-primary">{selectedFile.name}</p>
                  <p className="text-xs text-text-muted">
                    {(selectedFile.size / 1024).toFixed(0)} KB · {selectedFile.name.split(".").pop()?.toUpperCase()}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-secondary">Arrastrá o hacé click para seleccionar</p>
                <p className="text-xs text-text-muted mt-1">CSV, XLSX, XLS · Máx. 50 MB</p>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-border bg-surface-soft p-3">
              <p className="font-semibold text-text-primary mb-1">XLSX / XLS</p>
              <p className="text-text-muted leading-relaxed">Múltiples hojas: sell-in, sell-out, KPIs, dimensiones. Permite calcular todos los indicadores comerciales.</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-soft p-3">
              <p className="font-semibold text-text-primary mb-1">CSV</p>
              <p className="text-text-muted leading-relaxed">Archivo plano con una tabla. Puede no incluir todas las métricas. Nexus lo procesa e indica qué encontró.</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" disabled={!selectedFile} onClick={handleProcess}>
              <Zap className="h-3.5 w-3.5" />
              Procesar archivo
            </Button>
          </div>
        </div>
      )}

      {/* ── Step: processing ── */}
      {step === "processing" && (
        <div className="space-y-5 py-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-primary/25 bg-primary/5">
            <FileText className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-text-primary">{selectedFile?.name}</p>
              <p className="text-xs text-text-muted">
                {(selectedFile?.size ?? 0) > 1024 * 1024
                  ? `${((selectedFile?.size ?? 0) / 1024 / 1024).toFixed(1)} MB`
                  : `${Math.round((selectedFile?.size ?? 0) / 1024)} KB`}
                {" · "}Procesando…
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {PROCESSING_STEPS.map((label, i) => {
              const isDone = processingStep > i;
              const isRunning = processingStep === i;
              return (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: isDone || isRunning ? 1 : 0.35, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-soft"
                >
                  <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center">
                    {isDone ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : isRunning ? (
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-border" />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    isDone ? "text-text-primary" : isRunning ? "text-primary" : "text-text-muted"
                  )}>
                    {label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Step: done ── */}
      {step === "done" && (
        <div className="space-y-5 overflow-y-auto max-h-[70vh] pr-3">
          {error ? (
            <div className="text-center py-8">
              <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <AlertTriangle className="h-14 w-14 text-warning mx-auto mb-4" />
              </motion.div>
              <p className="text-base font-semibold text-text-primary mb-2">Error al procesar</p>
              <p className="text-sm text-text-muted mb-5">{error}</p>
              <Button variant="ghost" onClick={onClose}>Cerrar</Button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-success/25 bg-success/5">
                <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <CheckCircle className="h-6 w-6 text-success flex-shrink-0" />
                </motion.div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{dataset?.fileName}</p>
                  <p className="text-xs text-text-muted">
                    {dataset ? (dataset.fileSize > 1024 * 1024
                      ? `${(dataset.fileSize / 1024 / 1024).toFixed(1)} MB`
                      : `${Math.round(dataset.fileSize / 1024)} KB`) : ""}
                    {" · "}
                    {dataset?.sheets.length ?? 0} hojas detectadas
                    {" · "}
                    {commercialSheets.length} tablas comerciales
                    {" · "}
                    {totalColumns} columnas mapeadas
                  </p>
                </div>
              </div>

              {semantic && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border bg-surface-soft p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-2">Áreas detectadas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {semantic.areas.slice(0, 6).map((area) => (
                        <Badge key={area.id} variant="primary" className="text-[10px]">
                          {area.label}
                        </Badge>
                      ))}
                      {semantic.areas.length === 0 && <span className="text-xs text-text-muted">Sin detección</span>}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-soft p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-2">Entidades</p>
                    <div className="flex flex-wrap gap-1.5">
                      {semantic.entities.slice(0, 7).map((entity) => (
                        <Badge key={entity.id} variant="outline" className="text-[10px]">
                          {entity.label}
                        </Badge>
                      ))}
                      {semantic.entities.length === 0 && <span className="text-xs text-text-muted">Sin detección</span>}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-soft p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-2">Relaciones</p>
                    <p className="text-2xl font-bold text-text-primary">{semantic.relationships.length}</p>
                    <p className="text-[11px] text-text-muted mt-1">
                      Confianza semántica {Math.round(semantic.quality.confidence * 100)}%
                    </p>
                  </div>
                </div>
              )}

              {/* CSV incomplete notice */}
              {isIncomplete && (
                <div className="flex gap-2.5 px-3 py-2.5 rounded-lg border border-warning/25 bg-warning/5">
                  <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-warning leading-relaxed">
                    El archivo fue procesado correctamente, pero al tratarse de un CSV simplificado no contiene todas las tablas necesarias para calcular KPIs comerciales completos. Para una demo más rica, se recomienda utilizar el archivo XLSX con múltiples hojas.
                  </p>
                </div>
              )}

              {/* KPIs */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-2">KPIs encontrados</p>
                {semantic && semantic.kpis.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {semantic.kpis.slice(0, 10).map((kpi) => (
                      <Badge key={kpi.id} variant="accent" className="text-[10px]">
                        {kpi.label}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 rounded-lg border border-border bg-surface-soft p-3">
                  {kpiRows.map((c) => (
                    <div key={c.label} className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-text-muted">{c.label}</span>
                      <span className={cn(
                        "text-[11px] font-medium",
                        c.ok ? "text-text-primary" : "text-text-muted italic"
                      )}>
                        {c.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warnings */}
              {(dataset?.validation.warnings.length ?? 0) > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-warning mb-2">Datos faltantes</p>
                  <div className="space-y-1">
                    {dataset!.validation.warnings.map((w) => (
                      <div key={w} className="flex items-start gap-2 text-[11px] text-warning/80">
                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Column mappings */}
              {columnMappings.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-2">Revisar mapeo</p>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="border-b border-border bg-surface-elevated">
                          <th className="text-left px-3 py-2 text-text-muted font-medium">Columna del archivo</th>
                          <th className="text-left px-3 py-2 text-text-muted font-medium">Campo Nexus</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          let lastSheet = "";
                          return columnMappings.map((m, i) => {
                            const sheetChanged = m.sheet !== lastSheet;
                            lastSheet = m.sheet;
                            return (
                              <React.Fragment key={i}>
                                {sheetChanged && (
                                  <tr className="border-b border-border bg-surface-soft/60">
                                    <td colSpan={2} className="px-3 py-1.5">
                                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-primary uppercase tracking-wide">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                                        Hoja: {m.sheet}
                                      </span>
                                    </td>
                                  </tr>
                                )}
                                <tr className="border-b border-border/50 hover:bg-surface-soft transition-colors">
                                  <td className="px-3 py-2 font-mono text-text-secondary">{m.fileColumn}</td>
                                  <td className="px-3 py-2 text-text-primary min-w-44">
                                    <Select
                                      options={NEXUS_FIELD_OPTIONS}
                                      value={m.nexusField}
                                      onChange={(e) => updateMapping(i, e.target.value)}
                                      className="!h-8 text-[11px]"
                                    />
                                  </td>
                                </tr>
                              </React.Fragment>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2 border-t border-border">
                <Button variant="secondary" onClick={handleReprocess} loading={isReprocessing} disabled={columnMappings.length === 0}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reprocesar con este mapeo
                </Button>
                <Button variant="primary" onClick={handleContinue}>
                  <CheckCircle className="h-3.5 w-3.5" />
                  Continuar
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}

function ProductLabelEditor({ products, datasetSource, onSave }: {
  products: NormalizedProduct[];
  datasetSource: "file" | "integration" | null;
  onSave: (id: string, displayName: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  if (!products.length) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-2">Productos / SKUs ({products.length})</p>
      <div className="max-h-52 overflow-auto rounded-lg border border-border">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border bg-surface-elevated">
              <th className="text-left px-3 py-2 text-text-muted font-medium">ID</th>
              <th className="text-left px-3 py-2 text-text-muted font-medium">Label visible</th>
              {products.some((p) => p.brand) && <th className="text-left px-3 py-2 text-text-muted font-medium">Marca</th>}
              {products.some((p) => p.format) && <th className="text-left px-3 py-2 text-text-muted font-medium">Formato</th>}
              {datasetSource && <th className="w-8" />}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border/50 group">
                <td className="px-3 py-2 font-mono text-text-muted">{product.id}</td>
                <td className="px-3 py-2 text-text-primary">
                  {editingId === product.id ? (
                    <div className="flex gap-1 items-center">
                      <input
                        autoFocus
                        className="flex-1 bg-surface-elevated border border-primary rounded px-2 py-0.5 text-[11px] text-text-primary outline-none"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { onSave(product.id, draft); setEditingId(null); }
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <button
                        className="text-primary hover:text-primary/80"
                        onClick={() => { onSave(product.id, draft); setEditingId(null); }}
                      >
                        <Save className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <span>{product.displayName ?? product.name}</span>
                  )}
                </td>
                {products.some((p) => p.brand) && <td className="px-3 py-2 text-text-muted">{product.brand ?? "—"}</td>}
                {products.some((p) => p.format) && <td className="px-3 py-2 text-text-muted">{product.format ?? "—"}</td>}
                {datasetSource && (
                  <td className="px-2 py-2">
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-text-primary"
                      onClick={() => { setEditingId(product.id); setDraft(product.displayName ?? product.name); }}
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-text-muted mt-1">Los cambios de label no modifican el archivo original.</p>
    </div>
  );
}

function DetailModal({ file, dataset, onClose }: { file: DataFile; dataset: ProcessedDataset | null; onClose: () => void }) {
  const { activeDatasetSource, updateEntityLabel } = useDataSourceStore();
  const sheet = dataset?.sheets.find((item) => item.name === file.name);
  const mappings = dataset?.mapping ?? dataset?.validation.columnMappings ?? [];
  const kpis = dataset?.salesKpis;
  const semantic = dataset?.semanticProfile;
  const tableProfile = semantic?.tables.find((table) => table.sheetName === file.name);
  const products = dataset?.salesData?.products ?? [];
  const editableSource = activeDatasetSource === "file" || activeDatasetSource === "integration" ? activeDatasetSource : null;

  function handleSaveLabel(entityId: string, displayName: string) {
    if (!editableSource) return;
    updateEntityLabel(editableSource, { entityType: "product", entityId, displayName });
  }

  return (
    <Modal open onClose={onClose} title="Detalle de fuente" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ["Nombre", file.name],
            ["Origen", ORIGIN_LABELS[getFileOrigin(file)]],
            ["Área", file.area],
            ["Filas", file.rows?.toLocaleString("es-AR") ?? "N/D"],
            ["Tipo", file.type.toUpperCase()],
            ["Estado", statusBadge[file.status].label],
            ["Carga", formatDate(file.uploadedAt)],
            ["Columnas", String(sheet?.columns.length ?? "N/D")],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border bg-surface-soft p-3">
              <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1">{label}</p>
              <p className="text-xs font-medium text-text-primary truncate">{value}</p>
            </div>
          ))}
        </div>

        {file.description && (
          <div className="rounded-lg border border-border bg-surface-soft p-3">
            <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1">Descripción</p>
            <p className="text-xs text-text-secondary leading-relaxed">{file.description}</p>
          </div>
        )}

        {semantic && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-surface-soft p-3">
              <p className="text-[10px] uppercase tracking-wide text-text-muted mb-2">Perfil semántico</p>
              <p className="text-xs font-medium text-text-primary">{tableProfile?.role ?? "unknown"}</p>
              <p className="text-[11px] text-text-muted mt-1">Header fila {(tableProfile?.headerRowIndex ?? 0) + 1}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-soft p-3">
              <p className="text-[10px] uppercase tracking-wide text-text-muted mb-2">Áreas del dataset</p>
              <div className="flex flex-wrap gap-1">
                {semantic.areas.slice(0, 5).map((area) => (
                  <Badge key={area.id} variant="primary" className="text-[10px]">{area.label}</Badge>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-surface-soft p-3">
              <p className="text-[10px] uppercase tracking-wide text-text-muted mb-2">Entidades clave</p>
              <div className="flex flex-wrap gap-1">
                {semantic.entities.slice(0, 5).map((entity) => (
                  <Badge key={entity.id} variant="outline" className="text-[10px]">{entity.label}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-2">KPIs encontrados</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              ["Sell-in", kpis?.sellInYtd ? `${fmtInt(kpis.sellInYtd)} cajas` : "N/D"],
              ["Sell-out", kpis?.sellOutYtd ? `${fmtInt(kpis.sellOutYtd)} cajas` : "N/D"],
              ["Passthrough", kpis?.passthrough ? fmtPct(kpis.passthrough) : "N/D"],
              ["Net Revenue", kpis?.netRevenueYtd ? fmtUsd(kpis.netRevenueYtd) : "N/D"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border bg-surface p-3">
                <p className="text-[10px] text-text-muted">{label}</p>
                <p className="text-xs font-semibold text-text-primary">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {(dataset?.validation.warnings.length ?? 0) > 0 && (
          <div className="rounded-lg border border-warning/25 bg-warning/5 p-3">
            <p className="text-[10px] uppercase tracking-wide text-warning mb-2">Warnings</p>
            {dataset!.validation.warnings.slice(0, 4).map((warning) => (
              <p key={warning} className="text-xs text-warning/90 leading-relaxed">• {warning}</p>
            ))}
          </div>
        )}

        {products.length > 0 && (
          <ProductLabelEditor
            products={products}
            datasetSource={editableSource}
            onSave={handleSaveLabel}
          />
        )}

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-2">Mapeo de columnas</p>
          <div className="max-h-48 overflow-auto rounded-lg border border-border">
            <table className="w-full text-[11px]">
              <tbody>
                {(mappings.length ? mappings : [{ fileColumn: "Mes", nexusField: "Mes", sheet: file.name }, { fileColumn: "Volumen_Cajas", nexusField: "Volumen Sell-in", sheet: file.name }]).slice(0, 8).map((mapping, index) => (
                  <tr key={`${mapping.fileColumn}-${index}`} className="border-b border-border/50">
                    <td className="px-3 py-2 font-mono text-text-secondary">{mapping.fileColumn}</td>
                    <td className="px-3 py-2 text-text-primary">{mapping.nexusField}</td>
                    <td className="px-3 py-2 text-text-muted">{mapping.sheet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function MappingModal({ file, dataset, onClose }: { file: DataFile; dataset: ProcessedDataset | null; onClose: () => void }) {
  const initialMappings = dataset?.mapping?.length
    ? dataset.mapping
    : [
        { fileColumn: "Mes", nexusField: "Mes", sheet: file.name },
        { fileColumn: "ID_SKU", nexusField: "SKU ID", sheet: file.name },
        { fileColumn: "Volumen_Cajas", nexusField: "Volumen Sell-in", sheet: file.name },
        { fileColumn: "Net_Revenue", nexusField: "Net Revenue", sheet: file.name },
      ];
  const [mappings, setMappings] = useState<ColumnMapping[]>(initialMappings);
  return (
    <Modal open onClose={onClose} title="Mapeo de columnas" size="lg">
      <div className="space-y-4">
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border bg-surface-elevated">
                <th className="text-left px-3 py-2 text-text-muted font-medium">Columna original</th>
                <th className="text-left px-3 py-2 text-text-muted font-medium">Campo Nexus</th>
                <th className="text-left px-3 py-2 text-text-muted font-medium">Hoja</th>
                <th className="text-left px-3 py-2 text-text-muted font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((mapping, index) => (
                <tr key={`${mapping.fileColumn}-${index}`} className="border-b border-border/50">
                  <td className="px-3 py-2 font-mono text-text-secondary">{mapping.fileColumn}</td>
                  <td className="px-3 py-2">
                    <Select
                      options={NEXUS_FIELD_OPTIONS}
                      value={mapping.nexusField}
                      onChange={(event) => setMappings((prev) => prev.map((item, i) => i === index ? { ...item, nexusField: event.target.value } : item))}
                      className="!h-8 text-[11px]"
                    />
                  </td>
                  <td className="px-3 py-2 text-text-muted">{mapping.sheet}</td>
                  <td className="px-3 py-2">
                    <Badge variant={mapping.confidence && mapping.confidence < 0.7 ? "warning" : "success"} className="text-[10px]">
                      {mapping.confidence ? `${Math.round(mapping.confidence * 100)}%` : "Mapeado"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setMappings(initialMappings)}>Restablecer mapeo automático</Button>
          <Button variant="primary" onClick={onClose}>Guardar</Button>
        </div>
      </div>
    </Modal>
  );
}

function DeleteFileModal({ file, onClose, onConfirm }: { file: DataFile; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open onClose={onClose} title="Eliminar fuente" size="md">
      <div className="space-y-4">
        <div className="flex gap-3 rounded-lg border border-danger/25 bg-danger/5 p-4">
          <AlertTriangle className="h-5 w-5 text-danger flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-text-primary">¿Eliminar {file.name}?</p>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              La fuente dejará de alimentar dashboards, chats y KPIs del workspace. Podés volver a cargarla más tarde.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm}>Eliminar</Button>
        </div>
      </div>
    </Modal>
  );
}

function IntegrationWizard({
  onClose,
  onConnected,
  initialProvider,
}: {
  onClose: () => void;
  onConnected: (provider: { type: DataSourceType; name: string; icon: string }, tables: IntegrationImportTable[], externalSourceName?: string) => void;
  initialProvider?: DataSourceType | null;
}) {
  const initial = INTEGRATION_PROVIDERS.find((item) => item.type === initialProvider) ?? INTEGRATION_PROVIDERS[0];
  const [step, setStep] = useState<IntegrationStep>(initialProvider ? "auth" : "provider");
  const [provider, setProvider] = useState(initial);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([GOOGLE_SHEETS_DOCUMENTS[0].id]);
  const [selectedContainer, setSelectedContainer] = useState<string>(PROVIDER_CONTAINERS[initial.type]?.items[0] ?? "");
  const providerObjects = PROVIDER_OBJECTS[provider.type] ?? INTEGRATION_TABLES.map((table) => ({ ...table, columns: ["month", "sku_id", "client_id", "channel", "volume_cases", "net_revenue"] }));
  const googleSheets = GOOGLE_SHEETS_DOCUMENTS.filter((doc) => selectedDocs.includes(doc.id)).flatMap((doc) =>
    doc.sheets.map((sheet, index) => ({
      name: sheet,
      area: sheet.includes("Trade") || sheet.includes("Promociones") ? "Trade Marketing" : sheet.includes("KPI") || sheet.includes("Budget") ? "Dirección" : "Ventas",
      category: sheet.includes("Sell_Out") ? "sell-out" as const : sheet.includes("Clientes") || sheet.includes("Productos") ? "clientes" as const : sheet.includes("Trade") || sheet.includes("Promociones") ? "trade-marketing" as const : "sell-in" as const,
      rows: 5200 + index * 840,
      columns: ["Mes", "SKU ID", "Cliente ID", "Canal", "Volumen", "Net Revenue"],
    }))
  );
  const selectableTables = provider.type === "google-sheets" ? googleSheets : providerObjects;
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [processingStep, setProcessingStep] = useState(0);
  const isGoogleSheets = provider.type === "google-sheets";
  const containerConfig = PROVIDER_CONTAINERS[provider.type];

  function continueFromProvider() {
    setSelectedContainer(PROVIDER_CONTAINERS[provider.type]?.items[0] ?? "");
    setSelectedTables([]);
    setMappings([]);
    setStep("auth");
  }

  function goToMapping() {
    const firstSelected = selectableTables.find((table) => selectedTables.includes(table.name));
    const columns = firstSelected?.columns ?? ["Mes", "SKU ID", "Cliente ID", "Canal", "Volumen", "Net Revenue"];
    setMappings(columns.map((column) => ({
      fileColumn: column,
      nexusField: NEXUS_FIELD_OPTIONS.find((option) => option.label.toLowerCase().includes(column.toLowerCase().split(" ")[0]))?.value ?? "ignore",
      confidence: 0.86,
      sheet: firstSelected?.name ?? "Tabla seleccionada",
    })));
    setStep("mapping");
  }

  async function handleProcess() {
    setStep("processing");
    const steps = isGoogleSheets
      ? ["Conectando con Google Sheets", "Leyendo spreadsheets", "Detectando hojas", "Mapeando columnas", "Calculando KPIs", "Fuente conectada"]
      : [`Conectando con ${provider.name}`, `Leyendo ${containerConfig?.label.toLowerCase() ?? "origen"}`, `Detectando ${containerConfig?.tableLabel.toLowerCase() ?? "tablas"}`, "Mapeando columnas", "Calculando KPIs", "Fuente conectada"];
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i);
      await sleep(450);
    }
    const importedTables = selectableTables
      .filter((table) => selectedTables.includes(table.name))
      .map((table) => ({
        name: table.name,
        area: table.area,
        category: table.category,
        rows: table.rows,
      }));
    onConnected(provider, importedTables, isGoogleSheets ? GOOGLE_SHEETS_DOCUMENTS.filter((doc) => selectedDocs.includes(doc.id)).map((doc) => doc.name).join(", ") : selectedContainer);
    setStep("done");
  }

  const processingLabels = isGoogleSheets
    ? ["Conectando con Google Sheets", "Leyendo spreadsheets", "Detectando hojas", "Mapeando columnas", "Calculando KPIs", "Fuente conectada"]
    : [`Conectando con ${provider.name}`, `Leyendo ${containerConfig?.label.toLowerCase() ?? "origen"}`, `Detectando ${containerConfig?.tableLabel.toLowerCase() ?? "tablas"}`, "Mapeando columnas", "Calculando KPIs", "Fuente conectada"];

  return (
    <Modal open onClose={step === "processing" ? () => {} : onClose} title={`Conectar ${provider.name}`} size="lg">
      {step === "provider" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INTEGRATION_PROVIDERS.map((item) => (
              <button
                key={item.type}
                onClick={() => setProvider(item)}
                className={cn("text-left rounded-lg border p-4 transition-colors", provider.type === item.type ? "border-primary/50 bg-primary/10" : "border-border bg-surface hover:bg-surface-soft")}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg border border-border bg-surface-soft flex items-center justify-center">
                    <IntegrationIcon iconKey={item.icon} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                    <p className="text-xs text-text-muted">{item.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" onClick={continueFromProvider}>Continuar</Button>
          </div>
        </div>
      )}

      {step === "auth" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface-elevated p-5">
            <div className="flex items-center gap-3 mb-4">
              <Cloud className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-semibold text-text-primary">Autorizar Nexus para {provider.name}</p>
                <p className="text-xs text-text-muted">{isGoogleSheets ? "Cuenta seleccionada: mauro.celani@andes-cpg.com" : containerConfig?.authLabel ?? "Autenticación simulada con permisos de solo lectura."}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-text-secondary">
              {(isGoogleSheets
                ? ["Ver archivos seleccionados de Google Drive", "Leer hojas de cálculo", "Leer metadatos de hojas", "No modificar datos de origen"]
                : ["Leer objetos o tablas seleccionadas", "Leer metadatos y campos", "Detectar tipos de dato", "No modificar datos de origen"]
              ).map((permission) => (
                <p key={permission} className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> {permission}</p>
              ))}
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={() => initialProvider ? onClose() : setStep("provider")}>Atrás</Button>
            <Button variant="primary" onClick={() => setStep("container")}>Autorizar acceso</Button>
          </div>
        </div>
      )}

      {step === "container" && isGoogleSheets && (
        <div className="space-y-4">
          <p className="text-sm text-text-muted">Seleccioná uno o varios spreadsheets de Google Drive.</p>
          <div className="space-y-2">
            {GOOGLE_SHEETS_DOCUMENTS.map((doc) => {
              const checked = selectedDocs.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocs((prev) => checked ? prev.filter((id) => id !== doc.id) : [...prev, doc.id])}
                  className="w-full flex items-center gap-3 rounded-lg border border-border bg-surface p-3 text-left hover:bg-surface-soft transition-colors"
                >
                  {checked ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-text-muted" />}
                  <FileText className="h-4 w-4 text-text-muted" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-text-primary">{doc.name}</p>
                    <p className="text-[10px] text-text-muted">Owner: {doc.owner} · {doc.sheetCount} hojas · Última modificación {formatDate(doc.modifiedAt)}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep("auth")}>Atrás</Button>
            <Button variant="primary" disabled={selectedDocs.length === 0} onClick={() => {
              const next = GOOGLE_SHEETS_DOCUMENTS.filter((doc) => selectedDocs.includes(doc.id)).flatMap((doc) => doc.sheets);
              setSelectedTables(next.slice(0, 5));
              setStep("tables");
            }}>Seleccionar hojas</Button>
          </div>
        </div>
      )}

      {step === "container" && !isGoogleSheets && (
        <div className="space-y-4">
          <p className="text-sm text-text-muted">{containerConfig?.label ?? "Seleccioná el origen"} para importar datos desde {provider.name}.</p>
          <div className="space-y-2">
            {(containerConfig?.items ?? []).map((item) => (
              <button
                key={item}
                onClick={() => setSelectedContainer(item)}
                className={cn("w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors", selectedContainer === item ? "border-primary/50 bg-primary/10" : "border-border bg-surface hover:bg-surface-soft")}
              >
                <Database className="h-4 w-4 text-text-muted" />
                <span className="text-xs font-semibold text-text-primary">{item}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep("auth")}>Atrás</Button>
            <Button variant="primary" disabled={!selectedContainer} onClick={() => {
              setSelectedTables(providerObjects.slice(0, 3).map((table) => table.name));
              setStep("tables");
            }}>Explorar {containerConfig?.tableLabel ?? "tablas"}</Button>
          </div>
        </div>
      )}

      {step === "tables" && (
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            {isGoogleSheets ? "Seleccioná las hojas internas que querés importar." : `Seleccioná ${containerConfig?.tableLabel.toLowerCase() ?? "tablas"} para importar desde ${selectedContainer}.`}
          </p>
          <div className="space-y-2">
            {selectableTables.map((table) => {
              const checked = selectedTables.includes(table.name);
              return (
                <button
                  key={table.name}
                  onClick={() => setSelectedTables((prev) => checked ? prev.filter((name) => name !== table.name) : [...prev, table.name])}
                  className="w-full flex items-center gap-3 rounded-lg border border-border bg-surface p-3 text-left hover:bg-surface-soft transition-colors"
                >
                  {checked ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-text-muted" />}
                  <Table2 className="h-4 w-4 text-text-muted" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-text-primary">{table.name}</p>
                    <p className="text-[10px] text-text-muted">{table.area} · {table.rows.toLocaleString("es-AR")} filas · {table.columns.length} columnas</p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep("container")}>Atrás</Button>
            <Button variant="primary" disabled={selectedTables.length === 0} onClick={goToMapping}>Preview y mapeo</Button>
          </div>
        </div>
      )}

      {step === "mapping" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface-soft p-3">
            <p className="text-xs font-semibold text-text-primary mb-1">Preview de importación</p>
            <p className="text-xs text-text-muted">
              {selectedTables.length} {isGoogleSheets ? "hojas" : "tablas"} seleccionadas · {selectableTables.filter((table) => selectedTables.includes(table.name)).reduce((sum, table) => sum + table.rows, 0).toLocaleString("es-AR")} filas estimadas
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-surface-elevated">
                <tr>
                  <th className="text-left px-3 py-2 text-text-muted">Columna detectada</th>
                  <th className="text-left px-3 py-2 text-text-muted">Campo Nexus</th>
                  <th className="text-left px-3 py-2 text-text-muted">Hoja / tabla</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((mapping, index) => (
                  <tr key={`${mapping.fileColumn}-${index}`} className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-text-secondary">{mapping.fileColumn}</td>
                    <td className="px-3 py-2">
                      <Select
                        options={NEXUS_FIELD_OPTIONS}
                        value={mapping.nexusField}
                        onChange={(event) => setMappings((prev) => prev.map((item, i) => i === index ? { ...item, nexusField: event.target.value } : item))}
                        className="!h-8 text-[11px]"
                      />
                    </td>
                    <td className="px-3 py-2 text-text-muted">{mapping.sheet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep("tables")}>Atrás</Button>
            <Button variant="primary" onClick={handleProcess}>Importar</Button>
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="space-y-2">
          {processingLabels.map((label, index) => (
            <div key={label} className="flex items-center gap-3 rounded-lg bg-surface-soft px-3 py-2">
              {processingStep > index ? <CheckCircle className="h-4 w-4 text-success" /> : processingStep === index ? <Loader2 className="h-4 w-4 text-primary animate-spin" /> : <div className="h-2 w-2 rounded-full bg-border" />}
              <span className="text-xs text-text-secondary">{label}</span>
            </div>
          ))}
        </div>
      )}

      {step === "done" && (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
          <p className="text-sm font-semibold text-text-primary">Integración conectada</p>
          <p className="text-xs text-text-muted mt-1 mb-5">{selectedTables.length} fuentes importadas desde {provider.name}</p>
          <Button variant="primary" onClick={onClose}>Continuar</Button>
        </div>
      )}
    </Modal>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DataSourcesPage() {
  const {
    files,
    integrations,
    hasDemoLoaded,
    addFile,
    replaceFileDataset,
    removeFile,
    removeFilesByIntegration,
    addIntegration,
    updateIntegration,
    setDataConnectionStatus,
    setLastProcessedFileName,
    setIntegrationDataset,
  } = useDataSourceStore();

  const { user } = useAuthStore();
  const canConnect = canConnectDataSource(user);
  const canDelete = canDeleteDataSource(user);
  const canSync = canSyncDataSource(user);
  const hasAnyData = files.length > 0 || hasDemoLoaded;
  const [uploadOpen, setUploadOpen] = useState(false);
  const [integrationOpen, setIntegrationOpen] = useState(false);
  const [initialIntegrationProvider, setInitialIntegrationProvider] = useState<DataSourceType | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("uploadedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [detailFile, setDetailFile] = useState<DataFile | null>(null);
  const [mappingFile, setMappingFile] = useState<DataFile | null>(null);
  const [deleteFile, setDeleteFile] = useState<DataFile | null>(null);
  const [disconnectIntegration, setDisconnectIntegration] = useState<DataSourceType | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const areaOptions = useMemo(() => uniqueValues(files, "area"), [files]);
  const typeOptions = useMemo(() => uniqueValues(files, "type"), [files]);
  const statusOptions = useMemo(() => uniqueValues(files, "status"), [files]);

  const filteredFiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = files.filter((file) => {
      const matchesQuery = !normalizedQuery
        || file.name.toLowerCase().includes(normalizedQuery)
        || file.description?.toLowerCase().includes(normalizedQuery)
        || file.area.toLowerCase().includes(normalizedQuery);
      const matchesArea = areaFilter === "all" || file.area === areaFilter;
      const matchesType = typeFilter === "all" || file.type === typeFilter;
      const matchesStatus = statusFilter === "all" || file.status === statusFilter;
      return matchesQuery && matchesArea && matchesType && matchesStatus;
    });

    return result.sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      if (sortKey === "rows") {
        return ((a.rows ?? 0) - (b.rows ?? 0)) * direction;
      }
      if (sortKey === "uploadedAt") {
        return (new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()) * direction;
      }
      return String(a[sortKey]).localeCompare(String(b[sortKey]), "es") * direction;
    });
  }, [areaFilter, files, query, sortDirection, sortKey, statusFilter, typeFilter]);

  const totalRows = useMemo(() => files.reduce((sum, file) => sum + (file.rows ?? 0), 0), [files]);
  const areaCount = useMemo(() => new Set(files.map((file) => file.area)).size, [files]);
  const lastUpdate = useMemo(() => {
    if (files.length === 0) return null;
    return files.reduce((latest, file) => (
      new Date(file.uploadedAt).getTime() > new Date(latest.uploadedAt).getTime() ? file : latest
    ), files[0]).uploadedAt;
  }, [files]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection(key === "uploadedAt" || key === "rows" ? "desc" : "asc");
  }

  function clearFilters() {
    setQuery("");
    setAreaFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
  }

  async function handleConnect(id: string) {
    if (!canConnect) return;
    setConnectingId(id);
    await sleep(1500);
    updateIntegration(id, {
      status: "connected",
      connectedAt: new Date().toISOString(),
      lastSync: new Date().toISOString(),
    });
    setConnectingId(null);
  }

  async function handleDisconnect(id: string) {
    if (!canDelete) return;
    const integration = integrations.find((item) => item.id === id);
    if (!integration) return;
    setDisconnectIntegration(integration.type);
  }

  function confirmDisconnect() {
    if (!canDelete) return;
    if (!disconnectIntegration) return;
    const integration = integrations.find((item) => item.type === disconnectIntegration);
    if (integration) {
      updateIntegration(integration.id, { status: "disconnected", connectedAt: undefined, lastSync: undefined });
    }
    removeFilesByIntegration(disconnectIntegration as NonNullable<DataFile["sourceIntegrationType"]>);
    // processedDataset is cleared by removeFilesByIntegration if it was from this integration
    setDisconnectIntegration(null);
  }

  async function handleSync(id: string) {
    if (!canSync) return;
    updateIntegration(id, { status: "syncing" });
    await sleep(2000);
    const now = new Date().toISOString();
    updateIntegration(id, { status: "connected", lastSync: now });
    const integration = integrations.find((item) => item.id === id);
    if (integration) {
      const intFiles = files.filter((f) => f.sourceIntegrationType === integration.type || f.origin === integration.type);
      const tableNames = intFiles.map((f) => f.name);
      const dataset = generateIntegrationDataset(integration.type, integration.name, tableNames);
      setIntegrationDataset({ ...dataset, uploadedAt: now });
    }
  }

  function handleLoadDemo() {
    activateFullDemo();
  }

  function handleReset() {
    if (!canDelete) return;
    resetWorkspace();
  }

  function handleProcessed(dataset: ProcessedDataset) {
    if (!canConnect) return;
    const ext = dataset.fileName.split(".").pop() ?? "xlsx";
    const sizeMb = `${(dataset.fileSize / 1024 / 1024).toFixed(1)} MB`;
    const nextFiles = dataset.sheets.map((sheet) => {
      const tableProfile = dataset.semanticProfile?.tables.find((table) => table.sheetName === sheet.name);
      const semanticAreas = tableProfile?.areas
        .filter((area) => area !== "unknown")
        .slice(0, 2)
        .join(", ");
      return {
        name: sheet.name,
        type: ext,
        size: sizeMb,
        area: domainToArea(sheet.domain),
        category: domainToCategory(sheet.domain),
        status: sheet.status === "warning" ? "processed" : sheet.status,
        period: "YTD 2026",
        description: `${sheet.rows} filas · ${sheet.columns.length} columnas${semanticAreas ? ` · ${semanticAreas}` : ""}`,
        uploadedAt: dataset.uploadedAt,
        owner: "Mauro Celani",
        rows: sheet.rows,
        origin: "file" as const,
        datasetId: dataset.id,
        sourceFingerprint: dataset.semanticProfile?.sourceFingerprint,
      };
    });
    replaceFileDataset(dataset, nextFiles);
    setDataConnectionStatus("ready");
    setLastProcessedFileName(dataset.fileName.replace(/\.[^.]+$/, ""));
  }

  async function handleFileAction(action: FileAction, file: DataFile) {
    setActionMenuId(null);
    if (action === "detail") {
      setDetailFile(file);
      return;
    }
    if (action === "mapping") {
      setMappingFile(file);
      return;
    }
    if (action === "delete") {
      if (!canDelete) return;
      setDeleteFile(file);
      return;
    }
    if (action === "download") {
      const blob = new Blob([
        `Fuente,Nexus\nNombre,${file.name}\nArea,${file.area}\nFilas,${file.rows ?? 0}\nEstado,${file.status}\n`,
      ], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${file.name.replace(/\s+/g, "_")}_mock.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      return;
    }
    if (!canSync) return;
    setRefreshingId(file.id);
    await sleep(900);
    setRefreshingId(null);
  }

  function handleConfirmDelete() {
    if (!canDelete) return;
    if (!deleteFile) return;
    removeFile(deleteFile.id);
    setDeleteFile(null);
  }

  function openGenericIntegration() {
    if (!canConnect) return;
    setInitialIntegrationProvider(null);
    setIntegrationOpen(true);
  }

  function openProviderIntegration(type: DataSourceType) {
    if (!canConnect) return;
    setInitialIntegrationProvider(type);
    setIntegrationOpen(true);
  }

  function handleIntegrationConnected(provider: { type: DataSourceType; name: string; icon: string }, tables: IntegrationImportTable[], externalSourceName?: string) {
    if (!canConnect) return;
    const now = new Date().toISOString();
    const existing = integrations.find((integration) => integration.type === provider.type);
    if (existing) {
      updateIntegration(existing.id, { status: "connected", connectedAt: now, lastSync: now });
    } else {
      addIntegration({
        type: provider.type,
        name: provider.name,
        description: `Integración simulada con ${provider.name}`,
        status: "connected",
        icon: provider.icon,
        connectedAt: now,
        lastSync: now,
      });
    }

    const tableNames: string[] = [];
    for (const table of tables) {
      tableNames.push(table.name);
      addFile({
        name: table.name,
        type: provider.type,
        size: "Conectado",
        area: table.area,
        category: table.category,
        status: "processed",
        period: "YTD 2026",
        description: `${provider.name} · tabla sincronizada · ${table.rows.toLocaleString("es-AR")} filas`,
        uploadedAt: now,
        owner: "Nexus Data Sync",
        rows: table.rows,
        origin: provider.type as DataFile["origin"],
        sourceIntegrationType: provider.type,
        externalSourceName,
        lastSync: now,
      });
    }

    const dataset = generateIntegrationDataset(provider.type, provider.name, tableNames);
    setIntegrationDataset(dataset);
    setDataConnectionStatus("ready");
  }

  const hasActiveFilters = query !== "" || areaFilter !== "all" || typeFilter !== "all" || statusFilter !== "all";

  function renderSortHeader(label: string, field: SortKey) {
    return (
      <button
        type="button"
        onClick={() => handleSort(field)}
        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-text-muted font-medium hover:text-text-primary"
      >
        {label}
        <ArrowUpDown className={cn("h-3 w-3", sortKey === field && "text-primary")} />
      </button>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Fuentes de datos</h1>
          <p className="text-sm text-text-muted mt-0.5">Centro de administración de datasets, integraciones y tablas que alimentan Nexus</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasAnyData && canDelete && (
            <Button variant="ghost" size="sm" onClick={handleReset} title="Limpiar todos los datos del workspace">
              <RotateCcw className="h-3.5 w-3.5" />
              Reiniciar
            </Button>
          )}
          {canConnect && (
            <Button variant="secondary" size="sm" onClick={openGenericIntegration}>
              <Cloud className="h-3.5 w-3.5" />
              Conectar integración
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={handleLoadDemo}>
            <Zap className="h-3.5 w-3.5" />
            Demo CPG
          </Button>
          {canConnect && (
            <Button variant="primary" size="sm" onClick={() => setUploadOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Cargar archivo
            </Button>
          )}
        </div>
      </div>

      {/* Empty state — single clear path */}
      {!hasAnyData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-xl border-2 border-dashed border-border bg-surface transition-all p-10 text-center group max-w-md mx-auto",
            canConnect ? "hover:border-primary/40 hover:bg-surface-soft cursor-pointer" : "opacity-75"
          )}
          onClick={() => {
            if (canConnect) setUploadOpen(true);
          }}
        >
          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/15 transition-colors">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary mb-2">
            {canConnect ? "Cargar Excel / CSV" : "Fuentes de datos"}
          </h3>
          <p className="text-xs text-text-muted leading-relaxed mb-5">
            {canConnect
              ? <>Subí un archivo comercial para que Nexus lea hojas, columnas y KPIs reales desde el navegador. Para activar la demo, usá el botón <strong className="text-text-secondary">Demo CPG</strong> del encabezado.</>
              : "No tenés permisos para gestionar fuentes de datos. Podés ver las fuentes que conecte el equipo."}
          </p>
          {canConnect && (
            <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); setUploadOpen(true); }}>
              <Upload className="h-3.5 w-3.5" />
              Seleccionar archivo
            </Button>
          )}
        </motion.div>
      )}

      {/* Files */}
      {hasAnyData && (
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-[10px] uppercase tracking-wide text-text-muted font-semibold">Total fuentes</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{files.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-[10px] uppercase tracking-wide text-text-muted font-semibold">Total filas</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{fmtInt(totalRows)}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-[10px] uppercase tracking-wide text-text-muted font-semibold">Áreas detectadas</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{areaCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-[10px] uppercase tracking-wide text-text-muted font-semibold">Última actualización</p>
            <p className="text-sm font-semibold text-text-primary mt-2">{lastUpdate ? formatDate(lastUpdate) : "Sin datos"}</p>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <h2 className="text-xs text-text-muted uppercase tracking-wide font-medium flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            Fuentes administradas ({filteredFiles.length}/{files.length})
          </h2>
        {canSync && (
          <Button variant="ghost" size="sm" onClick={openGenericIntegration}>
            <RefreshCw className="h-3.5 w-3.5" />
            Actualizar fuente
          </Button>
        )}
        </div>

        {files.length === 0 ? (
          <div
            onClick={() => {
              if (canConnect) setUploadOpen(true);
            }}
            className={cn(
              "border border-dashed border-border rounded-lg p-10 text-center transition-colors",
              canConnect ? "cursor-pointer hover:border-primary/40 hover:bg-surface-soft" : "opacity-75"
            )}
          >
            <Upload className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No hay archivos cargados aún</p>
            <p className="text-xs text-text-muted mt-1">
              {canConnect ? "Hacé click para cargar tu primer archivo" : "No tenés permisos para cargar archivos"}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-visible bg-surface">
            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-3 p-3 border-b border-border">
              <div className="relative">
                <Search className="h-4 w-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por archivo, hoja o área"
                  className="h-10 w-full rounded-md border border-border bg-surface-elevated pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
              </div>
              <Select
                value={areaFilter}
                onChange={(event) => setAreaFilter(event.target.value)}
                options={[{ value: "all", label: "Todas las áreas" }, ...areaOptions.map((area) => ({ value: area, label: area }))]}
              />
              <Select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                options={[{ value: "all", label: "Todos los tipos" }, ...typeOptions.map((type) => ({ value: type, label: type.toUpperCase() }))]}
              />
              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                options={[{ value: "all", label: "Todos los estados" }, ...statusOptions.map((status) => ({ value: status, label: statusBadge[status as keyof typeof statusBadge]?.label ?? status }))]}
              />
              <Button variant="ghost" size="sm" onClick={clearFilters} disabled={!hasActiveFilters}>
                <X className="h-3.5 w-3.5" />
                Limpiar
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated">
                    <th className="text-left px-4 py-3">{renderSortHeader("Nombre / Hoja", "name")}</th>
                    <th className="text-left px-4 py-3">{renderSortHeader("Tipo", "type")}</th>
                    <th className="text-left px-4 py-3">Origen</th>
                    <th className="text-left px-4 py-3">{renderSortHeader("Área", "area")}</th>
                    <th className="text-left px-4 py-3">{renderSortHeader("Filas", "rows")}</th>
                    <th className="text-left px-4 py-3">{renderSortHeader("Estado", "status")}</th>
                    <th className="text-left px-4 py-3">{renderSortHeader("Cargado", "uploadedAt")}</th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wide text-text-muted font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file, i) => {
                    const s = statusBadge[file.status];
                    const origin = getFileOrigin(file);
                    return (
                      <motion.tr
                        key={file.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-border/50 hover:bg-surface-soft transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-text-primary text-xs">{file.name}</div>
                          {file.description && (
                            <div className="text-[10px] text-text-muted truncate max-w-[260px]">{file.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-text-muted text-xs uppercase font-mono">{file.type}</td>
                        <td className="px-4 py-3">
                          <Badge variant={origin === "demo" ? "info" : origin === "file" ? "default" : "success"} className="text-[10px]">
                            {ORIGIN_LABELS[origin]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-text-secondary text-xs">{file.area}</td>
                        <td className="px-4 py-3 text-text-muted text-xs font-mono">{file.rows?.toLocaleString("es-AR") ?? "—"}</td>
                        <td className="px-4 py-3">
                          <Badge variant={s.variant} className="text-[10px]">{refreshingId === file.id ? "Actualizando" : s.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-text-muted text-xs">{formatDate(file.uploadedAt)}</td>
                        <td className="px-4 py-3 text-right relative">
                          <Button variant="ghost" size="icon" onClick={() => setActionMenuId(actionMenuId === file.id ? null : file.id)} title="Acciones">
                            {refreshingId === file.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                          </Button>
                          {actionMenuId === file.id && (
                            <div className="absolute right-3 top-11 z-20 w-48 rounded-lg border border-border bg-surface-elevated shadow-lg p-1 text-left">
                              {[
                                { action: "detail" as const, label: "Ver detalle", icon: Eye },
                                { action: "mapping" as const, label: "Ver mapeo", icon: Map },
                                ...(canSync ? [{ action: "reprocess" as const, label: "Reprocesar", icon: RefreshCw }] : []),
                                { action: "download" as const, label: "Descargar mock", icon: Download },
                                ...(canDelete ? [{ action: "delete" as const, label: "Eliminar", icon: Trash2, danger: true }] : []),
                              ].map((item) => {
                                const Icon = item.icon;
                                return (
                                  <button
                                    key={item.action}
                                    type="button"
                                    onClick={() => void handleFileAction(item.action, file)}
                                    className={cn("w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-surface-soft", item.danger ? "text-danger" : "text-text-secondary")}
                                  >
                                    <Icon className="h-3.5 w-3.5" />
                                    {item.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                  {filteredFiles.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-text-muted">
                        No hay fuentes que coincidan con los filtros actuales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
      )}

      {/* Integrations */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-xs text-text-muted uppercase tracking-wide font-medium flex items-center gap-2">
            <Database className="h-3.5 w-3.5" />
            Integraciones
          </h2>
          {canConnect && (
            <Button variant="ghost" size="sm" onClick={openGenericIntegration}>
              <Plus className="h-3.5 w-3.5" />
              Nuevo conector
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {integrations.map((int) => {
            const isConnected = int.status === "connected";
            const isSyncing = int.status === "syncing";
            const s = statusBadge[int.status];
            return (
              <div
                key={int.id}
                className={cn(
                  "rounded-lg border p-4 transition-all",
                  isConnected ? "border-primary/25 bg-primary/5" : "border-border bg-surface"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-surface-soft border border-border flex items-center justify-center flex-shrink-0">
                      <IntegrationIcon iconKey={int.icon} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-text-primary">{int.name}</div>
                      <div className="text-xs text-text-muted mt-0.5 leading-relaxed">{int.description}</div>
                      {isConnected && int.lastSync && (
                        <div className="text-[10px] text-text-muted mt-1">
                          Última sync: {new Date(int.lastSync).toLocaleString("es-AR")}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant={s.variant} className="text-[10px] flex-shrink-0">{s.label}</Badge>
                </div>
                <div className="flex gap-2 mt-3">
                  {!isConnected && !isSyncing && canConnect && (
                    <Button
                      variant="primary"
                      size="sm"
                      loading={connectingId === int.id}
                      onClick={["google-sheets", "bigquery", "snowflake", "sql", "hubspot", "salesforce"].includes(int.type) ? () => openProviderIntegration(int.type) : () => handleConnect(int.id)}
                    >
                      Conectar
                    </Button>
                  )}
                  {isConnected && (canSync || canDelete) && (
                    <>
                      {canSync && (
                        <Button variant="ghost" size="sm" onClick={() => handleSync(int.id)}>
                          <RefreshCw className="h-3.5 w-3.5" />
                          Sincronizar
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="danger" size="sm" onClick={() => handleDisconnect(int.id)}>
                          Desconectar
                        </Button>
                      )}
                    </>
                  )}
                  {isSyncing && (
                    <Button variant="ghost" size="sm" disabled>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sincronizando…
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <AnimatePresence>
        {uploadOpen && canConnect && (
          <UploadModal
            onClose={() => setUploadOpen(false)}
            onProcessed={handleProcessed}
          />
        )}
        {integrationOpen && canConnect && (
          <IntegrationWizard
            onClose={() => setIntegrationOpen(false)}
            onConnected={handleIntegrationConnected}
            initialProvider={initialIntegrationProvider}
          />
        )}
        {detailFile && (
          <DetailModal
            file={detailFile}
            dataset={resolveDataset(useDataSourceStore.getState())}
            onClose={() => setDetailFile(null)}
          />
        )}
        {mappingFile && (
          <MappingModal
            file={mappingFile}
            dataset={resolveDataset(useDataSourceStore.getState())}
            onClose={() => setMappingFile(null)}
          />
        )}
        {deleteFile && canDelete && (
          <DeleteFileModal
            file={deleteFile}
            onClose={() => setDeleteFile(null)}
            onConfirm={handleConfirmDelete}
          />
        )}
        {disconnectIntegration && canDelete && (
          <Modal open onClose={() => setDisconnectIntegration(null)} title="Desconectar integración" size="md">
            <div className="space-y-4">
              <div className="flex gap-3 rounded-lg border border-warning/25 bg-warning/5 p-4">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-text-primary">¿Desconectar {INTEGRATION_PROVIDERS.find((item) => item.type === disconnectIntegration)?.name ?? disconnectIntegration}?</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Se removerán las fuentes importadas desde esta integración y los KPIs se recalcularán con las fuentes restantes.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setDisconnectIntegration(null)}>Cancelar</Button>
                <Button variant="danger" onClick={confirmDisconnect}>Desconectar</Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

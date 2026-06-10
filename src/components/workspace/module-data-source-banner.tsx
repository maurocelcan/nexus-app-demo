"use client";
import { Database, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { ROUTES } from "@/lib/routes";
import { formatCount } from "@/lib/utils";
import type { AvailableDataset, DatasetSource, WorkspaceDatasetState } from "@/stores/data-source-store";
import type { ProcessedDataset } from "@/types/dataset";

type BannerMode = DatasetSource | "all";

export function ModuleDataSourceBanner({
  datasetState,
  dataset,
  availableDatasets = [],
  viewMode,
  onSelectView,
}: {
  datasetState: WorkspaceDatasetState;
  dataset: ProcessedDataset | null;
  availableDatasets?: AvailableDataset[];
  viewMode?: BannerMode;
  onSelectView?: (mode: BannerMode) => void;
}) {
  const router = useRouter();
  const tableCount = dataset?.semanticProfile?.tables.length ?? dataset?.sheets.length ?? 0;
  const kpiCount = dataset?.semanticProfile?.kpis.length ?? Object.values(dataset?.salesKpis ?? {}).filter((value) => typeof value === "number").length;
  const typeLabel = datasetState === "demo" ? "Demo CPG" : datasetState === "real" ? "Dataset real" : "Sin datos";
  const name = datasetState === "demo"
    ? "Demo CPG Portfolio 2025-2026"
    : dataset?.fileName ?? "No hay dataset activo";
  const showSelector = Boolean(onSelectView && viewMode && availableDatasets.length > 1);

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
            <Database className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-text-primary">{name}</p>
              <Badge variant={datasetState === "real" ? "accent" : datasetState === "demo" ? "primary" : "outline"} className="text-[10px]">
                {typeLabel}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted">
              <span>{formatCount(tableCount)} fuentes/tablas</span>
              <span>{formatCount(kpiCount)} KPIs detectados</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showSelector && (
            <Dropdown
              size="sm"
              className="w-44"
              value={viewMode ?? "all"}
              onChange={(value) => onSelectView?.(value as BannerMode)}
              options={[
                { value: "all", label: "Todos los datasets" },
                ...availableDatasets.map((item) => ({
                  value: item.id,
                  label: item.sourceType === "demo" ? "Demo CPG" : item.sourceType === "file" ? "Archivo real" : item.name,
                })),
              ]}
            />
          )}
          <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.DATA_SOURCES)}>
            <Upload className="h-3.5 w-3.5" />
            {datasetState === "empty" ? "Cargar datos" : "Cambiar fuente"}
          </Button>
        </div>
      </div>
    </div>
  );
}

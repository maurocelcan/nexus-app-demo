"use client";

import { useMemo, useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Download,
  Filter,
  LineChart,
  Map,
  MapPin,
  MousePointer2,
  Route,
  Sparkles,
  Store,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ScrollPanel } from "@/components/ui/scroll-panel";
import { ModuleDatasetEmptyState } from "@/components/workspace/dataset-state-panels";
import { ModuleDataSourceBanner } from "@/components/workspace/module-data-source-banner";
import { ModuleHeader } from "@/components/workspace/module-chrome";
import { GoogleMapsPDVMap, type MapPlace } from "@/components/workspace/google-maps-pdv-map";
import { canAccessModule, canExportReports } from "@/lib/permissions";
import { ROUTES } from "@/lib/routes";
import {
  buildRealSellThroughKpis,
  buildRevenueEvolution,
  buildSellInOutPassthrough,
  buildSkuRanking,
  buildVolumeEvolution,
  calculatePdvOpportunityFromPdvs,
  geoFactsToSellThroughPdvs,
  hasRealSellThroughData,
  type FilteredSeriesResult,
  type MiniBarRow,
  type RealKpiTile,
  type SellInOutRow,
} from "@/lib/sell-through-real";
import { geoBoundsContainsPoint, sellThroughPdvToGeo, type GeoBounds } from "@/lib/sell-through-map";
import { cn, generateId } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";
import { getActiveDataset, getWorkspaceDatasetState, useDataSourceStore } from "@/stores/data-source-store";
import type { ProjectGoal } from "@/types/analytics";
import {
  SELL_THROUGH_BASE_KPIS,
  SELL_THROUGH_DISTRIBUTORS,
  SELL_THROUGH_DYNAMICS,
  SELL_THROUGH_MIX,
  SELL_THROUGH_MONTHLY,
  SELL_THROUGH_PDVS,
  SELL_THROUGH_PERIODS,
  SELL_THROUGH_PROMOTION_MECHANICS,
  SELL_THROUGH_SELL_IN_OUT,
  SELL_THROUGH_SKUS,
  SELL_THROUGH_ZONES,
  type DynamicStatus,
  type PromotionMechanic,
  type SellThroughDynamic,
  type SellThroughPdv,
  type SellThroughPdvStatus,
  type SellThroughPeriod,
  type SellThroughSku,
} from "@/data/mock-sell-through";

type Tab = "summary" | "map";
type AnalysisTab = "pdvs" | "products" | "opportunity" | "activation";
type SortKey = "volume" | "revenue" | "opportunity" | "status" | "channel" | "growth";
type SelectionBounds = { left: number; top: number; width: number; height: number };
type PdvExportRow = Record<string, string | number>;
type ActivationDraft = {
  campaignName: string;
  targetPdvs: number;
  expectedVolume: number;
  currentPrice?: number;
  promoPrice?: number;
  targetMargin?: number;
  hypothesis: string;
  sourceLabel: string;
};
type PdvTableRow = SellThroughPdv | MapPlace;

function isMapPlaceRow(row: PdvTableRow): row is MapPlace {
  return !("status" in row);
}

const CHANNEL_OPTIONS = [
  { value: "all", label: "Todos los canales" },
  ...Array.from(new Set(SELL_THROUGH_PDVS.map((pdv) => pdv.channel))).map((channel) => ({
    value: channel,
    label: channel,
  })),
];

const ZONE_OPTIONS = [
  { value: "all", label: "Todas las zonas" },
  ...SELL_THROUGH_ZONES.map((zone) => ({ value: zone.id, label: zone.name })),
];

const DISTRIBUTOR_OPTIONS = [
  { value: "all", label: "Todos los distribuidores" },
  ...SELL_THROUGH_DISTRIBUTORS.map((distributor) => ({ value: distributor.id, label: distributor.name })),
];

const SKU_OPTIONS = [
  { value: "all", label: "Todos los SKUs" },
  ...SELL_THROUGH_SKUS.map((sku) => ({ value: sku.id, label: sku.name })),
];

const STATUS_LABELS: Record<SellThroughPdvStatus, string> = {
  buyer: "Comprador",
  "non-buyer": "No comprador",
  potential: "Potencial",
};

const STATUS_BADGE: Record<SellThroughPdvStatus, "success" | "danger" | "warning"> = {
  buyer: "success",
  "non-buyer": "danger",
  potential: "warning",
};

const STATUS_DOT: Record<SellThroughPdvStatus, string> = {
  buyer: "bg-success border-success/50",
  "non-buyer": "bg-danger border-danger/50",
  potential: "bg-warning border-warning/50",
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(value / 1000)}K`;
}

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

function getDistributorName(id: string): string {
  if (id === "real-pdv-file") return "Archivo PDV";
  return SELL_THROUGH_DISTRIBUTORS.find((distributor) => distributor.id === id)?.name ?? "Sin distribuidor";
}

function scale(value: number, factor: number): number {
  return Math.round(value * factor);
}

function getFactor(period: SellThroughPeriod): number {
  return SELL_THROUGH_PERIODS.find((item) => item.value === period)?.factor ?? 1;
}

function isPdvInsideGeoBounds(pdv: SellThroughPdv, bounds: GeoBounds): boolean {
  return geoBoundsContainsPoint(bounds, sellThroughPdvToGeo(pdv));
}

function isPdvInsideBounds(pdv: SellThroughPdv, bounds: SelectionBounds): boolean {
  return (
    pdv.x >= bounds.left &&
    pdv.x <= bounds.left + bounds.width &&
    pdv.y >= bounds.top &&
    pdv.y <= bounds.top + bounds.height
  );
}

function getZoneBounds(zoneId: string): SelectionBounds | null {
  return SELL_THROUGH_ZONES.find((zone) => zone.id === zoneId)?.bounds ?? null;
}

function KpiTile({
  label,
  value,
  detail,
  tooltip,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  /** Texto corto bajo el valor (opcional). */
  detail?: string;
  /** Texto completo para el tooltip del ícono. */
  tooltip?: string;
  icon: React.ElementType;
  tone?: "primary" | "accent" | "success" | "warning" | "danger" | "info";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-danger/10 text-danger border-danger/20",
    info: "bg-info/10 text-info border-info/20",
  }[tone];

  const iconEl = (
    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border", toneClass)}>
      <Icon className="h-4 w-4" />
    </div>
  );

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
          {detail && <p className="mt-1 text-xs text-text-muted">{detail}</p>}
        </div>
        {tooltip ? (
          <Tooltip content={tooltip}>
            {iconEl}
          </Tooltip>
        ) : iconEl}
      </div>
    </Card>
  );
}

function FilterBar({
  period,
  sku,
  channel,
  distributor,
  zone,
  onPeriod,
  onSku,
  onChannel,
  onDistributor,
  onZone,
  periodOptions,
  skuOptions,
  channelOptions,
  distributorOptions,
  zoneOptions,
}: {
  period: SellThroughPeriod;
  sku: string;
  channel: string;
  distributor: string;
  zone: string;
  onPeriod: (period: SellThroughPeriod) => void;
  onSku: (sku: string) => void;
  onChannel: (channel: string) => void;
  onDistributor: (distributor: string) => void;
  onZone: (zone: string) => void;
  periodOptions: { value: string; label: string }[];
  skuOptions: { value: string; label: string }[];
  channelOptions: { value: string; label: string }[];
  distributorOptions: { value: string; label: string }[];
  zoneOptions: { value: string; label: string }[];
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-text-muted" />
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Filtros</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
        <Dropdown
          size="sm"
          options={periodOptions}
          value={period}
          onChange={(value) => onPeriod(value as SellThroughPeriod)}
        />
        <Dropdown size="sm" options={skuOptions} value={sku} onChange={onSku} />
        <Dropdown size="sm" options={channelOptions} value={channel} onChange={onChannel} />
        <Dropdown size="sm" options={distributorOptions} value={distributor} onChange={onDistributor} />
        <Dropdown size="sm" options={zoneOptions} value={zone} onChange={onZone} />
      </div>
    </Card>
  );
}

function MiniBars({
  rows,
  valueKey,
  targetKey,
}: {
  rows: { label: string; value: number; target?: number }[];
  valueKey: string;
  targetKey?: string;
}) {
  const max = Math.max(...rows.flatMap((row) => [row.value, row.target ?? 0]), 1);
  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={`${row.label}-${index}`}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs">
            <span className="truncate text-text-secondary">{row.label}</span>
            <span className="font-mono text-text-primary">{formatNumber(row.value)}</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-surface-soft">
            {row.target !== undefined && (
              <div className="absolute top-0 h-full rounded-full bg-primary/25" style={{ width: `${Math.min((row.target / max) * 100, 100)}%` }} />
            )}
            <div className="relative h-full rounded-full bg-accent" style={{ width: `${Math.min((row.value / max) * 100, 100)}%` }} />
          </div>
          {targetKey && <p className="mt-1 text-[10px] text-text-muted">{valueKey} vs {targetKey}</p>}
        </div>
      ))}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-6 text-center text-sm text-text-muted">
      {message}
    </div>
  );
}

function BoundedContent({
  children,
  maxHeight = 320,
}: {
  children: React.ReactNode;
  maxHeight?: number;
}) {
  return <ScrollPanel maxHeight={maxHeight}>{children}</ScrollPanel>;
}

function SellInOutBars({ rows }: { rows: SellInOutRow[] }) {
  if (rows.length === 0) return <EmptyChart message="No hay sell-in suficiente para calcular passthrough." />;
  const max = Math.max(...rows.flatMap((row) => [row.sellIn ?? 0, row.sellOut ?? 0]), 1);
  return (
    <div className="space-y-3">
      {rows.slice(-12).map((row, index) => (
        <div key={`${row.label}-${index}`}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs">
            <span className="truncate text-text-secondary">{row.label}</span>
            <span className="font-mono text-accent">
              {row.passthrough !== undefined ? `${Math.round(row.passthrough * 100)}% PT` : "PT N/A"}
            </span>
          </div>
          <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-2 text-[10px] text-text-muted">
            <span>Sell-in</span>
            <div className="h-2 rounded-full bg-surface-soft">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(((row.sellIn ?? 0) / max) * 100, 100)}%` }} />
            </div>
            <span>Sell-out</span>
            <div className="h-2 rounded-full bg-surface-soft">
              <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(((row.sellOut ?? 0) / max) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RealSummaryTab({
  kpis,
  revenue,
  volume,
  sellInOutRows,
  skuRows,
}: {
  kpis: RealKpiTile[];
  revenue: FilteredSeriesResult;
  volume: FilteredSeriesResult;
  sellInOutRows: SellInOutRow[];
  skuRows: MiniBarRow[];
}) {
  const icons: Record<string, React.ElementType> = {
    netRevenue: BarChart3,
    sellOut: Boxes,
    buyers: Users,
    successPhoto: CheckCircle2,
    activePdvs: Store,
    mix: Target,
    margin: LineChart,
    opportunity: Sparkles,
  };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiTile key={kpi.id} label={kpi.label} value={kpi.value} detail={kpi.detail} tooltip={kpi.tooltip} icon={icons[kpi.id] ?? BarChart3} tone={kpi.tone} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolución de facturación</CardTitle>
          </CardHeader>
          <CardContent>
            {revenue.message && <p className="mb-3 text-xs text-text-muted">{revenue.message}</p>}
            {revenue.rows.length > 0 ? <BoundedContent><MiniBars rows={revenue.rows} valueKey="Real" /></BoundedContent> : <EmptyChart message={revenue.message ?? "Sin serie real de facturación para el período seleccionado."} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Evolución de volumen</CardTitle>
          </CardHeader>
          <CardContent>
            {volume.message && <p className="mb-3 text-xs text-text-muted">{volume.message}</p>}
            {volume.rows.length > 0 ? <BoundedContent><MiniBars rows={volume.rows} valueKey="Real" /></BoundedContent> : <EmptyChart message={volume.message ?? "Sin serie real de volumen para el período seleccionado."} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sell-in y Sell-out por mes</CardTitle>
          </CardHeader>
          <CardContent>
            <BoundedContent>
              <SellInOutBars rows={sellInOutRows} />
            </BoundedContent>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ranking de SKUs</CardTitle>
          </CardHeader>
          <CardContent>
            {skuRows.length > 0 ? <BoundedContent><MiniBars rows={skuRows} valueKey="Volumen" /></BoundedContent> : <EmptyChart message="Sin ranking SKU real para los filtros actuales." />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryTab({ period, factor, pdvs }: { period: SellThroughPeriod; factor: number; pdvs: SellThroughPdv[] }) {
  const buyers = pdvs.filter((pdv) => pdv.status === "buyer").length;
  const activePdvs = pdvs.filter((pdv) => pdv.served).length;
  const scaledRevenue = scale(SELL_THROUGH_BASE_KPIS.netRevenue, factor);
  const scaledVolume = scale(SELL_THROUGH_BASE_KPIS.volume, factor);
  const selectedPeriod = SELL_THROUGH_PERIODS.find((item) => item.value === period)?.label ?? period;
  const skuRows = SELL_THROUGH_SKUS
    .map((sku) => ({ label: sku.name.replace(" 750ml", "").replace(" 700ml", ""), value: scale(sku.volume, factor), target: Math.round(scale(sku.volume, factor) * (sku.trend < 0 ? 1.12 : 1.04)) }))
    .sort((a, b) => b.value - a.value);
  const sellInOutRows = SELL_THROUGH_SELL_IN_OUT.map((row) => ({
    label: row.label,
    sellIn: scale(row.sellIn, factor),
    sellOut: scale(row.sellOut, factor),
    passthrough: row.passthrough,
  }));

  return (
    <div className="space-y-6">
      {/* KPI strip — mismas 8 tiles que real */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile label="Net Revenue" value={formatCurrency(scaledRevenue)} detail={`${selectedPeriod}`} icon={BarChart3} tone="accent" tooltip="Fuente: Demo CPG · Net Revenue sell-through acumulado" />
        <KpiTile label="Sell Out" value={formatNumber(scaledVolume)} detail={`${selectedPeriod}`} icon={Boxes} tone="primary" tooltip="Fuente: Demo CPG · Cajas vendidas en PDVs en el período" />
        <KpiTile label="Clientes compradores" value={formatNumber(scale(SELL_THROUGH_BASE_KPIS.buyerCustomers, factor))} detail={`${buyers} PDVs visibles`} icon={Users} tone="info" tooltip="Fuente: Demo CPG · PDVs con al menos una compra en el período" />
        <KpiTile label="Foto de éxito" value={`${SELL_THROUGH_BASE_KPIS.successPhoto}%`} detail="" icon={CheckCircle2} tone="success" tooltip="Fuente: Demo CPG · Cumplimiento promedio de imagen de ejecución en el punto de venta" />
        <KpiTile label="PDVs activos" value={formatNumber(activePdvs)} detail="" icon={Store} tone="success" tooltip="Fuente: Demo CPG · PDVs con distribuidor activo asignado en el período" />
        <KpiTile label="Mix real vs objetivo" value={`${SELL_THROUGH_BASE_KPIS.mixReal}% / ${SELL_THROUGH_BASE_KPIS.mixTarget}%`} detail={`${SELL_THROUGH_BASE_KPIS.mixTarget - SELL_THROUGH_BASE_KPIS.mixReal}pp de brecha`} icon={Target} tone="warning" tooltip="Fuente: Demo CPG · Mix real = participación de SKU en el total de PDVs. Objetivo definido por RGM." />
        <KpiTile label="Margen estimado" value={`${SELL_THROUGH_BASE_KPIS.margin}%`} detail="" icon={LineChart} tone="accent" tooltip="Fuente: Demo CPG · Margen de contribución estimado sobre sell-through" />
        <KpiTile label="Oportunidad PDV" value={formatCurrency(pdvs.reduce((acc, pdv) => acc + pdv.opportunity, 0))} detail="" icon={Sparkles} tone="primary" tooltip="Fuente: Demo CPG · Revenue incremental estimado sobre PDVs no compradores o potenciales" />
      </div>

      {/* 4 gráficos — misma estructura que real */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolución de facturación</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniBars
              rows={SELL_THROUGH_MONTHLY.map((row) => ({ label: row.label, value: scale(row.revenue, factor), target: scale(row.revenue * 1.06, factor) }))}
              valueKey="Real"
              targetKey="Objetivo"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Evolución de volumen</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniBars
              rows={SELL_THROUGH_MONTHLY.map((row) => ({ label: row.label, value: scale(row.volume, factor), target: scale(row.target, factor) }))}
              valueKey="Real"
              targetKey="Objetivo"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sell-in y Sell-out por mes</CardTitle>
          </CardHeader>
          <CardContent>
            <BoundedContent>
              <SellInOutBars rows={sellInOutRows} />
            </BoundedContent>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ranking de SKUs</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniBars rows={skuRows} valueKey="Volumen" targetKey="Objetivo" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SellThroughMap({
  pdvs,
  selectedPdv,
  selectionBounds,
  selectionLabel,
  traceMode,
  onSelectPdv,
  onSelectionComplete,
}: {
  pdvs: SellThroughPdv[];
  selectedPdv: string | null;
  selectionBounds: SelectionBounds | null;
  selectionLabel: string;
  traceMode: boolean;
  onSelectPdv: (id: string | null) => void;
  onSelectionComplete: (bounds: SelectionBounds) => void;
}) {
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [draftBounds, setDraftBounds] = useState<SelectionBounds | null>(null);
  const [zoom, setZoom] = useState(1.05);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const visibleBounds = draftBounds ?? selectionBounds;
  const selected = pdvs.find((pdv) => pdv.id === selectedPdv) ?? null;

  function pointFromEvent(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, (((event.clientX - rect.left - pan.x) / zoom) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, (((event.clientY - rect.top - pan.y) / zoom) / rect.height) * 100)),
    };
  }

  function boundsFromPoints(a: { x: number; y: number }, b: { x: number; y: number }): SelectionBounds {
    return {
      left: Math.min(a.x, b.x),
      top: Math.min(a.y, b.y),
      width: Math.abs(a.x - b.x),
      height: Math.abs(a.y - b.y),
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (traceMode) {
      const point = pointFromEvent(event);
      setDragStart(point);
      setDraftBounds({ left: point.x, top: point.y, width: 0, height: 0 });
    } else {
      setPanStart({ x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y });
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (traceMode && dragStart) {
      setDraftBounds(boundsFromPoints(dragStart, pointFromEvent(event)));
      return;
    }
    if (panStart) {
      setPan({
        x: panStart.panX + event.clientX - panStart.x,
        y: panStart.panY + event.clientY - panStart.y,
      });
    }
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (traceMode && dragStart) {
      const finalBounds = boundsFromPoints(dragStart, pointFromEvent(event));
      setDragStart(null);
      setDraftBounds(null);
      if (finalBounds.width >= 4 && finalBounds.height >= 4) {
        onSelectionComplete(finalBounds);
      }
    }
    setPanStart(null);
  }

  return (
    <Card className="overflow-hidden">
      <div
        className={cn("relative min-h-[640px] select-none overflow-hidden bg-surface-elevated", traceMode ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing")}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="absolute right-4 top-4 z-30 flex overflow-hidden rounded-lg border border-border bg-surface shadow-elevated">
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setZoom((value) => Math.min(1.6, Number((value + 0.15).toFixed(2))));
            }}
            className="flex h-8 w-8 items-center justify-center text-text-secondary hover:bg-surface-soft hover:text-text-primary"
            aria-label="Acercar mapa"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setZoom((value) => Math.max(0.65, Number((value - 0.15).toFixed(2))));
            }}
            className="flex h-8 w-8 items-center justify-center border-l border-border text-text-secondary hover:bg-surface-soft hover:text-text-primary"
            aria-label="Alejar mapa"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setZoom(1.05);
              setPan({ x: 0, y: 0 });
            }}
            className="border-l border-border px-2 text-[10px] font-medium text-text-muted hover:bg-surface-soft hover:text-text-primary"
          >
            {Math.round(zoom * 100)}%
          </button>
        </div>

        <div className="absolute inset-0 origin-top-left transition-transform duration-100" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          <div className="absolute inset-0 opacity-70">
            <div className="absolute left-[12%] top-0 h-full w-px bg-border-soft" />
            <div className="absolute left-[31%] top-0 h-full w-px bg-border-soft" />
            <div className="absolute left-[54%] top-0 h-full w-px bg-border-soft" />
            <div className="absolute left-[77%] top-0 h-full w-px bg-border-soft" />
            <div className="absolute left-0 top-[18%] h-px w-full bg-border-soft" />
            <div className="absolute left-0 top-[41%] h-px w-full bg-border-soft" />
            <div className="absolute left-0 top-[63%] h-px w-full bg-border-soft" />
            <div className="absolute left-0 top-[82%] h-px w-full bg-border-soft" />
          </div>

          <div className="absolute left-[7%] top-[20%] h-[11%] w-[61%] rotate-[-9deg] rounded-full border border-border bg-surface-soft/70" />
          <div className="absolute left-[31%] top-[50%] h-[10%] w-[57%] rotate-[18deg] rounded-full border border-border bg-surface-soft/70" />
          <div className="absolute left-[4%] top-[64%] h-[9%] w-[46%] rotate-[-18deg] rounded-full border border-border bg-surface-soft/50" />
          <div className="absolute left-[12%] top-[42%] h-[8%] w-[42%] rotate-[24deg] rounded-full border border-border bg-surface-soft/40" />
          <div className="absolute left-[58%] top-[66%] h-[8%] w-[35%] rotate-[-8deg] rounded-full border border-border bg-surface-soft/40" />
          <div className="absolute left-[70%] top-[8%] h-[30%] w-[18%] rounded-xl border border-info/15 bg-info/10" />
          <div className="absolute left-[8%] top-[74%] h-[16%] w-[22%] rounded-xl border border-success/15 bg-success/10" />
          <div className="absolute bottom-4 left-4 right-4 top-4 rounded-lg border border-border/80" />
          {[
            { label: "Palermo", x: 19, y: 13 },
            { label: "Recoleta", x: 63, y: 18 },
            { label: "Caballito", x: 35, y: 88 },
            { label: "Av. Santa Fe", x: 43, y: 25 },
            { label: "Av. Rivadavia", x: 54, y: 58 },
          ].map((label) => (
            <span key={label.label} className="absolute rounded bg-surface/85 px-1.5 py-0.5 text-[10px] font-medium text-text-muted" style={{ left: `${label.x}%`, top: `${label.y}%` }}>
              {label.label}
            </span>
          ))}

          {visibleBounds && (
            <div
              className={cn(
                "absolute rounded-lg border-2 border-primary bg-primary/10 shadow-glow-primary transition-all",
                (traceMode || draftBounds) && "border-dashed"
              )}
              style={{
                left: `${visibleBounds.left}%`,
                top: `${visibleBounds.top}%`,
                width: `${visibleBounds.width}%`,
                height: `${visibleBounds.height}%`,
              }}
            >
              <div className="absolute -top-7 left-0 rounded-md border border-primary/25 bg-surface px-2 py-1 text-[10px] font-medium text-primary-soft">
                {draftBounds ? "Trazando zona" : selectionLabel}
              </div>
            </div>
          )}

          {pdvs.map((pdv) => {
            const isSelected = selectedPdv === pdv.id;
            const isLarge = pdv.volume >= 3500;
            const isInside = visibleBounds ? isPdvInsideBounds(pdv, visibleBounds) : false;
            return (
              <button
                key={pdv.id}
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!traceMode) onSelectPdv(pdv.id);
                }}
                title={pdv.name}
                className={cn(
                  "absolute z-10 flex items-center justify-center rounded-full border-2 transition-all hover:scale-125 focus-visible:scale-125",
                  isLarge ? "h-4 w-4" : "h-3 w-3",
                  STATUS_DOT[pdv.status],
                  visibleBounds && !isInside && "opacity-35",
                  isInside && "ring-2 ring-primary/35",
                  isSelected && "h-5 w-5 border-text-primary ring-4 ring-primary/30"
                )}
                style={{ left: `${pdv.x}%`, top: `${pdv.y}%` }}
              >
                <span className="sr-only">{pdv.name}</span>
              </button>
            );
          })}
        </div>

        {selected && (
          <div
            className="absolute bottom-4 right-4 z-30 w-[min(380px,calc(100%-32px))] rounded-lg border border-border bg-surface/95 p-4 shadow-elevated"
            onPointerDown={(event) => event.stopPropagation()}
            onPointerMove={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">{selected.name}</p>
                <p className="text-xs text-text-muted">{selected.channel} · {getDistributorName(selected.distributorId)}</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectPdv(null)}
                className="text-text-muted hover:text-text-primary"
                aria-label="Cerrar ficha de PDV"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-surface-soft p-2">
                <p className="text-text-muted">Estado</p>
                <Badge variant={STATUS_BADGE[selected.status]} className="mt-1">{STATUS_LABELS[selected.status]}</Badge>
              </div>
              <div className="rounded-md bg-surface-soft p-2">
                <p className="text-text-muted">Facturación</p>
                <p className="mt-1 font-semibold text-text-primary">{formatCurrency(selected.revenue)}</p>
              </div>
              <div className="rounded-md bg-surface-soft p-2">
                <p className="text-text-muted">Volumen</p>
                <p className="mt-1 font-semibold text-text-primary">{formatNumber(selected.volume)} cajas</p>
              </div>
              <div className="rounded-md bg-surface-soft p-2">
                <p className="text-text-muted">Oportunidad</p>
                <p className="mt-1 font-semibold text-accent">{formatCurrency(selected.opportunity)}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md border border-border p-2">
                <p className="text-text-muted">Mix actual / objetivo</p>
                <p className="mt-1 font-semibold text-text-primary">{selected.mixReal}% / {selected.mixTarget}%</p>
              </div>
              <div className="rounded-md border border-border p-2">
                <p className="text-text-muted">Última compra</p>
                <p className="mt-1 font-semibold text-text-primary">{selected.lastPurchase}</p>
              </div>
            </div>
            <div className="mt-3 rounded-md border border-border p-2 text-xs text-text-secondary">
              SKUs comprados: {selected.skusBought.length > 0 ? selected.skusBought.join(", ") : "sin compra registrada"}
            </div>
          </div>
        )}
        <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface/95 p-2">
          {(["buyer", "potential", "non-buyer"] as SellThroughPdvStatus[]).map((status) => (
            <div key={status} className="flex items-center gap-1.5 text-[10px] text-text-secondary">
              <span className={cn("h-2.5 w-2.5 rounded-full border", STATUS_DOT[status])} />
              {STATUS_LABELS[status]}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function ZoneKpiPanel({ pdvs, places }: { pdvs: SellThroughPdv[]; places: MapPlace[] }) {
  const isRealPdvFile = pdvs.some((pdv) => pdv.distributorId === "real-pdv-file");
  const buyers = pdvs.filter((pdv) => pdv.status === "buyer");
  const nonBuyers = pdvs.filter((pdv) => pdv.status !== "buyer");
  const potential = pdvs.filter((pdv) => pdv.status === "potential");
  const served = pdvs.filter((pdv) => pdv.served);
  const revenue = pdvs.reduce((acc, pdv) => acc + pdv.revenue, 0);
  const volume = pdvs.reduce((acc, pdv) => acc + pdv.volume, 0);
  const opportunity = isRealPdvFile ? calculatePdvOpportunityFromPdvs(pdvs) : pdvs.reduce((acc, pdv) => acc + pdv.opportunity, 0);
  const coverage = Math.round((buyers.length / Math.max(pdvs.length, 1)) * 100);
  const mixReal = Math.round(pdvs.reduce((acc, pdv) => acc + pdv.mixReal, 0) / Math.max(pdvs.length, 1));
  const mixTarget = Math.round(pdvs.reduce((acc, pdv) => acc + pdv.mixTarget, 0) / Math.max(pdvs.length, 1));
  const tickets = pdvs.map((pdv) => pdv.averageTicket).filter((value): value is number => value !== undefined && value > 0);
  const ticketPromedio = tickets.length > 0
    ? tickets.reduce((acc, value) => acc + value, 0) / tickets.length
    : revenue / Math.max(buyers.length, 1);
  const universeCount = pdvs.length + places.length;

  const rows = [
    ["Universo real", universeCount.toString()],
    ...(places.length > 0 ? [["Lugares externos", places.length.toString()]] : []),
    ["PDVs atendidos", served.length.toString()],
    ["Compradores", buyers.length.toString()],
    ["No compradores", nonBuyers.length.toString()],
    ["Con potencial", potential.length.toString()],
    ["Cobertura", `${coverage}%`],
    ["Facturación", formatCurrency(revenue)],
    ["Volumen", formatNumber(volume)],
    ["Ticket promedio", formatCurrency(ticketPromedio)],
    ...(isRealPdvFile ? [] : [["Mix real / objetivo", `${mixReal}% / ${mixTarget}%`]]),
    ["Gap compradores", `${nonBuyers.length} PDVs`],
    ["Oportunidad", isRealPdvFile ? `${formatNumber(opportunity)} unidades` : formatCurrency(opportunity)],
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>KPIs de zona seleccionada</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 border-b border-border/50 pb-2 last:border-0 last:pb-0">
            <span className="text-xs text-text-muted">{label}</span>
            <span className="text-sm font-semibold text-text-primary">{value}</span>
          </div>
        ))}
        {places.length > 0 && (
          <div className="rounded-lg border border-border bg-surface-soft p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Lugares agregados</p>
            <div className="mt-2 space-y-2">
              {places.map((place) => (
                <div key={place.id} className="text-xs">
                  <p className="font-medium text-text-primary">{place.name}</p>
                  <p className="text-[10px] text-text-muted">{place.address}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PdvTable({
  rows,
  sortKey,
  onSort,
  onExport,
}: {
  rows: PdvTableRow[];
  sortKey: SortKey;
  onSort: (key: SortKey) => void;
  onExport?: (data: PdvExportRow[]) => void;
}) {
  const pdvRows = rows.filter((row): row is SellThroughPdv => !isMapPlaceRow(row));
  const isRealPdvFile = pdvRows.some((pdv) => pdv.distributorId === "real-pdv-file");
  const headers: { key: SortKey; label: string }[] = [
    { key: "revenue", label: "Facturación" },
    { key: "volume", label: "Volumen" },
    { key: "opportunity", label: "Oportunidad" },
    { key: "status", label: "Estado" },
    { key: "channel", label: "Canal" },
  ];
  const exportableData = useMemo<PdvExportRow[]>(() => {
    const data: PdvExportRow[] = [];

    // Add MapPlace rows (lugares externos)
    const mapPlaceRows = rows.filter(isMapPlaceRow) as MapPlace[];
    for (const row of mapPlaceRows) {
      data.push({
        "PDV": row.name,
        "Canal": "Lugar externo",
        "Distribuidor": "Sin distribuidor",
        "Estado": "Mapa",
        "Facturación": "N/A",
        "Volumen": "N/A",
        "SKUs": "N/A",
        "Última compra": "N/A",
        "Oportunidad (Gap)": "N/A",
      });
    }

    // Add SellThroughPdv rows
    const pvRows = rows.filter((row): row is SellThroughPdv => !isMapPlaceRow(row));
    for (const row of pvRows) {
      data.push({
        "PDV": row.name,
        "Canal": row.channel,
        "Distribuidor": getDistributorName(row.distributorId),
        "Estado": STATUS_LABELS[row.status],
        "Facturación": formatCurrency(row.revenue),
        "Volumen": formatNumber(row.volume),
        "SKUs": isRealPdvFile ? "N/A" : row.skusBought.length,
        "Última compra": row.lastPurchase,
        "Oportunidad (Gap)": isRealPdvFile ? `${formatNumber(row.opportunity)} u.` : formatCurrency(row.opportunity),
      });
    }

    return data;
  }, [rows]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Tabla de PDVs</CardTitle>
          <div className="flex flex-wrap gap-1.5">
            {headers.map((header) => (
              <Button key={header.key} size="sm" variant={sortKey === header.key ? "outline" : "ghost"} onClick={() => onSort(header.key)}>
                {header.label}
              </Button>
            ))}
            {onExport && (
              <Button size="sm" variant="secondary" onClick={() => onExport(exportableData)}>
                <Download className="h-3.5 w-3.5" />Exportar Reporte
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollPanel maxHeight={520}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-surface">
              <tr className="border-b border-border">
                {["PDV", "Canal", "Distribuidor", "Estado", "Facturación", "Volumen", "SKUs", "Última compra", "Gap"].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wide text-text-muted">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                isMapPlaceRow(row) ? (
                  <tr key={`place-${row.id}`} className="border-b border-border/50 bg-surface-soft/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{row.name}</div>
                      <div className="text-[10px] text-text-muted">{row.address}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">Lugar externo</td>
                    <td className="px-4 py-3 text-xs text-text-secondary">Sin distribuidor</td>
                    <td className="px-4 py-3"><Badge variant="outline">Mapa</Badge></td>
                    <td className="px-4 py-3 text-xs text-text-muted">N/A</td>
                    <td className="px-4 py-3 text-xs text-text-muted">N/A</td>
                    <td className="px-4 py-3 text-xs text-text-muted">N/A</td>
                    <td className="px-4 py-3 text-xs text-text-muted">N/A</td>
                    <td className="px-4 py-3 text-xs text-text-muted">N/A</td>
                  </tr>
                ) : (
                  <tr key={row.id} className="border-b border-border/50 hover:bg-surface-soft">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{row.name}</div>
                      <div className="text-[10px] text-text-muted">{SELL_THROUGH_ZONES.find((zone) => zone.id === row.zoneId)?.name ?? row.zoneId}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{row.channel}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{getDistributorName(row.distributorId)}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_BADGE[row.status]}>{STATUS_LABELS[row.status]}</Badge></td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{formatCurrency(row.revenue)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{formatNumber(row.volume)}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{isRealPdvFile ? "N/A" : row.skusBought.length}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{row.lastPurchase}</td>
                    <td className="px-4 py-3 text-xs font-medium text-accent">{isRealPdvFile ? `${formatNumber(row.opportunity)} u.` : formatCurrency(row.opportunity)}</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
        </ScrollPanel>
      </CardContent>
    </Card>
  );
}

async function exportPdvsToExcel(data: PdvExportRow[], filename = "PDVs_Sell-Through.xlsx") {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "PDVs");
  XLSX.writeFile(wb, filename);
}

function ProductBuyersTable({ skus, factor }: { skus: SellThroughSku[]; factor: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos y clientes compradores</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["SKU", "Categoría", "Compradores", "DN real", "Objetivo", "Gap", "Volumen", "Facturación", "Tendencia"].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wide text-text-muted">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {skus.map((sku) => {
                const gap = sku.targetDistribution - sku.distribution;
                return (
                  <tr key={sku.id} className="border-b border-border/50 hover:bg-surface-soft">
                    <td className="px-4 py-3 font-medium text-text-primary">{sku.name}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{sku.category}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{formatNumber(scale(sku.buyerCustomers, factor))}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{sku.distribution}%</td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{sku.targetDistribution}%</td>
                    <td className={cn("px-4 py-3 text-xs font-semibold", gap > 0 ? "text-warning" : "text-success")}>{gap > 0 ? `${gap}pp` : "OK"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{formatNumber(scale(sku.volume, factor))}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{formatCurrency(scale(sku.revenue, factor))}</td>
                    <td className="px-4 py-3">
                      <Badge variant={sku.trend >= 0 ? "success" : "danger"}>{sku.trend >= 0 ? "+" : ""}{sku.trend}%</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function RealProductsAndMix({ skuRows }: { skuRows: MiniBarRow[] }) {
  if (skuRows.length === 0) {
    return <EmptyChart message="La fuente cargada no contiene mix por SKU ni compradores por SKU para estos filtros." />;
  }
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card>
        <CardHeader>
          <CardTitle>Productos reales detectados</CardTitle>
        </CardHeader>
        <CardContent>
          <BoundedContent maxHeight={420}>
            <MiniBars rows={skuRows} valueKey="Volumen sell-out" />
          </BoundedContent>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Mix real vs mix objetivo</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyChart message="La fuente cargada no contiene mix real y mix objetivo por SKU. No se muestran productos demo." />
        </CardContent>
      </Card>
    </div>
  );
}

function MixComparison() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mix real vs mix objetivo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {SELL_THROUGH_MIX.map((row) => {
          const gap = row.target - row.real;
          return (
            <div key={row.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-text-secondary">{row.label}</span>
                <span className={gap > 0 ? "text-warning" : "text-success"}>{gap > 0 ? `${gap}pp bajo objetivo` : `${Math.abs(gap)}pp sobre objetivo`}</span>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <div className="space-y-1.5">
                  <div className="h-2 rounded-full bg-surface-soft">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${row.real}%` }} />
                  </div>
                  <div className="h-2 rounded-full bg-surface-soft">
                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${row.target}%` }} />
                  </div>
                </div>
                <div className="w-20 text-right text-xs font-mono text-text-muted">
                  {row.real}% / {row.target}%
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function SkuComparator({
  witnessSkuId,
  targetSkuId,
  onWitness,
  onTarget,
  pdvs,
  onUseRecommended,
}: {
  witnessSkuId: string;
  targetSkuId: string;
  onWitness: (id: string) => void;
  onTarget: (id: string) => void;
  pdvs: SellThroughPdv[];
  onUseRecommended: (draft: ActivationDraft) => void;
}) {
  const [sellMode, setSellMode] = useState<"sell-in" | "sell-out">("sell-in");
  const witness = SELL_THROUGH_SKUS.find((sku) => sku.id === witnessSkuId) ?? SELL_THROUGH_SKUS[0];
  const target = SELL_THROUGH_SKUS.find((sku) => sku.id === targetSkuId) ?? SELL_THROUGH_SKUS[1];
  const recommended = pdvs
    .filter((pdv) => pdv.skusBought.includes(witness.id) && !pdv.skusBought.includes(target.id))
    .sort((a, b) => b.opportunity - a.opportunity);
  const conversionGap = Math.max(witness.buyerCustomers - target.buyerCustomers, 0);
  const revenuePotential = recommended.reduce((acc, pdv) => acc + pdv.opportunity, 0);
  const highPotential = recommended.filter((pdv) => pdv.opportunity >= 18000);
  const activationPdvs = highPotential.length > 0 ? highPotential : recommended.slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Oportunidad por SKU</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-surface-elevated p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">Qué está mirando Nexus</p>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">
                El SKU testigo marca dónde la categoría ya funciona. El SKU objetivo es el producto que queremos introducir o acelerar en esos mismos PDVs.
              </p>
            </div>
            <div className="flex shrink-0 overflow-hidden rounded-lg border border-border bg-surface text-xs font-medium">
              <button
                type="button"
                onClick={() => setSellMode("sell-in")}
                className={cn(
                  "px-3 py-1.5 transition-colors",
                  sellMode === "sell-in" ? "bg-primary/15 text-primary-soft" : "text-text-muted hover:text-text-primary"
                )}
              >
                Sell In
              </button>
              <button
                type="button"
                onClick={() => setSellMode("sell-out")}
                className={cn(
                  "border-l border-border px-3 py-1.5 transition-colors",
                  sellMode === "sell-out" ? "bg-primary/15 text-primary-soft" : "text-text-muted hover:text-text-primary"
                )}
              >
                Sell Out
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Dropdown label="SKU testigo" options={SELL_THROUGH_SKUS.map((sku) => ({ value: sku.id, label: sku.name }))} value={witnessSkuId} onChange={onWitness} />
          <Dropdown label="SKU objetivo" options={SELL_THROUGH_SKUS.map((sku) => ({ value: sku.id, label: sku.name }))} value={targetSkuId} onChange={onTarget} />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <KpiTile label="PDVs zona" value={formatNumber(pdvs.length)} detail="Universo seleccionado" icon={Store} tone="info" />
          <KpiTile label="Compran testigo" value={formatNumber(pdvs.filter((pdv) => pdv.skusBought.includes(witness.id)).length)} detail={witness.name} icon={CheckCircle2} tone="success" />
          <KpiTile label="No compran objetivo" value={formatNumber(recommended.length)} detail={target.name} icon={Target} tone="warning" />
          <KpiTile label="Alto potencial" value={formatNumber(activationPdvs.length)} detail="Candidatos inmediatos" icon={Sparkles} tone="primary" />
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">Oportunidad estimada: {formatCurrency(revenuePotential)}</p>
              <p className="text-xs text-text-muted">{activationPdvs.length} PDVs recomendados para activar primero.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">Volumen potencial {formatNumber(recommended.reduce((acc, pdv) => acc + Math.max(120, Math.round(pdv.opportunity / 45)), 0))} cajas</Badge>
              <Button
                size="sm"
                variant="primary"
                disabled={activationPdvs.length === 0}
                onClick={() => onUseRecommended({
                  campaignName: `Activación ${target.name.split(" ").slice(0, 2).join(" ")} en PDVs testigo`,
                  targetPdvs: Math.max(activationPdvs.length, 1),
                  expectedVolume: Math.max(24, Math.round(recommended.reduce((acc, pdv) => acc + Math.max(120, Math.round(pdv.opportunity / 45)), 0) / Math.max(activationPdvs.length, 1))),
                  hypothesis: `Convertir PDVs que compran ${witness.name} pero todavía no compran ${target.name}.`,
                  sourceLabel: `${activationPdvs.length} PDVs recomendados desde ${witness.name} → ${target.name}`,
                })}
              >
                Usar PDVs recomendados
              </Button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["PDV recomendado", "Canal", "Distribuidor", "Oportunidad", "Mix actual"].map((header) => (
                  <th key={header} className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-text-muted">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recommended.slice(0, 6).map((pdv) => (
                <tr key={pdv.id} className="border-b border-border/50">
                  <td className="px-3 py-2 text-xs font-medium text-text-primary">{pdv.name}</td>
                  <td className="px-3 py-2 text-xs text-text-secondary">{pdv.channel}</td>
                  <td className="px-3 py-2 text-xs text-text-secondary">{getDistributorName(pdv.distributorId)}</td>
                  <td className="px-3 py-2 text-xs text-accent">{formatCurrency(pdv.opportunity)}</td>
                  <td className="px-3 py-2 text-xs text-text-secondary">{pdv.mixReal}%</td>
                </tr>
              ))}
              {recommended.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-xs text-text-muted">No hay PDVs recomendados con los filtros actuales.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function PromotionBuilder({
  targetPdvCount,
  draft,
  onToast,
  onRegister,
}: {
  targetPdvCount: number;
  draft: ActivationDraft;
  onToast: (message: string) => void;
  onRegister: (dynamic: SellThroughDynamic) => void;
}) {
  const [form, setForm] = useState(() => {
    const start = new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + 28);
    return {
      campaignName: draft.campaignName,
      mechanic: "Precio especial" as PromotionMechanic,
      currentPrice: draft.currentPrice ?? 50,
      promoPrice: draft.promoPrice ?? 45,
      expectedVolume: draft.expectedVolume,
      targetPdvs: Math.max(draft.targetPdvs || targetPdvCount, 1),
      targetMargin: draft.targetMargin ?? 34,
      duration: 4,
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      hypothesis: draft.hypothesis,
    };
  });

  const simulation = useMemo(() => {
    const baseMarginPct = Math.max(form.targetMargin, 1) / 100;
    const discount = Math.max(form.currentPrice - form.promoPrice, 0) / Math.max(form.currentPrice, 1);
    const mechanicMarginImpact: Record<PromotionMechanic, number> = {
      "Precio especial": 0,
      "Descuento porcentual": -0.02,
      Combo: 0.015,
      Bundle: 0.02,
      Bonificación: -0.04,
      "2x1 / segunda unidad": -0.12,
    };
    const estimatedMarginPct = Math.max(0.08, baseMarginPct - discount * 0.55 + (mechanicMarginImpact[form.mechanic] ?? 0));
    const baseContribution = form.currentPrice * form.expectedVolume * form.targetPdvs * baseMarginPct;
    const requiredTotalVolume = Math.ceil(baseContribution / Math.max(form.promoPrice * estimatedMarginPct, 1));
    const plannedTotalVolume = form.expectedVolume * form.targetPdvs;
    const requiredVolumePerPdv = Math.ceil(requiredTotalVolume / Math.max(form.targetPdvs, 1));
    const revenue = plannedTotalVolume * form.promoPrice;
    const contribution = Math.round(revenue * estimatedMarginPct);
    const gap = Math.round((estimatedMarginPct - baseMarginPct) * 1000) / 10;
    const roi = Math.round((contribution / Math.max(baseContribution, 1)) * 100);
    const incrementalVolume = Math.max(requiredTotalVolume - plannedTotalVolume, 0);
    return {
      volume: plannedTotalVolume,
      revenue,
      estimatedMargin: Math.round(estimatedMarginPct * 100),
      gap,
      breakEven: requiredTotalVolume,
      requiredVolumePerPdv,
      contribution,
      roi,
      incrementalVolume,
    };
  }, [form]);
  const discountPct = Math.round(((form.currentPrice - form.promoPrice) / Math.max(form.currentPrice, 1)) * 100);

  function updateNumber(key: "currentPrice" | "promoPrice" | "expectedVolume" | "targetPdvs" | "targetMargin" | "duration", value: string) {
    setForm((prev) => ({ ...prev, [key]: Number(value) || 0 }));
  }

  function registerDynamic() {
    onRegister({
      id: generateId(),
      name: form.campaignName,
      status: "En planificación",
      startDate: form.startDate,
      endDate: form.endDate,
      targetPdvs: form.targetPdvs,
      activatedPdvs: 0,
      targetVolume: simulation.volume,
      realVolume: 0,
      targetRevenue: simulation.revenue,
      realRevenue: 0,
      margin: simulation.estimatedMargin,
      deviation: 0,
      nextAction: "Validar mecánica con RGM, confirmar PDVs objetivo y cargar primera lectura semanal.",
      evolution: [
        { label: "S1", expected: 25, actual: 0 },
        { label: "S2", expected: 50, actual: 0 },
        { label: "S3", expected: 75, actual: 0 },
        { label: "S4", expected: 100, actual: 0 },
      ],
    });
    onToast("Promoción creada y agregada al seguimiento");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diseñar promoción para PDVs objetivo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-surface-elevated p-4">
          <p className="text-sm font-semibold text-text-primary">Promoción propuesta</p>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">
            Esta herramienta convierte una oportunidad comercial en una promoción medible. Los PDVs pueden venir de la recomendación de SKU o de la zona seleccionada, y podés ajustar cualquier input antes de crearla.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
            <div className="rounded-md bg-surface-soft p-3">
              <p className="text-[10px] uppercase tracking-wide text-text-muted">PDVs objetivo</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">{form.targetPdvs} locales</p>
              <p className="mt-0.5 text-[11px] text-text-muted">{draft.sourceLabel}</p>
            </div>
            <div className="rounded-md bg-surface-soft p-3">
              <p className="text-[10px] uppercase tracking-wide text-text-muted">Mecánica actual</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">{form.mechanic}</p>
              <p className="mt-0.5 text-[11px] text-text-muted">{discountPct > 0 ? `${discountPct}% de descuento vs precio actual` : "Sin descuento directo"}</p>
            </div>
            <div className="rounded-md bg-surface-soft p-3">
              <p className="text-[10px] uppercase tracking-wide text-text-muted">Hipótesis comercial</p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold text-text-primary">{form.hypothesis}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Input label="Nombre de campaña" value={form.campaignName} onChange={(event) => setForm((prev) => ({ ...prev, campaignName: event.target.value }))} />
          <Select
            label="Mecánica promocional"
            options={SELL_THROUGH_PROMOTION_MECHANICS.map((mechanic) => ({ value: mechanic, label: mechanic }))}
            value={form.mechanic}
            onChange={(event) => setForm((prev) => ({ ...prev, mechanic: event.target.value as PromotionMechanic }))}
          />
          <Input label="Duración de la promo (semanas)" type="number" value={form.duration} onChange={(event) => updateNumber("duration", event.target.value)} />
          <Input label="Inicio vigencia" type="date" value={form.startDate} onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))} />
          <Input label="Fin vigencia" type="date" value={form.endDate} onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))} />
          <Input label="Precio actual" type="number" value={form.currentPrice} onChange={(event) => updateNumber("currentPrice", event.target.value)} />
          <Input label="Precio promo" type="number" value={form.promoPrice} onChange={(event) => updateNumber("promoPrice", event.target.value)} />
          <Input label="Volumen necesario" type="number" value={form.expectedVolume} onChange={(event) => updateNumber("expectedVolume", event.target.value)} />
          <Input label="PDVs objetivo" type="number" value={form.targetPdvs} onChange={(event) => updateNumber("targetPdvs", event.target.value)} />
          <Input label="Margen objetivo (%)" type="number" value={form.targetMargin} onChange={(event) => updateNumber("targetMargin", event.target.value)} />
          <Input label="Hipótesis / objetivo" value={form.hypothesis} onChange={(event) => setForm((prev) => ({ ...prev, hypothesis: event.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiTile label="Revenue estimado" value={formatCurrency(simulation.revenue)} detail={`${formatNumber(simulation.volume)} unidades`} icon={BarChart3} tone="accent" />
          <KpiTile label="Margen estimado" value={`${simulation.estimatedMargin}%`} detail={`${simulation.gap >= 0 ? "+" : ""}${simulation.gap}pp vs objetivo`} icon={LineChart} tone={simulation.gap >= 0 ? "success" : "warning"} />
          <KpiTile label="Volumen esperado" value={formatNumber(simulation.breakEven)} detail={`${formatNumber(simulation.requiredVolumePerPdv)} unidades por PDV`} icon={Target} tone="info" />
          <KpiTile label="Masa de contribución esperada" value={formatCurrency(simulation.contribution)} detail={`${simulation.roi >= 100 ? "+" : ""}${simulation.roi - 100}% vs necesaria`} icon={TrendingUp} tone={simulation.roi >= 100 ? "success" : "warning"} />
        </div>
        <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">
            Al crear la promoción se agrega al seguimiento en planificación con los objetivos calculados desde estos inputs.
          </p>
          <Button variant="primary" size="sm" onClick={registerDynamic}>
            <ClipboardList className="h-3.5 w-3.5" />Crear promoción y seguimiento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DynamicsTracking({ dynamics }: { dynamics: SellThroughDynamic[] }) {
  const statusVariant: Record<DynamicStatus, "outline" | "info" | "warning" | "success"> = {
    Borrador: "outline",
    "En planificación": "info",
    "En ejecución": "warning",
    Finalizada: "success",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seguimiento de promociones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {dynamics.length === 0 && (
          <EmptyChart message="Todavía no hay promociones creadas para seguimiento. Creá una promoción arriba para verla en estado En planificación." />
        )}
        {dynamics.map((dynamic) => (
          <div key={dynamic.id} className="rounded-lg border border-border bg-surface-elevated p-4">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold text-text-primary">{dynamic.name}</p>
                <p className="text-xs text-text-muted">{dynamic.startDate} al {dynamic.endDate}</p>
              </div>
              <Badge variant={statusVariant[dynamic.status]}>{dynamic.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div><p className="text-[10px] uppercase text-text-muted">PDVs real / plan</p><p className="text-sm font-semibold text-text-primary">{dynamic.activatedPdvs} / {dynamic.targetPdvs}</p></div>
              <div><p className="text-[10px] uppercase text-text-muted">Volumen real / plan</p><p className="text-sm font-semibold text-text-primary">{formatNumber(dynamic.realVolume)} / {formatNumber(dynamic.targetVolume)}</p></div>
              <div><p className="text-[10px] uppercase text-text-muted">Facturación real / plan</p><p className="text-sm font-semibold text-text-primary">{formatCurrency(dynamic.realRevenue)} / {formatCurrency(dynamic.targetRevenue)}</p></div>
              <div><p className="text-[10px] uppercase text-text-muted">Margen / desvío</p><p className={cn("text-sm font-semibold", dynamic.deviation < 0 ? "text-warning" : "text-success")}>{dynamic.margin}% · {dynamic.deviation >= 0 ? "+" : ""}{dynamic.deviation}%</p></div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {dynamic.evolution.map((point) => (
                <div key={point.label}>
                  <div className="mb-1 flex items-center justify-between text-[10px] text-text-muted">
                    <span>{point.label}</span>
                    <span>{point.actual}%</span>
                  </div>
                  <div className="h-20 rounded-md bg-surface-soft p-1 flex items-end gap-1">
                    <div className="w-1/2 rounded-sm bg-primary/45" style={{ height: `${point.expected}%` }} />
                    <div className="w-1/2 rounded-sm bg-accent" style={{ height: `${point.actual}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-text-secondary"><span className="text-text-muted">Próxima acción:</span> {dynamic.nextAction}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function SellThroughPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { createProject, updateProject, createConversation } = useChatStore();
  const canAccess = canAccessModule(user, "sell-through");
  const canExport = canExportReports(user);
  const { hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource } = useDataSourceStore();
  const datasetState = getWorkspaceDatasetState({ hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource });
  const activeDataset = getActiveDataset({ hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource });

  const [tab, setTab] = useState<Tab>("summary");
  const [analysisTab, setAnalysisTab] = useState<AnalysisTab>("pdvs");
  const [period, setPeriod] = useState<SellThroughPeriod>("YTD");
  const [sku, setSku] = useState("all");
  const [channel, setChannel] = useState("all");
  const [distributor, setDistributor] = useState("all");
  const [zone, setZone] = useState("all");
  const [selectedPdv, setSelectedPdv] = useState<string | null>(null);
  const [traceMode, setTraceMode] = useState(false);
  const [drawnBounds, setDrawnBounds] = useState<GeoBounds | null>(null);
  const [mapPlaces, setMapPlaces] = useState<MapPlace[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("opportunity");
  const [witnessSku, setWitnessSku] = useState("sku-003");
  const [targetSku, setTargetSku] = useState("sku-001");
  const [activationDraft, setActivationDraft] = useState<ActivationDraft>({
    campaignName: "Activación SKU objetivo en zona seleccionada",
    targetPdvs: 12,
    expectedVolume: 36,
    hypothesis: "Convertir PDVs que ya compran el SKU testigo con una oferta acotada, cuidando margen.",
    sourceLabel: "Estimación inicial sobre PDVs no compradores o potenciales de la zona",
  });
  const [toast, setToast] = useState<string | null>(null);
  const [createdDynamics, setCreatedDynamics] = useState<SellThroughDynamic[]>([]);

  const factor = getFactor(period);
  const isRealDataset = datasetState === "real" && Boolean(activeDataset);
  const useRealSellThrough = isRealDataset && hasRealSellThroughData(activeDataset);
  const realPdvs = useMemo(
    () => (useRealSellThrough && activeDataset?.geoPdvFacts ? geoFactsToSellThroughPdvs(activeDataset.geoPdvFacts) : []),
    [activeDataset, useRealSellThrough]
  );
  const pdvUniverse = useRealSellThrough ? realPdvs : SELL_THROUGH_PDVS;
  const filterOptions = useMemo(() => {
    if (!useRealSellThrough || !activeDataset) {
      return {
        periodOptions: SELL_THROUGH_PERIODS.map((item) => ({ value: item.value, label: item.label })),
        skuOptions: SKU_OPTIONS,
        channelOptions: CHANNEL_OPTIONS,
        distributorOptions: DISTRIBUTOR_OPTIONS,
        zoneOptions: ZONE_OPTIONS,
      };
    }
    const channels = activeDataset.availableFilters?.channels?.length
      ? activeDataset.availableFilters.channels
      : [...new Set(realPdvs.map((pdv) => pdv.channel))].sort();
    const zones = activeDataset.availableFilters?.zones?.length
      ? activeDataset.availableFilters.zones
      : [...new Set(realPdvs.map((pdv) => pdv.zoneId))].sort();
    const skus = activeDataset.availableFilters?.skus ?? [];
    return {
      periodOptions: [
        { value: "YTD", label: "Acumulado año" },
        { value: "QTD", label: "Trimestre" },
        { value: "12M", label: "Móvil anual" },
        { value: "MTD", label: "Mes actual" },
      ],
      skuOptions: [{ value: "all", label: skus.length > 0 ? "Todos los SKUs" : "Sin SKU real" }, ...skus.map((item) => ({ value: item.id, label: item.name }))],
      channelOptions: [{ value: "all", label: "Todos los canales" }, ...channels.map((item) => ({ value: item, label: item }))],
      distributorOptions: [{ value: "all", label: "Sin distribuidor real" }],
      zoneOptions: [{ value: "all", label: "Todas las zonas" }, ...zones.map((item) => ({ value: item, label: item }))],
    };
  }, [activeDataset, realPdvs, useRealSellThrough]);

  const visibleDynamics = useRealSellThrough ? createdDynamics : [...createdDynamics, ...SELL_THROUGH_DYNAMICS];

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function handleMapPlaceSelect(place: MapPlace) {
    if (!drawnBounds) return;
    if (!geoBoundsContainsPoint(drawnBounds, { lat: place.lat, lng: place.lng })) return;
    let added = false;
    setMapPlaces((prev) => {
      if (prev.some((item) => item.id === place.id)) return prev;
      added = true;
      return [...prev, place];
    });
    if (added) {
      showToast(`Lugar agregado: ${place.name}`);
    }
  }

  async function fetchAndAddMapPlaces(bounds: GeoBounds) {
    const center = {
      lat: (bounds.north + bounds.south) / 2,
      lng: (bounds.east + bounds.west) / 2,
    };
    const dLat = (bounds.north - bounds.south) / 2;
    const dLng = (bounds.east - bounds.west) / 2;
    const latMeters = dLat * 111320;
    const lngMeters = dLng * 111320 * Math.cos((bounds.north + bounds.south) / 2 * (Math.PI / 180));
    const radius = Math.ceil(Math.sqrt(latMeters * latMeters + lngMeters * lngMeters));

    const categories = ["business", "transit", "government", "medical", "worship", "school"] as const;
    const typeMap: Record<string, string> = {
      business: "establishment",
      transit: "transit_station",
      government: "local_government_office",
      medical: "hospital",
      worship: "place_of_worship",
      school: "school",
    };

    let hasApiError = false;
    let lastErrorMessage = "";

    const results = await Promise.all(
      categories.map(async (cat) => {
        const proxyUrl = `/api/places/nearbysearch?location=${center.lat},${center.lng}&radius=${radius}&type=${typeMap[cat]}`;
        try {
          const res = await fetch(proxyUrl);
          const data = await res.json();
          if (data.status !== "OK") {
            hasApiError = true;
            lastErrorMessage = data.error_message ?? `Status: ${data.status}`;
            console.warn(`[fetchAndAddMapPlaces] ${cat} → ${data.status}`, data.error_message ?? "");
            return [];
          }
          return data.results as Array<{
            place_id: string;
            name: string;
            vicinity?: string;
            formatted_address?: string;
            geometry?: { location: { lat: number; lng: number } };
          }>;
        } catch (err) {
          hasApiError = true;
          lastErrorMessage = err instanceof Error ? err.message : "Error de red";
          console.error(`[fetchAndAddMapPlaces] ${cat} fetch error`, err);
          return [];
        }
      })
    );

    if (hasApiError) {
      showToast(`Error al buscar lugares: ${lastErrorMessage}`);
      return;
    }

    const seen = new Set<string>();
    const places: MapPlace[] = [];
    for (const entry of results.flat()) {
      const id = entry.place_id;
      const loc = entry.geometry?.location;
      if (!id || !loc) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      if (!geoBoundsContainsPoint(bounds, { lat: loc.lat, lng: loc.lng })) continue;
      places.push({
        id,
        name: entry.name ?? "Lugar sin nombre",
        address: entry.vicinity ?? entry.formatted_address ?? "Sin direccion",
        lat: loc.lat,
        lng: loc.lng,
      });
    }

    if (places.length === 0) {
      showToast("No se encontraron lugares en esta zona");
      return;
    }

    let added = 0;
    setMapPlaces((prev) => {
      const existing = new Set(prev.map((p) => p.id));
      const next = [...prev];
      for (const p of places) {
        if (existing.has(p.id)) continue;
        existing.add(p.id);
        next.push(p);
        added++;
      }
      return next;
    });
    if (added > 0) showToast(`${added} lugares agregados automáticamente`);
  }

  const manualBounds = drawnBounds;
  const zoneBounds = !useRealSellThrough && zone !== "all" ? getZoneBounds(zone) : null;
  const selectionLabel = manualBounds
    ? "Zona trazada manual"
    : zone === "all"
      ? "Sin zona seleccionada"
      : useRealSellThrough
        ? zone
        : SELL_THROUGH_ZONES.find((item) => item.id === zone)?.name ?? "Zona seleccionada";

  const filteredPdvs = useMemo(() => {
    return pdvUniverse.filter((pdv) => {
      if (manualBounds && !isPdvInsideGeoBounds(pdv, manualBounds)) return false;
      if (!manualBounds && zoneBounds && !isPdvInsideBounds(pdv, zoneBounds)) return false;
      if (!manualBounds && !zoneBounds && zone !== "all" && pdv.zoneId !== zone) return false;
      if (channel !== "all" && pdv.channel !== channel) return false;
      if (distributor !== "all" && pdv.distributorId !== distributor) return false;
      if (!useRealSellThrough && sku !== "all" && !pdv.skusBought.includes(sku)) return false;
      return true;
    });
  }, [channel, distributor, manualBounds, pdvUniverse, sku, useRealSellThrough, zone, zoneBounds]);

  const universeCount = filteredPdvs.length + mapPlaces.length;
  const universeDetail = mapPlaces.length > 0
    ? `PDVs en zona + ${mapPlaces.length} lugares`
    : "PDVs en zona/vector";

  const selectedPdvs = useRealSellThrough ? filteredPdvs : filteredPdvs.length > 0 ? filteredPdvs : pdvUniverse;

  const realSummary = useMemo(() => {
    if (!useRealSellThrough || !activeDataset) return null;
    const filters = { sku, channel, distributor, zone };
    return {
      kpis: buildRealSellThroughKpis(activeDataset, period, selectedPdvs),
      revenue: buildRevenueEvolution(activeDataset, period, filters),
      volume: buildVolumeEvolution(activeDataset, period, filters),
      sellInOutRows: buildSellInOutPassthrough(activeDataset),
      skuRows: buildSkuRanking(activeDataset, period, channel, sku),
    };
  }, [activeDataset, channel, distributor, period, selectedPdvs, sku, useRealSellThrough, zone]);

  const realActivationDraft = useMemo<ActivationDraft>(() => {
    const buyers = selectedPdvs.filter((pdv) => pdv.status === "buyer");
    const nonBuyers = selectedPdvs.filter((pdv) => pdv.status !== "buyer");
    const avgVolume = buyers.reduce((acc, pdv) => acc + pdv.volume, 0) / Math.max(buyers.length, 1);
    const avgTicket = buyers
      .map((pdv) => pdv.averageTicket)
      .filter((value): value is number => value !== undefined && value > 0)
      .reduce((acc, value, _index, values) => acc + value / Math.max(values.length, 1), 0);
    const targetPdvs = Math.max(nonBuyers.length, 1);
    return {
      campaignName: `Activación comercial · ${selectionLabel}`,
      targetPdvs,
      expectedVolume: Math.max(1, Math.round(avgVolume || 1)),
      currentPrice: avgTicket > 0 ? Math.round(avgTicket) : undefined,
      promoPrice: avgTicket > 0 ? Math.round(avgTicket * 0.9) : undefined,
      targetMargin: 34,
      hypothesis: `Convertir ${targetPdvs} PDVs no compradores de ${selectionLabel} sosteniendo masa de contribución.`,
      sourceLabel: `${selectedPdvs.length} PDVs filtrados · ${buyers.length} compradores · ${nonBuyers.length} oportunidades`,
    };
  }, [selectedPdvs, selectionLabel]);

  const sortedPdvs = useMemo(() => {
    return [...filteredPdvs].sort((a, b) => {
      if (sortKey === "status") return STATUS_LABELS[a.status].localeCompare(STATUS_LABELS[b.status]);
      if (sortKey === "channel") return a.channel.localeCompare(b.channel);
      if (sortKey === "growth") return b.mixReal - a.mixReal;
      return b[sortKey] - a[sortKey];
    });
  }, [filteredPdvs, sortKey]);

  const pdvTableRows = useMemo(() => {
    if (mapPlaces.length === 0) return sortedPdvs;
    return [...mapPlaces, ...sortedPdvs];
  }, [mapPlaces, sortedPdvs]);

  function createProjectFromSelection() {
    const selected = filteredPdvs.length > 0 ? filteredPdvs : pdvUniverse;
    const buyers = selected.filter((pdv) => pdv.status === "buyer").length;
    const nonBuyers = selected.filter((pdv) => pdv.status !== "buyer").length;
    const revenue = selected.reduce((acc, pdv) => acc + pdv.revenue, 0);
    const volume = selected.reduce((acc, pdv) => acc + pdv.volume, 0);
    const opportunity = selected.reduce((acc, pdv) => acc + pdv.opportunity, 0);
    const coverage = Math.round((buyers / Math.max(selected.length, 1)) * 100);
    const mixReal = Math.round(selected.reduce((acc, pdv) => acc + pdv.mixReal, 0) / Math.max(selected.length, 1));
    const mixTarget = Math.round(selected.reduce((acc, pdv) => acc + pdv.mixTarget, 0) / Math.max(selected.length, 1));
    const project = createProject(
      `Sell-Through · ${selectionLabel}`,
      `Proyecto creado desde Sell-Through con ${selected.length} PDVs seleccionados, ${buyers} compradores y ${nonBuyers} oportunidades de conversión.`,
      "sell-through",
      `Mejorar cobertura, mix y clientes compradores en ${selectionLabel}.`,
      "high"
    );
    const goals: ProjectGoal[] = [
      {
        id: `goal-${generateId()}`,
        name: "Subir cobertura de compradores",
        description: `Convertir ${Math.min(nonBuyers, 8)} PDVs no compradores o potenciales de la zona seleccionada.`,
        kpi: "Cobertura PDVs compradores",
        currentValue: `${coverage}%`,
        targetValue: `${Math.min(coverage + 18, 92)}%`,
        unit: "%",
        progress: coverage,
        dueDate: "2026-07-31",
        priority: "high",
        status: "in-progress",
      },
      {
        id: `goal-${generateId()}`,
        name: "Cerrar gap de mix objetivo",
        description: "Aumentar presencia del SKU objetivo en PDVs que ya compran el SKU testigo.",
        kpi: "Mix real vs objetivo",
        currentValue: `${mixReal}%`,
        targetValue: `${mixTarget}%`,
        unit: "%",
        progress: Math.min(Math.round((mixReal / Math.max(mixTarget, 1)) * 100), 100),
        dueDate: "2026-08-15",
        priority: "medium",
        status: "pending",
      },
      {
        id: `goal-${generateId()}`,
        name: "Capturar oportunidad incremental",
        description: `Activar plan comercial sobre una oportunidad estimada de ${formatCurrency(opportunity)}.`,
        kpi: "Revenue incremental",
        currentValue: formatCurrency(revenue),
        targetValue: formatCurrency(revenue + opportunity),
        unit: "USD",
        progress: 0,
        dueDate: "2026-08-31",
        priority: "high",
        status: "pending",
      },
    ];

    updateProject(project.id, {
      linkedAreas: ["Sell-Through", "Ventas", "Trade Marketing", "RGM"],
      progress: 18,
      tags: ["sell-through", "pdvs", useRealSellThrough ? "dataset-real" : "demo-cpg"],
      kpis: [
        { label: "PDVs seleccionados", value: String(selected.length), unit: "PDVs" },
        { label: "Compradores", value: String(buyers), unit: "PDVs" },
        { label: "Cobertura", value: `${coverage}`, unit: "%" },
        { label: "Facturación", value: formatCurrency(revenue) },
        { label: "Volumen", value: formatNumber(volume), unit: "cajas" },
        { label: "Oportunidad", value: formatCurrency(opportunity) },
      ],
      goals,
      insights: [
        {
          id: `ins-${generateId()}`,
          title: `Brecha de cobertura en ${selectionLabel}`,
          description: `${nonBuyers} PDVs del universo seleccionado no están comprando o tienen compra potencial incompleta.`,
          severity: nonBuyers >= 4 ? "high" : "medium",
          impact: "high",
          area: "Sell-Through",
          recommendation: "Priorizar PDVs con compra del SKU testigo, alto potencial y baja mezcla real.",
          createdAt: new Date().toISOString(),
        },
      ],
      nextSteps: [
        { id: `step-${generateId()}`, label: "Validar zona y PDVs objetivo con KAM", done: false, owner: "Mauro Celani", priority: "high", status: "pending", area: "Sell-Through" },
        { id: `step-${generateId()}`, label: "Definir mecánica promocional con RGM", done: false, owner: "Diego Pereira", priority: "medium", status: "pending", area: "RGM" },
        { id: `step-${generateId()}`, label: "Alinear ejecución con distribuidores", done: false, owner: "Lucía Romero", priority: "high", status: "pending", area: "Ventas" },
      ],
      brief: {
        problem: `La zona seleccionada tiene ${selected.length} PDVs, pero sólo ${buyers} compran actualmente.`,
        hypothesis: "Una activación focalizada sobre PDVs con compra del SKU testigo puede mejorar cobertura sin destruir margen.",
        strategy: "Usar el comparador de SKU testigo vs objetivo, constructor de promo y seguimiento semanal.",
        expectedOutcome: `Capturar hasta ${formatCurrency(opportunity)} de revenue incremental estimado.`,
      },
    });
    createConversation(`Consulta Sell-Through · ${selectionLabel}`, project.id, "sell-through");
    showToast("Proyecto creado con KPIs y objetivos de Sell-Through");
    router.push(`/workspace/projects/${project.id}?tab=chat`);
  }

  if (!canAccess) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-surface-soft">
          <Map className="h-8 w-8 text-text-muted" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-text-primary">No tenés acceso a Sell-Through</h2>
        <p className="max-w-sm text-text-muted">Tu rol actual no incluye este módulo. Pedile a un Owner o Admin que habilite Sell-Through.</p>
      </div>
    );
  }

  if (datasetState === "empty") {
    return <ModuleDatasetEmptyState moduleId="sell-through" />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <ModuleHeader moduleId="sell-through" />

      <ModuleDataSourceBanner datasetState={datasetState} dataset={activeDataset} />

      <div className="flex flex-wrap gap-2 border-b border-border">
        {[
          { id: "summary" as const, label: "Resumen KPI", icon: BarChart3 },
          { id: "map" as const, label: "Mapa & PDVs", icon: MapPin },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
              tab === item.id ? "border-primary text-primary-soft" : "border-transparent text-text-muted hover:text-text-primary"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      <FilterBar
        period={period}
        sku={sku}
        channel={channel}
        distributor={distributor}
        zone={zone}
        onPeriod={setPeriod}
        onSku={setSku}
        onChannel={setChannel}
        onDistributor={setDistributor}
        onZone={(nextZone) => {
          setZone(nextZone);
          setDrawnBounds(null);
          setTraceMode(false);
          setMapPlaces([]);
        }}
        periodOptions={filterOptions.periodOptions}
        skuOptions={filterOptions.skuOptions}
        channelOptions={filterOptions.channelOptions}
        distributorOptions={filterOptions.distributorOptions}
        zoneOptions={filterOptions.zoneOptions}
      />

      {tab === "summary" ? (
        useRealSellThrough && realSummary ? (
          <RealSummaryTab
            kpis={realSummary.kpis}
            revenue={realSummary.revenue}
            volume={realSummary.volume}
            sellInOutRows={realSummary.sellInOutRows}
            skuRows={realSummary.skuRows}
          />
        ) : (
          <SummaryTab period={period} factor={factor} pdvs={filteredPdvs.length > 0 ? filteredPdvs : SELL_THROUGH_PDVS} />
        )
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">Mapa visual de PDVs</h2>
                  <p className="text-xs text-text-muted">Arrastrá para moverte, usá zoom y trazá un área para agrupar locales.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant={traceMode ? "outline" : "secondary"} onClick={() => setTraceMode((value) => !value)}>
                    <MousePointer2 className="h-3.5 w-3.5" />{traceMode ? "Trazando..." : "Trazar zona"}
                  </Button>
                  {drawnBounds && (
                    <Button size="sm" variant="ghost" onClick={() => { setDrawnBounds(null); setTraceMode(false); setMapPlaces([]); }}>
                      <X className="h-3.5 w-3.5" />Limpiar trazo
                    </Button>
                  )}
                </div>
              </div>
              <GoogleMapsPDVMap
                pdvs={useRealSellThrough ? filteredPdvs : pdvUniverse}
                selectedPdv={selectedPdv}
                selectionBounds={manualBounds}
                traceMode={traceMode}
                onSelectPdv={setSelectedPdv}
                onMapPlaceSelect={handleMapPlaceSelect}
                onSelectionComplete={(bounds) => {
                  setMapPlaces([]);
                  setDrawnBounds(bounds);
                  setZone("all");
                  setTraceMode(false);
                  const selectedCount = pdvUniverse.filter((pdv) => isPdvInsideGeoBounds(pdv, bounds)).length;
                  showToast(`Zona trazada: ${selectedCount} PDVs seleccionados`);
                  void fetchAndAddMapPlaces(bounds);
                }}
              />
            </div>
            <ZoneKpiPanel
              pdvs={useRealSellThrough ? filteredPdvs : filteredPdvs.length > 0 ? filteredPdvs : pdvUniverse}
              places={mapPlaces}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Universo real vs universo atendido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <KpiTile label="Universo real" value={formatNumber(universeCount)} detail={universeDetail} icon={Store} tone="primary" />
                <KpiTile label="Atendidos" value={formatNumber(filteredPdvs.filter((pdv) => pdv.served).length)} detail="Con distribuidor asignado" icon={Route} tone="info" />
                <KpiTile label="Compradores" value={formatNumber(filteredPdvs.filter((pdv) => pdv.status === "buyer").length)} detail="Con compra reciente" icon={CheckCircle2} tone="success" />
                <KpiTile label="No atendidos" value={formatNumber(filteredPdvs.filter((pdv) => pdv.status === "non-buyer").length)} detail="Sin distribuidor asignado" icon={TrendingDown} tone="danger" />
                <KpiTile label="Potenciales" value={formatNumber(filteredPdvs.filter((pdv) => pdv.status === "potential").length)} detail="Con oportunidad activa" icon={Sparkles} tone="warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-text-primary">Análisis accionable de la selección</h2>
                <p className="text-xs text-text-muted">
                  Los KPIs de esta zona se pueden llevar a proyecto como objetivos medibles.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={createProjectFromSelection}>
                  <Target className="h-3.5 w-3.5" />Crear proyecto y objetivos
                </Button>
                <Button variant="primary" size="sm" onClick={() => router.push(ROUTES.WORKSPACE)}>
                  <Zap className="h-3.5 w-3.5" />Preguntarle a Nexus
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
              {[
                { id: "pdvs" as const, label: "PDVs y ranking", icon: Store },
                { id: "products" as const, label: "Productos y mix", icon: Boxes },
                { id: "opportunity" as const, label: "Oportunidad SKU", icon: Target },
                { id: "activation" as const, label: "Activación y seguimiento", icon: ClipboardList },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAnalysisTab(item.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors",
                    analysisTab === item.id
                      ? "border-primary/40 bg-primary/10 text-primary-soft"
                      : "border-border bg-surface-elevated text-text-secondary hover:border-primary/30 hover:text-text-primary"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              ))}
            </div>
          </Card>

          {analysisTab === "pdvs" && (
            <div className="space-y-4">
              {canExport && (
                <PdvTable
                  rows={pdvTableRows}
                  sortKey={sortKey}
                  onSort={setSortKey}
                  onExport={(data) => {
                    void exportPdvsToExcel(data, `PDVs_${period}_${new Date().toISOString().slice(0, 10)}.xlsx`);
                  }}
                />
              )}
              <Card>
                <CardHeader>
                  <CardTitle>Ranking de clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollPanel maxHeight={360}>
                  <div className="space-y-3">
                    {sortedPdvs.map((pdv, index) => (
                      <div key={pdv.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface-elevated p-3">
                        <span className="w-6 text-xs font-mono text-text-muted">{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-text-primary">{pdv.name}</p>
                          <p className="text-xs text-text-muted">
                            {pdv.channel} · {getDistributorName(pdv.distributorId)}
                            {!useRealSellThrough && ` · Mix ${pdv.mixReal}%`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-text-primary">{sortKey === "volume" ? formatNumber(pdv.volume) : formatCurrency(pdv.revenue)}</p>
                          <p className="text-xs text-accent">{useRealSellThrough ? `${formatNumber(pdv.opportunity)} u. gap` : `${formatCurrency(pdv.opportunity)} gap`}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  </ScrollPanel>
                </CardContent>
              </Card>
            </div>
          )}

          {analysisTab === "products" && (
            useRealSellThrough ? (
              <RealProductsAndMix skuRows={realSummary?.skuRows ?? []} />
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
                <ProductBuyersTable skus={SELL_THROUGH_SKUS} factor={factor} />
                <MixComparison />
              </div>
            )
          )}

          {analysisTab === "opportunity" && (
            !useRealSellThrough ? (
              <SkuComparator
                witnessSkuId={witnessSku}
                targetSkuId={targetSku}
                onWitness={setWitnessSku}
                onTarget={setTargetSku}
                pdvs={filteredPdvs.length > 0 ? filteredPdvs : SELL_THROUGH_PDVS}
                onUseRecommended={(draft) => {
                  setActivationDraft(draft);
                  setAnalysisTab("activation");
                  showToast("PDVs recomendados enviados a activación");
                }}
              />
            ) : (
              <EmptyChart message="La oportunidad SKU requiere datos por PDV/SKU. El archivo PDV real no trae SKU comprado; no se usan recomendaciones demo." />
            )
          )}

          {analysisTab === "activation" && (
            <div className="space-y-4">
              <PromotionBuilder
                key={useRealSellThrough ? `${selectionLabel}-${filteredPdvs.length}` : activationDraft.sourceLabel}
                targetPdvCount={filteredPdvs.filter((pdv) => pdv.status !== "buyer").length}
                draft={useRealSellThrough ? realActivationDraft : activationDraft}
                onToast={showToast}
                onRegister={(dynamic) => setCreatedDynamics((prev) => [dynamic, ...prev])}
              />
              <DynamicsTracking dynamics={visibleDynamics} />
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed left-1/2 top-4 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 py-2 text-xs text-text-secondary shadow-elevated"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            {toast}
            <button onClick={() => setToast(null)} className="text-text-muted hover:text-text-primary">
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

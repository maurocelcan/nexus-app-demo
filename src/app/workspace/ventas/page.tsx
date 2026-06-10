"use client";
import { useState, useMemo } from "react";
import {
  TrendingUp, Upload, Sparkles, ArrowRight, AlertTriangle,
  Lightbulb, CheckCircle, Database, Zap, FileDown, Presentation,
  ClipboardList, X, Plus, Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { SellInSellOutChart } from "@/components/charts/sell-in-sell-out-chart";
import { DistributionChart } from "@/components/charts/distribution-chart";
import { RevenueWaterfallChart } from "@/components/charts/revenue-waterfall-chart";
import { ChannelBarChart } from "@/components/charts/channel-bar-chart";
import { SkuRankingChart } from "@/components/charts/sku-ranking-chart";
import type { SkuRankingRow } from "@/components/charts/sku-ranking-chart";
import { SkuByChannelChart } from "@/components/charts/sku-by-channel-chart";
import type { SkuByChannelData } from "@/components/charts/sku-by-channel-chart";
import { ModuleDataSourceBanner } from "@/components/workspace/module-data-source-banner";
import { ModuleEmptyState, ModuleHeader } from "@/components/workspace/module-chrome";
import { SKUS, YTD_2026 } from "@/data/mock-sales";
import { cn, sleep, generateId, formatCount, formatCurrency, formatPercentage, formatRatio, formatVolume } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useDataSourceStore, getActiveDataset, getAvailableDatasets, getWorkspaceDatasetState, resolveProductDisplayName, type DatasetSource } from "@/stores/data-source-store";
import type { NormalizedSellInRow, NormalizedSellOutRow, NormalizedProduct, NormalizedClient, ProcessedDataset, SalesFilters, SalesKpis } from "@/types/dataset";
import type { SalesKpi } from "@/types/analytics";
import { activateFullDemo } from "@/lib/demo";
import { calculateSalesKpis } from "@/lib/calculate-sales-kpis";
import { datasetHasKpiFacts, kpisFromKpiFacts, resolveKpiFact, salesKpisFromKpiFacts } from "@/lib/kpi-facts";
import type { CommercialKpiFact, KpiFactPeriod } from "@/types/dataset";
import { useActionPlanStore } from "@/stores/action-plan-store";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/lib/routes";
import type { SalesFilterPeriod } from "@/types/sales";
import type { ActionPlanPriority } from "@/types/analytics";
import { canAccessModule, canCreateChat, canEditActionPlan, canExportReports } from "@/lib/permissions";
import { useChatStore } from "@/stores/chat-store";

const PERIODS: { value: SalesFilterPeriod; label: string; tooltip?: string }[] = [
  { value: "MTD", label: "MTD", tooltip: "MTD: acumulado del mes actual" },
  { value: "QTD", label: "QTD", tooltip: "QTD: acumulado del trimestre actual" },
  { value: "YTD", label: "YTD", tooltip: "YTD: acumulado del año actual" },
  { value: "6M", label: "Últimos 6M" },
  { value: "12M", label: "Últimos 12M" },
];

const PRODUCTS = [
  { value: "all", label: "Todos los SKUs" },
  { value: "sku-001", label: "Espumante Brut" },
  { value: "sku-002", label: "Aperitivo de Hierbas" },
  { value: "sku-003", label: "Gin Botánico Premium" },
  { value: "sku-004", label: "Cerveza Artesanal IPA" },
  { value: "sku-005", label: "Vino Malbec Reserva" },
];

const CHANNELS = [
  { value: "all", label: "Todos los canales" },
  { value: "supermercados", label: "Supermercados" },
  { value: "mayoristas", label: "Mayoristas" },
  { value: "cadenas", label: "Cadenas Especializadas" },
  { value: "gastro", label: "Gastronomía" },
  { value: "ecommerce", label: "E-commerce" },
];

const INSIGHTS = [
  {
    type: "alert" as const,
    title: "Espumante con brecha de passthrough en Supermercados",
    description: "Espumante Brut muestra passthrough del 53% vs objetivo del 72%. Carrefour y Coto concentran el 68% del problema.",
    area: "Ventas",
  },
  {
    type: "opportunity" as const,
    title: "Cerveza IPA con momentum positivo",
    description: "Mejor passthrough del portafolio (85%) y distribución del 88%. Oportunidad de incrementar presencia en cadenas.",
    area: "Ventas",
  },
  {
    type: "warning" as const,
    title: "Quiebre de stock — Gin Botánico",
    description: "Cobertura de 3.2 semanas en Cadenas Especializadas vs benchmark de 6 semanas. Riesgo de OOS inminente.",
    area: "Supply",
  },
];

const PRIORITY_OPTIONS = [
  { value: "high", label: "Alta" },
  { value: "medium", label: "Media" },
  { value: "low", label: "Baja" },
];

function optionLabel(value: string): string {
  return value || "Sin dato";
}

// ─── Create Plan Modal ─────────────────────────────────────────────────────────

function CreatePlanModal({ onClose }: { onClose: () => void }) {
  const { createPlan } = useActionPlanStore();
  const [form, setForm] = useState({
    name: "Plan de recuperación Supermercados",
    objective: "Recuperar 14pp de passthrough en Carrefour y Coto",
    priority: "high" as ActionPlanPriority,
    targetDate: "2026-06-30",
  });
  const [items, setItems] = useState([
    { id: "i1", label: "Pausar despacho Carrefour 3 semanas", done: false },
    { id: "i2", label: "Activar exhibición especial + 15% price off", done: false },
    { id: "i3", label: "Redirigir 40% trade spend a Jumbo/Disco", done: false },
  ]);
  const [newItem, setNewItem] = useState("");
  const [done, setDone] = useState(false);

  function addItem() {
    const t = newItem.trim();
    if (!t) return;
    setItems((prev) => [...prev, { id: generateId(), label: t, done: false }]);
    setNewItem("");
  }

  function handleCreate() {
    createPlan({
      name: form.name,
      objective: form.objective,
      insightOrigin: "Brecha de passthrough en Supermercados",
      owner: "Mauro Celani",
      priority: form.priority,
      targetDate: form.targetDate,
      status: "active",
      items: items.map((it) => ({ id: it.id, label: it.label, done: it.done, priority: form.priority })),
      area: "Ventas",
    });
    setDone(true);
    setTimeout(onClose, 1600);
  }

  if (done) {
    return (
      <Modal open onClose={onClose} title="Crear plan de acción" size="md">
        <div className="text-center py-8">
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <CheckCircle className="h-14 w-14 text-success mx-auto mb-4" />
          </motion.div>
          <p className="font-semibold text-text-primary">Plan creado correctamente</p>
          <p className="text-sm text-text-muted mt-1">{items.length} acciones listas para ejecutar</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open onClose={onClose} title="Crear plan de acción" size="md">
      <div className="space-y-4">
        <Input
          label="Nombre del plan"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <Input
          label="Objetivo"
          value={form.objective}
          onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-3">
          <Dropdown
            label="Prioridad"
            options={PRIORITY_OPTIONS}
            value={form.priority}
            onChange={(v) => setForm((f) => ({ ...f, priority: v as ActionPlanPriority }))}
          />
          <Input
            label="Fecha objetivo"
            type="date"
            value={form.targetDate}
            onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
          />
        </div>

        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">Acciones ({items.length})</p>
          <div className="space-y-1.5 mb-2">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-2 px-3 py-2 bg-surface-soft rounded-md">
                <span className="flex-1 text-xs text-text-secondary">{it.label}</span>
                <button onClick={() => setItems((prev) => prev.filter((i) => i.id !== it.id))} className="text-text-muted hover:text-danger transition-colors">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder="Agregar acción..."
              className="flex-1 text-xs bg-surface border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted outline-none focus:border-primary"
            />
            <button onClick={addItem} className="p-2 rounded-lg border border-border hover:border-primary/40 text-text-muted hover:text-primary transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" disabled={!form.name.trim()} onClick={handleCreate}>
            <ClipboardList className="h-3.5 w-3.5" />
            Crear plan
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── T2T Presentation Modal ────────────────────────────────────────────────────

function T2TModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"form" | "generating" | "done">("form");
  const [account, setAccount] = useState("Carrefour");
  const [slides] = useState(["Portada ejecutiva", "KPIs clave YTD 2026", "Análisis T2T", "Sell-in vs Sell-out", "Insights y brechas", "Recomendaciones", "Plan de acción"]);

  async function handleGenerate() {
    setStep("generating");
    await sleep(2200);
    setStep("done");
  }

  return (
    <Modal open onClose={onClose} title="Generar presentación T2T" size="md">
      {step === "form" && (
        <div className="space-y-4">
          <Input label="Cuenta / cliente" value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Ej: Carrefour" />
          <div>
            <p className="text-xs font-medium text-text-secondary mb-2">Slides incluidas ({slides.length})</p>
            <div className="space-y-1">
              {slides.map((s, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-surface-soft rounded-md">
                  <span className="text-[10px] text-text-muted w-5 tabular-nums">{i + 1}.</span>
                  <span className="flex-1 text-xs text-text-secondary">{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" onClick={handleGenerate}>
              <Presentation className="h-3.5 w-3.5" />
              Generar presentación
            </Button>
          </div>
        </div>
      )}

      {step === "generating" && (
        <div className="py-10 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Presentation className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-text-primary font-medium">Generando presentación T2T para {account}…</p>
          <div className="text-xs text-text-muted space-y-1">
            {slides.slice(0, 4).map((s) => (
              <p key={s} className="flex items-center justify-center gap-1.5">
                <CheckCircle className="h-3 w-3 text-success" /> {s}
              </p>
            ))}
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="text-center py-8">
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <CheckCircle className="h-14 w-14 text-success mx-auto mb-4" />
          </motion.div>
          <p className="font-semibold text-text-primary">{slides.length} slides generadas para {account}</p>
          <p className="text-sm text-text-muted mt-1 mb-5">La presentación está lista para revisar y exportar.</p>
          <div className="flex gap-2 justify-center">
            <Button variant="secondary" size="sm" onClick={() => {
              const content = `NEXUS — Presentación T2T: ${account}\nGenerada: ${new Date().toLocaleString("es-AR")}\n\nSlides:\n${slides.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n[Datos de KPIs YTD 2026 incluidos]\n`;
              const blob = new Blob([content], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `t2t_${account.toLowerCase().replace(/\s+/g, "_")}_ytd2026.txt`;
              a.click();
              URL.revokeObjectURL(url);
              onClose();
            }}>
              <FileDown className="h-3.5 w-3.5" />
              Descargar
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>Cerrar</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Export Modal ──────────────────────────────────────────────────────────────

function ExportModal({ onClose, period, product, channel }: { onClose: () => void; period: string; product: string; channel: string }) {
  const json = JSON.stringify({
    exportedAt: new Date().toISOString(),
    filters: { period, product, channel },
    summary: {
      sellIn: YTD_2026.sellIn,
      sellOut: YTD_2026.sellOut,
      netRevenue: YTD_2026.netRevenue,
      ebitda: YTD_2026.ebitda,
      passthrough: `${YTD_2026.passthrough}%`,
      priceIndex: YTD_2026.priceIndex,
    },
    skus: SKUS.map((s) => ({
      id: s.id,
      name: s.name,
      sellIn: s.sellIn,
      sellOut: s.sellOut,
      passthrough: s.passthrough,
      distributionNum: s.distributionNum,
      vsbudget: s.vsbudget,
    })),
  }, null, 2);

  return (
    <Modal open onClose={onClose} title="Exportar análisis" size="lg">
      <div className="space-y-3">
        <p className="text-xs text-text-muted">Vista previa del JSON exportado</p>
        <pre className="bg-surface rounded-lg border border-border p-4 text-[11px] text-text-secondary font-mono overflow-auto max-h-72 leading-relaxed">
          {json}
        </pre>
        <div className="flex justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => {
            const skuRows = SKUS.map((s) => {
              const color = s.vsbudget >= 0 ? "green" : "red";
              const sign = s.vsbudget >= 0 ? "+" : "";
              return `<tr><td>${s.name}</td><td>${s.sellIn.toLocaleString()}</td><td>${s.sellOut.toLocaleString()}</td><td>${s.passthrough}</td><td>${s.distributionNum.toFixed(1)}%</td><td style="color:${color}">${sign}${s.vsbudget}%</td></tr>`;
            }).join("");
            const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Nexus — Ventas ${period}</title><style>body{font-family:system-ui,sans-serif;padding:32px;color:#111;max-width:800px;margin:auto}h1{font-size:20px;margin-bottom:4px}p{color:#555;font-size:13px}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}th{background:#f4f4f4;padding:8px 12px;text-align:left;border-bottom:2px solid #ddd}td{padding:8px 12px;border-bottom:1px solid #eee}@media print{body{padding:0}}</style></head><body><h1>Nexus — Análisis de Ventas</h1><p>Período: ${period} · Producto: ${product} · Canal: ${channel}</p><p>Exportado: ${new Date().toLocaleString("es-AR")}</p><table><thead><tr><th>SKU</th><th>Sell-in</th><th>Sell-out</th><th>Passthrough</th><th>Distribución</th><th>vs Budget</th></tr></thead><tbody>${skuRows}</tbody></table></body></html>`;
            const w = window.open("", "_blank");
            if (w) { w.document.write(html); w.document.close(); w.focus(); w.print(); }
          }}>
            <FileDown className="h-3.5 w-3.5" />
            Exportar PDF
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" onClick={() => {
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `nexus_ventas_${period.toLowerCase()}.json`;
              a.click();
              URL.revokeObjectURL(url);
              onClose();
            }}>
              <FileDown className="h-3.5 w-3.5" />
              Descargar JSON
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── Real KPI builder ──────────────────────────────────────────────────────────

function kpisFromDataset(sk: SalesKpis): SalesKpi[] {
  const pt = sk.passthrough ?? (sk.sellOutYtd && sk.sellInYtd ? sk.sellOutYtd / sk.sellInYtd : undefined);
  const ptPct = pt !== undefined && Math.abs(pt) <= 1 ? pt * 100 : pt;
  const ptVarPp = sk.passthroughVarPct !== undefined ? Math.round(sk.passthroughVarPct * 10) / 10 : null;

  const kpis: SalesKpi[] = [
    {
      label: "Sell-in",
      value: sk.sellInYtd !== undefined ? formatVolume(sk.sellInYtd) : "N/A",
      unit: sk.sellInYtd !== undefined ? "cajas" : undefined,
      change: sk.sellInVarPct ?? 0,
      changeType: sk.sellInYtd === undefined || sk.sellInVarPct === undefined ? "neutral" : sk.sellInVarPct >= 0 ? "positive" : "negative",
      description: "",
      tooltip: "Fuente: Ventas BIS · Volumen vendido a distribuidores",
    },
    {
      label: "Sell-out",
      value: sk.sellOutYtd !== undefined ? formatVolume(sk.sellOutYtd) : "N/A",
      unit: sk.sellOutYtd !== undefined ? "cajas" : undefined,
      change: sk.sellOutVarPct ?? 0,
      changeType: sk.sellOutYtd === undefined || sk.sellOutVarPct === undefined ? "neutral" : sk.sellOutVarPct >= 0 ? "positive" : "negative",
      description: "",
      tooltip: "Fuente: Ventas BIS · Volumen vendido al canal final",
    },
    {
      label: "Passthrough",
      value: ptPct !== undefined ? formatPercentage(ptPct) : "N/A",
      change: ptVarPp ?? 0,
      changeType: ptVarPp === null ? "neutral" : ptVarPp >= 0 ? "positive" : "negative",
      description: "",
      tooltip: "Calculado como Sell-out / Sell-in · Fuente: Ventas BIS",
    },
  ];

  if (sk.netRevenueYtd !== undefined) {
    kpis.push({
      label: "Net Revenue",
      value: formatCurrency(sk.netRevenueYtd),
      change: sk.netRevenueVarPct ?? 0,
      changeType: sk.netRevenueVarPct === undefined ? "neutral" : sk.netRevenueVarPct >= 0 ? "positive" : "negative",
      description: "",
      tooltip: "Fuente: Ventas BIS · Facturación neta acumulada",
    });
  }

  if (sk.ebitdaYtd !== undefined) {
    kpis.push({
      label: "EBITDA",
      value: formatCurrency(sk.ebitdaYtd),
      change: sk.ebitdaVarPct ?? 0,
      changeType: sk.ebitdaVarPct === undefined ? "neutral" : sk.ebitdaVarPct >= 0 ? "positive" : "negative",
      description: "",
      tooltip: "Fuente: Ventas BIS · Resultado operativo acumulado",
    });
  }

  if (sk.activeDirectClients !== undefined) {
    const isBuyerCustomerMetric = sk.buyerCustomers !== undefined && sk.activeDirectClients === sk.buyerCustomers;
    kpis.push({
      label: isBuyerCustomerMetric ? "Clientes compradores" : "Clientes activos",
      value: formatCount(sk.activeDirectClients),
      change: sk.buyerCustomersVarPct ?? 0,
      changeType: sk.buyerCustomersVarPct === undefined ? "neutral" : sk.buyerCustomersVarPct >= 0 ? "positive" : "negative",
      description: "",
      tooltip: isBuyerCustomerMetric
        ? "Fuente: Ventas BIS · Clientes con al menos una compra en el período"
        : "Fuente: Ventas BIS · Distribuidores activos en el período",
    });
  }

  if (sk.buyerCustomers !== undefined && sk.activeDirectClients === undefined) {
    kpis.push({
      label: "Clientes compradores",
      value: formatCount(sk.buyerCustomers),
      change: sk.buyerCustomersVarPct ?? 0,
      changeType: sk.buyerCustomersVarPct === undefined ? "neutral" : sk.buyerCustomersVarPct >= 0 ? "positive" : "negative",
      description: "",
      tooltip: "Fuente: Ventas BIS · Clientes con al menos una compra en el período",
    });
  }

  if (sk.activePdvs !== undefined) {
    kpis.push({
      label: "PDVs activos",
      value: formatCount(sk.activePdvs),
      change: 0,
      changeType: "neutral",
      description: "",
      tooltip: "Fuente: Ventas BIS · Puntos de venta activos en el período",
    });
  }

  if (sk.priceIndexAvg !== undefined) {
    kpis.push({
      label: "Price Index",
      value: formatRatio(sk.priceIndexAvg),
      change: sk.priceIndexVarPct ?? 0,
      changeType: sk.priceIndexVarPct === undefined ? "neutral" : sk.priceIndexVarPct >= 0 ? "positive" : "negative",
      description: "",
      tooltip: "Fuente: Ventas BIS · Índice de precio vs benchmark de mercado",
    });
  }

  if (sk.numericDistribution !== undefined) {
    const dn = Math.abs(sk.numericDistribution) <= 1 ? sk.numericDistribution * 100 : sk.numericDistribution;
    kpis.push({
      label: "Distribución numérica",
      value: formatPercentage(dn),
      change: sk.numericDistributionVarPct ?? 0,
      changeType: sk.numericDistributionVarPct === undefined ? "neutral" : sk.numericDistributionVarPct >= 0 ? "positive" : "negative",
      description: "",
      tooltip: "Fuente: Ventas BIS · Cobertura de distribución detectada",
    });
  }

  if (sk.grossMargin !== undefined) {
    kpis.push({
      label: "Gross Profit",
      value: formatCurrency(sk.grossMargin),
      change: sk.grossMarginVarPct ?? 0,
      changeType: sk.grossMarginVarPct === undefined ? "neutral" : sk.grossMarginVarPct >= 0 ? "positive" : "negative",
      description: "",
      tooltip: "Fuente: Ventas BIS · Margen bruto = Net Revenue - COGS",
    });
  }

  return kpis;
}

function rowsForFilters(dataset: ProcessedDataset, filters: SalesFilters) {
  const months = dataset.availableFilters?.months ?? [];
  const allowedMonths = (() => {
    const ordered = [...months].sort();
    if (filters.period === "YTD" || ordered.length === 0) return null;
    if (filters.period === "MTD") return new Set(ordered.slice(-1));
    if (filters.period === "QTD") return new Set(ordered.slice(-3));
    if (filters.period === "6M") return new Set(ordered.slice(-6));
    return new Set(ordered.slice(-12));
  })();
  const byCommon = (row: NormalizedSellInRow | NormalizedSellOutRow) => {
    if (allowedMonths && row.month && !allowedMonths.has(row.month)) return false;
    if (filters.skuId && row.skuId !== filters.skuId) return false;
    if (filters.channel && row.channel !== filters.channel) return false;
    if (filters.clientId && row.clientId !== filters.clientId) return false;
    return true;
  };
  return {
    sellInRows: dataset.salesData?.sellInRows.filter(byCommon) ?? [],
    sellOutRows: dataset.salesData?.sellOutRows.filter(byCommon) ?? [],
  };
}

function buildMonthlyChart(sellInRows: NormalizedSellInRow[], sellOutRows: NormalizedSellOutRow[]) {
  const months = new Set<string>();
  for (const row of sellInRows) if (row.month) months.add(row.month);
  for (const row of sellOutRows) if (row.month) months.add(row.month);
  return [...months].sort().map((month) => ({
    label: month,
    sellIn: sellInRows.filter((row) => row.month === month).reduce((sum, row) => sum + (row.volumeCajas ?? 0), 0),
    sellOut: sellOutRows.filter((row) => row.month === month).reduce((sum, row) => sum + (row.volumeCajasOut ?? 0), 0),
  })).filter((point) => point.sellIn > 0 || point.sellOut > 0);
}

function buildChannelChart(sellInRows: NormalizedSellInRow[], sellOutRows: NormalizedSellOutRow[]) {
  const channels = new Set<string>();
  for (const row of sellInRows) if (row.channel) channels.add(row.channel);
  for (const row of sellOutRows) if (row.channel) channels.add(row.channel);
  return [...channels].sort().map((channel) => ({
    name: channel,
    sellIn: sellInRows.filter((row) => row.channel === channel).reduce((sum, row) => sum + (row.volumeCajas ?? 0), 0),
    sellOut: sellOutRows.filter((row) => row.channel === channel).reduce((sum, row) => sum + (row.volumeCajasOut ?? 0), 0),
  })).filter((point) => point.sellIn > 0 || point.sellOut > 0);
}

function buildDistributionData(sellOutRows: NormalizedSellOutRow[]) {
  const totals = new Map<string, Set<string>>();
  for (const row of sellOutRows) {
    const client = row.clientName ?? row.clientId;
    if (!client || !row.pdvId) continue;
    totals.set(client, (totals.get(client) ?? new Set()).add(row.pdvId));
  }
  const max = Math.max(1, ...[...totals.values()].map((set) => set.size));
  return [...totals].map(([chain, pdvs]) => ({ chain, value: Math.round((pdvs.size / max) * 100) })).sort((a, b) => b.value - a.value).slice(0, 8);
}

function buildSkuRows(sellInRows: NormalizedSellInRow[], sellOutRows: NormalizedSellOutRow[]) {
  const rows = new Map<string, { id: string; name: string; sellIn: number; sellOut: number; netRevenue: number }>();
  for (const row of sellInRows) {
    if (!row.skuId) continue;
    const current = rows.get(row.skuId) ?? { id: row.skuId, name: row.skuName ?? row.skuId, sellIn: 0, sellOut: 0, netRevenue: 0 };
    current.sellIn += row.volumeCajas ?? 0;
    current.netRevenue += row.netRevenue ?? 0;
    rows.set(row.skuId, current);
  }
  for (const row of sellOutRows) {
    if (!row.skuId) continue;
    const current = rows.get(row.skuId) ?? { id: row.skuId, name: row.skuName ?? row.skuId, sellIn: 0, sellOut: 0, netRevenue: 0 };
    current.sellOut += row.volumeCajasOut ?? 0;
    rows.set(row.skuId, current);
  }
  return [...rows.values()].sort((a, b) => b.sellIn - a.sellIn).slice(0, 10);
}

// ─── BIS / Real builders ───────────────────────────────────────────────────────

/** Ranking de SKU por Sell-in (dimensión TOTAL). Top 8 descendente. */
function buildSkuRankingData(sellInRows: NormalizedSellInRow[], sellOutRows: NormalizedSellOutRow[]): SkuRankingRow[] {
  const map = new Map<string, { name: string; sellIn: number; sellOut: number }>();
  for (const row of sellInRows) {
    if (!row.skuId) continue;
    const entry = map.get(row.skuId) ?? { name: row.skuName ?? row.skuId, sellIn: 0, sellOut: 0 };
    entry.sellIn += row.volumeCajas ?? 0;
    map.set(row.skuId, entry);
  }
  for (const row of sellOutRows) {
    if (!row.skuId) continue;
    const entry = map.get(row.skuId) ?? { name: row.skuName ?? row.skuId, sellIn: 0, sellOut: 0 };
    entry.sellOut += row.volumeCajasOut ?? 0;
    map.set(row.skuId, entry);
  }
  return [...map.values()]
    .filter((r) => r.sellIn > 0)
    .sort((a, b) => b.sellIn - a.sellIn)
    .slice(0, 8)
    .map((r) => ({ name: r.name, sellIn: r.sellIn, sellOut: r.sellOut > 0 ? r.sellOut : undefined }));
}

/** Ranking de SKU por canal — gráfico stacked. Devuelve null si no hay granularidad canal+SKU. */
function buildSkuByChannelData(sellInRows: NormalizedSellInRow[]): SkuByChannelData | null {
  const canalSkuMap = new Map<string, Map<string, number>>();
  const skuMeta = new Map<string, string>(); // skuId → skuName
  for (const row of sellInRows) {
    if (!row.channel || !row.skuId) continue;
    if (row.skuName) skuMeta.set(row.skuId, row.skuName);
    const skuMap = canalSkuMap.get(row.channel) ?? new Map<string, number>();
    skuMap.set(row.skuId, (skuMap.get(row.skuId) ?? 0) + (row.volumeCajas ?? 0));
    canalSkuMap.set(row.channel, skuMap);
  }
  if (canalSkuMap.size === 0) return null;

  // Top-6 SKUs por volumen total
  const skuTotals = new Map<string, number>();
  for (const row of sellInRows) {
    if (!row.skuId) continue;
    skuTotals.set(row.skuId, (skuTotals.get(row.skuId) ?? 0) + (row.volumeCajas ?? 0));
  }
  const topSkus = [...skuTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id]) => ({ id, name: skuMeta.get(id) ?? id }));

  if (topSkus.length === 0) return null;

  const skuNames = topSkus.map((s) => s.name);
  const series = [...canalSkuMap.entries()].map(([canal, skuMap]) => ({
    name: canal,
    data: topSkus.map((s) => skuMap.get(s.id) ?? 0),
  }));

  return { skus: skuNames, series };
}

/** Mapea SalesFilterPeriod al mes BIS correspondiente para filtrar filas. */
function bisPeriodToMonth(period: SalesFilterPeriod): string | null {
  switch (period) {
    case "YTD": return "2026-YTD";
    case "QTD": return "2026-QTD";
    case "6M":  return "2026-U6M";
    case "MTD": return null; // sin datos MTD en BIS
    case "12M": return null; // sin datos 12M en BIS
    default:    return null;
  }
}

/**
 * Comparación año-contra-año para el período seleccionado desde kpiFacts.
 * Devuelve [2025 período, 2026 período] con Sell-in y Sell-out.
 * Devuelve null si el período no tiene datos (MTD, 12M, sin fact disponible).
 */
function buildBisPeriodChart(
  kpiFacts: CommercialKpiFact[],
  period: SalesFilterPeriod,
): { label: string; sellIn: number; sellOut: number }[] | null {
  if (period === "MTD" || period === "12M") return null;

  const factPeriodMap: Record<string, KpiFactPeriod> = { YTD: "YTD", QTD: "QTD", "6M": "U6M" };
  const factPeriod = factPeriodMap[period];
  if (!factPeriod) return null;

  const siF = resolveKpiFact(kpiFacts, "sellInVolume", factPeriod);
  const soF = resolveKpiFact(kpiFacts, "sellOutVolume", factPeriod);

  const si26 = siF?.isAvailable && siF.value !== undefined ? siF.value : undefined;
  const so26 = soF?.isAvailable && soF.value !== undefined ? soF.value : undefined;
  if (!si26 && !so26) return null;

  const label26Map: Record<string, string> = { YTD: "YTD 2026", QTD: "Q1 2026", U6M: "U6M 2026" };
  const label25Map: Record<string, string> = { YTD: "YTD 2025", QTD: "Q1 2025", U6M: "U6M 2025" };

  const points: { label: string; sellIn: number; sellOut: number }[] = [];

  // Año anterior si existe
  const si25 = siF?.priorValue;
  const so25 = soF?.priorValue;
  if (si25 !== undefined && si25 > 0) {
    points.push({ label: label25Map[factPeriod] ?? `2025 ${factPeriod}`, sellIn: si25, sellOut: so25 ?? 0 });
  }

  // Año actual
  points.push({ label: label26Map[factPeriod] ?? `2026 ${factPeriod}`, sellIn: si26 ?? 0, sellOut: so26 ?? 0 });

  return points.length > 0 ? points : null;
}

function EmptyChartState({ message }: { message?: string } = {}) {
  return (
    <div className="h-64 rounded-lg border border-dashed border-border bg-surface-soft flex items-center justify-center px-6 text-center">
      <p className="text-xs text-text-muted leading-relaxed">
        {message ?? "No hay datos suficientes para este gráfico con los filtros seleccionados."}
      </p>
    </div>
  );
}

// ─── View mode & merge ─────────────────────────────────────────────────────────

type VentasViewMode = DatasetSource | "all";

function buildMergedDataset(datasets: import("@/stores/data-source-store").AvailableDataset[]): ProcessedDataset {
  const pds = datasets.map((ds) => ds.dataset).filter(Boolean) as ProcessedDataset[];

  // Use concat (not spread) to avoid call-stack overflow on large arrays
  const allSellIn = pds.reduce<NormalizedSellInRow[]>((acc, pd) => acc.concat(pd.salesData?.sellInRows ?? []), []);
  const allSellOut = pds.reduce<NormalizedSellOutRow[]>((acc, pd) => acc.concat(pd.salesData?.sellOutRows ?? []), []);
  const allProducts = pds.reduce<NormalizedProduct[]>((acc, pd) => acc.concat(pd.salesData?.products ?? []), []);
  const allClients = pds.reduce<NormalizedClient[]>((acc, pd) => acc.concat(pd.salesData?.directClients ?? []), []);

  const monthsSet = new Set<string>(pds.flatMap((pd) => pd.availableFilters?.months ?? []));
  const skusMap = new Map<string, { id: string; name: string }>(
    pds.flatMap((pd) => pd.availableFilters?.skus ?? []).map((s) => [s.id, s])
  );
  const channelsSet = new Set<string>(pds.flatMap((pd) => pd.availableFilters?.channels ?? []));
  const clientsMap = new Map<string, { id: string; name: string }>(
    pds.flatMap((pd) => pd.availableFilters?.clients ?? []).map((c) => [c.id, c])
  );

  return {
    id: "merged-consolidated",
    fileName: "Vista consolidada",
    fileSize: 0,
    uploadedAt: new Date().toISOString(),
    sheets: pds.flatMap((pd) => pd.sheets),
    salesKpis: {},
    salesTables: {},
    salesData: {
      sellInRows: allSellIn,
      sellOutRows: allSellOut,
      products: allProducts,
      directClients: allClients,
      indirectClients: [],
    },
    availableFilters: {
      months: Array.from(monthsSet).sort(),
      skus: Array.from(skusMap.values()),
      channels: Array.from(channelsSet).sort(),
      clients: Array.from(clientsMap.values()),
    },
    validation: { warnings: [], errors: [], sheetsFound: [], sheetsMissing: [], columnMappings: [] },
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type ActiveModal = "plan" | "t2t" | "export" | null;

export default function VentasPage() {
  const router = useRouter();
  const {
    hasDemoLoaded,
    fileDataset, integrationDataset,
    activeDatasetSource, setActiveDatasetSource,
  } = useDataSourceStore();
  const { user } = useAuthStore();
  const createConversation = useChatStore((s) => s.createConversation);
  const canAccessVentas = canAccessModule(user, "ventas");
  const canChat = canCreateChat(user);
  const canCreatePlans = canEditActionPlan(user);
  const canExport = canExportReports(user);
  const datasetState = getWorkspaceDatasetState({ activeDatasetSource, fileDataset, integrationDataset, hasDemoLoaded });
  const hasData = datasetState !== "empty";
  const availableDatasets = getAvailableDatasets({ fileDataset, integrationDataset, hasDemoLoaded });

  // Local view mode: individual source or consolidated "all"
  // Initialized from persisted store selection; "all" is session-only (not persisted)
  const [viewMode, setViewMode] = useState<VentasViewMode>(activeDatasetSource ?? "demo");

  function handleSelectView(mode: VentasViewMode) {
    setViewMode(mode);
    if (mode !== "all") {
      setActiveDatasetSource(mode as DatasetSource);
    }
  }

  const mergedDataset = useMemo(
    () => (viewMode === "all" && availableDatasets.length > 1 ? buildMergedDataset(availableDatasets) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [viewMode, fileDataset, integrationDataset, hasDemoLoaded]
  );

  const activeDataset = viewMode === "all"
    ? mergedDataset
    : getActiveDataset({ activeDatasetSource, fileDataset, integrationDataset, hasDemoLoaded });

  const [period, setPeriod] = useState<SalesFilterPeriod>("YTD");
  const [product, setProduct] = useState("all");
  const [channel, setChannel] = useState("all");
  const [client, setClient] = useState("all");
  const [modal, setModal] = useState<ActiveModal>(() =>
    typeof window !== "undefined" && window.location.search.includes("modal=t2t") ? "t2t" : null
  );

  const realFilters: SalesFilters = {
    period,
    skuId: product !== "all" ? product : undefined,
    channel: channel !== "all" ? channel : undefined,
    clientId: client !== "all" ? client : undefined,
  };
  const recalculated = activeDataset ? calculateSalesKpis(activeDataset, realFilters) : null;
  const noFiltersActive = period === "YTD" && product === "all" && channel === "all" && client === "all";
  // Merge stored KPIs (base) with recalculated values (override). When no filters are active, stored
  // KPIs from the file-processing stage (e.g. from a KPI sheet) fill gaps the raw-row recalc misses.
  const filteredKpis: SalesKpis | null = activeDataset
    ? {
        ...(noFiltersActive ? activeDataset.salesKpis : {}),
        ...(Object.fromEntries(Object.entries(recalculated ?? {}).filter(([, v]) => v !== undefined)) as SalesKpis),
      }
    : null;
  const filteredRows = activeDataset ? rowsForFilters(activeDataset, realFilters) : null;
  const monthlyChart = filteredRows ? buildMonthlyChart(filteredRows.sellInRows, filteredRows.sellOutRows) : [];
  const channelChart = filteredRows ? buildChannelChart(filteredRows.sellInRows, filteredRows.sellOutRows) : [];
  const distributionData = filteredRows ? buildDistributionData(filteredRows.sellOutRows) : [];
  const skuRows = filteredRows ? buildSkuRows(filteredRows.sellInRows, filteredRows.sellOutRows) : [];
  // Determinar modo real/demo temprano (usado en builders y render)
  const isRealDataset = datasetState === "real";
  // BIS/Real chart data ─────────────────────────────────────────────────────────
  const bisKpiFacts = isRealDataset && activeDataset?.kpiFacts?.length ? activeDataset.kpiFacts : null;

  // Para BIS: filas filtradas por período exacto (e.g., "2026-QTD") en vez del slice de meses
  // Para MTD/12M: sin datos → [] (empty state en charts)
  const bisFilteredRows = isRealDataset && bisKpiFacts && activeDataset ? (() => {
    const targetMonth = bisPeriodToMonth(period);
    if (!targetMonth) return { sellInRows: [] as NormalizedSellInRow[], sellOutRows: [] as NormalizedSellOutRow[] };
    const byPeriod = (row: NormalizedSellInRow | NormalizedSellOutRow) =>
      row.month === targetMonth &&
      (!realFilters.skuId || row.skuId === realFilters.skuId) &&
      (!realFilters.channel || row.channel === realFilters.channel) &&
      (!realFilters.clientId || row.clientId === realFilters.clientId);
    return {
      sellInRows: (activeDataset.salesData?.sellInRows ?? []).filter(byPeriod),
      sellOutRows: (activeDataset.salesData?.sellOutRows ?? []).filter(byPeriod),
    };
  })() : null;

  // Filas efectivas para charts BIS (period-aware) vs demo (month-slice)
  const effectiveRows = bisFilteredRows ?? filteredRows;

  const bisUnavailablePeriod = isRealDataset && bisKpiFacts &&
    (period === "MTD" || period === "12M");

  const skuRankingData: SkuRankingRow[] = effectiveRows
    ? buildSkuRankingData(effectiveRows.sellInRows, effectiveRows.sellOutRows)
    : [];
  const skuByChannelData: SkuByChannelData | null = effectiveRows
    ? buildSkuByChannelData(effectiveRows.sellInRows)
    : null;
  const bisPeriodChart = bisKpiFacts ? buildBisPeriodChart(bisKpiFacts, period) : null;

  // Waterfall en modo real: usar KPIs del período activo desde kpiFacts
  const bisWaterfallKpis = isRealDataset && bisKpiFacts && !bisUnavailablePeriod && activeDataset
    ? salesKpisFromKpiFacts(activeDataset, period) as import("@/types/dataset").SalesKpis | null
    : null;

  const productOptions = activeDataset?.availableFilters?.skus.length
    ? [{ value: "all", label: "Todos los SKUs" }, ...activeDataset.availableFilters.skus.map((sku) => ({
        value: sku.id,
        label: resolveProductDisplayName(activeDataset, sku.id, sku.name),
      }))]
    : PRODUCTS;
  const channelOptions = activeDataset?.availableFilters?.channels.length
    ? [{ value: "all", label: "Todos los canales" }, ...activeDataset.availableFilters.channels.map((item) => ({ value: item, label: optionLabel(item) }))]
    : CHANNELS;
  const clientOptions = activeDataset?.availableFilters?.clients.length
    ? [{ value: "all", label: "Todos los clientes" }, ...activeDataset.availableFilters.clients.map((item) => ({ value: item.id, label: item.name }))]
    : [{ value: "all", label: "Todos los clientes" }];

  const isFiltered = period !== "YTD" || product !== "all" || channel !== "all" || client !== "all";
  const filterLabel = [
    period !== "YTD" ? period : null,
    product !== "all" ? productOptions.find((p) => p.value === product)?.label : null,
    channel !== "all" ? channelOptions.find((c) => c.value === channel)?.label : null,
    client !== "all" ? clientOptions.find((c) => c.value === client)?.label : null,
  ].filter(Boolean).join(" · ");

  // Para dataset real con kpiFacts BIS: resolución por período desde la capa canónica.
  // Para demo o dataset sin kpiFacts: usar salesKpis con calculateSalesKpis (comportamiento anterior).
  const activeKpis = activeDataset
    ? (isRealDataset && datasetHasKpiFacts(activeDataset)
        ? kpisFromKpiFacts(activeDataset, period)
        : kpisFromDataset(filteredKpis ?? activeDataset.salesKpis))
    : null;
  // Mostrar insights sólo en modo demo (no inventar alertas para datos reales)
  const showInsights = !isRealDataset;

  const insightIcon = { alert: AlertTriangle, opportunity: Lightbulb, warning: AlertTriangle, info: CheckCircle };
  const insightColor = { alert: "border-danger/25 bg-danger/8", opportunity: "border-accent/25 bg-accent/8", warning: "border-warning/25 bg-warning/8", info: "border-info/25 bg-info/8" };
  const insightIconColor = { alert: "text-danger", opportunity: "text-accent", warning: "text-warning", info: "text-info" };

  if (!canAccessVentas) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="h-16 w-16 rounded-2xl bg-surface-soft border border-border flex items-center justify-center mb-5">
          <TrendingUp className="h-8 w-8 text-text-muted" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">No tenés acceso a este módulo</h2>
        <p className="text-text-muted max-w-sm leading-relaxed">
          Tu rol actual no incluye el módulo Ventas. Pedile a un Owner o Admin que habilite el módulo para tu usuario.
        </p>
      </div>
    );
  }

  if (!hasData) {
    return <ModuleEmptyState moduleId="ventas" />;
  }

  // Active dataset is null only when in-memory data was lost on reload (file or integration source)
  if (hasData && !activeDataset) {
    const isIntegrationSource = activeDatasetSource === "integration";
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-5 ${isIntegrationSource ? "bg-primary/10 border border-primary/20" : "bg-warning/10 border border-warning/20"}`}>
          {isIntegrationSource ? <Database className="h-8 w-8 text-primary" /> : <AlertTriangle className="h-8 w-8 text-warning" />}
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">
          {isIntegrationSource ? "Sincronizá la integración para ver los KPIs" : "Re-cargá el archivo para ver los KPIs"}
        </h2>
        <p className="text-text-muted max-w-sm mb-8 leading-relaxed">
          {isIntegrationSource
            ? "La integración está conectada pero los datos en memoria se perdieron al recargar la página. Hacé click en Sincronizar para volver a cargar los KPIs."
            : "Los datos del archivo no persisten entre sesiones. Volvé a cargarlo para ver los KPIs reales calculados desde tu Excel."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="primary" size="lg" onClick={() => router.push(ROUTES.DATA_SOURCES)}>
            {isIntegrationSource ? <Database className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
            {isIntegrationSource ? "Ir a Fuentes de datos" : "Cargar archivo"}
          </Button>
          <Button variant="secondary" size="lg" onClick={() => activateFullDemo()}>
            <Zap className="h-4 w-4" />
            Usar demo CPG
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <ModuleHeader moduleId="ventas" />

      {/* Dataset source banner + selector */}
      <ModuleDataSourceBanner
        datasetState={datasetState}
        dataset={activeDataset}
        availableDatasets={availableDatasets}
        viewMode={viewMode}
        onSelectView={handleSelectView}
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 p-4 bg-surface rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Filtros</span>
          {isFiltered && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-accent">Vista filtrada: {filterLabel}</span>
              <button
                onClick={() => { setPeriod("YTD"); setProduct("all"); setChannel("all"); setClient("all"); }}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                title={p.tooltip}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  period === p.value
                    ? "bg-primary text-white"
                    : "bg-surface-elevated border border-border text-text-secondary hover:border-primary/30 hover:text-text-primary"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Dropdown
              options={productOptions}
              value={product}
              onChange={setProduct}
              size="sm"
              className="w-44"
            />
            <Dropdown
              options={channelOptions}
              value={channel}
              onChange={setChannel}
              size="sm"
              className="w-44"
            />
            {activeDataset && (
              <Dropdown
                options={clientOptions}
                value={client}
                onChange={setClient}
                size="sm"
                className="w-44"
              />
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div>
        <h2 className="text-xs text-text-muted uppercase tracking-wide font-medium mb-3">
          Indicadores principales
          {isFiltered && <span className="ml-2 font-normal text-accent normal-case">· {filterLabel}</span>}
        </h2>
        {/* Grilla 3×2 (6 KPIs) — mismo layout en demo y real. */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(activeKpis ?? []).slice(0, 6).map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="h-full">
              <KpiCard kpi={kpi} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top-left: Sell-in vs Sell-out */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isRealDataset
                ? "Sell-in vs Sell-out"
                : activeDataset
                  ? "Sell-in vs Sell-out por mes"
                  : "Sell-in vs Sell-out (26 semanas)"}
            </CardTitle>
            {isRealDataset && bisPeriodChart && (
              <p className="text-[11px] text-text-muted">
                Comparación año anterior vs actual · período: {period}
              </p>
            )}
            {isRealDataset && bisUnavailablePeriod && (
              <p className="text-[11px] text-text-muted">Sin datos {period} en archivo BIS.</p>
            )}
          </CardHeader>
          <CardContent className="pt-2">
            {isRealDataset ? (
              bisUnavailablePeriod || !bisPeriodChart ? (
                <EmptyChartState message={bisUnavailablePeriod ? `Sin datos ${period} en BIS.` : undefined} />
              ) : (
                <SellInSellOutChart height={280} data={bisPeriodChart} />
              )
            ) : activeDataset && monthlyChart.length === 0 ? (
              <EmptyChartState />
            ) : (
              <SellInSellOutChart height={280} data={activeDataset ? monthlyChart : undefined} />
            )}
          </CardContent>
        </Card>

        {/* Top-right: Ranking de SKU (BIS/real) o Distribución numérica (demo) */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isRealDataset ? "Ranking de SKU" : "Distribución numérica por cadena"}
            </CardTitle>
            {isRealDataset && !bisUnavailablePeriod && skuRankingData.length > 0 && (
              <p className="text-[11px] text-text-muted">Sell-in por SKU · {period} · top 8</p>
            )}
            {isRealDataset && bisUnavailablePeriod && (
              <p className="text-[11px] text-text-muted">Sin datos {period} en BIS.</p>
            )}
          </CardHeader>
          <CardContent className="pt-2">
            {isRealDataset ? (
              bisUnavailablePeriod || skuRankingData.length === 0 ? (
                <EmptyChartState message={bisUnavailablePeriod ? `Sin datos ${period} en BIS.` : undefined} />
              ) : (
                <SkuRankingChart height={280} data={skuRankingData} />
              )
            ) : activeDataset && distributionData.length === 0 ? (
              <EmptyChartState />
            ) : (
              <DistributionChart height={280} data={activeDataset ? distributionData : undefined} />
            )}
          </CardContent>
        </Card>

        {/* Bottom-left: Cascada P&L */}
        <Card>
          <CardHeader>
            <CardTitle>Cascada P&amp;L</CardTitle>
            <p className="text-[11px] text-text-muted">
              {isRealDataset
                ? `Gross Revenue → Net Revenue → EBITDA · ${period}`
                : "Venta Bruta - Trade = Net Revenue; Net Revenue - COGS - Opex = EBITDA"}
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            {isRealDataset && bisUnavailablePeriod ? (
              <EmptyChartState message={`Sin datos ${period} en BIS.`} />
            ) : (
              <RevenueWaterfallChart
                height={300}
                salesKpis={
                  isRealDataset
                    ? (bisWaterfallKpis ?? activeDataset?.salesKpis ?? undefined)
                    : undefined
                }
              />
            )}
          </CardContent>
        </Card>

        {/* Bottom-right: Ranking SKU × Canal (BIS/real) o Sell-in vs Sell-out por canal (demo) */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isRealDataset ? "Sell-in por SKU y canal" : "Sell-in vs Sell-out por canal"}
            </CardTitle>
            {isRealDataset && !bisUnavailablePeriod && skuByChannelData && (
              <p className="text-[11px] text-text-muted">Top SKUs apilados por canal · {period}</p>
            )}
            {isRealDataset && bisUnavailablePeriod && (
              <p className="text-[11px] text-text-muted">Sin datos {period} en BIS.</p>
            )}
          </CardHeader>
          <CardContent className="pt-2">
            {isRealDataset ? (
              bisUnavailablePeriod ? (
                <EmptyChartState message={`Sin datos ${period} en BIS.`} />
              ) : skuByChannelData ? (
                <SkuByChannelChart height={300} data={skuByChannelData} />
              ) : (
                <EmptyChartState message="Sin granularidad SKU × canal en este archivo." />
              )
            ) : activeDataset && channelChart.length === 0 ? (
              <EmptyChartState />
            ) : (
              <ChannelBarChart height={300} data={activeDataset ? channelChart : undefined} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* SKU Table + Insights + Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* SKU table — visible sólo en modo demo. En modo real los gráficos superiores ya muestran el ranking. */}
        {!isRealDataset && <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ranking de SKUs</CardTitle>
                <span
                  className="text-[10px] text-text-muted border border-border/50 rounded px-1.5 py-0.5 cursor-help"
                  title="Stock Keeping Unit — código identificador único por producto y presentación"
                >
                  ¿Qué es un SKU?
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["SKU", "Sell-in", "Sell-out", "Passthrough", "Dist. %", "Vs Budget"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-wide text-text-muted font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeDataset ? (
                      skuRows.length > 0 ? skuRows.map((sku) => {
                        const passthrough = sku.sellIn > 0 ? Math.round((sku.sellOut / sku.sellIn) * 1000) / 10 : null;
                        return (
                          <tr key={sku.id} className="border-b border-border/50 hover:bg-surface-soft transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium text-text-primary text-xs">
                                {resolveProductDisplayName(activeDataset, sku.id, sku.name)}
                              </div>
                              <div className="text-[10px] text-text-muted">{sku.id}</div>
                            </td>
                            <td className="px-4 py-3 text-text-secondary text-xs font-mono">{formatVolume(sku.sellIn)}</td>
                            <td className="px-4 py-3 text-text-secondary text-xs font-mono">{formatVolume(sku.sellOut)}</td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                "text-xs font-semibold",
                                passthrough === null ? "text-text-muted" : passthrough >= 80 ? "text-success" : passthrough >= 65 ? "text-warning" : "text-danger"
                              )}>{passthrough === null ? "N/D" : `${passthrough}%`}</span>
                            </td>
                            <td className="px-4 py-3 text-text-secondary text-xs">N/D</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">Real</Badge>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-xs text-text-muted">
                            No hay SKUs disponibles con los filtros seleccionados.
                          </td>
                        </tr>
                      )
                    ) : SKUS.map((sku) => (
                      <tr key={sku.id} className="border-b border-border/50 hover:bg-surface-soft transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-text-primary text-xs">{sku.name}</div>
                          <div className="text-[10px] text-text-muted">{sku.category}</div>
                        </td>
                        <td className="px-4 py-3 text-text-secondary text-xs font-mono">{sku.sellIn.toLocaleString()}</td>
                        <td className="px-4 py-3 text-text-secondary text-xs font-mono">{sku.sellOut.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "text-xs font-semibold",
                            sku.passthrough >= 80 ? "text-success" : sku.passthrough >= 65 ? "text-warning" : "text-danger"
                          )}>{sku.passthrough}%</span>
                        </td>
                        <td className="px-4 py-3 text-text-secondary text-xs">{sku.distributionNum}%</td>
                        <td className="px-4 py-3">
                          <Badge variant={sku.vsbudget >= 0 ? "success" : "danger"}>
                            {sku.vsbudget >= 0 ? "+" : ""}{sku.vsbudget}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>}

        {/* Right column: insights + actions (full width in real mode, 1/3 in demo) */}
        <div className={cn("space-y-4", isRealDataset ? "xl:col-span-3 max-w-lg" : "")}>
          {/* Insights — sólo en modo demo. En modo real no renderizar. */}
          {showInsights && (
            <div className="space-y-2.5">
              <h2 className="text-xs text-text-muted uppercase tracking-wide font-medium">Insights detectados</h2>
              {INSIGHTS.map((ins, i) => {
                const Icon = insightIcon[ins.type];
                return (
                  <div key={i} className={cn("rounded-lg border p-3 flex gap-2.5", insightColor[ins.type])}>
                    <Icon className={cn("h-3.5 w-3.5 flex-shrink-0 mt-0.5", insightIconColor[ins.type])} />
                    <div>
                      <div className="text-xs font-semibold text-text-primary mb-0.5">{ins.title}</div>
                      <div className="text-[11px] text-text-secondary leading-relaxed">{ins.description}</div>
                      <Badge variant="outline" className="mt-1.5 text-[10px]">{ins.area}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="rounded-lg border border-border bg-surface p-4 space-y-2">
            <h2 className="text-xs text-text-muted uppercase tracking-wide font-medium mb-3">Acciones</h2>
            {canCreatePlans && (
            <button
              onClick={() => setModal("plan")}
              className="w-full flex items-center gap-3 text-sm text-text-secondary hover:text-text-primary border border-border hover:border-primary/30 hover:bg-surface-soft rounded-lg px-3.5 py-2.5 transition-all group"
            >
              <ClipboardList className="h-4 w-4 text-primary/60 flex-shrink-0" />
              <span className="flex-1 text-left">Crear plan de acción</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            )}
            {canExport && (
            <button
              onClick={() => setModal("t2t")}
              className="w-full flex items-center gap-3 text-sm text-text-secondary hover:text-text-primary border border-border hover:border-primary/30 hover:bg-surface-soft rounded-lg px-3.5 py-2.5 transition-all group"
            >
              <Presentation className="h-4 w-4 text-accent/60 flex-shrink-0" />
              <span className="flex-1 text-left">Generar presentación T2T</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            )}
            {canExport && (
            <button
              onClick={() => setModal("export")}
              className="w-full flex items-center gap-3 text-sm text-text-secondary hover:text-text-primary border border-border hover:border-primary/30 hover:bg-surface-soft rounded-lg px-3.5 py-2.5 transition-all group"
            >
              <FileDown className="h-4 w-4 text-text-muted flex-shrink-0" />
              <span className="flex-1 text-left">Exportar análisis JSON</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            )}
            {canChat && (
            <button
              onClick={() => {
                createConversation(undefined, undefined, "ventas");
                router.push(ROUTES.WORKSPACE);
              }}
              className="w-full flex items-center gap-3 text-sm text-text-secondary hover:text-text-primary border border-border hover:border-primary/30 hover:bg-surface-soft rounded-lg px-3.5 py-2.5 transition-all group"
            >
              <Sparkles className="h-4 w-4 text-primary/60 flex-shrink-0" />
              <span className="flex-1 text-left">Preguntarle a Nexus</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal === "plan" && canCreatePlans && <CreatePlanModal onClose={() => setModal(null)} />}
        {modal === "t2t" && canExport && <T2TModal onClose={() => setModal(null)} />}
        {modal === "export" && canExport && (
          <ExportModal
            onClose={() => setModal(null)}
            period={period}
            product={product}
            channel={channel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

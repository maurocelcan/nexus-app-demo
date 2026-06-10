"use client";
import { useState, useMemo } from "react";
import { AlertTriangle, Lightbulb, CheckCircle, AlertCircle, Info,
  ClipboardList, TrendingUp, Presentation, Plus, X, Trash2,
  ArrowRight, Target, User, Calendar, Sparkles, Check, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn, generateId } from "@/lib/utils";
import type { MessageBlock } from "@/types/chat";
import { SellInSellOutChart } from "@/components/charts/sell-in-sell-out-chart";
import { ROUTES } from "@/lib/routes";
import { useActionPlanStore } from "@/stores/action-plan-store";
import { useChatStore } from "@/stores/chat-store";
import { useAuthStore } from "@/stores/auth-store";
import type { ActionPlanPriority } from "@/types/analytics";
import { canEditActionPlan, canExportReports, canCreateInsight, canEditGoals } from "@/lib/permissions";
import { normalizeActions } from "@/lib/chat-actions";
import { CreateOutputModal, type OutputActionType } from "@/components/chat/create-output-modal";

// ─── KPI Strip ────────────────────────────────────────────────────────────────

function KpiStrip({ kpis }: { kpis: { label: string; value: string; change: string; changeType: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2 my-3">
      {kpis.map((k) => (
        <div key={k.label} className="flex flex-col gap-0.5 bg-surface-elevated border border-border rounded-lg px-3.5 py-2.5 min-w-[110px]">
          <span className="text-[10px] uppercase tracking-wide text-text-muted font-medium">{k.label}</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-text-primary">{k.value}</span>
            {k.change && (
              <span className={cn(
                "text-xs font-medium",
                k.changeType === "positive" && "text-success",
                k.changeType === "negative" && "text-danger",
                k.changeType === "neutral" && "text-text-muted"
              )}>
                {k.change}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Insight Cards ────────────────────────────────────────────────────────────

function InsightCards({ insights }: { insights: { type: string; title: string; description: string }[] }) {
  return (
    <div className="space-y-2 my-3">
      {insights.map((ins, i) => (
        <div key={i} className={cn(
          "rounded-lg border p-3.5 flex gap-3",
          ins.type === "alert" && "border-danger/25 bg-danger/8",
          ins.type === "opportunity" && "border-accent/25 bg-accent/8",
          ins.type === "warning" && "border-warning/25 bg-warning/8",
          ins.type === "info" && "border-info/25 bg-info/8"
        )}>
          <div className="flex-shrink-0 mt-0.5">
            {ins.type === "alert" && <AlertCircle className="h-4 w-4 text-danger" />}
            {ins.type === "opportunity" && <Lightbulb className="h-4 w-4 text-accent" />}
            {ins.type === "warning" && <AlertTriangle className="h-4 w-4 text-warning" />}
            {ins.type === "info" && <Info className="h-4 w-4 text-info" />}
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary mb-0.5">{ins.title}</div>
            <div className="text-xs text-text-secondary leading-relaxed">{ins.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Recommendations ──────────────────────────────────────────────────────────

function Recommendations({ recommendations }: { recommendations: { id: string; title: string; description: string; priority: string }[] }) {
  const priorityColor = { high: "bg-danger/15 text-danger", medium: "bg-warning/15 text-warning", low: "bg-success/15 text-success" };
  return (
    <div className="space-y-2 my-3">
      <div className="text-xs text-text-muted uppercase tracking-wide font-medium mb-2">Recomendaciones</div>
      {recommendations.map((r) => (
        <div key={r.id} className="flex gap-3 rounded-lg border border-border bg-surface p-3 hover:bg-surface-soft transition-colors">
          <span className={cn(
            "h-5 px-1.5 rounded text-[10px] font-semibold uppercase flex items-center flex-shrink-0 mt-0.5",
            priorityColor[r.priority as keyof typeof priorityColor] ?? priorityColor.low
          )}>
            {r.priority === "high" ? "Alta" : r.priority === "medium" ? "Media" : "Baja"}
          </span>
          <div>
            <div className="text-sm font-medium text-text-primary">{r.title}</div>
            <div className="text-xs text-text-muted mt-0.5">{r.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Executive Summary ────────────────────────────────────────────────────────

function ExecutiveSummary({ data }: { data: { title: string; summary: string; period?: string; severity?: string } }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 my-3">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-text-primary leading-snug">{data.title}</h3>
        {data.severity && (
          <span className={cn(
            "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full flex-shrink-0",
            data.severity === "high" && "bg-danger/15 text-danger",
            data.severity === "medium" && "bg-warning/15 text-warning",
            data.severity === "low" && "bg-success/15 text-success"
          )}>
            {data.severity === "high" ? "Urgente" : data.severity === "medium" ? "Atención" : "Info"}
          </span>
        )}
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">{data.summary}</p>
      {data.period && <p className="text-xs text-text-muted mt-2">Período: {data.period}</p>}
    </div>
  );
}

// ─── Follow-up chips ──────────────────────────────────────────────────────────

function FollowUpChips({ questions, onAsk }: { questions: string[]; onAsk?: (q: string) => void }) {
  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <span className="text-[10px] text-text-muted uppercase tracking-wide font-medium block mb-2">Seguir explorando</span>
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => onAsk?.(q)}
            className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/40 hover:bg-primary/8 text-text-muted hover:text-text-secondary transition-all"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Create Plan Modal ────────────────────────────────────────────────────────

interface CreatePlanModalProps {
  context: { name: string; objective: string; items: string[] };
  onClose: () => void;
  onCreated: (planId: string) => void;
}

function CreatePlanModal({ context, onClose, onCreated }: CreatePlanModalProps) {
  const { user } = useAuthStore();
  const { createPlan } = useActionPlanStore();
  const { projects, activeConversationId, assignConversationToProject } = useChatStore();
  const [name, setName] = useState(context.name);
  const [objective, setObjective] = useState(context.objective);
  const [priority, setPriority] = useState<ActionPlanPriority>("high");
  const [targetDate, setTargetDate] = useState("2026-06-30");
  const [projectId, setProjectId] = useState("");
  const [goalId, setGoalId] = useState("");
  const [items, setItems] = useState(context.items.map((l) => ({ id: generateId(), label: l, done: false })));
  const [newItem, setNewItem] = useState("");
  const [done, setDone] = useState(false);
  const router = useRouter();

  const selectedProject = projects.find((p) => p.id === projectId);
  const availableGoals = selectedProject?.goals ?? [];

  function addItem() {
    const t = newItem.trim();
    if (!t) return;
    setItems((p) => [...p, { id: generateId(), label: t, done: false }]);
    setNewItem("");
  }

  function handleCreate() {
    if (!canEditActionPlan(user)) return;
    const plan = createPlan({
      name, objective, owner: "Mauro Celani", priority, targetDate,
      insightOrigin: context.name,
      status: "active",
      items: items.map((it) => ({ id: it.id, label: it.label, done: it.done, priority })),
      area: "Ventas",
      projectId: projectId || undefined,
      goalId: goalId || undefined,
      conversationId: activeConversationId ?? undefined,
    });
    if (projectId && activeConversationId) {
      assignConversationToProject(activeConversationId, projectId);
    }
    setDone(true);
    onCreated(plan.id);
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 bg-surface-elevated border border-border rounded-xl p-6 w-full max-w-sm text-center shadow-2xl"
        >
          <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
          <p className="font-semibold text-text-primary mb-1">Plan creado</p>
          <p className="text-sm text-text-muted mb-4">{items.length} acciones listas</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => { router.push(ROUTES.ACTION_PLANS); onClose(); }}
              className="px-4 py-1.5 text-xs font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Ver plan →
            </button>
            <button onClick={onClose} className="px-4 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors">
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 bg-surface-elevated border border-border rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Crear plan de acción</h3>
            <p className="text-xs text-text-muted mt-0.5">Convertí este insight en seguimiento operativo</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">Nombre del plan</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text-primary outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">Objetivo</label>
            <input value={objective} onChange={(e) => setObjective(e.target.value)}
              className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text-primary outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Prioridad</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as ActionPlanPriority)}
                className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text-primary outline-none focus:border-primary">
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Fecha objetivo</label>
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
                className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text-primary outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">Proyecto (opcional)</label>
            <select value={projectId} onChange={(e) => { setProjectId(e.target.value); setGoalId(""); }}
              className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text-primary outline-none focus:border-primary">
              <option value="">Sin proyecto</option>
              {projects.filter((p) => p.status === "active").map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          {availableGoals.length > 0 && (
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Objetivo del proyecto (opcional)</label>
              <select value={goalId} onChange={(e) => setGoalId(e.target.value)}
                className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text-primary outline-none focus:border-primary">
                <option value="">Sin objetivo específico</option>
                {availableGoals.map((g) => (
                  <option key={g.id} value={g.id}>{g.name} — {g.targetValue} {g.unit ?? ""}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">Acciones ({items.length})</label>
            <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-2 px-3 py-1.5 bg-surface-soft rounded-md">
                  <span className="flex-1 text-xs text-text-secondary">{it.label}</span>
                  <button onClick={() => setItems((p) => p.filter((i) => i.id !== it.id))} className="text-text-muted hover:text-danger transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newItem} onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
                placeholder="Agregar acción..."
                className="flex-1 text-xs bg-surface border border-border rounded-lg px-3 py-1.5 text-text-primary outline-none focus:border-primary placeholder:text-text-muted" />
              <button onClick={addItem} className="p-1.5 rounded-lg border border-border hover:border-primary/40 text-text-muted hover:text-primary transition-colors">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-4 py-1.5 text-xs font-medium bg-primary text-white rounded-md disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            Crear plan
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Diagnostic Summary ───────────────────────────────────────────────────────

interface DiagnosticPoint { text: string; severity?: "high" | "medium" | "low"; area?: string }

function DiagnosticSummary({ data }: { data: { title?: string; context?: string; points: DiagnosticPoint[] } }) {
  const severityDot: Record<string, string> = {
    high: "bg-danger",
    medium: "bg-warning",
    low: "bg-text-muted",
  };
  const severityLabel: Record<string, string> = {
    high: "text-danger",
    medium: "text-warning",
    low: "text-text-muted",
  };
  return (
    <div className="my-3 rounded-lg border border-danger/20 bg-danger/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-5 rounded-md bg-danger/15 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="h-3 w-3 text-danger" />
        </div>
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">{data.title ?? "Diagnóstico"}</span>
      </div>
      {data.context && <p className="text-xs text-text-muted mb-3 leading-relaxed">{data.context}</p>}
      <div className="space-y-2.5">
        {data.points.map((point, i) => {
          const dot = point.severity ? severityDot[point.severity] : severityDot.medium;
          const label = point.severity ? severityLabel[point.severity] : severityLabel.medium;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className={cn("h-1.5 w-1.5 rounded-full mt-2 flex-shrink-0", dot)} />
              <div className="min-w-0 flex-1">
                <span className="text-sm text-text-secondary leading-relaxed">{point.text}</span>
                {point.area && <span className={cn("ml-2 text-[10px] font-medium", label)}>[{point.area}]</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Cross Insights ───────────────────────────────────────────────────────────

interface CrossInsightItem {
  id: string;
  finding: string;
  association: string;
  sources: string[];
  impact: "high" | "medium" | "low";
}

function CrossInsights({ data }: { data: { title?: string; insights: CrossInsightItem[] } }) {
  const impactCfg: Record<string, { badge: string; border: string; bg: string }> = {
    high:   { badge: "bg-accent/15 text-accent border-accent/30",     border: "border-accent/25",   bg: "bg-accent/5" },
    medium: { badge: "bg-primary/15 text-primary-soft border-primary/30", border: "border-primary/20", bg: "bg-primary/5" },
    low:    { badge: "bg-surface-soft text-text-muted border-border",  border: "border-border",      bg: "bg-surface-elevated" },
  };
  return (
    <div className="my-3">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="h-5 w-5 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-3 w-3 text-accent" />
        </div>
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">{data.title ?? "Insights Cruzados"}</span>
      </div>
      <div className="space-y-3">
        {data.insights.map((insight) => {
          const cfg = impactCfg[insight.impact];
          return (
            <div key={insight.id} className={cn("rounded-lg border p-3.5", cfg.border, cfg.bg)}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-medium text-text-primary leading-snug flex-1">{insight.finding}</p>
                <span className={cn("text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full border flex-shrink-0", cfg.badge)}>
                  {insight.impact === "high" ? "Alto impacto" : insight.impact === "medium" ? "Medio" : "Bajo"}
                </span>
              </div>
              <div className="flex items-start gap-2 bg-surface/60 rounded-md p-2.5 mb-2">
                <ArrowRight className="h-3.5 w-3.5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-secondary leading-relaxed">{insight.association}</p>
              </div>
              {insight.sources.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {insight.sources.map((src) => (
                    <span key={src} className="text-[10px] text-text-muted bg-surface rounded px-1.5 py-0.5 border border-border">{src}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Strategic Initiatives ────────────────────────────────────────────────────

interface StrategicInitiativeItem {
  id: string;
  title: string;
  description: string;
  owner: string;
  dueDate?: string;
  priority: "high" | "medium" | "low";
  kpi?: string;
  area?: string;
}

function StrategicInitiatives({ data }: { data: { title?: string; objective?: string; initiatives: StrategicInitiativeItem[] } }) {
  const priorityCls = {
    high:   "bg-danger/10 text-danger border-danger/25",
    medium: "bg-warning/10 text-warning border-warning/25",
    low:    "bg-surface-soft text-text-muted border-border",
  };
  const priorityLabel = { high: "Alta", medium: "Media", low: "Baja" };
  return (
    <div className="my-3">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Target className="h-3 w-3 text-primary-soft" />
        </div>
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">{data.title ?? "Iniciativas Estratégicas"}</span>
      </div>
      {data.objective && <p className="text-xs text-text-muted mb-3 leading-relaxed">{data.objective}</p>}
      <div className="space-y-2">
        {data.initiatives.map((initiative, i) => (
          <div key={initiative.id} className="rounded-lg border border-border bg-surface-elevated p-3.5">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-[10px] font-bold text-primary-soft bg-primary/10 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-text-primary leading-snug">{initiative.title}</span>
              </div>
              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full border flex-shrink-0", priorityCls[initiative.priority])}>
                {priorityLabel[initiative.priority]}
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mb-2 ml-7">{initiative.description}</p>
            <div className="flex flex-wrap items-center gap-3 ml-7">
              {initiative.owner && (
                <span className="flex items-center gap-1 text-[10px] text-text-muted">
                  <User className="h-2.5 w-2.5" />{initiative.owner}
                </span>
              )}
              {initiative.dueDate && (
                <span className="flex items-center gap-1 text-[10px] text-text-muted">
                  <Calendar className="h-2.5 w-2.5" />
                  {new Date(initiative.dueDate).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                </span>
              )}
              {initiative.area && <span className="text-[10px] text-text-muted">{initiative.area}</span>}
              {initiative.kpi && <span className="text-[10px] text-accent font-medium">{initiative.kpi}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Advisory Response ────────────────────────────────────────────────────────

interface AdvisoryDiagnosisItem {
  text: string;
  deviation?: string;
  deviationDir?: "positive" | "negative" | "neutral";
}

interface AdvisoryInitiative {
  num: number;
  name: string;
  owner: string;
  objective: string;
  plazo?: string;
}

interface AdvisoryResponseData {
  diagnosisTitle?: string;
  diagnosisItems: AdvisoryDiagnosisItem[];
  insights: string[];
  initiatives: AdvisoryInitiative[];
  source?: "demo" | "real" | "fallback";
}

function AdvisoryResponseBlock({ data }: { data: AdvisoryResponseData }) {
  return (
    <div className="my-3 space-y-2.5">
      {/* Diagnóstico */}
      <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-surface">
          <span className="text-base">📊</span>
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">
            {data.diagnosisTitle ?? "Diagnóstico"}
          </span>
          {data.source === "demo" && (
            <span className="ml-auto text-[10px] text-text-muted bg-surface-soft border border-border rounded px-1.5 py-0.5">Demo CPG</span>
          )}
        </div>
        <div className="px-4 py-3 space-y-2">
          {data.diagnosisItems.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full mt-[7px] flex-shrink-0 bg-text-muted/50" />
              <div className="flex-1 min-w-0 flex items-baseline gap-2 flex-wrap">
                <span className="text-sm text-text-secondary leading-relaxed">{item.text}</span>
                {item.deviation && (
                  <span className={cn(
                    "text-xs font-semibold whitespace-nowrap flex-shrink-0",
                    item.deviationDir === "negative" && "text-danger",
                    item.deviationDir === "positive" && "text-success",
                    item.deviationDir === "neutral" && "text-text-muted",
                    !item.deviationDir && "text-text-muted"
                  )}>
                    {item.deviation}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {data.insights.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden" style={{ background: "color-mix(in srgb, var(--color-surface-elevated) 60%, var(--color-surface-soft) 40%)" }}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60">
            <span className="text-base">🔍</span>
            <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Insights</span>
          </div>
          <div className="px-4 py-3 space-y-3">
            {data.insights.map((text, i) => (
              <p key={i} className="text-sm text-text-secondary leading-relaxed">{text}</p>
            ))}
          </div>
        </div>
      )}

      {/* Iniciativas */}
      {data.initiatives.length > 0 && (
        <div className="rounded-xl border border-primary/20 overflow-hidden" style={{ background: "color-mix(in srgb, var(--color-background) 85%, var(--color-primary) 15%)" }}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-primary/20">
            <span className="text-base">🎯</span>
            <span className="text-xs font-semibold text-primary-soft uppercase tracking-wider">Iniciativas Estratégicas</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-primary/15">
                  <th className="text-left px-3 py-2 font-semibold text-text-muted w-7">#</th>
                  <th className="text-left px-3 py-2 font-semibold text-text-muted">Iniciativa</th>
                  <th className="text-left px-3 py-2 font-semibold text-text-muted hidden sm:table-cell">Owner</th>
                  <th className="text-left px-3 py-2 font-semibold text-text-muted hidden md:table-cell">Objetivo</th>
                  <th className="text-left px-3 py-2 font-semibold text-text-muted hidden sm:table-cell whitespace-nowrap">Plazo</th>
                </tr>
              </thead>
              <tbody>
                {data.initiatives.map((init, i) => (
                  <tr key={i} className={cn("border-b border-primary/10 last:border-0", i % 2 === 0 ? "bg-transparent" : "bg-primary/4")}>
                    <td className="px-3 py-2.5 text-primary-soft font-bold">{init.num}</td>
                    <td className="px-3 py-2.5 text-text-primary font-medium leading-snug">{init.name}</td>
                    <td className="px-3 py-2.5 text-text-muted hidden sm:table-cell leading-snug">{init.owner}</td>
                    <td className="px-3 py-2.5 text-text-secondary hidden md:table-cell leading-snug">{init.objective}</td>
                    <td className="px-3 py-2.5 hidden sm:table-cell whitespace-nowrap">
                      {init.plazo && (
                        <span className="text-[11px] font-semibold text-accent bg-accent/10 border border-accent/25 rounded px-1.5 py-0.5">{init.plazo}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Mobile: show owner + objective + plazo inline */}
            <div className="sm:hidden px-3 pb-3 space-y-2 mt-1">
              {data.initiatives.map((init, i) => (
                <div key={i} className="text-[11px] text-text-muted">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-text-secondary">{init.name}</span>
                    {init.plazo && (
                      <span className="text-[10px] font-semibold text-accent bg-accent/10 border border-accent/25 rounded px-1 py-0.5">{init.plazo}</span>
                    )}
                  </div>
                  <div>{init.owner} — {init.objective}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Brief Proposal ───────────────────────────────────────────────────────────

interface BriefProposalData {
  problem: string;
  hypothesis: string;
  strategy: string;
  expectedOutcome: string;
}

function BriefProposal({ data }: { data: BriefProposalData }) {
  const sections: { label: string; icon: React.ElementType; text: string; color: string }[] = [
    { label: "Problema",           icon: AlertCircle,  text: data.problem,         color: "text-danger" },
    { label: "Hipótesis",          icon: Lightbulb,    text: data.hypothesis,      color: "text-warning" },
    { label: "Estrategia",         icon: Target,       text: data.strategy,        color: "text-primary-soft" },
    { label: "Resultado esperado", icon: CheckCircle,  text: data.expectedOutcome, color: "text-success" },
  ];
  return (
    <div className="my-3 rounded-lg border border-border bg-surface overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-surface-elevated">
        <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
          <BookOpen className="h-3 w-3 text-primary-soft" />
        </div>
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Propuesta de Brief</span>
      </div>
      <div className="divide-y divide-border/50">
        {sections.map(({ label, icon: Icon, text, color }) => (
          <div key={label} className="px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Icon className={cn("h-3.5 w-3.5 flex-shrink-0", color)} />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Action Buttons ───────────────────────────────────────────────────────────

const ACTION_ICONS: Record<string, React.ElementType> = {
  "create-plan":     ClipboardList,
  "open-ventas":     TrendingUp,
  "generate-deck":   Presentation,
  "create-goal":     Target,
  "add-insight":     Lightbulb,
  "complete-brief":  BookOpen,
};

const DONE_LABELS: Record<string, string> = {
  "create-plan":    "Plan creado",
  "create-goal":    "Objetivo creado",
  "add-insight":    "Insight creado",
  "generate-deck":  "Presentación preparada",
  "complete-brief": "Brief completado",
};

// Maps canonical action IDs to OutputActionType for the modal
const MODAL_TYPE_MAP: Partial<Record<string, OutputActionType>> = {
  "create-plan":    "plan",
  "create-goal":    "goal",
  "add-insight":    "insight",
  "generate-deck":  "presentation",
  "complete-brief": "brief",
};

interface ActionButtonsProps {
  actions: { id: string; label: string; action: string }[];
  blocks: MessageBlock[];
  onOpenPlan: () => void;
  onAction?: (action: string, blocks?: MessageBlock[]) => void;
  onCreateProjectPlan?: (blocks: MessageBlock[]) => void;
  onCompleteBrief?: (blocks: MessageBlock[]) => void;
  onNavigate?: (canonicalId: string) => void;
  projectName?: string;
}

function ActionButtons({ actions, blocks, onOpenPlan, onAction, onCreateProjectPlan, onCompleteBrief, onNavigate, projectName }: ActionButtonsProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [done, setDone] = useState<Set<string>>(new Set());
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const normalized = normalizeActions(actions).filter((a) => {
    if (a.canonicalId === "create-plan")    return canEditActionPlan(user);
    if (a.canonicalId === "generate-deck")  return canExportReports(user);
    if (a.canonicalId === "add-insight")    return canCreateInsight(user);
    if (a.canonicalId === "create-goal")    return canEditGoals(user);
    if (a.canonicalId === "complete-brief") return !!onCompleteBrief;
    return true;
  });

  // Estimate items count for the modal preview
  const estimatedItems = useMemo(() => {
    const get = (type: string) => (blocks.find((b) => b.type === type)?.data ?? {}) as Record<string, unknown>;
    switch (pendingAction) {
      case "create-plan":
        return ((get("recommendations").recommendations as unknown[])?.length ?? 0) +
               ((get("strategic-initiatives").initiatives as unknown[])?.length ?? 0) || undefined;
      case "create-goal":
        return (get("kpi-strip").kpis as unknown[])?.length || undefined;
      case "add-insight":
        return (get("insight-card").insights as unknown[])?.length || undefined;
      default:
        return undefined;
    }
  }, [pendingAction, blocks]);

  function handleClick(canonicalId: string) {
    if (done.has(canonicalId)) return;
    // Non-modal actions: navigate directly
    if (canonicalId === "open-ventas") { router.push(ROUTES.VENTAS); return; }
    // create-plan without project context: open existing global modal
    if (canonicalId === "create-plan" && !onCreateProjectPlan) {
      if (canEditActionPlan(user)) onOpenPlan();
      return;
    }
    // All other actions: open confirmation modal
    setPendingAction(canonicalId);
  }

  function handleModalConfirm() {
    if (!pendingAction) return;
    switch (pendingAction) {
      case "create-plan":    onCreateProjectPlan?.(blocks); break;
      case "create-goal":    onAction?.(pendingAction, blocks); break;
      case "add-insight":    onAction?.(pendingAction, blocks); break;
      case "generate-deck":  onAction?.(pendingAction, blocks); break;
      case "complete-brief": onCompleteBrief?.(blocks); break;
      default:               onAction?.(pendingAction, blocks);
    }
  }

  function handleModalSuccess() {
    if (pendingAction) setDone((s) => new Set(s).add(pendingAction));
    setPendingAction(null);
  }

  function handleModalNavigate() {
    if (pendingAction) {
      setDone((s) => new Set(s).add(pendingAction));
      onNavigate?.(pendingAction);
    }
    setPendingAction(null);
  }

  const modalType = pendingAction ? MODAL_TYPE_MAP[pendingAction] : undefined;

  if (normalized.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2 my-3">
        {normalized.map((a) => {
          const Icon = ACTION_ICONS[a.canonicalId] ?? ACTION_ICONS[a.action];
          const isDone = done.has(a.canonicalId);
          return (
            <button
              key={a.id}
              onClick={() => handleClick(a.canonicalId)}
              disabled={isDone}
              className={cn(
                "flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border transition-all",
                isDone
                  ? "border-success/30 bg-success/8 text-success cursor-default"
                  : "border-primary/30 text-primary-soft hover:bg-primary/10 hover:border-primary/50"
              )}
            >
              {isDone ? <Check className="h-3.5 w-3.5" /> : Icon && <Icon className="h-3.5 w-3.5" />}
              {isDone ? (DONE_LABELS[a.canonicalId] ?? a.label) : a.label}
            </button>
          );
        })}
      </div>

      {modalType && (
        <CreateOutputModal
          open={pendingAction !== null}
          actionType={modalType}
          projectName={projectName}
          estimatedItems={estimatedItems}
          onConfirm={handleModalConfirm}
          onClose={() => setPendingAction(null)}
          onSuccess={handleModalSuccess}
          onNavigate={onNavigate ? handleModalNavigate : undefined}
        />
      )}
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface MessageBlocksProps {
  blocks: MessageBlock[];
  onFollowUp?: (q: string) => void;
  onAction?: (action: string, blocks?: MessageBlock[]) => void;
  onCreateProjectPlan?: (blocks: MessageBlock[]) => void;
  onCompleteBrief?: (blocks: MessageBlock[]) => void;
  onNavigate?: (canonicalId: string) => void;
  projectName?: string;
}

export function MessageBlocks({ blocks, onFollowUp, onAction, onCreateProjectPlan, onCompleteBrief, onNavigate, projectName }: MessageBlocksProps) {
  const [planModal, setPlanModal] = useState(false);

  // Build context for plan creation from the response blocks
  const summary = blocks.find((b) => b.type === "executive-summary")?.data as { title?: string; summary?: string } | undefined;
  const recs = blocks.find((b) => b.type === "recommendations")?.data as { recommendations?: { title: string }[] } | undefined;
  const planContext = {
    name: summary?.title ?? "Plan de acción",
    objective: summary?.summary?.slice(0, 120) ?? "",
    items: recs?.recommendations?.slice(0, 4).map((r) => r.title) ?? [],
  };

  return (
    <div className="space-y-1">
      {blocks.map((block, i) => {
        const data = block.data as Record<string, unknown>;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.2 }}
          >
            {block.type === "executive-summary" && (
              <ExecutiveSummary data={data as Parameters<typeof ExecutiveSummary>[0]["data"]} />
            )}
            {block.type === "kpi-strip" && (
              <KpiStrip kpis={data.kpis as Parameters<typeof KpiStrip>[0]["kpis"]} />
            )}
            {block.type === "insight-card" && (
              <InsightCards insights={data.insights as Parameters<typeof InsightCards>[0]["insights"]} />
            )}
            {block.type === "chart" && (
              <div className="rounded-lg border border-border overflow-hidden my-3">
                <div className="px-4 pt-3 pb-1">
                  <div className="text-xs font-medium text-text-secondary">{String(data.title)}</div>
                </div>
                <SellInSellOutChart />
              </div>
            )}
            {block.type === "recommendations" && (
              <Recommendations recommendations={data.recommendations as Parameters<typeof Recommendations>[0]["recommendations"]} />
            )}
            {block.type === "action-plan" && (
              <ActionButtons
                actions={data.actions as { id: string; label: string; action: string }[]}
                blocks={blocks}
                onOpenPlan={() => setPlanModal(true)}
                onAction={onAction}
                onCreateProjectPlan={onCreateProjectPlan}
                onCompleteBrief={onCompleteBrief}
                onNavigate={onNavigate}
                projectName={projectName}
              />
            )}
            {block.type === "brief-proposal" && (
              <BriefProposal data={block.data as unknown as BriefProposalData} />
            )}
            {block.type === "follow-up-questions" && (
              <FollowUpChips questions={data.questions as string[]} onAsk={onFollowUp} />
            )}
            {block.type === "diagnostic-summary" && (
              <DiagnosticSummary data={data as Parameters<typeof DiagnosticSummary>[0]["data"]} />
            )}
            {block.type === "cross-insights" && (
              <CrossInsights data={data as Parameters<typeof CrossInsights>[0]["data"]} />
            )}
            {block.type === "strategic-initiatives" && (
              <StrategicInitiatives data={data as Parameters<typeof StrategicInitiatives>[0]["data"]} />
            )}
            {block.type === "advisory-response" && (
              <AdvisoryResponseBlock data={block.data as unknown as AdvisoryResponseData} />
            )}
          </motion.div>
        );
      })}

      <AnimatePresence>
        {planModal && (
          <CreatePlanModal
            context={planContext}
            onClose={() => setPlanModal(false)}
            onCreated={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

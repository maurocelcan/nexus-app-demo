"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, AlertTriangle, Lightbulb, TrendingUp, TrendingDown,
  Minus, FileSpreadsheet, FileText, Presentation, CheckCircle2,
  Circle, Clock, User, Calendar, Target, Folder,
  MessageSquarePlus, BarChart3, ClipboardList, Files, LayoutDashboard,
  Sparkles, Flag, Users,
  Plus, Pencil, Trash2, X, Save, Paperclip, Eye,
  ChevronLeft, ChevronRight, ChevronDown, FileDown, Handshake, Building2,
  Share2, Copy, Check, Loader2, Bot, Send,
} from "lucide-react";
import { useChatStore } from "@/stores/chat-store";
import { useAuthStore } from "@/stores/auth-store";
import { useActionPlanStore } from "@/stores/action-plan-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageItem } from "@/components/chat/message-item";
import { AgentThinking } from "@/components/chat/agent-thinking";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Dropdown } from "@/components/ui/dropdown";
import { Tooltip } from "@/components/ui/tooltip";
import { UserSelect, UserMultiSelect } from "@/components/ui/user-select";
import { ConversationAreaBadge } from "@/components/ui/area-badge";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { sleep, generateId } from "@/lib/utils";
import {
  AGENT_STEPS,
  generateProjectStructuredResponse,
} from "@/data/mock-conversations";
import { resolveDemoResponse } from "@/lib/demo-chat-resolver";
import { getAreaDisplayName } from "@/data/conversation-prompts";
import { SELL_THROUGH_BASE_KPIS, SELL_THROUGH_PDVS } from "@/data/mock-sell-through";
import { useDataSourceStore, hasAnyDataSource, getActiveDataset } from "@/stores/data-source-store";
import type { ProcessedDataset, SalesKpis } from "@/types/dataset";
import type { Project, ProjectGoal, ProjectInsight, ProjectKpi, ProjectNextStep, ProjectFile, ProjectTimelineEvent, Conversation, ProjectPriority, ActionPlanPriority } from "@/types/analytics";
import type { Message, MessageBlock } from "@/types/chat";
import type { ChatAttachment, ChatInputHandle } from "@/components/chat/chat-input";
import {
  canCreateChat,
  canSendChatMessage,
  canEditProject,
  canEditGoals,
  canCreateInsight,
  canEditInsights,
  canEditActionPlan,
  canManageProjectFiles,
} from "@/lib/permissions";

// ─── Helpers ───────────────────────────────────────────────────────────────────

type TabId = "resumen" | "chat" | "kpis" | "plan" | "insights" | "objetivos" | "timeline" | "archivos";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "chat", label: "Chat", icon: MessageSquarePlus },
  { id: "kpis", label: "KPIs", icon: BarChart3 },
  { id: "plan", label: "Plan de acción", icon: ClipboardList },
  { id: "insights", label: "Insights", icon: Lightbulb },
  { id: "objetivos", label: "Objetivos", icon: Target },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "archivos", label: "Archivos", icon: Files },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "Activo", color: "text-accent", dot: "bg-accent" },
  monitoring: { label: "Monitoreo", color: "text-warning", dot: "bg-warning" },
  "at-risk": { label: "En riesgo", color: "text-danger", dot: "bg-danger" },
  completed: { label: "Completado", color: "text-success", dot: "bg-success" },
  paused: { label: "Pausado", color: "text-text-muted", dot: "bg-text-muted" },
  archived: { label: "Archivado", color: "text-text-muted", dot: "bg-text-muted" },
};

const PRIORITY_CONFIG = {
  critical: { label: "Crítica", className: "text-danger bg-danger/20 border-danger/60 font-semibold" },
  high: { label: "Alta", className: "text-danger bg-danger/10 border-danger/25" },
  medium: { label: "Media", className: "text-warning bg-warning/10 border-warning/25" },
  low: { label: "Baja", className: "text-text-muted bg-surface-soft border-border" },
};

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  high: { color: "text-danger", bg: "bg-danger/10 border-danger/25", label: "Alto" },
  medium: { color: "text-warning", bg: "bg-warning/10 border-warning/25", label: "Medio" },
  low: { color: "text-text-muted", bg: "bg-surface-soft border-border", label: "Bajo" },
};

const IMPACT_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  high: { color: "text-accent", bg: "bg-accent/10 border-accent/25", label: "Alto" },
  medium: { color: "text-primary-soft", bg: "bg-primary/10 border-primary/25", label: "Medio" },
  low: { color: "text-text-muted", bg: "bg-surface-soft border-border", label: "Bajo" },
};

const FILE_ICONS: Record<string, React.ElementType> = {
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  pdf: FileText,
  ppt: Presentation,
  doc: FileText,
};

function ChangeChip({ change, changeType }: { change?: number; changeType?: string }) {
  if (change === undefined || change === 0) return null;
  const isPos = changeType === "positive";
  const isNeg = changeType === "negative";
  const Icon = isPos ? TrendingUp : isNeg ? TrendingDown : Minus;
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 text-[10px] font-medium rounded-full px-1.5 py-0.5",
      isPos ? "text-success bg-success/10" : isNeg ? "text-danger bg-danger/10" : "text-text-muted bg-surface-soft"
    )}>
      <Icon className="h-2.5 w-2.5" />
      {change > 0 ? "+" : ""}{change}%
    </span>
  );
}

function OriginBadge({ source }: { source: "ia" | "manual" | "kpi" | "chat" }) {
  const configs = {
    ia:     { label: "IA",     cls: "text-primary-soft bg-primary/10 border-primary/20" },
    manual: { label: "Manual", cls: "text-text-muted bg-surface-soft border-border" },
    kpi:    { label: "KPI",    cls: "text-accent bg-accent/10 border-accent/20" },
    chat:   { label: "Chat",   cls: "text-warning bg-warning/10 border-warning/20" },
  } as const;
  const cfg = configs[source];
  return (
    <span className={cn("text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full border", cfg.cls)}>
      {cfg.label}
    </span>
  );
}

function fmtNumber(value: number): string {
  return value.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

function fmtMoney(value: number): string {
  return value >= 1_000_000 ? `USD ${(value / 1_000_000).toFixed(1)}M` : `USD ${Math.round(value / 1000)}K`;
}

function projectKpisFromSales(kpis: SalesKpis): ProjectKpi[] {
  const rows: ProjectKpi[] = [];
  if (kpis.sellInYtd !== undefined) rows.push({ label: "Sell-in", value: `${fmtNumber(kpis.sellInYtd)} cajas`, change: kpis.sellInVarPct, changeType: kpis.sellInVarPct === undefined ? "neutral" : kpis.sellInVarPct >= 0 ? "positive" : "negative" });
  if (kpis.sellOutYtd !== undefined) rows.push({ label: "Sell-out", value: `${fmtNumber(kpis.sellOutYtd)} cajas`, change: kpis.sellOutVarPct, changeType: kpis.sellOutVarPct === undefined ? "neutral" : kpis.sellOutVarPct >= 0 ? "positive" : "negative" });
  const passthrough = kpis.passthrough ?? (kpis.sellInYtd && kpis.sellOutYtd ? kpis.sellOutYtd / kpis.sellInYtd : undefined);
  if (passthrough !== undefined) rows.push({ label: "Passthrough", value: `${Math.round(passthrough * 1000) / 10}%`, change: kpis.passthroughVarPct, changeType: passthrough >= 0.8 ? "positive" : "negative" });
  if (kpis.netRevenueYtd !== undefined) rows.push({ label: "Net Revenue", value: fmtMoney(kpis.netRevenueYtd), change: kpis.netRevenueVarPct, changeType: kpis.netRevenueVarPct === undefined ? "neutral" : kpis.netRevenueVarPct >= 0 ? "positive" : "negative" });
  if (kpis.ebitdaYtd !== undefined) rows.push({ label: "EBITDA", value: fmtMoney(kpis.ebitdaYtd), change: kpis.ebitdaVarPct, changeType: kpis.ebitdaVarPct === undefined ? "neutral" : kpis.ebitdaVarPct >= 0 ? "positive" : "negative" });
  if (kpis.priceIndexAvg !== undefined) rows.push({ label: "Price Index", value: kpis.priceIndexAvg.toFixed(2), change: kpis.priceIndexVarPct, changeType: kpis.priceIndexVarPct === undefined ? "neutral" : kpis.priceIndexVarPct >= 0 ? "positive" : "negative" });
  return rows;
}

function projectKpisFromSellThrough(): ProjectKpi[] {
  const opportunity = SELL_THROUGH_PDVS.reduce((acc, pdv) => acc + pdv.opportunity, 0);
  return [
    { label: "ST Revenue", value: fmtMoney(SELL_THROUGH_BASE_KPIS.netRevenue), change: 8.4, changeType: "positive" },
    { label: "ST Volumen", value: `${fmtNumber(SELL_THROUGH_BASE_KPIS.volume)} cajas`, change: 5.7, changeType: "positive" },
    { label: "Distribución numérica", value: `${SELL_THROUGH_BASE_KPIS.numericDistribution}%`, change: 4, changeType: "positive", unit: "%" },
    { label: "Clientes compradores", value: fmtNumber(SELL_THROUGH_BASE_KPIS.buyerCustomers), change: 6.2, changeType: "positive" },
    { label: "Mix real / objetivo", value: `${SELL_THROUGH_BASE_KPIS.mixReal}% / ${SELL_THROUGH_BASE_KPIS.mixTarget}%`, change: SELL_THROUGH_BASE_KPIS.mixReal - SELL_THROUGH_BASE_KPIS.mixTarget, changeType: "negative" },
    { label: "Oportunidad PDV", value: fmtMoney(opportunity), change: 12.1, changeType: "positive" },
  ];
}

function hasProjectArea(project: Project, area: string) {
  const normalizedLinkedAreas = (project.linkedAreas ?? []).map((item) => normalizeProjectArea(item) ?? item);
  if (normalizedLinkedAreas.length > 0) return normalizedLinkedAreas.includes(area);
  return normalizeProjectArea(project.area) === area;
}

function mergeProjectKpis(...groups: ProjectKpi[][]) {
  const seen = new Set<string>();
  return groups.flat().filter((kpi) => {
    const key = kpi.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildDeckName(p: Project): string {
  const slug = p.name
    .replace(/[—–]/g, " ")
    .split(/\s+/)
    .slice(0, 5)
    .join("_")
    .replace(/[^\w_]/g, "")
    .replace(/_+/g, "_");
  return `Presentación_${slug || p.id}.pptx`;
}

function findGeneratedDeck(project: Project): ProjectFile | undefined {
  const expectedName = buildDeckName(project);
  return (project.files ?? []).find((file) => file.source === "generated" && file.type === "ppt" && file.name === expectedName)
    ?? (project.files ?? []).find((file) => file.source === "generated" && file.type === "ppt");
}

function isDemoCpgProject(project: Project, hasDemoLoaded: boolean): boolean {
  if (!hasDemoLoaded) return false;
  if (project.tags?.includes("dataset-real")) return false;
  return Boolean(
    project.id.startsWith("proj-00") ||
    (project.linkedDataSources ?? []).some((source) => ["ventas", "sell-through"].includes(source)) ||
    (project.tags ?? []).some((tag) => ["Canal Moderno", "Sell-out", "Sell-Through", "PDVs"].includes(tag))
  );
}

function hasPresentationContext(project: Project, conversations: Conversation[]): boolean {
  const associatedConversations = conversations.filter((conversation) => conversation.projectId === project.id && conversation.status === "active");
  return Boolean(
    associatedConversations.length > 0 ||
    project.insights?.length ||
    project.goals?.length ||
    project.kpis?.length ||
    project.nextSteps?.length ||
    project.brief ||
    project.objective?.trim()
  );
}

function buildDerivedProject(project: Project, conversations: Conversation[], processedDataset: ProcessedDataset | null, hasDemoLoaded: boolean): Project {
  const projectConversations = conversations.filter((conversation) => conversation.projectId === project.id && conversation.status === "active");
  const hasVentasSource = (project.linkedDataSources ?? []).includes("ventas") || hasProjectArea(project, "Ventas");
  const hasSellThroughSource = (project.linkedDataSources ?? []).includes("sell-through") || hasProjectArea(project, "Sell-Through");
  const sourceKpis = mergeProjectKpis(
    hasVentasSource && processedDataset ? projectKpisFromSales(processedDataset.salesKpis) : [],
    hasSellThroughSource && hasDemoLoaded ? projectKpisFromSellThrough() : []
  );

  const risks = project.risks?.length
    ? project.risks
    : [];

  const opportunities = project.opportunities?.length
    ? project.opportunities
    : [];

  const nextSteps = project.nextSteps?.length
    ? project.nextSteps
    : [];
  const linkedAreas = project.linkedAreas ?? (project.area ? [project.area] : []);
  const goals: ProjectGoal[] = project.goals?.length
    ? project.goals
    : [];
  const insights: ProjectInsight[] = project.insights?.length
    ? project.insights
    : [];
  const timelineEvents: ProjectTimelineEvent[] = project.timelineEvents?.length
    ? project.timelineEvents
    : [
        ...projectConversations.slice(0, 4).map((conversation) => ({
          id: `tl-${conversation.id}`,
          type: "conversation" as const,
          title: conversation.title,
          description: `${conversation.messageCount} mensajes asociados al proyecto.`,
          date: conversation.updatedAt,
          source: "Chat",
        })),
        ...(project.files ?? []).slice(0, 4).map((file) => ({
          id: `tl-${file.id}`,
          type: "file" as const,
          title: file.name,
          description: `${file.type.toUpperCase()} agregado por ${file.uploadedBy}.`,
          date: file.uploadedAt,
          source: file.source ?? "Archivo",
        })),
        ...nextSteps.filter((step) => step.done).slice(0, 3).map((step) => ({
          id: `tl-${step.id}`,
          type: "action" as const,
          title: step.label,
          description: step.owner ? `Completado por ${step.owner}.` : "Acción completada.",
          date: step.dueDate ?? project.updatedAt,
          source: "Plan de acción",
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    ...project,
    description: project.description,
    linkedAreas,
    priority: project.priority ?? "medium",
    progress: project.progress ?? (nextSteps.length > 0 ? Math.round((nextSteps.filter((step) => step.done).length / nextSteps.length) * 100) : undefined),
    startDate: project.startDate,
    dueDate: project.dueDate,
    conversationCount: projectConversations.length || project.conversationCount,
    brief: project.brief,
    kpis: sourceKpis,
    risks,
    opportunities,
    nextSteps,
    files: project.files ?? [],
    goals,
    insights,
    timelineEvents,
  };
}

// ─── Edit Project Modal ────────────────────────────────────────────────────────

const PROJECT_AREAS = [
  { value: "Ventas", label: "Ventas", aliases: ["ventas"] },
  { value: "Sell-Through", label: "Sell-Through", aliases: ["sell-through", "Sell Through", "Clientes & PDVs"] },
  { value: "Trade Marketing", label: "Trade Marketing", aliases: ["trade-marketing"] },
  { value: "RGM", label: "RGM", aliases: ["rgm"] },
  { value: "Finanzas", label: "Finanzas", aliases: ["finanzas"] },
  { value: "Supply Chain", label: "Supply Chain", aliases: ["supply", "supply-chain"] },
  { value: "Planning", label: "Planning", aliases: ["planning"] },
  { value: "Marketing", label: "Marketing", aliases: ["marketing"] },
];

function normalizeProjectArea(area?: string) {
  if (!area) return undefined;
  const match = PROJECT_AREAS.find((item) => item.value === area || item.aliases.includes(area));
  return match?.value ?? area;
}
const STATUS_OPTIONS = [
  { value: "active", label: "Activo" },
  { value: "monitoring", label: "Monitoreo" },
  { value: "at-risk", label: "En riesgo" },
  { value: "completed", label: "Completado" },
  { value: "paused", label: "Pausado" },
];

function EditProjectModal({ project, onSave, onClose, initialSection = "info" }: { project: Project; onSave: (patch: Partial<Project>) => void; onClose: () => void; initialSection?: "info" | "brief" }) {
  const workspaceMembers = useWorkspaceStore((state) => state.members);
  const activeMembers = workspaceMembers.filter((member) => member.status === "active");
  const [section, setSection] = useState<"info" | "brief">(initialSection);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [status, setStatus] = useState(project.status);
  const [priority, setPriority] = useState<ProjectPriority>(project.priority ?? "medium");
  const [progress, setProgress] = useState(String(project.progress ?? 0));
  const [dueDate, setDueDate] = useState(project.dueDate ?? "");
  const [startDate, setStartDate] = useState(project.startDate ?? "");
  const [owner, setOwner] = useState(project.owner ?? "");
  const [objective, setObjective] = useState(project.objective ?? "");
  const initialAreas = Array.from(new Set([
    ...(project.linkedAreas ?? []).map((area) => normalizeProjectArea(area) ?? area),
    normalizeProjectArea(project.area),
  ].filter(Boolean) as string[]));
  const [linkedAreas, setLinkedAreas] = useState<string[]>(initialAreas);
  const [contributors, setContributors] = useState<string[]>(project.contributors ?? []);
  const [brief, setBrief] = useState({
    problem: project.brief?.problem ?? "",
    hypothesis: project.brief?.hypothesis ?? "",
    strategy: project.brief?.strategy ?? "",
    expectedOutcome: project.brief?.expectedOutcome ?? "",
  });

  function handleSave() {
    onSave({
      name: name.trim() || project.name,
      description: description.trim() || undefined,
      status: status as Project["status"],
      priority,
      progress: Math.min(100, Math.max(0, Number(progress) || 0)),
      dueDate: dueDate || undefined,
      startDate: startDate || undefined,
      owner: owner.trim() || undefined,
      objective: objective.trim() || undefined,
      linkedAreas: linkedAreas.length > 0 ? linkedAreas : undefined,
      contributors: contributors.length > 0 ? contributors : undefined,
      brief,
    });
    onClose();
  }

  function toggleArea(area: string) {
    setLinkedAreas((prev) => prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]);
  }

  function toggleContributor(memberName: string) {
    setContributors((prev) => prev.includes(memberName) ? prev.filter((name) => name !== memberName) : [...prev, memberName]);
  }

  return (
    <Modal open onClose={onClose} title="Editar proyecto" size="xl">
      {/* Section nav */}
      <div className="flex gap-1 border-b border-border pb-3 mb-5">
        {[{ id: "info", label: "Información" }, { id: "brief", label: "Project Brief" }].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setSection(sec.id as "info" | "brief")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              section === sec.id ? "bg-primary/10 text-primary-soft border border-primary/25" : "text-text-muted hover:text-text-secondary"
            )}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {section === "info" && (
        <div className="space-y-4">
          <Field label="Nombre del proyecto" value={name} onChange={setName} />
          <TextAreaField label="Descripción" value={description} onChange={setDescription} placeholder="Describí el alcance y contexto de este proyecto" />
          <TextAreaField label="Objetivo principal" value={objective} onChange={setObjective} placeholder="¿Qué busca lograr este proyecto?" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Estado" value={status} onChange={(e) => setStatus(e.target.value as Project["status"])} options={STATUS_OPTIONS} />
            <Select label="Prioridad" value={priority} onChange={(e) => setPriority(e.target.value as ProjectPriority)} options={[{ value: "low", label: "Baja" }, { value: "medium", label: "Media" }, { value: "high", label: "Alta" }, { value: "critical", label: "Crítica" }]} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Progreso %" type="number" value={progress} onChange={setProgress} placeholder="0–100" />
            <Field label="Fecha de inicio" type="date" value={startDate} onChange={setStartDate} />
            <Field label="Deadline" type="date" value={dueDate} onChange={setDueDate} />
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <UserSelect
              label="Owner"
              members={activeMembers}
              value={owner}
              onChange={setOwner}
              placeholder="Sin asignar"
            />
            <UserMultiSelect
              label="Equipo"
              members={activeMembers}
              value={contributors}
              onChange={setContributors}
              placeholder="Agregar miembros al equipo..."
            />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wide text-text-muted font-medium block mb-2">Áreas involucradas</span>
            <div className="flex flex-wrap gap-2">
              {PROJECT_AREAS.map((area) => (
                <button
                  key={area.value}
                  type="button"
                  onClick={() => toggleArea(area.value)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border transition-colors",
                    linkedAreas.includes(area.value)
                      ? "border-primary/40 bg-primary/10 text-primary-soft"
                      : "border-border text-text-muted hover:border-primary/25 hover:text-text-secondary"
                  )}
                >
                  {area.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === "brief" && (
        <div className="space-y-4">
          <p className="text-xs text-text-muted leading-relaxed">El brief define el contexto estratégico del proyecto. Puede editarse manualmente o generarse con IA.</p>
          <TextAreaField label="Problema" value={brief.problem} onChange={(problem) => setBrief((b) => ({ ...b, problem }))} placeholder="¿Cuál es el problema central que aborda este proyecto?" />
          <TextAreaField label="Hipótesis" value={brief.hypothesis} onChange={(hypothesis) => setBrief((b) => ({ ...b, hypothesis }))} placeholder="¿Qué creemos que va a funcionar y por qué?" />
          <TextAreaField label="Estrategia" value={brief.strategy} onChange={(strategy) => setBrief((b) => ({ ...b, strategy }))} placeholder="¿Cómo vamos a abordarlo?" />
          <TextAreaField label="Resultado esperado" value={brief.expectedOutcome} onChange={(expectedOutcome) => setBrief((b) => ({ ...b, expectedOutcome }))} placeholder="¿Qué queremos lograr al finalizar el proyecto?" />
        </div>
      )}

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
        <Button variant="ghost" onClick={onClose}><X className="h-3.5 w-3.5" />Cancelar</Button>
        <Button variant="primary" onClick={handleSave}><Save className="h-3.5 w-3.5" />Guardar cambios</Button>
      </div>
    </Modal>
  );
}

// ─── Tab components ────────────────────────────────────────────────────────────

type ProjectUpdater = (patch: Partial<Project>) => void;

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-wide text-text-muted font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-md border border-border bg-surface-elevated px-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-wide text-text-muted font-medium">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 resize-none"
      />
    </label>
  );
}

const EMPTY_MESSAGES: import("@/types/chat").Message[] = [];

const CONTEXT_PLACEHOLDERS: Record<string, string> = {
  resumen: "Preguntá sobre el resumen del proyecto...",
  kpis: "Preguntá sobre los KPIs del proyecto...",
  plan: "Preguntá sobre el plan de acción...",
  insights: "Preguntá sobre los insights detectados...",
  objetivos: "Preguntá sobre objetivos, owners o avances...",
  timeline: "Preguntá sobre la evolución del proyecto...",
  archivos: "Preguntá sobre archivos o reportes del proyecto...",
};


function AskNexusButton({ onAskNexus, context }: { onAskNexus: (context: string) => void; context: string }) {
  return (
    <button
      onClick={() => onAskNexus(context)}
      className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary-soft hover:border-primary/60 hover:bg-primary/10 hover:text-primary transition-colors"
    >
      <Sparkles className="h-3.5 w-3.5" />
      Preguntar a Nexus
    </button>
  );
}

function ResumenTab({
  project,
  conversations,
  onEditBrief,
  onPreparePresentation,
  canPreparePresentation,
  presentationDisabledReason,
  onAskNexus,
}: {
  project: Project;
  conversations: Conversation[];
  onEditBrief?: () => void;
  onPreparePresentation: () => void;
  canPreparePresentation: boolean;
  presentationDisabledReason?: string;
  onAskNexus?: (context: string) => void;
}) {
  const kpis = project.kpis ?? [];
  const risks = project.risks ?? [];
  const opps = project.opportunities ?? [];
  const nextSteps = (project.nextSteps ?? []).filter((s) => !s.done);
  const recentConversations = conversations
    .filter((conversation) => conversation.projectId === project.id && conversation.status === "active")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const briefEntries = [
    ["Problema", project.brief?.problem],
    ["Hipótesis", project.brief?.hypothesis],
    ["Estrategia", project.brief?.strategy],
    ["Resultado esperado", project.brief?.expectedOutcome],
  ].filter(([, v]) => v && String(v).trim().length > 0);

  return (
    <div className="space-y-6">
      {onAskNexus && (
        <div className="flex justify-end">
          <AskNexusButton onAskNexus={onAskNexus} context="resumen" />
        </div>
      )}
      <div className="rounded-xl border border-border bg-surface-elevated p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text-primary">Presentación ejecutiva</h3>
            <p className="mt-1 text-xs text-text-muted">
              {findGeneratedDeck(project) ? "Hay una presentación generada para este proyecto." : "Prepará un deck con brief, KPIs, insights, objetivos y próximos pasos."}
            </p>
          </div>
          {canPreparePresentation ? (
            <Button variant="primary" size="sm" onClick={onPreparePresentation}>
              <Presentation className="h-3.5 w-3.5" />
              {findGeneratedDeck(project) ? "Abrir presentación" : "Generar presentación"}
            </Button>
          ) : (
            <Tooltip content={presentationDisabledReason ?? "Agregá conversaciones o análisis al proyecto para generar una presentación."} maxWidth={280}>
              <span className="inline-flex">
                <Button variant="secondary" size="sm" disabled>
                  <Presentation className="h-3.5 w-3.5" />
                  Generar presentación
                </Button>
              </span>
            </Tooltip>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] uppercase tracking-wider text-text-muted font-medium">Project Brief</h3>
          {onEditBrief && (
            <button onClick={onEditBrief} className="flex items-center gap-1 text-[11px] text-text-muted hover:text-primary-soft transition-colors">
              <Pencil className="h-3 w-3" />
              Editar
            </button>
          )}
        </div>
        {briefEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {briefEntries.map(([label, value]) => (
              <div key={String(label)} className="bg-surface-elevated border border-border rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wide text-text-muted font-medium mb-1.5">{label}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{String(value)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-surface-elevated p-6 text-center">
            <p className="text-xs text-text-muted mb-2">Sin brief definido para este proyecto</p>
            {onEditBrief && (
              <button onClick={onEditBrief} className="text-xs text-primary-soft hover:text-primary transition-colors">
                + Completar brief
              </button>
            )}
          </div>
        )}
      </div>


      {/* KPI strip */}
      {kpis.length > 0 && (
        <div>
          <h3 className="text-[11px] uppercase tracking-wider text-text-muted font-medium mb-3">Métricas clave</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {kpis.map((kpi, i) => (
              <div key={i} className="bg-surface-elevated border border-border rounded-xl p-4">
                <p className="text-[11px] text-text-muted mb-1.5 leading-tight">{kpi.label}</p>
                <p className="text-lg font-semibold text-text-primary leading-tight">{kpi.value}</p>
                <div className="mt-1.5">
                  <ChangeChip change={kpi.change} changeType={kpi.changeType} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risks */}
        {risks.length > 0 && (
          <div>
            <h3 className="text-[11px] uppercase tracking-wider text-text-muted font-medium mb-3 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-danger" />
              Riesgos
            </h3>
            <div className="space-y-2">
              {risks.map((risk) => {
                const cfg = SEVERITY_CONFIG[risk.severity];
                return (
                  <div key={risk.id} className={cn("border rounded-xl p-3.5", cfg.bg)}>
                    <div className="flex items-start gap-2.5">
                      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full border mt-0.5 flex-shrink-0", cfg.bg, cfg.color)}>
                        {cfg.label}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-text-primary leading-snug">{risk.label}</p>
                        {risk.description && (
                          <p className="text-[11px] text-text-muted mt-1 leading-snug">{risk.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Opportunities */}
        {opps.length > 0 && (
          <div>
            <h3 className="text-[11px] uppercase tracking-wider text-text-muted font-medium mb-3 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-accent" />
              Oportunidades
            </h3>
            <div className="space-y-2">
              {opps.map((opp) => {
                const cfg = IMPACT_CONFIG[opp.impact];
                return (
                  <div key={opp.id} className={cn("border rounded-xl p-3.5", cfg.bg)}>
                    <div className="flex items-start gap-2.5">
                      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full border mt-0.5 flex-shrink-0", cfg.bg, cfg.color)}>
                        {cfg.label}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-text-primary leading-snug">{opp.label}</p>
                        {opp.description && (
                          <p className="text-[11px] text-text-muted mt-1 leading-snug">{opp.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Next steps preview */}
      {nextSteps.length > 0 && (
        <div>
          <h3 className="text-[11px] uppercase tracking-wider text-text-muted font-medium mb-3 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-text-muted" />
            Próximos pasos pendientes
          </h3>
          <div className="space-y-2">
            {nextSteps.map((step) => (
              <div key={step.id} className="flex items-center gap-3 bg-surface-elevated border border-border rounded-xl px-4 py-3">
                <Circle className="h-4 w-4 text-text-muted flex-shrink-0" />
                <span className="text-sm text-text-secondary flex-1 leading-snug">{step.label}</span>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {step.owner && (
                    <span className="text-[11px] text-text-muted hidden sm:inline">{step.owner}</span>
                  )}
                  {step.dueDate && (
                    <span className="text-[11px] text-text-muted">{new Date(step.dueDate).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentConversations.length > 0 && (
        <div>
          <h3 className="text-[11px] uppercase tracking-wider text-text-muted font-medium mb-3 flex items-center gap-1.5">
            <MessageSquarePlus className="h-3.5 w-3.5 text-primary-soft" />
            Actividad reciente
          </h3>
          <div className="space-y-2">
            {recentConversations.map((conversation) => (
              <div key={conversation.id} className="flex items-center gap-3 bg-surface-elevated border border-border rounded-xl px-4 py-3">
                <MessageSquarePlus className="h-4 w-4 text-primary-soft flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-primary truncate">{conversation.title}</p>
                  <p className="text-[11px] text-text-muted">
                    {conversation.messageCount} mensajes · {new Date(conversation.updatedAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <ConversationAreaBadge conversation={conversation} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KpisTab({ kpis, onAskNexus }: { kpis: ProjectKpi[]; onAskNexus?: (context: string) => void }) {
  if (kpis.length === 0) {
    return (
      <div className="space-y-4">
        {onAskNexus && (
          <div className="flex justify-end">
            <AskNexusButton onAskNexus={onAskNexus} context="kpis" />
          </div>
        )}
        <div className="text-center py-16 text-text-muted">
          <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Sin KPIs configurados para este proyecto</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {onAskNexus && (
        <div className="flex justify-end">
          <AskNexusButton onAskNexus={onAskNexus} context="kpis" />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-surface-elevated border border-border rounded-xl p-5">
            <p className="text-xs text-text-muted mb-2 leading-tight">{kpi.label}</p>
            <p className="text-2xl font-bold text-text-primary mb-2">{kpi.value}</p>
            <ChangeChip change={kpi.change} changeType={kpi.changeType} />
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightsTab({ project, onUpdate, canCreate, canEdit, onAskNexus }: { project: Project; onUpdate: ProjectUpdater; canCreate: boolean; canEdit: boolean; onAskNexus?: (context: string) => void }) {
  const insights = project.insights ?? [];
  const [editing, setEditing] = useState<ProjectInsight | null>(null);
  const [form, setForm] = useState<ProjectInsight | null>(null);

  function openForm(insight?: ProjectInsight) {
    if (insight ? !canEdit : !canCreate) return;
    const now = new Date().toISOString();
    const draft = insight ?? {
      id: `ins-${generateId()}`,
      title: "",
      description: "",
      severity: "medium" as const,
      impact: "medium" as const,
      area: project.linkedAreas?.[0] ?? project.area ?? "Ventas",
      recommendation: "",
      createdAt: now,
    };
    setEditing(insight ?? null);
    setForm(draft);
  }

  function saveInsight() {
    if (editing ? !canEdit : !canCreate) return;
    if (!form?.title.trim()) return;
    const next = editing
      ? insights.map((item) => (item.id === form.id ? form : item))
      : [form, ...insights];
    onUpdate({ insights: next });
    setForm(null);
    setEditing(null);
  }

  function deleteInsight(id: string) {
    if (!canEdit) return;
    onUpdate({ insights: insights.filter((item) => item.id !== id) });
  }

  function convertToAction(insight: ProjectInsight) {
    if (!canEdit) return;
    const action: ProjectNextStep = {
      id: `step-${generateId()}`,
      label: insight.recommendation || insight.title,
      description: insight.description,
      owner: project.owner ?? "Mauro Celani",
      dueDate: project.dueDate ?? new Date().toISOString().slice(0, 10),
      priority: insight.severity === "high" ? "high" : "medium",
      status: "pending",
      impact: insight.impact === "high" ? "Alto impacto estimado" : "Impacto medio estimado",
      area: insight.area,
      done: false,
    };
    onUpdate({ nextSteps: [action, ...(project.nextSteps ?? [])] });
  }

  if (insights.length === 0) {
    return (
      <div className="text-center py-16 text-text-muted">
        <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm mb-4">Sin insights detectados todavía</p>
        {canCreate && (
          <Button variant="primary" size="sm" onClick={() => openForm()}>
            <Plus className="h-3.5 w-3.5" />
            Crear insight
          </Button>
        )}
        {form && (
          <InsightModal form={form} setForm={setForm} onClose={() => setForm(null)} onSave={saveInsight} editing={Boolean(editing)} />
        )}
      </div>
    );
  }
  return (
    <>
      <div className="flex justify-end gap-2 mb-4">
        {onAskNexus && <AskNexusButton onAskNexus={onAskNexus} context="insights" />}
        {canCreate && (
          <Button variant="primary" size="sm" onClick={() => openForm()}>
            <Plus className="h-3.5 w-3.5" />
            Crear insight
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {insights.map((insight) => {
          const severity = SEVERITY_CONFIG[insight.severity];
          const impact = IMPACT_CONFIG[insight.impact];
          return (
            <div key={insight.id} className="rounded-xl border border-border bg-surface-elevated p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="text-sm font-semibold text-text-primary leading-snug">{insight.title}</p>
                  <p className="text-[11px] text-text-muted mt-1">{insight.area} · {new Date(insight.createdAt).toLocaleDateString("es-AR")}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <span className={cn("text-[10px] rounded-full border px-2 py-0.5", severity.bg, severity.color)}>{severity.label}</span>
                  <span className={cn("text-[10px] rounded-full border px-2 py-0.5", impact.bg, impact.color)}>{impact.label}</span>
                </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{insight.description}</p>
              <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-primary-soft font-medium mb-1">Recomendación</p>
                <p className="text-xs text-text-secondary leading-relaxed">{insight.recommendation}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2 mt-3">
                {canEdit && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => convertToAction(insight)}>Convertir en acción</Button>
                    <Button variant="ghost" size="sm" onClick={() => openForm(insight)}><Pencil className="h-3.5 w-3.5" />Editar</Button>
                    <Button variant="danger" size="sm" onClick={() => deleteInsight(insight.id)}><Trash2 className="h-3.5 w-3.5" />Eliminar</Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {form && (
        <InsightModal form={form} setForm={setForm} onClose={() => setForm(null)} onSave={saveInsight} editing={Boolean(editing)} />
      )}
    </>
  );
}

function InsightModal({
  form,
  setForm,
  onClose,
  onSave,
  editing,
}: {
  form: ProjectInsight;
  setForm: (value: ProjectInsight | null) => void;
  onClose: () => void;
  onSave: () => void;
  editing: boolean;
}) {
  return (
    <Modal open onClose={onClose} title={editing ? "Editar insight" : "Crear insight"} size="lg">
      <div className="space-y-4">
        <Field label="Título" value={form.title} onChange={(title) => setForm({ ...form, title })} />
        <TextAreaField label="Descripción" value={form.description} onChange={(description) => setForm({ ...form, description })} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Severidad" value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value as ProjectInsight["severity"] })} options={[{ value: "high", label: "Alta" }, { value: "medium", label: "Media" }, { value: "low", label: "Baja" }]} />
          <Select label="Impacto" value={form.impact} onChange={(event) => setForm({ ...form, impact: event.target.value as ProjectInsight["impact"] })} options={[{ value: "high", label: "Alto" }, { value: "medium", label: "Medio" }, { value: "low", label: "Bajo" }]} />
        </div>
        <Field label="Área" value={form.area} onChange={(area) => setForm({ ...form, area })} />
        <TextAreaField label="Recomendación" value={form.recommendation} onChange={(recommendation) => setForm({ ...form, recommendation })} />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}><X className="h-3.5 w-3.5" />Cancelar</Button>
          <Button variant="primary" onClick={onSave}><Save className="h-3.5 w-3.5" />Guardar</Button>
        </div>
      </div>
    </Modal>
  );
}

function GoalsTab({ project, onUpdate, canEdit, onCreatePlan, onAskNexus }: { project: Project; onUpdate: ProjectUpdater; canEdit: boolean; onCreatePlan?: (goalId: string) => void; onAskNexus?: (context: string) => void }) {
  const goals = project.goals ?? [];
  const { plans } = useActionPlanStore();
  const [editing, setEditing] = useState<ProjectGoal | null>(null);
  const [form, setForm] = useState<ProjectGoal | null>(null);

  function openForm(goal?: ProjectGoal) {
    if (!canEdit) return;
    const draft = goal ?? {
      id: `goal-${generateId()}`,
      name: "",
      description: "",
      kpi: "",
      currentValue: "",
      targetValue: "",
      unit: "%",
      progress: 0,
      dueDate: project.dueDate ?? new Date().toISOString().slice(0, 10),
      priority: "medium" as const,
      status: "in-progress" as const,
    };
    setEditing(goal ?? null);
    setForm(draft);
  }

  function saveGoal() {
    if (!canEdit) return;
    if (!form?.name.trim()) return;
    const next = editing ? goals.map((goal) => (goal.id === form.id ? form : goal)) : [form, ...goals];
    onUpdate({ goals: next });
    setForm(null);
    setEditing(null);
  }

  function updateGoal(goal: ProjectGoal) {
    if (!canEdit) return;
    onUpdate({ goals: goals.map((item) => (item.id === goal.id ? goal : item)) });
  }

  function deleteGoal(id: string) {
    if (!canEdit) return;
    onUpdate({ goals: goals.filter((goal) => goal.id !== id) });
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-16 text-text-muted">
        <Target className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm mb-4">Sin objetivos definidos</p>
        {canEdit ? (
          <Button variant="primary" size="sm" onClick={() => openForm()}>
            <Plus className="h-3.5 w-3.5" />
            Nuevo objetivo
          </Button>
        ) : (
          <p className="text-xs text-text-muted">Solo lectura: no podés crear objetivos oficiales.</p>
        )}
        {form && <GoalModal form={form} setForm={setForm} onClose={() => setForm(null)} onSave={saveGoal} editing={Boolean(editing)} />}
      </div>
    );
  }
  return (
    <>
      <div className="flex justify-end gap-2 mb-4">
        {onAskNexus && <AskNexusButton onAskNexus={onAskNexus} context="objetivos" />}
        {canEdit && (
          <Button variant="primary" size="sm" onClick={() => openForm()}>
            <Plus className="h-3.5 w-3.5" />
            Nuevo objetivo
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {goals.map((goal) => (
          <div key={goal.id} className="rounded-xl border border-border bg-surface-elevated p-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-text-primary">{goal.name}</p>
                  {goal.status && <span className="text-[10px] rounded-full border border-border bg-surface-soft px-2 py-0.5 text-text-muted">{goal.status === "completed" ? "Completado" : goal.status === "pending" ? "Pendiente" : "En progreso"}</span>}
                  {goal.priority && <span className={cn("text-[10px] rounded-full border px-2 py-0.5", PRIORITY_CONFIG[goal.priority].className)}>{PRIORITY_CONFIG[goal.priority].label}</span>}
                </div>
                <p className="text-[11px] text-text-muted mt-1">Actual: {goal.currentValue} · Objetivo: {goal.targetValue} {goal.unit ?? ""}</p>
                {goal.description && <p className="text-xs text-text-secondary mt-2 leading-relaxed">{goal.description}</p>}
              </div>
              <span className="text-xs text-text-muted">Deadline: {new Date(goal.dueDate).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
            <div className="h-2 rounded-full bg-surface-soft overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
              <div className="flex items-center gap-3">
                <p className="text-[11px] text-text-muted">{goal.progress}% completado</p>
                {(() => {
                  const linked = plans.filter((p) => p.projectId === project.id && p.goalId === goal.id);
                  return linked.length > 0 ? (
                    <span className="flex items-center gap-1 text-[11px] text-primary-soft">
                      <ClipboardList className="h-3 w-3" />
                      {linked.length} plan{linked.length > 1 ? "es" : ""} de acción
                    </span>
                  ) : null;
                })()}
              </div>
              <div className="flex gap-2 flex-wrap">
                {onCreatePlan && canEdit && (
                  <Button variant="ghost" size="sm" onClick={() => onCreatePlan(goal.id)}>
                    <Plus className="h-3.5 w-3.5" />
                    Crear plan
                  </Button>
                )}
                {canEdit && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => updateGoal({ ...goal, status: "in-progress", progress: Math.max(goal.progress, 1) })}>En progreso</Button>
                    <Button variant="ghost" size="sm" onClick={() => updateGoal({ ...goal, status: "completed", progress: 100 })}><CheckCircle2 className="h-3.5 w-3.5" />Completado</Button>
                    <Button variant="ghost" size="sm" onClick={() => openForm(goal)}><Pencil className="h-3.5 w-3.5" />Editar</Button>
                    <Button variant="danger" size="sm" onClick={() => deleteGoal(goal.id)}><Trash2 className="h-3.5 w-3.5" />Eliminar</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {form && <GoalModal form={form} setForm={setForm} onClose={() => setForm(null)} onSave={saveGoal} editing={Boolean(editing)} />}
    </>
  );
}

function GoalModal({ form, setForm, onClose, onSave, editing }: { form: ProjectGoal; setForm: (value: ProjectGoal | null) => void; onClose: () => void; onSave: () => void; editing: boolean }) {
  return (
    <Modal open onClose={onClose} title={editing ? "Editar objetivo" : "Nuevo objetivo"} size="lg">
      <div className="space-y-4">
        <Field label="Nombre" value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <TextAreaField label="Descripción" value={form.description ?? ""} onChange={(description) => setForm({ ...form, description })} />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="KPI asociado"
            value={form.kpi ?? ""}
            onChange={(event) => {
              const kpi = event.target.value;
              const unitMap: Record<string, string> = {
                "Sell-in": "cajas", "Sell-out": "cajas", "Passthrough": "%",
                "Net Revenue": "USD", "EBITDA": "USD", "Price Index": "puntos",
                "Distribución numérica": "%", "ROI Trade Spend": "%", "Stock remanente": "cajas",
              };
              setForm({ ...form, kpi, unit: unitMap[kpi] ?? form.unit ?? "%" });
            }}
            options={[
              { value: "", label: "Seleccioná un KPI" },
              { value: "Sell-in", label: "Sell-in" },
              { value: "Sell-out", label: "Sell-out" },
              { value: "Passthrough", label: "Passthrough" },
              { value: "Net Revenue", label: "Net Revenue" },
              { value: "EBITDA", label: "EBITDA" },
              { value: "Price Index", label: "Price Index" },
              { value: "Distribución numérica", label: "Distribución numérica" },
              { value: "ROI Trade Spend", label: "ROI Trade Spend" },
              { value: "Stock remanente", label: "Stock remanente" },
            ]}
          />
          <Select label="Unidad" value={form.unit ?? "%"} onChange={(event) => setForm({ ...form, unit: event.target.value })} options={["%", "cajas", "USD", "puntos", "pp"].map((value) => ({ value, label: value }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor actual" value={form.currentValue} onChange={(currentValue) => setForm({ ...form, currentValue })} />
          <Field label="Valor objetivo" value={form.targetValue} onChange={(targetValue) => setForm({ ...form, targetValue })} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Progreso" type="number" value={String(form.progress)} onChange={(progress) => setForm({ ...form, progress: Number(progress) })} />
          <Field label="Fecha límite" type="date" value={form.dueDate} onChange={(dueDate) => setForm({ ...form, dueDate })} />
          <Select label="Prioridad" value={form.priority ?? "medium"} onChange={(event) => setForm({ ...form, priority: event.target.value as ProjectGoal["priority"] })} options={[{ value: "high", label: "Alta" }, { value: "medium", label: "Media" }, { value: "low", label: "Baja" }]} />
        </div>
        <Select label="Estado" value={form.status ?? "in-progress"} onChange={(event) => setForm({ ...form, status: event.target.value as ProjectGoal["status"] })} options={[{ value: "pending", label: "Pendiente" }, { value: "in-progress", label: "En progreso" }, { value: "completed", label: "Completado" }]} />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}><X className="h-3.5 w-3.5" />Cancelar</Button>
          <Button variant="primary" onClick={onSave}><Save className="h-3.5 w-3.5" />Guardar</Button>
        </div>
      </div>
    </Modal>
  );
}

function TimelineTab({ events, onAskNexus }: { events: ProjectTimelineEvent[]; onAskNexus?: (context: string) => void }) {
  if (events.length === 0) {
    return (
      <div className="space-y-4">
        {onAskNexus && (
          <div className="flex justify-end">
            <AskNexusButton onAskNexus={onAskNexus} context="timeline" />
          </div>
        )}
        <div className="text-center py-16 text-text-muted">
          <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Sin actividad registrada</p>
        </div>
      </div>
    );
  }

  const sorted = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const iconByType: Record<ProjectTimelineEvent["type"], React.ElementType> = {
    conversation: MessageSquarePlus,
    file: Files,
    kpi: BarChart3,
    action: CheckCircle2,
    insight: Lightbulb,
  };

  const colorByType: Record<ProjectTimelineEvent["type"], string> = {
    conversation: "bg-primary/10 border-primary/20 text-primary-soft",
    file: "bg-accent/10 border-accent/20 text-accent",
    kpi: "bg-warning/10 border-warning/20 text-warning",
    action: "bg-success/10 border-success/20 text-success",
    insight: "bg-primary/10 border-primary/20 text-primary-soft",
  };

  return (
    <div className="space-y-4">
      {onAskNexus && (
        <div className="flex justify-end">
          <AskNexusButton onAskNexus={onAskNexus} context="timeline" />
        </div>
      )}
    <div className="relative pl-1">
      <div className="absolute left-[19px] top-5 bottom-5 w-px bg-border/50" />
      <div className="space-y-3">
        {sorted.map((event) => {
          const Icon = iconByType[event.type];
          const isAI = event.author?.type === "ai";
          return (
            <div key={event.id} className="flex gap-3 relative">
              <div className={cn("h-9 w-9 rounded-lg border flex items-center justify-center flex-shrink-0 z-10 bg-surface", colorByType[event.type])}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 rounded-xl border border-border bg-surface-elevated p-3.5 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-sm font-semibold text-text-primary leading-snug">{event.title}</p>
                  <span className="text-[11px] text-text-muted whitespace-nowrap flex-shrink-0">
                    {new Date(event.date).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                {event.description && (
                  <p className="text-xs text-text-secondary leading-relaxed mb-2">{event.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-1.5">
                  {event.author && (
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      isAI
                        ? "border-accent/25 bg-accent/10 text-accent"
                        : "border-border bg-surface-soft text-text-muted"
                    )}>
                      {isAI ? <Bot className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
                      {event.author.name}
                      {event.author.role && <span className="opacity-70">· {event.author.role}</span>}
                    </span>
                  )}
                  {event.area && (
                    <span className="inline-flex items-center rounded-full border border-border bg-surface-soft px-2 py-0.5 text-[10px] font-medium text-text-muted">
                      {event.area}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
}

// ─── Project-level plan create modal ──────────────────────────────────────────

interface ProjectPlanCreateModalProps {
  project: Project;
  initialGoalId?: string;
  editPlan?: import("@/types/analytics").ActionPlan;
  onUpdate?: (id: string, patch: Partial<import("@/types/analytics").ActionPlan>) => void;
  onClose: () => void;
}
function ProjectPlanCreateModal({ project, initialGoalId, editPlan, onUpdate, onClose }: ProjectPlanCreateModalProps) {
  const { user } = useAuthStore();
  const { createPlan } = useActionPlanStore();
  const goals = project.goals ?? [];
  const isEditing = Boolean(editPlan);
  const [name, setName] = useState(editPlan?.name ?? "");
  const [objective, setObjective] = useState(editPlan?.objective ?? "");
  const [goalId, setGoalId] = useState(editPlan?.goalId ?? initialGoalId ?? "");
  const [priority, setPriority] = useState<ActionPlanPriority>(editPlan?.priority ?? "high");
  const [targetDate, setTargetDate] = useState(editPlan?.targetDate?.slice(0, 10) ?? project.dueDate?.slice(0, 10) ?? "2026-09-30");
  const [items, setItems] = useState<{ id: string; label: string; done: boolean }[]>(editPlan?.items ?? []);
  const [newItem, setNewItem] = useState("");
  const [done, setDone] = useState(false);

  const selectedGoal = goals.find((g) => g.id === goalId);

  function addItem() {
    const t = newItem.trim();
    if (!t) return;
    setItems((p) => [...p, { id: generateId(), label: t, done: false }]);
    setNewItem("");
  }

  function handleCreate() {
    if (!canEditActionPlan(user)) return;
    if (!name.trim()) return;
    if (isEditing && editPlan && onUpdate) {
      onUpdate(editPlan.id, {
        name,
        objective: objective || (selectedGoal ? `Alcanzar ${selectedGoal.name}: ${selectedGoal.targetValue} ${selectedGoal.unit ?? ""}` : ""),
        priority,
        targetDate,
        items,
        goalId: goalId || undefined,
      });
    } else {
      createPlan({
        name,
        objective: objective || (selectedGoal ? `Alcanzar ${selectedGoal.name}: ${selectedGoal.targetValue} ${selectedGoal.unit ?? ""}` : ""),
        owner: user?.name ?? "Mauro Celani",
        priority,
        targetDate,
        insightOrigin: project.name,
        status: "active",
        items,
        projectId: project.id,
        goalId: goalId || undefined,
        area: project.area,
      });
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 bg-surface-elevated border border-border rounded-xl p-6 w-full max-w-sm text-center shadow-2xl">
          <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
          <p className="font-semibold text-text-primary mb-1">{isEditing ? "Plan actualizado" : "Plan creado"}</p>
          <p className="text-sm text-text-muted mb-4">{items.length} tareas · {selectedGoal ? `Objetivo: ${selectedGoal.name}` : "Sin objetivo asignado"}</p>
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">Cerrar</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 bg-surface-elevated border border-border rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{isEditing ? "Editar plan de acción" : "Nuevo plan de acción"}</h3>
            <p className="text-xs text-text-muted mt-0.5">Vinculá el plan a un objetivo del proyecto</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-3">
          {goals.length > 0 && (
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Objetivo del proyecto</label>
              <select value={goalId} onChange={(e) => setGoalId(e.target.value)}
                className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text-primary outline-none focus:border-primary">
                <option value="">Sin objetivo específico</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>{g.name} — target: {g.targetValue} {g.unit ?? ""}</option>
                ))}
              </select>
              {selectedGoal && (
                <p className="text-[11px] text-text-muted mt-1">Actual: {selectedGoal.currentValue} · {selectedGoal.progress}% progreso</p>
              )}
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">Nombre del plan *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ej. Activar rotación en canal moderno"
              className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text-primary outline-none focus:border-primary placeholder:text-text-muted" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">Objetivo del plan</label>
            <input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder={selectedGoal ? `Alcanzar ${selectedGoal.targetValue} en ${selectedGoal.name}` : "Describí qué querés lograr"}
              className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text-primary outline-none focus:border-primary placeholder:text-text-muted" />
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
              <label className="text-xs font-medium text-text-secondary block mb-1">Fecha límite</label>
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
                className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text-primary outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">Tareas ({items.length})</label>
            <div className="space-y-1.5 mb-2 max-h-32 overflow-y-auto">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-2 px-3 py-1.5 bg-surface-soft rounded-md">
                  <span className="flex-1 text-xs text-text-secondary">{it.label}</span>
                  <button onClick={() => setItems((p) => p.filter((i) => i.id !== it.id))} className="text-text-muted hover:text-danger transition-colors"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()}
                placeholder="Agregar tarea..."
                className="flex-1 text-xs bg-surface border border-border rounded-lg px-3 py-1.5 text-text-primary outline-none focus:border-primary placeholder:text-text-muted" />
              <button onClick={addItem} className="p-1.5 rounded-lg border border-border hover:border-primary/40 text-text-muted hover:text-primary transition-colors">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors">Cancelar</button>
          <button onClick={handleCreate} disabled={!name.trim()}
            className="px-4 py-1.5 text-xs font-medium bg-primary text-white rounded-md disabled:opacity-40 hover:bg-primary/90 transition-colors">
            {isEditing ? "Guardar cambios" : "Crear plan"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Plan tab ──────────────────────────────────────────────────────────────────

function PlanTab({ project, onUpdate, canEdit, externalCreateGoalId, externalCreateOpen, onExternalCreateHandled, onAskNexus }: {
  project: Project;
  onUpdate: ProjectUpdater;
  canEdit: boolean;
  externalCreateGoalId?: string;
  externalCreateOpen?: boolean;
  onExternalCreateHandled?: () => void;
  onAskNexus?: (context: string) => void;
}) {
  const steps = project.nextSteps ?? [];
  const { plans, toggleItem, updatePlanStatus, updatePlan, deletePlan } = useActionPlanStore();
  const linkedPlans = plans.filter((p) => p.projectId === project.id);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForGoalId, setCreateForGoalId] = useState<string | undefined>(undefined);
  const [editingPlan, setEditingPlan] = useState<typeof plans[0] | null>(null);

  useEffect(() => {
    if (externalCreateOpen) {
      const timer = window.setTimeout(() => {
        setCreateForGoalId(externalCreateGoalId);
        setCreateModalOpen(true);
        onExternalCreateHandled?.();
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [externalCreateOpen, externalCreateGoalId, onExternalCreateHandled]);
  const [editing, setEditing] = useState<ProjectNextStep | null>(null);
  const [form, setForm] = useState<ProjectNextStep | null>(null);

  const STATUS_PLAN_CFG: Record<string, { label: string; cls: string }> = {
    active:    { label: "En curso",   cls: "text-accent bg-accent/10 border-accent/25" },
    draft:     { label: "Borrador",   cls: "text-text-muted bg-surface-soft border-border" },
    completed: { label: "Completado", cls: "text-success bg-success/10 border-success/25" },
    blocked:   { label: "Bloqueado",  cls: "text-danger bg-danger/10 border-danger/25" },
  };
  const PRIORITY_PLAN_CFG: Record<string, { label: string; cls: string }> = {
    high:   { label: "Alta",  cls: "text-danger bg-danger/10 border-danger/25" },
    medium: { label: "Media", cls: "text-warning bg-warning/10 border-warning/25" },
    low:    { label: "Baja",  cls: "text-text-muted bg-surface-soft border-border" },
  };

  function openForm(step?: ProjectNextStep) {
    if (!canEdit) return;
    const draft = step ?? {
      id: `step-${generateId()}`,
      label: "",
      description: "",
      owner: project.owner ?? "Mauro Celani",
      dueDate: project.dueDate ?? new Date().toISOString().slice(0, 10),
      priority: "medium" as const,
      status: "pending" as const,
      impact: "",
      area: project.linkedAreas?.[0] ?? project.area ?? "Ventas",
      done: false,
    };
    setEditing(step ?? null);
    setForm(draft);
  }

  function saveStep() {
    if (!canEdit) return;
    if (!form?.label.trim()) return;
    const normalized = { ...form, done: form.status === "completed" || form.done };
    const next = editing ? steps.map((step) => (step.id === form.id ? normalized : step)) : [normalized, ...steps];
    onUpdate({ nextSteps: next });
    setForm(null);
    setEditing(null);
  }

  function updateStep(step: ProjectNextStep) {
    if (!canEdit) return;
    onUpdate({ nextSteps: steps.map((item) => (item.id === step.id ? step : item)) });
  }

  function deleteStep(id: string) {
    if (!canEdit) return;
    onUpdate({ nextSteps: steps.filter((step) => step.id !== id) });
  }

  const pendingSteps = steps.filter((s) => !s.done);
  const doneSteps = steps.filter((s) => s.done);

  return (
    <div className="space-y-6">
      {onAskNexus && (
        <div className="flex justify-end">
          <AskNexusButton onAskNexus={onAskNexus} context="plan" />
        </div>
      )}
      {/* Action plans section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
            Planes de acción {linkedPlans.length > 0 && `(${linkedPlans.length})`}
          </h3>
          {canEdit && (
            <button
              onClick={() => { setCreateForGoalId(undefined); setCreateModalOpen(true); }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-primary/30 text-primary-soft hover:bg-primary/10 hover:border-primary/50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Nuevo plan
            </button>
          )}
        </div>

        {linkedPlans.length === 0 && (
          <div className="text-center py-8 text-text-muted border border-dashed border-border rounded-xl">
            <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs mb-3">Sin planes de acción creados para este proyecto</p>
            {canEdit && (
              <button
                onClick={() => { setCreateForGoalId(undefined); setCreateModalOpen(true); }}
                className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary-soft hover:bg-primary/20 transition-colors"
              >
                Crear primer plan
              </button>
            )}
          </div>
        )}

        <div className="space-y-2">
          {linkedPlans.map((plan) => {
            const linkedGoal = (project.goals ?? []).find((g) => g.id === plan.goalId);
            const doneTasks = plan.items.filter((i) => i.done).length;
            const progress = plan.items.length > 0 ? Math.round((doneTasks / plan.items.length) * 100) : 0;
            const isExpanded = expandedPlanId === plan.id;
            const statusCfg = STATUS_PLAN_CFG[plan.status] ?? STATUS_PLAN_CFG.draft;
            const priorityCfg = PRIORITY_PLAN_CFG[plan.priority] ?? PRIORITY_PLAN_CFG.medium;

            return (
              <div key={plan.id} className="rounded-xl border border-border bg-surface-elevated overflow-hidden">
                {/* Plan header — always visible */}
                <button
                  className="w-full text-left p-4 hover:bg-surface-soft/30 transition-colors"
                  onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-text-muted">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-text-primary leading-snug flex-1">{plan.name}</span>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0", statusCfg.cls)}>{statusCfg.label}</span>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0", priorityCfg.cls)}>{priorityCfg.label}</span>
                      </div>
                      {plan.objective && <p className="text-xs text-text-secondary mt-1 leading-relaxed line-clamp-2">{plan.objective}</p>}
                      {linkedGoal && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Target className="h-3 w-3 text-primary-soft flex-shrink-0" />
                          <span className="text-[11px] text-primary-soft font-medium">{linkedGoal.name}</span>
                          <span className="text-[10px] text-text-muted">→ {linkedGoal.targetValue} {linkedGoal.unit ?? ""}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 h-1 rounded-full bg-surface-soft overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[10px] text-text-muted flex-shrink-0">{doneTasks}/{plan.items.length} tareas · {progress}%</span>
                        {plan.owner && <span className="flex items-center gap-1 text-[10px] text-text-muted flex-shrink-0"><User className="h-3 w-3" />{plan.owner}</span>}
                        {plan.targetDate && <span className="flex items-center gap-1 text-[10px] text-text-muted flex-shrink-0"><Calendar className="h-3 w-3" />{new Date(plan.targetDate).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}</span>}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded: task list + actions */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden border-t border-border"
                    >
                      <div className="px-4 py-3 space-y-1.5">
                        {plan.items.length === 0 && (
                          <p className="text-xs text-text-muted text-center py-3">Sin tareas definidas</p>
                        )}
                        {plan.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => toggleItem(plan.id, item.id)}
                            className="w-full flex items-start gap-2.5 text-left group py-1"
                          >
                            {item.done
                              ? <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                              : <Circle className="h-4 w-4 text-text-muted group-hover:text-text-secondary flex-shrink-0 mt-0.5 transition-colors" />
                            }
                            <span className={cn("text-xs leading-relaxed transition-colors", item.done ? "line-through text-text-muted" : "text-text-secondary group-hover:text-text-primary")}>
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 bg-surface/40">
                        <div className="flex gap-1">
                          {(["active", "draft", "completed", "blocked"] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => updatePlanStatus(plan.id, s)}
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full border transition-colors",
                                plan.status === s ? STATUS_PLAN_CFG[s].cls : "text-text-muted border-border hover:border-primary/30 hover:text-text-primary"
                              )}
                            >
                              {STATUS_PLAN_CFG[s].label}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingPlan(plan)}
                            className="p-1 text-text-muted hover:text-primary-soft transition-colors rounded"
                            title="Editar plan"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deletePlan(plan.id)}
                            className="p-1 text-text-muted hover:text-danger transition-colors rounded"
                            title="Eliminar plan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project next steps */}
      {(pendingSteps.length > 0 || doneSteps.length > 0) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] uppercase tracking-wider text-text-muted font-medium">Próximas acciones del proyecto</h3>
            {canEdit && (
              <button onClick={() => openForm()} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-text-muted hover:text-text-primary hover:border-primary/30 transition-colors">
                <Plus className="h-3.5 w-3.5" />
                Agregar
              </button>
            )}
          </div>
          <div className="space-y-2">
            {pendingSteps.map((step) => (
              <StepRow key={step.id} step={step}
                onToggle={() => updateStep({ ...step, done: true, status: "completed" })}
                onEdit={() => openForm(step)}
                onDelete={() => deleteStep(step.id)}
                onStatus={(status) => updateStep({ ...step, status, done: status === "completed" })}
                canEdit={canEdit} />
            ))}
            {doneSteps.length > 0 && (
              <div className="opacity-60">
                {doneSteps.map((step) => (
                  <StepRow key={step.id} step={step}
                    onToggle={() => updateStep({ ...step, done: false, status: "in-progress" })}
                    onEdit={() => openForm(step)}
                    onDelete={() => deleteStep(step.id)}
                    onStatus={(status) => updateStep({ ...step, status, done: status === "completed" })}
                    canEdit={canEdit} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {steps.length === 0 && canEdit && linkedPlans.length > 0 && (
        <button onClick={() => openForm()} className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors">
          <Plus className="h-3.5 w-3.5" />
          Agregar acción al proyecto
        </button>
      )}

      {form && <StepModal form={form} setForm={setForm} onClose={() => setForm(null)} onSave={saveStep} editing={Boolean(editing)} />}
      {createModalOpen && (
        <ProjectPlanCreateModal
          project={project}
          initialGoalId={createForGoalId}
          onClose={() => { setCreateModalOpen(false); setCreateForGoalId(undefined); }}
        />
      )}
      {editingPlan && (
        <ProjectPlanCreateModal
          project={project}
          editPlan={editingPlan}
          onUpdate={(id, patch) => { updatePlan(id, patch); setEditingPlan(null); }}
          onClose={() => setEditingPlan(null)}
        />
      )}
    </div>
  );
}

function StepRow({
  step,
  onToggle,
  onEdit,
  onDelete,
  onStatus,
  canEdit,
}: {
  step: ProjectNextStep;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatus: (status: NonNullable<ProjectNextStep["status"]>) => void;
  canEdit: boolean;
}) {
  return (
    <div className={cn(
      "flex items-start gap-3 bg-surface-elevated border rounded-xl px-4 py-3 transition-colors",
      step.done ? "border-success/20 bg-success/5" : "border-border"
    )}>
      <button disabled={!canEdit} onClick={onToggle} className="flex-shrink-0 transition-colors hover:opacity-80 mt-0.5 disabled:cursor-not-allowed">
        {step.done
          ? <CheckCircle2 className="h-4 w-4 text-success" />
          : <Circle className="h-4 w-4 text-text-muted hover:text-primary transition-colors" />
        }
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("text-sm leading-snug", step.done ? "text-text-muted line-through" : "text-text-secondary")}>
            {step.label}
          </span>
          {step.priority && <span className={cn("text-[10px] rounded-full border px-2 py-0.5", PRIORITY_CONFIG[step.priority].className)}>{PRIORITY_CONFIG[step.priority].label}</span>}
          {step.status && <span className="text-[10px] text-text-muted rounded-full border border-border px-2 py-0.5">{step.status === "completed" ? "Completada" : step.status === "in-progress" ? "En progreso" : step.status === "blocked" ? "Bloqueada" : "Pendiente"}</span>}
        </div>
        {step.description && <p className="text-xs text-text-muted mt-1 leading-relaxed">{step.description}</p>}
        <div className="flex items-center gap-3 flex-wrap text-[11px] text-text-muted mt-2">
          {step.owner && <span className="flex items-center gap-1"><User className="h-3 w-3" />{step.owner}</span>}
          {step.dueDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(step.dueDate).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}</span>}
          {step.area && <span>{step.area}</span>}
          {step.impact && <span>{step.impact}</span>}
        </div>
      </div>
      {canEdit && (
        <div className="flex flex-wrap justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => onStatus("in-progress")}>En progreso</Button>
          <Button variant="ghost" size="sm" onClick={() => onStatus("completed")}>Completar</Button>
          <Button variant="ghost" size="icon" onClick={onEdit} title="Editar"><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="danger" size="icon" onClick={onDelete} title="Eliminar"><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      )}
    </div>
  );
}

function StepModal({ form, setForm, onClose, onSave, editing }: { form: ProjectNextStep; setForm: (value: ProjectNextStep | null) => void; onClose: () => void; onSave: () => void; editing: boolean }) {
  return (
    <Modal open onClose={onClose} title={editing ? "Editar acción" : "Crear acción"} size="lg">
      <div className="space-y-4">
        <Field label="Título" value={form.label} onChange={(label) => setForm({ ...form, label })} />
        <TextAreaField label="Descripción" value={form.description ?? ""} onChange={(description) => setForm({ ...form, description })} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Responsable" value={form.owner ?? ""} onChange={(owner) => setForm({ ...form, owner })} />
          <Field label="Fecha objetivo" type="date" value={form.dueDate ?? ""} onChange={(dueDate) => setForm({ ...form, dueDate })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Prioridad" value={form.priority ?? "medium"} onChange={(event) => setForm({ ...form, priority: event.target.value as ProjectNextStep["priority"] })} options={[{ value: "high", label: "Alta" }, { value: "medium", label: "Media" }, { value: "low", label: "Baja" }]} />
          <Select label="Estado" value={form.status ?? "pending"} onChange={(event) => setForm({ ...form, status: event.target.value as ProjectNextStep["status"], done: event.target.value === "completed" })} options={[{ value: "pending", label: "Pendiente" }, { value: "in-progress", label: "En progreso" }, { value: "completed", label: "Completada" }, { value: "blocked", label: "Bloqueada" }]} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Impacto esperado" value={form.impact ?? ""} onChange={(impact) => setForm({ ...form, impact })} />
          <Field label="Área relacionada" value={form.area ?? ""} onChange={(area) => setForm({ ...form, area })} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}><X className="h-3.5 w-3.5" />Cancelar</Button>
          <Button variant="primary" onClick={onSave}><Save className="h-3.5 w-3.5" />Guardar</Button>
        </div>
      </div>
    </Modal>
  );
}

function ArchivosTab({ project, conversations, onUpdate, canManage, onOpenDeck, onAskNexus }: { project: Project; conversations: Conversation[]; onUpdate: ProjectUpdater; canManage: boolean; onOpenDeck?: () => void; onAskNexus?: (context: string) => void }) {
  const files = project.files ?? [];
  const [detail, setDetail] = useState<ProjectFile | null>(null);
  const [editing, setEditing] = useState<ProjectFile | null>(null);
  const [form, setForm] = useState<ProjectFile | null>(null);

  function openForm(file?: ProjectFile) {
    if (!canManage) return;
    const draft = file ?? {
      id: `file-${generateId()}`,
      name: "Nuevo_reporte_proyecto.pdf",
      type: "pdf" as const,
      size: "1,2 MB",
      uploadedAt: new Date().toISOString(),
      uploadedBy: project.owner ?? "Mauro Celani",
      source: "manual" as const,
      conversationId: undefined,
    };
    setEditing(file ?? null);
    setForm(draft);
  }

  function saveFile() {
    if (!canManage) return;
    if (!form?.name.trim()) return;
    const next = editing ? files.map((file) => (file.id === form.id ? form : file)) : [form, ...files];
    onUpdate({ files: next });
    setForm(null);
    setEditing(null);
  }

  function deleteFile(id: string) {
    if (!canManage) return;
    onUpdate({ files: files.filter((file) => file.id !== id) });
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-16 text-text-muted">
        <Files className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm mb-4">Sin archivos adjuntos</p>
        {canManage ? (
          <Button variant="primary" size="sm" onClick={() => openForm()}>
            <Paperclip className="h-3.5 w-3.5" />
            Adjuntar archivo mock
          </Button>
        ) : (
          <p className="text-xs text-text-muted">Solo lectura: no podés adjuntar archivos.</p>
        )}
        {form && <FileModal form={form} setForm={setForm} onClose={() => setForm(null)} onSave={saveFile} editing={Boolean(editing)} conversations={conversations} />}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end gap-2 mb-4">
        {onAskNexus && <AskNexusButton onAskNexus={onAskNexus} context="archivos" />}
        {canManage && (
          <Button variant="primary" size="sm" onClick={() => openForm()}>
            <Paperclip className="h-3.5 w-3.5" />
            Adjuntar archivo mock
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {files.map((file) => {
          const Icon = FILE_ICONS[file.type] ?? FileText;
          const conversation = file.conversationId ? conversations.find((item) => item.id === file.conversationId) : undefined;
          const sourceLabel = file.source === "generated" ? "Generado por Nexus" : file.source === "chat" ? "Adjunto de chat" : file.source === "data-source" ? "Fuente de datos vinculada" : "Archivo del proyecto";
          return (
            <div key={file.id} className="flex items-center gap-4 bg-surface-elevated border border-border rounded-xl px-4 py-3 hover:border-primary/25 transition-colors group">
              <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-primary-soft" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {file.type.toUpperCase()} · {file.size} · {sourceLabel} · {new Date(file.uploadedAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                {conversation && <p className="text-[10px] text-primary-soft mt-1 truncate">Conversación: {conversation.title}</p>}
              </div>
              <span className="text-[10px] text-text-muted flex-shrink-0 hidden sm:inline">{file.uploadedBy}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => { if (file.type === "ppt" && file.source === "generated") { onOpenDeck?.(); } else { setDetail(file); } }} title="Ver detalle"><Eye className="h-3.5 w-3.5" /></Button>
                {canManage && (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => openForm(file)} title="Renombrar"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="danger" size="icon" onClick={() => deleteFile(file.id)} title="Eliminar"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {form && <FileModal form={form} setForm={setForm} onClose={() => setForm(null)} onSave={saveFile} editing={Boolean(editing)} conversations={conversations} />}
      {detail && <FileDetailModal file={detail} conversation={detail.conversationId ? conversations.find((item) => item.id === detail.conversationId) : undefined} onClose={() => setDetail(null)} />}
    </>
  );
}

function FileModal({ form, setForm, onClose, onSave, editing, conversations }: { form: ProjectFile; setForm: (value: ProjectFile | null) => void; onClose: () => void; onSave: () => void; editing: boolean; conversations: Conversation[] }) {
  return (
    <Modal open onClose={onClose} title={editing ? "Editar archivo" : "Adjuntar archivo mock"} size="lg">
      <div className="space-y-4">
        <Field label="Nombre" value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Tipo" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as ProjectFile["type"] })} options={["xlsx", "csv", "pdf", "ppt", "doc"].map((value) => ({ value, label: value.toUpperCase() }))} />
          <Field label="Tamaño" value={form.size} onChange={(size) => setForm({ ...form, size })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Origen" value={form.source ?? "manual"} onChange={(event) => setForm({ ...form, source: event.target.value as ProjectFile["source"] })} options={[{ value: "manual", label: "Manual" }, { value: "chat", label: "Chat" }, { value: "generated", label: "Generado por Nexus" }, { value: "data-source", label: "Fuente de datos" }]} />
          <Field label="Fecha" type="date" value={form.uploadedAt.slice(0, 10)} onChange={(date) => setForm({ ...form, uploadedAt: `${date}T12:00:00Z` })} />
        </div>
        <Field label="Responsable" value={form.uploadedBy} onChange={(uploadedBy) => setForm({ ...form, uploadedBy })} />
        <Select
          label="Conversación asociada"
          value={form.conversationId ?? ""}
          onChange={(event) => setForm({ ...form, conversationId: event.target.value || undefined })}
          options={[{ value: "", label: "Sin conversación" }, ...conversations.map((conversation) => ({ value: conversation.id, label: conversation.title }))]}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}><X className="h-3.5 w-3.5" />Cancelar</Button>
          <Button variant="primary" onClick={onSave}><Save className="h-3.5 w-3.5" />Guardar</Button>
        </div>
      </div>
    </Modal>
  );
}

function FileDetailModal({ file, conversation, onClose }: { file: ProjectFile; conversation?: Conversation; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title="Detalle de archivo" size="md">
      <div className="space-y-3 text-sm">
        {[
          ["Nombre", file.name],
          ["Tipo", file.type.toUpperCase()],
          ["Tamaño", file.size],
          ["Origen", file.source ?? "manual"],
          ["Fecha", new Date(file.uploadedAt).toLocaleDateString("es-AR")],
          ["Responsable", file.uploadedBy],
          ["Conversación", conversation?.title ?? "Sin conversación asociada"],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-border/60 pb-2">
            <span className="text-text-muted">{label}</span>
            <span className="text-text-primary text-right">{value}</span>
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Presentation Modal ───────────────────────────────────────────────────────

interface PresentationSlide {
  type: "cover" | "diagnostic" | "insights" | "initiatives" | "goals" | "closing";
  title: string;
}

function buildSlides(project: Project): PresentationSlide[] {
  return [
    { type: "cover",       title: project.name },
    { type: "diagnostic",  title: "Diagnóstico" },
    { type: "insights",    title: "Insights Estratégicos" },
    { type: "initiatives", title: "Iniciativas Estratégicas" },
    { type: "goals",       title: "Objetivos y KPIs" },
    { type: "closing",     title: "Próximos Pasos" },
  ];
}

function CoverSlide({ project }: { project: Project }) {
  return (
    <div className="h-full w-full relative flex flex-col items-center justify-center p-10 overflow-hidden"
         style={{ background: "linear-gradient(135deg, #08080f 0%, #0f0d1c 60%, #09090e 100%)" }}>
      <div className="absolute -top-20 -left-20 h-64 w-64 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-10 h-48 w-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 text-center max-w-2xl">
        {project.projectClient && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-5">
            <Building2 className="h-3.5 w-3.5 text-primary-soft" />
            <span className="text-xs text-primary-soft font-medium">{project.projectClient}</span>
          </div>
        )}
        <h1 className="text-3xl font-bold text-white mb-3 leading-tight">{project.name}</h1>
        <p className="text-sm text-white/50 leading-relaxed max-w-lg mx-auto">{project.objective}</p>
        {project.meetingDate && (
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-white/35">
            <Calendar className="h-3.5 w-3.5" />
            Reunión: {new Date(project.meetingDate).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        )}
      </div>
      <div className="absolute bottom-5 left-8 right-8 flex items-center justify-between">
        <span className="text-[10px] text-white/20">Confidencial — Andes Consumer Goods</span>
        <span className="text-[11px] font-bold text-primary-soft">Nexus</span>
      </div>
    </div>
  );
}

function DiagnosticSlide({ project }: { project: Project }) {
  const risks = (project.risks ?? []).slice(0, 4);
  const severityColor: Record<string, { dot: string; badge: string }> = {
    high:   { dot: "bg-danger",   badge: "bg-danger/15 text-danger border-danger/30" },
    medium: { dot: "bg-warning",  badge: "bg-warning/15 text-warning border-warning/30" },
    low:    { dot: "bg-text-muted", badge: "bg-surface text-text-muted border-border" },
  };
  return (
    <div className="h-full w-full flex flex-col p-8 bg-surface">
      <div className="flex items-center gap-2 mb-5">
        <div className="h-6 w-6 rounded-lg bg-danger/15 flex items-center justify-center">
          <AlertTriangle className="h-3.5 w-3.5 text-danger" />
        </div>
        <h2 className="text-lg font-bold text-text-primary">Diagnóstico</h2>
        {project.projectClient && <span className="ml-auto text-xs text-text-muted">{project.projectClient}</span>}
      </div>
      {project.brief?.problem && (
        <p className="text-xs text-text-muted mb-4 leading-relaxed border-l-2 border-primary/30 pl-3">{project.brief.problem}</p>
      )}
      <div className="space-y-3 flex-1">
        {risks.map((risk) => {
          const cfg = severityColor[risk.severity] ?? severityColor.medium;
          return (
            <div key={risk.id} className="flex items-start gap-3 bg-surface-elevated border border-border rounded-xl p-4">
              <div className={cn("h-2 w-2 rounded-full mt-1.5 flex-shrink-0", cfg.dot)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary leading-snug">{risk.label}</p>
                {risk.description && <p className="text-xs text-text-muted mt-1 leading-relaxed">{risk.description}</p>}
              </div>
              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full border flex-shrink-0", cfg.badge)}>
                {risk.severity === "high" ? "Alto" : risk.severity === "medium" ? "Medio" : "Bajo"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InsightsSlide({ project }: { project: Project }) {
  const insights = (project.insights ?? []).slice(0, 3);
  return (
    <div className="h-full w-full flex flex-col p-8 bg-surface">
      <div className="flex items-center gap-2 mb-5">
        <div className="h-6 w-6 rounded-lg bg-accent/15 flex items-center justify-center">
          <Lightbulb className="h-3.5 w-3.5 text-accent" />
        </div>
        <h2 className="text-lg font-bold text-text-primary">Insights Estratégicos</h2>
      </div>
      <div className="space-y-3 flex-1">
        {insights.map((insight) => (
          <div key={insight.id} className={cn(
            "rounded-xl border p-4 flex gap-3",
            insight.severity === "high" ? "border-danger/25 bg-danger/5" :
            insight.severity === "medium" ? "border-warning/25 bg-warning/5" :
            "border-border bg-surface-elevated"
          )}>
            <div className="flex-shrink-0 mt-0.5">
              {insight.severity === "high" && <AlertTriangle className="h-4 w-4 text-danger" />}
              {insight.severity === "medium" && <Lightbulb className="h-4 w-4 text-warning" />}
              {insight.severity === "low" && <Lightbulb className="h-4 w-4 text-accent" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary mb-1">{insight.title}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{insight.description}</p>
              {insight.recommendation && (
                <p className="text-[11px] text-primary-soft mt-1.5 font-medium">{insight.recommendation}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InitiativesSlide({ project }: { project: Project }) {
  const steps = (project.nextSteps ?? []).filter((s) => !s.done).slice(0, 4);
  const pCls: Record<string, string> = {
    high:   "bg-danger/10 text-danger border-danger/25",
    medium: "bg-warning/10 text-warning border-warning/25",
    low:    "bg-surface text-text-muted border-border",
  };
  const pLabel: Record<string, string> = { high: "Alta", medium: "Media", low: "Baja" };
  return (
    <div className="h-full w-full flex flex-col p-8 bg-surface">
      <div className="flex items-center gap-2 mb-5">
        <div className="h-6 w-6 rounded-lg bg-primary/15 flex items-center justify-center">
          <Target className="h-3.5 w-3.5 text-primary-soft" />
        </div>
        <h2 className="text-lg font-bold text-text-primary">Iniciativas Estratégicas</h2>
      </div>
      <div className="space-y-2.5 flex-1">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-start gap-3 bg-surface-elevated border border-border rounded-xl px-4 py-3">
            <span className="h-5 w-5 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-primary-soft">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary leading-snug">{step.label}</p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {step.owner && <span className="flex items-center gap-1 text-[10px] text-text-muted"><User className="h-2.5 w-2.5" />{step.owner}</span>}
                {step.dueDate && <span className="flex items-center gap-1 text-[10px] text-text-muted"><Calendar className="h-2.5 w-2.5" />{new Date(step.dueDate).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}</span>}
              </div>
            </div>
            {step.priority && (
              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full border flex-shrink-0", pCls[step.priority] ?? pCls.medium)}>
                {pLabel[step.priority] ?? "Media"}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function GoalsSlide({ project }: { project: Project }) {
  const kpis = (project.kpis ?? []).slice(0, 4);
  const goals = (project.goals ?? []).slice(0, 3);
  return (
    <div className="h-full w-full flex flex-col p-8 bg-surface">
      <div className="flex items-center gap-2 mb-5">
        <div className="h-6 w-6 rounded-lg bg-success/15 flex items-center justify-center">
          <BarChart3 className="h-3.5 w-3.5 text-success" />
        </div>
        <h2 className="text-lg font-bold text-text-primary">Objetivos y KPIs</h2>
      </div>
      {kpis.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-surface-elevated border border-border rounded-xl p-3">
              <p className="text-[10px] text-text-muted mb-1">{kpi.label}</p>
              <p className="text-base font-bold text-text-primary">{kpi.value}</p>
              <ChangeChip change={kpi.change} changeType={kpi.changeType} />
            </div>
          ))}
        </div>
      )}
      <div className="space-y-2.5 flex-1">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-surface-elevated border border-border rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-medium text-text-primary">{goal.name}</p>
              <span className="text-xs text-text-muted">{goal.currentValue} → {goal.targetValue}</span>
            </div>
            <div className="h-1.5 bg-surface-soft rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, goal.progress)}%` }} />
            </div>
            <p className="text-[10px] text-text-muted mt-1">{goal.progress}% completado</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClosingSlide({ project }: { project: Project }) {
  const pending = (project.nextSteps ?? []).filter((s) => !s.done).slice(0, 5);
  return (
    <div className="h-full w-full flex flex-col p-8 overflow-hidden"
         style={{ background: "linear-gradient(135deg, #08080f 0%, #0f0d1c 60%, #09090e 100%)" }}>
      <div className="absolute -top-20 -right-20 h-56 w-56 bg-primary/6 rounded-full blur-3xl pointer-events-none" />
      <div className="flex items-center gap-2 mb-5 relative z-10">
        <div className="h-6 w-6 rounded-lg bg-primary/20 flex items-center justify-center">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary-soft" />
        </div>
        <h2 className="text-lg font-bold text-white">Próximos Pasos</h2>
      </div>
      <div className="space-y-2.5 flex-1 relative z-10">
        {pending.map((step, i) => (
          <div key={step.id} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <span className="h-5 w-5 rounded-full border border-primary/40 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-primary-soft">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 leading-snug">{step.label}</p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {step.owner && <span className="text-[10px] text-white/40">{step.owner}</span>}
                {step.dueDate && <span className="text-[10px] text-white/40">{new Date(step.dueDate).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl relative z-10">
        <p className="text-xs text-primary-soft font-medium leading-relaxed">{project.objective}</p>
      </div>
      <div className="mt-4 flex items-center justify-between relative z-10">
        <span className="text-[10px] text-white/20">Confidencial — Andes Consumer Goods</span>
        <span className="text-[11px] font-bold text-primary-soft">Nexus</span>
      </div>
    </div>
  );
}

// ─── Deck generation modal ─────────────────────────────────────────────────────

function DeckGenModal({
  phase,
  onGoToFiles,
  onClose,
}: {
  phase: "generating" | "success";
  onGoToFiles: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 text-center shadow-2xl"
      >
        {phase === "generating" ? (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <h2 className="mb-2 text-lg font-bold text-text-primary">Generando presentación</h2>
            <p className="text-sm text-text-muted leading-relaxed">
              Nexus está preparando los slides con los datos del proyecto…
            </p>
            <div className="mt-5 space-y-1.5">
              {["Analizando datos del proyecto", "Estructurando narrativa ejecutiva", "Construyendo slides"].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-text-muted">
                  <Loader2 className="h-3 w-3 animate-spin opacity-50" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-success/20 bg-success/10">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h2 className="mb-2 text-lg font-bold text-text-primary">Presentación creada correctamente</h2>
            <p className="mb-7 text-sm text-text-muted leading-relaxed">
              Nexus generó la presentación ejecutiva y la adjuntó a los archivos del proyecto.
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="primary" onClick={onGoToFiles}>
                <Files className="h-4 w-4" />
                Ir a archivos
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Presentation modal ────────────────────────────────────────────────────────

const DECK_ITER_RESPONSES = [
  "Listo. Ajusté el tono ejecutivo del diagnóstico. Los datos clave están ahora en negrita.",
  "Aplicado. Agregué una slide de próximos pasos con las 3 acciones de mayor prioridad.",
  "Hecho. Reduje el texto a 3 bullets concisos y alineé la narrativa con el objetivo.",
  "Actualizado. El foco ahora prioriza margen y passthrough en el análisis de resultados.",
  "Listo. Reformateé las iniciativas con dueños y fechas más visibles para la reunión.",
  "Aplicado. Suavicé el lenguaje del diagnóstico para que no suene como crítica interna.",
];

function PresentationModal({ project, onClose, onDuplicate }: { project: Project; onClose: () => void; onDuplicate?: () => void }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ id: string; role: "user" | "assistant"; text: string }[]>([]);
  const [chatThinking, setChatThinking] = useState(false);
  const [iterIdx, setIterIdx] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const slides = buildSlides(project);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatThinking]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setSlideIndex((i) => Math.min(i + 1, slides.length - 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") setSlideIndex((i) => Math.max(i - 1, 0));
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [slides.length, onClose]);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function exportDeck() {
    const data = {
      project: project.name,
      client: project.projectClient,
      meetingDate: project.meetingDate,
      slides: slides.map((s) => ({ type: s.type, title: s.title })),
      kpis: project.kpis,
      risks: project.risks,
      nextSteps: project.nextSteps?.filter((s) => !s.done),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${buildDeckName(project).replace(".pptx", "")}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Presentación descargada");
  }

  function handleShare() {
    const fakeUrl = `https://nexus.app/share/deck/${project.id}`;
    navigator.clipboard.writeText(fakeUrl).catch(() => {});
    showToast("Link copiado al portapapeles");
  }

  async function sendChatMessage() {
    const text = chatInput.trim();
    if (!text || chatThinking) return;
    setChatInput("");
    const userMsg = { id: generateId(), role: "user" as const, text };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatThinking(true);
    await sleep(1400);
    const response = DECK_ITER_RESPONSES[iterIdx % DECK_ITER_RESPONSES.length];
    setIterIdx((i) => i + 1);
    setChatThinking(false);
    setChatMessages((prev) => [...prev, { id: generateId(), role: "assistant", text: response }]);
  }

  const slide = slides[slideIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#06060a]"
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="pointer-events-none absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs text-white backdrop-blur-md"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-white/8 px-5 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-white/10" />
          <Presentation className="h-3.5 w-3.5 text-white/30" />
          <span className="max-w-64 truncate text-sm font-medium text-white/70">{buildDeckName(project).replace(".pptx", "")}</span>
          <span className="hidden text-xs text-white/25 sm:inline">— {project.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="mr-2 text-xs text-white/25">{slideIndex + 1} / {slides.length}</span>
          <button
            onClick={exportDeck}
            className="flex items-center gap-1.5 rounded-md border border-white/15 px-2.5 py-1.5 text-xs text-white/50 transition-colors hover:border-white/30 hover:text-white"
            title="Descargar"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Descargar</span>
          </button>
          {onDuplicate && (
            <button
              onClick={() => { onDuplicate(); showToast("Copia guardada en Archivos"); }}
              className="flex items-center gap-1.5 rounded-md border border-white/15 px-2.5 py-1.5 text-xs text-white/50 transition-colors hover:border-white/30 hover:text-white"
              title="Duplicar"
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Duplicar</span>
            </button>
          )}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-md border border-white/15 px-2.5 py-1.5 text-xs text-white/50 transition-colors hover:border-white/30 hover:text-white"
            title="Compartir"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Compartir</span>
          </button>
          <button
            onClick={() => setChatOpen((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors",
              chatOpen
                ? "border-primary/50 bg-primary/20 text-primary-soft"
                : "border-white/15 text-white/50 hover:border-white/30 hover:text-white"
            )}
            title="Iterar con Nexus"
          >
            <Bot className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Iterar con Nexus</span>
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex min-h-0 flex-1">
        {/* Slide area */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center p-6 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={slideIndex}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border border-white/8 shadow-2xl"
              >
                {slide.type === "cover"       && <CoverSlide project={project} />}
                {slide.type === "diagnostic"  && <DiagnosticSlide project={project} />}
                {slide.type === "insights"    && <InsightsSlide project={project} />}
                {slide.type === "initiatives" && <InitiativesSlide project={project} />}
                {slide.type === "goals"       && <GoalsSlide project={project} />}
                {slide.type === "closing"     && <ClosingSlide project={project} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex flex-shrink-0 items-center justify-center gap-5 pb-5">
            <button
              onClick={() => setSlideIndex((i) => Math.max(i - 1, 0))}
              disabled={slideIndex === 0}
              className="flex items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/50 transition-colors hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            <div className="flex items-center gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIndex(i)}
                  title={s.title}
                  className={cn("rounded-full transition-all", i === slideIndex ? "h-2 w-6 bg-primary" : "h-2 w-2 bg-white/20 hover:bg-white/40")}
                />
              ))}
            </div>
            <button
              onClick={() => setSlideIndex((i) => Math.min(i + 1, slides.length - 1))}
              disabled={slideIndex === slides.length - 1}
              className="flex items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/50 transition-colors hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mini chat panel */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="flex h-full flex-shrink-0 flex-col overflow-hidden border-l border-white/8 bg-white/3"
            >
              {/* Chat header */}
              <div className="flex flex-shrink-0 items-center gap-2 border-b border-white/8 px-4 py-3">
                <Bot className="h-4 w-4 text-primary-soft" />
                <span className="flex-1 text-sm font-medium text-white/80">Iterar con Nexus</span>
                <button onClick={() => setChatOpen(false)} className="rounded-md p-1 text-white/30 hover:bg-white/10 hover:text-white transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {chatMessages.length === 0 && !chatThinking && (
                  <div className="py-8 text-center">
                    <Bot className="mx-auto mb-3 h-8 w-8 text-white/20" />
                    <p className="text-xs text-white/40 leading-relaxed">
                      Pedile a Nexus que ajuste la presentación. Por ejemplo:<br />
                      <span className="italic">&quot;Hacé más ejecutivo el diagnóstico&quot;</span>
                    </p>
                    <div className="mt-4 space-y-1.5">
                      {["Reducí el texto de la slide 3", "Agregá una slide de próximos pasos", "Cambiá el tono a más ejecutivo"].map((s) => (
                        <button
                          key={s}
                          onClick={() => { setChatInput(s); }}
                          className="block w-full rounded-lg border border-white/10 px-3 py-1.5 text-left text-xs text-white/40 hover:border-white/20 hover:text-white/60 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary/30 text-white"
                        : "border border-white/10 bg-white/5 text-white/75"
                    )}>
                      {msg.role === "assistant" && (
                        <div className="mb-1 flex items-center gap-1.5">
                          <Bot className="h-2.5 w-2.5 text-primary-soft" />
                          <span className="text-[10px] font-medium text-primary-soft">Nexus</span>
                          <span className="rounded-full bg-success/20 px-1.5 py-0.5 text-[9px] font-medium text-success">Cambios aplicados</span>
                        </div>
                      )}
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatThinking && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <Loader2 className="h-3 w-3 animate-spin text-primary-soft" />
                      <span className="text-xs text-white/40">Nexus está aplicando cambios…</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat input */}
              <div className="flex-shrink-0 border-t border-white/8 p-3">
                <div className="flex items-end gap-2">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                    placeholder="Pedí un cambio a Nexus…"
                    rows={2}
                    className="flex-1 resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/25 focus:border-primary/40 focus:outline-none"
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() || chatThinking}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-opacity disabled:opacity-30"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Entity extractors (chat → project) ────────────────────────────────────────

function extractInsightFromBlocks(blocks: MessageBlock[], project: Project): ProjectInsight {
  const summary = blocks.find((b) => b.type === "executive-summary")?.data as { title?: string; summary?: string } | undefined;
  const cards = (blocks.find((b) => b.type === "insight-card")?.data as { insights?: { title: string; description: string; type: string }[] } | undefined)?.insights;
  const recs = (blocks.find((b) => b.type === "recommendations")?.data as { recommendations?: { title: string }[] } | undefined)?.recommendations;

  const severityMap: Record<string, "high" | "medium" | "low"> = { alert: "high", warning: "medium", info: "low", opportunity: "medium" };
  const first = cards?.[0];

  return {
    id: `insight-${generateId()}`,
    title: first?.title ?? summary?.title ?? "Insight generado desde chat",
    description: first?.description ?? summary?.summary ?? "Insight derivado del análisis conversacional del proyecto.",
    severity: first ? (severityMap[first.type] ?? "medium") : "medium",
    impact: "medium",
    area: project.area ?? "general",
    recommendation: recs?.[0]?.title ?? "Analizar en próxima reunión de equipo.",
    createdAt: new Date().toISOString(),
  };
}

function extractGoalFromBlocks(blocks: MessageBlock[], project: Project, _ownerName: string): ProjectGoal {
  const summary = blocks.find((b) => b.type === "executive-summary")?.data as { title?: string } | undefined;
  const kpis = (blocks.find((b) => b.type === "kpi-strip")?.data as { kpis?: { label: string; value: string }[] } | undefined)?.kpis;
  const recs = (blocks.find((b) => b.type === "recommendations")?.data as { recommendations?: { title: string }[] } | undefined)?.recommendations;

  const kpi = kpis?.[0];
  const dueDate = new Date();
  dueDate.setMonth(dueDate.getMonth() + 6);

  return {
    id: `goal-${generateId()}`,
    name: recs?.[0]?.title ?? summary?.title ?? `Objetivo — ${project.name}`,
    kpi: kpi?.label,
    currentValue: kpi?.value ?? "0%",
    targetValue: "100%",
    unit: "%",
    progress: 0,
    dueDate: dueDate.toISOString().split("T")[0],
    priority: "high",
    status: "pending",
  };
}

function extractStepsFromBlocks(blocks: MessageBlock[], project: Project): ProjectNextStep[] {
  const recs = (blocks.find((b) => b.type === "recommendations")?.data as { recommendations?: { title: string; description?: string; priority?: string }[] } | undefined)?.recommendations;
  const initiatives = (blocks.find((b) => b.type === "strategic-initiatives")?.data as { initiatives?: { title: string; owner?: string; priority?: "high" | "medium" | "low" }[] } | undefined)?.initiatives;

  const source = recs ?? initiatives ?? [];
  if (source.length > 0) {
    return source.slice(0, 5).map((item) => ({
      id: `step-${generateId()}`,
      label: "title" in item ? item.title : String(item),
      description: "description" in item ? item.description : undefined,
      priority: ("priority" in item ? item.priority : undefined) as "high" | "medium" | "low" | undefined ?? "medium",
      status: "pending" as const,
      area: project.area ?? "general",
      done: false,
    }));
  }
  return [
    { id: `step-${generateId()}`, label: `Revisar estado de ${project.name}`, priority: "high" as const, status: "pending" as const, done: false },
    { id: `step-${generateId()}`, label: "Definir acciones correctivas con el equipo", priority: "medium" as const, status: "pending" as const, done: false },
    { id: `step-${generateId()}`, label: "Agendar seguimiento en 30 días", priority: "low" as const, status: "pending" as const, done: false },
  ];
}

function extractBriefFromBlocks(blocks: MessageBlock[], project: Project): import("@/types/analytics").ProjectBrief {
  const bpData = (blocks.find((b) => b.type === "brief-proposal")?.data ?? {}) as Partial<import("@/types/analytics").ProjectBrief>;
  if (bpData.problem && bpData.hypothesis && bpData.strategy && bpData.expectedOutcome) {
    return bpData as import("@/types/analytics").ProjectBrief;
  }
  // Fallback: derive from existing project context + summary
  const summary = (blocks.find((b) => b.type === "executive-summary")?.data as { summary?: string } | undefined)?.summary ?? "";
  const recs = (blocks.find((b) => b.type === "recommendations")?.data as { recommendations?: { title: string; description?: string }[] } | undefined)?.recommendations ?? [];
  return {
    problem: project.brief?.problem ?? (summary ? summary.slice(0, 200) : `Definir el problema central que aborda ${project.name}.`),
    hypothesis: project.brief?.hypothesis ?? (recs[0] ? `${recs[0].title}. ${recs[0].description ?? ""}`.trim() : "La brecha de performance responde a múltiples causas que requieren diagnóstico."),
    strategy: project.brief?.strategy ?? (recs[1] ? `${recs[1].title}. ${recs[1].description ?? ""}`.trim() : "Estructurar iniciativas priorizadas con responsables y KPIs claros."),
    expectedOutcome: project.brief?.expectedOutcome ?? "Equipo alineado con lectura compartida del problema y plan de acción priorizado.",
  };
}

// ─── Project chat empty state ──────────────────────────────────────────────────

const PROJECT_SUGGESTED_PROMPTS = [
  "Dame un diagnóstico general del estado del proyecto",
  "¿Cuáles son los principales riesgos y cómo mitigarlos?",
  "¿Qué KPIs están fuera de objetivo y por qué?",
  "Generá recomendaciones de acción para los próximos 30 días",
  "¿Cuáles son los insights más importantes detectados?",
  "¿Cuál es el avance real vs lo planificado?",
];

function ProjectChatEmptyState({
  project,
  datasetLabel,
  canChat,
  onSend,
}: {
  project: Project;
  datasetLabel: string;
  canChat: boolean;
  onSend: (msg: string) => void;
}) {
  const areas = project.area
    ? project.area.split(",").map((a) => a.trim()).filter(Boolean)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-10 px-4 text-center"
    >
      <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-text-primary mb-1">
        ¿Qué querés consultar sobre {project.name}?
      </h2>
      <p className="text-xs text-text-muted mb-3 max-w-xs leading-relaxed">
        Preguntá en lenguaje natural y Nexus analizará los datos del proyecto en contexto.
      </p>
      {areas.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center mb-3">
          {areas.map((area) => (
            <span
              key={area}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-surface-soft border-border text-text-muted"
            >
              {getAreaDisplayName(area)}
            </span>
          ))}
        </div>
      )}
      {datasetLabel && (
        <p className="text-[10px] text-text-muted mb-5">{datasetLabel}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {PROJECT_SUGGESTED_PROMPTS.map((q) => (
          <button
            key={q}
            onClick={() => { if (canChat) onSend(q); }}
            disabled={!canChat}
            className="text-left text-xs text-text-secondary hover:text-text-primary border border-border hover:border-primary/30 hover:bg-surface-soft rounded-lg px-3.5 py-2.5 transition-all leading-snug disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {q}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Project chat tab ──────────────────────────────────────────────────────────

function ChatTab({
  project,
  onGenerateDeck,
  onTabChange,
  chatContext,
  onChatContextConsumed,
  initialConvId,
}: {
  project: Project;
  onGenerateDeck: (convId: string | null) => void;
  onTabChange?: (tab: TabId) => void;
  chatContext?: string | null;
  onChatContextConsumed?: () => void;
  initialConvId?: string | null;
}) {
  const {
    getMessages,
    addMessage,
    isThinking,
    setThinking,
    thinkingSteps,
    setThinkingSteps,
    updateThinkingStep,
    createConversation,
    setConversationTitle,
    classifyConversationAreas,
    conversations,
    updateProject,
  } = useChatStore();
  const { hasDemoLoaded, files } = useDataSourceStore();
  const { user } = useAuthStore();
  const hasData = hasAnyDataSource({ files, hasDemoLoaded });
  const datasetLabel = hasDemoLoaded
    ? "Demo CPG Portfolio 2025-2026 — consumo masivo · YTD 2026"
    : "";
  const canChat = canCreateChat(user) && canSendChatMessage(user);

  const [projectConvId, setProjectConvId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<ChatInputHandle>(null);

  const projectConvs = useMemo(
    () => conversations.filter((c) => c.projectId === project.id && c.status === "active"),
    [conversations, project.id]
  );
  const existingProjectConversation = projectConvs[0];
  const convId = projectConvId ?? existingProjectConversation?.id ?? null;
  const messages = useChatStore((state) => (convId ? (state.conversationMessages[convId] ?? EMPTY_MESSAGES) : EMPTY_MESSAGES));

  // When navigated from sidebar with a specific convId (e.g. "Nueva consulta aquí")
  useEffect(() => {
    if (!initialConvId) return;
    const t = setTimeout(() => setProjectConvId(initialConvId), 0);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConvId]);

  // "Preguntar a Nexus": create a new empty "Nueva consulta" conversation when context arrives
  useEffect(() => {
    if (!chatContext) return;
    if (canChat) {
      const timer = setTimeout(() => {
        const conv = createConversation(undefined, project.id, project.area);
        setProjectConvId(conv.id);
        inputRef.current?.focus();
      }, 0);
      onChatContextConsumed?.();
      return () => clearTimeout(timer);
    }
    onChatContextConsumed?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Creation functions — no tab navigation (modal handles that via handleNavigateAfterAction)
  function handleAction(action: string, blocks?: MessageBlock[]) {
    switch (action) {
      case "generate-deck":
        onGenerateDeck(convId);
        break;
      case "create-goal":
        if (canEditGoals(user, project)) {
          const goal = extractGoalFromBlocks(blocks ?? [], project, user?.name ?? "");
          updateProject(project.id, { goals: [...(project.goals ?? []), goal] });
        }
        break;
      case "add-insight":
        if (canCreateInsight(user)) {
          const insight = extractInsightFromBlocks(blocks ?? [], project);
          updateProject(project.id, { insights: [...(project.insights ?? []), insight] });
        }
        break;
    }
  }

  function handleCreateProjectPlan(blocks: MessageBlock[]) {
    if (!canEditActionPlan(user, project)) return;
    const steps = extractStepsFromBlocks(blocks, project);
    updateProject(project.id, { nextSteps: [...(project.nextSteps ?? []), ...steps] });
  }

  function handleCompleteBrief(blocks: MessageBlock[]) {
    if (!canEditProject(user, project)) return;
    const brief = extractBriefFromBlocks(blocks, project);
    updateProject(project.id, { brief });
  }

  // Called from modal "Ver…" button — navigate to the corresponding tab
  function handleNavigateAfterAction(canonicalId: string) {
    switch (canonicalId) {
      case "create-plan":    onTabChange?.("plan"); break;
      case "create-goal":    onTabChange?.("objetivos"); break;
      case "add-insight":    onTabChange?.("insights"); break;
      case "generate-deck":  onTabChange?.("archivos"); break;
      case "complete-brief": onTabChange?.("resumen"); break;
    }
  }

  async function sendMessage(content: string, attachment?: ChatAttachment) {
    if (!canChat) return;
    let cid = convId;
    if (!cid) {
      const conv = createConversation(undefined, project.id, project.area);
      cid = conv.id;
      setProjectConvId(cid);
    }

    const isFirst = getMessages(cid).length === 0;
    const userMsg: Message = {
      id: `msg-${generateId()}`,
      role: "user",
      content,
      attachment,
      timestamp: new Date().toISOString(),
      userName: user?.name,
    };
    addMessage(cid, userMsg);
    if (isFirst) {
      setConversationTitle(cid, content);
      classifyConversationAreas(cid, content);
    }

    setThinking(true);
    const steps = AGENT_STEPS.map((label) => ({ label, status: "pending" as const }));
    setThinkingSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      updateThinkingStep(i, "running");
      await sleep(380);
      updateThinkingStep(i, "done");
    }
    await sleep(300);
    setThinking(false);

    const response = resolveDemoResponse(content) ?? generateProjectStructuredResponse(content, project);
    addMessage(cid, response);
  }

  const activeConvData = projectConvs.find((c) => c.id === convId);
  const inputPlaceholder = !canChat
    ? "Modo solo lectura: no podés enviar mensajes."
    : (CONTEXT_PLACEHOLDERS[chatContext ?? ""] ?? "Preguntá sobre este proyecto...");

  return (
    <div className="flex flex-1 min-h-0 gap-0">
      {/* ─── Left: conversation list ─── */}
      <div className="w-52 flex-shrink-0 flex flex-col gap-2 overflow-y-auto border-r border-border pr-3 mr-3">
        {canChat && (
          <button
            onClick={() => {
              const conv = createConversation(undefined, project.id, project.area);
              setProjectConvId(conv.id);
            }}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-lg border border-dashed border-primary/30 px-3 py-2 text-xs text-primary-soft hover:border-primary/60 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Nueva consulta
          </button>
        )}
        {projectConvs.length === 0 && (
          <p className="text-[10px] text-text-muted px-1 leading-relaxed mt-2">
            Todavía no hay conversaciones en este proyecto.
          </p>
        )}
        {projectConvs.map((conv) => (
          <button
            key={conv.id}
            onClick={() => setProjectConvId(conv.id)}
            className={cn(
              "flex-shrink-0 rounded-lg border px-3 py-2 text-left transition-colors w-full",
              convId === conv.id
                ? "border-primary/40 bg-primary/10"
                : "border-border bg-surface hover:bg-surface-soft"
            )}
          >
            <div className="text-xs font-medium text-text-primary truncate">{conv.title}</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] text-text-muted">{conv.messageCount} msgs</span>
              <ConversationAreaBadge conversation={conv} />
            </div>
          </button>
        ))}
      </div>

      {/* ─── Right: messages + input ─── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        {/* Active conversation header */}
        {activeConvData && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border flex-shrink-0">
            <p className="text-xs font-medium text-text-primary truncate flex-1">{activeConvData.title}</p>
            <ConversationAreaBadge conversation={activeConvData} />
          </div>
        )}

        {/* Messages — this is the only scroll area */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="pb-4 py-2">
            {messages.length === 0 && !isThinking && (
              <ProjectChatEmptyState
                project={project}
                datasetLabel={datasetLabel}
                canChat={canChat}
                onSend={sendMessage}
              />
            )}
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} onFollowUp={canChat ? sendMessage : undefined} onAction={handleAction} onCreateProjectPlan={handleCreateProjectPlan} onCompleteBrief={canEditProject(user, project) ? handleCompleteBrief : undefined} onNavigate={handleNavigateAfterAction} projectName={project.name} />
            ))}
            <AnimatePresence>
              {isThinking && <AgentThinking steps={thinkingSteps} />}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed input footer */}
        <div className="flex-shrink-0 pt-3 pb-4 border-t border-border">
          <ChatInput
            ref={inputRef}
            onSend={sendMessage}
            disabled={isThinking || !canChat}
            placeholder={inputPlaceholder}
          />
          {!canChat && (
            <p className="text-[10px] text-text-muted mt-2 text-center">
              Modo solo lectura: no podés enviar mensajes.
            </p>
          )}
          {canChat && !hasData && (
            <p className="text-[10px] text-text-muted mt-2 text-center">
              Conectá una fuente de datos para análisis enriquecido
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { conversations, projects, updateProject } = useChatStore();
  const { hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource } = useDataSourceStore();
  const { user } = useAuthStore();
  const processedDataset = getActiveDataset({ activeDatasetSource, fileDataset, integrationDataset, hasDemoLoaded });
  const VALID_TABS: TabId[] = ["resumen", "chat", "kpis", "plan", "insights", "objetivos", "timeline", "archivos"];
  const initialTab = searchParams.get("tab") as TabId | null;
  const initialConvId = searchParams.get("convId");
  const [activeTab, setActiveTab] = useState<TabId>(
    initialTab && VALID_TABS.includes(initialTab) ? initialTab : "resumen"
  );

  // When URL changes (e.g. sidebar "Nueva consulta"), sync tab
  useEffect(() => {
    const tab = searchParams.get("tab") as TabId | null;
    if (!tab || !VALID_TABS.includes(tab)) return;
    const t = setTimeout(() => setActiveTab(tab), 0);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalSection, setEditModalSection] = useState<"info" | "brief">("info");
  const [deckModalOpen, setDeckModalOpen] = useState(false);
  const [deckGenPhase, setDeckGenPhase] = useState<"idle" | "generating" | "success">("idle");
  const [createPlanForGoalId, setCreatePlanForGoalId] = useState<string | undefined>(undefined);
  const [createPlanModalOpen, setCreatePlanModalOpen] = useState(false);
  const [chatContext, setChatContext] = useState<string | null>(null);

  function handleAskNexus(context: string) {
    setChatContext(context);
    setActiveTab("chat");
  }

  const projectId = typeof params.projectId === "string" ? params.projectId : params.projectId?.[0];
  const rawProject = projects.find((p) => p.id === projectId);
  const project = rawProject ? buildDerivedProject(rawProject, conversations, processedDataset, hasDemoLoaded) : undefined;

  async function handleGenerateDeck(convId: string | null, openAfter = false) {
    if (!project) return;
    if (findGeneratedDeck(project)) {
      if (openAfter) setDeckModalOpen(true);
      else setDeckGenPhase("success");
      return;
    }
    setDeckGenPhase("generating");
    await sleep(2200);
    const deckFile: ProjectFile = {
      id: `file-deck-${generateId()}`,
      name: buildDeckName(project),
      type: "ppt",
      size: "3,6 MB",
      uploadedAt: new Date().toISOString(),
      uploadedBy: "Nexus",
      source: "generated",
      conversationId: convId ?? undefined,
    };
    const existing = project.files ?? [];
    const withoutDupe = existing.filter((file) => !(file.source === "generated" && file.type === "ppt" && file.name === deckFile.name));
    updateProject(project.id, { files: [deckFile, ...withoutDupe], presentationReady: true });
    setDeckGenPhase("success");
    if (openAfter) setDeckModalOpen(true);
  }

  function handleDeckGoToFiles() {
    setDeckGenPhase("idle");
    setActiveTab("archivos");
  }

  function handleDuplicate() {
    if (!project) return;
    const orig = (project.files ?? []).find((f) => f.source === "generated" && f.type === "ppt");
    if (!orig) return;
    const copy: ProjectFile = {
      ...orig,
      id: `file-deck-${generateId()}`,
      name: orig.name.replace(".pptx", `_copia.pptx`),
      uploadedAt: new Date().toISOString(),
    };
    updateProject(project.id, { files: [...(project.files ?? []), copy] });
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Folder className="h-12 w-12 text-text-muted mb-4 opacity-40" />
        <h2 className="text-lg font-semibold text-text-primary mb-2">Proyecto no encontrado</h2>
        <p className="text-sm text-text-muted mb-6">Este proyecto no existe o fue eliminado.</p>
        <button
          onClick={() => router.push(ROUTES.WORKSPACE)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border hover:border-primary/30 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al workspace
        </button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.active;
  const priorityCfg = PRIORITY_CONFIG[project.priority ?? "medium"];
  const canEditCurrentProject = canEditProject(user, project);
  const canEditCurrentGoals = canEditGoals(user, project);
  const canCreateCurrentInsight = canCreateInsight(user);
  const canEditCurrentInsights = canEditInsights(user, project);
  const canEditCurrentPlan = canEditActionPlan(user, project);
  const canManageCurrentFiles = canManageProjectFiles(user, project);
  const persistProjectUpdate: ProjectUpdater = (patch) => updateProject(project.id, patch);
  const isDemoProject = isDemoCpgProject(project, hasDemoLoaded);
  const hasDeckContext = isDemoProject || hasPresentationContext(project, conversations);
  const canPreparePresentation = canManageCurrentFiles && hasDeckContext;
  const presentationDisabledReason = canManageCurrentFiles
    ? "Agregá conversaciones o análisis al proyecto para generar una presentación."
    : "No tenés permisos para generar archivos en este proyecto.";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-surface px-4 md:px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start gap-3 mb-3">
            <button
              onClick={() => router.back()}
              className="mt-0.5 flex-shrink-0 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-lg font-bold text-text-primary leading-tight">{project.name}</h1>
                {canEditCurrentProject && (
                  <button
                    onClick={() => setEditModalOpen(true)}
                    title="Editar proyecto"
                    className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
                <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium")}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
                  <span className={statusCfg.color}>{statusCfg.label}</span>
                </span>
                {canEditCurrentProject ? (
                  <Dropdown
                    options={(Object.entries(PRIORITY_CONFIG) as [ProjectPriority, { label: string }][]).map(([val, cfg]) => ({ value: val, label: cfg.label }))}
                    value={project.priority ?? "medium"}
                    onChange={(v) => persistProjectUpdate({ priority: v as ProjectPriority })}
                    className="w-auto"
                    trigger={() => (
                      <div
                        title="Cambiar prioridad"
                        className={cn("inline-flex items-center gap-1.5 text-[10px] font-medium rounded-full border px-2 py-0.5 cursor-pointer select-none", priorityCfg.className)}
                      >
                        <Flag className="h-3 w-3 flex-shrink-0" />
                        <span>{priorityCfg.label}</span>
                      </div>
                    )}
                  />
                ) : (
                  <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-medium rounded-full border px-2 py-0.5", priorityCfg.className)}>
                    <Flag className="h-3 w-3 flex-shrink-0" />
                    <span>{priorityCfg.label}</span>
                  </span>
                )}
              </div>
              {project.description && (
                <p className="text-sm text-text-muted leading-snug">{project.description}</p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
                <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-text-muted">Progreso</p>
                  <p className="text-sm font-semibold text-text-primary">{project.progress ?? 0}%</p>
                </div>
                <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-text-muted">Deadline</p>
                  <p className="text-sm font-semibold text-text-primary">{project.dueDate ? new Date(project.dueDate).toLocaleDateString("es-AR", { day: "numeric", month: "short" }) : "N/D"}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-text-muted">Owner</p>
                  <p className="text-sm font-semibold text-text-primary truncate">{project.owner ?? "N/D"}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-text-muted">Áreas</p>
                  <p className="text-sm font-semibold text-text-primary truncate">{(project.linkedAreas ?? []).join(", ")}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-text-muted">Equipo</p>
                  <p className="text-sm font-semibold text-text-primary">{project.contributors?.length ?? 1}</p>
                </div>
              </div>
              {project.objective && (
                <p className="text-[11px] text-text-muted mt-2 leading-snug line-clamp-2">{project.objective}</p>
              )}
            </div>
          </div>

          {/* Tab nav */}
          <div className="flex gap-0.5 mt-1 overflow-x-auto pb-px">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                    activeTab === tab.id
                      ? "text-text-primary bg-surface-elevated border border-border"
                      : "text-text-muted hover:text-text-secondary hover:bg-surface-soft"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className={cn(
        "flex-1 px-4 md:px-6",
        activeTab === "chat"
          ? "flex flex-col overflow-hidden min-h-0 pt-4 pb-0"
          : "overflow-y-auto py-6"
      )}>
        <div className={cn("max-w-5xl mx-auto w-full", activeTab === "chat" && "flex flex-col flex-1 min-h-0")}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={cn(activeTab === "chat" && "flex flex-col flex-1 min-h-0")}
            >
              {activeTab === "resumen" && (
                <ResumenTab
                  project={project}
                  conversations={conversations}
                  onEditBrief={() => { setEditModalSection("brief"); setEditModalOpen(true); }}
                  onPreparePresentation={() => {
                    if (findGeneratedDeck(project)) setDeckModalOpen(true);
                    else void handleGenerateDeck(null, true);
                  }}
                  canPreparePresentation={canPreparePresentation}
                  presentationDisabledReason={presentationDisabledReason}
                  onAskNexus={handleAskNexus}
                />
              )}
              {activeTab === "chat" && <ChatTab project={project} onGenerateDeck={handleGenerateDeck} onTabChange={setActiveTab} chatContext={chatContext} onChatContextConsumed={() => setChatContext(null)} initialConvId={initialConvId} />}
              {activeTab === "kpis" && <KpisTab kpis={project.kpis ?? []} onAskNexus={handleAskNexus} />}
              {activeTab === "plan" && (
                <PlanTab
                  project={project}
                  onUpdate={persistProjectUpdate}
                  canEdit={canEditCurrentPlan}
                  externalCreateGoalId={createPlanForGoalId}
                  externalCreateOpen={createPlanModalOpen}
                  onExternalCreateHandled={() => setCreatePlanModalOpen(false)}
                  onAskNexus={handleAskNexus}
                />
              )}
              {activeTab === "insights" && <InsightsTab project={project} onUpdate={persistProjectUpdate} canCreate={canCreateCurrentInsight} canEdit={canEditCurrentInsights} onAskNexus={handleAskNexus} />}
              {activeTab === "objetivos" && (
                <GoalsTab
                  project={project}
                  onUpdate={persistProjectUpdate}
                  canEdit={canEditCurrentGoals}
                  onCreatePlan={(goalId) => {
                    setCreatePlanForGoalId(goalId);
                    setCreatePlanModalOpen(true);
                    setActiveTab("plan");
                  }}
                  onAskNexus={handleAskNexus}
                />
              )}
              {activeTab === "timeline" && <TimelineTab events={project.timelineEvents ?? []} onAskNexus={handleAskNexus} />}
              {activeTab === "archivos" && <ArchivosTab project={project} conversations={conversations} onUpdate={persistProjectUpdate} canManage={canManageCurrentFiles} onOpenDeck={() => setDeckModalOpen(true)} onAskNexus={handleAskNexus} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {editModalOpen && canEditCurrentProject && (
        <EditProjectModal
          project={project}
          initialSection={editModalSection}
          onSave={(patch) => {
            if (!canEditCurrentProject) return;
            persistProjectUpdate(patch);
          }}
          onClose={() => { setEditModalOpen(false); setEditModalSection("info"); }}
        />
      )}

      <AnimatePresence>
        {(deckGenPhase === "generating" || deckGenPhase === "success") && (
          <DeckGenModal
            phase={deckGenPhase}
            onGoToFiles={handleDeckGoToFiles}
            onClose={() => setDeckGenPhase("idle")}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deckModalOpen && (
          <PresentationModal
            project={project}
            onClose={() => setDeckModalOpen(false)}
            onDuplicate={handleDuplicate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";
import { useState } from "react";
import { ClipboardList, Plus, Trash2, ChevronDown, ChevronRight, Calendar, User, Tag, CheckCircle2, Circle, AlertCircle, Clock, Ban } from "lucide-react";
import { useActionPlanStore } from "@/stores/action-plan-store";
import { useChatStore } from "@/stores/chat-store";
import { useAuthStore } from "@/stores/auth-store";
import type { ActionPlan, ActionPlanStatus, ActionPlanPriority } from "@/types/analytics";
import { cn } from "@/lib/utils";
import { canEditActionPlan } from "@/lib/permissions";

const STATUS_CONFIG: Record<ActionPlanStatus, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  draft: { label: "Borrador", icon: Clock, className: "text-text-muted bg-surface-soft border-border" },
  active: { label: "En curso", icon: AlertCircle, className: "text-accent bg-accent/10 border-accent/30" },
  completed: { label: "Completado", icon: CheckCircle2, className: "text-success bg-success/10 border-success/30" },
  blocked: { label: "Bloqueado", icon: Ban, className: "text-danger bg-danger/10 border-danger/30" },
};

const PRIORITY_CONFIG: Record<ActionPlanPriority, { label: string; className: string }> = {
  high: { label: "Alta", className: "text-danger bg-danger/10 border-danger/30" },
  medium: { label: "Media", className: "text-warning bg-warning/10 border-warning/30" },
  low: { label: "Baja", className: "text-success bg-success/10 border-success/30" },
};

const STATUS_OPTIONS: ActionPlanStatus[] = ["draft", "active", "completed", "blocked"];

function PlanCard({ plan, projectName, goalName, conversationTitle }: { plan: ActionPlan; projectName?: string; goalName?: string; conversationTitle?: string }) {
  const { toggleItem, updatePlanStatus, deletePlan } = useActionPlanStore();
  const { user } = useAuthStore();
  const [expanded, setExpanded] = useState(true);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const canEdit = canEditActionPlan(user);

  const doneCount = plan.items.filter((i) => i.done).length;
  const progress = plan.items.length > 0 ? Math.round((doneCount / plan.items.length) * 100) : 0;
  const statusCfg = STATUS_CONFIG[plan.status];
  const priorityCfg = PRIORITY_CONFIG[plan.priority];
  const StatusIcon = statusCfg.icon;

  const formattedDate = plan.targetDate
    ? new Date(plan.targetDate).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-0.5 text-text-muted hover:text-text-secondary transition-colors flex-shrink-0"
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h3 className="text-sm font-semibold text-text-primary leading-snug">{plan.name}</h3>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Priority badge */}
              <span className={cn("text-[11px] px-2 py-0.5 rounded-full border font-medium", priorityCfg.className)}>
                {priorityCfg.label}
              </span>

              {/* Status dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    if (canEdit) setShowStatusMenu((v) => !v);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors",
                    statusCfg.className,
                    !canEdit && "cursor-default"
                  )}
                >
                  <StatusIcon className="h-3 w-3" />
                  {statusCfg.label}
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
                {showStatusMenu && canEdit && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-lg border border-border bg-surface-elevated shadow-lg py-1">
                      {STATUS_OPTIONS.map((s) => {
                        const cfg = STATUS_CONFIG[s];
                        const Icon = cfg.icon;
                        return (
                          <button
                            key={s}
                            onClick={() => {
                              if (!canEdit) return;
                              updatePlanStatus(plan.id, s);
                              setShowStatusMenu(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface-soft transition-colors",
                              plan.status === s && "bg-surface-soft"
                            )}
                          >
                            <Icon className={cn("h-3.5 w-3.5", cfg.className.split(" ")[0])} />
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Delete */}
              {canEdit && (
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="p-1 text-text-muted hover:text-danger transition-colors rounded"
                  title="Eliminar plan"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {plan.objective && (
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">{plan.objective}</p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {plan.insightOrigin && (
              <span className="flex items-center gap-1 text-[11px] text-text-muted">
                <AlertCircle className="h-3 w-3" />
                Insight: {plan.insightOrigin}
              </span>
            )}
            {conversationTitle && (
              <span className="flex items-center gap-1 text-[11px] text-text-muted">
                <ClipboardList className="h-3 w-3" />
                Conversación: {conversationTitle}
              </span>
            )}
            {projectName && (
              <span className="flex items-center gap-1 text-[11px] text-text-muted">
                <Tag className="h-3 w-3" />
                Proyecto: {projectName}
              </span>
            )}
            {goalName && (
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-primary/25 bg-primary/8 text-primary-soft font-medium">
                <CheckCircle2 className="h-3 w-3" />
                {goalName}
              </span>
            )}
            {plan.owner && (
              <span className="flex items-center gap-1 text-[11px] text-text-muted">
                <User className="h-3 w-3" />
                {plan.owner}
              </span>
            )}
            {formattedDate && (
              <span className="flex items-center gap-1 text-[11px] text-text-muted">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
            )}
            {plan.area && (
              <span className="flex items-center gap-1 text-[11px] text-text-muted">
                <Tag className="h-3 w-3" />
                {plan.area}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {plan.items.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-text-muted">{doneCount}/{plan.items.length} tareas</span>
            <span className="text-[11px] text-text-muted">{progress}%</span>
          </div>
          <div className="h-1 rounded-full bg-surface-soft overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Checklist */}
      {expanded && plan.items.length > 0 && (
        <div className="border-t border-border px-4 py-3 space-y-2">
          {plan.items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (!canEdit) return;
                toggleItem(plan.id, item.id);
              }}
              disabled={!canEdit}
              className="w-full flex items-start gap-2.5 text-left group disabled:cursor-default"
            >
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-4 w-4 text-text-muted group-hover:text-text-secondary flex-shrink-0 mt-0.5 transition-colors" />
              )}
              <span className={cn("text-xs leading-relaxed transition-colors", item.done ? "line-through text-text-muted" : "text-text-secondary group-hover:text-text-primary")}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {expanded && plan.items.length === 0 && (
        <div className="border-t border-border px-4 py-3">
          <p className="text-xs text-text-muted text-center">Sin tareas definidas</p>
        </div>
      )}
    </div>
  );
}

export default function ActionPlansPage() {
  const { plans } = useActionPlanStore();
  const { projects, conversations } = useChatStore();
  const [filter, setFilter] = useState<ActionPlanStatus | "all">("all");

  const filtered = filter === "all" ? plans : plans.filter((p) => p.status === filter);

  const counts: Record<ActionPlanStatus | "all", number> = {
    all: plans.length,
    draft: plans.filter((p) => p.status === "draft").length,
    active: plans.filter((p) => p.status === "active").length,
    completed: plans.filter((p) => p.status === "completed").length,
    blocked: plans.filter((p) => p.status === "blocked").length,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="border-b border-border bg-surface px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-base font-semibold text-text-primary">Planes de acción</h1>
            <p className="text-xs text-text-muted mt-0.5">Los planes convierten insights en tareas accionables para seguimiento comercial.</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="border-b border-border bg-surface px-6 flex-shrink-0 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {(["all", "active", "draft", "blocked", "completed"] as const).map((s) => {
            const isAll = s === "all";
            const cfg = isAll ? null : STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                  filter === s
                    ? "border-primary text-primary"
                    : "border-transparent text-text-muted hover:text-text-secondary"
                )}
              >
                {isAll ? "Todos" : cfg!.label}
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                  filter === s ? "bg-primary/15 text-primary" : "bg-surface-soft text-text-muted"
                )}>
                  {counts[s]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
            <div className="h-14 w-14 rounded-2xl bg-surface-soft flex items-center justify-center">
              <ClipboardList className="h-7 w-7 text-text-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary">
                {filter === "all" ? "No hay planes aún" : `No hay planes ${STATUS_CONFIG[filter as ActionPlanStatus].label.toLowerCase()}s`}
              </p>
              <p className="text-xs text-text-muted mt-1">
                Los planes se crean desde el chat al analizar datos con el asistente.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted bg-surface-soft px-4 py-2.5 rounded-lg border border-border">
              <Plus className="h-3.5 w-3.5" />
              Pedile al asistente &ldquo;Crear un plan de acción&rdquo; en el chat
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {filtered.map((plan) => {
              const linkedProject = projects.find((p) => p.id === plan.projectId);
              const linkedGoal = linkedProject?.goals?.find((g) => g.id === plan.goalId);
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  projectName={linkedProject?.name}
                  goalName={linkedGoal?.name}
                  conversationTitle={conversations.find((c) => c.id === plan.conversationId)?.title}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

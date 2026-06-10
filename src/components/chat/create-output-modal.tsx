"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ClipboardList, Target, Lightbulb, Presentation, CheckCircle, Loader2, BookOpen } from "lucide-react";
import { sleep } from "@/lib/utils";

export type OutputActionType = "plan" | "goal" | "insight" | "presentation" | "brief";

interface CreateOutputModalProps {
  open: boolean;
  actionType: OutputActionType;
  projectName?: string;
  estimatedItems?: number;
  /** Called synchronously when user clicks Confirm; modal handles the loading state */
  onConfirm: () => void | Promise<void>;
  /** Called from × button (confirm phase) — no entity was created */
  onClose: () => void;
  /** Called from "Cerrar" button in success phase — entity was created */
  onSuccess: () => void;
  /** Called from "Ver…" button in success phase */
  onNavigate?: () => void;
}

type Phase = "confirm" | "loading" | "success";

const CONFIG: Record<OutputActionType, {
  icon: React.ElementType;
  title: string;
  description: string;
  confirmLabel: string;
  loadingText: string;
  successTitle: string;
  successText: string;
  navigateLabel: string;
}> = {
  plan: {
    icon: ClipboardList,
    title: "Crear plan de acción",
    description: "Nexus puede convertir esta respuesta en un plan de acción estructurado con tareas y responsables para este proyecto.",
    confirmLabel: "Crear plan de acción",
    loadingText: "Nexus está creando el plan de acción...",
    successTitle: "Plan de acción creado",
    successText: "El plan fue agregado al proyecto y está disponible en la pestaña Plan de acción.",
    navigateLabel: "Ver plan de acción",
  },
  goal: {
    icon: Target,
    title: "Crear objetivo",
    description: "Nexus puede convertir los KPIs y recomendaciones de esta respuesta en un objetivo medible para el proyecto.",
    confirmLabel: "Crear objetivo",
    loadingText: "Nexus está creando el objetivo...",
    successTitle: "Objetivo creado",
    successText: "El objetivo fue agregado al proyecto y está disponible en la pestaña Objetivos.",
    navigateLabel: "Ver objetivos",
  },
  insight: {
    icon: Lightbulb,
    title: "Crear insight",
    description: "Nexus puede registrar el hallazgo principal de esta respuesta como un insight estructurado en el proyecto.",
    confirmLabel: "Crear insight",
    loadingText: "Nexus está creando el insight...",
    successTitle: "Insight creado",
    successText: "El insight fue agregado al proyecto y está disponible en la pestaña Insights.",
    navigateLabel: "Ver insights",
  },
  presentation: {
    icon: Presentation,
    title: "Preparar presentación",
    description: "Nexus puede preparar la estructura de una presentación ejecutiva a partir de esta conversación.",
    confirmLabel: "Preparar presentación",
    loadingText: "Nexus está preparando la presentación...",
    successTitle: "Presentación preparada",
    successText: "La estructura de presentación fue preparada a partir de esta conversación y está disponible en Archivos.",
    navigateLabel: "Ver archivos",
  },
  brief: {
    icon: BookOpen,
    title: "Completar brief",
    description: "Nexus puede convertir esta respuesta en el brief inicial del proyecto, completando problema, hipótesis, estrategia y resultado esperado.",
    confirmLabel: "Completar brief",
    loadingText: "Nexus está completando el brief del proyecto...",
    successTitle: "Brief completado",
    successText: "El brief fue actualizado y ya está disponible en el resumen del proyecto.",
    navigateLabel: "Ver resumen",
  },
};

const ITEM_LABELS: Record<OutputActionType, string> = {
  plan: "Tareas estimadas",
  goal: "KPIs detectados",
  insight: "Hallazgos detectados",
  presentation: "Secciones estimadas",
  brief: "Secciones completadas",
};

export function CreateOutputModal({
  open,
  actionType,
  projectName,
  estimatedItems,
  onConfirm,
  onClose,
  onSuccess,
  onNavigate,
}: CreateOutputModalProps) {
  const [phase, setPhase] = useState<Phase>("confirm");
  const cfg = CONFIG[actionType];
  const Icon = cfg.icon;

  // Reset to confirm state each time the modal opens (deferred to avoid sync setState-in-effect)
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setPhase("confirm"), 0);
    return () => clearTimeout(t);
  }, [open]);

  async function handleConfirm() {
    setPhase("loading");
    await sleep(700);
    await onConfirm();
    setPhase("success");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={phase === "loading" ? undefined : (phase === "confirm" ? onClose : onSuccess)}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -8 }}
          transition={{ duration: 0.18 }}
          className="relative z-10 bg-surface-elevated border border-border rounded-xl shadow-2xl w-full max-w-md"
        >
          {phase === "confirm" && (
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary-soft" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{cfg.title}</h3>
                    {projectName && (
                      <p className="text-[11px] text-text-muted mt-0.5 truncate max-w-[220px]">{projectName}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-text-muted hover:text-text-primary transition-colors ml-2 flex-shrink-0 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-sm text-text-secondary leading-relaxed mb-4">{cfg.description}</p>

              <div className="rounded-lg border border-border bg-surface px-3.5 py-3 mb-5 space-y-2">
                <Row label="Origen" value="Conversación actual" />
                {projectName && <Row label="Proyecto" value={projectName} truncate />}
                {estimatedItems !== undefined && estimatedItems > 0 && (
                  <Row label={ITEM_LABELS[actionType]} value={String(estimatedItems)} />
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-1.5 text-xs font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  {cfg.confirmLabel}
                </button>
              </div>
            </div>
          )}

          {phase === "loading" && (
            <div className="p-10 flex flex-col items-center text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-sm text-text-secondary">{cfg.loadingText}</p>
            </div>
          )}

          {phase === "success" && (
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-success/10 border border-success/25 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">{cfg.successTitle}</h3>
              <p className="text-xs text-text-muted leading-relaxed mb-5 max-w-xs mx-auto">{cfg.successText}</p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={onSuccess}
                  className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
                >
                  Cerrar
                </button>
                {onNavigate && (
                  <button
                    onClick={onNavigate}
                    className="px-4 py-1.5 text-xs font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    {cfg.navigateLabel} →
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value, truncate }: { label: string; value: string; truncate?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-text-muted flex-shrink-0">{label}</span>
      <span className={truncate ? "text-text-secondary truncate max-w-[180px] ml-2" : "text-text-secondary"}>
        {value}
      </span>
    </div>
  );
}

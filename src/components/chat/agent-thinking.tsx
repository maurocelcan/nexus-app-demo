"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentThinkingProps {
  steps: { label: string; status: "pending" | "running" | "done" }[];
}

export function AgentThinking({ steps }: AgentThinkingProps) {
  return (
    <div className="flex gap-3 py-4">
      <div className="h-8 w-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-xs font-bold text-primary">N</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-text-muted mb-3 font-medium uppercase tracking-wide">Nexus está analizando…</div>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-2.5"
            >
              <div className={cn(
                "h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0",
                step.status === "done" && "bg-success/15",
                step.status === "running" && "bg-primary/15",
                step.status === "pending" && "bg-surface-soft"
              )}>
                {step.status === "done" && <Check className="h-3 w-3 text-success" />}
                {step.status === "running" && <Loader2 className="h-3 w-3 text-primary animate-spin" />}
                {step.status === "pending" && <span className="h-1.5 w-1.5 rounded-full bg-border" />}
              </div>
              <span className={cn(
                "text-sm transition-colors",
                step.status === "done" && "text-text-secondary line-through",
                step.status === "running" && "text-text-primary",
                step.status === "pending" && "text-text-muted"
              )}>
                {step.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ArrowUp, Check, ChevronRight } from "lucide-react";
import type { LandingScenario } from "@/types/landing";
import { alpha, tokenColor } from "./landing-style";

export type ChatPhase =
  | "idle"
  | "typing"
  | "sent"
  | "analyzing"
  | "reveal"
  | "kpis"
  | "actions"
  | "complete"
  | "clearing";

interface SimulatedChatProps {
  scenario: LandingScenario;
  phase: ChatPhase;
  typedText: string;
}

function NAvatar({ size = 22 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border border-primary/45 bg-primary/15"
      style={{ width: size, height: size }}
    >
      <span
        className="select-none font-bold leading-none text-primary-soft"
        style={{ fontSize: Math.round(size * 0.46) }}
      >
        N
      </span>
    </div>
  );
}

function ThinkingBlock({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="flex items-start gap-2.5 fade-in">
      <NAvatar size={22} />
      <div className="flex flex-col gap-2 pt-0.5">
        <span className="text-[9px] uppercase tracking-widest text-text-muted">
          Analizando
        </span>
        <div className="flex flex-col gap-1.5">
          {steps.map((step, index) => {
            const isDone = index < currentStep;
            const isActive = index === currentStep;

            return (
              <div key={step} className="flex items-center gap-2">
                {isDone ? (
                  <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-success/15">
                    <Check className="h-2 w-2 text-success" />
                  </div>
                ) : isActive ? (
                  <div
                    className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-t-transparent"
                    style={{
                      borderColor: `${tokenColor("primary")} transparent ${tokenColor("primary")} ${tokenColor("primary")}`,
                    }}
                  />
                ) : (
                  <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-border" />
                )}
                <span
                  className="text-[12px] leading-none transition-colors duration-200"
                  style={{
                    color: isActive
                      ? tokenColor("textPrimary")
                      : tokenColor("textMuted"),
                    textDecoration: isDone ? "line-through" : "none",
                    opacity: isDone ? 0.55 : 1,
                  }}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SimulatedChat({
  scenario,
  phase,
  typedText,
}: SimulatedChatProps) {
  const [thinkingStep, setThinkingStep] = useState(0);

  useEffect(() => {
    if (phase !== "analyzing") return;

    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setThinkingStep(0), 0),
    ];
    scenario.thinkingSteps.forEach((_, index) => {
      if (index === 0) return;
      timers.push(setTimeout(() => setThinkingStep(index), index * 370));
    });

    return () => timers.forEach(clearTimeout);
  }, [phase, scenario.thinkingSteps]);

  const showUserMessage = phase !== "idle" && phase !== "typing";
  const showThinking = phase === "analyzing";
  const showResponse =
    phase === "reveal" ||
    phase === "kpis" ||
    phase === "actions" ||
    phase === "complete" ||
    phase === "clearing";
  const showKpis =
    phase === "kpis" ||
    phase === "actions" ||
    phase === "complete" ||
    phase === "clearing";
  const showActions =
    phase === "actions" || phase === "complete" || phase === "clearing";
  const isProcessing = phase === "sent" || phase === "analyzing";

  return (
    <div
      className="flex h-full flex-col overflow-hidden transition-opacity duration-500"
      style={{ opacity: phase === "clearing" ? 0 : 1 }}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border-soft px-4 py-2.5">
        <div className="flex items-center gap-2">
          <NAvatar size={24} />
          <span className="text-[12px] font-medium text-text-secondary">
            Nexus
          </span>
          <div className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
        </div>
        <span className="text-[9px] uppercase tracking-widest text-text-muted">
          Live
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
        {showUserMessage && (
          <div className="flex justify-end fade-in-up">
            <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2 text-[13px] leading-relaxed text-white">
              {scenario.question}
            </div>
          </div>
        )}

        {showThinking && (
          <ThinkingBlock
            steps={scenario.thinkingSteps}
            currentStep={thinkingStep}
          />
        )}

        {showResponse && (
          <div className="flex items-start gap-2.5 fade-in">
            <NAvatar size={22} />
            <div className="flex min-w-0 flex-1 flex-col gap-2.5 pt-0.5">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-medium uppercase tracking-widest text-primary-soft">
                  Executive Summary
                </span>
                <p className="text-[13px] leading-relaxed text-text-secondary">
                  {scenario.answer}
                </p>
              </div>

              {showKpis && (
                <div
                  className="grid grid-cols-2 gap-1.5"
                  style={{ animation: "fade-in-up 0.35s ease both" }}
                >
                  {scenario.kpis.map((kpi) => (
                    <div
                      key={kpi.label}
                      className="flex flex-col gap-0.5 rounded-lg border border-border-soft bg-surface px-2.5 py-1.5"
                    >
                      <span className="text-[9px] uppercase tracking-widest text-text-muted">
                        {kpi.label}
                      </span>
                      <span
                        className="text-[13px] font-semibold leading-none tabular-nums"
                        style={{ color: tokenColor(kpi.color) }}
                      >
                        {kpi.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {showActions && (
                <div
                  className="flex flex-col gap-1"
                  style={{ animation: "fade-in-up 0.35s ease 0.1s both" }}
                >
                  <span className="text-[9px] font-medium uppercase tracking-widest text-text-muted">
                    Acciones sugeridas
                  </span>
                  {scenario.actions.map((action) => (
                    <div key={action} className="flex items-start gap-1.5">
                      <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                      <span className="text-[12px] leading-relaxed text-text-secondary">
                        {action}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 px-4 pb-4 pt-1">
        <div
          className="flex items-center gap-3 rounded-xl border bg-surface px-4 py-2.5 transition-all duration-200"
          style={{
            borderColor:
              phase === "typing" ? alpha("primary", 0.65) : tokenColor("border"),
          }}
        >
          <span className="min-h-[18px] flex-1 select-none text-[13px]">
            {phase === "typing" ? (
              <>
                <span className="text-text-primary">{typedText}</span>
                <span className="ml-0.5 inline-block h-[13px] w-0.5 bg-primary align-middle cursor-blink" />
              </>
            ) : (
              <span className="text-text-muted">
                Pregunta a Nexus sobre tu negocio...
              </span>
            )}
          </span>
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all duration-200"
            style={{
              background: isProcessing
                ? tokenColor("primary")
                : tokenColor("surfaceElevated"),
              color: isProcessing ? "white" : tokenColor("textMuted"),
            }}
          >
            <ArrowUp className="h-3 w-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

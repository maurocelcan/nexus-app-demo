"use client";

import { useEffect, useState } from "react";
import { LANDING_SCENARIOS } from "@/data/landing-home";
import { tokens } from "@/theme/tokens";
import type { LandingEcosystemCard } from "@/types/landing";
import { alpha, radialGlow, tokenColor } from "./landing-style";
import { NeuralBackground } from "./neural-background";
import { SimulatedChat, type ChatPhase } from "./simulated-chat";

const SLOTS = [
  { top: "8%", right: "3%", float: "float-1", mobile: true },
  { top: "8%", left: "2%", float: "float-2", mobile: false },
  { top: "43%", right: "2%", float: "float-3", mobile: false },
  { top: "43%", left: "2%", float: "float-1", mobile: false },
  { bottom: "9%", right: "3%", float: "float-2", mobile: true },
  { bottom: "9%", left: "3%", float: "float-3", mobile: false },
] as const;

const PHASE_SLOTS: Record<ChatPhase, number[]> = {
  idle: [],
  typing: [],
  sent: [],
  analyzing: [0],
  reveal: [0, 4],
  kpis: [0, 1, 4, 5],
  actions: [0, 1, 2, 3, 4, 5],
  complete: [0, 1, 2, 3, 4, 5],
  clearing: [],
};

const TIMING = {
  IDLE: 550,
  SENT: 220,
  ANALYZING: 1200,
  REVEAL: 340,
  KPIS: 400,
  ACTIONS: 340,
  COMPLETE: 3000,
  CLEARING: 500,
};

function EcoCard({ card }: { card: LandingEcosystemCard }) {
  const color = tokenColor(card.color);

  return (
    <div
      className="glass-card min-w-24 select-none rounded-xl px-3 py-2.5"
      style={{
        boxShadow: `0 0 14px ${alpha(card.color, 0.1)}, 0 0 28px ${alpha(card.color, 0.05)}`,
      }}
    >
      <div className="mb-1 flex items-center gap-1.5">
        <div
          className="h-1.5 w-1.5 shrink-0 rounded-full opacity-85"
          style={{ background: color }}
        />
        <span
          className="text-[9px] font-medium uppercase leading-none tracking-widest"
          style={{ color }}
        >
          {card.tag}
        </span>
      </div>
      <span
        className="text-[13px] font-semibold leading-none tabular-nums"
        style={{ color }}
      >
        {card.value}
      </span>
    </div>
  );
}

export function CommercialBrainPreview() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [phase, setPhase] = useState<ChatPhase>("idle");
  const [typedText, setTypedText] = useState("");

  const scenario = LANDING_SCENARIOS[scenarioIndex];
  const visibleSlots = PHASE_SLOTS[phase];

  useEffect(() => {
    if (phase !== "idle") return;
    const timer = setTimeout(() => setPhase("typing"), TIMING.IDLE);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "typing") return;
    const question = scenario.question;

    if (typedText.length < question.length) {
      const timer = setTimeout(
        () => setTypedText(question.slice(0, typedText.length + 1)),
        46 + Math.random() * 30,
      );
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => setPhase("sent"), TIMING.SENT);
    return () => clearTimeout(timer);
  }, [phase, typedText, scenario.question]);

  useEffect(() => {
    if (phase !== "sent") return;
    const timer = setTimeout(() => setPhase("analyzing"), 240);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "analyzing") return;
    const timer = setTimeout(() => setPhase("reveal"), TIMING.ANALYZING);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "reveal") return;
    const timer = setTimeout(() => setPhase("kpis"), TIMING.REVEAL);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "kpis") return;
    const timer = setTimeout(() => setPhase("actions"), TIMING.KPIS);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "actions") return;
    const timer = setTimeout(() => setPhase("complete"), TIMING.ACTIONS);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "complete") return;
    const timer = setTimeout(() => setPhase("clearing"), TIMING.COMPLETE);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "clearing") return;
    const timer = setTimeout(() => {
      setTypedText("");
      setScenarioIndex((index) => (index + 1) % LANDING_SCENARIOS.length);
      setPhase("idle");
    }, TIMING.CLEARING);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="relative flex h-full flex-1 overflow-hidden">
      <NeuralBackground />
      <div className="grid-pattern pointer-events-none absolute inset-0" />

      <div
        className="pointer-events-none absolute glow-breathe"
        style={{
          top: "5%",
          left: "10%",
          width: "50%",
          height: "50%",
          background: radialGlow("primary", 0.06),
          filter: "blur(60px)",
        }}
      />
      <div
        className="pointer-events-none absolute glow-breathe"
        style={{
          bottom: "5%",
          right: "5%",
          width: "42%",
          height: "42%",
          background: radialGlow("accent", 0.04),
          filter: "blur(65px)",
          animationDelay: "3s",
        }}
      />

      {scenario.ecosystemCards.map((card, index) => {
        const slot = SLOTS[index];
        const visible = visibleSlots.includes(index);

        return (
          <div
            key={`${scenario.id}-${card.tag}`}
            className={`absolute ${slot.float} transition-all duration-500 ${
              slot.mobile ? "" : "hidden md:block"
            }`}
            style={{
              top: "top" in slot ? slot.top : undefined,
              bottom: "bottom" in slot ? slot.bottom : undefined,
              left: "left" in slot ? slot.left : undefined,
              right: "right" in slot ? slot.right : undefined,
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(10px) scale(0.93)",
              pointerEvents: "none",
            }}
          >
            <EcoCard card={card} />
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="relative w-full overflow-hidden rounded-xl border border-border bg-surface/95 shadow-modal backdrop-blur-xl pointer-events-auto"
          style={{
            maxWidth: 400,
            margin: "0 clamp(20px, 5.5vw, 60px)",
            height: "clamp(320px, 48vh, 440px)",
            boxShadow:
              `0 0 0 1px ${alpha("primary", 0.08)}, ` +
              `0 0 60px ${alpha("primary", 0.1)}, ` +
              tokens.shadows.modal,
          }}
        >
          <SimulatedChat
            scenario={scenario}
            phase={phase}
            typedText={typedText}
          />
        </div>
      </div>
    </div>
  );
}

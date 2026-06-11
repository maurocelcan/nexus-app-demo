"use client";

import { useEffect, useRef, useState } from "react";
import { LANDING_BOOT_MESSAGES } from "@/data/landing-home";
import { NexusLogo } from "@/components/layout/logo";
import { alpha, radialGlow } from "./landing-style";

interface InitialLoaderProps {
  onComplete: () => void;
}

export function InitialLoader({ onComplete }: InitialLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    const timers = [
      setTimeout(() => setMessageIndex(1), 420),
      setTimeout(() => setMessageIndex(2), 840),
      setTimeout(() => setFading(true), 1350),
      setTimeout(() => onCompleteRef.current(), 1700),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-slow"
      style={{
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? "none" : "all",
      }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 blur-[50px]"
        style={{ background: radialGlow("primary", 0.1) }}
      />

      <div className="relative z-10 flex flex-col items-center gap-9">
        <NexusLogo size="lg" />

        <div className="flex flex-col items-center gap-3.5">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-1 w-1 rounded-full bg-primary"
                style={{
                  animation: `pulse-dot 1.3s ease-in-out ${item * 0.22}s infinite`,
                }}
              />
            ))}
          </div>
          <p key={messageIndex} className="m-0 text-xs text-text-muted fade-in">
            {LANDING_BOOT_MESSAGES[messageIndex]}
          </p>
        </div>

        <div className="h-px w-40 overflow-hidden rounded-full bg-border-soft">
          <div
            className="h-full origin-left"
            style={{
              background: `linear-gradient(90deg, ${alpha("primaryDark", 1)}, ${alpha("primary", 1)}, ${alpha("primarySoft", 1)})`,
              transform: "scaleX(0)",
              animation: "progress-fill 1.25s ease forwards 0.1s",
            }}
          />
        </div>
      </div>
    </div>
  );
}

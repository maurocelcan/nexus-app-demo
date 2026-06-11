"use client";

import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { NexusLogo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { LANDING_FOOTER_SIGNALS } from "@/data/landing-home";
import { ROUTES } from "@/lib/routes";
import { alpha, radialGlow } from "./landing-style";

export function HomeAccessPanel() {
  return (
    <div className="relative flex h-full w-full flex-col border-r border-border-soft px-7 py-7">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            `radial-gradient(ellipse 55% 35% at 45% 25%, ${alpha("primary", 0.05)} 0%, transparent 70%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 md:hidden"
        style={{ background: radialGlow("primary", 0.07) }}
      />

      <div className="relative z-10">
        <NexusLogo size="sm" />
      </div>

      <div className="relative z-10 mt-3 flex flex-1 flex-col justify-center gap-7">
        <div className="flex flex-col gap-3">
          <h1 className="text-[clamp(1.75rem,2vw,2.1rem)] font-bold leading-[1.08] text-text-primary">
            Tu negocio,
            <br />
            conectado y
            <br />
            listo para
            <br />
            decidir.
          </h1>
          <p className="max-w-60 text-[13px] leading-relaxed text-text-secondary">
            Inteligencia comercial operativa que conecta datos, KPIs y
            decisiones en un solo cerebro.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Link href={ROUTES.LOGIN} aria-label="Ingresar a Nexus">
            <Button variant="primary" size="lg" className="w-full">
              <LogIn className="h-3.5 w-3.5 opacity-80" />
              Ingresar
            </Button>
          </Link>
          <Link href={ROUTES.REGISTER} aria-label="Crear cuenta en Nexus">
            <Button variant="secondary" size="lg" className="w-full">
              <UserPlus className="h-3.5 w-3.5 opacity-70" />
              Crear cuenta
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-1.5 border-t border-border-soft pt-5">
        <span className="mb-1 text-[9px] font-medium uppercase tracking-widest text-text-muted">
          Enterprise Grade Security
        </span>
        {LANDING_FOOTER_SIGNALS.map(({ label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent pulse-dot" />
            <span className="text-[11px] text-text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

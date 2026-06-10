"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, Zap, BarChart2, MessageSquare, TrendingUp,
  CheckCircle2, Upload, DollarSign, ShoppingCart, Package,
  LineChart, FileDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NexusLogo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { YTD_2026 } from "@/data/mock-sales";
import { ROUTES } from "@/lib/routes";

const BULLETS = [
  "Preguntá en lenguaje natural sobre ventas, rentabilidad y ejecución.",
  "Detectá brechas vs objetivo con trazabilidad causal.",
  "Explicá KPIs con contexto y acciones concretas.",
  "Creá planes de acción y presentaciones ejecutivas.",
];

const MINI_KPIS = [
  { label: "Sell-in YTD", value: `${(YTD_2026.sellIn / 1000).toLocaleString("es-AR", { maximumFractionDigits: 1 })}K`, change: "+14%", positive: true },
  { label: "Net Revenue", value: `USD ${(YTD_2026.netRevenue / 1000000).toLocaleString("es-AR", { maximumFractionDigits: 1 })}M`, change: "+12%", positive: true },
  { label: "EBITDA", value: `USD ${Math.round(YTD_2026.ebitda / 1000)}K`, change: "+8%", positive: true },
  { label: "Passthrough", value: `${YTD_2026.passthrough}%`, change: "-5pp", positive: false },
];

const HOW_IT_WORKS: { step: string; icon: LucideIcon; title: string; desc: string }[] = [
  {
    step: "01",
    icon: Upload,
    title: "Conectá tus fuentes",
    desc: "Subí archivos Excel o CSV, o conectá Google Sheets, ERPs y CRMs. Sin código, sin fricción.",
  },
  {
    step: "02",
    icon: MessageSquare,
    title: "Preguntá en español",
    desc: "Hacé preguntas en lenguaje natural. Nexus traduce tu consulta a datos, métricas y gráficos.",
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Tomá decisiones",
    desc: "Recibí análisis con trazabilidad causal, recomendaciones accionables y planes de acción.",
  },
];

const AREAS: { icon: LucideIcon; label: string; desc: string }[] = [
  { icon: BarChart2, label: "Ventas", desc: "Sell-in por canal, cliente y SKU. Volumen, valor y evolución." },
  { icon: DollarSign, label: "RGM y Precio", desc: "Price index, passthrough, elasticidad y pricing estratégico." },
  { icon: ShoppingCart, label: "Trade y Ejecución", desc: "KPIs en punto de venta, cobertura, presencia y clientes." },
  { icon: TrendingUp, label: "Finanzas", desc: "Net Revenue, EBITDA, márgenes y evolución P&L." },
  { icon: Package, label: "Supply Chain", desc: "Cobertura de inventario, quiebres de stock y rotación." },
  { icon: LineChart, label: "Sell-Through", desc: "Sell-out por canal, inventario de cliente y eficiencia." },
];

const PDF_HIGHLIGHTS = [
  "Visión y propuesta de valor de Nexus",
  "Arquitectura del cerebro comercial agéntico",
  "Módulos: Ventas, RGM, Trade, Finanzas, Supply",
  "Casos de uso y demo CPG Portfolio",
];

const NAV_LINKS = [
  { label: "Producto", href: "#producto" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Presentación", href: "#presentacion" },
  { label: "Contacto", href: "#contacto" },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const fadeUpViewport = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function LandingPage() {
  const { isAuthenticated, isOnboarded } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(isOnboarded ? ROUTES.WORKSPACE : ROUTES.ONBOARDING);
    }
  }, [isAuthenticated, isOnboarded, router]);

  if (isAuthenticated) return null;

  return (
    <div className="bg-background">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[30%] w-[700px] h-[700px] bg-primary/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[-5%] w-[300px] h-[300px] bg-info/4 rounded-full blur-[80px]" />
      </div>

      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 md:px-10 py-4 max-w-7xl mx-auto">
          <Link href={ROUTES.HOME}>
            <NexusLogo size="md" />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href={ROUTES.LOGIN} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Iniciar sesión
            </Link>
            <Link href={ROUTES.REGISTER}>
              <Button variant="outline" size="sm">Crear cuenta</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-65px)]">
        {/* Left: value prop */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-16 py-12 lg:py-20">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-primary-soft text-xs font-medium mb-6">
              <Zap className="h-3 w-3" />
              Cerebro Comercial Agéntico · CPG
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary leading-tight mb-5">
              Convertí datos{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                comerciales
              </span>{" "}
              en decisiones accionables.
            </h1>

            <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-xl mb-8">
              Un workspace conversacional para analizar ventas, sell-out, rentabilidad, trade, supply y ejecución comercial desde una sola interfaz.
            </p>

            <ul className="space-y-2.5 mb-10">
              {BULLETS.map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-2.5 text-sm text-text-secondary"
                >
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  {b}
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link href={ROUTES.LOGIN}>
                <Button variant="primary" size="lg">
                  Iniciar sesión
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button variant="secondary" size="lg">
                  Crear cuenta
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right: app preview card */}
        <div className="lg:w-[480px] xl:w-[540px] flex-shrink-0 flex items-center justify-center px-6 md:px-10 py-12 lg:py-20">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="w-full space-y-3"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-accent/25 bg-accent/8 w-fit">
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs text-accent font-medium">Demo CPG Portfolio 2025-2026 · Andes Consumer Goods · YTD 2026</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {MINI_KPIS.map((kpi) => (
                <div key={kpi.label} className="rounded-lg border border-border bg-surface-elevated p-3">
                  <div className="text-[10px] text-text-muted uppercase tracking-wide mb-1">{kpi.label}</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-text-primary">{kpi.value}</span>
                    <span className={`text-xs font-medium ${kpi.positive ? "text-success" : "text-danger"}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-border bg-surface overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">N</span>
                </div>
                <span className="text-xs font-medium text-text-secondary">Nexus</span>
                <div className="ml-auto flex gap-1 items-center">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] text-text-muted">activo</span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-end">
                  <div className="bg-primary/15 border border-primary/25 rounded-xl px-3 py-2 text-xs text-text-primary max-w-[80%]">
                    ¿Por qué el Espumante tiene passthrough bajo?
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[9px] font-bold text-primary">N</span>
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="rounded-lg border border-border bg-surface-elevated p-2.5">
                      <div className="text-[10px] text-text-muted mb-1.5 uppercase tracking-wide">Resumen ejecutivo</div>
                      <div className="text-xs text-text-secondary leading-relaxed">
                        Passthrough del 53% — 19pp bajo benchmark. Acumulación de stock en Carrefour y Coto explica el 68% del problema.
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {["53% passthrough", "+38% stock canal", "−19pp gap"].map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-border px-3 py-2 flex items-center gap-2 bg-surface-elevated">
                <div className="flex-1 text-xs text-text-muted">Preguntá en lenguaje natural…</div>
                <div className="h-6 w-6 rounded-md bg-primary/20 flex items-center justify-center">
                  <ArrowRight className="h-3 w-3 text-primary" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {["Ventas", "RGM", "Finanzas", "Supply", "Trade", "Sell-Through"].map((area) => (
                <span key={area} className="text-[10px] px-2 py-1 rounded-md border border-border text-text-muted bg-surface-elevated">
                  {area}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="funcionalidades" className="relative z-10 py-24 border-t border-border/40">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <motion.div {...fadeUpViewport} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-text-muted text-xs font-medium mb-4">
              Proceso
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
              De datos dispersos a decisiones accionables
            </h2>
            <p className="text-text-secondary max-w-md mx-auto">
              Tres pasos para transformar tu información comercial en ventaja competitiva.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {HOW_IT_WORKS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="relative flex flex-col gap-4 rounded-xl border border-border bg-surface-elevated p-6 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-3xl font-bold text-border">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1.5">{item.title}</h3>
                    <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Áreas cubiertas */}
      <section id="producto" className="relative z-10 py-24 border-t border-border/40">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <motion.div {...fadeUpViewport} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-text-muted text-xs font-medium mb-4">
              Cobertura
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
              Todo tu negocio, en un solo lugar
            </h2>
            <p className="text-text-secondary max-w-md mx-auto">
              Nexus cubre las áreas comerciales críticas de empresas CPG y revenue teams.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {AREAS.map((area, i) => {
              const Icon = area.icon;
              return (
                <motion.div
                  key={area.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="flex items-start gap-3.5 rounded-xl border border-border bg-surface p-4 hover:border-primary/25 hover:bg-surface-elevated transition-all"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">{area.label}</h3>
                    <p className="text-xs text-text-muted leading-relaxed">{area.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PDF ejecutivo */}
      <section id="presentacion" className="relative z-10 py-24 border-t border-border/40">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <motion.div
            {...fadeUpViewport}
            className="rounded-2xl border border-primary/25 bg-primary/6 p-8 md:p-12 flex flex-col lg:flex-row items-center gap-10"
          >
            {/* Left: text + CTA */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/8 text-primary-soft text-xs font-medium mb-5">
                <FileDown className="h-3 w-3" />
                PDF ejecutivo
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                Conocé Nexus en detalle
              </h2>
              <p className="text-text-secondary max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed">
                Descargá una presentación ejecutiva con la visión, funcionalidades y propuesta de valor de Nexus para equipos de consumo masivo.
              </p>
              <a
                href="/nexus-presentacion.pdf"
                download="nexus-presentacion.pdf"
                aria-label="Descargar presentación ejecutiva de Nexus en PDF"
              >
                <Button variant="primary" size="lg">
                  <FileDown className="h-4 w-4" />
                  Descargar PDF
                </Button>
              </a>
            </div>

            {/* Right: highlights card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="w-full lg:w-72 rounded-xl border border-border bg-surface-elevated p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                  <FileDown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">Nexus — Presentación</p>
                  <p className="text-[10px] text-text-muted">Documento ejecutivo · PDF</p>
                </div>
              </div>
              <div className="h-px bg-border/60" />
              <ul className="space-y-2.5">
                {PDF_HIGHLIGHTS.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-text-secondary">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 pt-1">
                <Zap className="h-3 w-3 text-accent" />
                <span className="text-[10px] text-text-muted">Actualizado · 2026</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="relative z-10 border-t border-border/40 bg-surface">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <NexusLogo size="md" />
              <p className="text-xs text-text-muted mt-2 max-w-xs">
                Cerebro comercial agéntico para equipos de consumo masivo y revenue.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs text-text-muted hover:text-text-secondary transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Link href={ROUTES.LOGIN} className="text-xs text-text-muted hover:text-text-secondary transition-colors">
                Iniciar sesión
              </Link>
              <Link href={ROUTES.REGISTER} className="text-xs text-text-muted hover:text-text-secondary transition-colors">
                Crear cuenta
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-text-muted">© 2026 Nexus. Todos los derechos reservados.</p>
            <div className="flex gap-5">
              <span className="text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer">Términos</span>
              <span className="text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer">Privacidad</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

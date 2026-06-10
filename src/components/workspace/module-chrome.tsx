"use client";
import type { ComponentType } from "react";
import { BarChart3, Calendar, DollarSign, Map, Megaphone, Package, PieChart, ShoppingCart, Sparkles, Upload, Users, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { activateFullDemo } from "@/lib/demo";
import { ROUTES } from "@/lib/routes";
import { useChatStore } from "@/stores/chat-store";
import { useAuthStore } from "@/stores/auth-store";
import { canCreateChat } from "@/lib/permissions";

export type ModuleChromeId =
  | "ventas"
  | "sell-through"
  | "finanzas"
  | "trade-marketing"
  | "supply"
  | "rgm"
  | "planning"
  | "crm"
  | "marketing";

type IconComponent = ComponentType<{ className?: string }>;

const MODULE_UI: Record<ModuleChromeId, {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  icon: IconComponent;
}> = {
  ventas: {
    title: "Ventas",
    description: "Sell-in, sell-out, passthrough, distribución y performance comercial.",
    emptyTitle: "Todavía no hay datos de ventas",
    emptyDescription: "Cargá un dataset de ventas para ver KPIs, sell-in, sell-out, passthrough, distribución numérica y análisis por canal.",
    icon: BarChart3,
  },
  "sell-through": {
    title: "Sell-Through",
    description: "PDVs, sell-out, rotación, cobertura, disponibilidad y ejecución comercial.",
    emptyTitle: "Todavía no hay datos de Sell-Through",
    emptyDescription: "Cargá un dataset para analizar PDVs, sell-out, passthrough, rotación, cobertura y disponibilidad.",
    icon: Map,
  },
  finanzas: {
    title: "Finanzas",
    description: "Revenue, margen, EBITDA, Opex, rentabilidad y drivers financieros.",
    emptyTitle: "Todavía no hay datos financieros",
    emptyDescription: "Cargá un dataset financiero para analizar revenue, margen, EBITDA, Opex, rentabilidad y drivers de valor.",
    icon: PieChart,
  },
  "trade-marketing": {
    title: "Trade Marketing",
    description: "Promociones, trade spend, ROI, exhibiciones y ejecución en punto de venta.",
    emptyTitle: "Todavía no hay datos de Trade Marketing",
    emptyDescription: "Cargá un dataset para analizar promociones, trade spend, ROI, exhibiciones y ejecución en punto de venta.",
    icon: ShoppingCart,
  },
  supply: {
    title: "Supply Chain",
    description: "OTIF, fill rate, inventario, cobertura, quiebres y abastecimiento.",
    emptyTitle: "Todavía no hay datos de Supply Chain",
    emptyDescription: "Cargá un dataset para analizar OTIF, fill rate, inventario, cobertura, quiebres y abastecimiento.",
    icon: Package,
  },
  rgm: {
    title: "RGM",
    description: "Pricing, price index, mix, elasticidad y oportunidades de revenue.",
    emptyTitle: "Todavía no hay datos de RGM",
    emptyDescription: "Cargá un dataset para analizar pricing, price index, mix, elasticidad y oportunidades de revenue.",
    icon: DollarSign,
  },
  planning: {
    title: "Planning",
    description: "Forecast, escenarios, demanda, variaciones y planificación comercial.",
    emptyTitle: "Todavía no hay datos de Planning",
    emptyDescription: "Cargá un dataset para analizar forecast, escenarios, demanda, variaciones y planificación comercial.",
    icon: Calendar,
  },
  crm: {
    title: "CRM",
    description: "Clientes, cuentas, oportunidades, riesgos y performance comercial.",
    emptyTitle: "Todavía no hay datos de CRM",
    emptyDescription: "Cargá un dataset para analizar clientes, cuentas, oportunidades, riesgos y performance comercial.",
    icon: Users,
  },
  marketing: {
    title: "Marketing",
    description: "Campañas, market share, brand awareness, inversión por medio y penetración.",
    emptyTitle: "Todavía no hay datos de Marketing",
    emptyDescription: "Cargá un dataset con campañas, inversión por medio, market share o brand tracking para activar el módulo de Marketing.",
    icon: Megaphone,
  },
};

export function ModuleHeader({ moduleId }: { moduleId: ModuleChromeId }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const createConversation = useChatStore((s) => s.createConversation);
  const config = MODULE_UI[moduleId];
  const Icon = config.icon;
  const canChat = canCreateChat(user);

  function handleNewConsultation() {
    if (!canChat) return;
    // Create a scoped conversation for this module area, then navigate to chat
    createConversation(undefined, undefined, moduleId);
    router.push(ROUTES.WORKSPACE);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{config.title}</h1>
          <p className="text-sm text-text-muted">{config.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.DATA_SOURCES)}>
          <Upload className="h-3.5 w-3.5" />
          Cargar datos
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleNewConsultation}
          disabled={!canChat}
          title={canChat ? `Nueva consulta sobre ${config.title}` : "Solo lectura"}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Nueva consulta
        </Button>
      </div>
    </div>
  );
}

export function ModuleEmptyState({ moduleId }: { moduleId: ModuleChromeId }) {
  const router = useRouter();
  const config = MODULE_UI[moduleId];
  const Icon = config.icon;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-text-primary">{config.emptyTitle}</h2>
      <p className="mb-8 max-w-sm text-text-muted leading-relaxed">{config.emptyDescription}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="primary" size="lg" onClick={() => activateFullDemo()}>
          <Zap className="h-4 w-4" />
          Probar demo CPG
        </Button>
        <Button variant="secondary" size="lg" onClick={() => router.push(ROUTES.DATA_SOURCES)}>
          <Upload className="h-4 w-4" />
          Cargar dataset
        </Button>
      </div>
    </div>
  );
}

import type { User } from "@/types/auth";
import type { WorkspaceRole } from "@/types/workspace";
import type { Message } from "@/types/chat";
import { canAccessModule } from "@/lib/permissions";
import { generateId } from "@/lib/utils";
import {
  BUSINESS_AREAS,
  detectConversationAreas,
  getBusinessArea,
  normalizeAreaId,
  toRouteAreaId,
} from "@/data/business-areas";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PromptCategory =
  | "executive"
  | "ventas"
  | "finanzas"
  | "rgm"
  | "trade"
  | "supply"
  | "planning"
  | "analytics"
  | "general";

export interface ConversationPrompt {
  id: string;
  /** Short text shown on the button. If omitted, `question` is used. */
  displayText?: string;
  /** Full question text sent as the message. This is the source of truth. */
  question: string;
  requiredModules?: string[];
  requiredRoles?: WorkspaceRole[];
  category: PromptCategory;
}

export interface PromptButton {
  display: string;
  question: string;
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

const PROMPT_CATALOG: ConversationPrompt[] = [
  // ── Executive — Acto 1 del guion demo (YoY — preguntas principales) ───────
  {
    id: "exec-yoy-kpis",
    displayText: "¿Cómo estamos vs el año pasado en los KPIs?",
    question: "¿Cómo estamos vs el año pasado en los KPIs más importantes?",
    requiredModules: ["ventas", "finanzas"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "executive",
  },
  {
    id: "exec-ebitda-por-que",
    displayText: "¿Por qué el EBITDA creció más que el NR?",
    question: "¿Por qué el EBITDA creció 51% vs el año pasado si el NR solo creció 31%?",
    requiredModules: ["ventas", "finanzas"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "executive",
  },
  {
    id: "exec-prioridad-90",
    displayText: "¿Cuál es la prioridad para los próximos 90 días?",
    question: "¿Cuál es la prioridad concreta para los próximos 90 días?",
    requiredModules: ["ventas", "finanzas"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "executive",
  },

  // ── Executive — Acto 1 del guion demo (vs presupuesto) ────────────────────
  {
    id: "exec-ytd-vs-budget",
    displayText: "¿Cómo estamos vs presupuesto YTD 2026?",
    question: "¿Cómo estamos vs presupuesto YTD 2026? Necesito entender el desvío de performance.",
    requiredModules: ["ventas", "finanzas"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "executive",
  },
  {
    id: "exec-ebitda-desvio",
    question: "¿Cuál es el desvío de EBITDA vs presupuesto?",
    requiredModules: ["ventas", "finanzas"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "executive",
  },
  {
    id: "exec-drivers-core",
    question: "¿Dónde está el mayor problema: volumen, precio o mix?",
    requiredModules: ["ventas", "finanzas"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "executive",
  },

  // ── Executive — otros ──────────────────────────────────────────────────────
  {
    id: "exec-war-room",
    question: "Generame un war room de revenue para dirección",
    requiredRoles: ["owner", "admin"],
    requiredModules: ["ventas", "finanzas"],
    category: "executive",
  },
  {
    id: "exec-business-review",
    question: "Armá el Business Review ejecutivo para dirección",
    requiredRoles: ["owner", "admin", "manager"],
    requiredModules: ["ventas"],
    category: "executive",
  },
  {
    id: "exec-clientes-ebitda",
    question: "¿Qué clientes destruyen EBITDA?",
    requiredModules: ["finanzas", "ventas"],
    requiredRoles: ["owner", "admin"],
    category: "executive",
  },
  {
    id: "exec-ebitda-canal",
    question: "¿Qué canal aporta mayor EBITDA absoluto?",
    requiredModules: ["finanzas", "ventas"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "executive",
  },

  // ── Ventas ────────────────────────────────────────────────────────────────
  {
    id: "ventas-canal-crecimiento",
    displayText: "¿En qué canal está concentrado el crecimiento?",
    question: "¿En qué canal está concentrado el crecimiento y cuál es el problema de fondo?",
    requiredModules: ["ventas"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "ventas",
  },
  {
    id: "ventas-cobranza",
    displayText: "¿Hay problemas de cobranza en los distribuidores?",
    question: "¿Hay problemas de cobranza en los distribuidores?",
    requiredModules: ["ventas"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "ventas",
  },
  {
    id: "ventas-resumen-ytd",
    question: "Dame un resumen ejecutivo del portafolio YTD 2026",
    requiredModules: ["ventas"],
    category: "ventas",
  },
  {
    id: "ventas-canal-desvio",
    question: "¿En qué canal está concentrado el desvío y cuál es el problema de fondo?",
    requiredModules: ["ventas"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "ventas",
  },
  {
    id: "ventas-passthrough-espumante",
    question: "¿Por qué el Espumante tiene passthrough bajo en supermercados?",
    requiredModules: ["ventas", "sell-through"],
    category: "ventas",
  },
  {
    id: "ventas-t2t-carrefour",
    question: "Prepará un análisis Top 2 Top para Carrefour",
    requiredModules: ["ventas"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "ventas",
  },
  {
    id: "ventas-canal-share",
    question: "¿Qué canal pierde share vs el año anterior?",
    requiredModules: ["ventas"],
    category: "ventas",
  },
  {
    id: "ventas-top-clientes",
    question: "¿Cuáles son los 5 clientes con mayor sell-in YTD?",
    requiredModules: ["ventas"],
    category: "ventas",
  },

  // ── Sell-Through ──────────────────────────────────────────────────────────
  {
    id: "sellthrough-zonas-criticas",
    question: "¿En qué zonas geográficas tenemos el peor sell-through y qué está fallando en la ejecución?",
    displayText: "¿En qué zonas tenemos el peor sell-through?",
    requiredModules: ["sell-through"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "ventas",
  },
  {
    id: "sellthrough-dn-caida",
    question: "¿Dónde está cayendo la distribución numérica?",
    requiredModules: ["sell-through", "ventas"],
    category: "ventas",
  },
  {
    id: "sellthrough-ejecucion-pdv",
    question: "¿Cómo está la ejecución en el punto de venta?",
    requiredModules: ["sell-through"],
    category: "ventas",
  },
  {
    id: "sellthrough-passthrough-canal",
    question: "¿Cuál es el passthrough promedio por canal?",
    requiredModules: ["sell-through", "ventas"],
    category: "ventas",
  },

  // ── RGM ──────────────────────────────────────────────────────────────────
  {
    id: "rgm-price-index",
    question: "¿Cómo está el Price Index vs la competencia?",
    requiredModules: ["rgm"],
    category: "rgm",
  },
  {
    id: "rgm-simulacion-precio",
    question: "Simulá el impacto de subir precios 5% en Cerveza IPA",
    requiredModules: ["rgm"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "rgm",
  },
  {
    id: "rgm-descuento-gin",
    question: "¿Cuál es el impacto del descuento en el margen del Gin Botánico?",
    requiredModules: ["rgm", "finanzas"],
    category: "rgm",
  },

  // ── Trade Marketing ───────────────────────────────────────────────────────
  {
    id: "trade-roi-canal",
    question: "¿Cuál es el ROI del trade spend por canal?",
    requiredModules: ["trade-marketing"],
    category: "trade",
  },
  {
    id: "trade-mejor-promo",
    question: "¿Qué promo tuvo mejor ROI en el último trimestre?",
    requiredModules: ["trade-marketing", "ventas"],
    category: "trade",
  },
  {
    id: "trade-budget-libre",
    question: "¿Cuánto presupuesto de trade queda disponible para activar?",
    requiredModules: ["trade-marketing"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "trade",
  },

  // ── Finanzas ──────────────────────────────────────────────────────────────
  {
    id: "fin-ebitda-crecio-51",
    displayText: "¿Por qué el EBITDA creció 51% vs el NR que creció 31%?",
    question: "¿Por qué el EBITDA creció 51% vs el año pasado si el NR solo creció 31%?",
    requiredModules: ["finanzas"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "finanzas",
  },
  {
    id: "fin-impacto-margen",
    question: "¿Cómo impacta la caída de volumen en el margen con la estructura actual de costos?",
    displayText: "¿Cómo impacta la caída de volumen en el margen?",
    requiredModules: ["finanzas"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "finanzas",
  },
  {
    id: "fin-ebitda-q3",
    question: "¿Cuánto EBITDA perdemos si el volumen no se recupera en Q3?",
    requiredModules: ["finanzas"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "finanzas",
  },
  {
    id: "fin-prioridad-90-dias",
    question: "¿Cuál es la prioridad concreta para los próximos 90 días?",
    displayText: "¿Cuál es la prioridad para los próximos 90 días?",
    requiredModules: ["ventas", "finanzas"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "finanzas",
  },
  {
    id: "fin-ebitda-margen",
    question: "¿Cómo está el EBITDA vs target? ¿Dónde se pierde margen?",
    requiredModules: ["finanzas"],
    category: "finanzas",
  },
  {
    id: "fin-trade-spend-pct",
    question: "¿El trade spend está dentro del % presupuestado?",
    requiredModules: ["finanzas", "trade-marketing"],
    category: "finanzas",
  },

  // ── Supply ────────────────────────────────────────────────────────────────
  {
    id: "supply-oos-critico",
    question: "¿Qué SKUs tienen riesgo de OOS en las próximas 2 semanas?",
    requiredModules: ["supply"],
    category: "supply",
  },
  {
    id: "supply-otif",
    question: "¿Cómo está el OTIF global y qué clientes están en riesgo?",
    requiredModules: ["supply"],
    category: "supply",
  },
  {
    id: "supply-cobertura-sku",
    question: "Dame la cobertura de stock por SKU y zona geográfica",
    requiredModules: ["supply"],
    category: "supply",
  },

  // ── Planning ──────────────────────────────────────────────────────────────
  {
    id: "plan-q3-forecast",
    question: "¿Cuál es el escenario base de sell-out para Q3 2026?",
    requiredModules: ["planning", "ventas"],
    category: "planning",
  },
  {
    id: "plan-sku-discontinuacion",
    question: "¿Qué SKUs deberían discontinuarse por bajo margen?",
    requiredModules: ["planning", "finanzas"],
    requiredRoles: ["owner", "admin", "manager"],
    category: "planning",
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  {
    id: "analytics-tendencia-volumen",
    question: "¿Cómo evolucionó el volumen de sell-in por mes YTD?",
    requiredModules: ["ventas"],
    category: "analytics",
  },
  {
    id: "analytics-comparativa-sku",
    question: "Comparativa de performance por SKU — sell-in vs sell-out YTD",
    requiredModules: ["ventas"],
    category: "analytics",
  },
  {
    id: "analytics-distribucion-numerica",
    question: "¿Cómo está la distribución numérica efectiva por canal?",
    requiredModules: ["ventas", "sell-through"],
    category: "analytics",
  },

  // ── General / Viewer ──────────────────────────────────────────────────────
  {
    id: "general-resumen",
    question: "¿Cómo está la empresa en líneas generales?",
    category: "general",
  },
  {
    id: "general-highlights",
    question: "¿Cuáles son los principales highlights del período?",
    category: "general",
  },
];

// ─── Category priority (lower = shown first) ──────────────────────────────────

const CATEGORY_PRIORITY: Record<PromptCategory, number> = {
  executive: 1,
  finanzas: 2,
  ventas: 3,
  rgm: 4,
  trade: 5,
  supply: 6,
  planning: 7,
  analytics: 8,
  general: 9,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function canAccessPrompt(user: User | null, prompt: ConversationPrompt): boolean {
  if (!user) return prompt.category === "general";

  const role = user.workspaceRole ?? "viewer";

  if (prompt.requiredRoles && prompt.requiredRoles.length > 0) {
    if (!prompt.requiredRoles.includes(role)) return false;
  }

  if (prompt.requiredModules && prompt.requiredModules.length > 0) {
    const hasAtLeastOne = prompt.requiredModules.some((m) => canAccessModule(user, m));
    if (!hasAtLeastOne) return false;
  }

  // Viewers only get general prompts
  if (role === "viewer") return prompt.category === "general";

  return true;
}

function sortPrompts(prompts: ConversationPrompt[], user: User | null): ConversationPrompt[] {
  const role = user?.workspaceRole ?? "viewer";
  const modules = user?.enabledModules ?? [];

  return [...prompts].sort((a, b) => {
    const boost = (p: ConversationPrompt): number => {
      if (role === "analyst" && p.category === "analytics") return -2;
      if (modules.includes("supply") && !modules.includes("ventas") && p.category === "supply") return -2;
      if (modules.includes("finanzas") && !modules.includes("ventas") && p.category === "finanzas") return -2;
      if (modules.includes("trade-marketing") && p.category === "trade") return -1;
      return 0;
    };
    return (CATEGORY_PRIORITY[a.category] + boost(a)) - (CATEGORY_PRIORITY[b.category] + boost(b));
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Returns prompt buttons with separate display text and full question text. */
export function getPromptButtonsForUser(user: User | null, count = 6): PromptButton[] {
  const accessible = PROMPT_CATALOG.filter((p) => canAccessPrompt(user, p));
  const sorted = sortPrompts(accessible, user);
  return sorted.slice(0, count).map((p) => ({
    display: p.displayText ?? p.question,
    question: p.question,
  }));
}

/** Returns plain question strings (for contexts that only need the text). */
export function getPromptsForUser(user: User | null, count = 6): string[] {
  return getPromptButtonsForUser(user, count).map((b) => b.question);
}

export function getChatPlaceholder(user: User | null): string {
  if (!user) return "Hacé una pregunta…";
  switch (user.workspaceRole ?? "viewer") {
    case "owner":
      return "Analizá KPIs ejecutivos, revenue, EBITDA, trade, supply y más…";
    case "admin":
      return "Consultá ventas, finanzas, trade marketing, performance del equipo…";
    case "manager":
      return "Consultá KPIs de tu área, performance de canal, ejecución y resultados…";
    case "analyst":
      return "Explorá tendencias, comparativas y análisis de datasets comerciales…";
    case "viewer":
    default:
      return "Consultá información general disponible para tu rol…";
  }
}

// ─── Area metadata ─────────────────────────────────────────────────────────────

export interface AreaMeta {
  id: string;
  name: string;
  shortName: string;
  color: "primary" | "accent" | "success" | "warning" | "danger" | "info";
}

const AREA_COLOR_MAP: Record<string, AreaMeta["color"]> = {
  default: "info",
  accent: "accent",
  info: "info",
  warning: "warning",
  primary: "primary",
  success: "success",
};

export const AREA_META: AreaMeta[] = BUSINESS_AREAS.map((area) => ({
  id: area.routeId,
  name: area.label,
  shortName: area.shortLabel,
  color: AREA_COLOR_MAP[area.color] ?? "primary",
}));

export function getAreaMeta(areaId: string): AreaMeta | undefined {
  const normalized = normalizeAreaId(areaId);
  const area = getBusinessArea(normalized);
  return area ? AREA_META.find((a) => a.id === area.routeId) : undefined;
}

export function getAreaDisplayName(areaId: string): string {
  return getAreaMeta(areaId)?.name ?? areaId;
}

// ─── Area-scoped prompts ──────────────────────────────────────────────────────

/** Categories that each area maps to for scoped prompt filtering. */
const AREA_CATEGORIES: Record<string, PromptCategory[]> = {
  ventas:             ["ventas", "analytics"],
  "sell-through":     ["ventas", "analytics"],
  rgm:                ["rgm", "finanzas"],
  "trade-marketing":  ["trade", "ventas"],
  finanzas:           ["finanzas", "executive"],
  supply:             ["supply"],
  planning:           ["planning", "supply"],
};

/** Area-specific placeholder text (used when conversation is scoped). */
const AREA_PLACEHOLDERS: Record<string, string> = {
  ventas:             "Consultá sell-in, sell-out, canales, clientes y performance comercial…",
  "sell-through":     "Consultá distribución numérica, passthrough y ejecución en punto de venta…",
  rgm:                "Consultá price index, simulaciones de precio y elasticidad de la demanda…",
  "trade-marketing":  "Consultá ROI de trade, performance de promos y presupuesto disponible…",
  finanzas:           "Consultá EBITDA, márgenes, estructura de costos y trade spend %…",
  supply:             "Consultá OOS, OTIF, cobertura de stock y riesgo de desabasto…",
  planning:           "Consultá forecast Q3, escenarios de demanda y decisiones de portafolio…",
};

/**
 * Returns a placeholder string scoped to a specific area.
 * Falls back to the role-based global placeholder when area is unknown.
 */
export function getScopedChatPlaceholder(area: string, user: User | null): string {
  const routeId = getBusinessArea(normalizeAreaId(area))?.routeId ?? area;
  return AREA_PLACEHOLDERS[routeId] ?? getChatPlaceholder(user);
}

/**
 * Returns prompt buttons filtered and ordered for a specific area scope.
 * If the user doesn't have access to the area's module, returns global prompts.
 */
export function getAreaScopedPrompts(area: string, user: User | null, count = 6): PromptButton[] {
  const routeId = getBusinessArea(normalizeAreaId(area))?.routeId ?? area;
  const categories = AREA_CATEGORIES[routeId];
  if (!categories) return getPromptButtonsForUser(user, count);

  const accessible = PROMPT_CATALOG.filter(
    (p) => canAccessPrompt(user, p) && categories.includes(p.category)
  );
  // Fill up to count with global prompts if not enough area-specific ones
  if (accessible.length < count) {
    const extra = PROMPT_CATALOG.filter(
      (p) => canAccessPrompt(user, p) && !categories.includes(p.category)
    );
    const sorted = sortPrompts([...accessible, ...extra], user);
    return sorted.slice(0, count).map((p) => ({ display: p.displayText ?? p.question, question: p.question }));
  }
  const sorted = sortPrompts(accessible, user);
  return sorted.slice(0, count).map((p) => ({ display: p.displayText ?? p.question, question: p.question }));
}

// ─── Auto-classification ──────────────────────────────────────────────────────

/** Keywords that signal a message belongs to a specific area. */
/**
 * Classifies a message into a business area.
 * Returns the area id with the highest keyword match, or null if no match.
 * Only returns areas that are in the user's enabled modules.
 */
export function classifyMessageArea(message: string, enabledModules: string[]): string | null {
  const detected = detectConversationAreas(message).areaIds;
  const firstAllowed = detected.find((areaId) => {
    const routeId = toRouteAreaId(areaId);
    return routeId && (enabledModules.includes(routeId) || routeId === "ventas");
  });
  return firstAllowed ? toRouteAreaId(firstAllowed) ?? null : null;
}

// ─── Module restriction response ──────────────────────────────────────────────

/**
 * Detects if a message queries an area the user doesn't have access to.
 * Returns the restricted area id, or null if access is granted or area is unknown.
 */
export function detectRestrictedArea(message: string, user: User | null): string | null {
  if (!user) return null;
  const restricted = detectConversationAreas(message).areaIds.find((areaId) => {
    const routeId = toRouteAreaId(areaId);
    return routeId && !canAccessModule(user, routeId);
  });
  if (restricted) return toRouteAreaId(restricted) ?? null;
  return null;
}

/** Generates an elegant inline restriction message when user lacks module access. */
export function generateModuleRestrictionResponse(restrictedArea: string): Message {
  const name = getAreaDisplayName(restrictedArea);
  return {
    id: `msg-${generateId()}`,
    role: "assistant",
    content: `Esta consulta corresponde al módulo **${name}**, al que no tenés acceso en este workspace.\n\nPodés consultar las áreas habilitadas para tu rol. Si necesitás acceso a ${name}, solicitalo a un administrador.`,
    timestamp: new Date().toISOString(),
  };
}

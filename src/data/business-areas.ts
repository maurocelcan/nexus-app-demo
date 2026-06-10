import { ROUTES } from "@/lib/routes";

export type BusinessAreaId =
  | "sales"
  | "sell_through"
  | "finance"
  | "trade_marketing"
  | "supply_chain"
  | "rgm"
  | "planning"
  | "marketing";

export type BusinessAreaColor = "accent" | "default" | "info" | "warning" | "primary" | "success";

export interface BusinessAreaDefinition {
  id: BusinessAreaId;
  label: string;
  shortLabel: string;
  slug: string;
  routeId: string;
  route: string;
  color: BusinessAreaColor;
  icon: string;
  description: string;
  aliases: string[];
}

export const BUSINESS_AREAS: BusinessAreaDefinition[] = [
  {
    id: "sales",
    label: "Ventas",
    shortLabel: "Ventas",
    slug: "ventas",
    routeId: "ventas",
    route: ROUTES.VENTAS,
    color: "accent",
    icon: "TrendingUp",
    description: "Sell-in, sell-out, canales, clientes, volumen y revenue comercial.",
    aliases: ["ventas", "venta", "sales", "sell-in", "sell in", "sellin", "revenue", "clientes", "cliente", "canales", "canal", "volumen", "portfolio", "portafolio", "carrefour", "coto", "jumbo", "t2t", "top 2 top", "kam"],
  },
  {
    id: "sell_through",
    label: "Sell-Through",
    shortLabel: "Sell-Through",
    slug: "sell-through",
    routeId: "sell-through",
    route: ROUTES.SELL_THROUGH,
    color: "default",
    icon: "Map",
    description: "PDVs, sell-out, distribución numérica, passthrough, rotación y ejecución.",
    aliases: ["sell-through", "sell through", "sellthrough", "sell-out", "sell out", "sellout", "passthrough", "pass through", "pdv", "pdvs", "punto de venta", "distribución numérica", "distribucion numerica", "dn", "rotación", "rotacion", "compradores"],
  },
  {
    id: "finance",
    label: "Finanzas",
    shortLabel: "Finanzas",
    slug: "finanzas",
    routeId: "finanzas",
    route: ROUTES.FINANZAS,
    color: "info",
    icon: "PieChart",
    description: "Net revenue, EBITDA, margen, rentabilidad, P&L y costos.",
    aliases: ["finanzas", "finance", "financiero", "financial", "ebitda", "margen", "rentabilidad", "net revenue", "gross profit", "p&l", "pnl", "pl", "cogs", "opex", "presupuesto", "budget"],
  },
  {
    id: "trade_marketing",
    label: "Trade Marketing",
    shortLabel: "Trade",
    slug: "trade-marketing",
    routeId: "trade-marketing",
    route: ROUTES.TRADE_MARKETING,
    color: "warning",
    icon: "ShoppingCart",
    description: "Promociones, activaciones, exhibiciones, ROI y trade spend.",
    aliases: ["trade", "trade marketing", "promociones", "promoción", "promocion", "promo", "activaciones", "activación", "activacion", "exhibiciones", "exhibición", "exhibicion", "roi promocional", "trade spend", "material pop", "góndola", "gondola"],
  },
  {
    id: "supply_chain",
    label: "Supply Chain",
    shortLabel: "Supply",
    slug: "supply-chain",
    routeId: "supply",
    route: ROUTES.SUPPLY,
    color: "primary",
    icon: "Package",
    description: "Inventario, stock, OTIF, cobertura, abastecimiento y quiebres.",
    aliases: ["supply", "supply chain", "inventario", "inventory", "otif", "stock", "cobertura", "oos", "quiebre", "quiebres", "abasto", "abastecimiento", "fill rate", "logística", "logistica", "reposición", "reposicion"],
  },
  {
    id: "rgm",
    label: "RGM",
    shortLabel: "RGM",
    slug: "rgm",
    routeId: "rgm",
    route: ROUTES.RGM,
    color: "success",
    icon: "DollarSign",
    description: "Pricing, price index, elasticidad, mix y revenue growth management.",
    aliases: ["rgm", "pricing", "price", "precio", "precios", "price index", "índice de precio", "indice de precio", "elasticidad", "mix", "descuento", "descuentos", "asp", "revenue management"],
  },
  {
    id: "planning",
    label: "Planning",
    shortLabel: "Planning",
    slug: "planning",
    routeId: "planning",
    route: ROUTES.PLANNING,
    color: "primary",
    icon: "Calendar",
    description: "Forecast, escenarios, planificación, simulación y demanda.",
    aliases: ["planning", "forecast", "escenario", "escenarios", "planificación", "planificacion", "simulación", "simulacion", "demanda", "q3", "q4", "proyección", "proyeccion", "discontinuación", "discontinuacion"],
  },
  {
    id: "marketing",
    label: "Marketing",
    shortLabel: "Marketing",
    slug: "marketing",
    routeId: "marketing",
    route: ROUTES.MARKETING,
    color: "warning",
    icon: "Megaphone",
    description: "Campañas, market share, inversión por medio, brand awareness y penetración.",
    aliases: ["marketing", "campañas", "campaña", "campaign", "campaigns", "market share", "share of market", "brand", "marca", "marcas", "awareness", "brand awareness", "penetración", "penetracion", "share of voice", "sov", "media", "medio", "medios", "tv", "digital", "ooh", "roi campañas", "roi campaña", "inversión marketing", "inversion marketing", "nps", "net promoter"],
  },
];

const AREA_BY_ID = new Map(BUSINESS_AREAS.map((area) => [area.id, area]));
const AREA_BY_ROUTE_ID = new Map(BUSINESS_AREAS.map((area) => [area.routeId, area]));

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_/]+/g, "-")
    .replace(/\s+/g, " ");
}

const AREA_ALIAS_TO_ID = new Map<string, BusinessAreaId>();

for (const area of BUSINESS_AREAS) {
  const values = [area.id, area.label, area.shortLabel, area.slug, area.routeId, ...area.aliases];
  for (const value of values) {
    AREA_ALIAS_TO_ID.set(normalizeText(value), area.id);
    AREA_ALIAS_TO_ID.set(normalizeText(value).replace(/\s+/g, "-"), area.id);
    AREA_ALIAS_TO_ID.set(normalizeText(value).replace(/-/g, " "), area.id);
  }
}

export function getBusinessArea(id: BusinessAreaId | null | undefined): BusinessAreaDefinition | undefined {
  return id ? AREA_BY_ID.get(id) : undefined;
}

export function getBusinessAreaByRouteId(routeId: string | null | undefined): BusinessAreaDefinition | undefined {
  return routeId ? AREA_BY_ROUTE_ID.get(routeId) : undefined;
}

export function normalizeAreaId(value: unknown): BusinessAreaId | null {
  if (typeof value !== "string") return null;
  return AREA_ALIAS_TO_ID.get(normalizeText(value)) ?? null;
}

export function normalizeAreaIds(values: unknown): BusinessAreaId[] {
  const source = Array.isArray(values) ? values : values === undefined || values === null ? [] : [values];
  const ids: BusinessAreaId[] = [];
  for (const value of source) {
    const normalized = normalizeAreaId(value);
    if (normalized && !ids.includes(normalized)) ids.push(normalized);
  }
  return ids;
}

export function getAreaLabel(value: unknown): string {
  const id = normalizeAreaId(value);
  return getBusinessArea(id)?.label ?? (typeof value === "string" ? value : "");
}

function matchAlias(text: string, alias: string): boolean {
  const normalizedAlias = normalizeText(alias);
  if (normalizedAlias.length <= 3) {
    return new RegExp(`(^|[^a-z0-9])${normalizedAlias}([^a-z0-9]|$)`, "i").test(text);
  }
  return text.includes(normalizedAlias);
}

export function detectConversationAreas(input: string): { areaIds: BusinessAreaId[]; primaryAreaId?: BusinessAreaId } {
  const text = normalizeText(input);
  const scores = BUSINESS_AREAS.map((area) => {
    let score = 0;
    for (const alias of area.aliases) {
      if (matchAlias(text, alias)) {
        score += alias.length > 8 ? 3 : 1;
      }
    }
    return { id: area.id, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const areaIds = scores.map((item) => item.id);

  if (areaIds.length === 0 && /\bytd\b|resumen|performance|empresa|highlights|objetivo/.test(text)) {
    areaIds.push("sales");
  }

  return {
    areaIds,
    primaryAreaId: areaIds[0],
  };
}

export function toRouteAreaId(id: BusinessAreaId | null | undefined): string | undefined {
  return getBusinessArea(id)?.routeId;
}

export function fromRouteAreaId(value: string | null | undefined): BusinessAreaId | null {
  return normalizeAreaId(value);
}

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  ONBOARDING: "/onboarding",
  WORKSPACE: "/workspace",
  VENTAS: "/workspace/ventas",
  SELL_THROUGH: "/workspace/sell-through",
  FINANZAS: "/workspace/finanzas",
  TRADE_MARKETING: "/workspace/trade-marketing",
  SUPPLY: "/workspace/supply",
  RGM: "/workspace/rgm",
  PLANNING: "/workspace/planning",
  CRM: "/workspace/crm",
  MARKETING: "/workspace/marketing",
  ACTION_PLANS: "/workspace/action-plans",
  CONVERSATIONS: "/workspace/conversations",
  SETTINGS: "/workspace/settings",
  DATA_SOURCES: "/workspace/settings/data-sources",
} as const;

export const PROJECT_ROUTE = (id: string) => `/workspace/projects/${id}`;

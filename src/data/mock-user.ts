import type { User } from "@/types/auth";

export const MOCK_USER: User = {
  id: "user-001",
  name: "Mauro Celani",
  email: "mauro@cpgteam.com",
  company: "Andes Consumer Goods",
  role: "Head of Revenue",
  workspaceRole: "owner",
  enabledModules: ["ventas", "sell-through", "rgm", "trade-marketing", "finanzas", "supply", "planning"],
  bio: "Acceso estratégico completo — KPIs ejecutivos, P&L, revenue y decisiones cross-funcionales.",
  createdAt: "2024-01-15T10:00:00Z",
};

export const MOCK_PASSWORD = "nexus123";
export const DEMO_PASSWORD = "demo123";

// ─── Module display labels ────────────────────────────────────────────────────

export const MODULE_LABELS: Record<string, string> = {
  ventas: "Ventas",
  "sell-through": "Sell-Through",
  rgm: "RGM",
  "trade-marketing": "Trade",
  finanzas: "Finanzas",
  supply: "Supply",
  planning: "Planning",
};

// ─── Demo accounts ────────────────────────────────────────────────────────────

export const DEMO_ACCOUNTS: User[] = [
  // ── Owner (único) ─────────────────────────────────────────────────────
  MOCK_USER,

  // ── Admin ─────────────────────────────────────────────────────────────
  {
    id: "demo-admin",
    name: "Laura Gómez",
    email: "admin@nexus-demo.com",
    company: "Andes Consumer Goods",
    role: "Commercial Director",
    workspaceRole: "admin",
    enabledModules: ["ventas", "sell-through", "trade-marketing", "finanzas"],
    bio: "Gestión comercial integral — ventas, trade marketing, finanzas y equipos.",
    createdAt: "2024-02-01T09:00:00Z",
  },

  // ── Managers ──────────────────────────────────────────────────────────
  {
    id: "demo-manager",
    name: "Lucía Romero",
    email: "manager@nexus-demo.com",
    company: "Andes Consumer Goods",
    role: "Sales Manager",
    workspaceRole: "manager",
    enabledModules: ["ventas", "sell-through", "trade-marketing"],
    bio: "Ejecución comercial — KPIs de ventas, passthrough, canal y trade.",
    createdAt: "2024-02-15T11:00:00Z",
  },
  {
    id: "demo-revenue-manager",
    name: "Sebastián Mora",
    email: "revenue@nexus-demo.com",
    company: "Andes Consumer Goods",
    role: "Revenue Manager",
    workspaceRole: "manager",
    enabledModules: ["ventas", "finanzas", "rgm"],
    bio: "Revenue y pricing — P&L, Price Index, márgenes y optimización de revenue.",
    createdAt: "2024-03-01T09:00:00Z",
  },
  {
    id: "demo-trade-manager",
    name: "Valentina Cruz",
    email: "trade@nexus-demo.com",
    company: "Andes Consumer Goods",
    role: "Trade Marketing Lead",
    workspaceRole: "manager",
    enabledModules: ["ventas", "sell-through", "trade-marketing"],
    bio: "Activaciones y ROI — trade spend, promos, ejecución en punto de venta.",
    createdAt: "2024-03-10T10:00:00Z",
  },

  // ── Analysts ──────────────────────────────────────────────────────────
  {
    id: "demo-analyst",
    name: "Diego Pereira",
    email: "analyst@nexus-demo.com",
    company: "Andes Consumer Goods",
    role: "Revenue Analyst",
    workspaceRole: "analyst",
    enabledModules: ["ventas", "sell-through", "rgm", "finanzas"],
    bio: "Análisis multidimensional — tendencias, comparativas, sell-in/sell-out y pricing.",
    createdAt: "2024-03-01T08:00:00Z",
  },
  {
    id: "demo-finance-analyst",
    name: "Camila Ferreyra",
    email: "finance@nexus-demo.com",
    company: "Andes Consumer Goods",
    role: "Finance Analyst",
    workspaceRole: "analyst",
    enabledModules: ["finanzas", "rgm", "planning"],
    bio: "Análisis financiero — EBITDA, márgenes, trade spend y proyecciones.",
    createdAt: "2024-03-15T08:00:00Z",
  },
  {
    id: "demo-supply-planner",
    name: "Marcos Delgado",
    email: "supply@nexus-demo.com",
    company: "Andes Consumer Goods",
    role: "Supply Planner",
    workspaceRole: "analyst",
    enabledModules: ["supply", "ventas", "planning"],
    bio: "Planificación de abastecimiento — OOS, OTIF, cobertura y forecast.",
    createdAt: "2024-03-20T09:00:00Z",
  },

  // ── Viewer ────────────────────────────────────────────────────────────
  {
    id: "demo-viewer",
    name: "Rodrigo Ibáñez",
    email: "viewer@nexus-demo.com",
    company: "Andes Consumer Goods",
    role: "Regional Director",
    workspaceRole: "viewer",
    enabledModules: ["ventas", "sell-through"],
    bio: "Acceso de consulta — reportes y highlights del negocio para su región.",
    createdAt: "2024-03-20T14:00:00Z",
  },
];

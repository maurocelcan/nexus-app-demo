// Mock data — CRM module (Demo CPG Portfolio 2025-2026)
// Active direct clients: 1,396 | Active PDVs: 812

export const CRM_KPIS = {
  clientesActivos: { value: 1396, label: "Clientes Directos Activos", unit: "", change: 42, changeType: "positive" as const },
  concentracionTop10: { value: 34.2, label: "Concentración Top 10", unit: "%", change: 1.8, changeType: "negative" as const },
  clientesEnRiesgo: { value: 87, label: "Clientes en Riesgo", unit: "", change: 12, changeType: "negative" as const },
  nps: { value: 67, label: "NPS Clientes", unit: "", change: 3, changeType: "positive" as const },
  retencion: { value: 91.4, label: "Retención 12M", unit: "%", change: -1.2, changeType: "negative" as const },
  revPorCliente: { value: 3860, label: "Revenue/Cliente", unit: "USD", change: 7.1, changeType: "positive" as const },
};

// Top clients by revenue
export const TOP_CLIENTES = [
  { id: "cli-001", nombre: "Carrefour Argentina", canal: "Supermercados", revenue: 820000, share: 15.2, growth: 3.4, skus: 5, estado: "activo" as const, riesgo: "bajo" as const, nps: 72 },
  { id: "cli-002", nombre: "Coto CICSA", canal: "Supermercados", revenue: 540000, share: 10.0, growth: -2.1, skus: 4, estado: "activo" as const, riesgo: "medio" as const, nps: 58 },
  { id: "cli-003", nombre: "Jumbo (Cencosud)", canal: "Supermercados", revenue: 380000, share: 7.1, growth: 8.7, skus: 5, estado: "activo" as const, riesgo: "bajo" as const, nps: 81 },
  { id: "cli-004", nombre: "DIA Argentina", canal: "Supermercados", revenue: 290000, share: 5.4, growth: -5.8, skus: 3, estado: "activo" as const, riesgo: "alto" as const, nps: 44 },
  { id: "cli-005", nombre: "Distribuidora Norte SRL", canal: "Mayoristas", revenue: 248000, share: 4.6, growth: 12.3, skus: 5, estado: "activo" as const, riesgo: "bajo" as const, nps: 76 },
  { id: "cli-006", nombre: "La Anónima", canal: "Cadenas Especializadas", revenue: 186000, share: 3.5, growth: 6.2, skus: 4, estado: "activo" as const, riesgo: "bajo" as const, nps: 69 },
  { id: "cli-007", nombre: "Walmart Argentina", canal: "Supermercados", revenue: 175000, share: 3.2, growth: -1.4, skus: 4, estado: "activo" as const, riesgo: "medio" as const, nps: 62 },
  { id: "cli-008", nombre: "Gastrobares LATAM", canal: "Gastronomía", revenue: 142000, share: 2.6, growth: 18.4, skus: 3, estado: "activo" as const, riesgo: "bajo" as const, nps: 88 },
];

// Clients at risk
export const CLIENTES_EN_RIESGO = [
  { nombre: "DIA Argentina", motivo: "Caída ventas -5.8% + baja exhibición", probabilidadChurn: 68, revenue: 290000, accion: "Visita urgente + renegociación condiciones" },
  { nombre: "Coto CICSA", motivo: "Crecimiento negativo 3 meses consecutivos", probabilidadChurn: 42, revenue: 540000, accion: "Revisión JBP + propuesta de bundle" },
  { nombre: "Walmart Argentina", motivo: "Reducción SKUs listados", probabilidadChurn: 35, revenue: 175000, accion: "Presentar plan de soporte trade" },
];

// Revenue distribution by channel
export const REVENUE_POR_CANAL_CRM = [
  { canal: "Supermercados", clientes: 14, revenue: 2200000, share: 40.8, growth: 2.1 },
  { canal: "Mayoristas", clientes: 186, revenue: 1490000, share: 27.6, growth: 8.4 },
  { canal: "Cadenas Especializadas", clientes: 312, revenue: 870000, share: 16.1, growth: 5.2 },
  { canal: "Gastronomía", clientes: 428, revenue: 582000, share: 10.8, growth: 14.7 },
  { canal: "E-commerce", clientes: 456, revenue: 248000, share: 4.6, growth: 22.3 },
];

// Client growth segments
export const SEGMENTOS_CRECIMIENTO = [
  { segmento: "Champions (>15% growth)", clientes: 218, revenue: 980000, accion: "Ampliar SKUs + programa VIP" },
  { segmento: "Growing (5-15% growth)", clientes: 487, revenue: 2100000, accion: "Upsell + activaciones dirigidas" },
  { segmento: "Stable (0-5% growth)", clientes: 604, revenue: 1820000, accion: "Retención + fidelización" },
  { segmento: "Declining (<0% growth)", clientes: 87, revenue: 490000, accion: "Recuperación urgente" },
];

// Monthly active clients trend
export const CLIENTES_ACTIVOS_TREND = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May"],
  activos: [1312, 1328, 1351, 1374, 1396],
  nuevos: [28, 24, 31, 35, 38],
  perdidos: [12, 8, 8, 12, 16],
};

export const CRM_INSIGHTS = [
  {
    type: "alert" as const,
    title: "DIA Argentina: 68% de probabilidad de churn",
    description: "Caída de ventas del 5.8%, baja ejecución en PDV y NPS de 44. Requiere visita urgente y renegociación de condiciones comerciales antes de Q3.",
    impact: "USD -290K en riesgo",
    area: "CRM",
  },
  {
    type: "opportunity" as const,
    title: "Canal Gastronomía creciendo +14.7% — priorizar",
    description: "428 clientes activos con crecimiento sostenido. Revenue/cliente de USD 1,360 y NPS de 88. Oportunidad de expansión acelerada en ciudades secundarias.",
    impact: "Potencial +USD 180K en H2",
    area: "CRM",
  },
  {
    type: "warning" as const,
    title: "Concentración en Top 10 clientes supera el 34%",
    description: "Alta dependencia en pocos clientes crea riesgo de revenue. Si Carrefour o Coto reducen condiciones, impacto directo en EBITDA estimado en USD -120K.",
    impact: "Riesgo de concentración: 34.2%",
    area: "CRM",
  },
];

export const CRM_QUESTIONS = [
  "¿Qué clientes tienen mayor riesgo de abandono?",
  "¿Dónde hay mayor potencial de crecimiento?",
  "¿Qué cuentas priorizar en Q3?",
  "¿Cómo mejorar el NPS con Coto y DIA?",
];

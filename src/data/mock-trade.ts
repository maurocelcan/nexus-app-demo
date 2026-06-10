// Mock data — Trade Marketing module (Demo CPG Portfolio 2025-2026)

export const TRADE_KPIS = {
  roiPromocional: { value: 1.8, label: "ROI Promocional", unit: "x", change: -0.3, changeType: "negative" as const },
  tradeSpend: { value: 890000, label: "Trade Spend", unit: "USD", change: 12.1, changeType: "negative" as const },
  activaciones: { value: 47, label: "Activaciones Activas", unit: "", change: 5, changeType: "positive" as const },
  coberturaPdv: { value: 78.4, label: "Cobertura PDV", unit: "%", change: 2.1, changeType: "positive" as const },
  exhibiciones: { value: 312, label: "Exhibiciones", unit: "", change: -18, changeType: "negative" as const },
  ejecucionTarget: { value: 71.2, label: "Ejecución vs Target", unit: "%", change: -4.3, changeType: "negative" as const },
};

// Promotions with ROI
export const PROMOTIONS = [
  { id: "p-001", name: "2x1 Espumante Brut — Carrefour", channel: "Supermercados", sku: "Espumante Brut", status: "active" as const, startDate: "2026-04-01", endDate: "2026-05-31", roi: 0.7, spend: 85000, revenueImpact: 59500, volumeUplift: 8.2, mechanic: "2x1" },
  { id: "p-002", name: "Bundle Aperitivo + Copa", channel: "Cadenas Especializadas", sku: "Aperitivo de Hierbas", status: "active" as const, startDate: "2026-03-15", endDate: "2026-06-15", roi: 2.8, spend: 42000, revenueImpact: 117600, volumeUplift: 18.4, mechanic: "Bundle" },
  { id: "p-003", name: "Descuento Vol. IPA Mayoristas", channel: "Mayoristas", sku: "Cerveza Artesanal IPA", status: "active" as const, startDate: "2026-04-15", endDate: "2026-07-31", roi: 2.1, spend: 38000, revenueImpact: 79800, volumeUplift: 12.6, mechanic: "Volumen" },
  { id: "p-004", name: "Exhibición Gin Premium Gastro", channel: "Gastronomía", sku: "Gin Botánico Premium", status: "active" as const, startDate: "2026-05-01", endDate: "2026-07-31", roi: 1.4, spend: 28000, revenueImpact: 39200, volumeUplift: 7.8, mechanic: "Exhibición" },
  { id: "p-005", name: "Precio Especial Malbec E-comm", channel: "E-commerce", sku: "Vino Malbec Reserva", status: "completed" as const, startDate: "2026-02-01", endDate: "2026-03-31", roi: -0.2, spend: 32000, revenueImpact: 25600, volumeUplift: -2.1, mechanic: "Precio especial" },
  { id: "p-006", name: "Activación Hierbas Supermercados", channel: "Supermercados", sku: "Aperitivo de Hierbas", status: "planned" as const, startDate: "2026-06-01", endDate: "2026-08-31", roi: 2.4, spend: 55000, revenueImpact: 132000, volumeUplift: 22.0, mechanic: "Activación" },
];

// Execution by chain
export const EJECUCION_POR_CADENA = [
  { cadena: "Carrefour", ejecucion: 68.4, target: 85, exhibiciones: 87, activaciones: 8, tradeSpend: 320000 },
  { cadena: "Coto", ejecucion: 72.1, target: 85, exhibiciones: 64, activaciones: 6, tradeSpend: 185000 },
  { cadena: "Jumbo", ejecucion: 81.5, target: 85, exhibiciones: 52, activaciones: 7, tradeSpend: 142000 },
  { cadena: "DIA", ejecucion: 65.3, target: 80, exhibiciones: 41, activaciones: 4, tradeSpend: 98000 },
  { cadena: "Walmart", ejecucion: 77.8, target: 80, exhibiciones: 38, activaciones: 5, tradeSpend: 87000 },
  { cadena: "La Anónima", ejecucion: 89.2, target: 85, exhibiciones: 30, activaciones: 7, tradeSpend: 58000 },
];

// ROI by mechanic
export const ROI_POR_MECANICA = [
  { mechanic: "Bundle", roi: 2.8, spend: 42000 },
  { mechanic: "Volumen", roi: 2.1, spend: 38000 },
  { mechanic: "Exhibición", roi: 1.4, spend: 28000 },
  { mechanic: "2x1", roi: 0.7, spend: 85000 },
  { mechanic: "Precio especial", roi: -0.2, spend: 32000 },
];

// Monthly spend vs ROI trend
export const SPEND_ROI_TREND = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May"],
  spend: [145000, 162000, 178000, 205000, 200000],
  roi: [2.1, 1.9, 2.3, 1.7, 1.8],
};

export const TRADE_INSIGHTS = [
  {
    type: "alert" as const,
    title: "Espumante Brut — ROI negativo en Carrefour",
    description: "La promo 2x1 de Espumante en Carrefour tiene ROI de 0.7x. Con un gasto de USD 85K, se generan solo USD 59.5K de impacto. Restructurar o descontinuar antes de Q3.",
    impact: "Pérdida USD -25.5K",
    area: "Trade Marketing",
  },
  {
    type: "opportunity" as const,
    title: "Bundle Aperitivo tiene el mejor ROI del portafolio (2.8x)",
    description: "El bundle Aperitivo + Copa genera el mejor retorno. Replicar mecánica en otros SKUs y cadenas. Proyección: +USD 80K si se escala.",
    impact: "Potencial USD +80K",
    area: "Trade Marketing",
  },
  {
    type: "warning" as const,
    title: "Ejecución en PDV por debajo del target en Carrefour y DIA",
    description: "Carrefour: 68.4% vs target 85%. DIA: 65.3% vs target 80%. Fotografías de éxito muestran ausencia de material en 34% de visitas.",
    impact: "Gap de ejecución: -16pp",
    area: "Trade Marketing",
  },
];

export const TRADE_QUESTIONS = [
  "¿Qué promociones tuvieron ROI negativo?",
  "¿Dónde falló la ejecución en PDV?",
  "¿Qué cadenas tienen peor ejecución?",
  "¿Qué mecánica genera mayor ROI?",
];

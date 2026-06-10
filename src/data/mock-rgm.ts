// Mock data — RGM (Revenue Growth Management) module (Demo CPG Portfolio 2025-2026)

export const RGM_KPIS = {
  priceIndex: { value: 0.96, label: "Price Index vs Comp.", unit: "", change: -0.02, changeType: "negative" as const },
  asp: { value: 37.4, label: "ASP ($/caja)", unit: "USD", change: 1.8, changeType: "positive" as const },
  mixPremium: { value: 23.1, label: "Mix Premium", unit: "%", change: 2.4, changeType: "positive" as const },
  revenuePerCase: { value: 37.4, label: "Revenue/Caja", unit: "USD", change: 1.2, changeType: "positive" as const },
  elasticidad: { value: -1.4, label: "Elasticidad Precio", unit: "", change: -0.1, changeType: "neutral" as const },
  revenueUplift: { value: 180000, label: "Revenue Uplift", unit: "USD", change: 14.2, changeType: "positive" as const },
};

// Price index by SKU vs competitors
export const PRICE_INDEX_SKU = [
  { sku: "Espumante Brut", asp: 24.5, competidor: 26.2, priceIndex: 0.94, elasticidad: -1.8, potencial: 8.7 },
  { sku: "Aperitivo de Hierbas", asp: 38.2, competidor: 36.8, priceIndex: 1.04, elasticidad: -0.9, potencial: 0 },
  { sku: "Gin Botánico Premium", asp: 52.1, competidor: 55.4, priceIndex: 0.94, elasticidad: -1.2, potencial: 6.3 },
  { sku: "Cerveza Artesanal IPA", asp: 28.4, competidor: 29.8, priceIndex: 0.95, elasticidad: -1.6, potencial: 4.9 },
  { sku: "Vino Malbec Reserva", asp: 44.6, competidor: 44.1, priceIndex: 1.01, elasticidad: -1.1, potencial: 0 },
];

// Mix evolution (premium % over time)
export const MIX_EVOLUCION = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May"],
  premium: [19.8, 20.4, 21.2, 22.3, 23.1],
  standard: [80.2, 79.6, 78.8, 77.7, 76.9],
};

// Revenue by price band
export const REVENUE_POR_BANDA = [
  { banda: "Economy (<$25)", revenue: 680000, volumen: 27800, share: 12.6 },
  { banda: "Standard ($25-$40)", revenue: 2420000, volumen: 72400, share: 44.9 },
  { banda: "Premium ($40-$55)", revenue: 1640000, volumen: 34200, share: 30.4 },
  { banda: "Super Premium (>$55)", revenue: 650000, volumen: 9700, share: 12.1 },
];

// Price simulation scenarios
export const ESCENARIOS_PRECIO = [
  { escenario: "Status quo", uptickPrecio: 0, impactoVolumen: 0, impactoRevenue: 0, impactoMargen: 0 },
  { escenario: "+3% Espumante Brut", uptickPrecio: 3, impactoVolumen: -5.4, impactoRevenue: 38400, impactoMargen: 1.8 },
  { escenario: "+5% Espumante Brut", uptickPrecio: 5, impactoVolumen: -9.0, impactoRevenue: 52000, impactoMargen: 2.6 },
  { escenario: "+3% Portafolio completo", uptickPrecio: 3, impactoVolumen: -4.2, impactoRevenue: 142000, impactoMargen: 1.4 },
  { escenario: "Mix shift a Premium", uptickPrecio: 0, impactoVolumen: 0, impactoRevenue: 95000, impactoMargen: 2.1 },
];

// ASP trend
export const ASP_TREND = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May"],
  asp: [35.8, 36.2, 36.8, 37.1, 37.4],
  target: [37.0, 37.0, 37.5, 37.5, 38.0],
};

export const RGM_INSIGHTS = [
  {
    type: "opportunity" as const,
    title: "Espumante Brut subpreciado vs competencia — potencial +8.7%",
    description: "Price Index de 0.94 vs competencia. Con elasticidad de -1.8, un aumento del 3% generaría USD +38K en revenue neto. El mercado tolera el ajuste.",
    impact: "USD +38K–52K potencial",
    area: "RGM",
  },
  {
    type: "opportunity" as const,
    title: "Mix premium creciendo — acelerar momentum",
    description: "Premium pasó de 19.8% en enero a 23.1% en mayo. Gin Botánico y Aperitivo de Hierbas lideran el shift. Priorizar distribución en canales premium.",
    impact: "+3.3pp en 5 meses",
    area: "RGM",
  },
  {
    type: "warning" as const,
    title: "Price Index general por debajo de 1.0",
    description: "El portafolio promedia 0.96 vs competencia. Aunque parcialmente intencional, en SKUs con baja elasticidad hay oportunidad de ajuste sin impacto en volumen.",
    impact: "Potencial revenue sin explotar",
    area: "RGM",
  },
];

export const RGM_QUESTIONS = [
  "¿Dónde estamos caros vs competencia?",
  "¿Qué SKUs soportan un aumento de precio?",
  "¿Qué pasa con el volumen si subimos 5% el Espumante?",
  "¿Cómo mejorar el mix hacia premium?",
];

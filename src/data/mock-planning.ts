// Mock data — Planning module (Demo CPG Portfolio 2025-2026)

export const PLANNING_KPIS = {
  forecastAccuracy: { value: 76.3, label: "Forecast Accuracy", unit: "%", change: -3.2, changeType: "negative" as const },
  demandPlan: { value: 148000, label: "Demand Plan H1", unit: "cajas", change: 2.7, changeType: "positive" as const },
  varianceYtd: { value: -2.6, label: "Variance YTD", unit: "%", change: -1.1, changeType: "negative" as const },
  revenueProjection: { value: 5620000, label: "Revenue Proyectado H2", unit: "USD", change: 4.3, changeType: "positive" as const },
  ebitdaProjection: { value: 610000, label: "EBITDA Proyectado H2", unit: "USD", change: 10.9, changeType: "positive" as const },
  coberturaForecast: { value: 82.4, label: "Cobertura Forecast", unit: "%", change: 1.8, changeType: "positive" as const },
};

// Forecast vs actual by month
export const FORECAST_VS_ACTUAL = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun (F)", "Jul (F)", "Aug (F)"],
  forecast: [22800, 24100, 26500, 27200, 25400, 26800, 28100, 29600],
  actual: [22100, 23800, 25900, 26400, 24800, null, null, null],
};

// Scenarios for H2
export const ESCENARIOS_H2 = [
  {
    nombre: "Pesimista",
    supuesto: "Caída 5% sell-out + sin ajuste precios",
    revenue: 5180000,
    ebitda: 420000,
    ebitdaMargin: 8.1,
    volumen: 112000,
    probabilidad: 20,
  },
  {
    nombre: "Base",
    supuesto: "Continuidad tendencia actual + ajuste Espumante +3%",
    revenue: 5620000,
    ebitda: 610000,
    ebitdaMargin: 10.9,
    volumen: 119500,
    probabilidad: 55,
  },
  {
    nombre: "Optimista",
    supuesto: "Recuperación passthrough + expansión PDVs",
    revenue: 6050000,
    ebitda: 780000,
    ebitdaMargin: 12.9,
    volumen: 128000,
    probabilidad: 25,
  },
];

// Revenue projection by quarter
export const REVENUE_PROJECTION = {
  labels: ["Q1 Real", "Q2 Real", "Q3 Proyectado", "Q4 Proyectado"],
  base: [2480000, 2910000, 2760000, 2860000],
  optimista: [2480000, 2910000, 3020000, 3030000],
  pesimista: [2480000, 2910000, 2490000, 2690000],
};

// SKU demand plan
export const DEMAND_PLAN_SKU = [
  { sku: "Espumante Brut", planH2: 36800, forecastAccuracy: 68.2, riesgo: "alto" as const },
  { sku: "Aperitivo de Hierbas", planH2: 42100, forecastAccuracy: 84.7, riesgo: "bajo" as const },
  { sku: "Gin Botánico Premium", planH2: 18400, forecastAccuracy: 71.3, riesgo: "medio" as const },
  { sku: "Cerveza Artesanal IPA", planH2: 28600, forecastAccuracy: 81.9, riesgo: "bajo" as const },
  { sku: "Vino Malbec Reserva", planH2: 23100, forecastAccuracy: 78.4, riesgo: "bajo" as const },
];

// Key milestones
export const HITOS_PLANIFICACION = [
  { hito: "Cierre Demand Plan Q3", fecha: "2026-06-10", estado: "pending" as const, responsable: "Sofía Martínez" },
  { hito: "JBP Carrefour H2", fecha: "2026-06-20", estado: "in_progress" as const, responsable: "Mauro Celani" },
  { hito: "Revisión Forecast Mensual", fecha: "2026-06-01", estado: "completed" as const, responsable: "Diego Pereira" },
  { hito: "Ajuste Precios Espumante", fecha: "2026-07-01", estado: "pending" as const, responsable: "Mauro Celani" },
  { hito: "Plan Expansión PDVs Q3", fecha: "2026-06-30", estado: "pending" as const, responsable: "Lucía Romero" },
];

export const PLANNING_INSIGHTS = [
  {
    type: "warning" as const,
    title: "Forecast Accuracy en mínimo histórico — 76.3%",
    description: "Espumante Brut tiene la peor precisión (68.2%), impulsando el desvío agregado. Revisar supuestos de demanda y coordinación con equipo de ventas para el demand plan Q3.",
    impact: "Desvío acumulado: -2.6% vs plan",
    area: "Planning",
  },
  {
    type: "opportunity" as const,
    title: "Escenario optimista proyecta EBITDA de $780K en H2",
    description: "Si se recupera el passthrough de Espumante y se expanden PDVs en Cadenas Especializadas, el EBITDA H2 puede superar en 28% el escenario base.",
    impact: "USD +170K vs escenario base",
    area: "Planning",
  },
  {
    type: "alert" as const,
    title: "JBP Carrefour H2 debe cerrarse antes del 20-Jun",
    description: "Las negociaciones de joint business plan con Carrefour definen el volumen garantizado de sell-in para el segundo semestre. Sin acuerdo, el plan base queda en riesgo.",
    impact: "28% del revenue Supermercados",
    area: "Planning",
  },
];

export const PLANNING_QUESTIONS = [
  "¿Qué pasa si cae 5% el sell-out en H2?",
  "¿Qué EBITDA proyectamos para Q4?",
  "¿Qué escenario maximiza el margen?",
  "¿Cuál es el gap entre forecast y actual en Espumante?",
];

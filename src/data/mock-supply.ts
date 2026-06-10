// Mock data — Supply Chain module (Demo CPG Portfolio 2025-2026)

export const SUPPLY_KPIS = {
  otif: { value: 87.3, label: "OTIF", unit: "%", change: -2.1, changeType: "negative" as const },
  fillRate: { value: 91.2, label: "Fill Rate", unit: "%", change: -0.8, changeType: "negative" as const },
  dio: { value: 38, label: "DIO", unit: "días", change: 4, changeType: "negative" as const },
  oos: { value: 4.2, label: "OOS Rate", unit: "%", change: 0.9, changeType: "negative" as const },
  cobertura: { value: 4.8, label: "Cobertura Promedio", unit: "semanas", change: -0.6, changeType: "negative" as const },
  rotacion: { value: 9.6, label: "Rotación Inventario", unit: "x/año", change: -0.4, changeType: "negative" as const },
};

// OTIF trend by month
export const OTIF_TREND = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May"],
  otif: [91.2, 90.4, 88.7, 86.3, 87.3],
  fillRate: [93.8, 92.9, 91.6, 90.1, 91.2],
};

// Inventory and coverage by SKU
export const INVENTARIO_POR_SKU = [
  { sku: "Espumante Brut", inventario: 8420, cobertura: 6.1, oos: 1.2, riesgo: "bajo" as const },
  { sku: "Aperitivo de Hierbas", inventario: 4180, cobertura: 4.2, oos: 5.8, riesgo: "medio" as const },
  { sku: "Gin Botánico Premium", inventario: 2340, cobertura: 3.2, oos: 7.4, riesgo: "alto" as const },
  { sku: "Cerveza Artesanal IPA", inventario: 6720, cobertura: 5.8, oos: 2.1, riesgo: "bajo" as const },
  { sku: "Vino Malbec Reserva", inventario: 5100, cobertura: 5.1, oos: 3.6, riesgo: "bajo" as const },
];

// OOS by channel
export const OOS_POR_CANAL = [
  { canal: "Supermercados", oos: 5.4, fillRate: 88.9, otif: 84.2 },
  { canal: "Mayoristas", oos: 2.1, fillRate: 95.3, otif: 91.8 },
  { canal: "Cadenas Especializadas", oos: 6.8, fillRate: 86.4, otif: 82.1 },
  { canal: "Gastronomía", oos: 3.2, fillRate: 92.7, otif: 89.4 },
  { canal: "E-commerce", oos: 1.8, fillRate: 96.2, otif: 94.1 },
];

// Critical PDVs at risk
export const PDVS_CRITICOS = [
  { pdv: "Carrefour Palermo", canal: "Supermercados", sku: "Gin Botánico Premium", cobertura: 1.8, riesgo: "crítico" as const },
  { pdv: "Jumbo Belgrano", canal: "Supermercados", sku: "Aperitivo de Hierbas", cobertura: 2.4, riesgo: "alto" as const },
  { pdv: "DIA Flores", canal: "Supermercados", sku: "Gin Botánico Premium", cobertura: 2.1, riesgo: "alto" as const },
  { pdv: "Distribuidora Norte", canal: "Mayoristas", sku: "Vino Malbec Reserva", cobertura: 3.1, riesgo: "medio" as const },
  { pdv: "La Vikinga", canal: "Cadenas Especializadas", sku: "Aperitivo de Hierbas", cobertura: 2.8, riesgo: "alto" as const },
];

// Logistics performance by distributor
export const LOGISTICA_DISTRIBUIDOR = [
  { distribuidor: "Distribuidora Norte", otif: 84.2, fillRate: 88.7, pedidos: 312, demora: 1.8 },
  { distribuidor: "Trans-Sur", otif: 91.8, fillRate: 94.2, pedidos: 284, demora: 0.9 },
  { distribuidor: "RapidDist BA", otif: 88.4, fillRate: 92.1, pedidos: 198, demora: 1.3 },
  { distribuidor: "MegaLog", otif: 82.1, fillRate: 86.4, pedidos: 156, demora: 2.4 },
];

export const SUPPLY_INSIGHTS = [
  {
    type: "alert" as const,
    title: "Gin Botánico Premium — riesgo de quiebre inminente",
    description: "Cobertura promedio de 3.2 semanas vs benchmark de 6 semanas. 3 PDVs en Cadenas Especializadas por debajo de 2.5 semanas. Requiere reposición urgente.",
    impact: "Riesgo OOS en 12 PDVs",
    area: "Supply Chain",
  },
  {
    type: "warning" as const,
    title: "OTIF bajó 3.9pp en los últimos 3 meses",
    description: "Tendencia descendente: de 91.2% en enero a 87.3% en mayo. Distribuidora Norte y MegaLog son los principales responsables (OTIF < 85%).",
    impact: "Gap vs target: -2.7pp",
    area: "Supply Chain",
  },
  {
    type: "opportunity" as const,
    title: "Mayoristas y E-commerce con mejor performance logística",
    description: "Fill rate > 95% en ambos canales. Oportunidad de priorizar despachos en estos canales para maximizar revenue sin riesgo de OOS.",
    impact: "Eficiencia +8% posible",
    area: "Supply Chain",
  },
];

export const SUPPLY_QUESTIONS = [
  "¿Qué PDVs tienen mayor riesgo de OOS?",
  "¿Dónde cayó el Fill Rate este mes?",
  "¿Qué clientes tienen peor OTIF?",
  "¿Cuántos días de cobertura tenemos por SKU?",
];

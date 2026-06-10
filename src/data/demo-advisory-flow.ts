import type { Message } from "@/types/chat";
import { generateId } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdvisoryDiagnosisItem {
  text: string;
  deviation?: string;
  deviationDir?: "positive" | "negative" | "neutral";
}

export interface AdvisoryInitiative {
  num: number;
  name: string;
  owner: string;
  objective: string;
  plazo?: string;
}

export interface AdvisoryKpi {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

export interface AdvisoryResponse {
  diagnosisTitle?: string;
  diagnosisItems: AdvisoryDiagnosisItem[];
  insights: string[];
  initiatives: AdvisoryInitiative[];
  kpis?: AdvisoryKpi[];
  followUp?: string[];
  relatedModule?: string;
  source?: "demo" | "real" | "fallback";
}

export interface GuidedDemoAct {
  id: string;
  title: string;
  moduleId: string;
  moduleRoute: string;
  dataSources: string[];
  suggestedQuestions: string[];
  responses: Record<string, AdvisoryResponse>;
}

// ─── Act 1 — Diagnóstico Ejecutivo ───────────────────────────────────────────

const ACT1_DIAGNOSIS_MAIN: AdvisoryResponse = {
  diagnosisTitle: "Performance vs Presupuesto — YTD 2026",
  diagnosisItems: [
    { text: "Sell-In: 105.012 cajas vs presupuesto 148.447 cajas", deviation: "-29,3% (-43.435 cajas)", deviationDir: "negative" },
    { text: "Sell-Out: 69.174 cajas vs presupuesto 130.210 cajas", deviation: "-46,9% (-61.036 cajas)", deviationDir: "negative" },
    { text: "Ingresos Netos: USD 3,95M vs USD 5,80M presupuestados", deviation: "-31,8% (-USD 1,85M)", deviationDir: "negative" },
    { text: "EBITDA: USD 1,31M vs USD 2,35M presupuestado", deviation: "-29% (-USD 1,04M)", deviationDir: "negative" },
    { text: "Price Index: 0,960 vs 0,995 target", deviation: "-3,5%", deviationDir: "negative" },
    { text: "Trade Spend: 9,8% de Ingresos Netos vs 8,1% presupuestado", deviation: "+1,7pp", deviationDir: "negative" },
    { text: "Passthrough (Sell-Out / Sell-In): 65,7% vs 85,0% target", deviation: "-19,3pp", deviationDir: "negative" },
    { text: "Distribución Numérica Efectiva: 64,0% vs 70,0%", deviation: "-6pp", deviationDir: "negative" },
    { text: "Foto de Éxito (Perfect Store): 64,5% vs 71,0%", deviation: "-6,5pp", deviationDir: "negative" },
  ],
  kpis: [
    { label: "Sell-In YTD", value: "105.012 cajas", change: "-29,3% vs presupuesto", changeType: "negative" },
    { label: "Sell-Out YTD", value: "69.174 cajas", change: "-46,9% vs presupuesto", changeType: "negative" },
    { label: "Ingresos Netos", value: "USD 3,95M", change: "-31,8% vs presupuesto", changeType: "negative" },
    { label: "EBITDA", value: "USD 1,31M", change: "-29% vs presupuesto", changeType: "negative" },
    { label: "Passthrough", value: "65,7%", change: "-19,3pp vs target", changeType: "negative" },
    { label: "Price Index", value: "0,960", change: "-3,5% vs target", changeType: "negative" },
  ],
  insights: [
    "El desvío de EBITDA del -29% es coherente con la caída de Ingresos Netos del -31,8%, pero el margen se comprimió -4,9pp (de 46,7% a 41,8%). La empresa tiene USD 150.000 de costos fijos mensuales (manufactura, administración y estructura) que no bajan con el volumen. A menor volumen, esos costos pesan más sobre cada peso de ingreso.",
    "El canal está acumulando stock: el 65,7% de passthrough significa que de cada 100 cajas despachadas, 34 siguen en depósitos de distribuidores y mayoristas. La consecuencia es concreta: el mes siguiente van a pedir menos, o vamos a tener que ofrecerles descuentos para que liquiden. En cualquiera de los dos casos, los Ingresos Netos futuros están en riesgo.",
  ],
  initiatives: [
    { num: 1, name: "Auditoría de Stock Canal", owner: "Logística + Ventas", objective: "Auditar inventario en top 20 distribuidores y mayoristas e identificar producto represado", plazo: "15 días" },
    { num: 2, name: "Revenue Recovery Plan", owner: "Dirección Comercial", objective: "Recuperar 15.000 cajas de sell-in priorizando canales con mayor velocidad de salida al consumidor", plazo: "60 días" },
    { num: 3, name: "Revisión de Trade Spend", owner: "Trade Marketing", objective: "Redirigir el 30% del presupuesto promocional hacia actividades con ROI medido en sell-out real", plazo: "30 días" },
  ],
  followUp: [
    "¿En qué canal está concentrado el desvío de volumen?",
    "¿Cuál es el desvío de EBITDA vs presupuesto?",
    "¿Dónde está el mayor problema: volumen, precio o mix?",
  ],
  relatedModule: "ventas",
  source: "demo",
};

const ACT1_DIAGNOSIS_EBITDA: AdvisoryResponse = {
  diagnosisTitle: "Desvío de EBITDA vs Presupuesto — YTD 2026",
  diagnosisItems: [
    { text: "EBITDA real: USD 1,31M vs presupuesto USD 2,35M", deviation: "-USD 1,04M (-29%)", deviationDir: "negative" },
    { text: "Margen EBITDA real: 33,2% vs presupuestado 40,5%", deviation: "-7,3pp", deviationDir: "negative" },
    { text: "Ingresos Netos: USD 3,95M vs USD 5,80M", deviation: "-USD 1,85M (-31,8%)", deviationDir: "negative" },
    { text: "Gross Margin real: 41,8% vs presupuestado 46,7%", deviation: "-4,9pp", deviationDir: "negative" },
    { text: "Costos fijos mensuales: USD 150.000 (manufactura USD 100K + administración USD 20K + estructura USD 30K)", deviationDir: "neutral" },
  ],
  kpis: [
    { label: "EBITDA Real", value: "USD 1,31M", change: "-29% vs presupuesto", changeType: "negative" },
    { label: "EBITDA presup.", value: "USD 2,35M", changeType: "neutral" },
    { label: "Margen EBITDA", value: "33,2%", change: "-7,3pp vs presupuesto", changeType: "negative" },
    { label: "Gross Margin", value: "41,8%", change: "-4,9pp", changeType: "negative" },
  ],
  insights: [
    "El mecanismo es directo: USD 150.000 de costos fijos mensuales sobre una base de ingresos 32% más chica. En el presupuesto, esos costos representaban el 15,5% de los Ingresos Netos. Con el volumen real, representan el 22,8%. Esa diferencia de 7,3pp es exactamente el deterioro de margen EBITDA.",
    "Tres palancas para recuperar margen, por velocidad de impacto: (1) recuperar volumen — diluye los costos fijos; (2) mejorar precio — el Price Index en 0,960 implica 3,5% de margen recuperable sin cambiar un caso de volumen; (3) shift de mix hacia SKU-B-750 (premium).",
  ],
  initiatives: [
    { num: 1, name: "Sprint de recuperación de Ingresos Netos", owner: "Dir. Comercial + RGM", objective: "USD 400K adicionales → +3pp en margen EBITDA", plazo: "60 días" },
    { num: 2, name: "Disciplina de precio SKU-A-750", owner: "Revenue Management", objective: "Price Index 0,955 → 0,980 → +USD 75K sin cambio de volumen", plazo: "90 días" },
    { num: 3, name: "Revisión de costos fijos", owner: "Dirección de Finanzas", objective: "Viabilidad de -15% en costos fijos si volumen no recupera en Q3", plazo: "Q3 2026" },
  ],
  followUp: [
    "¿Cómo impacta la caída de volumen en el margen con la estructura de costos?",
    "¿Cuál es la prioridad para los próximos 90 días?",
  ],
  relatedModule: "finanzas",
  source: "demo",
};

const ACT1_DIAGNOSIS_DRIVERSCORE: AdvisoryResponse = {
  diagnosisTitle: "¿Dónde está el mayor problema: volumen, precio o mix?",
  diagnosisItems: [
    { text: "Volumen: Sell-In -29,3% vs presupuesto → driver principal de caída de ingresos", deviation: "-43.435 cajas", deviationDir: "negative" },
    { text: "Precio: Price Index 0,960 vs 0,995 target → descuento excesivo al canal", deviation: "-3,5%", deviationDir: "negative" },
    { text: "Mix: SKU-B-750 (premium) representa solo el 29% de Ingresos Netos vs objetivo del 35%", deviation: "-6pp participación", deviationDir: "negative" },
    { text: "Passthrough: 65,7% vs 85% target → señal de que el problema primario es de rotación en canal, no de demanda final", deviation: "-19,3pp", deviationDir: "negative" },
  ],
  insights: [
    "El desvío de volumen es el driver principal (-29,3%), pero el problema de raíz es el passthrough del 65,7%: el canal no está rotando lo que compra. Esto explica por qué el sell-out cae casi el doble que el sell-in (-46,9% vs -29,3%) — hay producto represado en depósitos.",
    "El precio y el mix son palancas secundarias pero inmediatas: el Price Index en 0,960 implica USD 75K de revenue recuperable solo con disciplina de descuentos. El shift de mix hacia SKU-B-750 premium puede mejorar el margen sin cambiar el volumen físico.",
  ],
  initiatives: [
    { num: 1, name: "Revenue Recovery Plan — volumen", owner: "Dirección Comercial", objective: "Recuperar 15.000 cajas priorizando canales con mayor velocidad de salida", plazo: "60 días" },
    { num: 2, name: "Contención descuentos — precio", owner: "Revenue Management", objective: "Price Index 0,960 → ≥ 0,980 en los próximos 90 días", plazo: "90 días" },
    { num: 3, name: "Mix shift hacia premium", owner: "RGM + Trade Marketing", objective: "SKU-B-750 del 29% al 35% de Ingresos Netos en 6 meses", plazo: "6 meses" },
  ],
  followUp: [
    "¿En qué canal está concentrado el desvío?",
    "¿Hay problemas de cobranza en los distribuidores?",
    "¿En qué zonas geográficas tenemos el peor sell-through?",
  ],
  relatedModule: "ventas",
  source: "demo",
};

// ─── Act 2a — Canal y SKU ─────────────────────────────────────────────────────

const ACT2A_CANAL: AdvisoryResponse = {
  diagnosisTitle: "Canal y Mix — Diagnóstico de Concentración",
  diagnosisItems: [
    { text: "Mayoristas: 65,1% de Ingresos Netos (USD 2,57M) — autoservicio, sin fuerza de ventas propia", deviationDir: "neutral" },
    { text: "On Premise: 16,2% (USD 640K) — bares, restaurantes y gastronomía", deviationDir: "neutral" },
    { text: "Tradicional / Distribuidores: 10,6% (USD 419K) — DSO 67 días vs términos contractuales 45 días", deviation: "+22 días DSO", deviationDir: "negative" },
    { text: "Moderno: 8,0% (USD 316K) — supermercados y cadenas", deviationDir: "neutral" },
    { text: "SKU-A-750 (botella 750ml): USD 1,47M — mayor volumen, Price Index 0,955 (descuento elevado)", deviation: "PI -4,5% vs target", deviationDir: "negative" },
    { text: "SKU-B-750 (variante premium): USD 1,14M — mejor precio relativo", deviationDir: "neutral" },
    { text: "SKU-A-473 (lata 473ml): USD 0,98M — presente en Moderno y On Premise", deviationDir: "neutral" },
    { text: "Price Index general: 0,960 vs 0,995 presupuestado", deviation: "-3,5%", deviationDir: "negative" },
  ],
  kpis: [
    { label: "Mayoristas", value: "65,1%", change: "USD 2,57M Ingresos Netos", changeType: "neutral" },
    { label: "Tradicional", value: "10,6%", change: "USD 419K | DSO +22 días", changeType: "negative" },
    { label: "SKU-A-750 PI", value: "0,955", change: "-4,5% vs target", changeType: "negative" },
    { label: "Price Index", value: "0,960", change: "-3,5% vs target", changeType: "negative" },
  ],
  insights: [
    "La dependencia del 65% en Mayoristas no es solo un problema de concentración — es una debilidad estructural del modelo comercial. Mayoristas opera como autoservicio: el cliente va, compra, y se va. La empresa no tiene control sobre la ejecución, la exhibición ni el empuje de producto. La única palanca para mover volumen ahí es el precio.",
    "El canal Tradicional — los distribuidores — es estratégicamente el más importante: tienen ruteo, vendedor en la calle, visitan kioscos y almacenes, pueden ejecutar en el punto de venta. Son la extensión real de la fuerza de ventas. Pero hoy representan solo el 10,6% de los Ingresos Netos. Mientras ese canal esté subdesarrollado, la empresa va a seguir compitiendo por precio en Mayoristas sin capacidad de ejecución en el canal chico.",
    "El SKU-A-750 con Price Index 0,955 es la señal más clara: se está sacrificando precio en el SKU de mayor volumen, que encima se vende principalmente a Mayoristas. El descuento va al canal, no al consumidor.",
  ],
  initiatives: [
    { num: 1, name: "Desarrollo canal Tradicional (distribuidores)", owner: "Dir. Comercial + Trade Marketing", objective: "Incrementar participación de distribuidores del 10,6% al 15% de Ingresos Netos", plazo: "12 meses" },
    { num: 2, name: "Contención descuentos SKU-A-750", owner: "Revenue Management", objective: "Subir Price Index de 0,955 a ≥ 0,980 sin perder más del 5% del volumen", plazo: "90 días" },
    { num: 3, name: "Mix shift hacia premium", owner: "RGM + Trade Marketing + Marketing", objective: "Incrementar SKU-B-750 del 29% al 35% de Ingresos Netos", plazo: "6 meses" },
  ],
  followUp: [
    "¿Hay problemas de cobranza en los distribuidores?",
    "¿Qué SKUs tienen mayor caída de margen?",
    "¿El problema es de mix o de precio?",
  ],
  relatedModule: "ventas",
  source: "demo",
};

// ─── Act 2b — Cobranza ────────────────────────────────────────────────────────

const ACT2B_COBRANZA: AdvisoryResponse = {
  diagnosisTitle: "Diagnóstico de Cobranza — Canal Tradicional",
  diagnosisItems: [
    { text: "DSO canal Tradicional (distribuidores): 67 días vs términos contractuales 45 días", deviation: "+22 días de atraso promedio", deviationDir: "negative" },
    { text: "Hay distribuidores con facturas de hasta 140 días sin cobrar", deviationDir: "negative" },
    { text: "Canal Mayoristas concentra el mayor saldo abierto en valor absoluto", deviationDir: "negative" },
  ],
  kpis: [
    { label: "DSO Tradicional", value: "67 días", change: "+22 días vs contractual (45 días)", changeType: "negative" },
    { label: "Máx. atraso detectado", value: "140 días", changeType: "negative" },
  ],
  insights: [
    "Un distribuidor que no paga en tiempo generalmente es un distribuidor que no está rotando el producto. El retraso en el pago es un síntoma de que el inventario no se mueve. Criterio concreto: DSO > 75 días = sin nueva mercadería hasta regularizar. No como castigo, sino como política de crédito que protege el flujo de caja y la salud del canal.",
  ],
  initiatives: [
    { num: 1, name: "Política de crédito por DSO", owner: "Finanzas + Ventas", objective: "Suspender despachos a distribuidores con DSO > 75 días hasta regularización", plazo: "30 días" },
    { num: 2, name: "Descuento por pronto pago", owner: "Dir. Comercial + Finanzas", objective: "Esquema 2/10 net 45 para reducir DSO Tradicional de 67 a ≤ 52 días", plazo: "Q3 2026" },
  ],
  followUp: [
    "¿En qué zonas geográficas tenemos el peor sell-through?",
    "¿Cómo está la ejecución en el punto de venta?",
  ],
  relatedModule: "ventas",
  source: "demo",
};

// ─── Act 3 — Sell-Through y Mapa Geográfico ───────────────────────────────────

const ACT3_SELLTHROUGH: AdvisoryResponse = {
  diagnosisTitle: "Sell-Through y Ejecución Geográfica — YTD 2026",
  diagnosisItems: [
    { text: "Passthrough global YTD 2026: 65,7% vs target 85,0%", deviation: "-19,3pp de brecha", deviationDir: "negative" },
    { text: "Distribución Numérica Efectiva: 64,0% vs 70,0%", deviation: "-6pp", deviationDir: "negative" },
    { text: "Foto de Éxito (Perfect Store): 64,5% vs 71,0%", deviation: "-6,5pp", deviationDir: "negative" },
    { text: "Evolución mensual 2026: ene 63% → feb 65% → mar 67% → abr 66% → may 67% — sin recuperación sostenida", deviationDir: "negative" },
    { text: "Zonas críticas (passthrough < 55%): intervención urgente — marcadas en ROJO", deviationDir: "negative" },
    { text: "Zonas en seguimiento (55-70%): marcadas en NARANJA", deviationDir: "neutral" },
    { text: "Zonas saludables (> 70%): fuente de mejores prácticas — marcadas en VERDE", deviationDir: "positive" },
  ],
  kpis: [
    { label: "Passthrough Global", value: "65,7%", change: "-19,3pp vs target (85%)", changeType: "negative" },
    { label: "DN Efectiva", value: "64,0%", change: "-6pp vs target", changeType: "negative" },
    { label: "Foto de Éxito", value: "64,5%", change: "-6,5pp vs target", changeType: "negative" },
    { label: "Trend mensual", value: "63% → 67%", change: "sin recuperación sostenida", changeType: "negative" },
  ],
  insights: [
    "El mapa hace visible algo que los números globales ocultan: el problema no está distribuido uniformemente. Hay zonas donde el distribuidor ejecuta bien (verde) y zonas donde la operación está rota (rojo). Esa heterogeneidad es una oportunidad — las prácticas de las zonas verdes se pueden replicar.",
    "La Foto de Éxito del 64,5% dice que en 1 de cada 3 visitas al punto de venta, el agente de campo no logra los estándares mínimos de exhibición, temperatura y material POP. No es un problema de mercado — es ejecución interna, resoluble con capacitación y checklist digital.",
  ],
  initiatives: [
    { num: 1, name: "Plan de Activación Zonal (zonas rojas)", owner: "Gerentes de Zona", objective: "Passthrough ≥ 75% en zonas críticas (promotoras, eventos PDV, sampling)", plazo: "45 días" },
    { num: 2, name: "Programa Perfect Store", owner: "Trade Marketing + FDV", objective: "Foto de Éxito de 64,5% a 72% con checklist digital y supervisión semanal", plazo: "60 días" },
    { num: 3, name: "Rebalanceo de incentivos comerciales", owner: "Dirección Comercial", objective: "Comisión FDV: pasar de 100% sell-in a 60% sell-in / 40% sell-out verificado", plazo: "60 días" },
  ],
  followUp: [
    "¿Dónde está cayendo la distribución numérica?",
    "¿Cómo está la ejecución en el punto de venta?",
    "¿Cómo impacta la caída de volumen en el margen?",
  ],
  relatedModule: "sell-through",
  source: "demo",
};

// ─── Act 4a — Margen ──────────────────────────────────────────────────────────

const ACT4A_MARGEN: AdvisoryResponse = {
  diagnosisTitle: "Impacto en Margen — Estructura de Costos vs Volumen Real",
  diagnosisItems: [
    { text: "Costo fijo mensual total: USD 150.000 (manufactura USD 100K + administración USD 20K + estructura USD 30K)", deviationDir: "neutral" },
    { text: "Componente variable total: 44% de Ingresos Netos (COGS 43% + G&A 0,5% + Estructura 0,5%)", deviationDir: "neutral" },
    { text: "Presupuesto YTD: Ingresos Netos USD 5,80M | COGS% 53,3% | Gross Margin% 46,7%", deviationDir: "neutral" },
    { text: "Real YTD: Ingresos Netos USD 3,95M | COGS% 58,2% | Gross Margin% 41,8%", deviation: "COGS +4,9pp | GM -4,9pp", deviationDir: "negative" },
    { text: "Margen EBITDA presupuestado: 40,5% vs real: 33,2%", deviation: "-7,3pp de deterioro", deviationDir: "negative" },
  ],
  kpis: [
    { label: "Costos fijos/mes", value: "USD 150K", changeType: "neutral" },
    { label: "Gross Margin real", value: "41,8%", change: "-4,9pp vs presupuesto (46,7%)", changeType: "negative" },
    { label: "EBITDA Margin real", value: "33,2%", change: "-7,3pp vs presupuesto (40,5%)", changeType: "negative" },
    { label: "COGS% real", value: "58,2%", change: "+4,9pp vs presupuesto (53,3%)", changeType: "negative" },
  ],
  insights: [
    "El mecanismo es directo: USD 150.000 de costos fijos mensuales sobre una base de ingresos 32% más chica. En el presupuesto, esos costos representaban el 15,5% de los Ingresos Netos. Con el volumen real, representan el 22,8%. Esa diferencia de 7,3pp es exactamente el deterioro de margen EBITDA.",
    "Tres palancas para recuperar margen, por velocidad de impacto: (1) recuperar volumen — diluye los costos fijos; (2) mejorar precio — el Price Index en 0,960 implica 3,5% de margen recuperable sin cambiar un caso de volumen; (3) shift de mix hacia SKU-B-750 (premium).",
  ],
  initiatives: [
    { num: 1, name: "Sprint de recuperación de Ingresos Netos", owner: "Dir. Comercial + RGM", objective: "USD 400K adicionales → +3pp en margen EBITDA", plazo: "60 días" },
    { num: 2, name: "Disciplina de precio SKU-A-750", owner: "Revenue Management", objective: "Price Index 0,955 → 0,980 → +USD 75K sin cambio de volumen", plazo: "90 días" },
    { num: 3, name: "Revisión de costos fijos", owner: "Dirección de Finanzas", objective: "Viabilidad de -15% en costos fijos si volumen no recupera en Q3", plazo: "Q3 2026" },
  ],
  followUp: [
    "¿Cuánto EBITDA perdemos si el volumen no se recupera en Q3?",
    "¿Cuál es la prioridad concreta para los próximos 90 días?",
  ],
  relatedModule: "finanzas",
  source: "demo",
};

// ─── Act 4b — Plan 90 Días ────────────────────────────────────────────────────

const ACT4B_PLAN90: AdvisoryResponse = {
  diagnosisTitle: "Resumen Ejecutivo — Desvíos Críticos YTD 2026",
  diagnosisItems: [
    { text: "Sell-In: 105.012 cajas vs 148.447 cajas presupuestadas", deviation: "-29,3%", deviationDir: "negative" },
    { text: "Ingresos Netos: USD 3,95M vs USD 5,80M", deviation: "-31,8%", deviationDir: "negative" },
    { text: "Gross Margin: 41,8% vs 46,7% presupuestado", deviation: "-4,9pp", deviationDir: "negative" },
    { text: "EBITDA: USD 1,31M vs USD 2,35M presupuestado", deviation: "-29%", deviationDir: "negative" },
    { text: "Passthrough: 65,7% vs 85,0% target", deviation: "-19,3pp", deviationDir: "negative" },
    { text: "Price Index: 0,960 vs 0,995 target", deviation: "-3,5%", deviationDir: "negative" },
    { text: "Foto de Éxito: 64,5% vs 71,0% target", deviation: "-6,5pp", deviationDir: "negative" },
    { text: "DSO Tradicional: 67 días vs 45 días contractuales", deviation: "+22 días", deviationDir: "negative" },
  ],
  insights: [
    "CAUSA RAÍZ 1 — El canal está saturado, no el consumidor. El sell-out cae casi el doble que el sell-in (-47% vs -29%): hay producto represado en depósitos de distribuidores y mayoristas. El problema es de ejecución pull, no de demanda.",
    "CAUSA RAÍZ 2 — Los costos fijos amplifican la caída de ingresos. USD 150K/mes sin ajuste: cada punto porcentual de ingreso perdido impacta directo en margen. No hay colchón.",
    "CAUSA RAÍZ 3 — El modelo de canales tiene una debilidad estructural. Con el 65% de Ingresos Netos en Mayoristas (sin fuerza de ventas) y solo el 10,6% en distribuidores (con fuerza de ventas), el precio es la única palanca comercial disponible.",
    "PLAN 90 DÍAS — MES 1 URGENTE: Auditoría stock en top 20 distribuidores y mayoristas (Ventas + Logística) · Congelar descuentos adicionales SKU-A-750 (Revenue Management) · Suspender despachos a distribuidores con DSO > 75 días (Finanzas + Ventas) · Activar plan de sell-out en zonas rojas (Gerentes de Zona). MES 2 ESTABILIZACIÓN: Lanzar esquema 2/10 net 45 para distribuidores · Programa Perfect Store con checklist digital · Rebalancear incentivos FDV hacia sell-out. MES 3 CRECIMIENTO: Incorporar 3-5 distribuidores nuevos · Incrementar distribución SKU-B-750 en +200 PDVs · Revisar estructura de costos fijos con objetivo -15%.",
  ],
  initiatives: [
    { num: 1, name: "Auditoría stock canal + congelamiento descuentos", owner: "Ventas + Logística + RGM", objective: "Inventario en top 20 clientes + Price Index SKU-A-750 ≥ 0,980", plazo: "Mes 1" },
    { num: 2, name: "Política DSO + Perfect Store", owner: "Finanzas + Trade Marketing + FDV", objective: "DSO Tradicional → ≤ 52 días · Foto de Éxito → 72%", plazo: "Mes 2" },
    { num: 3, name: "Crecimiento canal Tradicional + revisión de costos", owner: "Dir. Comercial + Dir. Finanzas", objective: "+3-5 distribuidores nuevos · Passthrough 65,7% → 74% · Ingresos Netos +USD 300-500K", plazo: "Mes 3" },
  ],
  followUp: [
    "¿Cómo estamos vs presupuesto YTD 2026?",
    "¿En qué canal está concentrado el desvío?",
    "¿En qué zonas tenemos el peor sell-through?",
  ],
  relatedModule: "finanzas",
  source: "demo",
};

// ─── YoY Responses (Guion Demo — YTD 2026 vs YTD 2025) ───────────────────────

const ACT1_YOY: AdvisoryResponse = {
  diagnosisTitle: "Performance YTD 2026 vs YTD 2025 — Andes Consumer Goods",
  diagnosisItems: [
    { text: "Sell-In: 105.012 cajas vs 80.356 cajas YTD 2025", deviation: "+30,7% (+24.656 cajas)", deviationDir: "positive" },
    { text: "Sell-Out: 69.174 cajas vs 55.407 cajas YTD 2025", deviation: "+24,8% (+13.767 cajas)", deviationDir: "positive" },
    { text: "Net Revenue: USD 5,16M vs USD 3,93M YTD 2025", deviation: "+31,4% (+USD 1,23M)", deviationDir: "positive" },
    { text: "Gross Margin %: 45,4% vs 41,7% YTD 2025", deviation: "+3,7pp — mejora estructural de COGS", deviationDir: "positive" },
    { text: "EBITDA: USD 1,06M vs USD 703K YTD 2025", deviation: "+50,8% — crece más que el NR", deviationDir: "positive" },
    { text: "EBITDA % sobre NR: 20,5% vs 17,9% YTD 2025", deviation: "+2,6pp — apalancamiento operativo", deviationDir: "positive" },
    { text: "Passthrough (Sell-Out / Sell-In): 65,7% vs 68,9% YTD 2025", deviation: "-3,2pp — canal acumulando stock ⚠️", deviationDir: "negative" },
    { text: "Trade Spend %: 9,8% vs 11,0% YTD 2025", deviation: "-1,2pp — mayor eficiencia", deviationDir: "positive" },
    { text: "Distribución Numérica Efectiva: 64,0% vs 66,1% YTD 2025", deviation: "-2,1pp — caída de cobertura", deviationDir: "negative" },
    { text: "Foto de Éxito (Perfect Store): 64,5% vs 62,4% YTD 2025", deviation: "+2,1pp — mejora leve", deviationDir: "positive" },
  ],
  kpis: [
    { label: "Sell-In YTD", value: "105.012 cajas", change: "+30,7% YoY", changeType: "positive" },
    { label: "Sell-Out YTD", value: "69.174 cajas", change: "+24,8% YoY", changeType: "positive" },
    { label: "Net Revenue", value: "USD 5,16M", change: "+31,4% YoY", changeType: "positive" },
    { label: "EBITDA", value: "USD 1,06M", change: "+50,8% YoY", changeType: "positive" },
    { label: "EBITDA % NR", value: "20,5%", change: "+2,6pp YoY", changeType: "positive" },
    { label: "Passthrough", value: "65,7%", change: "-3,2pp YoY ⚠️", changeType: "negative" },
  ],
  insights: [
    "La empresa crece sólidamente vs el año anterior: +31% en Net Revenue, +51% en EBITDA. Eso valida que el modelo comercial mejora y que hay demanda real en el mercado. Pero hay una tensión visible que merece atención inmediata: el sell-in crece más que el sell-out (+31% vs +25%), lo que significa que el canal está acumulando producto. El passthrough cayó de 68,9% a 65,7%. Si esa brecha no se cierra, el canal va a pedir menos antes de que el stock rote.",
    "La mejora de margen bruto de 3,7pp es el driver más importante del crecimiento del EBITDA del 51%. No es coyuntural: la tendencia es consistente mes a mes en 2026, lo que sugiere un cambio real en la estructura de costos. Eso es una ventaja que hay que defender activamente — no sacrificar precio para ganar volumen a corto plazo.",
    "El Trade Spend bajó de 11,0% a 9,8% del NR — mayor eficiencia en la inversión de canal. La oportunidad concreta es redirigir ese ahorro hacia actividades de sell-out (pull) en lugar de continuar priorizando sell-in (push), que es lo que está generando la acumulación de canal.",
  ],
  initiatives: [
    { num: 1, name: "Diagnóstico de passthrough urgente", owner: "Dir. Comercial + Logística", objective: "Auditar inventario en top 20 distribuidores y mayoristas; cuantificar producto represado antes del próximo ciclo", plazo: "15 días" },
    { num: 2, name: "Plan de sell-out activado", owner: "Trade Marketing + Gerentes de Zona", objective: "Activar pull en canal: sampling, exhibición, activaciones PDV — objetivo passthrough ≥ 72%", plazo: "45 días" },
    { num: 3, name: "Revisión de Trade Spend", owner: "Revenue Management", objective: "Redirigir 30% del presupuesto promocional a actividades con ROI medido en sell-out real, no sell-in", plazo: "30 días" },
  ],
  followUp: [
    "¿En qué canal está concentrado el crecimiento y cuál es el problema de fondo?",
    "¿Por qué el EBITDA creció 51% vs el año pasado si el NR solo creció 31%?",
    "¿En qué zonas geográficas tenemos el peor sell-through?",
  ],
  relatedModule: "ventas",
  source: "demo",
};

const ACT2A_YOY: AdvisoryResponse = {
  diagnosisTitle: "Canal y Mix — YTD 2026 vs YTD 2025",
  diagnosisItems: [
    { text: "Mayoristas: USD 3,36M (65,1%) vs USD 2,59M YTD 2025 — canal sin fuerza de ventas propia", deviation: "+29,5%", deviationDir: "positive" },
    { text: "On Premise: USD 836K (16,2%) vs USD 629K — bares, restaurantes, gastronomía", deviation: "+33,0%", deviationDir: "positive" },
    { text: "Tradicional / Distribuidores: USD 549K (10,6%) vs USD 414K — DSO 67 días vs 45 días contractuales", deviation: "+32,6% / DSO +22 días ⚠️", deviationDir: "neutral" },
    { text: "Moderno (cadenas): USD 415K (8,0%) vs USD 290K — mayor crecimiento relativo del portfolio", deviation: "+43,0%", deviationDir: "positive" },
    { text: "SKU-A-750 (botella 750ml): USD 1,47M — mayor volumen, Price Index 0,955", deviation: "+27,8% YoY / PI -4,5%", deviationDir: "positive" },
    { text: "SKU-B-750 (premium 750ml): USD 1,14M — mejor precio relativo del portfolio", deviation: "+31,9% YoY", deviationDir: "positive" },
    { text: "SKU-B-473 (premium lata): USD 479K — mayor crecimiento del portfolio", deviation: "+43,7% YoY", deviationDir: "positive" },
    { text: "SKU-C-473: USD 508K", deviation: "+37,0% YoY", deviationDir: "positive" },
  ],
  kpis: [
    { label: "Mayoristas NR", value: "65,1%", change: "+29,5% YoY", changeType: "positive" },
    { label: "Canal Moderno", value: "+43,0% YoY", change: "mayor crecimiento", changeType: "positive" },
    { label: "SKU-B-473", value: "USD 479K", change: "+43,7% — líder crecimiento", changeType: "positive" },
    { label: "SKU-A-750 PI", value: "0,955", change: "-4,5% vs precio lista", changeType: "negative" },
  ],
  insights: [
    "Todos los canales crecieron vs el año anterior, pero la dependencia del 65% en Mayoristas persiste — y es una debilidad estructural. Mayoristas opera como autoservicio: sin fuerza de ventas propia, el precio es la única palanca disponible. Mientras el canal Tradicional represente solo el 10,6%, la empresa va a seguir siendo rehén del precio en el canal más grande.",
    "La señal positiva está en los SKUs premium: SKU-B-473 creció 43,7% y SKU-C-473 creció 37%, los dos más altos del portfolio. Eso indica que el consumidor está dispuesto a subir en la escala de precio. Cada punto que gane premium sobre el SKU-A mejora el margen sin incrementar volumen físico.",
    "El SKU-A-750 sigue siendo el de mayor volumen pero con Price Index 0,955 — 4,5% de descuento promedio sobre lista. Ese descuento va al canal (mayoristas), no al consumidor final. Es margen que se entrega sin beneficio de pull.",
  ],
  initiatives: [
    { num: 1, name: "Desarrollo canal Tradicional", owner: "Dir. Comercial + Trade Marketing", objective: "Incrementar participación de distribuidores del 10,6% al 15% de NR", plazo: "12 meses" },
    { num: 2, name: "Contención descuentos SKU-A-750", owner: "Revenue Management", objective: "Subir Price Index de 0,955 a ≥ 0,980 sin perder más del 5% del volumen", plazo: "90 días" },
    { num: 3, name: "Mix shift hacia premium", owner: "RGM + Trade Marketing", objective: "Incrementar SKUs B y C del 42% al 50% del NR total", plazo: "6 meses" },
  ],
  followUp: [
    "¿Hay problemas de cobranza en los distribuidores?",
    "¿En qué zonas geográficas tenemos el peor sell-through?",
    "¿Por qué el EBITDA creció 51% vs el año pasado si el NR solo creció 31%?",
  ],
  relatedModule: "ventas",
  source: "demo",
};

const ACT3_YOY: AdvisoryResponse = {
  diagnosisTitle: "Sell-Through y Ejecución Geográfica — YTD 2026 vs YTD 2025",
  diagnosisItems: [
    { text: "Passthrough global: 65,7% YTD 2026 vs 68,9% YTD 2025", deviation: "-3,2pp pese al crecimiento de volumen", deviationDir: "negative" },
    { text: "PDVs Activos: 3.119 sobre universo asignado 4.872", deviation: "1.753 PDVs inactivos — 36% del universo", deviationDir: "negative" },
    { text: "Distribución Numérica Efectiva: 64,0% vs 66,1% YTD 2025", deviation: "-2,1pp — caída de cobertura", deviationDir: "negative" },
    { text: "Foto de Éxito (Perfect Store): 64,5% vs 62,4% YTD 2025", deviation: "+2,1pp — mejora leve, lejos del target 71%", deviationDir: "neutral" },
    { text: "Zonas críticas (passthrough < 55%): NOA, Sur, Cuyo — intervención urgente", deviationDir: "negative" },
    { text: "Zonas en seguimiento (55-70%): AMBA, Litoral & NEA — monitoreo activo", deviationDir: "neutral" },
    { text: "Zonas saludables (> 70%): CABA — fuente de mejores prácticas replicables", deviationDir: "positive" },
  ],
  kpis: [
    { label: "Passthrough Global", value: "65,7%", change: "-3,2pp YoY (vs 68,9%)", changeType: "negative" },
    { label: "PDVs Activos", value: "3.119", change: "1.753 inactivos (36%)", changeType: "negative" },
    { label: "DN Efectiva", value: "64,0%", change: "-2,1pp YoY", changeType: "negative" },
    { label: "Foto de Éxito", value: "64,5%", change: "+2,1pp YoY / lejos del 71%", changeType: "neutral" },
  ],
  insights: [
    "El mapa hace visible algo que los números globales ocultan: el problema no está distribuido uniformemente. Hay zonas donde el distribuidor ejecuta bien (verde) y zonas donde la operación está rota (rojo). Esa heterogeneidad es una oportunidad — las prácticas de las zonas verdes se pueden replicar al resto.",
    "Con 1.753 PDVs inactivos sobre el universo asignado, hay oportunidad inmediata sin costo de adquisición. Son puntos de venta ya identificados que dejaron de comprar — reconquistarlos tiene menor costo que abrir PDVs nuevos.",
    "La Foto de Éxito del 64,5% dice que en 1 de cada 3 visitas al punto de venta, el agente de campo no logra los estándares mínimos de exhibición y material POP. No es un problema de mercado — es ejecución interna, resoluble con capacitación y checklist digital.",
  ],
  initiatives: [
    { num: 1, name: "Plan de Activación Zonal (zonas rojas)", owner: "Gerentes de Zona", objective: "Passthrough ≥ 75% en zonas críticas (promotoras, eventos PDV, sampling)", plazo: "45 días" },
    { num: 2, name: "Programa Perfect Store", owner: "Trade Marketing + FdV", objective: "Foto de Éxito 64,5% → 72% con checklist digital y supervisión semanal", plazo: "60 días" },
    { num: 3, name: "Reconquista PDVs inactivos", owner: "Ventas + Canal Tradicional", objective: "Reactivar 400 PDVs en NOA, Sur y Cuyo — sin costo de adquisición", plazo: "Q3 2026" },
    { num: 4, name: "Rebalanceo incentivos FdV", owner: "Dirección Comercial", objective: "Comisión: 60% sell-in / 40% sell-out verificado — alinear incentivos a rotación real", plazo: "60 días" },
  ],
  followUp: [
    "¿Cómo impacta la caída de sell-through en el margen?",
    "¿Por qué el EBITDA creció 51% vs el año pasado si el NR solo creció 31%?",
    "¿Cuál es la prioridad concreta para los próximos 90 días?",
  ],
  relatedModule: "sell-through",
  source: "demo",
};

const ACT4A_EBITDA_WHY: AdvisoryResponse = {
  diagnosisTitle: "Por qué el EBITDA creció 51% sobre un NR que creció 31%",
  diagnosisItems: [
    { text: "Net Revenue: USD 5,16M YTD 2026 vs USD 3,93M YTD 2025", deviation: "+31,4%", deviationDir: "positive" },
    { text: "COGS %: 54,6% YTD 2026 vs 58,3% YTD 2025", deviation: "-3,7pp (mejora real de costos)", deviationDir: "positive" },
    { text: "Gross Margin %: 45,4% vs 41,7% YTD 2025", deviation: "+3,7pp → Gross Profit +42,7%", deviationDir: "positive" },
    { text: "Gross Profit absoluto: USD 2,34M vs USD 1,64M YTD 2025", deviation: "+USD 700K — driver principal del EBITDA", deviationDir: "positive" },
    { text: "Gastos Estructura: USD 746K vs USD 672K YTD 2025", deviation: "+11,0% (NR creció +31% — apalancamiento positivo)", deviationDir: "positive" },
    { text: "G&A: USD 206K vs USD 157K YTD 2025", deviation: "+31,2% (en línea con NR)", deviationDir: "neutral" },
    { text: "EBITDA: USD 1,06M vs USD 703K YTD 2025", deviation: "+50,8%", deviationDir: "positive" },
    { text: "EBITDA % sobre NR: 20,5% vs 17,9% YTD 2025", deviation: "+2,6pp", deviationDir: "positive" },
    { text: "Tendencia mensual EBITDA% 2026: Ene 21,1% → Feb 22,5% → Mar 25,0% → Abr 23,5% → May 24,9% → Jun 27,3%", deviationDir: "positive" },
  ],
  kpis: [
    { label: "Net Revenue", value: "USD 5,16M", change: "+31,4% YoY", changeType: "positive" },
    { label: "Gross Margin", value: "45,4%", change: "+3,7pp YoY (COGS -3,7pp)", changeType: "positive" },
    { label: "Gastos Estructura", value: "USD 746K", change: "+11% vs NR +31%", changeType: "positive" },
    { label: "EBITDA", value: "USD 1,06M", change: "+50,8% YoY", changeType: "positive" },
    { label: "EBITDA % NR", value: "20,5%", change: "+2,6pp YoY", changeType: "positive" },
  ],
  insights: [
    "Hay dos efectos que se combinan para explicar el crecimiento del EBITDA del 51% sobre un NR que creció 31%. Efecto 1 — Mejora estructural de COGS (+3,7pp de Gross Margin): el COGS mejoró de 58,3% a 54,6% sobre NR. Sobre una base de USD 5,16M, esos 3,7 puntos representan aproximadamente USD 191K adicionales de Gross Profit. Esta mejora no es coyuntural: la tendencia mensual de EBITDA% es consistente y creciente (Ene 21,1% → Jun 27,3%), lo que sugiere un cambio real en la estructura de costos. Es la señal más valiosa del P&L de hoy.",
    "Efecto 2 — Los Gastos de Estructura no escalaron en proporción al NR: el NR creció 31% pero los Gastos de Estructura solo crecieron 11% (de USD 672K a USD 746K). La estructura diluyó su peso sobre el P&L: pasó del 17,1% al 14,5% del NR. Esa diferencia de 2,6pp sobre USD 5,16M equivale a USD 134K adicionales de EBITDA. La combinación de ambos efectos generó un EBITDA que creció más rápido que el NR. El riesgo: si el NR cae por la saturación de canal que analizamos, los Gastos de Estructura no van a bajar en la misma proporción. El apalancamiento opera en sentido inverso. Por eso resolver el passthrough es también una urgencia financiera.",
  ],
  initiatives: [
    { num: 1, name: "Proteger COGS < 55% en H2 2026", owner: "Dirección de Operaciones", objective: "No sacrificar la mejora estructural de COGS para ganar volumen con descuentos — monitoreo mensual", plazo: "H2 2026" },
    { num: 2, name: "Recuperación de Net Revenue", owner: "Dir. Comercial + RGM", objective: "USD 400K adicionales de NR priorizando canales con mayor velocidad de sell-out", plazo: "60 días" },
    { num: 3, name: "Control de Gastos de Estructura", owner: "Dir. Finanzas", objective: "Contener crecimiento de estructura en ≤ +5% — el apalancamiento que generó el EBITDA se protege con disciplina de costos fijos", plazo: "H2 2026" },
  ],
  followUp: [
    "¿Cuánto de la mejora de margen es estructural vs coyuntural?",
    "¿Cuál es la prioridad concreta para los próximos 90 días?",
    "¿Cómo impacta la saturación del canal en el margen?",
  ],
  relatedModule: "finanzas",
  source: "demo",
};

const ACT4B_90DAYS_YOY: AdvisoryResponse = {
  diagnosisTitle: "Resumen Ejecutivo — KPIs YTD 2026 vs YTD 2025",
  diagnosisItems: [
    { text: "Sell-In: 105.012 cajas vs 80.356 YTD 2025", deviation: "+30,7%", deviationDir: "positive" },
    { text: "Sell-Out: 69.174 cajas vs 55.407 YTD 2025", deviation: "+24,8%", deviationDir: "positive" },
    { text: "Net Revenue: USD 5,16M vs USD 3,93M", deviation: "+31,4%", deviationDir: "positive" },
    { text: "EBITDA: USD 1,06M vs USD 703K", deviation: "+50,8%", deviationDir: "positive" },
    { text: "Passthrough: 65,7% vs 68,9% YTD 2025", deviation: "-3,2pp — riesgo de canal ⚠️", deviationDir: "negative" },
    { text: "Price Index: 0,960 vs 0,965 YTD 2025", deviation: "Estable — oportunidad de captura de precio", deviationDir: "neutral" },
    { text: "PDVs Activos: 3.119 sobre universo 4.872", deviation: "1.753 PDVs inactivos (36%)", deviationDir: "negative" },
    { text: "DSO Tradicional: 67 días vs ~58 días YTD 2025", deviation: "+9 días de atraso", deviationDir: "negative" },
  ],
  kpis: [
    { label: "Net Revenue", value: "USD 5,16M", change: "+31,4% YoY", changeType: "positive" },
    { label: "EBITDA", value: "USD 1,06M", change: "+50,8% YoY", changeType: "positive" },
    { label: "Passthrough", value: "65,7%", change: "-3,2pp YoY ⚠️", changeType: "negative" },
    { label: "PDVs Inactivos", value: "1.753", change: "36% del universo asignado", changeType: "negative" },
  ],
  insights: [
    "CAUSA RAÍZ 1 — El canal está saturado, no el consumidor. El sell-out crece +25% vs año anterior — hay demanda real. Pero el sell-in creció +31%, generando acumulación de stock en el canal. El passthrough cayó 3,2pp. Si no se corrige, el canal va a pedir menos antes de que el stock rote.",
    "CAUSA RAÍZ 2 — La mejora de margen es real y sostenida pero tiene un límite. COGS mejoró 3,7pp y los Gastos de Estructura crecieron solo 11% vs NR +31% — eso explica por qué el EBITDA creció 51% sobre un NR que creció 31%. Sin embargo, si el NR cae por saturación del canal, el apalancamiento opera en sentido inverso y el margen se comprime más rápido de lo que se ganó.",
    "CAUSA RAÍZ 3 — El modelo de canales sigue siendo estructuralmente frágil. El 65% de NR en Mayoristas sin fuerza de ventas propia significa que el precio es la única palanca en el canal más grande. El canal Tradicional con vendedores en la calle representa solo el 10,6%. Mientras eso no cambie, la empresa no va a poder ejecutar pull con independencia del precio.",
    "PLAN 90 DÍAS — MES 1 (Urgente): Auditoría de stock en top 20 distribuidores y mayoristas · Congelar descuentos adicionales en SKU-A-750 · Suspender despachos a distribuidores con DSO > 75 días · Activar plan de sell-out en zonas rojas. MES 2 (Estabilización): Lanzar esquema 2/10 net 45 para distribuidores · Programa Perfect Store con checklist digital · Rebalancear incentivos FdV (60% sell-in / 40% sell-out). MES 3 (Crecimiento): Incorporar 3-5 distribuidores nuevos · Incrementar mix SKUs B y C en +5pp del NR total · Revisar estructura de costos con objetivo de crecimiento ≤ +5% en H2.",
  ],
  initiatives: [
    { num: 1, name: "Mes 1 — Diagnóstico urgente y contención", owner: "Ventas + Logística + RGM", objective: "Auditoría stock top 20 clientes · PI SKU-A-750 ≥ 0,980 · Suspender despachos DSO > 75 días", plazo: "Mes 1" },
    { num: 2, name: "Mes 2 — Estabilización y ejecución", owner: "Finanzas + Trade Marketing + FdV", objective: "Esquema 2/10 net 45 · Foto de Éxito → 72% · Reconquistar 400 PDVs inactivos en NOA, Sur y Cuyo", plazo: "Mes 2" },
    { num: 3, name: "Mes 3 — Crecimiento sostenido", owner: "Dir. Comercial + Dir. Finanzas", objective: "Passthrough 65,7% → 74% · NR +USD 300-500K adicionales · 3-5 distribuidores nuevos", plazo: "Mes 3" },
  ],
  followUp: [
    "¿Cómo estamos vs el año pasado en los principales KPIs?",
    "¿En qué canal está concentrado el crecimiento?",
    "¿Por qué el EBITDA creció 51% si el NR creció 31%?",
  ],
  relatedModule: "finanzas",
  source: "demo",
};

// ─── Guided Demo Acts ─────────────────────────────────────────────────────────

export const GUIDED_DEMO_ACTS: GuidedDemoAct[] = [
  {
    id: "act1",
    title: "Diagnóstico Ejecutivo",
    moduleId: "workspace",
    moduleRoute: "/workspace",
    dataSources: ["Control_Objetivos_Mensual"],
    suggestedQuestions: [
      "¿Cómo estamos vs presupuesto YTD 2026?",
      "¿Cuál es el desvío de EBITDA vs presupuesto?",
      "¿Dónde está el mayor problema: volumen, precio o mix?",
    ],
    responses: {
      main: ACT1_DIAGNOSIS_MAIN,
      ebitda: ACT1_DIAGNOSIS_EBITDA,
      drivers: ACT1_DIAGNOSIS_DRIVERSCORE,
    },
  },
  {
    id: "act2",
    title: "Drill-down de Ventas",
    moduleId: "ventas",
    moduleRoute: "/workspace/ventas",
    dataSources: ["KPI_Canal_Detallado", "KPI_SKU_Detallado", "KPI_DSO_FacturasPagos"],
    suggestedQuestions: [
      "¿En qué canal está el mayor desvío de volumen?",
      "¿Qué SKUs tienen mayor caída de margen?",
      "¿Hay clientes con problemas de cobranza?",
      "¿El problema es de mix o de precio?",
    ],
    responses: {
      canal: ACT2A_CANAL,
      cobranza: ACT2B_COBRANZA,
    },
  },
  {
    id: "act3",
    title: "Sell-Through y Mapa Geográfico",
    moduleId: "sell-through",
    moduleRoute: "/workspace/sell-through",
    dataSources: ["KPI_SellThrough_Detallado", "KPI_DN_Detallado"],
    suggestedQuestions: [
      "¿En qué zonas tenemos el peor sell-through?",
      "¿Dónde está cayendo la distribución numérica?",
      "¿Cómo está la ejecución en el punto de venta?",
    ],
    responses: {
      main: ACT3_SELLTHROUGH,
    },
  },
  {
    id: "act4",
    title: "Impacto en Margen y Síntesis",
    moduleId: "finanzas",
    moduleRoute: "/workspace/finanzas",
    dataSources: ["KPI_PL_Detallado", "KPI_GrossMargin_Det", "KPI_COGS_pct_Det"],
    suggestedQuestions: [
      "¿Cómo impacta la caída de volumen en el margen?",
      "¿Cuánto EBITDA perdemos si el volumen no se recupera en Q3?",
      "¿Cuál es la prioridad para los próximos 90 días?",
    ],
    responses: {
      margen: ACT4A_MARGEN,
      plan90: ACT4B_PLAN90,
    },
  },
];

// ─── Builder ──────────────────────────────────────────────────────────────────

export function buildAdvisoryMessage(response: AdvisoryResponse, content = ""): Message {
  return {
    id: `msg-advisory-${generateId()}`,
    role: "assistant",
    content,
    blocks: [
      ...(response.kpis && response.kpis.length > 0
        ? [{ type: "kpi-strip" as const, data: { kpis: response.kpis } }]
        : []),
      {
        type: "advisory-response" as const,
        data: {
          diagnosisTitle: response.diagnosisTitle,
          diagnosisItems: response.diagnosisItems,
          insights: response.insights,
          initiatives: response.initiatives,
          source: response.source ?? "demo",
        },
      },
      ...(response.followUp && response.followUp.length > 0
        ? [{ type: "follow-up-questions" as const, data: { questions: response.followUp } }]
        : []),
    ],
    timestamp: new Date().toISOString(),
  };
}

// ─── Matcher ──────────────────────────────────────────────────────────────────

export function getAdvisoryResponse(question: string): Message | null {
  const q = question.toLowerCase();

  // ── YoY guion flow (check first — these are the primary demo questions) ─────

  // Act 1 YoY — "Como estamos vs el año pasado"
  if (
    (q.includes("año pasado") && (q.includes("kpi") || q.includes("important") || q.includes("cómo estamos") || q.includes("como estamos"))) ||
    (q.includes("cómo estamos") && q.includes("2025")) ||
    (q.includes("como estamos") && q.includes("2025"))
  ) {
    return buildAdvisoryMessage(ACT1_YOY, "Aquí está el performance de Andes Consumer Goods YTD 2026 versus el mismo período del año pasado.");
  }

  // Act 2a YoY — "En qué canal está concentrado el crecimiento"
  if (
    q.includes("concentrado el crecimiento") ||
    (q.includes("canal") && q.includes("crecimiento") && q.includes("problema")) ||
    (q.includes("canal") && q.includes("crecimiento") && q.includes("fondo"))
  ) {
    return buildAdvisoryMessage(ACT2A_YOY, "Mirando la composición del crecimiento por canal y SKU versus el año anterior.");
  }

  // Act 4a YoY — "Por qué el EBITDA creció 51%"
  if (
    (q.includes("ebitda") && q.includes("51")) ||
    (q.includes("ebitda") && q.includes("creció") && (q.includes("nr") || q.includes("revenue") || q.includes("31") || q.includes("más que"))) ||
    (q.includes("por qué") && q.includes("ebitda") && q.includes("creció")) ||
    (q.includes("por que") && q.includes("ebitda") && q.includes("crecio"))
  ) {
    return buildAdvisoryMessage(ACT4A_EBITDA_WHY, "Para entender por qué el EBITDA creció más que el Net Revenue, hay dos efectos que se combinan.");
  }

  // Act 3 YoY — "En qué zonas tenemos el peor sell-through" (YoY context)
  if (
    (q.includes("zona") && (q.includes("sell-through") || q.includes("peor") || q.includes("geográf"))) ||
    (q.includes("pdv") && (q.includes("inactiv") || q.includes("cobertura"))) ||
    q.includes("foto de éxito") || q.includes("foto de exito") || q.includes("perfect store")
  ) {
    return buildAdvisoryMessage(ACT3_YOY, "Analizando sell-through y ejecución geográfica en el contexto del crecimiento YoY.");
  }

  // Act 4b YoY — "Cuál es la prioridad para los próximos 90 días"
  if (q.includes("90 día") || q.includes("prioridad concreta") || q.includes("próximos 90") || q.includes("plan 90") || q.includes("3 causas")) {
    return buildAdvisoryMessage(ACT4B_90DAYS_YOY, "Sintetizando el diagnóstico completo y las prioridades para los próximos 90 días.");
  }

  // ── Existing vs-budget flow ────────────────────────────────────────────────

  // Act 4b — Plan 90 días (vs-budget context)
  if (q.includes("síntesis") || q.includes("resumen ejecutivo") || (q.includes("próximos") && q.includes("días")) || q.includes("prioridad")) {
    return buildAdvisoryMessage(ACT4B_PLAN90);
  }

  // Act 4a — Margen (vs-budget context)
  if (q.includes("impacta") && (q.includes("volumen") || q.includes("caída"))) {
    return buildAdvisoryMessage(ACT4A_MARGEN);
  }
  if (q.includes("ebitda") && (q.includes("perde") || q.includes("no se recupera") || q.includes("q3"))) {
    return buildAdvisoryMessage(ACT4A_MARGEN);
  }
  if (q.includes("costos fijos") || q.includes("estructura de costos") || q.includes("gross margin") || q.includes("cogs")) {
    return buildAdvisoryMessage(ACT4A_MARGEN);
  }

  // Act 3 — Sell-Through / Zonas
  if (q.includes("zona") || q.includes("sell-through") || q.includes("distribución numérica") || q.includes("mapa") || q.includes("fdv")) {
    return buildAdvisoryMessage(ACT3_SELLTHROUGH);
  }

  // Act 2b — Cobranza / DSO
  if (q.includes("cobranza") || q.includes("dso") || q.includes("facturas") || q.includes("días sin cobrar") || q.includes("pronto pago")) {
    return buildAdvisoryMessage(ACT2B_COBRANZA, "Revisando la situación de cobranza en el canal Tradicional.");
  }

  // Act 2a — Canal y SKU
  if (q.includes("canal") && (q.includes("concentrado") || q.includes("desvío") || q.includes("mayor") || q.includes("fondo"))) {
    return buildAdvisoryMessage(ACT2A_CANAL);
  }
  if ((q.includes("mix") || q.includes("precio")) && (q.includes("problema") || q.includes("es de"))) {
    return buildAdvisoryMessage(ACT2A_CANAL);
  }
  if (q.includes("mayoristas") || q.includes("distribuidor") || q.includes("sku-a") || q.includes("sku-b") || q.includes("tradicional")) {
    return buildAdvisoryMessage(ACT2A_CANAL);
  }

  // Act 1 — Diagnóstico Ejecutivo (vs-budget)
  if (q.includes("ebitda") && (q.includes("desvío") || q.includes("presupuesto") || q.includes("vs"))) {
    return buildAdvisoryMessage(ACT1_DIAGNOSIS_EBITDA);
  }
  if (q.includes("volumen, precio") || q.includes("mayor problema") || q.includes("precio o mix")) {
    return buildAdvisoryMessage(ACT1_DIAGNOSIS_DRIVERSCORE);
  }
  if (q.includes("presupuesto ytd") || q.includes("vs presupuesto") || (q.includes("cómo estamos") && q.includes("2026"))) {
    return buildAdvisoryMessage(ACT1_DIAGNOSIS_MAIN);
  }
  if (q.includes("performance") || q.includes("desvío de performance") || q.includes("desvio de performance")) {
    return buildAdvisoryMessage(ACT1_DIAGNOSIS_MAIN);
  }

  return null;
}

// ─── All questions across all acts ────────────────────────────────────────────

export const ALL_GUIDED_QUESTIONS = GUIDED_DEMO_ACTS.flatMap((act) => act.suggestedQuestions);

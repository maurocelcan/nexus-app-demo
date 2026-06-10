import type { Conversation, Notification, Project } from "@/types/analytics";
import type { Message } from "@/types/chat";
import type { SalesKpis } from "@/types/dataset";
import { DEMO_CPG_TOTALS, SKUS } from "@/data/demo-cpg";
import { DEMO_PROJECT_MESSAGES, DEMO_PROJECTS } from "@/data/mock-projects";
import { getAdvisoryResponse } from "@/data/demo-advisory-flow";
import { getBusinessArea, normalizeAreaIds } from "@/data/business-areas";

const ESPUMANTE = SKUS[0];
const fmtInt = (value: number) => value.toLocaleString("es-AR");
const fmtUsdM = (value: number) => `USD ${(value / 1000000).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
const fmtUsdK = (value: number) => `USD ${Math.round(value / 1000)}K`;

export const MOCK_PROJECTS = DEMO_PROJECTS;

const RAW_MOCK_CONVERSATIONS: Array<Omit<Conversation, "areaIds" | "primaryAreaId"> & Partial<Pick<Conversation, "areaIds" | "primaryAreaId">>> = [
  { id: "conv-001", projectId: "proj-002", title: "Diagnóstico integral de ventas YTD 2026", area: "Ventas", messageCount: 8, status: "active", createdAt: "2026-05-13T10:00:00Z", updatedAt: "2026-05-13T10:28:00Z" },
  { id: "conv-002", projectId: "proj-002", title: "Análisis de precios y competencia", area: "RGM", messageCount: 6, status: "active", createdAt: "2026-05-14T09:30:00Z", updatedAt: "2026-05-14T09:48:00Z" },
  { id: "conv-003", projectId: "proj-002", title: "Trade marketing y ejecución en canal", area: "Trade Marketing", messageCount: 6, status: "active", createdAt: "2026-05-16T14:00:00Z", updatedAt: "2026-05-16T14:19:00Z" },
  { id: "conv-004", projectId: "proj-002", title: "Preparación presentación ejecutiva", area: "Ventas", messageCount: 6, status: "active", createdAt: "2026-05-19T08:00:00Z", updatedAt: "2026-05-19T08:25:00Z" },
  { id: "conv-005", projectId: "proj-003", title: "Diagnóstico de cobertura en cadenas regionales", area: "Sell-Through", messageCount: 6, status: "active", createdAt: "2026-05-10T10:00:00Z", updatedAt: "2026-05-10T10:22:00Z" },
  { id: "conv-006", projectId: "proj-003", title: "Construcción de plan de activación por zona", area: "Sell-Through", messageCount: 4, status: "active", createdAt: "2026-05-18T11:00:00Z", updatedAt: "2026-05-18T11:18:00Z" },
  { id: "conv-009", projectId: "proj-003", title: "Plan de reposición y seguimiento semanal", area: "Sell-Through", messageCount: 4, status: "active", createdAt: "2026-05-20T09:00:00Z", updatedAt: "2026-05-20T09:15:00Z" },
  { id: "conv-007", projectId: "proj-004", title: "Diagnóstico Cencosud: sell-in, passthrough y PDVs", area: "Ventas", messageCount: 6, status: "active", createdAt: "2026-05-12T09:00:00Z", updatedAt: "2026-05-12T09:24:00Z" },
  { id: "conv-010", projectId: "proj-004", title: "Cruce ventas + sell-through: insights estratégicos", area: "Ventas", messageCount: 4, status: "active", createdAt: "2026-05-17T10:00:00Z", updatedAt: "2026-05-17T10:18:00Z" },
  { id: "conv-011", projectId: "proj-004", title: "Posición de negociación y aprobaciones internas", area: "Ventas", messageCount: 4, status: "active", createdAt: "2026-05-18T15:00:00Z", updatedAt: "2026-05-18T15:16:00Z" },
  { id: "conv-008", projectId: "proj-004", title: "Preparación presentación Top 2 Top Cencosud", area: "Ventas", messageCount: 8, status: "active", createdAt: "2026-05-19T14:00:00Z", updatedAt: "2026-05-19T14:28:00Z" },
  { id: "conv-brief-001", projectId: "proj-002", title: "Configuración inicial del proyecto", area: "Ventas", messageCount: 10, status: "active", createdAt: "2026-06-01T09:00:00Z", updatedAt: "2026-06-01T09:16:00Z" },
];

export const MOCK_CONVERSATIONS: Conversation[] = RAW_MOCK_CONVERSATIONS.map((conversation) => {
  const areaIds = normalizeAreaIds(conversation.areaIds?.length ? conversation.areaIds : [conversation.primaryAreaId, conversation.area, conversation.scope]);
  const primaryAreaId = conversation.primaryAreaId ?? areaIds[0];
  const primaryArea = getBusinessArea(primaryAreaId);
  return {
    ...conversation,
    areaIds,
    primaryAreaId,
    area: primaryArea?.label,
    scope: primaryArea?.routeId ?? conversation.scope ?? "global",
  };
});

export const MOCK_CONVERSATION_MESSAGES: Record<string, Message[]> = DEMO_PROJECT_MESSAGES;

export const SUGGESTED_QUESTIONS = [
  "Dame un resumen ejecutivo del portafolio YTD 2026",
  "¿Por qué el Espumante tiene passthrough bajo en supermercados?",
  "¿Cómo está el Price Index vs la competencia?",
  "¿Dónde hay mayor riesgo de quiebre de stock?",
  "Armá el Business Review ejecutivo para dirección",
  "¿Qué canal aporta mayor EBITDA absoluto?",
];

export const AGENT_STEPS = [
  "Interpretando pregunta de negocio",
  "Identificando fuentes relevantes",
  "Consultando dataset comercial",
  "Calculando KPIs y comparando vs objetivos",
  "Generando insight causal",
  "Preparando acciones sugeridas",
];

export function getContextualAgentSteps(question: string): string[] {
  const q = question.toLowerCase();

  if (q.includes("año pasado") || q.includes("yoy") || q.includes("2025") || (q.includes("cómo estamos") && q.includes("kpi"))) {
    return [
      "Comparando KPIs YTD 2026 vs YTD 2025",
      "Calculando variaciones sell-in y sell-out",
      "Analizando evolución de márgenes",
      "Detectando tensión en passthrough de canal",
      "Conectando tendencias con riesgo comercial",
      "Preparando análisis narrativo ejecutivo",
    ];
  }

  if (
    (q.includes("ebitda") && q.includes("51")) ||
    (q.includes("ebitda") && q.includes("creció")) ||
    (q.includes("por qué") && q.includes("ebitda"))
  ) {
    return [
      "Descomponiendo efecto COGS vs apalancamiento operativo",
      "Calculando contribución de mejora estructural de costos",
      "Analizando tendencia mensual de EBITDA%",
      "Cuantificando efecto de Gastos de Estructura",
      "Evaluando sostenibilidad de la tendencia",
      "Preparando diagnóstico financiero",
    ];
  }

  if (q.includes("zona") || q.includes("sell-through") || q.includes("mapa") || q.includes("pdv") || q.includes("distribución") || q.includes("foto de éxito")) {
    return [
      "Cargando datos geográficos de passthrough",
      "Mapeando cobertura de PDVs por zona",
      "Identificando distribuidores con baja rotación",
      "Analizando PDVs activos vs universo asignado",
      "Calculando impacto de ejecución en punto de venta",
      "Preparando plan de activación zonal",
    ];
  }

  if (q.includes("canal") && (q.includes("crecimiento") || q.includes("concentrado") || q.includes("fondo"))) {
    return [
      "Analizando mix de canales YTD 2026 vs 2025",
      "Calculando concentración y dependencia por canal",
      "Evaluando performance y crecimiento por SKU",
      "Identificando riesgos de dependencia en Mayoristas",
      "Detectando oportunidad en canales con fuerza de ventas",
      "Preparando drill-down comercial",
    ];
  }

  if (q.includes("cobranza") || q.includes("dso") || q.includes("facturas")) {
    return [
      "Cargando datos de cobranza por distribuidor",
      "Calculando DSO por canal",
      "Identificando distribuidores con atraso",
      "Correlacionando DSO con rotación de inventario",
      "Evaluando riesgo de crédito por cliente",
      "Preparando política de crédito recomendada",
    ];
  }

  if (q.includes("90 día") || q.includes("prioridad") || q.includes("síntesis") || q.includes("causas raíz")) {
    return [
      "Consolidando diagnóstico multi-área",
      "Priorizando iniciativas por impacto y urgencia",
      "Calculando quick wins del primer mes",
      "Construyendo roadmap de 90 días",
      "Alineando iniciativas con causas raíz identificadas",
      "Preparando síntesis ejecutiva",
    ];
  }

  if (q.includes("margen") || q.includes("cogs") || q.includes("gross margin") || q.includes("rentabilidad")) {
    return [
      "Analizando estructura de costos YTD",
      "Calculando desviación de COGS vs período anterior",
      "Evaluando impacto de costos fijos sobre margen",
      "Identificando palancas de recuperación de margen",
      "Modelando escenarios de precio y volumen",
      "Preparando análisis financiero",
    ];
  }

  return AGENT_STEPS;
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-001",
    title: "Brecha de passthrough detectada",
    description: "Supermercados muestra passthrough del 53% vs objetivo del 72%. Requiere acción esta semana.",
    type: "alert",
    read: false,
    link: "/workspace/ventas",
    createdAt: "2026-05-13T08:00:00Z",
  },
  {
    id: "notif-002",
    title: "Demo CPG sincronizada",
    description: `Dataset Demo CPG Portfolio 2025-2026 cargado correctamente. ${fmtInt(DEMO_CPG_TOTALS.sellIn)} cajas sell-in YTD disponibles.`,
    type: "success",
    read: false,
    createdAt: "2026-05-13T07:45:00Z",
  },
  {
    id: "notif-003",
    title: "Price Index por debajo del mercado",
    description: "Price Index promedio YTD 2026 en 0.96 — 4% por debajo de lo esperado. Revisar con RGM.",
    type: "warning",
    read: false,
    createdAt: "2026-05-12T16:30:00Z",
  },
  {
    id: "notif-004",
    title: "Plan de acción pendiente de owner",
    description: "El plan 'Recuperación Supermercados' tiene 2 acciones sin asignar owner.",
    type: "info",
    read: true,
    link: "/workspace",
    createdAt: "2026-05-12T10:00:00Z",
  },
  {
    id: "notif-005",
    title: "Riesgo de OOS — Gin Botánico",
    description: "Cobertura de stock en Cadenas Especializadas: 3.2 semanas vs benchmark de 6 semanas.",
    type: "alert",
    read: true,
    link: "/workspace/ventas",
    createdAt: "2026-05-11T14:00:00Z",
  },
];

export const MOCK_INITIAL_MESSAGE: Message = {
  id: "msg-welcome",
  role: "assistant",
  content: `Hola. Workspace CPG Growth Team conectado con Demo CPG Portfolio 2025-2026 para Andes Consumer Goods.\n\nYTD 2026 vs el año anterior: USD 5,16M Net Revenue (+31,4%), USD 1,06M EBITDA (+50,8%), 105.012 cajas sell-in (+30,7%). Hay una señal a monitorear: el passthrough cayó a 65,7% — el canal acumula más stock del que rota. ¿Por dónde querés empezar?`,
  blocks: [],
  timestamp: new Date().toISOString(),
};

function generatePassthroughResponse(): Message {
  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: "",
    blocks: [
      {
        type: "executive-summary",
        data: {
          title: "Passthrough bajo en Espumante Brut — Canal Supermercados",
          summary:
            `El passthrough del ${ESPUMANTE.passthrough}% en Supermercados es inferior al benchmark de 72%. La causa principal es acumulación de stock en canal: ${fmtInt(ESPUMANTE.sellIn)} cajas sell-in vs ${fmtInt(ESPUMANTE.sellOut)} cajas sell-out, generando ${fmtInt(ESPUMANTE.stock)} cajas de stock acumulado. Carrefour y Coto concentran el 68% del problema.`,
          period: "YTD 2026 (Ene–Jun)",
          severity: "high",
        },
      },
      {
        type: "kpi-strip",
        data: {
          kpis: [
            { label: "Passthrough", value: `${ESPUMANTE.passthrough}%`, change: "-19pp vs benchmark", changeType: "negative" },
            { label: "Sell-in", value: `${fmtInt(ESPUMANTE.sellIn)} cajas`, change: "+14%", changeType: "negative" },
            { label: "Sell-out", value: `${fmtInt(ESPUMANTE.sellOut)} cajas`, change: "+7%", changeType: "positive" },
            { label: "Stock canal", value: `${fmtInt(ESPUMANTE.stock)} cajas`, change: "+38%", changeType: "negative" },
            { label: "Cobertura", value: "8,7 semanas", change: "+3,2 sem", changeType: "negative" },
          ],
        },
      },
      {
        type: "insight-card",
        data: {
          insights: [
            {
              type: "alert",
              title: "Sobrestock en Carrefour y Coto",
              description: "Estas dos cadenas concentran el 68% del stock acumulado. Cobertura promedio: 10,2 semanas vs benchmark de 4-5 semanas para espumantes en categoría premium.",
            },
            {
              type: "opportunity",
              title: "Jumbo y Disco con mejor rotación",
              description: "Jumbo (72% passthrough) y Disco (68%) muestran mejor conversión. Redirigir esfuerzos y trade spend hacia estos canales puede recuperar 8-10pp de passthrough global.",
            },
          ],
        },
      },
      {
        type: "chart",
        data: { chartId: "passthrough-comparison", type: "line-bar", title: "Sell-in vs Sell-out — Espumante Brut (YTD 2026)" },
      },
      {
        type: "recommendations",
        data: {
          recommendations: [
            { id: "r1", title: "Pausar despacho a Carrefour y Coto", description: "Suspender sell-in por 3-4 semanas hasta normalizar cobertura en canal. Revisar condiciones contractuales.", priority: "high" },
            { id: "r2", title: "Activar exhibición especial + price off 15%", description: "Implementar precio especial y exhibición secundaria en las 20 bocas con mayor stock acumulado.", priority: "high" },
            { id: "r3", title: "Redireccionar budget a Jumbo y Disco", description: "Mover 40% del trade spend de Carrefour hacia cadenas con mejor conversión en góndola.", priority: "medium" },
            { id: "r4", title: "Revisar ejecución en góndola", description: "Auditoría de facing, posicionamiento y material POP en 15 bocas con menor rotación.", priority: "medium" },
          ],
        },
      },
      {
        type: "action-plan",
        data: {
          actions: [
            { id: "a1", label: "Crear plan de recuperación", action: "create-plan" },
            { id: "a3", label: "Abrir módulo Ventas", action: "open-ventas" },
          ],
        },
      },
      {
        type: "follow-up-questions",
        data: {
          questions: [
            "¿Cómo compara el passthrough de Espumante vs el resto del portafolio?",
            "¿Cuál es el ROI de la última promo en Carrefour?",
            "¿Qué cadenas tienen mejor stock coverage?",
          ],
        },
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

function generatePortfolioResponse(): Message {
  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: "",
    blocks: [
      {
        type: "executive-summary",
        data: {
          title: "Estado Comercial del Portafolio — YTD 2026",
          summary:
            `El portafolio muestra crecimiento sólido en volumen (+14% sell-in, +10% sell-out) pero con señales de alerta. Espumante y Gin acumulan sobrestock. EBITDA de ${fmtUsdK(DEMO_CPG_TOTALS.ebitda)} es +8% vs YTD 2025 pero el Price Index de ${DEMO_CPG_TOTALS.priceIndex} indica margen de captura de precio. Carrefour y Coto explican el 38% del sell-in total.`,
          period: "YTD 2026 (Ene–Jun 2026)",
          severity: "medium",
        },
      },
      {
        type: "kpi-strip",
        data: {
          kpis: [
            { label: "Sell-in", value: `${fmtInt(DEMO_CPG_TOTALS.sellIn)} cajas`, change: "+14% YTD", changeType: "positive" },
            { label: "Sell-out", value: `${fmtInt(DEMO_CPG_TOTALS.sellOut)} cajas`, change: "+10% YTD", changeType: "positive" },
            { label: "Net Revenue", value: fmtUsdM(DEMO_CPG_TOTALS.netRevenue), change: "+12%", changeType: "positive" },
            { label: "EBITDA", value: fmtUsdK(DEMO_CPG_TOTALS.ebitda), change: "+8%", changeType: "positive" },
            { label: "Price Index", value: String(DEMO_CPG_TOTALS.priceIndex).replace(".", ","), change: "-4pp", changeType: "negative" },
          ],
        },
      },
      {
        type: "chart",
        data: { chartId: "portfolio-overview", type: "multi-bar", title: "Sell-in vs Sell-out por SKU — YTD 2026" },
      },
      {
        type: "insight-card",
        data: {
          insights: [
            { type: "alert", title: `Espumante Brut con passthrough crítico (${ESPUMANTE.passthrough}%)`, description: `El SKU de mayor volumen en Supermercados acumula ${fmtInt(ESPUMANTE.stock)} cajas de stock en canal. Riesgo de devoluciones en Q3 2026.` },
            { type: "opportunity", title: "Cerveza IPA con momentum positivo (+18% vs budget)", description: "Mejor passthrough del portafolio (85%). Oportunidad de incrementar share en cadenas nacionales." },
            { type: "warning", title: "Price Index por debajo del objetivo", description: "0.96 vs objetivo de 1.00. Equivale a USD ~215K de revenue potencial no capturado." },
          ],
        },
      },
      {
        type: "recommendations",
        data: {
          recommendations: [
            { id: "r1", title: "Plan correctivo urgente para Espumante", description: "Passthrough del 53% genera riesgo de sobrestock en Q3 y posibles devoluciones de cadenas.", priority: "high" },
            { id: "r2", title: "Capturar precio en Cerveza IPA", description: "Con passthrough del 85% y momentum positivo, hay espacio para ajuste de precio sin impacto en volumen.", priority: "medium" },
            { id: "r3", title: "Revisar Price Index en categoría Destilados", description: "Gin Botánico tiene margen del 48% pero Price Index de 0.92 — mayor descuento promedio del portafolio.", priority: "medium" },
          ],
        },
      },
      {
        type: "action-plan",
        data: {
          actions: [
            { id: "a1", label: "Crear plan de acción", action: "create-plan" },
            { id: "a3", label: "Abrir módulo Ventas", action: "open-ventas" },
          ],
        },
      },
      {
        type: "follow-up-questions",
        data: {
          questions: [
            "¿Por qué el Espumante tiene passthrough tan bajo en supermercados?",
            "Prepará un análisis T2T para Carrefour",
            "¿Cómo está el Price Index vs mercado?",
          ],
        },
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

function generateT2TResponse(): Message {
  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: "",
    blocks: [
      {
        type: "executive-summary",
        data: {
          title: "Análisis T2T — Carrefour Argentina",
          summary:
            "Carrefour representa el 22% del sell-in total YTD 2026 (31.702 cajas). Net Revenue USD 1.18M, EBITDA USD 112K (margen 9.5%). El principal desafío es el passthrough del 51% en espumantes y el cost-to-serve elevado (+3.2pp vs portfolio promedio). Oportunidades: expansión en Cerveza IPA (+18% momentum) y revisión de condiciones de devolución.",
          period: "YTD 2026",
          severity: "medium",
        },
      },
      {
        type: "kpi-strip",
        data: {
          kpis: [
            { label: "Sell-in Carrefour", value: "31.702 cajas", change: "+11%", changeType: "positive" },
            { label: "Net Revenue", value: "USD 1,18M", change: "+9%", changeType: "positive" },
            { label: "EBITDA", value: "USD 112K", change: "+4%", changeType: "positive" },
            { label: "Margen EBITDA", value: "9,5%", change: "-0,4pp", changeType: "negative" },
            { label: "Cost to Serve", value: "18,2%", change: "+3,2pp", changeType: "negative" },
          ],
        },
      },
      {
        type: "chart",
        data: { chartId: "t2t-carrefour", type: "bar", title: "Sell-in vs Sell-out — Carrefour YTD 2026" },
      },
      {
        type: "insight-card",
        data: {
          insights: [
            { type: "alert", title: "Cost to Serve elevado vs benchmark", description: "18.2% en Carrefour vs 15% de benchmark. Logística de última milla y condiciones de entrega explican el delta." },
            { type: "opportunity", title: "Expansión Cerveza IPA en Carrefour Hipermercados", description: "SKU con mejor momentum (+18% vs budget). Proponer incremento de facing y exhibición secundaria en 12 hipermercados." },
          ],
        },
      },
      {
        type: "recommendations",
        data: {
          recommendations: [
            { id: "r1", title: "Renegociar condiciones de devolución Espumante", description: "Proponer reducción de plazo de devolución de 60 a 30 días para liberar stock acumulado.", priority: "high" },
            { id: "r2", title: "Activar programa de exhibición secundaria IPA", description: "Inversión de USD 12K en material POP e isla de exhibición en 12 hipermercados Carrefour.", priority: "medium" },
            { id: "r3", title: "Revisión de frecuencia de entrega", description: "Consolidar entregas de 3 a 2 veces por semana para reducir cost to serve 1.5-2pp.", priority: "medium" },
          ],
        },
      },
      {
        type: "action-plan",
        data: {
          actions: [
            { id: "a2", label: "Crear plan de acción", action: "create-plan" },
          ],
        },
      },
      {
        type: "follow-up-questions",
        data: {
          questions: [
            "¿Cómo se compara Carrefour vs Coto en términos de rentabilidad?",
            "¿Cuál es el ROI de las promos activas en Carrefour?",
            "¿Cuánto mejoraría el EBITDA si reducimos el cost to serve?",
          ],
        },
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

function generatePriceIndexResponse(): Message {
  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: "",
    blocks: [
      {
        type: "executive-summary",
        data: {
          title: "Price Index vs Mercado — YTD 2026",
          summary:
            `El Price Index promedio del portafolio es ${DEMO_CPG_TOTALS.priceIndex}, indicando que el precio real de góndola está un 4% por debajo del precio de lista sugerido. El SKU con mayor descuento es Gin Botánico (0.92). Esta brecha representa USD 215K de revenue potencial no capturado en el período. La categoría Cervezas es la única por encima del índice objetivo (1.01).`,
          period: "YTD 2026",
          severity: "medium",
        },
      },
      {
        type: "kpi-strip",
        data: {
          kpis: [
            { label: "Price Index promedio", value: String(DEMO_CPG_TOTALS.priceIndex).replace(".", ","), change: "-4pp vs objetivo", changeType: "negative" },
            { label: "Revenue no capturado", value: "USD 215K", change: "oportunidad", changeType: "negative" },
            { label: "SKU más afectado", value: "Gin Botánico", change: "0,92", changeType: "negative" },
            { label: "Mejor PI", value: "Cerveza IPA", change: "1,01", changeType: "positive" },
          ],
        },
      },
      {
        type: "chart",
        data: { chartId: "price-index-sku", type: "bar", title: "Price Index por SKU vs Benchmark — YTD 2026" },
      },
      {
        type: "recommendations",
        data: {
          recommendations: [
            { id: "r1", title: "Reducir descuentos en Gin Botánico", description: "Aumentar PI de 0.92 a 0.96 en cadenas especializadas captura USD 45K adicionales sin impacto en volumen estimado.", priority: "high" },
            { id: "r2", title: "Capturar precio en Espumante post-normalización de stock", description: "Una vez normalizado el sobrestock, incrementar precio de lista sugerido 3% en cadenas de conveniencia.", priority: "medium" },
            { id: "r3", title: "Benchmarking de precios por zona geográfica", description: "Implementar análisis de precios de competencia por región para calibrar decisiones de pricing.", priority: "low" },
          ],
        },
      },
      {
        type: "action-plan",
        data: {
          actions: [
            { id: "a1", label: "Crear plan RGM", action: "create-plan" },
          ],
        },
      },
      {
        type: "follow-up-questions",
        data: {
          questions: [
            "¿Qué cadenas tienen el Price Index más bajo?",
            "¿Cómo impacta el descuento en el margen del Gin Botánico?",
            "¿Cuál es el precio de competencia para Espumante Brut?",
          ],
        },
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

function generateSupplyResponse(): Message {
  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: "",
    blocks: [
      {
        type: "executive-summary",
        data: {
          title: "Riesgo de Quiebre de Stock — YTD 2026",
          summary:
            "El indicador OOS (out-of-stock) promedio del portafolio es 8.3%, por encima del target de 5%. Gin Botánico Premium es el SKU en mayor riesgo con cobertura de 3.2 semanas en Cadenas Especializadas. OTIF global en 88.2% vs objetivo de 95%. Se identifican 4 clientes directos con riesgo crítico de quiebre en las próximas 2 semanas.",
          period: "YTD 2026 — Proyección semanas 25-26",
          severity: "high",
        },
      },
      {
        type: "kpi-strip",
        data: {
          kpis: [
            { label: "OOS promedio", value: "8,3%", change: "+3,3pp vs target", changeType: "negative" },
            { label: "OTIF global", value: "88,2%", change: "-6,8pp vs objetivo", changeType: "negative" },
            { label: "Fill Rate", value: "91,5%", change: "-3,5pp", changeType: "negative" },
            { label: "SKU crítico", value: "Gin Botánico", change: "3,2 sem cobertura", changeType: "negative" },
            { label: "Clientes en riesgo", value: "4 clientes", change: "críticos", changeType: "negative" },
          ],
        },
      },
      {
        type: "chart",
        data: { chartId: "stock-coverage", type: "bar", title: "Cobertura de Stock por SKU — Semanas 24-26" },
      },
      {
        type: "insight-card",
        data: {
          insights: [
            { type: "alert", title: "Gin Botánico — quiebre inminente en Cadenas Especializadas", description: "Con 3.2 semanas de cobertura y lead time de producción de 4 semanas, hay riesgo de quiebre total. Requiere acción inmediata en logística o producción." },
            { type: "warning", title: "4 clientes directos con ventana crítica", description: "La Anónima (Río Gallegos), Disco (Belgrano), Vea (Córdoba) y un mayorista CABA tienen stock para menos de 2 semanas." },
            { type: "info", title: "Espumante tiene sobrestock contrarrestante", description: "El sobrestock de Espumante en Supermercados podría liberarse parcialmente como buffer de volumen vs otros SKUs en el canal." },
          ],
        },
      },
      {
        type: "recommendations",
        data: {
          recommendations: [
            { id: "r1", title: "Activar orden de emergencia Gin Botánico", description: "Solicitar lote urgente de producción o transferencia desde depósito central para cubrir Cadenas Especializadas.", priority: "high" },
            { id: "r2", title: "Priorizar entregas a 4 clientes críticos", description: "Asignar prioridad máxima de despacho a La Anónima, Disco, Vea y mayorista CABA en la ronda de esta semana.", priority: "high" },
            { id: "r3", title: "Implementar alerta temprana de cobertura", description: "Configurar alerta automática cuando cobertura de stock baje de 4 semanas para cualquier SKU/canal.", priority: "medium" },
          ],
        },
      },
      {
        type: "action-plan",
        data: {
          actions: [
            { id: "a1", label: "Crear plan de emergencia Supply", action: "create-plan" },
          ],
        },
      },
      {
        type: "follow-up-questions",
        data: {
          questions: [
            "¿Qué clientes específicos están en zona crítica?",
            "¿Cuánto tarda en reponerse el stock de Gin Botánico?",
            "¿Hay otros SKUs que podrían entrar en riesgo en las próximas semanas?",
          ],
        },
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

function generateEBITDAResponse(): Message {
  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: "",
    blocks: [
      {
        type: "executive-summary",
        data: {
          title: "Análisis de Rentabilidad — EBITDA YTD 2026",
          summary: `El EBITDA del portafolio es ${fmtUsdK(DEMO_CPG_TOTALS.ebitda)} (margen 22,4%), 1,8pp por debajo del target de 24,4%. El trade spend sobreejecutado al 112% del presupuesto y 4 SKUs con margen operativo negativo son los principales drivers. El canal mayorista sostiene el mejor EBITDA absoluto (28,3% margen), mientras supermercados arrastra al promedio con 9,5% en Carrefour y costos de servicio elevados.`,
          period: "YTD 2026 (Ene–Jun)",
          severity: "high",
        },
      },
      {
        type: "kpi-strip",
        data: {
          kpis: [
            { label: "EBITDA", value: fmtUsdK(DEMO_CPG_TOTALS.ebitda), change: "-1,8pp vs target", changeType: "negative" },
            { label: "EBITDA Margin", value: "22,4%", change: "target 24,4%", changeType: "negative" },
            { label: "Trade Spend / Revenue", value: "18,7%", change: "+2,3pp vs budget", changeType: "negative" },
            { label: "SKUs margen negativo", value: "4 SKUs", change: "+2 vs Q1", changeType: "negative" },
            { label: "Ahorro identificado", value: "USD 420K", change: "potencial", changeType: "positive" },
          ],
        },
      },
      {
        type: "chart",
        data: { chartId: "ebitda-waterfall", type: "waterfall", title: "Waterfall de Rentabilidad por Canal — YTD 2026" },
      },
      {
        type: "insight-card",
        data: {
          insights: [
            { type: "alert", title: "4 SKUs con margen operativo negativo post-trade", description: "Espumante 750ml PET y 3 SKUs de línea económica destruyen valor. Requieren decisión de discontinuación o repricing urgente antes de Q3." },
            { type: "alert", title: "Trade spend sobreejecutado al 112%", description: "Canal moderno consumió USD 240K extra vs presupuesto. Sin impacto proporcional en sell-out (+4% vs costo +12%)." },
            { type: "opportunity", title: "Mayoristas: mejor canal por rentabilidad absoluta", description: "Margen EBITDA del 28,3% con passthrough del 98%. Aumentar 5pp de mix hacia mayoristas equivale a +USD 45K EBITDA." },
            { type: "opportunity", title: "Renegociación logística: ahorro potencial 8-12%", description: "Contrato Andreani vence en junio. Benchmark del mercado indica USD 80-120K de ahorro posible." },
          ],
        },
      },
      {
        type: "recommendations",
        data: {
          recommendations: [
            { id: "r1", title: "Discontinuar o repricing inmediato de 4 SKUs negativos", description: "Eliminar los 4 SKUs de margen negativo genera ahorro estimado de USD 180K en H2 2026.", priority: "high" },
            { id: "r2", title: "Techo estricto de trade spend para Q3", description: "Implementar aprobación mensual de trade con ROI mínimo de 1,5x para cualquier activación.", priority: "high" },
            { id: "r3", title: "Mejorar mix hacia canales de mayor margen", description: "Priorizar crecimiento en mayoristas y gastronomía donde EBITDA margin supera el 25%.", priority: "medium" },
            { id: "r4", title: "Cerrar renegociación logística antes de junio", description: "Aprovechar vencimiento del contrato Andreani para capturar ahorro de 8-12% en costo de distribución.", priority: "medium" },
          ],
        },
      },
      {
        type: "action-plan",
        data: {
          actions: [
            { id: "a1", label: "Abrir módulo Ventas", action: "open-ventas" },
            { id: "a2", label: "Crear plan de acción EBITDA", action: "create-plan" },
          ],
        },
      },
      {
        type: "follow-up-questions",
        data: {
          questions: [
            "¿Qué SKUs específicos tienen margen negativo?",
            "¿Cuál es el impacto de repricing vs discontinuación?",
            "¿Cómo mejora el EBITDA si optimizamos el mix de canales?",
          ],
        },
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

function generateTradeResponse(): Message {
  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: "",
    blocks: [
      {
        type: "executive-summary",
        data: {
          title: "Análisis de Trade Marketing — ROI y Eficiencia Q1-Q2 2026",
          summary: "El trade spend total YTD es 18,7% del net revenue — 2,3pp por encima del presupuesto. Canal moderno tiene ROI promedio de 1,4x (objetivo 1,8x), impulsado por activaciones en Carrefour sin contrapartida suficiente de sell-out. Canal impulso muestra ROI de apenas 0,9x. Los USD 85K no utilizados de mayo representan la mejor oportunidad táctica del trimestre.",
          period: "Q1–Q2 YTD 2026",
          severity: "medium",
        },
      },
      {
        type: "kpi-strip",
        data: {
          kpis: [
            { label: "Trade Spend total", value: "USD 1,01M", change: "+2,3pp vs budget", changeType: "negative" },
            { label: "ROI canal moderno", value: "1,4x", change: "obj 1,8x", changeType: "negative" },
            { label: "ROI canal impulso", value: "0,9x", change: "por debajo de 1x", changeType: "negative" },
            { label: "Budget libre mayo", value: "USD 85K", change: "sin asignar", changeType: "positive" },
            { label: "Mejor ROI promo", value: "IPA 6-pack Coto", change: "2,4x", changeType: "positive" },
          ],
        },
      },
      {
        type: "chart",
        data: { chartId: "trade-roi-canal", type: "bar", title: "ROI Trade Spend por Canal — Q1-Q2 2026" },
      },
      {
        type: "insight-card",
        data: {
          insights: [
            { type: "alert", title: "Canal impulso con ROI negativo", description: "Kioscos y distribución chica generan 0,9x ROI. Redirigir USD 120K a canal moderno donde el mismo peso tiene 2,1x retorno." },
            { type: "opportunity", title: "USD 85K libres para activación de invierno", description: "Mayo cerró con trade budget sin ejecutar. Ideal para campaña de exhibición Julio-Agosto en Carrefour y Jumbo." },
            { type: "info", title: "Cerveza IPA: mejor ROI de promo del portafolio", description: "El pack 6x473ml en Coto tuvo ROI de 2,4x con passthrough del 94%. Modelo replicable en otras cadenas." },
          ],
        },
      },
      {
        type: "recommendations",
        data: {
          recommendations: [
            { id: "r1", title: "Redirigir USD 120K de impulso a canal moderno", description: "Concentrar trade spend en cadenas con ROI demostrado >1,8x, especialmente IPA y Malbec en Coto y Jumbo.", priority: "high" },
            { id: "r2", title: "Asignar USD 85K de mayo a exhibición invernal", description: "Campaña julio-agosto en 80 bocas Carrefour y 40 Jumbo con foco en mix premium y temporada de frío.", priority: "high" },
            { id: "r3", title: "Implementar ROI mínimo de 1,5x como gate de aprobación", description: "Ninguna activación de trade debería aprobarse sin proyección de ROI validada por Revenue Management.", priority: "medium" },
          ],
        },
      },
      {
        type: "action-plan",
        data: {
          actions: [
            { id: "a1", label: "Crear plan de trade Q3", action: "create-plan" },
          ],
        },
      },
      {
        type: "follow-up-questions",
        data: {
          questions: [
            "¿Cuánto mejoraría el ROI si redirigimos el trade de impulso?",
            "¿Qué cadenas tienen mejor ROI histórico para la campaña de invierno?",
            "¿Cómo comparan las promos de Espumante vs Cerveza IPA?",
          ],
        },
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

function generateForecastResponse(): Message {
  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: "",
    blocks: [
      {
        type: "executive-summary",
        data: {
          title: "Proyección Sell-Out Q3 2026 — Escenario Base",
          summary: "Con el escenario base (sin cambios de precio ni inversión adicional de trade), el sell-out proyectado para Q3 2026 es de 62.400 cajas (+5% vs Q3 2025). Si se implementa el plan de recuperación supermercados (exhibición + precio táctico), el escenario optimista proyecta 68.800 cajas (+15%). El riesgo bajista sin intervención es 54.200 cajas por efecto estacionalidad y sobrestock residual.",
          period: "Q3 2026 — Proyección Jul–Sep",
          severity: "medium",
        },
      },
      {
        type: "kpi-strip",
        data: {
          kpis: [
            { label: "Escenario base", value: "62.400 cajas", change: "+5% vs Q3 2025", changeType: "positive" },
            { label: "Escenario optimista", value: "68.800 cajas", change: "+15% con plan", changeType: "positive" },
            { label: "Escenario bajista", value: "54.200 cajas", change: "-8% sin intervención", changeType: "negative" },
            { label: "Net Revenue proyectado", value: "USD 2,4M", change: "escenario base", changeType: "positive" },
            { label: "Driver principal", value: "Espumante recovery", change: "Q3 es temporada baja", changeType: "neutral" },
          ],
        },
      },
      {
        type: "chart",
        data: { chartId: "forecast-q3", type: "line-bar", title: "Proyección Sell-Out Q3 2026 — Escenarios" },
      },
      {
        type: "recommendations",
        data: {
          recommendations: [
            { id: "r1", title: "Activar plan de recuperación antes del 15/06", description: "Cada semana de demora en el plan de exhibición + precio táctico cuesta ~800 cajas de sell-out en Q3.", priority: "high" },
            { id: "r2", title: "Priorizar Cerveza IPA como motor de Q3", description: "Q3 es temporada de consumo frío pero IPA tiene momentum (+18%). Concentrar trade en este SKU para defender volumen.", priority: "medium" },
            { id: "r3", title: "Neutralizar sobrestock de Espumante antes del 30/06", description: "El sobrestock actual de Espumante en Carrefour/Coto arrastrará Q3 si no se resuelve en Q2.", priority: "high" },
          ],
        },
      },
      {
        type: "action-plan",
        data: {
          actions: [
            { id: "a1", label: "Crear plan Q3 2026", action: "create-plan" },
            { id: "a3", label: "Abrir módulo Ventas", action: "open-ventas" },
          ],
        },
      },
      {
        type: "follow-up-questions",
        data: {
          questions: [
            "¿Cuánto vale cada punto de mix hacia premium en Q3?",
            "¿Qué SKU debería ser el anchor de la campaña de invierno?",
            "¿Cómo impacta el sobrestock de Espumante en el forecast Q3?",
          ],
        },
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

function generateBusinessReviewResponse(): Message {
  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: "",
    blocks: [
      {
        type: "executive-summary",
        data: {
          title: "Business Review Ejecutivo — Andes Consumer Goods Q2 2026",
          summary: `El portafolio YTD muestra sell-in de ${fmtInt(DEMO_CPG_TOTALS.sellIn)} cajas (+14%), sell-out de ${fmtInt(DEMO_CPG_TOTALS.sellOut)} cajas (+10%) y EBITDA de ${fmtUsdK(DEMO_CPG_TOTALS.ebitda)}. La brecha de passthrough (82,5% vs objetivo 90%) es el principal frente de trabajo: Espumante Brut en supermercados concentra el problema con stock acumulado y Price Index de 0,93. El canal mayorista y Cerveza IPA son los vectores de crecimiento más sólidos.`,
          period: "Q2 2026 (Ene–Jun)",
          severity: "medium",
        },
      },
      {
        type: "kpi-strip",
        data: {
          kpis: [
            { label: "Sell-in YTD", value: `${fmtInt(DEMO_CPG_TOTALS.sellIn)} cajas`, change: "+14%", changeType: "positive" },
            { label: "Sell-out YTD", value: `${fmtInt(DEMO_CPG_TOTALS.sellOut)} cajas`, change: "+10%", changeType: "positive" },
            { label: "Passthrough", value: "82,5%", change: "-7,5pp vs objetivo", changeType: "negative" },
            { label: "Net Revenue", value: fmtUsdM(DEMO_CPG_TOTALS.netRevenue), change: "+12%", changeType: "positive" },
            { label: "EBITDA", value: fmtUsdK(DEMO_CPG_TOTALS.ebitda), change: "+8%", changeType: "positive" },
            { label: "Price Index", value: "0,96", change: "-4pp vs objetivo", changeType: "negative" },
          ],
        },
      },
      {
        type: "chart",
        data: { chartId: "portfolio-overview", type: "multi-bar", title: "Sell-in vs Sell-out por SKU — YTD 2026" },
      },
      {
        type: "insight-card",
        data: {
          insights: [
            { type: "alert", title: "Passthrough supermercados en 53% para Espumante", description: "Principal desafío del trimestre. Stock acumulado en Carrefour y Coto con riesgo de devolución si no se activa en junio." },
            { type: "opportunity", title: "Cerveza IPA lidera el crecimiento (+18% vs budget)", description: "Mejor SKU del portafolio. Oportunidad de ampliar distribución y capturar precio en Q3." },
            { type: "warning", title: "Trade spend sobreejecutado al 112%", description: "Sin impacto proporcional en sell-out. Requiere disciplina y ROI mínimo para Q3." },
            { type: "info", title: "Mayoristas: canal más rentable del portfolio", description: "98% passthrough y 28% EBITDA margin. Vector de crecimiento estable para el segundo semestre." },
          ],
        },
      },
      {
        type: "recommendations",
        data: {
          recommendations: [
            { id: "r1", title: "Aprobar plan de recuperación supermercados antes del 10/06", description: "Precio táctico + exhibición en Carrefour y Coto para normalizar passthrough en Q2.", priority: "high" },
            { id: "r2", title: "Capturar precio en Cerveza IPA en Q3", description: "Con passthrough del 92% y demanda creciente, hay margen para ajuste de precio sin impacto en volumen.", priority: "medium" },
            { id: "r3", title: "Definir techo de trade spend para H2 2026", description: "Establecer ROI mínimo de 1,5x y cap mensual de inversión antes del inicio de Q3.", priority: "medium" },
          ],
        },
      },
      {
        type: "action-plan",
        data: {
          actions: [
            { id: "a3", label: "Crear plan de acción Q3", action: "create-plan" },
          ],
        },
      },
      {
        type: "follow-up-questions",
        data: {
          questions: [
            "¿Qué decisiones críticas hay que tomar antes del cierre de Q2?",
            "¿Cómo está el desempeño vs la competencia en supermercados?",
            "Generá la agenda para la reunión de directorio",
          ],
        },
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

function generateGenericResponse(question: string): Message {
  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: `Analicé tu consulta: **"${question}"**\n\nBasándome en Demo CPG Portfolio 2025-2026 para Andes Consumer Goods (${fmtInt(DEMO_CPG_TOTALS.sellIn)} cajas sell-in YTD 2026, ${fmtUsdM(DEMO_CPG_TOTALS.netRevenue)} Net Revenue), tengo información relevante para responder esta pregunta.`,
    blocks: [
      {
        type: "kpi-strip",
        data: {
          kpis: [
            { label: "Sell-in YTD", value: `${fmtInt(DEMO_CPG_TOTALS.sellIn)} cajas`, change: "+14%", changeType: "positive" },
            { label: "Net Revenue", value: fmtUsdM(DEMO_CPG_TOTALS.netRevenue), change: "+12%", changeType: "positive" },
            { label: "EBITDA", value: fmtUsdK(DEMO_CPG_TOTALS.ebitda), change: "+8%", changeType: "positive" },
          ],
        },
      },
      {
        type: "follow-up-questions",
        data: {
          questions: [
            "Dame un resumen del estado comercial del portafolio",
            "¿Por qué el Espumante tiene passthrough bajo?",
            "Prepará un análisis T2T para Carrefour",
          ],
        },
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function getResponseForQuestion(question: string): Message {
  // Check advisory flow first (Caso 1 CPG guided demo responses)
  const advisoryResponse = getAdvisoryResponse(question);
  if (advisoryResponse) return advisoryResponse;

  const q = question.toLowerCase();
  if (q.includes("espumante") || q.includes("passthrough") || q.includes("sell-through") || (q.includes("supermercado") && !q.includes("business"))) {
    return generatePassthroughResponse();
  }
  if (q.includes("business review") || q.includes("ejecutivo") || q.includes("dirección") || q.includes("directorio")) {
    return generateBusinessReviewResponse();
  }
  if (q.includes("portafolio") || q.includes("resumen") || q.includes("estado") || q.includes("sell-in vs") || q.includes("evolucionó") || q.includes("ytd")) {
    return generatePortfolioResponse();
  }
  if (q.includes("carrefour") || q.includes("coto") || q.includes("jumbo") || q.includes("t2t") || q.includes("jbp") || q.includes("kam")) {
    return generateT2TResponse();
  }
  if (q.includes("price") || q.includes("precio") || q.includes("rgm") || q.includes("index") || q.includes("descuento") || q.includes("simulá")) {
    return generatePriceIndexResponse();
  }
  if (q.includes("quiebre") || q.includes("oos") || q.includes("cobertura") || q.includes("supply") || q.includes("otif") || q.includes("stock crítico")) {
    return generateSupplyResponse();
  }
  if (q.includes("ebitda") || q.includes("rentabilidad") || q.includes("margen") || q.includes("trade spend") || q.includes("logística")) {
    return generateEBITDAResponse();
  }
  if (q.includes("trade") || q.includes("promo") || q.includes("roi") || q.includes("exhibición") || q.includes("activación")) {
    return generateTradeResponse();
  }
  if (q.includes("q3") || q.includes("proyect") || q.includes("forecast") || q.includes("plan de acción") || q.includes("plan correctivo")) {
    return generateForecastResponse();
  }
  return generateGenericResponse(question);
}

export const NO_DATA_SUGGESTED_QUESTIONS = [
  "¿Qué puedo cargar para empezar?",
  "¿Cómo preparo mis datos comerciales?",
  "¿Qué fuentes necesita Nexus?",
  "Cargar archivo de ventas",
];

export function generateNoDataResponse(question: string): Message {
  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: `Todavía no tengo fuentes de datos conectadas para analizar tu negocio. Para responder **"${question}"** necesito acceso a datos de ventas, sell-in, sell-out o finanzas.\n\nPodés cargar un archivo de ventas, conectar una integración o activar la demo CPG para ver cómo funcionaría Nexus con datos reales.`,
    blocks: [
      {
        type: "action-plan",
        data: {
          actions: [
            { id: "a1", label: "Cargar archivo", action: "upload-file" },
            { id: "a2", label: "Probar demo CPG", action: "load-demo" },
            { id: "a3", label: "Ver fuentes de datos", action: "open-datasources" },
          ],
        },
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function generateRealDataResponse(question: string, kpis: SalesKpis, fileName: string): Message {
  const q = question.toLowerCase();
  const fmtN = (n: number) => n.toLocaleString("es-AR");
  const fmtP = (n: number) => `${Math.round(n * 1000) / 10}%`;
  const fmtMoney = (n: number) =>
    n >= 1_000_000 ? `USD ${(n / 1_000_000).toFixed(1)}M` : `USD ${Math.round(n / 1000)}K`;

  const siYtd = kpis.sellInYtd;
  const soYtd = kpis.sellOutYtd;
  const pt = kpis.passthrough ?? (siYtd && soYtd ? soYtd / siYtd : undefined);

  const siStr = siYtd !== undefined ? `${fmtN(siYtd)} cajas` : "No disponible";
  const soStr = soYtd !== undefined ? `${fmtN(soYtd)} cajas` : "No disponible";

  // Build a base kpi-strip from whatever we have
  const stripKpis: { label: string; value: string; change?: string; changeType?: "positive" | "negative" | "neutral" }[] = [
    { label: "Sell-in YTD", value: siStr, change: kpis.sellInVarPct !== undefined ? `${kpis.sellInVarPct > 0 ? "+" : ""}${kpis.sellInVarPct}% vs obj` : undefined, changeType: kpis.sellInVarPct !== undefined ? (kpis.sellInVarPct >= 0 ? "positive" : "negative") : "neutral" },
    { label: "Sell-out YTD", value: soStr, change: kpis.sellOutVarPct !== undefined ? `${kpis.sellOutVarPct > 0 ? "+" : ""}${kpis.sellOutVarPct}% vs obj` : undefined, changeType: kpis.sellOutVarPct !== undefined ? (kpis.sellOutVarPct >= 0 ? "positive" : "negative") : "neutral" },
    ...(pt !== undefined ? [{ label: "Passthrough", value: fmtP(pt), changeType: pt < 0.8 ? "negative" as const : "positive" as const }] : []),
    ...(kpis.netRevenueYtd !== undefined ? [{ label: "Net Revenue", value: fmtMoney(kpis.netRevenueYtd), changeType: "neutral" as const }] : []),
    ...(kpis.ebitdaYtd !== undefined ? [{ label: "EBITDA", value: fmtMoney(kpis.ebitdaYtd), changeType: "neutral" as const }] : []),
    ...(kpis.buyerCustomers !== undefined ? [{ label: "Clientes compradores", value: fmtN(kpis.buyerCustomers), changeType: "neutral" as const }] : []),
  ];

  // Build content based on question intent
  let summary: string;
  if (q.includes("passthrough") || q.includes("sell-out") || q.includes("sellout")) {
    const ptStr = pt !== undefined ? fmtP(pt) : "no disponible";
    summary = `Con los datos de **${fileName}**: el passthrough global YTD es del **${ptStr}** (${soStr} sell-out / ${siStr} sell-in).${kpis.passthroughVarPct !== undefined ? ` Está ${kpis.passthroughVarPct < 0 ? Math.abs(kpis.passthroughVarPct) + "pp por debajo" : kpis.passthroughVarPct + "pp por encima"} del objetivo.` : ""}`;
  } else if (q.includes("sell-in") || q.includes("sellin") || q.includes("volumen")) {
    summary = `Con los datos de **${fileName}**: el sell-in YTD es de **${siStr}**.${kpis.netRevenueYtd !== undefined ? ` Net Revenue acumulado: **${fmtMoney(kpis.netRevenueYtd)}**.` : ""}${kpis.sellInVarPct !== undefined ? ` Variación vs objetivo: ${kpis.sellInVarPct > 0 ? "+" : ""}${kpis.sellInVarPct}%.` : ""}`;
  } else if (q.includes("revenue") || q.includes("rentabilidad") || q.includes("ebitda") || q.includes("finanza")) {
    summary = kpis.netRevenueYtd !== undefined
      ? `Con los datos de **${fileName}**: Net Revenue YTD = **${fmtMoney(kpis.netRevenueYtd)}**${kpis.netRevenueVarPct !== undefined ? ` (${kpis.netRevenueVarPct > 0 ? "+" : ""}${kpis.netRevenueVarPct}% vs período anterior)` : ""}. ${kpis.ebitdaYtd !== undefined ? `EBITDA: **${fmtMoney(kpis.ebitdaYtd)}**.` : ""}${kpis.grossMargin !== undefined ? ` Gross Profit: **${fmtMoney(kpis.grossMargin)}**.` : ""}`
      : `No encontré una columna equivalente a Net Revenue en el archivo **${fileName}**. Sí encontré sell-in de ${siStr}.`;
  } else {
    // Generic summary
    summary = `Con los datos de **${fileName}**: sell-in YTD **${siStr}**, sell-out **${soStr}**${pt !== undefined ? `, passthrough **${fmtP(pt)}**` : ""}${kpis.netRevenueYtd !== undefined ? `, Net Revenue **${fmtMoney(kpis.netRevenueYtd)}**` : ""}${kpis.ebitdaYtd !== undefined ? `, EBITDA **${fmtMoney(kpis.ebitdaYtd)}**` : ""}${kpis.buyerCustomers !== undefined ? `, clientes compradores **${fmtN(kpis.buyerCustomers)}**` : ""}.`;
  }

  const warnings: string[] = [];
  if (!kpis.netRevenueYtd && (q.includes("revenue") || q.includes("rentabilidad"))) {
    warnings.push("No se encontró columna de Net Revenue en el archivo cargado.");
  }
  if (!kpis.ebitdaYtd && q.includes("ebitda")) {
    warnings.push("No se encontró columna de EBITDA en el archivo cargado.");
  }

  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: summary,
    blocks: [
      {
        type: "executive-summary",
        data: {
          title: `Análisis desde ${fileName}`,
          summary,
          period: "YTD 2026",
          severity: warnings.length > 0 ? "medium" : "low",
        },
      },
      { type: "kpi-strip", data: { kpis: stripKpis } },
      ...(warnings.length > 0
        ? [{
            type: "insight-card" as const,
            data: {
              insights: warnings.map((w) => ({
                type: "warning" as const,
                title: "Dato no disponible",
                description: w,
              })),
            },
          }]
        : []),
      {
        type: "follow-up-questions",
        data: {
          questions: [
            "¿Cómo está el passthrough global?",
            "Dame un resumen del portafolio",
            `¿Cuántos clientes activos tiene el archivo?`,
          ],
        },
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function generateProjectStructuredResponse(question: string, project: Project): Message {
  const q = question.toLowerCase();
  const isIteration = /profundizar|más detalle|refinar|siguiente paso|ampliar|profundice|desarrollá|detallá|expand|deep dive|iterar|iteración|benchmark|escenario|present/i.test(q);
  const isPresentation = /present|deck|diapositiv|generar pres/i.test(q);

  const diagnosticPoints = (project.risks ?? []).slice(0, 4).map((r) => ({
    text: r.description ?? r.label,
    severity: r.severity as "high" | "medium" | "low",
    area: undefined as string | undefined,
  }));
  if (diagnosticPoints.length === 0) {
    diagnosticPoints.push({ text: `El proyecto "${project.name}" requiere análisis de datos actualizados para emitir diagnóstico.`, severity: "medium", area: undefined });
  }

  const crossInsightItems = (project.insights ?? []).slice(0, 3).map((ins, i) => ({
    id: `ci-${i}`,
    finding: ins.title,
    association: ins.description,
    sources: [ins.area ?? "Dataset comercial"],
    impact: ins.impact as "high" | "medium" | "low",
  }));

  if (crossInsightItems.length === 0 && (project.opportunities ?? []).length > 0) {
    (project.opportunities ?? []).slice(0, 2).forEach((opp, i) => {
      crossInsightItems.push({
        id: `ci-opp-${i}`,
        finding: opp.label,
        association: opp.description ?? "Oportunidad identificada en el análisis del proyecto.",
        sources: ["Análisis comercial"],
        impact: opp.impact as "high" | "medium" | "low",
      });
    });
  }

  const pendingSteps = (project.nextSteps ?? []).filter((ns) => !ns.done).slice(0, 3);
  const initiatives = pendingSteps.map((ns, i) => ({
    id: `si-${i}`,
    title: ns.label,
    description: ns.impact ?? `Acción clave vinculada al objetivo del proyecto. Owner: ${ns.owner ?? "Por definir"}.`,
    owner: ns.owner ?? "Por definir",
    dueDate: ns.dueDate,
    priority: (ns.priority ?? "medium") as "high" | "medium" | "low",
    area: ns.area,
    kpi: undefined as string | undefined,
  }));

  if (initiatives.length === 0) {
    initiatives.push({
      id: "si-default",
      title: "Definir plan de trabajo Q3",
      description: "Construir agenda conjunta con los actores clave del proyecto para el próximo trimestre.",
      owner: project.owner ?? "Por definir",
      dueDate: undefined,
      priority: "medium",
      area: project.area,
      kpi: undefined,
    });
  }

  const projectName = project.name;

  if (isPresentation) {
    return {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: "",
      blocks: [
        {
          type: "executive-summary",
          data: {
            title: `Presentación ejecutiva lista — ${projectName}`,
            summary: `La presentación ejecutiva para "${projectName}" consolida el diagnóstico, los insights cruzados y las ${initiatives.length} iniciativas estratégicas propuestas. Está lista para exportar o compartir con los stakeholders del proyecto.`,
            period: new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" }),
            severity: "high",
          },
        },
        {
          type: "action-plan",
          data: {
            title: "Exportar y hacer seguimiento",
            objective: project.objective ?? `Respaldar decisiones clave de ${projectName}`,
            items: initiatives.map((ini) => ini.title),
            actions: [
              { id: "generate-deck", label: "Generar presentación", action: "generate-deck" },
              { id: "create-plan", label: "Crear plan de acción", action: "create-plan" },
            ],
          },
        },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  if (isIteration) {
    return {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: "",
      blocks: [
        {
          type: "diagnostic-summary",
          data: {
            title: "Análisis profundizado",
            context: `Iteración sobre "${projectName}" — incorporando contexto adicional y benchmarks de mercado`,
            points: [
              ...diagnosticPoints,
              ...(project.opportunities ?? []).slice(0, 2).map((opp) => ({
                text: `Oportunidad: ${opp.label}. ${opp.description ?? ""}`,
                severity: "low" as const,
                area: undefined as string | undefined,
              })),
            ],
          },
        },
        {
          type: "cross-insights",
          data: {
            title: "Análisis cruzado ampliado",
            insights: crossInsightItems,
          },
        },
        {
          type: "strategic-initiatives",
          data: {
            title: "Iniciativas priorizadas",
            objective: project.objective,
            initiatives,
          },
        },
        {
          type: "action-plan",
          data: {
            title: "Siguiente paso recomendado",
            objective: project.objective ?? projectName,
            items: initiatives.map((ini) => ini.title),
            actions: [
              { id: "add-insight", label: "Agregar insight", action: "add-insight" },
              { id: "create-plan", label: "Crear plan de acción", action: "create-plan" },
            ],
          },
        },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: "",
    blocks: [
      {
        type: "diagnostic-summary",
        data: {
          title: "Diagnóstico",
          context: `Análisis de situación actual — ${projectName}`,
          points: diagnosticPoints,
        },
      },
      ...(crossInsightItems.length > 0
        ? [{ type: "cross-insights" as const, data: { title: "Insights clave", insights: crossInsightItems } }]
        : []),
      ...(initiatives.length > 0
        ? [{
            type: "strategic-initiatives" as const,
            data: {
              title: "Iniciativas estratégicas",
              objective: project.objective,
              initiatives,
            },
          }]
        : []),
      {
        type: "action-plan" as const,
        data: {
          title: "Acciones sugeridas",
          objective: project.objective ?? projectName,
          items: initiatives.map((ini) => ini.title),
          actions: [
            { id: "create-goal", label: "Crear objetivo", action: "create-goal" },
            { id: "create-plan", label: "Crear plan de acción", action: "create-plan" },
          ],
        },
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function autoTitleFromQuestion(question: string): string {
  const q = question.trim();
  if (q.length <= 60) return q;
  const words = q.split(" ");
  let title = "";
  for (const w of words) {
    if ((title + " " + w).trim().length > 55) break;
    title = (title + " " + w).trim();
  }
  return title + "…";
}

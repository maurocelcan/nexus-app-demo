import type { Project, ActionPlan } from "@/types/analytics";
import type { Message } from "@/types/chat";

// ─── Single demo project ───────────────────────────────────────────────────────

export const DEMO_PROJECTS: Project[] = [
  {
    id: "proj-002",
    name: "JBP Carrefour 2026 — Recuperación de Sell-In y Rentabilidad",
    description: "Joint Business Plan con Carrefour para recuperar rotación, corregir brecha sell-in/sell-out y cerrar acuerdos de exhibición para Q2-Q3.",
    area: "Ventas",
    objective: "Recuperar el sell-out y la rentabilidad del canal supermercados priorizando Carrefour, Coto y Jumbo mediante optimización de precios, surtido y trade marketing.",
    owner: "Mauro Celani",
    contributors: ["Lucía Romero", "Diego Pereira", "Carlos Vega"],
    linkedAreas: ["Ventas"],
    status: "active",
    priority: "high",
    progress: 62,
    startDate: "2026-04-15",
    dueDate: "2026-06-30",
    conversationCount: 4,
    createdAt: "2026-04-15T10:00:00Z",
    updatedAt: "2026-05-20T11:00:00Z",
    presentationReady: true,
    linkedDataSources: ["ventas"],
    tags: ["Canal Moderno", "Sell-out", "Rentabilidad", "Trade Marketing"],
    brief: {
      problem: "El canal supermercados acumula brecha entre sell-in y sell-out, con stock inmovilizado en Carrefour y presión de margen en Coto. Solo el 40% de las tiendas tiene exhibición secundaria activa.",
      hypothesis: "La combinación de exhibición secundaria, precio táctico condicionado y mix premium puede recuperar rotación sin destruir margen.",
      strategy: "Priorizar Carrefour para destrabar stock, usar Coto para multipacks de rotación y proteger margen con Jumbo vía surtido premium. Inversión de USD 85K en trade con ROI mínimo de 1,8x.",
      expectedOutcome: "Recuperar +8% de sell-out, llevar passthrough sobre 90% y sostener ROI trade mayor a 1,8x antes del cierre de Q2.",
    },
    kpis: [
      { label: "Sell-out supermercados", value: "51.000 cajas", change: -9.8, changeType: "negative" },
      { label: "Sell-in supermercados", value: "62.000 cajas", change: 6.4, changeType: "positive" },
      { label: "Passthrough canal", value: "82,3%", change: -5.1, changeType: "negative" },
      { label: "Price Index Espumante", value: "0,93", change: -7.0, changeType: "negative" },
      { label: "Net Revenue canal", value: "USD 2,31M", change: 4.2, changeType: "positive" },
      { label: "ROI Trade Spend", value: "1,8x", change: 0.2, changeType: "positive" },
    ],
    risks: [
      { id: "r1", label: "Carrefour concentra stock inmovilizado", severity: "high", description: "Espumante Brut acumula 13.348 cajas de brecha sell-in/sell-out; riesgo de devolución y pérdida de espacio si no acelera la rotación antes del 30/06." },
      { id: "r2", label: "Coto presiona margen por precio promocional", severity: "medium", description: "La reducción táctica de precio recupera volumen, pero puede erosionar 1,2pp de margen si no se compensa con mix premium." },
      { id: "r3", label: "Jumbo demora aprobaciones de exhibición", severity: "medium", description: "Las islas de alto tráfico requieren aprobación regional antes del 10/06/2026 para impactar Q2." },
    ],
    opportunities: [
      { id: "o1", label: "Exhibiciones adicionales en Carrefour", impact: "high", description: "120 tiendas con espacio disponible para activación de invierno. Impacto esperado: +5pp distribución numérica." },
      { id: "o2", label: "Rebalanceo del surtido hacia premium", impact: "medium", description: "Malbec Reserva y Gin Botánico sostienen mejor margen; una mejora de mix de 3pp compensa parte del descuento táctico." },
      { id: "o3", label: "Peak estacional Q3 — ventana de 90 días", impact: "high", description: "Julio–Agosto históricamente +18% vs Q2 en la categoría. Cerrar acuerdos en junio captura el momentum antes de que el competidor posicione." },
    ],
    nextSteps: [
      { id: "ns1", label: "Negociar exhibición en 120 tiendas Carrefour", owner: "Mauro Celani", dueDate: "2026-06-10", done: false },
      { id: "ns2", label: "Validar precio táctico -4% con Revenue Manager", owner: "Lucía Romero", dueDate: "2026-06-05", done: false },
      { id: "ns3", label: "Optimizar surtido premium en Jumbo", owner: "Carlos Vega", dueDate: "2026-06-20", done: false },
      { id: "ns4", label: "Reposición acelerada en 45 sucursales prioritarias", owner: "Diego Pereira", dueDate: "2026-05-18", done: true },
      { id: "ns5", label: "Activar tablero semanal de sell-out por tienda", owner: "Mauro Celani", dueDate: "2026-05-25", done: true },
    ],
    goals: [
      { id: "g1", name: "Passthrough supermercados", kpi: "Passthrough", currentValue: "82,3%", targetValue: "90%", unit: "%", progress: 68, dueDate: "2026-06-30", priority: "high", status: "in-progress" },
      { id: "g2", name: "Sell-out canal moderno", kpi: "Sell-out", currentValue: "51.000 cajas", targetValue: "+15%", unit: "cajas", progress: 54, dueDate: "2026-06-30", priority: "high", status: "in-progress" },
      { id: "g3", name: "EBITDA canal supermercados", kpi: "EBITDA", currentValue: "USD 235K", targetValue: "+5%", unit: "USD", progress: 47, dueDate: "2026-07-15", priority: "medium", status: "in-progress" },
      { id: "g4", name: "Price Index Espumante", kpi: "Price Index", currentValue: "0,93", targetValue: "1,00", unit: "puntos", progress: 43, dueDate: "2026-06-15", priority: "high", status: "in-progress" },
    ],
    insights: [
      { id: "ins1", title: "Carrefour concentra 68% del stock inmovilizado", description: "La brecha está concentrada en tiendas A/B donde el sell-in superó la rotación esperada. 12 hipermercados con cobertura >10 semanas vs benchmark de 4–5.", severity: "high", impact: "high", area: "Ventas", recommendation: "Activar exhibición secundaria y pausar sell-in en 12 hipermercados críticos.", createdAt: "2026-05-16T09:05:00Z" },
      { id: "ins2", title: "Price Index 7pp bajo el benchmark sin elasticidad", description: "El descuento actual no genera rotación incremental. Las tiendas con exhibición activa tienen 30pp más de passthrough con el mismo price index.", severity: "medium", impact: "high", area: "RGM", recommendation: "No profundizar descuento sin contrapartida de exhibición. El problema es visibilidad, no precio.", createdAt: "2026-05-15T14:12:00Z" },
      { id: "ins3", title: "Q3 estacional: ventana clave de 90 días", description: "Julio–Agosto históricamente +18% vs Q2 en la categoría. El competidor ya negocia condiciones para Q3. Cada semana de demora es share que pierde ACG.", severity: "low", impact: "high", area: "Ventas", recommendation: "Priorizar acuerdos de exhibición y trade antes del 10/06 para capturar el peak de Q3.", createdAt: "2026-05-14T10:29:00Z" },
      { id: "ins4", title: "Coto erode margen sin mix premium como compensación", description: "El canal recupera volumen pero diluye margen si no se compensan los descuentos con pack y mix premium.", severity: "medium", impact: "medium", area: "Finanzas", recommendation: "Condicionar promo a pack multiunit y volumen incremental auditado.", createdAt: "2026-05-13T16:16:00Z" },
    ],
    timelineEvents: [
      { id: "tl10", type: "file", title: "Presentación JBP Q2 Carrefour v2 generada", description: "Nexus actualizó la deck con los datos de sell-out de Coto y las simulaciones de volumen Q2.", date: "2026-05-21T10:45:00Z", area: "Ventas", author: { name: "Nexus", type: "ai" } },
      { id: "tl9", type: "action", title: "Plan de activación Coto / DIA aprobado", description: "Mauro Celani y Sofía García alinearon las condiciones de promo para el plan Q2 en cadenas de descuento.", date: "2026-05-19T14:30:00Z", area: "Ventas", author: { name: "Mauro Celani", role: "KAM Carrefour", type: "user" } },
      { id: "tl8", type: "conversation", title: "Análisis de precio vs. competidor y estrategia sell-out", description: "Nexus comparó el price index ACG vs. el competidor principal y simuló el impacto de diferentes niveles de descuento sobre el sell-out.", date: "2026-05-17T11:00:00Z", area: "Ventas", author: { name: "Sofía García", role: "Trade Marketing", type: "user" } },
      { id: "tl7", type: "file", title: "Business_Review_Q2_2026.pptx", description: "Presentación ejecutiva generada por Nexus con diagnóstico de brechas, causas raíz y plan de acción.", date: "2026-05-16T16:00:00Z", area: "Ventas", author: { name: "Nexus", type: "ai" } },
      { id: "tl6", type: "conversation", title: "Diagnóstico integral de ventas YTD", description: "El equipo diagnosticó la brecha sell-in / sell-out y priorizó las acciones de Q2 con Nexus.", date: "2026-05-16T09:14:00Z", area: "Ventas", author: { name: "Mauro Celani", role: "KAM Carrefour", type: "user" } },
      { id: "tl5", type: "insight", title: "Price Index bajo sin elasticidad suficiente", description: "Nexus identificó que el precio ya está en el percentil 38 de la categoría pero el sell-out no responde: el problema es visibilidad, no precio.", date: "2026-05-15T14:12:00Z", area: "Ventas", author: { name: "Nexus", type: "ai" } },
      { id: "tl4", type: "kpi", title: "Sell-in acumulado: −12% vs. objetivo Q2", description: "Nexus calculó que el sell-in de mayo cierra en 88% del objetivo trimestral si se mantiene la tendencia de las últimas 3 semanas.", date: "2026-05-14T09:00:00Z", area: "Ventas", author: { name: "Nexus", type: "ai" } },
      { id: "tl3", type: "conversation", title: "Revisión de distribución numérica por cadena", description: "Análisis comparativo de distribución en Carrefour, Coto y DIA con identificación de gaps de listing por SKU.", date: "2026-05-13T10:30:00Z", area: "Ventas", author: { name: "Lucía Romero", role: "Analista Comercial", type: "user" } },
      { id: "tl2", type: "action", title: "Objetivo Q2 sell-in alineado con equipo", description: "KAM y Trade Marketing acordaron 140 cajas/semana como umbral mínimo de recuperación para el trimestre.", date: "2026-05-10T15:00:00Z", area: "Ventas", author: { name: "Mauro Celani", role: "KAM Carrefour", type: "user" } },
      { id: "tl1", type: "conversation", title: "Apertura del proyecto JBP Carrefour 2026", description: "Mauro Celani inició el proyecto y cargó el contexto del JBP vigente: objetivos de volumen, condiciones de trade y brechas históricas.", date: "2026-05-07T09:00:00Z", area: "Ventas", author: { name: "Mauro Celani", role: "KAM Carrefour", type: "user" } },
    ],
    files: [
      { id: "f1", name: "Business_Review_Q2_2026.pptx", type: "ppt", size: "4,8 MB", uploadedAt: "2026-05-20T14:30:00Z", uploadedBy: "Mauro Celani", source: "generated", conversationId: "conv-004" },
      { id: "f2", name: "Carrefour_Price_Benchmark.xlsx", type: "xlsx", size: "1,9 MB", uploadedAt: "2026-05-16T09:30:00Z", uploadedBy: "Lucía Romero", source: "chat", conversationId: "conv-001" },
      { id: "f3", name: "Trade_Plan_Supermercados.pdf", type: "pdf", size: "2,4 MB", uploadedAt: "2026-05-15T09:00:00Z", uploadedBy: "Lucía Romero", source: "manual" },
      { id: "f4", name: "Rentabilidad_Canal.xlsx", type: "xlsx", size: "3,1 MB", uploadedAt: "2026-05-14T17:20:00Z", uploadedBy: "Diego Pereira", source: "manual" },
    ],
  },
  {
    id: "proj-003",
    name: "Optimización de Sell-Through en Cadenas Regionales",
    description: "Diagnóstico de PDVs, brecha de distribución numérica y plan de activación para mejorar rotación y cobertura en cadenas regionales.",
    area: "Sell-Through",
    objective: "Elevar el passthrough de PDV al 85%+ en cadenas regionales, cerrando brechas de cobertura y activando zonas con oportunidad estimada mayor a USD 120K.",
    owner: "Lucía Romero",
    contributors: ["Diego Pereira", "Carlos Vega"],
    linkedAreas: ["Sell-Through"],
    status: "active",
    priority: "high",
    progress: 28,
    startDate: "2026-05-01",
    dueDate: "2026-07-31",
    conversationCount: 3,
    createdAt: "2026-05-01T09:00:00Z",
    updatedAt: "2026-05-19T16:00:00Z",
    presentationReady: false,
    linkedDataSources: ["sell-through"],
    tags: ["Sell-Through", "PDVs", "Distribución numérica", "Activación"],
    brief: {
      problem: "Las cadenas regionales muestran cobertura de compradores por debajo del 60% en zonas clave. La brecha entre PDVs habilitados y PDVs activos supera el 40% en Zona Oeste y Zona Sur.",
      hypothesis: "Una activación focalizada con mecháncias de volumen sobre PDVs no compradores que ya tienen el SKU testigo puede cerrar la brecha de cobertura sin incrementar el presupuesto de trade.",
      strategy: "Identificar zonas con mayor concentración de PDVs potenciales, construir campañas de activación segmentadas por SKU testigo y monitorear rotación semanal.",
      expectedOutcome: "Subir la cobertura de compradores al 85%+ y capturar al menos USD 120K de revenue incremental antes del cierre de Q3.",
    },
    kpis: [
      { label: "PDVs activos totales", value: "312", change: -8.2, changeType: "negative" },
      { label: "Cobertura compradores", value: "58%", change: -4.1, changeType: "negative" },
      { label: "Passthrough promedio", value: "71%", change: -3.5, changeType: "negative" },
      { label: "Revenue estimado zona", value: "USD 890K", change: 2.1, changeType: "positive" },
      { label: "Oportunidad incremental", value: "USD 124K", change: 0, changeType: "neutral" },
      { label: "PDVs no compradores", value: "131", change: 12.4, changeType: "negative" },
    ],
    risks: [
      { id: "r1", label: "Alta fragmentación de distribuidores por zona", severity: "medium", description: "Coordinar la activación entre 4 distribuidores regionales genera fricción operativa y puede retrasar el arranque de campaña." },
      { id: "r2", label: "Rotación estacional baja en Q3", severity: "low", description: "Algunas zonas presentan rotación estacionalmente baja en julio. El timing de activación debe anticiparse a la caída." },
    ],
    opportunities: [
      { id: "o1", label: "PDVs con SKU testigo sin SKU objetivo", impact: "high", description: "87 PDVs compran el SKU testigo pero no el objetivo. Son el segmento de mayor conversión esperada." },
      { id: "o2", label: "Zona Norte con densidad alta de PDVs potenciales", impact: "medium", description: "La Zona Norte concentra 34 PDVs no compradores en radio corto. Activación eficiente con un solo distribuidor." },
    ],
    nextSteps: [
      { id: "ns1", label: "Mapear PDVs no compradores por zona en herramienta de Sell-Through", owner: "Lucía Romero", dueDate: "2026-05-25", done: true },
      { id: "ns2", label: "Definir mecánica de activación con RGM", owner: "Diego Pereira", dueDate: "2026-06-05", done: false },
      { id: "ns3", label: "Alinear plan de ejecución con distribuidores regionales", owner: "Carlos Vega", dueDate: "2026-06-15", done: false },
    ],
    goals: [
      { id: "g1", name: "Cobertura compradores cadenas regionales", kpi: "Cobertura PDVs", currentValue: "58%", targetValue: "85%", unit: "%", progress: 28, dueDate: "2026-07-31", priority: "high", status: "in-progress" },
      { id: "g2", name: "Revenue incremental zona", kpi: "Revenue", currentValue: "USD 0", targetValue: "USD 124K", unit: "USD", progress: 0, dueDate: "2026-08-15", priority: "high", status: "pending" },
    ],
    insights: [
      { id: "ins1", title: "87 PDVs con SKU testigo sin SKU objetivo", description: "Son el segmento de mayor probabilidad de conversión. Una activación con prueba de producto o descuento de introducción puede capturar este universo de forma eficiente.", severity: "high", impact: "high", area: "Sell-Through", recommendation: "Priorizar estos PDVs en la primera ola de activación.", createdAt: "2026-05-15T10:00:00Z" },
      { id: "ins2", title: "Zona Oeste concentra la mayor brecha relativa", description: "Con solo 41% de cobertura compradores sobre un universo de 68 PDVs habilitados, Zona Oeste tiene la mayor brecha absoluta y relativa del portfolio.", severity: "medium", impact: "high", area: "Sell-Through", recommendation: "Comenzar la campaña en Zona Oeste para maximizar el impacto de cobertura.", createdAt: "2026-05-18T09:00:00Z" },
    ],
    timelineEvents: [
      { id: "tl10", type: "action", title: "Plan de activación de PDVs enviado a campo", description: "El listado de los 87 PDVs prioritarios y la mecánica de activación fueron distribuidos al equipo de preventistas.", date: "2026-05-20T09:00:00Z", area: "Sell-Through", author: { name: "Lucía Romero", role: "Analista de Sell-Through", type: "user" } },
      { id: "tl9", type: "insight", title: "Zona Oeste concentra la mayor brecha relativa de cobertura", description: "Solo 41% de cobertura compradores sobre 68 PDVs habilitados. Es el territorio de mayor impacto potencial para la primera ola de activación.", date: "2026-05-18T09:00:00Z", area: "Sell-Through", author: { name: "Nexus", type: "ai" } },
      { id: "tl8", type: "conversation", title: "Plan de reposición y seguimiento semanal", description: "Definición de la cadencia de visitas, responsables de zona y KPIs de seguimiento semanal para el plan de activación.", date: "2026-05-17T11:00:00Z", area: "Sell-Through", author: { name: "Lucía Romero", role: "Analista de Sell-Through", type: "user" } },
      { id: "tl7", type: "file", title: "Mapa_PDVs_SellThrough_Mayo2026.xlsx", description: "Nexus exportó el mapa completo de PDVs con estado de compra, zona y potencial de conversión estimado.", date: "2026-05-16T14:00:00Z", area: "Sell-Through", author: { name: "Nexus", type: "ai" } },
      { id: "tl6", type: "insight", title: "87 PDVs con SKU testigo sin SKU objetivo identificados", description: "Nexus cruzó los datos de compra del SKU testigo con el SKU objetivo y encontró el universo de conversión de mayor probabilidad.", date: "2026-05-15T10:00:00Z", area: "Sell-Through", author: { name: "Nexus", type: "ai" } },
      { id: "tl5", type: "kpi", title: "Cobertura compradores: 58% del universo total", description: "143 de 247 PDVs habilitados realizaron al menos una compra del SKU objetivo en Q1. El 42% restante es el universo de oportunidad.", date: "2026-05-14T09:00:00Z", area: "Sell-Through", author: { name: "Nexus", type: "ai" } },
      { id: "tl4", type: "conversation", title: "Análisis de ejecución por zona y canal", description: "Sofía García analizó con Nexus la distribución del sell-through por zona geográfica e identificó patrones de bajo cumplimiento en Zona Norte y Sur.", date: "2026-05-13T10:00:00Z", area: "Sell-Through", author: { name: "Sofía García", role: "Trade Marketing", type: "user" } },
      { id: "tl3", type: "conversation", title: "Diagnóstico inicial Sell-Through regional", description: "Lucía Romero inició el análisis de PDVs no compradores por zona con enfoque en cadenas regionales.", date: "2026-05-10T10:00:00Z", area: "Sell-Through", author: { name: "Lucía Romero", role: "Analista de Sell-Through", type: "user" } },
      { id: "tl2", type: "action", title: "Dataset Sell-Through conectado al proyecto", description: "Se vinculó el dataset de PDVs con información de sell-through Q1 y YTD del portfolio de SKUs objetivo.", date: "2026-05-08T15:00:00Z", area: "Sell-Through", author: { name: "Mauro Celani", role: "KAM Senior", type: "user" } },
      { id: "tl1", type: "conversation", title: "Apertura del proyecto Sell-Through en cadenas regionales", description: "Mauro Celani y Lucía Romero definieron el scope: mapear cobertura y oportunidades de activación en cadenas regionales.", date: "2026-05-05T09:00:00Z", area: "Sell-Through", author: { name: "Mauro Celani", role: "KAM Senior", type: "user" } },
    ],
    files: [
      { id: "f1", name: "Mapa_PDVs_Regionales.xlsx", type: "xlsx", size: "2,1 MB", uploadedAt: "2026-05-10T10:00:00Z", uploadedBy: "Lucía Romero", source: "manual" },
    ],
  },
  {
    id: "proj-004",
    name: "Top 2 Top Cencosud 2026",
    description: "Preparación y seguimiento de la reunión ejecutiva Top 2 Top con Cencosud para Q3 2026. Incluye propuesta de sell-in, objetivos de sell-through y condiciones de trade.",
    area: "Ventas",
    objective: "Presentar a la dirección de Cencosud un plan de crecimiento conjunto para Q3 con compromisos de sell-in, objetivos de rotación en PDVs y condiciones de trade que soporten un ROI mayor a 2x.",
    owner: "Mauro Celani",
    contributors: ["Lucía Romero", "Carlos Vega"],
    linkedAreas: ["Ventas", "Sell-Through"],
    status: "active",
    priority: "medium",
    progress: 40,
    startDate: "2026-05-10",
    dueDate: "2026-06-20",
    conversationCount: 4,
    createdAt: "2026-05-10T08:00:00Z",
    updatedAt: "2026-05-20T09:00:00Z",
    presentationReady: false,
    linkedDataSources: ["ventas", "sell-through"],
    tags: ["Cencosud", "T2T", "Q3 2026", "Sell-Through", "Ventas"],
    brief: {
      problem: "La relación comercial con Cencosud está debajo del potencial: el sell-out creció solo 3% en Q1-Q2 vs el 12% del benchmark de la categoría. Los acuerdos de exhibición están vencidos y hay espacios de góndola sin negociar para el peak de Q3.",
      hypothesis: "Una reunión T2T con datos consolidados de sell-through por PDV, propuesta de acuerdo de exhibición y plan de inversión de trade puede destrabar el crecimiento de Q3 antes de que el competidor cierre posiciones.",
      strategy: "Presentar diagnóstico de sell-through por local Cencosud, proponer acuerdo de exhibición condicionado a volumen incremental, y definir mecánica de medición quincenal.",
      expectedOutcome: "Cerrar acuerdo de exhibición en 40+ locales Cencosud, compromiso de sell-in +10% y passthrough PDV sobre 82% para Q3.",
    },
    kpis: [
      { label: "Sell-in Cencosud YTD", value: "18.400 cajas", change: 3.1, changeType: "positive" },
      { label: "Sell-out Cencosud", value: "14.200 cajas", change: -1.4, changeType: "negative" },
      { label: "Passthrough Cencosud", value: "77%", change: -4.6, changeType: "negative" },
      { label: "Locales con exhibición activa", value: "22 / 40", change: -5.0, changeType: "negative" },
      { label: "Share of shelf Cencosud", value: "11,8%", change: -1.2, changeType: "negative" },
      { label: "Inversión trade YTD", value: "USD 48K", change: 8.0, changeType: "positive" },
    ],
    risks: [
      { id: "r1", label: "Competidor con propuesta ya presentada", severity: "high", description: "Reportes del KAM indican que el principal competidor ya tiene reunión T2T pautada. Cada semana de demora reduce la capacidad de capturar espacios premium." },
      { id: "r2", label: "Inversión de trade sin ROI auditado", severity: "medium", description: "El acuerdo anterior no tuvo medición de sell-out a nivel local. Cencosud puede resistir una nueva inversión sin garantía de impacto." },
    ],
    opportunities: [
      { id: "o1", label: "Peak de Q3: +18% histórico en la categoría", impact: "high", description: "Julio-Agosto históricamente sube 18% en la categoría. Un acuerdo cerrado en junio captura el momentum con ventaja frente al competidor." },
      { id: "o2", label: "18 locales sin exhibición secundaria habilitada", impact: "medium", description: "Hay 18 locales Cencosud con espacio disponible que no se activaron en Q2. Activarlos en Q3 representa un incremento directo de cobertura." },
    ],
    nextSteps: [
      { id: "ns1", label: "Preparar deck T2T con datos de sell-through por local", owner: "Mauro Celani", dueDate: "2026-06-08", done: false },
      { id: "ns2", label: "Validar propuesta de inversión de trade con Finance", owner: "Lucía Romero", dueDate: "2026-06-05", done: false },
      { id: "ns3", label: "Confirmar agenda con buyer de Cencosud", owner: "Mauro Celani", dueDate: "2026-06-01", done: true },
    ],
    goals: [
      { id: "g1", name: "Acuerdo exhibición Cencosud Q3", kpi: "Locales con exhibición activa", currentValue: "22", targetValue: "40", unit: "locales", progress: 40, dueDate: "2026-06-20", priority: "high", status: "in-progress" },
      { id: "g2", name: "Passthrough Cencosud Q3", kpi: "Passthrough", currentValue: "77%", targetValue: "82%", unit: "%", progress: 40, dueDate: "2026-09-30", priority: "medium", status: "in-progress" },
    ],
    insights: [
      { id: "ins1", title: "Cencosud crece por debajo de la categoría 9pp", description: "El canal crece 3% vs 12% de la categoría en Q1-Q2. La brecha es atribuible principalmente a la baja cobertura de exhibición en locales A.", severity: "high", impact: "high", area: "Ventas", recommendation: "Presentar el dato con granularidad por local en la reunión T2T para anclar el problema y proponer el acuerdo de exhibición.", createdAt: "2026-05-12T09:00:00Z" },
      { id: "ins2", title: "PDVs Cencosud con sell-through bajo se concentran en Zona Sur", description: "Los 12 locales con menor passthrough están en Zona Sur, donde la ejecución de reposición es irregular. Corrección de ruta puede impactar rápido.", severity: "medium", impact: "medium", area: "Sell-Through", recommendation: "Incluir plan de corrección de ruta en la propuesta T2T como compromiso operativo.", createdAt: "2026-05-14T11:00:00Z" },
    ],
    timelineEvents: [
      { id: "tl11", type: "file", title: "Presentación_T2T_Cencosud_v1.pptx generada", description: "Nexus generó la deck ejecutiva para el T2T: performance YTD, oportunidades cruzadas sell-in / sell-through y propuesta de acuerdo.", date: "2026-05-21T11:30:00Z", area: "Ventas", author: { name: "Nexus", type: "ai" } },
      { id: "tl10", type: "action", title: "Agenda T2T confirmada con buyer Cencosud", description: "La reunión quedó agendada para la semana del 16/06 con el buyer de Cencosud y el Director Comercial de ACG.", date: "2026-05-20T09:00:00Z", area: "Ventas", author: { name: "Mauro Celani", role: "KAM Cencosud", type: "user" } },
      { id: "tl9", type: "conversation", title: "Posición de negociación y aprobaciones internas", description: "Definición del rango de inversión en trade, condiciones de acuerdo y proceso de aprobación interna antes del T2T.", date: "2026-05-19T10:00:00Z", area: "Ventas", author: { name: "Mauro Celani", role: "KAM Cencosud", type: "user" } },
      { id: "tl8", type: "kpi", title: "Simulación de impacto: acuerdo T2T genera +$890k revenue", description: "Nexus modeló tres escenarios (base, optimista, conservador) y calculó el impacto incremental en revenue y margen bruto.", date: "2026-05-18T14:00:00Z", area: "Ventas", author: { name: "Nexus", type: "ai" } },
      { id: "tl7", type: "conversation", title: "Cruce ventas + sell-through: insights estratégicos", description: "Sofía García y Nexus identificaron oportunidades cruzadas entre el sell-in bajo y el sell-through débil para construir la narrativa del T2T.", date: "2026-05-17T09:30:00Z", area: "Sell-Through", author: { name: "Sofía García", role: "Trade Marketing", type: "user" } },
      { id: "tl6", type: "insight", title: "PDVs Cencosud con sell-through bajo concentrados en Zona Sur", description: "Los 12 locales con menor passthrough están en Zona Sur, donde la ejecución de reposición es irregular. La corrección de ruta puede impactar rápido.", date: "2026-05-16T11:00:00Z", area: "Sell-Through", author: { name: "Nexus", type: "ai" } },
      { id: "tl5", type: "conversation", title: "Propuesta de exhibición y trade investment", description: "Análisis de la propuesta de exhibición adicional: 120 góndolas incrementales a cambio de 3% de inversión trade, con simulación de payback.", date: "2026-05-15T10:00:00Z", area: "Ventas", author: { name: "Mauro Celani", role: "KAM Cencosud", type: "user" } },
      { id: "tl4", type: "insight", title: "Cencosud crece 9pp por debajo de la categoría", description: "El canal crece 3% vs. 12% de la categoría en Q1–Q2. La brecha se explica principalmente por la baja cobertura de exhibición en locales A.", date: "2026-05-13T09:00:00Z", area: "Ventas", author: { name: "Nexus", type: "ai" } },
      { id: "tl3", type: "conversation", title: "Diagnóstico Cencosud: sell-in, sell-out y passthrough", description: "Mauro solicitó el análisis cruzado de sell-in / sell-out y passthrough para identificar los drivers de la brecha con la categoría.", date: "2026-05-12T09:00:00Z", area: "Ventas", author: { name: "Mauro Celani", role: "KAM Cencosud", type: "user" } },
      { id: "tl2", type: "file", title: "Data_Cencosud_Historico_2024-2025.xlsx cargado", description: "Carga del histórico de ventas Cencosud 2024–2025 como referencia para el análisis de evolución YoY y benchmarks de categoría.", date: "2026-05-09T14:00:00Z", area: "Ventas", author: { name: "Mauro Celani", role: "KAM Cencosud", type: "user" } },
      { id: "tl1", type: "action", title: "Apertura del proyecto T2T Cencosud 2026", description: "El equipo KAM definió el scope del T2T: recuperar share de exhibición, corregir el sell-through en Zona Sur y proponer un acuerdo de calendario 2H 2026.", date: "2026-05-08T09:00:00Z", area: "Ventas", author: { name: "Mauro Celani", role: "KAM Cencosud", type: "user" } },
    ],
    files: [
      { id: "f1", name: "Cencosud_Sell_Through_por_Local.xlsx", type: "xlsx", size: "1,8 MB", uploadedAt: "2026-05-12T10:00:00Z", uploadedBy: "Mauro Celani", source: "manual" },
    ],
  },
];

// ─── Message helpers ───────────────────────────────────────────────────────────

function userMessage(id: string, content: string, timestamp: string, userName?: string): Message {
  return { id, role: "user", content, timestamp, ...(userName ? { userName } : {}) };
}

function richMsg(id: string, timestamp: string, blocks: Message["blocks"]): Message {
  return { id, role: "assistant", content: "", blocks, timestamp };
}

function chatMsg(id: string, content: string, timestamp: string, blocks?: Message["blocks"]): Message {
  return { id, role: "assistant", content, ...(blocks ? { blocks } : {}), timestamp };
}

// ─── Demo project messages ─────────────────────────────────────────────────────

export const DEMO_PROJECT_MESSAGES: Record<string, Message[]> = {

  // ── conv-001: Diagnóstico integral — multi-persona ────────────────────────────
  "conv-001": [
    userMessage("msg-001-u1", "Dame el diagnóstico completo del canal supermercados. ¿Dónde estamos parados en sell-out vs sell-in?", "2026-05-16T09:00:00Z"),
    richMsg("msg-001-a1", "2026-05-16T09:01:00Z", [
      { type: "executive-summary", data: { title: "Diagnóstico Canal Supermercados — YTD 2026", summary: "El canal supermercados acumula una brecha creciente: 62.000 cajas sell-in vs 51.000 sell-out (passthrough 82,3%). Carrefour concentra el mayor stock inmovilizado con 9.800 cajas y passthrough del 53%. El problema raíz combina baja visibilidad en góndola, price index por debajo del benchmark y sobre-despacho en Q1.", period: "YTD 2026 — Diagnóstico canal", severity: "high" } },
      { type: "kpi-strip", data: { kpis: [
        { label: "Sell-in supermercados", value: "62.000 cajas", change: "+6,4%", changeType: "positive" },
        { label: "Sell-out supermercados", value: "51.000 cajas", change: "-9,8%", changeType: "negative" },
        { label: "Passthrough canal", value: "82,3%", change: "-5,1pp", changeType: "negative" },
        { label: "Passthrough Carrefour", value: "53%", change: "-29pp benchmark", changeType: "negative" },
        { label: "Price Index canal", value: "0,93", change: "-7pp", changeType: "negative" },
        { label: "ROI Trade Spend", value: "1,8x", change: "+0,2x", changeType: "positive" },
      ] } },
      { type: "chart", data: { chartId: "super-sell-gap", type: "bar", title: "Sell-in vs Sell-out por Cadena — YTD 2026" } },
      { type: "insight-card", data: { insights: [
        { type: "alert", title: "Carrefour concentra 72% del stock inmovilizado", description: "12 hipermercados A/B con cobertura promedio de 12,4 semanas vs benchmark de 4–5 sem. Riesgo de devolución si no se activa antes del 30/06." },
        { type: "warning", title: "Price Index 7pp por debajo del benchmark sin efecto en rotación", description: "El descuento no genera elasticidad sin exhibición secundaria. El shopper no encuentra el producto en góndola." },
        { type: "opportunity", title: "120 tiendas Carrefour con slot de exhibición disponible", description: "USD 85K de trade puede generar ROI de 1,8x y recuperar +8pp de passthrough." },
      ] } },
      { type: "recommendations", data: { recommendations: [
        { id: "r1", title: "Pausa selectiva de despacho en 12 hipermercados críticos", description: "Suspender sell-in hasta que passthrough supere 70% en tiendas receptoras.", priority: "high" },
        { id: "r2", title: "Activar exhibición secundaria en 120 tiendas antes del 10/06", description: "USD 85K de trade disponibles. Focalizar en hipermercados A/B de mayor rotación.", priority: "high" },
        { id: "r3", title: "Ajuste táctico de precio -4% condicionado a exhibición", description: "Solo con contrapartida de espacio auditado. Sin exhibición = sin descuento.", priority: "medium" },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Crear plan de acción", action: "create-plan" },
        { id: "a2", label: "Crear objetivo de passthrough", action: "create-goal" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Cómo está el price index vs la competencia?", "¿Qué impacto tiene el -4% de precio en el margen?", "¿Cuál es el plan para la reunión con Carrefour?"] } },
    ]),
    userMessage("msg-001-u2", "Eso del price index me preocupa. ¿Podés cruzar el price index con la exhibición por tienda para ver si hay correlación?", "2026-05-16T09:08:00Z", "Lucía Romero"),
    richMsg("msg-001-a2", "2026-05-16T09:09:00Z", [
      { type: "executive-summary", data: { title: "Cruce Price Index vs Exhibición — Análisis por Tienda", summary: "La correlación es contundente: las tiendas con exhibición secundaria activa tienen passthrough de 84% vs 54% en las que no la tienen, independientemente del price index. El problema de rotación en Carrefour NO es de precio — es de visibilidad en PDV.", period: "Análisis cross — YTD 2026", severity: "medium" } },
      { type: "chart", data: { chartId: "price-vs-exhibit", type: "bar", title: "Passthrough — Tiendas con Exhibición vs Sin Exhibición" } },
      { type: "insight-card", data: { insights: [
        { type: "alert", title: "Sin correlación entre price index y passthrough en tiendas sin exhibición", description: "Bajar más el precio en tiendas sin visibilidad en góndola no genera rotación. El shopper no llega al producto." },
        { type: "opportunity", title: "Las 72 tiendas sin exhibición son el mayor upside del plan", description: "Pasar de 54% a 84% de passthrough en esas tiendas representa el objetivo principal de Q2." },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Agregar insight al proyecto", action: "add-insight" },
        { id: "a2", label: "Crear plan de pricing", action: "create-plan" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Cuánto impacta en el margen bajar -4% en Carrefour?", "¿Cómo es la situación en Coto vs Jumbo?", "¿Qué prioridades llevo a la reunión con el KAM?"] } },
    ]),
    userMessage("msg-001-u3", "Si hacemos el -4% de precio en Carrefour igual, ¿cuánto perdemos de margen? Quiero verlo antes de decidir.", "2026-05-16T09:15:00Z", "Diego Pereira"),
    richMsg("msg-001-a3", "2026-05-16T09:16:00Z", [
      { type: "executive-summary", data: { title: "Simulación Repricing -4% — Impacto en Margen Carrefour", summary: "Escenario -4% condicionado a exhibición: -0,4pp de margen, +4.900 cajas liberadas y +8% de sell-out estimado. Sin exhibición, el mismo descuento destruye -0,6pp de margen sin mejora de rotación. La condición de exhibición es irrompible.", period: "Simulación — Q2 2026", severity: "medium" } },
      { type: "kpi-strip", data: { kpis: [
        { label: "Precio actual (neto)", value: "USD 5,80", change: "baseline", changeType: "neutral" },
        { label: "Precio propuesto (-4%)", value: "USD 5,57", change: "-USD 0,23/caja", changeType: "neutral" },
        { label: "Impacto margen (con exhib.)", value: "-0,4pp", change: "aceptable", changeType: "negative" },
        { label: "Impacto margen (sin exhib.)", value: "-0,6pp", change: "inaceptable", changeType: "negative" },
        { label: "Stock liberado en 3 sem.", value: "+4.900 cajas", change: "con exhibición", changeType: "positive" },
      ] } },
      { type: "insight-card", data: { insights: [
        { type: "opportunity", title: "Escenario recomendado: -4% condicionado a exhibición auditada", description: "Margen aceptable (-0,4pp), rotación +8%, stock liberado. Condición: Carrefour confirma exhibición antes de activar el descuento." },
        { type: "alert", title: "Escenario a evitar: -10% lineal sin contrapartida", description: "Destruye -1,2pp de margen y entrena al shopper a esperar descuento. El precedente se vuelve estructural." },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Crear plan de acción", action: "create-plan" },
        { id: "a2", label: "Crear objetivo de margen", action: "create-goal" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Cuáles son las prioridades para cerrar antes del 30/06?", "¿Cómo negociamos el acuerdo con el KAM de Carrefour?"] } },
    ]),
    userMessage("msg-001-u4", "OK, ya tenemos suficiente contexto. ¿Cuál es la prioridad 1 de acciones para cerrar antes del 30/06?", "2026-05-16T09:22:00Z"),
    richMsg("msg-001-a4", "2026-05-16T09:24:00Z", [
      { type: "recommendations", data: { recommendations: [
        { id: "r1", title: "Prioridad 1: Negociar exhibición en 120 tiendas Carrefour antes del 10/06", description: "Sin exhibición no hay rotación. Dueño: Mauro Celani + KAM Carrefour.", priority: "high" },
        { id: "r2", title: "Prioridad 2: Activar descuento -4% solo en tiendas con exhibición confirmada", description: "Condicionar estrictamente. Vigencia: 21 días. Dueño: Lucía Romero (Revenue Manager).", priority: "high" },
        { id: "r3", title: "Prioridad 3: Reposición selectiva en 45 sucursales con mayor rotación", description: "Solo en tiendas con passthrough > 70%. Dueño: Diego Pereira. Deadline: 18/05.", priority: "medium" },
        { id: "r4", title: "Checkpoint ejecutivo al día 21: decidir si escalar", description: "Revisar passthrough, sell-out y ROI. Dueño: Mauro Celani.", priority: "medium" },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Crear plan de seguimiento Q2", action: "create-plan" },
        { id: "a2", label: "Agregar insight al proyecto", action: "add-insight" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Preparamos el análisis de precios?", "¿Cómo armamos la estrategia de trade marketing?"] } },
    ]),
  ],

  // ── conv-002: Análisis de precios y competencia ───────────────────────────────
  "conv-002": [
    userMessage("msg-002-u1", "Benchmark de precios: compará Espumante contra competidores en Carrefour, Coto y Jumbo.", "2026-05-15T14:00:00Z", "Lucía Romero"),
    richMsg("msg-002-a1", "2026-05-15T14:02:00Z", [
      { type: "executive-summary", data: { title: "Benchmark de Precio — Espumante Brut vs Competidores", summary: "El Espumante ACG (Price Index 0,93) está 7pp por debajo del benchmark de mercado. El análisis por cadena revela estrategias diferenciadas: Carrefour necesita visibilidad no precio, Coto necesita formato multipack, Jumbo tiene mix premium con mejor margen.", period: "YTD 2026 — Análisis por cadena", severity: "medium" } },
      { type: "kpi-strip", data: { kpis: [
        { label: "Price Index ACG", value: "0,93", change: "-7pp vs benchmark", changeType: "negative" },
        { label: "Price Index Competidor A", value: "1,05", change: "referencia", changeType: "positive" },
        { label: "Price Index Competidor B", value: "0,98", change: "referencia", changeType: "neutral" },
        { label: "Brecha precio/unidad", value: "USD -0,42", change: "vs mercado", changeType: "negative" },
        { label: "Revenue no capturado", value: "USD 60K est.", change: "en Espumante", changeType: "negative" },
      ] } },
      { type: "chart", data: { chartId: "price-benchmark-cadenas", type: "bar", title: "Price Index por Cadena — Espumante vs Competidores" } },
      { type: "insight-card", data: { insights: [
        { type: "alert", title: "Carrefour: precio bajo sin elasticidad — problema de visibilidad", description: "El descuento no genera rotación porque el producto no tiene exhibición. La solución es visibilidad, no más descuento." },
        { type: "opportunity", title: "Coto: oportunidad de multipack con precio diferencial", description: "El shopper de Coto es más sensible a volumen que a precio unitario. 6-pack con precio especial mejora ticket sin sacrificar margen." },
        { type: "opportunity", title: "Jumbo: sostener precio premium y empujar Malbec Reserva", description: "En Jumbo el mix premium funciona. No bajar precio — ampliar portafolio premium." },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Crear plan de pricing por cadena", action: "create-plan" },
        { id: "a2", label: "Agregar insight al proyecto", action: "add-insight" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Cuáles son los KPIs que monitoreo para saber si funcionó?", "¿Cómo negocio el multipack con Coto?", "¿Qué impacto tiene en EBITDA la estrategia por cadena?"] } },
    ]),
    userMessage("msg-002-u2", "¿Qué KPIs tengo que monitorear para saber si funcionó la estrategia de precio?", "2026-05-15T14:10:00Z", "Diego Pereira"),
    richMsg("msg-002-a2", "2026-05-15T14:12:00Z", [
      { type: "kpi-strip", data: { kpis: [
        { label: "Passthrough semanal", value: "Objetivo: >85%", change: "señal verde", changeType: "positive" },
        { label: "Unidades/tienda exhibición", value: "Objetivo: +15%", change: "vs sin exhibición", changeType: "positive" },
        { label: "Price Index por cadena", value: "Objetivo: >0,95", change: "en 4 semanas", changeType: "positive" },
        { label: "ROI Trade Spend", value: "Objetivo: >1,8x", change: "por cadena", changeType: "positive" },
      ] } },
      { type: "recommendations", data: { recommendations: [
        { id: "r1", title: "Dashboard semanal: passthrough, sell-out y price index por tienda", description: "Señal verde: +5pp de distribución, +8% sell-out en Carrefour y ROI trade > 1,8x en las primeras 4 semanas.", priority: "high" },
        { id: "r2", title: "Checkpoint día 21: extender o ajustar estrategia", description: "Si el passthrough no supera el 70% en tiendas piloto, revisar si el problema es precio o ejecución.", priority: "medium" },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Crear objetivo de Price Index", action: "create-goal" },
        { id: "a2", label: "Crear plan de monitoreo", action: "create-plan" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Cómo armamos el tablero semanal?", "¿Quién es responsable del monitoreo?", "¿Qué pasa si el competidor baja precio en respuesta?"] } },
    ]),
    userMessage("msg-002-u3", "¿Cuál debería ser la posición de cierre mínima en la negociación con el KAM de Carrefour?", "2026-05-15T14:18:00Z", "Lucía Romero"),
    richMsg("msg-002-a3", "2026-05-15T14:20:00Z", [
      { type: "recommendations", data: { recommendations: [
        { id: "r1", title: "Mínimo aceptable: 80 tiendas con exhibición + sell-out mínimo de 8.500 cajas/mes", description: "Por debajo de 80 tiendas, el ROI del trade no justifica la inversión. El sell-out mínimo es la condición para activar el descuento.", priority: "high" },
        { id: "r2", title: "Ideal: 120 tiendas + pausa de despacho en tiendas con cobertura >8 semanas", description: "Con 120 tiendas se alcanza el umbral de 90% de passthrough proyectado. La pausa evita seguir acumulando stock.", priority: "high" },
        { id: "r3", title: "Si Carrefour no acepta: redirigir USD 85K a Jumbo y Coto", description: "Jumbo y Coto tienen mejor passthrough base. El presupuesto genera más ROI allí si Carrefour no acepta las condiciones.", priority: "medium" },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Crear plan de negociación", action: "create-plan" },
        { id: "a2", label: "Agregar insight al proyecto", action: "add-insight" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Cómo preparo al equipo para la reunión?", "¿Qué materiales llevo?"] } },
    ]),
  ],

  // ── conv-003: Trade marketing y ejecución ─────────────────────────────────────
  "conv-003": [
    userMessage("msg-003-u1", "¿Cómo está la ejecución del trade marketing en los puntos de venta prioritarios?", "2026-05-14T10:00:00Z", "Diego Pereira"),
    richMsg("msg-003-a1", "2026-05-14T10:02:00Z", [
      { type: "executive-summary", data: { title: "Diagnóstico Ejecución Trade Marketing — PDVs Prioritarios", summary: "Solo 48 de 120 tiendas Carrefour tienen exhibición secundaria activa (40%). Las tiendas con exhibición muestran passthrough de 84% vs 54% sin exhibición. El diferencial de 30pp justifica la inversión de USD 85K en activación de los 72 PDVs faltantes.", period: "Semana 20 — YTD 2026", severity: "high" } },
      { type: "kpi-strip", data: { kpis: [
        { label: "Tiendas con exhibición activa", value: "48 / 120", change: "40%", changeType: "negative" },
        { label: "Passthrough tiendas activas", value: "84%", change: "+30pp vs inactivas", changeType: "positive" },
        { label: "Passthrough tiendas sin exhib.", value: "54%", change: "-30pp vs activas", changeType: "negative" },
        { label: "ROI trade tiendas activas", value: "1,8x", change: "+0,9x vs inactivas", changeType: "positive" },
        { label: "Budget trade disponible", value: "USD 85K", change: "sin asignar", changeType: "positive" },
      ] } },
      { type: "insight-card", data: { insights: [
        { type: "alert", title: "72 tiendas sin exhibición activa = el mayor upside del plan", description: "Activar esas 72 tiendas es la acción de mayor impacto con menor costo relativo. El ROI en tiendas activas ya prueba el modelo." },
        { type: "opportunity", title: "USD 85K de trade sin asignar pueden duplicar cobertura", description: "Con el presupuesto disponible se pueden activar las 72 tiendas restantes, elevando la cobertura al 100%." },
        { type: "warning", title: "Lead time de materiales POP: 2 semanas mínimo", description: "Para activar antes del 10/06, los materiales deben pedirse antes del 27/05. El deadline operativo es urgente." },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Crear plan de activación trade", action: "create-plan" },
        { id: "a2", label: "Agregar insight al proyecto", action: "add-insight" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Cuál es el cronograma de activación óptimo?", "¿Cómo priorizamos las 72 tiendas?", "¿Qué materiales necesitamos?"] } },
    ]),
    userMessage("msg-003-u2", "Simulá el ROI del trade si activamos las 72 tiendas restantes. ¿Cuánto tiempo recuperamos la inversión?", "2026-05-14T10:10:00Z", "Carlos Vega"),
    richMsg("msg-003-a2", "2026-05-14T10:12:00Z", [
      { type: "executive-summary", data: { title: "Simulación ROI — Activación 72 Tiendas Carrefour", summary: "Invertir USD 85K en activar las 72 tiendas restantes genera un retorno de USD 153K en incremental de sell-out en 6 semanas (ROI 1,8x). El payback ocurre en la semana 4. El escenario supone que las nuevas tiendas alcanzan el mismo passthrough de 84% que las 48 activas.", period: "Simulación — Q2 2026", severity: "medium" } },
      { type: "kpi-strip", data: { kpis: [
        { label: "Inversión trade", value: "USD 85K", change: "total", changeType: "neutral" },
        { label: "Incremental sell-out", value: "+12.400 cajas", change: "en 6 semanas", changeType: "positive" },
        { label: "Revenue incremental", value: "USD 153K", change: "+ROI 1,8x", changeType: "positive" },
        { label: "Payback", value: "Semana 4", change: "vs semana 8 sin exhib.", changeType: "positive" },
        { label: "Passthrough proyectado", value: "84%", change: "+30pp vs actual", changeType: "positive" },
      ] } },
      { type: "recommendations", data: { recommendations: [
        { id: "r1", title: "Aprobar USD 85K de trade — payback en semana 4", description: "El modelo es conservador: proyecta solo el mismo passthrough que las tiendas activas. El upside puede ser mayor.", priority: "high" },
        { id: "r2", title: "Priorizar 30 tiendas A/B de mayor volumen en primera ola", description: "Con 30 tiendas se captura el 60% del incremental proyectado. Permite validar el modelo antes de escalar a las 42 restantes.", priority: "high" },
        { id: "r3", title: "Monitorear semana a semana y escalar si passthrough > 75% en ola 1", description: "Criterio de go/no-go para la segunda ola: passthrough ≥ 75% en tiendas de ola 1 al día 14.", priority: "medium" },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Crear objetivo de ROI trade", action: "create-goal" },
        { id: "a2", label: "Crear plan de activación por olas", action: "create-plan" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Cómo presento esto a dirección para la aprobación?", "¿Cuál es el riesgo de que las nuevas tiendas no alcancen el 84%?"] } },
    ]),
    userMessage("msg-003-u3", "¿Cómo presento la aprobación de los USD 85K a dirección de la manera más concisa?", "2026-05-14T10:18:00Z", "Carlos Vega"),
    richMsg("msg-003-a3", "2026-05-14T10:20:00Z", [
      { type: "recommendations", data: { recommendations: [
        { id: "r1", title: "Frame: 'Aprobación de trade que se autofinancia en 4 semanas'", description: "No presentar como gasto — presentar como inversión con payback documentado. USD 85K generan USD 153K de revenue incremental.", priority: "high" },
        { id: "r2", title: "Dato ancla: las 48 tiendas activas ya prueban que funciona", description: "No estamos aprobando un experimento. Estamos escalando un modelo validado. El riesgo es bajo porque el precedente existe.", priority: "high" },
        { id: "r3", title: "Consecuencia de no aprobar: USD 180K en riesgo de devolución de stock", description: "Sin la inversión, Carrefour puede exigir devoluciones de las cajas acumuladas. El costo de no actuar es 2,1x mayor.", priority: "high" },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Agregar insight al proyecto", action: "add-insight" },
        { id: "a2", label: "Crear plan de presentación a dirección", action: "create-plan" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Armamos la presentación ejecutiva completa?", "¿Cuáles son los riesgos a mitigar?"] } },
    ]),
  ],

  // ── conv-004: Preparación presentación ejecutiva — flujo T2T ──────────────────
  "conv-004": [
    userMessage("msg-004-u1", "Necesito preparar la presentación ejecutiva para la reunión con la conducción de Carrefour. ¿Podés armar el análisis completo?", "2026-05-20T10:00:00Z"),
    richMsg("msg-004-a1", "2026-05-20T10:01:00Z", [
      { type: "executive-summary", data: { title: "Preparación Presentación Ejecutiva — Carrefour Argentina", summary: "Tengo acceso al análisis completo del proyecto: diagnóstico de sell-out, benchmark de precios, análisis de exhibición y simulación de ROI. Para construir la presentación, ¿cuál es el objetivo central de la reunión con Carrefour?", period: "Preparación — Mayo 2026", severity: "low" } },
      { type: "iteration-prompt", data: { prompts: [
        { id: "ip1", label: "Justificar plan de exhibición + USD 85K de trade", query: "El objetivo es justificar el plan de exhibición en 120 tiendas y obtener aprobación de USD 85K de trade" },
        { id: "ip2", label: "Proponer plan conjunto para Q3 estacional", query: "Quiero proponer a Carrefour un plan conjunto de 90 días para capturar el pico estacional de Q3" },
        { id: "ip3", label: "Revisión de performance YTD + negociación H2", query: "Quiero hacer una revisión completa de la performance YTD y negociar condiciones para H2 2026" },
      ] } },
    ]),
    userMessage("msg-004-u2", "El objetivo es justificar el plan de exhibición y proponer un plan conjunto para capturar el pico estacional de Q3. Tenemos los datos de que las tiendas con exhibición tienen 30pp más de passthrough.", "2026-05-20T10:06:00Z"),
    richMsg("msg-004-a2", "2026-05-20T10:07:00Z", [
      { type: "diagnostic-summary", data: {
        title: "Diagnóstico",
        context: "Situación comercial de Andes Consumer Goods en Carrefour Argentina — YTD 2026",
        points: [
          { text: "Stock inmovilizado de 13.348 cajas (10,2 semanas de cobertura vs benchmark 4–5 sem). Riesgo de devolución por USD ~180K si no se activa antes del 30/06.", severity: "high", area: "Ventas" },
          { text: "Sell-out cayó -9,8% YTD mientras sell-in creció +6,4%. La brecha acumula capital inmovilizado que presiona el P&L de ambas partes.", severity: "high", area: "Ventas" },
          { text: "Price Index en 0,93 — 7pp bajo el benchmark. Sin visibilidad en góndola, el descuento no genera elasticidad de demanda.", severity: "medium", area: "RGM" },
          { text: "Solo 48 de 120 tiendas tienen exhibición activa (40%). Las tiendas con exhibición tienen passthrough de 84% vs 54% sin exhibición — diferencial de 30pp documentado.", severity: "medium", area: "Trade Marketing" },
        ],
      } },
      { type: "cross-insights", data: {
        title: "Insights Estratégicos",
        insights: [
          { id: "ci1", finding: "El problema NO es el precio — es la falta de visibilidad en PDV", association: "Las 48 tiendas con exhibición activa tienen 84% de passthrough con el mismo price index que las 72 sin exhibición. Bajar más el precio sin espacio destruiría margen sin generar rotación. La solución es ejecución, no descuento.", sources: ["Sell-out por tienda sem 1–20", "Análisis exhibición vs rotación"], impact: "high" },
          { id: "ci2", finding: "Q3 es la ventana de oportunidad más importante del año — hay que cerrar el plan ahora", association: "Julio–Agosto históricamente +18% de demanda de la categoría. Los deals para asegurar espacio en Q3 cierran en junio. El competidor ya está negociando. Cada semana de demora es participación que ACG pierde.", sources: ["Histórico estacional 2023–2025", "Share competidor"], impact: "high" },
          { id: "ci3", finding: "USD 85K de trade generan ROI de 1,8x — pero solo si van a tiendas con exhibición confirmada", association: "El ROI cae a 0,9x en tiendas sin exhibición. El deal correcto: ACG aporta el trade, Carrefour aporta el espacio. Sin la contraparte de exhibición, el presupuesto se redirige a Jumbo y Coto.", sources: ["Trade spend YTD", "Simulación ROI por tipo de tienda"], impact: "medium" },
        ],
      } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Agregar insight al proyecto", action: "add-insight" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["Generá las iniciativas estratégicas para el plan conjunto", "Ajustá el tono para que sea más ejecutivo y orientado a decisiones", "¿Cuál es nuestra posición mínima de negociación?"] } },
    ]),
    userMessage("msg-004-u3", "Perfecto. Generá las iniciativas estratégicas para el plan conjunto y prepará la presentación.", "2026-05-20T10:14:00Z"),
    richMsg("msg-004-a3", "2026-05-20T10:15:00Z", [
      { type: "strategic-initiatives", data: {
        title: "Iniciativas Estratégicas",
        objective: "Plan conjunto de 90 días — Andes Consumer Goods + Carrefour Argentina · Q2–Q3 2026",
        initiatives: [
          { id: "ini1", title: "Activación de exhibición en 120 tiendas prioritarias antes del 30/06", description: "ACG co-financia con USD 85K de trade. Carrefour compromete espacio en 120 tiendas. KPI compartido: passthrough ≥ 90% al 31/07. Tablero semanal de seguimiento.", owner: "Diego Pereira", dueDate: "2026-06-30", priority: "high", kpi: "Passthrough ≥ 90%", area: "Trade Marketing" },
          { id: "ini2", title: "Precio táctico -4% condicional a exhibición auditada por 21 días", description: "Activo solo en tiendas con exhibición secundaria confirmada. Sin espacio = precio regular. Impacto en margen: -0,4pp aceptable. Revisión al día 21.", owner: "Lucía Romero", dueDate: "2026-06-15", priority: "high", kpi: "Price Index ≥ 0,95", area: "RGM" },
          { id: "ini3", title: "Compromiso de sell-out Q3: +15% vs Q3 2025 con tablero compartido", description: "Carrefour se compromete a un target de sell-out para Q3 a cambio de las condiciones mejoradas. Nexus genera el tablero semanal de passthrough y ROI accesible para ambas partes.", owner: "Mauro Celani", dueDate: "2026-09-30", priority: "medium", kpi: "Sell-out +15% Q3", area: "Ventas" },
        ],
      } },
      { type: "executive-summary", data: { title: "Análisis completo — Presentación lista para generar", summary: "El análisis está completo: Diagnóstico con 4 puntos críticos, 3 insights estratégicos de alto impacto y 3 iniciativas con dueños, fechas y KPIs. La presentación cubre todos los elementos necesarios para una reunión ejecutiva: problema compartido, evidencia, plan de acción y compromisos mutuos.", period: "Presentación Ejecutiva — Carrefour Argentina · Junio 2026", severity: "low" } },
      { type: "action-plan", data: { actions: [
        { id: "a0", label: "Generar presentación ejecutiva", action: "generate-deck" },
        { id: "a1", label: "Crear plan de acción", action: "create-plan" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Cuál es nuestra posición mínima de cierre?", "¿Cómo hacemos el seguimiento post-reunión?"] } },
    ]),
  ],

  // ── conv-005: Diagnóstico de cobertura en cadenas regionales ──────────────────
  "conv-005": [
    userMessage("msg-005-u1", "Necesito entender el estado actual de cobertura en cadenas regionales. ¿Dónde estamos con los PDVs y qué zonas tienen mayor brecha?", "2026-05-10T10:00:00Z", "Lucía Romero"),
    richMsg("msg-005-a1", "2026-05-10T10:01:00Z", [
      { type: "executive-summary", data: { title: "Diagnóstico de Cobertura — Cadenas Regionales YTD 2026", summary: "La cobertura de compradores en cadenas regionales es del 58%, con 131 PDVs habilitados que no compraron en los últimos 90 días. Zona Oeste concentra la mayor brecha absoluta (41% de cobertura sobre 68 PDVs habilitados), seguida por Zona Sur (52% sobre 47 PDVs). El passthrough promedio regional es del 71%, muy por debajo del benchmark nacional del 82%.", period: "YTD 2026 — Diagnóstico sell-through regional", severity: "high" } },
      { type: "kpi-strip", data: { kpis: [
        { label: "PDVs habilitados totales", value: "312", change: "universo", changeType: "neutral" },
        { label: "PDVs compradores activos", value: "181 (58%)", change: "-8,2pp vs benchmark", changeType: "negative" },
        { label: "PDVs no compradores", value: "131", change: "+12,4% vs Q1", changeType: "negative" },
        { label: "Passthrough promedio", value: "71%", change: "-11pp vs benchmark", changeType: "negative" },
        { label: "Zona con mayor brecha", value: "Zona Oeste (41%)", change: "prioridad #1", changeType: "negative" },
        { label: "Oportunidad estimada", value: "USD 124K", change: "revenue incremental", changeType: "positive" },
      ] } },
      { type: "chart", data: { chartId: "coverage-by-zone", type: "bar", title: "Cobertura de Compradores por Zona — YTD 2026" } },
      { type: "insight-card", data: { insights: [
        { type: "alert", title: "Zona Oeste: 59% de PDVs sin compra en 90 días", description: "68 PDVs habilitados, solo 28 activos. La principal causa es falta de visita del distribuidor en semanas de baja rotación." },
        { type: "alert", title: "Zona Sur: 48% de PDVs con passthrough por debajo del 50%", description: "El distribuidor zonal tiene 23 PDVs con quiebres recurrentes. El problema es de reposición, no de demanda." },
        { type: "opportunity", title: "87 PDVs compran el SKU testigo pero no el SKU objetivo", description: "Este segmento tiene la mayor probabilidad de conversión. Una campaña focalizada puede capturar hasta USD 80K de revenue incremental." },
      ] } },
      { type: "recommendations", data: { recommendations: [
        { id: "r1", title: "Priorizar Zona Oeste para la primera ola de activación", description: "Mayor concentración de PDVs potenciales en radio corto. Un solo distribuidor. Impacto rápido y medible.", priority: "high" },
        { id: "r2", title: "Auditar rutas del distribuidor Zona Sur", description: "Los quiebres recurrentes sugieren problemas de ruta, no de demanda. Corrección operativa antes de invertir en trade.", priority: "high" },
        { id: "r3", title: "Identificar PDVs con SKU testigo para campaña de conversión", description: "Son el segmento más eficiente. Activación con mecánica de volumen o prueba de producto.", priority: "medium" },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Crear objetivo de cobertura", action: "create-goal" },
        { id: "a2", label: "Agregar insight al proyecto", action: "add-insight" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Qué mecánica de activación propone Nexus para Zona Oeste?", "¿Cómo priorizamos los PDVs con SKU testigo?", "¿Qué datos adicionales necesitamos del distribuidor Zona Sur?"] } },
    ]),
    userMessage("msg-005-u2", "Foco en Zona Oeste. ¿Cuántos PDVs hay con SKU testigo pero sin SKU objetivo y cómo los priorizamos?", "2026-05-10T10:09:00Z", "Lucía Romero"),
    richMsg("msg-005-a2", "2026-05-10T10:10:00Z", [
      { type: "executive-summary", data: { title: "PDVs con SKU Testigo sin SKU Objetivo — Zona Oeste", summary: "En Zona Oeste hay 34 PDVs que compran activamente el SKU testigo (Vino Malbec Clásico) pero no han comprado el SKU objetivo (Espumante Brut) en los últimos 90 días. Son el segmento de mayor conversión esperada: ya tienen relación comercial activa con el distribuidor y tienen capacidad de llevar el producto.", period: "Análisis PDV — Zona Oeste", severity: "medium" } },
      { type: "kpi-strip", data: { kpis: [
        { label: "PDVs con SKU testigo activo", value: "34", change: "Zona Oeste", changeType: "positive" },
        { label: "Compra promedio SKU testigo", value: "48 unidades/mes", change: "regularidad alta", changeType: "positive" },
        { label: "Revenue potencial estimado", value: "USD 38K/mes", change: "si convierten", changeType: "positive" },
        { label: "Ticket promedio esperado", value: "18–22 unidades/pedido", change: "primer pedido", changeType: "neutral" },
      ] } },
      { type: "insight-card", data: { insights: [
        { type: "opportunity", title: "34 PDVs listos para conversión — 0 inversión adicional en ruta", description: "El distribuidor ya visita estos PDVs. Solo necesita oferta de introducción o demo de producto. El costo marginal de activación es mínimo." },
        { type: "warning", title: "Sin oferta de introducción, la conversión espontánea es menor al 8%", description: "Sin incentivo específico, estos PDVs no cambian el pedido. Una prueba de producto o descuento por primer pedido puede llevar la conversión al 35–45%." },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Crear plan de activación", action: "create-plan" },
        { id: "a2", label: "Agregar insight al proyecto", action: "add-insight" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Qué mecánica funciona mejor: prueba gratuita, descuento o multipack?", "¿Cómo estructura Nexus el plan de activación?"] } },
    ]),
    userMessage("msg-005-u3", "OK, ya tengo el diagnóstico claro. ¿Cuáles son las zonas prioritarias en orden de impacto esperado?", "2026-05-10T10:18:00Z", "Lucía Romero"),
    richMsg("msg-005-a3", "2026-05-10T10:19:00Z", [
      { type: "recommendations", data: { recommendations: [
        { id: "r1", title: "Zona Oeste — prioridad 1: mayor brecha + mayor densidad de PDVs convertibles", description: "34 PDVs con SKU testigo, cobertura actual 41%. Impacto estimado: +18pp de cobertura y USD 38K/mes si convierte el 70%.", priority: "high" },
        { id: "r2", title: "Zona Sur — prioridad 2: auditoría de ruta antes de activación", description: "El problema es operativo (quiebres de reposición), no de demanda. Corrección de ruta primero, luego activación. Impacto: recuperar 23 PDVs con compra irregular.", priority: "high" },
        { id: "r3", title: "Zona Norte — prioridad 3: menor brecha, aprovechable para segunda ola", description: "Cobertura actual del 68%. Solo 18 PDVs potenciales. Segunda ola eficiente una vez que Zona Oeste esté activada.", priority: "medium" },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Crear plan de activación", action: "create-plan" },
        { id: "a2", label: "Crear objetivo de cobertura", action: "create-goal" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Cómo construimos la campaña de activación?", "¿Cuánto deberíamos invertir en trade para Zona Oeste?"] } },
    ]),
  ],

  // ── conv-006: Construcción de plan de activación por zona ─────────────────────
  "conv-006": [
    userMessage("msg-006-u1", "Queremos construir la campaña de activación para Zona Oeste. ¿Qué mecánica propone Nexus y cómo debería estructurarse?", "2026-05-18T11:00:00Z", "Diego Pereira"),
    richMsg("msg-006-a1", "2026-05-18T11:01:00Z", [
      { type: "executive-summary", data: { title: "Plan de Activación — Zona Oeste, Cadenas Regionales", summary: "La mecánica recomendada es descuento de introducción del 12% en el primer pedido condicionado a compra mínima de 24 unidades. El modelo proyecta conversión del 45% sobre los 34 PDVs potenciales (15 PDVs), generando USD 17K en el primer mes y USD 38K/mes en régimen. Plazo de break-even de la inversión de trade: 6 semanas.", period: "Plan de activación — Q3 2026", severity: "low" } },
      { type: "kpi-strip", data: { kpis: [
        { label: "PDVs objetivo primera ola", value: "34", change: "SKU testigo activo", changeType: "neutral" },
        { label: "Conversión esperada", value: "15 PDVs (45%)", change: "con descuento intro", changeType: "positive" },
        { label: "Inversión de trade estimada", value: "USD 8.200", change: "6 semanas", changeType: "neutral" },
        { label: "Revenue primera ola", value: "USD 17K/mes", change: "en régimen", changeType: "positive" },
        { label: "Break-even inversión", value: "6 semanas", change: "ROI 2,2x", changeType: "positive" },
      ] } },
      { type: "insight-card", data: { insights: [
        { type: "opportunity", title: "Mecánica recomendada: descuento de introducción 12% + mínimo 24 unidades", description: "Bajo impacto en margen (-0,3pp), alto incentivo para el dueño de PDV, sin precedente de precio regular bajo." },
        { type: "warning", title: "Mecánica a evitar: prueba gratuita sin compromiso de segundo pedido", description: "Los PDVs que reciben producto gratuito sin compromiso de seguimiento tienen retención menor al 20%. El descuento condicionado retiene 3x más." },
      ] } },
      { type: "strategic-initiatives", data: {
        title: "Plan de Activación Zona Oeste",
        objective: "Convertir 15+ PDVs con SKU testigo en compradores activos del SKU objetivo en 6 semanas",
        initiatives: [
          { id: "ini1", title: "Semana 1–2: briefing al distribuidor y segmentación de PDVs", description: "Entregar lista priorizada de 34 PDVs al distribuidor de Zona Oeste con guión de activación y descuento de introducción.", owner: "Lucía Romero", dueDate: "2026-05-30", priority: "high", kpi: "100% PDVs visitados en 2 semanas", area: "Sell-Through" },
          { id: "ini2", title: "Semana 3–4: primera ronda de activación con seguimiento diario", description: "Registrar primer pedido en cada PDV activo. Medir tasa de activación al día 14 para decisión de go/no-go de segunda ola.", owner: "Diego Pereira", dueDate: "2026-06-13", priority: "high", kpi: "≥10 PDVs con primer pedido", area: "Sell-Through" },
          { id: "ini3", title: "Semana 5–6: segunda ola y medición de retención", description: "Reforzar PDVs activos con segundo pedido. Identificar PDVs de alta retención para incluir en el programa permanente.", owner: "Carlos Vega", dueDate: "2026-06-27", priority: "medium", kpi: "Retención ≥ 65% en semana 6", area: "Sell-Through" },
        ],
      } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Crear plan de acción", action: "create-plan" },
        { id: "a2", label: "Agregar insight al proyecto", action: "add-insight" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Cómo hacemos el seguimiento semanal?", "¿Cuánto deberíamos invertir en la segunda ola?"] } },
    ]),
    userMessage("msg-006-u2", "Perfecto. ¿Cómo debería ser el seguimiento semanal para detectar rápido si algo no funciona?", "2026-05-18T11:12:00Z", "Diego Pereira"),
    richMsg("msg-006-a2", "2026-05-18T11:13:00Z", [
      { type: "recommendations", data: { recommendations: [
        { id: "r1", title: "KPI de semáforo al día 7: tasa de activación ≥ 30%", description: "Si en la primera semana menos del 30% de los PDVs visitados realizan primer pedido, revisar el guión del distribuidor antes de continuar.", priority: "high" },
        { id: "r2", title: "KPI de semáforo al día 14: retención ≥ 50%", description: "Si los PDVs que hicieron primer pedido no repiten en la segunda semana, el problema es de rotación en PDV, no de activación.", priority: "high" },
        { id: "r3", title: "Dashboard quincenal de cobertura por zona con señal roja/amarilla/verde", description: "Nexus puede generar el tablero con los datos del distribuidor cada lunes. Alerta automática si alguna zona baja de 40% de cobertura.", priority: "medium" },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Crear objetivo de seguimiento", action: "create-goal" },
        { id: "a2", label: "Crear plan de acción", action: "create-plan" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Armamos el plan de reposición semanal?", "¿Cómo extendemos esto a Zona Sur después de la auditoría?"] } },
    ]),
  ],

  // ── conv-007: Diagnóstico Cencosud: sell-in, passthrough y PDVs ───────────────
  "conv-007": [
    userMessage("msg-007-u1", "Necesito un diagnóstico completo de Cencosud para preparar el T2T. ¿Cómo estamos en sell-in, sell-out, passthrough y locales activos?", "2026-05-12T09:00:00Z"),
    richMsg("msg-007-a1", "2026-05-12T09:01:00Z", [
      { type: "executive-summary", data: { title: "Diagnóstico Cencosud — YTD 2026", summary: "Cencosud muestra una brecha estructural entre sell-in y sell-out: 18.400 cajas sell-in vs 14.200 sell-out (passthrough 77%). Solo 22 de 40 locales habilitados tienen exhibición activa. El canal creció 3% YTD vs 12% de la categoría, acumulando 9pp de brecha de share. El competidor principal ya tiene reunión T2T pautada para la semana que viene.", period: "YTD 2026 — Diagnóstico Cencosud", severity: "high" } },
      { type: "kpi-strip", data: { kpis: [
        { label: "Sell-in Cencosud YTD", value: "18.400 cajas", change: "+3,1%", changeType: "positive" },
        { label: "Sell-out Cencosud YTD", value: "14.200 cajas", change: "-1,4%", changeType: "negative" },
        { label: "Passthrough canal", value: "77%", change: "-4,6pp", changeType: "negative" },
        { label: "Locales con exhibición activa", value: "22 / 40", change: "-5 locales", changeType: "negative" },
        { label: "Share of shelf", value: "11,8%", change: "-1,2pp", changeType: "negative" },
        { label: "Crecimiento vs categoría", value: "+3% vs +12%", change: "-9pp de brecha", changeType: "negative" },
      ] } },
      { type: "chart", data: { chartId: "cencosud-sell-gap", type: "bar", title: "Sell-in vs Sell-out Cencosud — Mensual YTD 2026" } },
      { type: "insight-card", data: { insights: [
        { type: "alert", title: "Cencosud pierde share frente a la categoría en 9pp", description: "El mercado crece al 12% y Cencosud solo al 3%. La brecha se amplió en los últimos 2 meses. Sin acuerdo en junio, Q3 puede ser peor." },
        { type: "alert", title: "18 locales sin exhibición secundaria — espacio disponible", description: "18 locales tienen slot de exhibición disponible pero no activado. Son el mayor upside inmediato del canal." },
        { type: "warning", title: "Passthrough del 77% con riesgo de retiro de sellado", description: "Con stock inmovilizado en 12 locales, Cencosud puede pedir descuento compensatorio o frenar futuras órdenes." },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Agregar insight al proyecto", action: "add-insight" },
        { id: "a2", label: "Crear objetivo de passthrough", action: "create-goal" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Cuáles son los locales con mayor oportunidad de exhibición?", "¿Cómo está el sell-through por zona en Cencosud?", "¿Qué propuesta de inversión es la correcta para T2T?"] } },
    ]),
    userMessage("msg-007-u2", "¿Podés mostrarme el detalle de sell-through por zona y cuáles son los locales críticos en Cencosud?", "2026-05-12T09:09:00Z", "Carlos Vega"),
    richMsg("msg-007-a2", "2026-05-12T09:10:00Z", [
      { type: "executive-summary", data: { title: "Sell-Through Cencosud por Zona — Locales Críticos", summary: "Zona Sur concentra los locales con mayor brecha: 12 locales con passthrough menor al 60%. Son los mismos locales con problemas de reposición irregular. Zona Norte tiene los mejores resultados (passthrough 84%) pero es el mercado de menor volumen. La corrección de Zona Sur tiene el mayor impacto absoluto.", period: "Análisis por zona — Cencosud", severity: "high" } },
      { type: "kpi-strip", data: { kpis: [
        { label: "Zona Norte: passthrough", value: "84%", change: "+4pp vs benchmark", changeType: "positive" },
        { label: "Zona Centro: passthrough", value: "78%", change: "en línea", changeType: "neutral" },
        { label: "Zona Sur: passthrough", value: "62%", change: "-20pp vs norte", changeType: "negative" },
        { label: "Locales críticos (< 60%)", value: "12", change: "Zona Sur", changeType: "negative" },
      ] } },
      { type: "insight-card", data: { insights: [
        { type: "alert", title: "Los 12 locales críticos de Zona Sur concentran el 68% del stock inmovilizado", description: "Ruta de reposición irregular cada 18 días vs benchmark de 10 días. Un ajuste de frecuencia puede recuperar el passthrough sin inversión adicional." },
        { type: "opportunity", title: "Zona Norte lista para propuesta de sell-in incremental", description: "Con 84% de passthrough, Zona Norte puede absorber +15% de sell-in sin riesgo de acumulación. Es la palanca más segura del T2T." },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Agregar insight al proyecto", action: "add-insight" },
        { id: "a2", label: "Crear plan de acción", action: "create-plan" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Qué propuesta de acuerdo de exhibición incluimos en el T2T?", "¿Cómo estructura Nexus la narrativa de la reunión?"] } },
    ]),
    userMessage("msg-007-u3", "¿Qué nivel de inversión de trade es el correcto para proponer en el T2T y cómo justificamos el ROI?", "2026-05-12T09:18:00Z"),
    richMsg("msg-007-a3", "2026-05-12T09:19:00Z", [
      { type: "executive-summary", data: { title: "Propuesta de Inversión Trade — T2T Cencosud", summary: "La inversión recomendada es USD 42K para activar exhibición en 18 locales sin activar + corrección de ruta en Zona Sur. ROI proyectado: 2,3x en 3 meses con el escenario conservador. El modelo se basa en que los 18 locales activados promedien el passthrough de los 22 locales ya activos (78%).", period: "Simulación inversión — Q3 2026", severity: "low" } },
      { type: "kpi-strip", data: { kpis: [
        { label: "Inversión trade recomendada", value: "USD 42K", change: "activación + ruta", changeType: "neutral" },
        { label: "ROI conservador (3 meses)", value: "2,3x", change: "+USD 97K revenue", changeType: "positive" },
        { label: "Locales a activar", value: "18", change: "exhibición secundaria", changeType: "positive" },
        { label: "Passthrough esperado post-activación", value: "82%", change: "+5pp vs hoy", changeType: "positive" },
        { label: "Sell-out esperado Q3", value: "+10% vs Q2", change: "con acuerdo", changeType: "positive" },
      ] } },
      { type: "recommendations", data: { recommendations: [
        { id: "r1", title: "Proponer USD 42K condicionados a compromiso de exhibición en 18 locales", description: "Co-inversión: ACG financia trade, Cencosud compromete espacio y frecuencia de reposición en Zona Sur.", priority: "high" },
        { id: "r2", title: "KPI compartido: passthrough mínimo del 82% al cierre de Q3", description: "Si Cencosud no llega al 82%, el siguiente trimestre se revisa la inversión. Incentivo bilateral.", priority: "high" },
        { id: "r3", title: "Incluir tablero semanal de seguimiento accesible para ambas partes", description: "Nexus puede generar el reporte automático. Cencosud tiene visibilidad real. Elimina disputas de datos.", priority: "medium" },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Crear plan de acción T2T", action: "create-plan" },
        { id: "a2", label: "Agregar insight al proyecto", action: "add-insight" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Construimos los insights estratégicos para la presentación?", "¿Cuáles son las iniciativas que presentamos en el T2T?"] } },
    ]),
  ],

  // ── conv-008: Preparación presentación Top 2 Top Cencosud ─────────────────────
  "conv-008": [
    userMessage("msg-008-u1", "Vamos a preparar la presentación ejecutiva para el T2T con Cencosud. Necesito que Nexus estructure el diagnóstico completo que vamos a presentar.", "2026-05-19T14:00:00Z"),
    richMsg("msg-008-a1", "2026-05-19T14:01:00Z", [
      { type: "executive-summary", data: { title: "Estructura del Diagnóstico — Presentación T2T Cencosud", summary: "El diagnóstico para la reunión T2T debe cubrir cuatro ejes: (1) contexto de categoría y posición ACG, (2) diagnóstico operativo canal Cencosud, (3) oportunidades identificadas con datos, (4) propuesta conjunta. Los datos de ventas y sell-through disponibles permiten construir un argumento completo y basado en evidencia.", period: "T2T Cencosud — Preparación junio 2026", severity: "low" } },
      { type: "kpi-strip", data: { kpis: [
        { label: "Categoría: crecimiento", value: "+12% YTD", change: "benchmark mercado", changeType: "positive" },
        { label: "ACG en Cencosud", value: "+3% YTD", change: "-9pp vs categoría", changeType: "negative" },
        { label: "Sell-out Cencosud", value: "14.200 cajas", change: "-1,4% vs YA", changeType: "negative" },
        { label: "Locales sin exhibición", value: "18 / 40", change: "oportunidad", changeType: "negative" },
        { label: "Zona Sur: passthrough", value: "62%", change: "punto crítico", changeType: "negative" },
        { label: "Inversión propuesta", value: "USD 42K", change: "ROI 2,3x", changeType: "positive" },
      ] } },
      { type: "chart", data: { chartId: "cencosud-category-share", type: "bar", title: "ACG vs Categoría en Cencosud — Crecimiento YTD 2026" } },
      { type: "insight-card", data: { insights: [
        { type: "alert", title: "La brecha de 9pp vs categoría es el argumento central de la reunión", description: "Abrir con este dato pone a Cencosud en posición de querer mejorar. Es la palanca para negociar condiciones de exhibición." },
        { type: "opportunity", title: "Q3 estacional como ventana de acción", description: "+18% histórico en la categoría. El argumento de urgencia es temporal: si no cerramos en junio, el competidor toma posición primero." },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Agregar insight al proyecto", action: "add-insight" },
        { id: "a2", label: "Crear objetivo de proyecto", action: "create-goal" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Generamos los insights estratégicos para incluir en la presentación?", "¿Cuáles son las iniciativas que proponemos en el T2T?"] } },
    ]),
    userMessage("msg-008-u2", "Perfecto. Ahora necesito los insights estratégicos concretos que vamos a incluir en la presentación. Los más impactantes.", "2026-05-19T14:08:00Z"),
    richMsg("msg-008-a2", "2026-05-19T14:09:00Z", [
      { type: "executive-summary", data: { title: "Insights Estratégicos — T2T Cencosud", summary: "Se identificaron 4 insights de alto impacto para incluir en la presentación: la brecha de share vs categoría, la concentración del problema en Zona Sur, la oportunidad de los 18 locales sin activar y la ventana estacional de Q3. Juntos construyen el argumento de que la inversión de USD 42K tiene ROI positivo y urgencia temporal.", period: "Insights para presentación T2T", severity: "medium" } },
      { type: "insight-card", data: { insights: [
        { type: "alert", title: "Cencosud pierde 9pp de share frente a la categoría en lo que va del año", description: "El canal creció 3% vs 12% de la categoría. Sin cambio en la ejecución, la brecha se amplía. Este dato ancla el problema desde el inicio de la reunión." },
        { type: "alert", title: "12 locales de Zona Sur concentran el 68% del stock inmovilizado", description: "La causa es operativa: frecuencia de reposición cada 18 días vs benchmark de 10. La solución no requiere descuento — requiere corrección de ruta." },
        { type: "opportunity", title: "18 locales con slot de exhibición disponible equivalen a USD 97K potencial", description: "Con el passthrough actual de los locales activos (78%), activar 18 locales adicionales genera USD 97K de revenue incremental en Q3." },
        { type: "opportunity", title: "Ventana estacional: Q3 es el mejor trimestre de la categoría (+18%)", description: "El competidor ya está negociando. Cerrar el acuerdo en junio captura el momentum. Retrasar es ceder share a futuro." },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Agregar insight al proyecto", action: "add-insight" },
        { id: "a2", label: "Crear plan de acción", action: "create-plan" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Cuáles son las iniciativas estratégicas que proponemos?", "¿Cómo cerramos la narrativa de la presentación?"] } },
    ]),
    userMessage("msg-008-u3", "Ahora armá las iniciativas estratégicas que proponemos al equipo de Cencosud. Que sean concretas, con dueños y KPIs.", "2026-05-19T14:16:00Z", "Lucía Romero"),
    richMsg("msg-008-a3", "2026-05-19T14:17:00Z", [
      { type: "executive-summary", data: { title: "Iniciativas Estratégicas — Propuesta T2T Cencosud Q3 2026", summary: "Se proponen 3 iniciativas conjuntas ACG-Cencosud para Q3: activación de exhibición en 18 locales, corrección de ruta en Zona Sur y acuerdo de sell-out compartido. Las tres son medibles, tienen dueños claros y se justifican con los datos del diagnóstico.", period: "Plan conjunto — Q3 2026", severity: "low" } },
      { type: "strategic-initiatives", data: {
        title: "Propuesta T2T — Iniciativas Conjuntas ACG + Cencosud",
        objective: "Crecer +10% sell-out en Cencosud para Q3 2026, superar el 82% de passthrough y capturar USD 97K de revenue incremental",
        initiatives: [
          { id: "ini1", title: "Activación de exhibición en 18 locales Cencosud — acuerdo de co-inversión", description: "ACG co-financia USD 42K de trade. Cencosud compromete espacio en 18 locales de Zona Centro y Zona Norte. KPI compartido: passthrough ≥ 82% al 30/09. Tablero quincenal de seguimiento compartido.", owner: "Mauro Celani", dueDate: "2026-07-15", priority: "high", kpi: "18 locales activados + passthrough 82%", area: "Ventas" },
          { id: "ini2", title: "Corrección de ruta de reposición en Zona Sur — de 18 a 10 días", description: "Cencosud se compromete a aumentar la frecuencia de reposición en 12 locales de Zona Sur. ACG apoya con forecast de demanda quincenal. Costo operativo en Cencosud, sin inversión adicional de trade.", owner: "Carlos Vega", dueDate: "2026-06-30", priority: "high", kpi: "Passthrough Zona Sur ≥ 75% al 31/07", area: "Sell-Through" },
          { id: "ini3", title: "Acuerdo de sell-out compartido Q3: objetivo +10% vs Q3 2025", description: "Cencosud se compromete a un target de sell-out Q3. A cambio, ACG garantiza disponibilidad de producto, prioridad en exhibición y soporte de trade. Revisión mensual compartida.", owner: "Lucía Romero", dueDate: "2026-09-30", priority: "medium", kpi: "Sell-out +10% Q3 Cencosud", area: "Ventas" },
        ],
      } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Agregar insight al proyecto", action: "add-insight" },
        { id: "a2", label: "Crear plan de acción", action: "create-plan" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Generamos la presentación ejecutiva ahora?", "¿Hay algo más que ajustar antes de cerrar el deck?"] } },
    ]),
    userMessage("msg-008-u4", "Excelente. Diagnóstico, insights e iniciativas están aprobados. Generá la presentación ejecutiva para el T2T.", "2026-05-19T14:24:00Z"),
    richMsg("msg-008-a4", "2026-05-19T14:25:00Z", [
      { type: "executive-summary", data: { title: "Presentación T2T Cencosud — Lista para Generar", summary: "El material está completo y validado: diagnóstico con 4 datos clave, 4 insights estratégicos de alto impacto y 3 iniciativas conjuntas con dueños, KPIs y fechas. La narrativa está estructurada para una reunión ejecutiva de 45 minutos: 10 min de diagnóstico, 15 min de insights y evidencia, 15 min de propuesta conjunta y 5 min de cierre.", period: "Presentación ejecutiva — T2T Cencosud · Junio 2026", severity: "low" } },
      { type: "kpi-strip", data: { kpis: [
        { label: "Diapositivas estructuradas", value: "8", change: "listas para generar", changeType: "positive" },
        { label: "Datos incluidos", value: "4 KPIs clave", change: "diagnóstico validado", changeType: "positive" },
        { label: "Insights estratégicos", value: "4 insights", change: "aprobados", changeType: "positive" },
        { label: "Iniciativas propuestas", value: "3 iniciativas", change: "con dueños y KPIs", changeType: "positive" },
        { label: "Inversión propuesta", value: "USD 42K", change: "ROI 2,3x", changeType: "positive" },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a0", label: "Generar presentación ejecutiva", action: "generate-deck" },
        { id: "a1", label: "Crear plan de seguimiento", action: "create-plan" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Cuál es la posición mínima de cierre en la reunión?", "¿Cómo hacemos el seguimiento post T2T?"] } },
    ]),
  ],

  // ── conv-009: Plan de reposición y seguimiento semanal ────────────────────────
  "conv-009": [
    userMessage("msg-009-u1", "Necesito estructurar el plan de reposición semanal para las cadenas regionales. ¿Cómo debería funcionar el proceso?", "2026-05-20T09:00:00Z", "Carlos Vega"),
    richMsg("msg-009-a1", "2026-05-20T09:01:00Z", [
      { type: "executive-summary", data: { title: "Plan de Reposición Semanal — Cadenas Regionales", summary: "Un plan de reposición eficiente para cadenas regionales requiere tres elementos: frecuencia de visita óptima por zona, forecast de demanda por SKU y PDV, y un sistema de alerta temprana para quiebres. Con los datos actuales, la mayor oportunidad está en reducir la frecuencia de reposición en Zona Sur (de 18 a 10 días) y en establecer un umbral de stock mínimo por PDV.", period: "Plan operativo — Q3 2026", severity: "medium" } },
      { type: "kpi-strip", data: { kpis: [
        { label: "Frecuencia actual Zona Sur", value: "c/ 18 días", change: "fuera de benchmark", changeType: "negative" },
        { label: "Frecuencia benchmark", value: "c/ 10 días", change: "objetivo", changeType: "positive" },
        { label: "PDVs con quiebre recurrente", value: "23", change: "Zona Sur", changeType: "negative" },
        { label: "Días de stock mínimo recomendado", value: "7 días", change: "por PDV", changeType: "neutral" },
      ] } },
      { type: "recommendations", data: { recommendations: [
        { id: "r1", title: "Aumentar frecuencia de visita en Zona Sur de 18 a 10 días", description: "El costo operativo para el distribuidor es menor al impacto en revenue por quiebres recuperados. El argumento con Cencosud: compromiso compartido.", priority: "high" },
        { id: "r2", title: "Definir stock mínimo por PDV según rotación histórica", description: "Los 23 PDVs con quiebre recurrente tienen en común un stock de ciclo menor a 5 días. Un mínimo de 7 días cierra el 80% de los quiebres.", priority: "high" },
        { id: "r3", title: "Alerta automática cuando stock cae por debajo del mínimo", description: "Nexus puede monitorear el indicador semanal y enviar alerta al KAM responsable de zona antes de que se produzca el quiebre.", priority: "medium" },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Crear plan de reposición", action: "create-plan" },
        { id: "a2", label: "Crear objetivo de quiebres", action: "create-goal" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Cuánto tiempo llevaría implementar el cambio de frecuencia?", "¿Cómo hacemos el seguimiento semanal del plan?"] } },
    ]),
    userMessage("msg-009-u2", "¿Cómo debería ser el tablero de seguimiento semanal para que sea accionable y no solo informativo?", "2026-05-20T09:10:00Z", "Carlos Vega"),
    richMsg("msg-009-a2", "2026-05-20T09:11:00Z", [
      { type: "recommendations", data: { recommendations: [
        { id: "r1", title: "Semáforo semanal por zona: verde/amarillo/rojo según passthrough", description: "Verde: passthrough > 75%. Amarillo: 60–75% (revisar ruta). Rojo: < 60% (acción inmediata en 48h).", priority: "high" },
        { id: "r2", title: "Top 5 PDVs críticos cada lunes en el reporte de campo", description: "El KAM recibe los 5 PDVs con mayor deterioro de passthrough o quiebre en la semana. Tiene 48 horas para resolver.", priority: "high" },
        { id: "r3", title: "Revisión quincenal de cobertura con distribuidor", description: "Compartir el tablero de cobertura por zona con el distribuidor cada 15 días. Los datos compartidos generan responsabilidad de las dos partes.", priority: "medium" },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Crear plan de seguimiento", action: "create-plan" },
        { id: "a2", label: "Crear objetivo de reposición", action: "create-goal" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Arrancamos la implementación esta semana?", "¿Cómo extendemos el modelo a nuevas zonas en Q4?"] } },
    ]),
  ],

  // ── conv-010: Construcción de insights estratégicos Cencosud ──────────────────
  "conv-010": [
    userMessage("msg-010-u1", "Antes de armar la presentación T2T, necesito construir los insights estratégicos con el cruce de datos de ventas y sell-through de Cencosud.", "2026-05-17T10:00:00Z"),
    richMsg("msg-010-a1", "2026-05-17T10:01:00Z", [
      { type: "executive-summary", data: { title: "Cruce Ventas + Sell-Through — Insights Estratégicos Cencosud", summary: "El cruce de datos de sell-in con sell-through por local revela tres patrones críticos: los locales A de Cencosud tienen passthrough 20pp mayor que los locales B (83% vs 63%), la inversión de trade actual no está concentrada en los locales de mayor rotación, y la corrección de ruta en Zona Sur tiene más impacto que un descuento lineal.", period: "Cruce datos ventas + sell-through — Mayo 2026", severity: "high" } },
      { type: "chart", data: { chartId: "cencosud-locales-passthrough", type: "bar", title: "Passthrough por Tipo de Local — Cencosud YTD 2026" } },
      { type: "insight-card", data: { insights: [
        { type: "alert", title: "Locales A vs B: 20pp de brecha de passthrough sin justificación de demanda", description: "Los locales A no tienen mayor sell-in proporcional, pero sí 20pp más de passthrough. La diferencia es la frecuencia de reposición y la exhibición secundaria, no la demanda del shopper." },
        { type: "alert", title: "El 60% de la inversión de trade va a locales con passthrough ya alto", description: "La inversión actual está concentrada en locales que ya funcionan bien. Redirigir el 40% a locales B y Zona Sur puede tener 3x más impacto." },
        { type: "opportunity", title: "Zona Norte: único segmento listo para sell-in incremental sin riesgo", description: "Passthrough 84%, sin quiebres, distribuidor confiable. Un incremento de sell-in del 15% en Zona Norte no tiene riesgo de acumulación." },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Agregar insight al proyecto", action: "add-insight" },
        { id: "a2", label: "Crear objetivo de trade", action: "create-goal" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Cómo presentamos el dato de concentración de trade en la reunión T2T?", "¿Qué acción concreta proponemos para redirigir la inversión?"] } },
    ]),
    userMessage("msg-010-u2", "El dato de que el 60% del trade va a locales que ya funcionan es muy fuerte. ¿Cómo lo presentamos en el T2T sin que suene a crítica interna?", "2026-05-17T10:12:00Z"),
    richMsg("msg-010-a2", "2026-05-17T10:13:00Z", [
      { type: "recommendations", data: { recommendations: [
        { id: "r1", title: "Presentar como 'oportunidad de optimización', no como error", description: "Framing correcto: 'Identificamos que tenemos margen para hacer más con el mismo presupuesto redirigiendo el foco'. Eso abre la conversación sin defensas.", priority: "high" },
        { id: "r2", title: "Usar los locales A como benchmark positivo, no como contraste", description: "Mostrar primero qué funciona (locales A, Zona Norte), luego mostrar la brecha como potencial no capturado. El buyer de Cencosud ve la oportunidad, no la falla.", priority: "high" },
        { id: "r3", title: "Proponer la redistribución como parte del acuerdo de co-inversión", description: "El movimiento del trade hacia locales B se convierte en una iniciativa conjunta, no en una decisión unilateral. Cencosud co-diseña la solución.", priority: "medium" },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Agregar insight al proyecto", action: "add-insight" },
        { id: "a2", label: "Crear plan de presentación", action: "create-plan" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Cuándo pasamos a armar la presentación completa?", "¿Faltan datos para completar el deck?"] } },
    ]),
  ],

  // ── conv-brief-001: Configuración inicial del proyecto ──────────────────────
  "conv-brief-001": [
    // Turno 1: usuario pide configurar → Nexus pregunta por el problema
    userMessage("msg-brief-u1", "Ayudame a configurar este proyecto", "2026-06-01T09:00:00Z"),
    chatMsg("msg-brief-a1", "Perfecto. Antes de crear objetivos, iniciativas o planes de acción, necesito entender el contexto del proyecto.\n\nEmpecemos por el problema comercial. ¿Qué situación querés resolver?", "2026-06-01T09:01:00Z", [
      { type: "follow-up-questions", data: { questions: [
        "Tenemos una caída de ventas",
        "Tenemos una caída de rentabilidad",
        "Tenemos una baja cobertura",
        "Tenemos pérdida de share",
      ] } },
    ]),

    // Turno 2: usuario describe el problema → Nexus reformula y pregunta hipótesis
    userMessage("msg-brief-u2", "Tenemos una caída de ventas", "2026-06-01T09:03:00Z"),
    chatMsg("msg-brief-a2", "Entendido. El problema preliminar sería: caída sostenida de ventas y sell-out, con impacto en volumen, rotación y performance comercial.\n\nAhora necesito entender la hipótesis. ¿Por qué creés que está ocurriendo esta caída?", "2026-06-01T09:04:00Z", [
      { type: "follow-up-questions", data: { questions: [
        "Creemos que es un problema de cobertura",
        "Creemos que es un problema de ejecución",
        "Creemos que es un problema de precios",
        "Creemos que es un problema de seguimiento",
      ] } },
    ]),

    // Turno 3: usuario da la hipótesis → Nexus reformula y pregunta estrategia
    userMessage("msg-brief-u3", "Creemos que es un problema de cobertura", "2026-06-01T09:06:00Z"),
    chatMsg("msg-brief-a3", "Perfecto. La hipótesis preliminar sería que la caída de ventas está asociada a cobertura insuficiente, ejecución inconsistente en PDVs y falta de seguimiento sistemático por cadena.\n\nAhora definamos la estrategia. ¿Qué enfoque querés usar para resolverlo?", "2026-06-01T09:07:00Z", [
      { type: "follow-up-questions", data: { questions: [
        "Hacer diagnóstico comercial",
        "Recuperar cobertura",
        "Optimizar ejecución",
        "Implementar seguimiento semanal",
      ] } },
    ]),

    // Turno 4: usuario da la estrategia → Nexus propone brief completo + acción
    userMessage("msg-brief-u4", "Hacer diagnóstico comercial", "2026-06-01T09:09:00Z"),
    richMsg("msg-brief-a4", "2026-06-01T09:10:00Z", [
      { type: "executive-summary", data: {
        title: "Brief del proyecto — Propuesta completa",
        summary: "Con base en lo que compartiste, preparé el brief completo del proyecto. Cubre las cuatro dimensiones: problema, hipótesis, estrategia y resultado esperado. Confirmalo para guardarlo en el resumen del proyecto.",
        period: "Brief inicial — Junio 2026",
        severity: "low",
      } },
      { type: "brief-proposal", data: {
        problem: "Caída sostenida de ventas y sell-out en cadenas regionales, afectando volumen, rotación y performance comercial en puntos de venta clave.",
        hypothesis: "La caída está asociada a cobertura insuficiente, ejecución comercial inconsistente en PDVs y falta de seguimiento sistemático por cadena.",
        strategy: "Realizar un diagnóstico comercial, recuperar la cobertura en PDVs críticos y ejecutar un plan de activación con seguimiento semanal por owner.",
        expectedOutcome: "Recuperar la dinámica de ventas, mejorar la ejecución en PDVs críticos y construir un sistema de seguimiento que permita acelerar decisiones comerciales.",
      } },
      { type: "action-plan", data: { actions: [
        { id: "a-brief-complete", label: "Completar brief", action: "complete-brief" },
      ] } },
      { type: "follow-up-questions", data: { questions: [
        "¿Querés que armemos los objetivos del proyecto?",
        "¿Querés que transformemos esto en un plan de acción?",
        "¿Querés que identifiquemos los principales riesgos?",
        "¿Querés preparar una presentación ejecutiva?",
      ] } },
    ]),

    // Alias: consulta "Ayudame a completar el brief inicial" → inicia el workshop
    userMessage("msg-brief-u5", "Ayudame a completar el brief inicial del proyecto", "2026-06-01T09:15:00Z"),
    chatMsg("msg-brief-a5", "Perfecto. Para completar el brief necesito primero entender el contexto del proyecto.\n\nEmpecemos por el problema comercial. ¿Qué situación querés resolver?", "2026-06-01T09:16:00Z", [
      { type: "follow-up-questions", data: { questions: [
        "Tenemos una caída de ventas",
        "Tenemos una caída de rentabilidad",
        "Tenemos una baja cobertura",
        "Tenemos pérdida de share",
      ] } },
    ]),
  ],

  // ── conv-011: Iniciativas estratégicas Cencosud Q3 ───────────────────────────
  "conv-011": [
    userMessage("msg-011-u1", "Vamos a definir exactamente qué pedimos y qué ofrecemos en el T2T. Necesito las iniciativas con números claros.", "2026-05-18T15:00:00Z", "Lucía Romero"),
    richMsg("msg-011-a1", "2026-05-18T15:01:00Z", [
      { type: "executive-summary", data: { title: "Posición de Negociación ACG — T2T Cencosud", summary: "La posición de negociación se estructura en tres niveles: posición de apertura (máximo), posición objetivo (realista) y posición mínima de cierre. El objetivo es cerrar el acuerdo de exhibición en 18 locales con inversión de USD 42K y compromiso de passthrough del 82%. La posición mínima es 12 locales y passthrough del 78%.", period: "Posición negociación — T2T junio 2026", severity: "low" } },
      { type: "kpi-strip", data: { kpis: [
        { label: "Posición apertura: locales", value: "22 locales", change: "apertura", changeType: "positive" },
        { label: "Objetivo: locales", value: "18 locales", change: "posición realista", changeType: "positive" },
        { label: "Mínimo: locales", value: "12 locales", change: "piso de cierre", changeType: "neutral" },
        { label: "Trade propuesto", value: "USD 42K", change: "co-inversión", changeType: "neutral" },
        { label: "Trade mínimo aceptable", value: "USD 28K", change: "12 locales", changeType: "neutral" },
        { label: "KPI compartido objetivo", value: "Passthrough 82%", change: "al 30/09", changeType: "positive" },
      ] } },
      { type: "insight-card", data: { insights: [
        { type: "opportunity", title: "Cencosud tiene incentivo de share para cerrar", description: "Con la categoría creciendo al 12% y Cencosud al 3%, el buyer tiene presión interna. ACG llega con solución, no con pedido." },
        { type: "warning", title: "No ceder en la condición de exhibición — es el punto no negociable", description: "El trade sin exhibición no tiene ROI. Si Cencosud no puede garantizar el espacio, la inversión no se activa. Eso debe quedar claro en la apertura." },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Crear plan de negociación", action: "create-plan" },
        { id: "a2", label: "Agregar insight al proyecto", action: "add-insight" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Listo para generar la presentación final?", "¿Qué aprobaciones internas necesitamos antes de la reunión?"] } },
    ]),
    userMessage("msg-011-u2", "¿Qué aprobaciones internas necesitamos cerrar antes de llegar al T2T? No quiero llegar a la reunión sin el respaldo de Finanzas y RGM.", "2026-05-18T15:11:00Z", "Lucía Romero"),
    richMsg("msg-011-a2", "2026-05-18T15:12:00Z", [
      { type: "recommendations", data: { recommendations: [
        { id: "r1", title: "Aprobación de Finanzas: USD 42K de trade con ROI mínimo de 2x", description: "El modelo de ROI 2,3x conservador ya está documentado. Presentar a Finanzas antes del 05/06 para tener aprobación antes de la reunión T2T.", priority: "high" },
        { id: "r2", title: "Alineación con RGM: precio neto y condiciones de exhibición", description: "Revenue Manager debe validar que el -4% condicional está dentro de los parámetros de price index. Reunión de 30 minutos con Lucía Romero antes del 03/06.", priority: "high" },
        { id: "r3", title: "Brief al KAM de Cencosud: no revelar posición mínima antes de la reunión", description: "El KAM puede filtrar la posición al buyer. El brief debe incluir solo la posición de apertura y el objetivo. La posición mínima queda interna.", priority: "medium" },
      ] } },
      { type: "action-plan", data: { actions: [
        { id: "a1", label: "Crear plan de aprobaciones", action: "create-plan" },
        { id: "a2", label: "Crear objetivo de negociación", action: "create-goal" },
      ] } },
      { type: "follow-up-questions", data: { questions: ["¿Pasamos a generar la presentación T2T?", "¿Necesitamos ajustar algo antes del deck final?"] } },
    ]),
  ],
};

// ─── Demo action plans ─────────────────────────────────────────────────────────

export const DEMO_ACTION_PLANS: ActionPlan[] = [
  {
    id: "plan-demo-001",
    name: "Activar rotación Espumante — Canal Supermercados",
    objective: "Incrementar passthrough de 82,3% a 90% en Carrefour, Coto y Jumbo mediante activación en góndola y negociación de exhibición secundaria",
    insightOrigin: "Diagnóstico integral de ventas YTD 2026",
    owner: "Mauro Celani",
    priority: "high",
    targetDate: "2026-06-30",
    status: "active",
    items: [
      { id: "pi-001-1", label: "Negociar 2 frentes adicionales en góndola en 45 tiendas A/B", done: true },
      { id: "pi-001-2", label: "Implementar isla Espumante Brut en 20 hipermercados priority", done: true },
      { id: "pi-001-3", label: "Auditar stock en depósitos y acordar plan de reposición acelerada", done: false },
      { id: "pi-001-4", label: "Activar promo 2x1 en semanas 22–23 para liberar stock acumulado", done: false },
      { id: "pi-001-5", label: "Revisión semanal de passthrough por tienda con equipo trade", done: false },
    ],
    projectId: "proj-002",
    goalId: "g1",
    conversationId: "conv-001",
    area: "Ventas",
    createdAt: "2026-05-16T09:14:00Z",
    updatedAt: "2026-05-18T10:00:00Z",
  },
  {
    id: "plan-demo-002",
    name: "Benchmark de precios — Ajuste Price Index Q2",
    objective: "Corregir Price Index de 0,93 a 0,98–1,02 en canal moderno para recuperar competitividad sin destruir margen",
    insightOrigin: "Análisis de precios y competencia",
    owner: "Lucía Romero",
    priority: "medium",
    targetDate: "2026-06-15",
    status: "active",
    items: [
      { id: "pi-002-1", label: "Validar elasticidad precio en 3 cadenas (piloto semana 21)", done: true },
      { id: "pi-002-2", label: "Presentar simulación al equipo RGM para aprobación", done: false },
      { id: "pi-002-3", label: "Coordinar con Trade Marketing los materiales de precio sugerido", done: false },
      { id: "pi-002-4", label: "Monitorear respuesta de competidores en primeras 2 semanas", done: false },
    ],
    projectId: "proj-002",
    goalId: "g4",
    conversationId: "conv-002",
    area: "RGM",
    createdAt: "2026-05-15T14:12:00Z",
    updatedAt: "2026-05-17T09:00:00Z",
  },
  {
    id: "plan-demo-003",
    name: "Activación de exhibición — 120 tiendas Carrefour",
    objective: "Ampliar exhibición activa de 48 a 120 tiendas Carrefour para capturar el pico estacional de Q3 (+18% histórico)",
    insightOrigin: "Trade marketing y ejecución — simulación ROI",
    owner: "Diego Pereira",
    priority: "high",
    targetDate: "2026-07-31",
    status: "active",
    items: [
      { id: "pi-003-1", label: "Pedir materiales POP antes del 27/05 (lead time 2 semanas)", done: false },
      { id: "pi-003-2", label: "Activar ola 1: 30 tiendas A/B de mayor volumen antes del 10/06", done: false },
      { id: "pi-003-3", label: "Evaluar passthrough en tiendas ola 1 al día 14 (go/no-go ola 2)", done: false },
      { id: "pi-003-4", label: "Activar ola 2: 42 tiendas restantes si passthrough ≥ 75% en ola 1", done: false },
      { id: "pi-003-5", label: "Checkpoint ejecutivo semana 28: resultados y ajustes", done: false },
    ],
    projectId: "proj-002",
    goalId: "g2",
    conversationId: "conv-003",
    area: "Trade Marketing",
    createdAt: "2026-05-14T10:13:00Z",
    updatedAt: "2026-05-14T10:13:00Z",
  },
];

import type { LandingScenario, LandingSignal } from "@/types/landing";

export const LANDING_BOOT_MESSAGES = [
  "Inicializando motor comercial",
  "Conectando contexto empresarial",
  "Preparando inteligencia operativa",
];

export const LANDING_FOOTER_SIGNALS: LandingSignal[] = [
  { label: "Datos conectados" },
  { label: "Analisis trazable" },
  { label: "Decisiones accionables" },
];

export const LANDING_SCENARIOS: LandingScenario[] = [
  {
    id: "ventas-canal",
    question: "Por que cayeron mis ventas?",
    thinkingSteps: [
      "Interpretando contexto comercial",
      "Analizando senales de sell-out",
      "Generando recomendaciones",
    ],
    answer:
      "Las ventas cayeron por menor rotacion en canal moderno y quiebres de stock en SKUs clave. Tres clientes concentran el 70% del impacto.",
    actions: [
      "Revisar cobertura en SKUs criticos",
      "Activar recuperacion en canal moderno",
    ],
    kpis: [
      { label: "SELL-OUT", value: "-8.4%", color: "danger" },
      { label: "STOCK-OUT", value: "+22 bps", color: "warning" },
      { label: "PRICE INDEX", value: "+5.1%", color: "info" },
      { label: "PASSTHROUGH", value: "82.5%", color: "primarySoft" },
    ],
    ecosystemCards: [
      { tag: "SELL-OUT", value: "-8.4%", color: "danger" },
      { tag: "CHANNEL RISK", value: "Canal bajo", color: "warning" },
      { tag: "PASSTHROUGH", value: "82.5%", color: "primarySoft" },
      { tag: "PRICE INDEX", value: "+5.1%", color: "info" },
      { tag: "STOCK-OUT", value: "+22 bps", color: "warning" },
      { tag: "ACTION PLAN", value: "Activado", color: "success" },
    ],
  },
  {
    id: "margen-clientes",
    question: "Que clientes destruyen margen?",
    thinkingSteps: [
      "Cargando datos de rentabilidad",
      "Identificando cuentas criticas",
      "Calculando impacto por cliente",
    ],
    answer:
      "El deterioro de margen se concentra en clientes con alto gasto promocional y bajo passthrough. Tres cuentas explican el 80% de la perdida.",
    actions: [
      "Renegociar condiciones en cuentas criticas",
      "Redefinir trade terms para mejorar Promo ROI",
    ],
    kpis: [
      { label: "EBITDA", value: "-3.2 pp", color: "danger" },
      { label: "TRADE SPEND", value: "+18%", color: "warning" },
      { label: "MARGIN GAP", value: "-6.1 pp", color: "danger" },
      { label: "PROMO ROI", value: "0.72x", color: "primarySoft" },
    ],
    ecosystemCards: [
      { tag: "MARGIN ALERT", value: "-3.2 pp", color: "danger" },
      { tag: "TRADE SPEND", value: "+18%", color: "warning" },
      { tag: "PROMO ROI", value: "0.72x", color: "primarySoft" },
      { tag: "MARGIN GAP", value: "-6.1 pp", color: "danger" },
      { tag: "EBITDA", value: "-3.2 pp", color: "danger" },
      { tag: "RECOMMENDATION", value: "Generada", color: "success" },
    ],
  },
  {
    id: "riesgo-quiebre",
    question: "Donde tengo riesgo de quiebre?",
    thinkingSteps: [
      "Analizando cobertura de inventario",
      "Identificando SKUs en riesgo",
      "Estimando impacto operativo",
    ],
    answer:
      "Cuatro SKUs de alta rotacion tienen cobertura inferior a 9 dias con presion de demanda creciente. El riesgo es inmediato.",
    actions: [
      "Priorizar reposicion en SKUs con menos de 7 dias",
      "Coordinar con logistica para mejorar OTIF",
    ],
    kpis: [
      { label: "COVERAGE", value: "8.2 dias", color: "warning" },
      { label: "OTIF", value: "91.4%", color: "primarySoft" },
      { label: "INV. RISK", value: "Alto", color: "danger" },
      { label: "DEMAND", value: "+12%", color: "info" },
    ],
    ecosystemCards: [
      { tag: "INV. WARNING", value: "8.2 dias", color: "warning" },
      { tag: "OTIF", value: "91.4%", color: "primarySoft" },
      { tag: "INVENTORY RISK", value: "Alto", color: "danger" },
      { tag: "DEMAND PRESSURE", value: "+12%", color: "info" },
      { tag: "COVERAGE AVG", value: "8.2 dias", color: "warning" },
      { tag: "SKUs AT RISK", value: "4 SKUs", color: "danger" },
    ],
  },
  {
    id: "oportunidades",
    question: "Que oportunidades de crecimiento tengo?",
    thinkingSteps: [
      "Analizando elasticidad y penetracion",
      "Identificando cuentas con potencial",
      "Calculando upside de crecimiento",
    ],
    answer:
      "Hay un upside de +11% en clientes con baja penetracion y elasticidad favorable. El potencial no capturado supera USD 420K.",
    actions: [
      "Activar plan en cuentas con alta elasticidad",
      "Desarrollar propuesta para cuentas subpenetradas",
    ],
    kpis: [
      { label: "UPSIDE", value: "+11%", color: "success" },
      { label: "PEN. GAP", value: "-7.8 pp", color: "warning" },
      { label: "ELASTICITY", value: "Favorable", color: "success" },
      { label: "OPPORTUNITY", value: "USD 420K", color: "info" },
    ],
    ecosystemCards: [
      { tag: "GROWTH UPSIDE", value: "+11%", color: "success" },
      { tag: "PEN. GAP", value: "-7.8 pp", color: "warning" },
      { tag: "OPPORTUNITY", value: "USD 420K", color: "success" },
      { tag: "ELASTICITY", value: "Favorable", color: "success" },
      { tag: "REVENUE IMPACT", value: "USD 420K", color: "info" },
      { tag: "INITIATIVE", value: "Priority", color: "success" },
    ],
  },
  {
    id: "passthrough",
    question: "Como viene el passthrough?",
    thinkingSteps: [
      "Revisando ejecucion de precios",
      "Identificando brechas por canal",
      "Evaluando impacto en margen",
    ],
    answer:
      "El passthrough esta 7.5 pp por debajo del objetivo. El ajuste de lista no se traslado al canal en cuentas sensibles.",
    actions: [
      "Monitorear ejecucion de precio semanalmente",
      "Priorizar canales con mayor gap de traslado",
    ],
    kpis: [
      { label: "PASSTHROUGH", value: "82.5%", color: "primarySoft" },
      { label: "TARGET", value: "90%", color: "success" },
      { label: "GAP", value: "-7.5 pp", color: "danger" },
      { label: "EXECUTION", value: "Media", color: "warning" },
    ],
    ecosystemCards: [
      { tag: "PASSTHROUGH", value: "82.5%", color: "primarySoft" },
      { tag: "PRICE GAP", value: "-7.5 pp", color: "danger" },
      { tag: "TARGET", value: "90%", color: "success" },
      { tag: "EXECUTION", value: "Media", color: "warning" },
      { tag: "PRICE OPP.", value: "Detectada", color: "info" },
      { tag: "TRACKING", value: "Activo", color: "primarySoft" },
    ],
  },
  {
    id: "riesgos-comerciales",
    question: "Cuales son los principales riesgos comerciales?",
    thinkingSteps: [
      "Escaneando senales de riesgo",
      "Evaluando impacto por canal",
      "Priorizando alertas criticas",
    ],
    answer:
      "Se identifican tres riesgos prioritarios: caida de cobertura en SKUs clave, deterioro de margen en cuentas top y debilitamiento del canal moderno.",
    actions: [
      "Activar plan de contingencia en SKUs criticos",
      "Revisar estructura de descuentos en cuentas top",
    ],
    kpis: [
      { label: "RISK SCORE", value: "Alto", color: "danger" },
      { label: "SKUs AT RISK", value: "4", color: "warning" },
      { label: "MARGIN AT RISK", value: "USD 280K", color: "danger" },
      { label: "COVERAGE AVG", value: "8.2 dias", color: "warning" },
    ],
    ecosystemCards: [
      { tag: "RISK SCORE", value: "Alto", color: "danger" },
      { tag: "SKUs AT RISK", value: "4 SKUs", color: "warning" },
      { tag: "MARGIN AT RISK", value: "USD 280K", color: "danger" },
      { tag: "CHANNEL RISK", value: "Moderno bajo", color: "warning" },
      { tag: "COVERAGE", value: "8.2 dias", color: "warning" },
      { tag: "ACTION PLAN", value: "Urgente", color: "success" },
    ],
  },
];

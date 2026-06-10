export const MARKETING_KPIS = {
  inversionTotal: { value: 2_100_000, change: 8.3, changeType: "positive" as const },
  roiCampanas: { value: 3.2, change: 0.4, changeType: "positive" as const },
  marketShare: { value: 18.4, change: 1.2, changeType: "positive" as const },
  penetracionHogares: { value: 42.1, change: 2.8, changeType: "positive" as const },
};

export type CampaignStatus = "active" | "planned" | "completed";
export type CampaignMedium = "TV" | "Digital" | "OOH" | "In-store" | "Radio" | "Influencer";

export interface Campaign {
  id: string;
  name: string;
  brand: string;
  medium: CampaignMedium;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  investment: number;
  reach: number;
  roi: number;
  objective: string;
}

export const CAMPAIGNS: Campaign[] = [
  {
    id: "c-001",
    name: "Andes Verano 2026",
    brand: "Andes Lager",
    medium: "TV",
    status: "active",
    startDate: "2026-01-15",
    endDate: "2026-03-31",
    investment: 480_000,
    reach: 4_200_000,
    roi: 3.8,
    objective: "Awareness temporada verano",
  },
  {
    id: "c-002",
    name: "Lanzamiento Andes Cero",
    brand: "Andes Cero",
    medium: "Digital",
    status: "active",
    startDate: "2026-02-01",
    endDate: "2026-06-30",
    investment: 220_000,
    reach: 2_800_000,
    roi: 4.2,
    objective: "Penetración segmento 0% alcohol",
  },
  {
    id: "c-003",
    name: "Andes en el Asado",
    brand: "Andes Lager",
    medium: "In-store",
    status: "active",
    startDate: "2026-03-01",
    endDate: "2026-05-31",
    investment: 150_000,
    reach: 680_000,
    roi: 2.1,
    objective: "Activación punto de venta",
  },
  {
    id: "c-004",
    name: "Awareness Andes Premium",
    brand: "Andes Premium",
    medium: "TV",
    status: "active",
    startDate: "2026-04-01",
    endDate: "2026-07-31",
    investment: 310_000,
    reach: 3_100_000,
    roi: 1.9,
    objective: "Reposicionamiento premium",
  },
  {
    id: "c-005",
    name: "Trade Summer 2025",
    brand: "Andes Lager",
    medium: "OOH",
    status: "completed",
    startDate: "2025-11-01",
    endDate: "2026-01-31",
    investment: 180_000,
    reach: 1_900_000,
    roi: 2.4,
    objective: "Visibilidad verano 2025-2026",
  },
  {
    id: "c-006",
    name: "Lanzamiento Portfolio Lite",
    brand: "Andes Lite",
    medium: "Influencer",
    status: "completed",
    startDate: "2025-09-01",
    endDate: "2025-12-31",
    investment: 95_000,
    reach: 1_400_000,
    roi: 5.1,
    objective: "Penetración Gen Z",
  },
  {
    id: "c-007",
    name: "Q3 Brand Boost",
    brand: "Andes Premium",
    medium: "TV",
    status: "planned",
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    investment: 280_000,
    reach: 0,
    roi: 2.8,
    objective: "Mantener awareness Q3",
  },
  {
    id: "c-008",
    name: "Influencer Creator Pack",
    brand: "Andes Cero",
    medium: "Influencer",
    status: "planned",
    startDate: "2026-06-15",
    endDate: "2026-08-31",
    investment: 65_000,
    reach: 0,
    roi: 6.2,
    objective: "Escalar tracción digital",
  },
];

export const INVERSION_POR_MEDIO = [
  { medio: "TV", inversion: 780_000, pct: 37 },
  { medio: "Digital", inversion: 590_000, pct: 28 },
  { medio: "OOH", inversion: 380_000, pct: 18 },
  { medio: "In-store", inversion: 220_000, pct: 10 },
  { medio: "Radio", inversion: 130_000, pct: 6 },
];

export const ROI_POR_MEDIO = [
  { medio: "Influencer", roi: 5.6 },
  { medio: "Digital", roi: 4.2 },
  { medio: "OOH", roi: 2.4 },
  { medio: "In-store", roi: 2.1 },
  { medio: "TV", roi: 1.9 },
  { medio: "Radio", roi: 1.4 },
];

export const MARKET_SHARE_TREND = {
  labels: ["May'25", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene'26", "Feb", "Mar", "Abr", "May"],
  values: [16.8, 17.1, 17.3, 17.5, 17.8, 17.6, 17.9, 18.1, 18.2, 18.0, 18.3, 18.4, 18.4],
  competitor: [22.1, 21.9, 22.0, 21.8, 21.5, 21.7, 21.4, 21.2, 21.0, 20.8, 20.9, 20.7, 20.5],
};

export const PENETRACION_POR_CANAL = [
  { canal: "Bares y Rest.", penetracion: 61.4, target: 65 },
  { canal: "Supermercados", penetracion: 54.2, target: 55 },
  { canal: "Almacenes", penetracion: 38.7, target: 45 },
  { canal: "Est. de Servicio", penetracion: 29.3, target: 35 },
  { canal: "Online", penetracion: 22.1, target: 30 },
];

export const BRAND_TRACKING = {
  brandAwareness: { value: 71.2, change: 3.1, changeType: "positive" as const },
  shareOfVoice: { value: 22.8, change: -0.5, changeType: "negative" as const },
  nps: { value: 42, change: 6, changeType: "positive" as const },
  brandPreference: { value: 31.4, change: 1.8, changeType: "positive" as const },
};

export const MARKETING_INSIGHTS = [
  {
    type: "alert" as const,
    title: "TV: CPM +18% sobre benchmark — eficiencia cayendo",
    description: "El costo por mil impresiones en TV subió un 18% vs Q1. El reach no acompañó el incremento de inversión. Revisar mix con la agencia antes del Q3.",
    impact: "Sobrecosto estimado $68K",
  },
  {
    type: "opportunity" as const,
    title: "Digital tiene 2.2x más ROI que TV — oportunidad de realloc",
    description: "Con ROI 4.2x en Digital vs 1.9x en TV, reasignar $150K hacia canales digitales podría incrementar el ROI total del portafolio en +0.6x.",
    impact: "Upside potencial $180K",
  },
  {
    type: "success" as const,
    title: "Influencer supera ROI objetivo — escalar en Q3",
    description: "La campaña de influencers generó ROI 5.6x promedio, 2x sobre el objetivo inicial. La campaña Influencer Creator Pack está en roadmap para junio.",
    impact: "ROI 5.6x vs target 3x",
  },
];

export const MARKETING_QUESTIONS = [
  "¿Cuál es el ROI de cada medio y dónde hay mayor oportunidad?",
  "¿Cómo está el market share vs competencia en Supermercados?",
  "¿Qué campaña tiene mejor performance y por qué?",
  "¿Cómo está el brand awareness y el NPS? ¿Qué está impactando?",
  "Generame un plan de acción para mejorar el share of voice en Q3",
  "¿Qué medio debería priorizar para el Q3 2026?",
];

import type { ColorToken } from "@/theme/tokens";

export interface LandingSignal {
  label: string;
}

export interface LandingScenarioKpi {
  label: string;
  value: string;
  color: ColorToken;
}

export interface LandingEcosystemCard {
  tag: string;
  value: string;
  color: ColorToken;
}

export interface LandingScenario {
  id: string;
  question: string;
  thinkingSteps: string[];
  answer: string;
  actions: string[];
  kpis: LandingScenarioKpi[];
  ecosystemCards: LandingEcosystemCard[];
}

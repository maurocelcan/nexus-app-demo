// Canonical action IDs
export type CanonicalActionId =
  | "create-plan"
  | "create-goal"
  | "add-insight"
  | "generate-deck"
  | "open-ventas"
  | "complete-brief";

// Maps any raw action string to its canonical ID
const ACTION_ID_MAP: Record<string, CanonicalActionId> = {
  "create-plan":             "create-plan",
  "create-plan-action":      "create-plan",
  "create-plan-activation":  "create-plan",
  "create-plan-follow":      "create-plan",
  "create-activation-plan":  "create-plan",
  "create-follow-plan":      "create-plan",
  "create-seguimiento-plan": "create-plan",
  "create-goal":             "create-goal",
  "create-goal-coverage":    "create-goal",
  "create-goal-profitability": "create-goal",
  "create-coverage-goal":    "create-goal",
  "create-rentabilidad-goal": "create-goal",
  "add-insight":             "add-insight",
  "create-insight":          "add-insight",
  "add-project-insight":     "add-insight",
  "agregar-insight":         "add-insight",
  "generate-deck":           "generate-deck",
  "create-presentation":     "generate-deck",
  "prepare-presentation":    "generate-deck",
  "preparar-presentacion":   "generate-deck",
  "open-ventas":             "open-ventas",
  "complete-brief":          "complete-brief",
  "brief":                   "complete-brief",
  "complete_brief":          "complete-brief",
  "project_brief":           "complete-brief",
  "brief_completion":        "complete-brief",
  "completar-brief":         "complete-brief",
  "fill-brief":              "complete-brief",
  "complete-project-brief":  "complete-brief",
};

// Standardized display label for each canonical action
export const CANONICAL_LABELS: Record<CanonicalActionId, string> = {
  "create-plan":     "Crear plan de acción",
  "create-goal":     "Crear objetivo",
  "add-insight":     "Crear insight",
  "generate-deck":   "Preparar presentación",
  "open-ventas":     "Ver Ventas",
  "complete-brief":  "Completar brief",
};

// Action IDs (exact) that are hidden from the UI
const HIDDEN_ACTION_IDS = new Set([
  "add-timeline",
  "create-timeline-event",
  "create-milestone",
  "create-hito",
  "add-to-timeline",
  "timeline-event",
  "agregar-timeline",
]);

// Label substrings that indicate a hidden timeline action
const HIDDEN_LABEL_KEYWORDS = [
  "timeline",
  "hito",
  "evento del timeline",
  "agregar al timeline",
  "crear hito",
];

export interface RawAction {
  id: string;
  label: string;
  action: string;
}

export interface NormalizedAction {
  id: string;
  canonicalId: CanonicalActionId | string;
  label: string;
  action: string;
}

/**
 * Normalizes a single raw action: maps ID to canonical, applies standard label,
 * returns null if the action should be hidden.
 */
export function normalizeAction(raw: RawAction): NormalizedAction | null {
  const lowerAction = raw.action.toLowerCase().trim();
  const lowerLabel = raw.label.toLowerCase();

  // Hide exact-match hidden IDs
  if (HIDDEN_ACTION_IDS.has(lowerAction)) return null;

  // Hide by label keyword
  if (HIDDEN_LABEL_KEYWORDS.some((kw) => lowerLabel.includes(kw))) return null;

  const canonicalId = ACTION_ID_MAP[lowerAction] ?? lowerAction;
  const label = CANONICAL_LABELS[canonicalId as CanonicalActionId] ?? raw.label;

  return { id: raw.id, canonicalId, label, action: canonicalId };
}

/**
 * Normalizes an array of raw actions, removing hidden ones and deduplicating
 * by canonical action ID (keeps first occurrence).
 */
export function normalizeActions(rawActions: RawAction[]): NormalizedAction[] {
  const seen = new Set<string>();
  const result: NormalizedAction[] = [];
  for (const raw of rawActions) {
    const normalized = normalizeAction(raw);
    if (!normalized) continue;
    if (seen.has(normalized.canonicalId)) continue;
    seen.add(normalized.canonicalId);
    result.push(normalized);
  }
  return result;
}

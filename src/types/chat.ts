export type MessageRole = "user" | "assistant";

export type BlockType =
  | "executive-summary"
  | "kpi-strip"
  | "insight-card"
  | "chart"
  | "data-table"
  | "recommendations"
  | "action-plan"
  | "follow-up-questions"
  | "diagnostic-summary"
  | "cross-insights"
  | "strategic-initiatives"
  | "iteration-prompt"
  | "advisory-response"
  | "brief-proposal";

export interface KpiItem {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  description?: string;
}

export interface ChartBlock {
  id: string;
  type: "line" | "bar" | "waterfall" | "pie";
  title: string;
  description?: string;
  data: unknown;
}

export interface DataTableRow {
  [key: string]: string | number;
}

export interface DataTableBlock {
  columns: string[];
  rows: DataTableRow[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  area?: string;
}

export interface ActionItem {
  id: string;
  label: string;
  icon?: string;
  action: string;
}

export interface MessageBlock {
  type: BlockType;
  data: unknown;
}

export interface MessageAttachment {
  name: string;
  type: string;
  size: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  blocks?: MessageBlock[];
  attachment?: MessageAttachment;
  timestamp: string;
  isThinking?: boolean;
  thinkingSteps?: string[];
  userName?: string;
}

export interface AgentStep {
  id: string;
  label: string;
  status: "pending" | "running" | "done";
}

export interface ColumnMapping {
  original: string;
  mapped: string;
  type: string;
}

import type { BusinessAreaId } from "@/data/business-areas";

export interface SalesKpi {
  label: string;
  value: string | number;
  unit?: string;
  change: number;
  changeType: "positive" | "negative" | "neutral";
  description: string;
  tooltip?: string;
}

export interface ChartSeries {
  name: string;
  data: number[];
  type?: string;
}

export interface ChartData {
  labels: string[];
  series: ChartSeries[];
}

export interface Insight {
  id: string;
  type: "alert" | "opportunity" | "info" | "warning";
  title: string;
  description: string;
  area?: string;
  sku?: string;
  channel?: string;
  impact?: string;
  createdAt: string;
}

export interface ProjectKpi {
  label: string;
  value: string;
  change?: number;
  changeType?: "positive" | "negative" | "neutral";
  unit?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: "xlsx" | "csv" | "pdf" | "ppt" | "doc";
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  source?: "chat" | "manual" | "generated" | "data-source";
  conversationId?: string;
}

export interface ProjectRisk {
  id: string;
  label: string;
  severity: "high" | "medium" | "low";
  description?: string;
}

export interface ProjectOpportunity {
  id: string;
  label: string;
  impact: "high" | "medium" | "low";
  description?: string;
}

export interface ProjectNextStep {
  id: string;
  label: string;
  description?: string;
  owner?: string;
  dueDate?: string;
  priority?: "high" | "medium" | "low";
  status?: "pending" | "in-progress" | "completed" | "blocked";
  impact?: string;
  area?: string;
  done: boolean;
}

export interface ProjectBrief {
  problem: string;
  hypothesis: string;
  strategy: string;
  expectedOutcome: string;
}

export interface ProjectGoal {
  id: string;
  name: string;
  description?: string;
  kpi?: string;
  currentValue: string;
  targetValue: string;
  unit?: "%" | "cajas" | "USD" | "puntos" | "pp" | string;
  progress: number;
  dueDate: string;
  priority?: "high" | "medium" | "low";
  status?: "pending" | "in-progress" | "completed";
}

export interface ProjectInsight {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
  area: string;
  recommendation: string;
  createdAt: string;
}

export interface ProjectTimelineEvent {
  id: string;
  type: "conversation" | "file" | "kpi" | "action" | "insight";
  title: string;
  description?: string;
  date: string;
  source?: string;
  author?: { name: string; role?: string; type: "user" | "ai" };
  area?: string;
}

export type ProjectPriority = "low" | "medium" | "high" | "critical";

export interface Project {
  id: string;
  name: string;
  description?: string;
  area?: string;
  linkedAreas?: string[];
  objective?: string;
  owner?: string;
  contributors?: string[];
  status: "active" | "archived" | "monitoring" | "at-risk" | "completed" | "paused";
  priority?: ProjectPriority;
  progress?: number;
  startDate?: string;
  dueDate?: string;
  conversationCount: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  brief?: ProjectBrief;
  kpis?: ProjectKpi[];
  risks?: ProjectRisk[];
  opportunities?: ProjectOpportunity[];
  nextSteps?: ProjectNextStep[];
  files?: ProjectFile[];
  goals?: ProjectGoal[];
  insights?: ProjectInsight[];
  timelineEvents?: ProjectTimelineEvent[];
  type?: "standard" | "t2t" | "war-room" | "jbp";
  projectClient?: string;
  meetingDate?: string;
  presentationReady?: boolean;
  linkedDataSources?: string[];
}

export interface Conversation {
  id: string;
  projectId?: string;
  title: string;
  areaIds: BusinessAreaId[];
  primaryAreaId?: BusinessAreaId;
  /** Legacy display/route scope kept as a derived compatibility field. */
  area?: string;
  /** The scope set at conversation creation: "global" or an area id (e.g. "ventas"). */
  scope?: string;
  messageCount: number;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export type ActionPlanStatus = "draft" | "active" | "completed" | "blocked";
export type ActionPlanPriority = "high" | "medium" | "low";

export interface ActionPlanItem {
  id: string;
  label: string;
  done: boolean;
}

export interface ActionPlan {
  id: string;
  name: string;
  objective: string;
  insightOrigin?: string;
  owner: string;
  priority: ActionPlanPriority;
  targetDate: string;
  status: ActionPlanStatus;
  items: ActionPlanItem[];
  projectId?: string;
  goalId?: string;
  conversationId?: string;
  area?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: "info" | "alert" | "success" | "warning";
  read: boolean;
  link?: string;
  createdAt: string;
}

export type WorkspaceRole = "owner" | "admin" | "manager" | "analyst" | "viewer";
export type MemberStatus = "active" | "invited" | "suspended" | "deactivated";
export type MemberRole = WorkspaceRole; // alias for backwards compat

export interface WorkspaceModule {
  id: string;
  name: string;
  icon: string;
  description: string;
  active: boolean;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  role: WorkspaceRole;
  status: MemberStatus;
  modules: string[];
  areas: string[];
  avatarUrl?: string;
  invitedAt: string;
  joinedAt?: string;
  lastLoginAt?: string;
  invitedBy?: string;
}

export interface AuditEvent {
  id: string;
  type: "invite" | "role_change" | "suspend" | "delete" | "login" | "data_connect" | "project_create" | "report_export" | "settings_change" | "reactivate";
  description: string;
  actor: string;
  target?: string;
  timestamp: string;
}

export interface BillingInfo {
  plan: string;
  activeUsers: number;
  maxUsers: number;
  activeModules: number;
  renewalDate: string;
  monthlyPrice: number;
  currency: string;
}

export interface SecurityConfig {
  requireCorporateDomain: boolean;
  domain: string;
  twoFactorRequired: boolean;
  ssoEnabled: boolean;
  passwordPolicy: "standard" | "strong" | "enterprise";
}

export interface WorkspaceBranding {
  primaryColor: string;
  logoUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  industry: string;
  country: string;
  currency: string;
  timezone: string;
  size: string;
  region: string;
  activeAreas: string[];
  members: Member[];
  modules: WorkspaceModule[];
  billing: BillingInfo;
  security: SecurityConfig;
  branding: WorkspaceBranding;
  createdAt: string;
}

export interface BusinessArea {
  id: string;
  name: string;
  icon: string;
  description: string;
  active: boolean;
  route?: string;
}

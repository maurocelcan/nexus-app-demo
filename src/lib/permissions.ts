import type { Conversation, Project } from "@/types/analytics";
import type { User } from "@/types/auth";
import type { Member, WorkspaceRole } from "@/types/workspace";

export type Permission =
  | "workspace.manage"
  | "members.manage"
  | "members.invite"
  | "members.edit"
  | "members.delete"
  | "members.suspend"
  | "members.transferOwnership"
  | "dataSources.connect"
  | "dataSources.delete"
  | "dataSources.sync"
  | "projects.create"
  | "projects.edit"
  | "projects.delete"
  | "projects.archive"
  | "goals.edit"
  | "insights.create"
  | "insights.edit"
  | "actionPlans.edit"
  | "files.manage"
  | "chat.create"
  | "chat.delete"
  | "chat.assign"
  | "chat.send"
  | "reports.generate"
  | "reports.export"
  | "billing.view"
  | "audit.view";

const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  owner: [
    "workspace.manage",
    "members.manage",
    "members.invite",
    "members.edit",
    "members.delete",
    "members.suspend",
    "members.transferOwnership",
    "dataSources.connect",
    "dataSources.delete",
    "dataSources.sync",
    "projects.create",
    "projects.edit",
    "projects.delete",
    "projects.archive",
    "goals.edit",
    "insights.create",
    "insights.edit",
    "actionPlans.edit",
    "files.manage",
    "chat.create",
    "chat.delete",
    "chat.assign",
    "chat.send",
    "reports.generate",
    "reports.export",
    "billing.view",
    "audit.view",
  ],
  admin: [
    "workspace.manage",
    "members.manage",
    "members.invite",
    "members.edit",
    "members.suspend",
    "dataSources.connect",
    "dataSources.delete",
    "dataSources.sync",
    "projects.create",
    "projects.edit",
    "projects.delete",
    "projects.archive",
    "goals.edit",
    "insights.create",
    "insights.edit",
    "actionPlans.edit",
    "files.manage",
    "chat.create",
    "chat.delete",
    "chat.assign",
    "chat.send",
    "reports.generate",
    "reports.export",
    "audit.view",
  ],
  manager: [
    "projects.create",
    "projects.edit",
    "projects.archive",
    "goals.edit",
    "insights.create",
    "insights.edit",
    "actionPlans.edit",
    "files.manage",
    "chat.create",
    "chat.assign",
    "chat.send",
    "reports.generate",
    "reports.export",
  ],
  analyst: [
    "insights.create",
    "chat.create",
    "chat.send",
    "reports.generate",
  ],
  viewer: [],
};

export function getWorkspaceRole(user: User | null | undefined): WorkspaceRole {
  return user?.workspaceRole ?? "viewer";
}

export function hasRole(user: User | null | undefined, ...roles: WorkspaceRole[]): boolean {
  return roles.includes(getWorkspaceRole(user));
}

export function can(user: User | null | undefined, permission: Permission): boolean {
  return ROLE_PERMISSIONS[getWorkspaceRole(user)].includes(permission);
}

function isProjectLead(user: User | null | undefined, project?: Project | null): boolean {
  if (!user || !project) return false;
  const userName = user.name.toLowerCase();
  return (
    project.owner?.toLowerCase() === userName ||
    project.contributors?.some((name) => name.toLowerCase() === userName) === true
  );
}

export function canAccessModule(user: User | null | undefined, moduleId: string): boolean {
  if (!user) return false;
  if (hasRole(user, "owner")) return true;
  return user.enabledModules?.includes(moduleId) ?? true;
}

export function canManageWorkspace(user: User | null | undefined): boolean {
  return can(user, "workspace.manage");
}

export function canManageMembers(user: User | null | undefined): boolean {
  return can(user, "members.manage");
}

export function canInviteMembers(user: User | null | undefined): boolean {
  return can(user, "members.invite");
}

export function canEditMember(user: User | null | undefined, target?: Member | null): boolean {
  if (!can(user, "members.edit")) return false;
  return hasRole(user, "owner") || target?.role !== "owner";
}

export function canDeleteMember(user: User | null | undefined, target?: Member | null): boolean {
  if (!can(user, "members.delete")) return false;
  if (!target) return true;
  return target.role !== "owner" && target.email !== user?.email;
}

export function canSuspendMember(user: User | null | undefined, target?: Member | null): boolean {
  if (!can(user, "members.suspend")) return false;
  if (!target) return true;
  return target.role !== "owner" && target.email !== user?.email;
}

export function canChangeMemberRole(
  user: User | null | undefined,
  targetRole?: WorkspaceRole,
  target?: Member | null
): boolean {
  if (!can(user, "members.edit")) return false;
  if (hasRole(user, "owner")) return target?.email !== user?.email;
  return target?.role !== "owner" && targetRole !== "owner";
}

export function canTransferOwnership(user: User | null | undefined): boolean {
  return can(user, "members.transferOwnership");
}

export function canConnectDataSource(user: User | null | undefined): boolean {
  return can(user, "dataSources.connect");
}

export function canDeleteDataSource(user: User | null | undefined): boolean {
  return can(user, "dataSources.delete");
}

export function canSyncDataSource(user: User | null | undefined): boolean {
  return can(user, "dataSources.sync");
}

export function canCreateProject(user: User | null | undefined): boolean {
  return can(user, "projects.create");
}

export function canEditProject(user: User | null | undefined, project?: Project | null): boolean {
  if (hasRole(user, "owner", "admin")) return true;
  return hasRole(user, "manager") && isProjectLead(user, project);
}

export function canDeleteProject(user: User | null | undefined): boolean {
  return can(user, "projects.delete");
}

export function canArchiveProject(user: User | null | undefined, project?: Project | null): boolean {
  if (hasRole(user, "owner", "admin")) return true;
  return hasRole(user, "manager") && isProjectLead(user, project);
}

export function canEditGoals(user: User | null | undefined, project?: Project | null): boolean {
  return hasRole(user, "owner", "admin") || (hasRole(user, "manager") && isProjectLead(user, project));
}

export function canCreateInsight(user: User | null | undefined): boolean {
  return can(user, "insights.create");
}

export function canEditInsights(user: User | null | undefined, project?: Project | null): boolean {
  return hasRole(user, "owner", "admin") || (hasRole(user, "manager") && isProjectLead(user, project));
}

export function canEditActionPlan(user: User | null | undefined, project?: Project | null): boolean {
  return hasRole(user, "owner", "admin") || (hasRole(user, "manager") && isProjectLead(user, project));
}

export function canManageProjectFiles(user: User | null | undefined, project?: Project | null): boolean {
  return hasRole(user, "owner", "admin") || (hasRole(user, "manager") && isProjectLead(user, project));
}

export function canCreateChat(user: User | null | undefined): boolean {
  return can(user, "chat.create");
}

export function canSendChatMessage(user: User | null | undefined): boolean {
  return can(user, "chat.send");
}

export function canDeleteChat(
  user: User | null | undefined,
  conversation?: Conversation | null,
  isOwn = false
): boolean {
  if (hasRole(user, "owner", "admin")) return true;
  if (!conversation) return false;
  return hasRole(user, "manager") && isOwn;
}

export function canAssignConversation(user: User | null | undefined): boolean {
  return can(user, "chat.assign");
}

export function canGenerateReports(user: User | null | undefined): boolean {
  return can(user, "reports.generate");
}

export function canExportReports(user: User | null | undefined): boolean {
  return can(user, "reports.export");
}

export function canViewBilling(user: User | null | undefined): boolean {
  return can(user, "billing.view");
}

export function canViewAudit(user: User | null | undefined): boolean {
  return can(user, "audit.view");
}

export function isViewer(user: User | null | undefined): boolean {
  return hasRole(user, "viewer");
}

export function isAnalystOrBelow(user: User | null | undefined): boolean {
  return hasRole(user, "analyst", "viewer");
}

"use client";
import { useState } from "react";
import {
  User, Building2, Users, Shield, Palette, Check, Plus, LogOut,
  MoreHorizontal, Send, Trash2, Edit2, Moon, Sun, Monitor,
  CreditCard, ClipboardList, Eye, EyeOff, ChevronRight, Ban,
  RefreshCw, Lock, Globe, AlertTriangle, BarChart3, Package,
  TrendingUp, DollarSign, ShoppingCart, PieChart, Megaphone,
  Calendar, Clock, Activity, X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { MOCK_AUDIT_EVENTS, WORKSPACE_MODULES, ROLE_PERMISSIONS } from "@/data/mock-workspace";
import { ROUTES } from "@/lib/routes";
import { cn, sleep } from "@/lib/utils";
import type { Member, WorkspaceRole, MemberStatus } from "@/types/workspace";
import {
  canManageWorkspace, canManageMembers, canInviteMembers,
  canDeleteMember, canSuspendMember, canChangeMemberRole,
  canViewBilling, canViewAudit,
} from "@/lib/permissions";

// ─── Constants ────────────────────────────────────────────────────────────────

type Tab = "profile" | "workspace" | "members" | "appearance";
type WorkspaceSubTab = "general" | "modules" | "security" | "billing" | "audit";
type MembersSubTab = "list" | "roles";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "workspace", label: "Workspace", icon: Building2 },
  { id: "members", label: "Miembros", icon: Users },
  { id: "appearance", label: "Apariencia", icon: Palette },
];

const ROLE_CONFIG: Record<WorkspaceRole, { label: string; color: string; description: string }> = {
  owner: { label: "Owner", color: "text-primary-soft bg-primary/10 border-primary/25", description: "Control total del workspace" },
  admin: { label: "Admin", color: "text-info bg-info/10 border-info/25", description: "Gestión operativa completa" },
  manager: { label: "Manager", color: "text-accent bg-accent/10 border-accent/25", description: "Gestión funcional de proyectos" },
  analyst: { label: "Analyst", color: "text-success bg-success/10 border-success/25", description: "Consulta y análisis de datos" },
  viewer: { label: "Viewer", color: "text-text-muted bg-surface-soft border-border", description: "Solo lectura y reportes" },
};

const STATUS_CONFIG: Record<MemberStatus, { label: string; color: string; dot: string }> = {
  active: { label: "Activo", color: "text-success", dot: "bg-success" },
  invited: { label: "Invitado", color: "text-warning", dot: "bg-warning" },
  suspended: { label: "Suspendido", color: "text-danger", dot: "bg-danger" },
  deactivated: { label: "Inactivo", color: "text-text-muted", dot: "bg-text-muted" },
};

const AUDIT_ICONS: Record<string, React.ElementType> = {
  invite: Users,
  role_change: Shield,
  suspend: Ban,
  delete: Trash2,
  login: User,
  data_connect: BarChart3,
  project_create: Package,
  report_export: ClipboardList,
  settings_change: Building2,
  reactivate: RefreshCw,
};

const MODULE_ICONS: Record<string, React.ElementType> = {
  ventas: TrendingUp,
  rgm: DollarSign,
  "trade-marketing": ShoppingCart,
  finanzas: PieChart,
  supply: Package,
  planning: Calendar,
  marketing: Megaphone,
  crm: Users,
};

const ALL_MODULES = ["ventas", "rgm", "trade-marketing", "finanzas", "supply", "planning", "marketing", "crm"];
const MODULE_LABELS: Record<string, string> = {
  ventas: "Ventas", rgm: "RGM", "trade-marketing": "Trade Marketing",
  finanzas: "Finanzas", supply: "Supply Chain", planning: "Planning",
  marketing: "Marketing", crm: "CRM",
};

const ROLE_OPTIONS = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "analyst", label: "Analyst" },
  { value: "viewer", label: "Viewer" },
];

const ACCENT_COLORS = [
  { label: "Violeta", value: "#8B5CF6" },
  { label: "Azul", value: "#3B82F6" },
  { label: "Teal", value: "#00E0B8" },
  { label: "Verde", value: "#10B981" },
  { label: "Naranja", value: "#F97316" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: WorkspaceRole }) {
  const cfg = ROLE_CONFIG[role];
  return (
    <span className={cn("text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full border", cfg.color)}>
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: MemberStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", cfg.color)}>
      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
        checked ? "bg-primary" : "bg-surface-soft"
      )}
    >
      <span className={cn(
        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200",
        checked ? "translate-x-4" : "translate-x-0"
      )} />
    </button>
  );
}

// ─── Member Detail Modal ──────────────────────────────────────────────────────

function MemberDetailModal({
  member, onClose, onUpdateRole, onUpdateStatus, onRemove,
}: {
  member: Member;
  onClose: () => void;
  onUpdateRole: (id: string, role: WorkspaceRole) => void;
  onUpdateStatus: (id: string, status: MemberStatus) => void;
  onRemove: (id: string) => void;
}) {
  const { user: currentUser } = useAuthStore();
  const [innerTab, setInnerTab] = useState<"profile" | "permissions" | "activity">("profile");
  const [editingRole, setEditingRole] = useState(false);
  const [newRole, setNewRole] = useState<WorkspaceRole>(member.role);
  const canChangeRole = canChangeMemberRole(currentUser, member.role, member);
  const canSuspend = canSuspendMember(currentUser, member);
  const canDelete = canDeleteMember(currentUser, member);
  const hasFooterActions = canChangeRole || canSuspend || canDelete;

  const allPermissions = Object.values(ROLE_PERMISSIONS).flat();
  const memberPerms = allPermissions.filter((p) => p.roles.includes(member.role));
  const byCategory = memberPerms.reduce<Record<string, string[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p.label);
    return acc;
  }, {});

  const mockActivity = [
    { label: "Creó conversación 'Análisis de passthrough Q2'", date: "2026-05-17T09:00:00Z" },
    { label: "Editó proyecto 'Recuperación Supermercados'", date: "2026-05-16T14:30:00Z" },
    { label: "Exportó Business Review Q2 2026", date: "2026-05-15T11:00:00Z" },
    { label: "Generó insight 'Price Index bajo sin elasticidad'", date: "2026-05-14T16:00:00Z" },
    { label: "Completó tarea 'Auditoría de stock en Carrefour'", date: "2026-05-12T10:00:00Z" },
  ];

  return (
    <Modal open onClose={onClose} title="" size="lg">
      {/* Header */}
      <div className="flex items-center gap-4 mb-5 pb-4 border-b border-border">
        <Avatar name={member.name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-text-primary">{member.name}</h2>
            <RoleBadge role={member.role} />
            <StatusBadge status={member.status} />
          </div>
          <p className="text-sm text-text-muted mt-0.5">{member.title} · {member.department}</p>
          <p className="text-xs text-text-muted">{member.email}</p>
        </div>
      </div>

      {/* Inner tabs */}
      <div className="flex gap-1 border-b border-border mb-5">
        {([
          { id: "profile", label: "Perfil" },
          { id: "permissions", label: "Permisos" },
          { id: "activity", label: "Actividad" },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setInnerTab(t.id)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors -mb-px border-b-2",
              innerTab === t.id ? "text-primary-soft border-primary" : "text-text-muted border-transparent hover:text-text-secondary"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {innerTab === "profile" && (
        <div className="space-y-3">
          {[
            ["Cargo", member.title],
            ["Departamento", member.department],
            ["Email", member.email],
            ["Invitado por", member.invitedBy === "system" ? "Workspace fundador" : member.invitedBy ?? "N/D"],
            ["Fecha de invitación", new Date(member.invitedAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })],
            ["Último login", member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Pendiente"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between py-2 border-b border-border/50 last:border-0">
              <span className="text-xs text-text-muted w-32 flex-shrink-0">{label}</span>
              <span className="text-xs text-text-primary text-right">{value}</span>
            </div>
          ))}

          <div className="pt-2">
            <p className="text-[10px] uppercase tracking-wide text-text-muted font-medium mb-2">Módulos habilitados</p>
            <div className="flex flex-wrap gap-1.5">
              {member.modules.map((m) => {
                const Icon = MODULE_ICONS[m] ?? Package;
                return (
                  <span key={m} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-soft">
                    <Icon className="h-2.5 w-2.5" />
                    {MODULE_LABELS[m] ?? m}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {innerTab === "permissions" && (
        <div className="space-y-4">
          {Object.entries(byCategory).map(([category, perms]) => (
            <div key={category}>
              <p className="text-[10px] uppercase tracking-wide text-text-muted font-medium mb-2">{category}</p>
              <div className="space-y-1.5">
                {perms.map((perm) => (
                  <div key={perm} className="flex items-center gap-2 text-xs text-text-secondary">
                    <Check className="h-3 w-3 text-success flex-shrink-0" />
                    {perm}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(byCategory).length === 0 && (
            <p className="text-sm text-text-muted text-center py-4">Sin permisos especiales asignados.</p>
          )}
        </div>
      )}

      {innerTab === "activity" && (
        <div className="space-y-2">
          {mockActivity.map((a, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
              <Activity className="h-3.5 w-3.5 text-text-muted mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-text-secondary">{a.label}</p>
                <p className="text-[10px] text-text-muted mt-0.5">
                  {new Date(a.date).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer actions */}
      {hasFooterActions && (
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-border">
          {canChangeRole && (editingRole ? (
            <div className="flex items-center gap-2">
              <Select
                label=""
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as WorkspaceRole)}
                options={ROLE_OPTIONS.filter((r) => canChangeMemberRole(currentUser, r.value as WorkspaceRole, member))}
              />
              <Button size="sm" variant="primary" onClick={() => {
                if (!canChangeMemberRole(currentUser, newRole, member)) return;
                onUpdateRole(member.id, newRole);
                setEditingRole(false);
              }}>
                <Check className="h-3.5 w-3.5" />Guardar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingRole(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setEditingRole(true)}>
              <Edit2 className="h-3.5 w-3.5" />
              Cambiar rol
            </Button>
          ))}

          {canSuspend && (member.status === "active" ? (
            <Button size="sm" variant="ghost" onClick={() => {
              if (!canSuspendMember(currentUser, member)) return;
              onUpdateStatus(member.id, "suspended");
            }}>
              <Ban className="h-3.5 w-3.5" />Suspender
            </Button>
          ) : member.status === "suspended" ? (
            <Button size="sm" variant="ghost" onClick={() => {
              if (!canSuspendMember(currentUser, member)) return;
              onUpdateStatus(member.id, "active");
            }}>
              <RefreshCw className="h-3.5 w-3.5" />Reactivar
            </Button>
          ) : null)}

          {member.status === "invited" && (
            <Button size="sm" variant="ghost">
              <Send className="h-3.5 w-3.5" />Reenviar invitación
            </Button>
          )}

          {canDelete && (
            <Button size="sm" variant="danger" className="ml-auto" onClick={() => {
              if (!canDeleteMember(currentUser, member)) return;
              onRemove(member.id);
              onClose();
            }}>
              <Trash2 className="h-3.5 w-3.5" />Eliminar
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}

// ─── Invite Wizard ────────────────────────────────────────────────────────────

function InviteModal({ onClose, onInvite }: { onClose: () => void; onInvite: (member: Omit<Member, "id">) => void }) {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", title: "", department: "",
    role: "analyst" as WorkspaceRole,
    modules: ["ventas"] as string[],
  });

  function toggleModule(m: string) {
    setForm((f) => ({
      ...f,
      modules: f.modules.includes(m) ? f.modules.filter((x) => x !== m) : [...f.modules, m],
    }));
  }

  async function handleSend() {
    if (!canInviteMembers(user) || !canChangeMemberRole(user, form.role)) return;
    setLoading(true);
    await sleep(1200);
    onInvite({
      name: form.name,
      email: form.email,
      title: form.title,
      department: form.department,
      role: form.role,
      status: "invited",
      modules: form.modules,
      areas: form.modules,
      invitedAt: new Date().toISOString(),
      invitedBy: "m-001",
    });
    setLoading(false);
    setDone(true);
    await sleep(1500);
    onClose();
  }

  const canAdvance1 = form.name.trim() && form.email.trim().includes("@") && form.title.trim();
  const canAdvance2 = form.role && form.modules.length > 0;

  return (
    <Modal open onClose={onClose} title="Invitar miembro" size="md">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors",
              step > s ? "bg-primary border-primary text-white" :
              step === s ? "bg-primary/10 border-primary/50 text-primary-soft" :
              "bg-surface border-border text-text-muted"
            )}>
              {step > s ? <Check className="h-3 w-3" /> : s}
            </div>
            {s < 3 && <div className={cn("flex-1 h-px w-8", step > s ? "bg-primary/50" : "bg-border")} />}
          </div>
        ))}
        <div className="ml-2 text-xs text-text-muted">
          {step === 1 ? "Información básica" : step === 2 ? "Rol y módulos" : "Confirmar"}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre completo" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ana García" />
            <Input label="Email corporativo" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="ana@empresa.com" />
            <Input label="Cargo" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Category Manager" />
            <Input label="Departamento" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} placeholder="Marketing" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" disabled={!canAdvance1} onClick={() => setStep(2)}>
              Siguiente <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-text-muted font-medium mb-2">Rol en el workspace</p>
            <div className="grid grid-cols-1 gap-2">
              {(["admin", "manager", "analyst", "viewer"] as WorkspaceRole[]).filter((r) => canChangeMemberRole(user, r)).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: r }))}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                    form.role === r ? "border-primary/40 bg-primary/8" : "border-border bg-surface hover:border-primary/25"
                  )}
                >
                  <RoleBadge role={r} />
                  <div>
                    <p className="text-xs font-medium text-text-primary">{ROLE_CONFIG[r].label}</p>
                    <p className="text-[10px] text-text-muted">{ROLE_CONFIG[r].description}</p>
                  </div>
                  {form.role === r && <Check className="h-4 w-4 text-primary ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wide text-text-muted font-medium mb-2">Módulos habilitados</p>
            <div className="flex flex-wrap gap-2">
              {ALL_MODULES.map((m) => {
                const Icon = MODULE_ICONS[m] ?? Package;
                const active = form.modules.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleModule(m)}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors",
                      active ? "border-primary/40 bg-primary/10 text-primary-soft" : "border-border text-text-muted hover:border-primary/25"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {MODULE_LABELS[m]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep(1)}>Atrás</Button>
            <Button variant="primary" disabled={!canAdvance2} onClick={() => setStep(3)}>
              Siguiente <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          {done ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 rounded-full bg-success/15 border border-success/30 flex items-center justify-center mx-auto mb-3">
                <Check className="h-6 w-6 text-success" />
              </div>
              <p className="text-sm font-medium text-text-primary">¡Invitación enviada!</p>
              <p className="text-xs text-text-muted mt-1">{form.name} recibirá un email para unirse al workspace.</p>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar name={form.name || "?"} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{form.name || "—"}</p>
                    <p className="text-xs text-text-muted">{form.email || "—"}</p>
                  </div>
                  <RoleBadge role={form.role} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-text-muted">Cargo: </span><span className="text-text-secondary">{form.title}</span></div>
                  <div><span className="text-text-muted">Área: </span><span className="text-text-secondary">{form.department}</span></div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {form.modules.map((m) => (
                    <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary-soft border border-primary/20">
                      {MODULE_LABELS[m]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between gap-2">
                <Button variant="ghost" onClick={() => setStep(2)}>Atrás</Button>
                <Button variant="primary" loading={loading} onClick={handleSend}>
                  <Send className="h-3.5 w-3.5" />
                  Enviar invitación
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}

// ─── Workspace subtabs ────────────────────────────────────────────────────────

function WorkspaceTab({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  const [subTab, setSubTab] = useState<WorkspaceSubTab>("general");
  const { workspace, updateWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [security, setSecurity] = useState(workspace?.security ?? {
    requireCorporateDomain: true,
    domain: "cpgteam.com",
    twoFactorRequired: false,
    ssoEnabled: false,
    passwordPolicy: "strong" as const,
  });
  const [modules, setModules] = useState(workspace?.modules ?? WORKSPACE_MODULES);

  function toggleModule(id: string) {
    setModules((prev) => prev.map((m) => m.id === id ? { ...m, active: !m.active } : m));
  }

  const allSubTabs = [
    { id: "general", label: "General" },
    { id: "modules", label: "Módulos" },
    { id: "security", label: "Seguridad" },
    { id: "billing", label: "Facturación", ownerOnly: true },
    { id: "audit", label: "Auditoría", adminOnly: true },
  ] as const;

  const subTabs = allSubTabs.filter((t) => {
    if ("ownerOnly" in t && t.ownerOnly) return canViewBilling(user);
    if ("adminOnly" in t && t.adminOnly) return canViewAudit(user);
    return true;
  });

  return (
    <div>
      <h2 className="text-base font-semibold text-text-primary mb-4">Configuración del workspace</h2>

      <div className="flex gap-1 overflow-x-auto pb-2 border-b border-border mb-5">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              subTab === t.id ? "bg-primary/10 text-primary-soft border border-primary/25" : "text-text-muted hover:text-text-secondary"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "general" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre del workspace" defaultValue={workspace?.name ?? "CPG Growth Team"} />
            <Select label="Industria" options={[{ value: "cpg", label: "Consumo Masivo (CPG)" }, { value: "retail", label: "Retail" }, { value: "services", label: "Servicios" }]} value="cpg" onChange={() => {}} />
            <Select label="País" options={[{ value: "ar", label: "Argentina" }, { value: "mx", label: "México" }, { value: "cl", label: "Chile" }]} value="ar" onChange={() => {}} />
            <Select label="Región" options={[{ value: "latam", label: "LATAM" }, { value: "sa", label: "Sudamérica" }]} value="latam" onChange={() => {}} />
            <Select label="Moneda" options={[{ value: "usd", label: "USD — Dólar americano" }, { value: "ars", label: "ARS — Peso argentino" }]} value="usd" onChange={() => {}} />
            <Select label="Zona horaria" options={[{ value: "ba", label: "América/Buenos_Aires (UTC-3)" }, { value: "mx", label: "América/Mexico_City (UTC-6)" }]} value="ba" onChange={() => {}} />
            <Select label="Tamaño de empresa" options={[{ value: "10-50", label: "10–50 personas" }, { value: "50-200", label: "50–200 personas" }, { value: "200+", label: "+200 personas" }]} value="50-200" onChange={() => {}} />
          </div>
          <Button variant="primary" onClick={onSave}>
            {saved ? <><Check className="h-4 w-4" />Guardado</> : "Guardar cambios"}
          </Button>
        </div>
      )}

      {subTab === "modules" && (
        <div className="space-y-3">
          <p className="text-xs text-text-muted">Activá o desactivá módulos según los contratados con Nexus.</p>
          {modules.map((mod) => {
            const Icon = MODULE_ICONS[mod.id] ?? Package;
            return (
              <div key={mod.id} className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-colors",
                mod.active ? "border-primary/25 bg-primary/5" : "border-border bg-surface"
              )}>
                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0", mod.active ? "bg-primary/15" : "bg-surface-soft")}>
                  <Icon className={cn("h-4 w-4", mod.active ? "text-primary-soft" : "text-text-muted")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{mod.name}</p>
                  <p className="text-xs text-text-muted">{mod.description}</p>
                </div>
                <ToggleSwitch checked={mod.active} onChange={() => toggleModule(mod.id)} />
              </div>
            );
          })}
        </div>
      )}

      {subTab === "security" && (
        <div className="space-y-4">
          {[
            {
              icon: Globe, label: "Requerir dominio corporativo",
              desc: `Solo emails @${security.domain} pueden unirse al workspace.`,
              key: "requireCorporateDomain" as const,
            },
            {
              icon: Lock, label: "Autenticación de dos factores (2FA)",
              desc: "Obligar a todos los miembros a activar 2FA para mayor seguridad.",
              key: "twoFactorRequired" as const,
            },
            {
              icon: Shield, label: "Single Sign-On (SSO)",
              desc: "Permitir inicio de sesión con proveedor corporativo de identidad.",
              key: "ssoEnabled" as const,
            },
          ].map(({ icon: Icon, label, desc, key }) => (
            <div key={key} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface">
              <div className="h-9 w-9 rounded-lg bg-surface-soft flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-text-muted" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{label}</p>
                <p className="text-xs text-text-muted">{desc}</p>
              </div>
              <ToggleSwitch checked={security[key]} onChange={(v) => setSecurity((s) => ({ ...s, [key]: v }))} />
            </div>
          ))}

          <div className="p-4 rounded-xl border border-border bg-surface">
            <p className="text-sm font-medium text-text-primary mb-3">Política de contraseñas</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: "standard", label: "Estándar", desc: "Mínimo 8 caracteres" },
                { value: "strong", label: "Fuerte", desc: "8 car. + mayúscula + número" },
                { value: "enterprise", label: "Enterprise", desc: "12 car. + especial + rotación 90d" },
              ] as const).map((p) => (
                <button
                  key={p.value}
                  onClick={() => setSecurity((s) => ({ ...s, passwordPolicy: p.value }))}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    security.passwordPolicy === p.value ? "border-primary/40 bg-primary/8" : "border-border hover:border-primary/25"
                  )}
                >
                  <p className="text-xs font-medium text-text-primary">{p.label}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{p.desc}</p>
                  {security.passwordPolicy === p.value && <Check className="h-3 w-3 text-primary mt-1.5" />}
                </button>
              ))}
            </div>
          </div>

          <Button variant="primary" onClick={() => { updateWorkspace({ security }); onSave(); }}>
            {saved ? <><Check className="h-4 w-4" />Guardado</> : "Guardar configuración"}
          </Button>
        </div>
      )}

      {subTab === "billing" && (
        <div className="space-y-4">
          {/* Plan card */}
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-text-primary">Plan Enterprise</span>
                  <span className="text-[10px] font-semibold text-primary-soft bg-primary/15 border border-primary/25 px-2 py-0.5 rounded-full">Activo</span>
                </div>
                <p className="text-xs text-text-muted">Renovación mensual · Próxima: 15/06/2026</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-text-primary">USD 1.800</p>
                <p className="text-xs text-text-muted">/ mes</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Usuarios activos", value: "7 / 20", icon: Users },
              { label: "Módulos activos", value: "6 / 8", icon: Package },
              { label: "Proyectos", value: "4", icon: BarChart3 },
              { label: "Datasets conectados", value: "14", icon: CreditCard },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-border bg-surface p-4">
                <Icon className="h-4 w-4 text-text-muted mb-2" />
                <p className="text-base font-bold text-text-primary">{value}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm font-medium text-text-primary mb-3">Detalle de facturación</p>
            {[
              ["Plan base", "USD 800/mes"],
              ["Usuarios adicionales (5 × USD 80)", "USD 400/mes"],
              ["Módulos premium (2 × USD 100)", "USD 200/mes"],
              ["Soporte Enterprise", "USD 400/mes"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b border-border/50 last:border-0 text-xs">
                <span className="text-text-secondary">{label}</span>
                <span className="text-text-primary font-medium">{value}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 mt-1 text-sm font-semibold">
              <span className="text-text-primary">Total mensual</span>
              <span className="text-primary-soft">USD 1.800</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm">Ver historial de facturas</Button>
            <Button variant="ghost" size="sm">Actualizar método de pago</Button>
          </div>
        </div>
      )}

      {subTab === "audit" && (
        <div className="space-y-2">
          <p className="text-xs text-text-muted mb-3">Historial de actividad del workspace.</p>
          {MOCK_AUDIT_EVENTS.map((ev) => {
            const Icon = AUDIT_ICONS[ev.type] ?? Activity;
            return (
              <div key={ev.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-surface hover:bg-surface-soft transition-colors">
                <div className="h-7 w-7 rounded-md bg-surface-elevated border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5 text-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-secondary leading-snug">{ev.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-text-muted">{ev.actor}</span>
                    {ev.target && <><span className="text-[10px] text-text-muted">→</span><span className="text-[10px] text-text-muted">{ev.target}</span></>}
                  </div>
                </div>
                <span className="text-[10px] text-text-muted flex-shrink-0">
                  {new Date(ev.timestamp).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Members Tab ──────────────────────────────────────────────────────────────

function MembersTab() {
  const { user } = useAuthStore();
  const { members, inviteMember, updateMemberRole, updateMemberStatus, removeMember } = useWorkspaceStore();
  const [subTab, setSubTab] = useState<MembersSubTab>("list");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | MemberStatus>("all");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleInvite(member: Omit<Member, "id">) {
    if (!canInviteMembers(user) || !canChangeMemberRole(user, member.role)) return;
    inviteMember(member);
    showToast(`Invitación enviada a ${member.name}`);
  }

  function handleUpdateRole(id: string, role: WorkspaceRole) {
    const target = members.find((m) => m.id === id);
    if (!canChangeMemberRole(user, role, target)) return;
    const name = target?.name ?? "miembro";
    updateMemberRole(id, role);
    showToast(`Rol de ${name} actualizado a ${ROLE_CONFIG[role].label}`);
  }

  function handleUpdateStatus(id: string, status: MemberStatus) {
    const target = members.find((m) => m.id === id);
    if (!canSuspendMember(user, target)) return;
    const name = target?.name ?? "miembro";
    updateMemberStatus(id, status);
    showToast(`${name} ${status === "suspended" ? "suspendido" : "reactivado"}`);
  }

  function handleRemove(id: string) {
    const target = members.find((m) => m.id === id);
    if (!canDeleteMember(user, target)) return;
    const name = target?.name ?? "Miembro";
    removeMember(id);
    showToast(`${name} fue eliminado del workspace`);
  }

  const filteredMembers = statusFilter === "all"
    ? members
    : members.filter((m) => m.status === statusFilter);

  const allPerms = Object.values(ROLE_PERMISSIONS).flat();
  const categories = [...new Set(allPerms.map((p) => p.category))];
  const roles: WorkspaceRole[] = ["owner", "admin", "manager", "analyst", "viewer"];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Miembros del workspace</h2>
          <p className="text-xs text-text-muted">{members.filter((m) => m.status === "active").length} activos · {members.filter((m) => m.status === "invited").length} invitados</p>
        </div>
        {canInviteMembers(user) && (
          <Button variant="primary" size="sm" onClick={() => setInviteOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Invitar
          </Button>
        )}
      </div>

      <div className="flex gap-1 border-b border-border mb-5">
        {([
          { id: "list", label: "Lista" },
          { id: "roles", label: "Roles y permisos" },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              subTab === t.id ? "bg-primary/10 text-primary-soft border border-primary/25" : "text-text-muted hover:text-text-secondary"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "list" && (
        <>
          {/* Status filter */}
          <div className="flex gap-1 flex-wrap mb-4">
            {([
              { id: "all", label: "Todos" },
              { id: "active", label: "Activos" },
              { id: "invited", label: "Invitados" },
              { id: "suspended", label: "Suspendidos" },
            ] as const).map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-medium rounded-full border transition-colors",
                  statusFilter === f.id ? "border-primary/40 bg-primary/10 text-primary-soft" : "border-border text-text-muted hover:border-primary/25"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Member table */}
          <div className="space-y-2">
            {filteredMembers.map((member) => {
              const isCurrentUser = member.email === user?.email;
              return (
                <div
                  key={member.id}
                  className="group flex items-center gap-3 p-3.5 rounded-xl border border-border bg-surface hover:bg-surface-soft hover:border-primary/20 transition-all cursor-pointer"
                  onClick={() => setDetailMember(member)}
                >
                  <Avatar name={member.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-text-primary truncate">{member.name}</span>
                      {isCurrentUser && <span className="text-[10px] text-text-muted">(tú)</span>}
                      <RoleBadge role={member.role} />
                      <StatusBadge status={member.status} />
                    </div>
                    <p className="text-xs text-text-muted truncate">{member.title} · {member.department}</p>
                  </div>
                  <div className="hidden md:flex flex-col items-end gap-1">
                    <p className="text-[10px] text-text-muted">
                      {member.lastLoginAt
                        ? new Date(member.lastLoginAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
                        : "Pendiente"}
                    </p>
                    <div className="flex gap-1">
                      {member.modules.slice(0, 3).map((m) => (
                        <span key={m} className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface-soft border border-border text-text-muted">
                          {MODULE_LABELS[m] ?? m}
                        </span>
                      ))}
                      {member.modules.length > 3 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface-soft border border-border text-text-muted">
                          +{member.modules.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </>
      )}

      {subTab === "roles" && (
        <div className="overflow-x-auto">
          <p className="text-xs text-text-muted mb-4">Matriz de permisos por rol. Los permisos son acumulativos según el nivel jerárquico.</p>
          <table className="w-full text-xs border-collapse min-w-[640px]">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-text-muted font-medium w-48">Permiso</th>
                {roles.map((r) => (
                  <th key={r} className="py-2 px-3 text-center">
                    <RoleBadge role={r} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const catPerms = allPerms.filter((p) => p.category === cat);
                return [
                  <tr key={`cat-${cat}`}>
                    <td colSpan={6} className="pt-4 pb-1 px-3">
                      <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">{cat}</span>
                    </td>
                  </tr>,
                  ...catPerms.map((perm) => (
                    <tr key={perm.label} className="border-t border-border/30 hover:bg-surface-soft/50 transition-colors">
                      <td className="py-2 px-3 text-text-secondary">{perm.label}</td>
                      {roles.map((r) => (
                        <td key={r} className="py-2 px-3 text-center">
                          {perm.roles.includes(r) ? (
                            <Check className="h-3.5 w-3.5 text-success mx-auto" />
                          ) : (
                            <span className="block h-3.5 w-3.5 mx-auto text-text-muted/30 text-center">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  )),
                ];
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {inviteOpen && canInviteMembers(user) && (
        <InviteModal onClose={() => setInviteOpen(false)} onInvite={handleInvite} />
      )}
      {detailMember && (
        <MemberDetailModal
          member={detailMember}
          onClose={() => setDetailMember(null)}
          onUpdateRole={(id, role) => { handleUpdateRole(id, role); setDetailMember((m) => m ? { ...m, role } : m); }}
          onUpdateStatus={(id, status) => { handleUpdateStatus(id, status); setDetailMember((m) => m ? { ...m, status } : m); }}
          onRemove={(id) => { handleRemove(id); setDetailMember(null); }}
        />
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-elevated border border-border rounded-lg px-4 py-2.5 shadow-xl z-50 text-sm text-text-primary flex items-center gap-2"
          >
            <Check className="h-3.5 w-3.5 text-success flex-shrink-0" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);

  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [density, setDensity] = useState<"compact" | "normal" | "wide">("normal");
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0].value);

  async function handleSave() {
    setSaved(true);
    await sleep(400);
    setSaved(false);
  }

  const currentRole = user?.workspaceRole ?? "viewer";

  const visibleTabs = TABS.filter((tab) => {
    if (tab.id === "workspace") return canManageWorkspace(user);
    if (tab.id === "members") return canManageMembers(user);
    return true;
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Configuración</h1>
        <p className="text-sm text-text-muted">Administrá tu perfil, workspace y equipo</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab nav */}
        <nav className="flex md:flex-col gap-1 md:w-52 flex-shrink-0 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-all whitespace-nowrap md:whitespace-normal",
                  activeTab === tab.id
                    ? "bg-primary/10 border border-primary/25 text-primary-soft font-medium"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-soft"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {tab.label}
              </button>
            );
          })}

          {/* Role badge in nav */}
          <div className="mt-auto hidden md:block pt-6">
            <div className="px-3 py-2 rounded-md border border-border bg-surface">
              <p className="text-[10px] text-text-muted mb-1.5">Tu rol</p>
              <RoleBadge role={currentRole} />
              <p className="text-[10px] text-text-muted mt-1">{ROLE_CONFIG[currentRole].description}</p>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >

              {activeTab === "profile" && (
                <div className="space-y-5">
                  <h2 className="text-base font-semibold text-text-primary">Perfil de usuario</h2>
                  <div className="flex items-center gap-4 p-4 bg-surface rounded-lg border border-border">
                    <Avatar name={user?.name} size="lg" />
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                        <RoleBadge role={currentRole} />
                      </div>
                      <p className="text-xs text-text-muted">{user?.email}</p>
                      <p className="text-xs text-text-muted">{user?.role} · {user?.company}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto">Cambiar avatar</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Nombre" defaultValue={user?.name} />
                    <Input label="Email" type="email" defaultValue={user?.email} />
                    <Input label="Empresa" defaultValue={user?.company} />
                    <Input label="Cargo" defaultValue={user?.role} />
                    <Select label="Idioma" options={[{ value: "es", label: "Español" }, { value: "en", label: "English" }]} value="es" onChange={() => {}} />
                    <Select label="Zona horaria" options={[{ value: "ar", label: "América/Buenos_Aires" }, { value: "mx", label: "América/Mexico_City" }]} value="ar" onChange={() => {}} />
                  </div>
                  <div className="space-y-4 p-4 rounded-lg border border-border bg-surface">
                    <h3 className="text-sm font-medium text-text-primary">Cambiar contraseña</h3>
                    <Input label="Contraseña actual" type="password" placeholder="••••••••" />
                    <Input label="Nueva contraseña" type="password" placeholder="••••••••" />
                    <Input label="Confirmar contraseña" type="password" placeholder="••••••••" />
                    <Button variant="primary" size="sm">Actualizar contraseña</Button>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="primary" onClick={handleSave}>
                      {saved ? <><Check className="h-4 w-4" />Guardado</> : "Guardar cambios"}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => { logout(); router.push(ROUTES.LOGIN); }}>
                      <LogOut className="h-3.5 w-3.5" />
                      Cerrar sesión
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "workspace" && (
                <WorkspaceTab onSave={handleSave} saved={saved} />
              )}

              {activeTab === "members" && (
                <MembersTab />
              )}

              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <h2 className="text-base font-semibold text-text-primary">Apariencia</h2>

                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-3">Tema</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { value: "dark", label: "Oscuro", icon: Moon, preview: "bg-[#050509] border-border" },
                        { value: "light", label: "Claro", icon: Sun, preview: "bg-white border-gray-200" },
                        { value: "system", label: "Sistema", icon: Monitor, preview: "bg-gradient-to-br from-[#050509] to-white border-border" },
                      ] as const).map((t) => {
                        const Icon = t.icon;
                        return (
                          <button
                            key={t.value}
                            onClick={() => setTheme(t.value)}
                            className={cn(
                              "rounded-xl border-2 p-3 text-center transition-all",
                              theme === t.value ? "border-primary bg-primary/8" : "border-border hover:border-primary/40 bg-surface"
                            )}
                          >
                            <div className={cn("h-12 rounded-lg mb-2 border", t.preview)} />
                            <div className="flex items-center justify-center gap-1.5">
                              <Icon className="h-3.5 w-3.5 text-text-muted" />
                              <span className="text-xs font-medium text-text-secondary">{t.label}</span>
                              {theme === t.value && <Check className="h-3 w-3 text-primary" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-3">Densidad</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { value: "compact", label: "Compacta", desc: "Más información en pantalla" },
                        { value: "normal", label: "Normal", desc: "Balance entre densidad y legibilidad" },
                        { value: "wide", label: "Amplia", desc: "Mayor espacio entre elementos" },
                      ] as const).map((d) => (
                        <button
                          key={d.value}
                          onClick={() => setDensity(d.value)}
                          className={cn(
                            "rounded-xl border-2 p-3 text-left transition-all",
                            density === d.value ? "border-primary bg-primary/8" : "border-border hover:border-primary/40 bg-surface"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-text-primary">{d.label}</span>
                            {density === d.value && <Check className="h-3 w-3 text-primary" />}
                          </div>
                          <span className="text-[11px] text-text-muted leading-snug">{d.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-3">Color de acento</h3>
                    <div className="flex gap-3">
                      {ACCENT_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setAccentColor(c.value)}
                          title={c.label}
                          className={cn("h-8 w-8 rounded-full border-2 transition-all", accentColor === c.value ? "border-white scale-110" : "border-transparent")}
                          style={{ backgroundColor: c.value }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

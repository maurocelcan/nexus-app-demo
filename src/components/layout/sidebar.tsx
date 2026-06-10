"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  TrendingUp, DollarSign, ShoppingCart, PieChart,
  Megaphone, Package, Truck, MessageSquarePlus, Map,
  Database, Settings, ChevronRight, ChevronDown, X, Plus, MoreHorizontal,
  Edit2, Archive, Trash2, Folder, FolderOpen, Check, MessagesSquare,
  Calendar, Users, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { NexusLogo } from "./logo";
import { useUiStore } from "@/stores/ui-store";
import { useChatStore } from "@/stores/chat-store";
import { useAuthStore } from "@/stores/auth-store";
import { BUSINESS_AREAS } from "@/data/mock-workspace";
import { ROUTES, PROJECT_ROUTE } from "@/lib/routes";
import type { Conversation, Project, ProjectPriority } from "@/types/analytics";
import { Dropdown } from "@/components/ui/dropdown";
import {
  canCreateChat, canCreateProject, canEditProject, canDeleteProject,
  canArchiveProject, canDeleteChat, canAssignConversation,
  canAccessModule,
} from "@/lib/permissions";

const AREA_ICONS: Record<string, React.ElementType> = {
  ventas: TrendingUp,
  rgm: DollarSign,
  "trade-marketing": ShoppingCart,
  "sell-through": Map,
  finanzas: PieChart,
  marketing: Megaphone,
  supply: Package,
  logistica: Truck,
  planning: Calendar,
  crm: Users,
};

// ─── Assign to project modal ───────────────────────────────────────────────────

interface AssignProjectModalProps {
  conv: Conversation;
  projects: Project[];
  onAssign: (convId: string, projectId: string) => void;
  onClose: () => void;
}

function AssignProjectModal({ conv, projects, onAssign, onClose }: AssignProjectModalProps) {
  const activeProjects = projects.filter((p) => p.status === "active");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="relative z-10 bg-surface-elevated border border-border rounded-xl shadow-2xl w-full max-w-sm p-5"
      >
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-sm font-semibold text-text-primary">Asignar a proyecto</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-text-muted mb-4 truncate">
          &ldquo;{conv.title}&rdquo;
        </p>

        {activeProjects.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-4">Sin proyectos activos</p>
        ) : (
          <div className="space-y-1 mb-4">
            {activeProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => { onAssign(conv.id, p.id); onClose(); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                  conv.projectId === p.id
                    ? "bg-primary/10 border border-primary/25 text-primary-soft"
                    : "hover:bg-surface-soft text-text-secondary hover:text-text-primary"
                )}
              >
                {conv.projectId === p.id
                  ? <FolderOpen className="h-4 w-4 text-accent/70 flex-shrink-0" />
                  : <Folder className="h-4 w-4 text-text-muted flex-shrink-0" />
                }
                <span className="truncate flex-1">{p.name}</span>
                {conv.projectId === p.id && <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Context menu ──────────────────────────────────────────────────────────────

interface ContextMenuProps {
  x: number;
  y: number;
  onRename: () => void;
  onAssign: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClose: () => void;
  showAssign?: boolean;
  showDelete?: boolean;
}

function ConvContextMenu({ x, y, onRename, onAssign, onArchive, onDelete, onClose, showAssign = true, showDelete = true }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.1 }}
      className="fixed z-[80] w-44 bg-surface-elevated border border-border rounded-lg shadow-xl overflow-hidden"
      style={{ left: Math.min(x, window.innerWidth - 190), top: Math.min(y, window.innerHeight - 156) }}
    >
      <button
        onClick={() => { onRename(); onClose(); }}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-soft transition-colors"
      >
        <Edit2 className="h-3.5 w-3.5" />
        Renombrar
      </button>
      {showAssign && (
        <button
          onClick={() => { onAssign(); onClose(); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-soft transition-colors"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          Asignar a proyecto
        </button>
      )}
      <hr className="border-border" />
      <button
        onClick={() => { onArchive(); onClose(); }}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-soft transition-colors"
      >
        <Archive className="h-3.5 w-3.5" />
        Archivar
      </button>
      {showDelete && (
        <button
          onClick={() => { onDelete(); onClose(); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-danger/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar
        </button>
      )}
    </motion.div>
  );
}

function ProjectContextMenu({
  x,
  y,
  onEdit,
  onNewConversation,
  onArchive,
  onDelete,
  onClose,
  showEdit = true,
  showNewConversation = true,
  showArchive = true,
  showDelete = true,
}: {
  x: number;
  y: number;
  onEdit: () => void;
  onNewConversation: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClose: () => void;
  showEdit?: boolean;
  showNewConversation?: boolean;
  showArchive?: boolean;
  showDelete?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.1 }}
      className="fixed z-[80] w-52 bg-surface-elevated border border-border rounded-lg shadow-xl overflow-hidden"
      style={{ left: Math.min(x, window.innerWidth - 218), top: Math.min(y, window.innerHeight - 188) }}
    >
      {showEdit && (
        <button onClick={() => { onEdit(); onClose(); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-soft transition-colors">
          <Edit2 className="h-3.5 w-3.5" />
          Renombrar / editar
        </button>
      )}
      {showNewConversation && (
        <button onClick={() => { onNewConversation(); onClose(); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-soft transition-colors">
          <MessageSquarePlus className="h-3.5 w-3.5" />
          Crear nueva consulta
        </button>
      )}
      {(showArchive || showDelete) && <hr className="border-border" />}
      {showArchive && (
        <button onClick={() => { onArchive(); onClose(); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-soft transition-colors">
          <Archive className="h-3.5 w-3.5" />
          Archivar proyecto
        </button>
      )}
      {showDelete && (
        <button onClick={() => { onDelete(); onClose(); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-danger/10 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar proyecto
        </button>
      )}
    </motion.div>
  );
}

// ─── Conversation item ─────────────────────────────────────────────────────────

interface ConvItemProps {
  conv: Conversation;
  isActive: boolean;
  projects: Project[];
  onSelect: () => void;
  onRename: (id: string, title: string) => void;
  onAssign: (conv: Conversation) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  showAssign?: boolean;
  showDelete?: boolean;
}

function ConvItem({ conv, isActive, onSelect, onRename, onAssign, onArchive, onDelete, showAssign, showDelete }: ConvItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(conv.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) inputRef.current?.focus();
  }, [renaming]);

  function commitRename() {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== conv.title) onRename(conv.id, trimmed);
    setRenaming(false);
  }

  if (renaming) {
    return (
      <div className="px-3 py-1.5">
        <input
          ref={inputRef}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") { setRenaming(false); setRenameValue(conv.title); }
          }}
          className="w-full text-xs bg-surface border border-primary/40 rounded px-2 py-1 text-text-primary outline-none focus:border-primary"
        />
      </div>
    );
  }

  return (
    <div className="relative group">
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => e.key === "Enter" && onSelect()}
        className={cn(
          "flex items-start gap-2 px-3 py-2 rounded-md text-xs transition-colors cursor-pointer",
          isActive
            ? "text-text-primary bg-primary/10 border border-primary/20"
            : "text-text-secondary hover:text-text-primary hover:bg-surface-soft"
        )}
      >
        <MessageSquarePlus className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-text-muted" />
        <span className="truncate leading-snug flex-1">{conv.title}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPos({ x: rect.right - 176, y: rect.bottom + 4 });
            setMenuOpen((v) => !v);
          }}
          className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-primary flex-shrink-0 mt-0.5 transition-opacity"
          aria-label="Opciones"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <ConvContextMenu
            x={menuPos.x}
            y={menuPos.y}
            onRename={() => setRenaming(true)}
            onAssign={() => onAssign(conv)}
            onArchive={() => onArchive(conv.id)}
            onDelete={() => onDelete(conv.id)}
            onClose={() => setMenuOpen(false)}
            showAssign={showAssign}
            showDelete={showDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DeleteConversationModal({ conv, onClose, onDelete }: { conv: Conversation; onClose: () => void; onDelete: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="relative z-10 bg-surface-elevated border border-border rounded-xl shadow-2xl w-full max-w-sm p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Eliminar conversación</h3>
        <p className="text-xs text-text-muted mb-4">Esta acción no se puede deshacer.</p>
        <p className="truncate rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-secondary">{conv.title}</p>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors">Cancelar</button>
          <button onClick={onDelete} className="px-4 py-1.5 text-xs font-medium bg-danger/10 border border-danger/30 text-danger rounded-md hover:bg-danger/20 transition-colors">Eliminar</button>
        </div>
      </motion.div>
    </div>
  );
}

const PRIORITY_OPTIONS: { value: ProjectPriority; label: string }[] = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "critical", label: "Crítica" },
];

function EditProjectModal({ project, onClose, onSave }: { project: Project; onClose: () => void; onSave: (patch: Partial<Pick<Project, "name" | "description" | "area" | "objective" | "owner" | "priority">>) => void }) {
  const [form, setForm] = useState({
    name: project.name,
    description: project.description ?? "",
    area: project.area ?? "",
    objective: project.objective ?? "",
    owner: project.owner ?? "",
    priority: (project.priority ?? "medium") as ProjectPriority,
  });

  function submit() {
    if (!form.name.trim()) return;
    onSave({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      area: form.area.trim() || undefined,
      objective: form.objective.trim() || undefined,
      owner: form.owner.trim() || undefined,
      priority: form.priority,
    });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="relative z-10 bg-surface-elevated border border-border rounded-xl shadow-2xl w-full max-w-md p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Editar proyecto</h3>
            <p className="text-xs text-text-muted mt-0.5">Ajustá nombre, contexto, ownership y prioridad del proyecto.</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          {[
            ["name", "Nombre"],
            ["description", "Descripción"],
            ["area", "Área principal"],
            ["objective", "Objetivo"],
            ["owner", "Owner mock"],
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-xs font-medium text-text-secondary block mb-1">{label}</span>
              <input
                value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted outline-none focus:border-primary"
              />
            </label>
          ))}
          <div>
            <span className="text-xs font-medium text-text-secondary block mb-1">Prioridad</span>
            <Dropdown
              options={PRIORITY_OPTIONS}
              value={form.priority}
              onChange={(v) => setForm((f) => ({ ...f, priority: v as ProjectPriority }))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors">Cancelar</button>
          <button onClick={submit} disabled={!form.name.trim()} className="px-4 py-1.5 text-xs font-medium bg-primary text-white rounded-md disabled:opacity-40 hover:bg-primary/90 transition-colors">Guardar</button>
        </div>
      </motion.div>
    </div>
  );
}

function DeleteProjectModal({ project, conversationCount, onClose, onDelete }: { project: Project; conversationCount: number; onClose: () => void; onDelete: (mode: "keep-conversations" | "delete-conversations") => void }) {
  const [mode, setMode] = useState<"keep-conversations" | "delete-conversations">("keep-conversations");

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="relative z-10 bg-surface-elevated border border-border rounded-xl shadow-2xl w-full max-w-md p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Eliminar proyecto</h3>
        <p className="text-xs text-text-muted mb-4">Vas a eliminar &ldquo;{project.name}&rdquo;. Esta acción no elimina conversaciones salvo que lo indiques.</p>
        {conversationCount > 0 && (
          <div className="space-y-2 mb-4">
            <button onClick={() => setMode("keep-conversations")} className={cn("w-full rounded-lg border px-3 py-2.5 text-left text-xs transition-colors", mode === "keep-conversations" ? "border-primary/40 bg-primary/10 text-text-primary" : "border-border text-text-secondary hover:bg-surface-soft")}>
              Dejar {conversationCount} conversaciones sin proyecto
            </button>
            <button onClick={() => setMode("delete-conversations")} className={cn("w-full rounded-lg border px-3 py-2.5 text-left text-xs transition-colors", mode === "delete-conversations" ? "border-danger/40 bg-danger/10 text-danger" : "border-border text-text-secondary hover:bg-surface-soft")}>
              Eliminar también las conversaciones del proyecto
            </button>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors">Cancelar</button>
          <button onClick={() => onDelete(mode)} className="px-4 py-1.5 text-xs font-medium bg-danger/10 border border-danger/30 text-danger rounded-md hover:bg-danger/20 transition-colors">Eliminar</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── New project modal ─────────────────────────────────────────────────────────

function NewProjectModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, priority: ProjectPriority) => void }) {
  const [name, setName] = useState("");
  const [priority, setPriority] = useState<ProjectPriority>("medium");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  function submit() {
    const trimmed = name.trim();
    if (trimmed) onCreate(trimmed, priority);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="relative z-10 bg-surface-elevated border border-border rounded-xl shadow-2xl w-full max-w-sm p-5"
      >
        <h3 className="text-sm font-semibold text-text-primary mb-1">Nuevo proyecto</h3>
        <p className="text-xs text-text-muted mb-4">Los proyectos agrupan conversaciones relacionadas.</p>
        <input
          ref={ref}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") onClose(); }}
          placeholder="Ej: JBP Carrefour H2 2026"
          className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted outline-none focus:border-primary mb-3"
        />
        <div className="mb-4">
          <span className="text-xs font-medium text-text-secondary block mb-1">Prioridad</span>
          <Dropdown
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={(v) => setPriority(v as ProjectPriority)}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors">
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={!name.trim()}
            className="px-4 py-1.5 text-xs font-medium bg-primary text-white rounded-md disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            Crear proyecto
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  label,
  collapsed,
  onToggle,
  action,
}: {
  label: string;
  collapsed: boolean;
  onToggle: () => void;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-1.5 px-1">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-text-muted font-medium hover:text-text-secondary transition-colors"
      >
        {collapsed
          ? <ChevronRight className="h-3 w-3" />
          : <ChevronDown className="h-3 w-3" />
        }
        {label}
      </button>
      {action}
    </div>
  );
}

// ─── Main sidebar content ──────────────────────────────────────────────────────

function SidebarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    conversations, projects, activeConversationId,
    setActiveConversation, createConversation,
    updateConversationTitle, assignConversationToProject,
    archiveConversation, deleteConversation, createProject,
    updateProject, archiveProject, deleteProject,
  } = useChatStore();
  const { setSidebarOpen, collapsedSections, toggleSection } = useUiStore();
  const { user } = useAuthStore();

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(["proj-001", "proj-003"])
  );
  const [showNewProject, setShowNewProject] = useState(false);
  const [assignConv, setAssignConv] = useState<Conversation | null>(null);
  const [deletingConversation, setDeletingConversation] = useState<Conversation | null>(null);
  const [projectMenu, setProjectMenu] = useState<{ project: Project; x: number; y: number } | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [soonToast, setSoonToast] = useState<string | null>(null);

  const activeConvs = conversations
    .filter((c) => c.status === "active")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const recentConvs = activeConvs.slice(0, 5);

  function openConversation(convId: string) {
    const conv = conversations.find((c) => c.id === convId);
    if (conv?.projectId) {
      setSidebarOpen(false);
      router.push(`/workspace/projects/${conv.projectId}?tab=chat&convId=${convId}`);
    } else {
      setActiveConversation(convId);
      setSidebarOpen(false);
      router.push(ROUTES.WORKSPACE);
    }
  }

  function handleNewConversation(projectId?: string, area?: string) {
    if (!canCreateChat(user)) return;
    if (projectId) {
      const conv = createConversation(undefined, projectId, area);
      setSidebarOpen(false);
      router.push(`${PROJECT_ROUTE(projectId)}?tab=chat&convId=${conv.id}`);
    } else {
      createConversation(undefined, undefined, area);
      setSidebarOpen(false);
      router.push(ROUTES.WORKSPACE);
    }
  }

  function toggleProject(id: string) {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const convItemProps = (conv: Conversation) => ({
    conv,
    isActive: conv.id === activeConversationId,
    projects,
    onSelect: () => openConversation(conv.id),
    onRename: updateConversationTitle,
    onAssign: (c: Conversation) => {
      if (!canAssignConversation(user)) return;
      setAssignConv(c);
    },
    onArchive: (id: string) => {
      archiveConversation(id);
      setSoonToast("Conversación archivada");
      window.setTimeout(() => setSoonToast(null), 1800);
    },
    onDelete: (id: string) => {
      if (!canDeleteChat(user, conv)) return;
      const target = conversations.find((conversation) => conversation.id === id);
      if (target) setDeletingConversation(target);
    },
    showAssign: canAssignConversation(user),
    showDelete: canDeleteChat(user, conv),
  });

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <NexusLogo size="sm" />
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-text-muted hover:text-text-primary">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* New conversation */}
      <div className="px-3 pt-3 flex-shrink-0">
        {canCreateChat(user) ? (
          <button
            onClick={() => handleNewConversation()}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md bg-primary/10 border border-primary/25 text-primary-soft text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Nueva consulta
          </button>
        ) : (
          <div
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md bg-surface border border-border text-text-muted text-sm cursor-not-allowed opacity-60"
            title="Solo lectura: no podés crear conversaciones"
          >
            <Sparkles className="h-4 w-4" />
            Nueva consulta
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 min-h-0">
        {/* Projects */}
        <section>
          <SectionHeader
            label="Proyectos"
            collapsed={collapsedSections.projects}
            onToggle={() => toggleSection("projects")}
            action={
              canCreateProject(user) ? (
                <button
                  onClick={() => setShowNewProject(true)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                  title="Nuevo proyecto"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              ) : undefined
            }
          />
          <AnimatePresence initial={false}>
            {!collapsedSections.projects && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden space-y-0.5"
              >
                {projects.filter((p) => p.status === "active").slice(0, 6).map((p) => {
                  const isExpanded = expandedProjects.has(p.id);
                  const projectConvs = activeConvs.filter((c) => c.projectId === p.id);
                  const projectPath = PROJECT_ROUTE(p.id);
                  const isProjectActive = pathname === projectPath;
                  return (
                    <div key={p.id}>
                      <div
                        className={cn(
                          "group/project w-full flex items-center gap-1 px-1 py-1.5 rounded-md text-xs transition-colors",
                          isProjectActive
                            ? "text-text-primary bg-primary/10 border border-primary/20"
                            : "text-text-secondary hover:text-text-primary hover:bg-surface-soft"
                        )}
                      >
                        <button
                          onClick={() => toggleProject(p.id)}
                          className="flex-shrink-0 p-0.5 text-text-muted hover:text-text-primary transition-colors rounded"
                          aria-label={isExpanded ? "Colapsar" : "Expandir"}
                        >
                          <ChevronRight
                            className={cn("h-3 w-3 transition-transform duration-200", isExpanded && "rotate-90")}
                          />
                        </button>
                        <button
                          onClick={() => { setSidebarOpen(false); router.push(projectPath); }}
                          className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
                        >
                          {isExpanded
                            ? <FolderOpen className="h-3.5 w-3.5 flex-shrink-0 text-accent/70" />
                            : <Folder className="h-3.5 w-3.5 flex-shrink-0 text-text-muted" />
                          }
                          <span className="truncate flex-1">{p.name}</span>
                        </button>
                        {projectConvs.length > 0 && (
                          <span className="text-[10px] text-text-muted flex-shrink-0 tabular-nums pr-1">{projectConvs.length}</span>
                        )}
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setProjectMenu({ project: p, x: rect.right - 208, y: rect.bottom + 4 });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setProjectMenu({ project: p, x: rect.right - 208, y: rect.bottom + 4 });
                            }
                          }}
                          className="opacity-0 group-hover/project:opacity-100 text-text-muted hover:text-text-primary transition-opacity flex-shrink-0"
                          aria-label="Opciones de proyecto"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </span>
                      </div>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-5 space-y-0.5 pb-1">
                              {projectConvs.length === 0 && (
                                <p className="px-3 py-1.5 text-[11px] text-text-muted italic">Sin conversaciones</p>
                              )}
                              {projectConvs.map((conv) => (
                                <ConvItem key={conv.id} {...convItemProps(conv)} />
                              ))}
                              {canCreateChat(user) && (
                                <button
                                  onClick={() => handleNewConversation(p.id, p.area)}
                                  className="w-full flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] text-text-muted hover:text-text-secondary hover:bg-surface-soft transition-colors"
                                >
                                  <Plus className="h-3 w-3" />
                                  Nueva consulta aquí
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.nav>
            )}
          </AnimatePresence>
        </section>

        {/* Recientes */}
        <section>
          <SectionHeader
            label="Recientes"
            collapsed={collapsedSections.recents}
            onToggle={() => toggleSection("recents")}
          />
          <AnimatePresence initial={false}>
            {!collapsedSections.recents && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden space-y-0.5"
              >
                {recentConvs.length === 0 && (
                  <p className="px-3 py-1.5 text-[11px] text-text-muted italic">Sin conversaciones recientes</p>
                )}
                {recentConvs.map((conv) => (
                  <ConvItem key={conv.id} {...convItemProps(conv)} />
                ))}
                {recentConvs.length > 0 && (
                  <Link
                    href={ROUTES.CONVERSATIONS}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] text-text-muted hover:text-text-secondary hover:bg-surface-soft transition-colors"
                  >
                    Ver todos
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                )}
              </motion.nav>
            )}
          </AnimatePresence>
        </section>

        {/* Business areas */}
        <section>
          <SectionHeader
            label="Áreas"
            collapsed={collapsedSections.areas}
            onToggle={() => toggleSection("areas")}
          />
          <AnimatePresence initial={false}>
            {!collapsedSections.areas && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden space-y-0.5"
              >
                {BUSINESS_AREAS.filter((a) => a.active && canAccessModule(user, a.id)).map((area) => {
                  const Icon = AREA_ICONS[area.id] ?? TrendingUp;
                  const isNavigable = !!area.route;
                  const href = area.route ?? ROUTES.VENTAS;
                  const isActive = pathname === href;

                  if (!isNavigable) {
                    return (
                      <div
                        key={area.id}
                        onClick={() => {
                          setSoonToast(`${area.name} próximamente`);
                          window.setTimeout(() => setSoonToast(null), 1800);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-text-muted cursor-not-allowed opacity-60"
                        title={area.description}
                      >
                        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="flex-1">{area.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface-soft border border-border text-text-muted font-medium tracking-wide">
                          Próximo
                        </span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={area.id}
                      href={href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                        isActive
                          ? "text-primary-soft bg-primary/10 border border-primary/20"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-soft"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{area.name}</span>
                    </Link>
                  );
                })}
              </motion.nav>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* Bottom */}
      <div className="border-t border-border px-3 py-3 space-y-0.5">
        <Link
          href={ROUTES.CONVERSATIONS}
          onClick={() => setSidebarOpen(false)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
            pathname === ROUTES.CONVERSATIONS
              ? "text-primary-soft bg-primary/10"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-soft"
          )}
        >
          <MessagesSquare className="h-3.5 w-3.5" />
          Conversaciones
        </Link>
        <Link
          href={ROUTES.DATA_SOURCES}
          onClick={() => setSidebarOpen(false)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
            pathname.includes("data-sources")
              ? "text-primary-soft bg-primary/10"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-soft"
          )}
        >
          <Database className="h-3.5 w-3.5" />
          Fuentes de datos
        </Link>
        <Link
          href={ROUTES.SETTINGS}
          onClick={() => setSidebarOpen(false)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
            pathname === ROUTES.SETTINGS
              ? "text-primary-soft bg-primary/10"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-soft"
          )}
        >
          <Settings className="h-3.5 w-3.5" />
          Configuración
        </Link>
      </div>

      <AnimatePresence>
        {showNewProject && canCreateProject(user) && (
          <NewProjectModal
            onClose={() => setShowNewProject(false)}
            onCreate={(name, priority) => {
              if (!canCreateProject(user)) return;
              const created = createProject(name, undefined, undefined, undefined, priority);
              setShowNewProject(false);
              router.push(`${PROJECT_ROUTE(created.id)}?tab=chat`);
            }}
          />
        )}
        {assignConv && (
          <AssignProjectModal
            conv={assignConv}
            projects={projects}
            onAssign={(convId, projectId) => {
              if (!canAssignConversation(user)) return;
              assignConversationToProject(convId, projectId);
            }}
            onClose={() => setAssignConv(null)}
          />
        )}
        {deletingConversation && (
          <DeleteConversationModal
            conv={deletingConversation}
            onClose={() => setDeletingConversation(null)}
            onDelete={() => {
              if (!canDeleteChat(user, deletingConversation)) return;
              deleteConversation(deletingConversation.id);
              setDeletingConversation(null);
            }}
          />
        )}
        {projectMenu && (
          <ProjectContextMenu
            x={projectMenu.x}
            y={projectMenu.y}
            onEdit={() => {
              if (!canEditProject(user, projectMenu.project)) return;
              setEditingProject(projectMenu.project);
            }}
            onNewConversation={() => handleNewConversation(projectMenu.project.id, projectMenu.project.area)}
            onArchive={() => {
              if (!canArchiveProject(user, projectMenu.project)) return;
              archiveProject(projectMenu.project.id);
            }}
            onDelete={() => {
              if (!canDeleteProject(user)) return;
              setDeletingProject(projectMenu.project);
            }}
            onClose={() => setProjectMenu(null)}
            showEdit={canEditProject(user, projectMenu.project)}
            showNewConversation={canCreateChat(user)}
            showArchive={canArchiveProject(user, projectMenu.project)}
            showDelete={canDeleteProject(user)}
          />
        )}
        {editingProject && canEditProject(user, editingProject) && (
          <EditProjectModal
            project={editingProject}
            onClose={() => setEditingProject(null)}
            onSave={(patch) => {
              if (!canEditProject(user, editingProject)) return;
              updateProject(editingProject.id, patch);
              setEditingProject(null);
            }}
          />
        )}
        {deletingProject && canDeleteProject(user) && (
          <DeleteProjectModal
            project={deletingProject}
            conversationCount={conversations.filter((c) => c.projectId === deletingProject.id).length}
            onClose={() => setDeletingProject(null)}
            onDelete={(mode) => {
              if (!canDeleteProject(user)) return;
              deleteProject(deletingProject.id, mode);
              setDeletingProject(null);
            }}
          />
        )}
        {soonToast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed left-1/2 top-4 z-[90] -translate-x-1/2 rounded-lg border border-border bg-surface-elevated px-4 py-2 text-xs text-text-secondary shadow-xl"
          >
            {soonToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Exported sidebar with mobile overlay ─────────────────────────────────────

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 h-full border-r border-border bg-surface">
        <SidebarContent />
      </aside>

      {/* Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 w-60 h-full border-r border-border bg-surface lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

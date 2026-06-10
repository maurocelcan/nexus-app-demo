"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  MessagesSquare, Search, Archive, Trash2, FolderOpen,
  MessageSquarePlus, ChevronDown, Filter, Edit2,
} from "lucide-react";
import { useChatStore } from "@/stores/chat-store";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/analytics";
import { canAssignConversation, canDeleteChat } from "@/lib/permissions";
import { BUSINESS_AREAS, getBusinessArea, normalizeAreaId, normalizeAreaIds, type BusinessAreaId } from "@/data/business-areas";
import { AreaBadge, ConversationAreaBadge } from "@/components/ui/area-badge";

type FilterType = "all" | "unassigned" | "archived" | "active";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Ahora";
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `hace ${d}d`;
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

function getConversationAreaIds(conv: Conversation): BusinessAreaId[] {
  return normalizeAreaIds(conv.areaIds?.length ? conv.areaIds : [conv.primaryAreaId, conv.area, conv.scope]);
}

function ConvRow({
  conv,
  projectName,
  onOpen,
  onRename,
  onAssign,
  onArchive,
  onDelete,
  canAssign,
  canDelete,
}: {
  conv: Conversation;
  projectName?: string;
  onOpen: () => void;
  onRename: () => void;
  onAssign: () => void;
  onArchive: () => void;
  onDelete: () => void;
  canAssign: boolean;
  canDelete: boolean;
}) {
  const isArchived = conv.status === "archived";
  const displayAreaIds = getConversationAreaIds(conv);

  return (
    <div
      className={cn(
        "group flex items-center gap-0 px-6 py-0 border-b border-border/40 last:border-0 hover:bg-surface-soft/50 transition-colors",
        isArchived && "opacity-50"
      )}
    >
      {/* Title column — flex-1 */}
      <button
        onClick={onOpen}
        className="flex-1 min-w-0 flex items-center gap-3 text-left py-3 pr-4"
      >
        <div className="h-7 w-7 rounded-md bg-surface-soft border border-border/60 flex items-center justify-center flex-shrink-0">
          <MessageSquarePlus className="h-3.5 w-3.5 text-text-muted" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-text-primary truncate leading-snug">{conv.title}</p>
          {conv.messageCount > 0 && (
            <p className="text-[11px] text-text-muted mt-0.5">{conv.messageCount} {conv.messageCount === 1 ? "mensaje" : "mensajes"}</p>
          )}
        </div>
      </button>

      {/* Area column — hidden below md */}
      <div className="hidden md:flex w-32 flex-shrink-0 py-3 pr-4">
        {displayAreaIds.length > 0 ? <ConversationAreaBadge conversation={conv} compact /> : <span className="text-xs text-text-muted/30">—</span>}
      </div>

      {/* Project column — hidden below lg */}
      <div className="hidden lg:flex w-48 flex-shrink-0 items-center gap-1.5 py-3 pr-4 min-w-0">
        {projectName ? (
          <>
            <FolderOpen className="h-3 w-3 text-text-muted/60 flex-shrink-0" />
            <span className="text-xs text-text-muted truncate">{projectName}</span>
          </>
        ) : (
          <span className="text-xs text-text-muted/30">—</span>
        )}
      </div>

      {/* Time column — hidden below sm */}
      <div className="hidden sm:flex w-24 flex-shrink-0 py-3 pr-4">
        <span className="text-xs text-text-muted">{relativeTime(conv.updatedAt)}</span>
      </div>

      {/* Actions — hover-revealed */}
      <div className="flex items-center gap-0.5 flex-shrink-0 py-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onRename}
          className="p-1.5 text-text-muted hover:text-text-secondary transition-colors rounded hover:bg-surface-soft"
          title="Renombrar"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        {canAssign && (
          <button
            onClick={onAssign}
            className="p-1.5 text-text-muted hover:text-text-secondary transition-colors rounded hover:bg-surface-soft"
            title="Asignar a proyecto"
          >
            <FolderOpen className="h-3.5 w-3.5" />
          </button>
        )}
        {!isArchived && (
          <button
            onClick={onArchive}
            className="p-1.5 text-text-muted hover:text-text-secondary transition-colors rounded hover:bg-surface-soft"
            title="Archivar"
          >
            <Archive className="h-3.5 w-3.5" />
          </button>
        )}
        {isArchived && (
          <button
            onClick={onArchive}
            className="p-1.5 text-text-muted hover:text-text-secondary transition-colors rounded hover:bg-surface-soft"
            title="Restaurar"
          >
            <Archive className="h-3.5 w-3.5 rotate-180" />
          </button>
        )}
        {canDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 text-text-muted hover:text-danger transition-colors rounded hover:bg-danger/10"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function ConversationModal({
  mode,
  conv,
  projects,
  onClose,
  onSave,
}: {
  mode: "rename" | "assign";
  conv: Conversation;
  projects: { id: string; name: string; status: string }[];
  onClose: () => void;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(mode === "rename" ? conv.title : conv.projectId ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-xl border border-border bg-surface-elevated p-5 shadow-2xl">
        <h3 className="text-sm font-semibold text-text-primary mb-1">
          {mode === "rename" ? "Renombrar conversación" : "Asignar a proyecto"}
        </h3>
        <p className="text-xs text-text-muted mb-4 truncate">&ldquo;{conv.title}&rdquo;</p>
        {mode === "rename" ? (
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onSave(value); if (e.key === "Escape") onClose(); }}
            className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text-primary outline-none focus:border-primary"
          />
        ) : (
          <div className="space-y-1.5">
            <button
              onClick={() => setValue("")}
              className={cn("w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors", value === "" ? "border-primary/40 bg-primary/10 text-text-primary" : "border-border text-text-secondary hover:bg-surface-soft")}
            >
              Sin proyecto
            </button>
            {projects.filter((p) => p.status === "active").map((p) => (
              <button
                key={p.id}
                onClick={() => setValue(p.id)}
                className={cn("w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors", value === p.id ? "border-primary/40 bg-primary/10 text-text-primary" : "border-border text-text-secondary hover:bg-surface-soft")}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors">Cancelar</button>
          <button onClick={() => onSave(value)} disabled={mode === "rename" && !value.trim()} className="px-4 py-1.5 text-xs font-medium bg-primary text-white rounded-md disabled:opacity-40 hover:bg-primary/90 transition-colors">Guardar</button>
        </div>
      </div>
    </div>
  );
}

function DeleteConversationModal({
  conv,
  onClose,
  onConfirm,
}: {
  conv: Conversation;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-xl border border-border bg-surface-elevated p-5 shadow-2xl">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Eliminar conversación</h3>
        <p className="text-xs text-text-muted mb-4">
          Esta acción no se puede deshacer.
        </p>
        <p className="truncate rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-secondary">
          {conv.title}
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-1.5 text-xs font-medium bg-danger/10 border border-danger/30 text-danger rounded-md hover:bg-danger/20 transition-colors">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

export default function ConversationsPage() {
  const router = useRouter();
  const { conversations, projects, setActiveConversation, archiveConversation, restoreConversation, deleteConversation, updateConversationTitle, assignConversationToProject } = useChatStore();
  const { user } = useAuthStore();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showAreaMenu, setShowAreaMenu] = useState(false);
  const [modal, setModal] = useState<{ mode: "rename" | "assign"; conv: Conversation } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [toast, setToast] = useState<{ message: string; undoId?: string } | null>(null);

  const projectMap = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.id, p.name])),
    [projects]
  );

  const filtered = useMemo(() => {
    let list = [...conversations];

    if (filter === "all") list = list.filter((c) => c.status !== "archived");
    else if (filter === "active") list = list.filter((c) => c.status === "active");
    else if (filter === "unassigned") list = list.filter((c) => c.status === "active" && !c.projectId);
    else if (filter === "archived") list = list.filter((c) => c.status === "archived");

    if (projectFilter !== "all") {
      list = list.filter((c) => c.projectId === projectFilter);
    }
    if (areaFilter !== "all") {
      list = list.filter((c) => getConversationAreaIds(c).includes(areaFilter as BusinessAreaId));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q));
    }

    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [conversations, filter, projectFilter, areaFilter, search]);

  function showToast(message: string, undoId?: string) {
    setToast({ message, undoId });
    window.setTimeout(() => setToast(null), 4000);
  }

  function openConversation(conv: Conversation) {
    if (conv.projectId) {
      router.push(`/workspace/projects/${conv.projectId}?tab=chat&convId=${conv.id}`);
    } else {
      setActiveConversation(conv.id);
      router.push(ROUTES.WORKSPACE);
    }
  }

  const counts = {
    all: conversations.filter((c) => c.status !== "archived").length,
    active: conversations.filter((c) => c.status === "active").length,
    unassigned: conversations.filter((c) => c.status === "active" && !c.projectId).length,
    archived: conversations.filter((c) => c.status === "archived").length,
  };

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "active", label: "Activas" },
    { key: "unassigned", label: "Sin proyecto" },
    { key: "archived", label: "Archivadas" },
  ];

  const selectedProjectName = projectFilter !== "all" ? projectMap[projectFilter] : null;
  const areas = BUSINESS_AREAS.filter((area) =>
    conversations.some((conversation) => getConversationAreaIds(conversation).includes(area.id))
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="border-b border-border bg-surface px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MessagesSquare className="h-4 w-4 text-text-muted" />
            <div>
              <h1 className="text-sm font-semibold text-text-primary">Conversaciones</h1>
              <p className="text-xs text-text-muted mt-0.5">Historial de consultas al asistente</p>
            </div>
          </div>
          <span className="text-xs text-text-muted">{counts.all} conversaciones</span>
        </div>
      </div>

      {/* Filters row */}
      <div className="border-b border-border bg-surface flex-shrink-0">
        <div className="flex items-center gap-0 overflow-x-auto px-2">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                filter === key
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              )}
            >
              {label}
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                filter === key ? "bg-primary/15 text-primary" : "bg-surface-soft text-text-muted"
              )}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search + filters toolbar */}
      <div className="px-6 py-2.5 border-b border-border/50 bg-surface flex-shrink-0 flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversaciones..."
            className="w-full bg-surface-soft border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Area filter */}
        <div className="relative">
          <button
            onClick={() => setShowAreaMenu((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors",
              areaFilter !== "all"
                ? "border-primary/40 bg-primary/10 text-primary-soft"
                : "border-border bg-surface-soft text-text-muted hover:text-text-secondary"
            )}
          >
            <Filter className="h-3 w-3" />
            {areaFilter === "all" ? "Área" : (getBusinessArea(normalizeAreaId(areaFilter))?.shortLabel ?? areaFilter)}
            <ChevronDown className="h-3 w-3" />
          </button>
          {showAreaMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowAreaMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg border border-border bg-surface-elevated shadow-lg py-1">
                <button
                  onClick={() => { setAreaFilter("all"); setShowAreaMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-text-secondary hover:bg-surface-soft transition-colors"
                >
                  Todas las áreas
                </button>
                {areas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => { setAreaFilter(area.id); setShowAreaMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-surface-soft transition-colors"
                  >
                    <AreaBadge areaId={area.id} short />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Project filter */}
        <div className="relative">
          <button
            onClick={() => setShowProjectMenu((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors",
              selectedProjectName
                ? "border-primary/40 bg-primary/10 text-primary-soft"
                : "border-border bg-surface-soft text-text-muted hover:text-text-secondary"
            )}
          >
            <Filter className="h-3 w-3" />
            {selectedProjectName ?? "Proyecto"}
            <ChevronDown className="h-3 w-3" />
          </button>
          {showProjectMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProjectMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-border bg-surface-elevated shadow-lg py-1">
                <button
                  onClick={() => { setProjectFilter("all"); setShowProjectMenu(false); }}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface-soft transition-colors", projectFilter === "all" && "text-primary")}
                >
                  Todos los proyectos
                </button>
                {projects.filter((p) => p.status === "active").map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setProjectFilter(p.id); setShowProjectMenu(false); }}
                    className={cn("w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface-soft transition-colors", projectFilter === p.id && "text-primary")}
                  >
                    <FolderOpen className="h-3.5 w-3.5 text-text-muted/60" />
                    <span className="truncate text-text-secondary">{p.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
            <div className="h-12 w-12 rounded-xl bg-surface-soft flex items-center justify-center">
              <MessagesSquare className="h-5 w-5 text-text-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary">
                {search ? "Sin resultados" : "No hay conversaciones"}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {filter === "archived"
                  ? "No hay conversaciones archivadas."
                  : filter === "unassigned"
                    ? "No hay conversaciones sin proyecto."
                    : search
                      ? `No se encontraron conversaciones para "${search}"`
                      : "Las conversaciones aparecen aquí cuando usás el chat con el asistente."
                }
              </p>
            </div>
            {filter !== "archived" && (
              <button
                onClick={() => router.push(ROUTES.WORKSPACE)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-medium text-primary-soft hover:bg-primary/20 transition-colors"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                Nueva consulta
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Column headers */}
            <div className="flex items-center gap-0 px-6 py-2 border-b border-border/40 sticky top-0 bg-surface z-10">
              <div className="flex-1 pr-4">
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Conversación</span>
              </div>
              <div className="hidden md:flex w-32 flex-shrink-0 pr-4">
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Área</span>
              </div>
              <div className="hidden lg:flex w-48 flex-shrink-0 pr-4">
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Proyecto</span>
              </div>
              <div className="hidden sm:flex w-24 flex-shrink-0 pr-4">
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Actividad</span>
              </div>
              {/* actions placeholder to match hover area width */}
              <div className="w-[calc(4*2.25rem)] flex-shrink-0" />
            </div>

            {/* Rows */}
            {filtered.map((conv) => (
              <ConvRow
                key={conv.id}
                conv={conv}
                projectName={conv.projectId ? projectMap[conv.projectId] : undefined}
                onOpen={() => openConversation(conv)}
                onRename={() => setModal({ mode: "rename", conv })}
                onAssign={() => {
                  if (!canAssignConversation(user)) return;
                  setModal({ mode: "assign", conv });
                }}
                onArchive={() => {
                  if (conv.status === "archived") {
                    restoreConversation(conv.id);
                    showToast("Conversación restaurada");
                  } else {
                    archiveConversation(conv.id);
                    showToast("Conversación archivada", conv.id);
                  }
                }}
                onDelete={() => {
                  if (!canDeleteChat(user, conv)) return;
                  setDeleteTarget(conv);
                }}
                canAssign={canAssignConversation(user)}
                canDelete={canDeleteChat(user, conv)}
              />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <ConversationModal
          mode={modal.mode}
          conv={modal.conv}
          projects={projects}
          onClose={() => setModal(null)}
          onSave={(value) => {
            if (modal.mode === "rename") updateConversationTitle(modal.conv.id, value.trim());
            else {
              if (!canAssignConversation(user)) return;
              assignConversationToProject(modal.conv.id, value || undefined);
            }
            setModal(null);
          }}
        />
      )}
      {deleteTarget && (
        <DeleteConversationModal
          conv={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (!canDeleteChat(user, deleteTarget)) return;
            deleteConversation(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      )}
      {toast && (
        <div className="fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-lg border border-border bg-surface-elevated px-4 py-2 text-xs text-text-secondary shadow-xl">
          <span>{toast.message}</span>
          {toast.undoId && (
            <button
              onClick={() => {
                restoreConversation(toast.undoId!);
                setToast({ message: "Conversación restaurada" });
              }}
              className="font-medium text-primary-soft hover:text-primary"
            >
              Deshacer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

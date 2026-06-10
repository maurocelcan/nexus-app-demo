"use client";
import Link from "next/link";
import { Menu, Bell, Settings, LogOut, ChevronDown, Zap, Database, AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useUiStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useDataSourceStore, hasAnyDataSource } from "@/stores/data-source-store";
import { useNotificationStore } from "@/stores/notification-store";
import { ROUTES } from "@/lib/routes";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

const NOTIF_ICONS = {
  alert: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

const NOTIF_COLORS = {
  alert: "text-danger",
  success: "text-success",
  warning: "text-warning",
  info: "text-info",
};

function NotificationsDropdown({ onClose }: { onClose: () => void }) {
  const { notifications, markRead, markAllRead } = useNotificationStore();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const unread = notifications.filter((n) => !n.read).length;

  function handleClick(id: string, link?: string) {
    markRead(id);
    if (link) {
      router.push(link);
      onClose();
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.14 }}
      className="absolute right-0 top-full mt-2 w-80 bg-surface-elevated border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary">Notificaciones</span>
          {unread > 0 && (
            <span className="text-[10px] font-bold bg-danger text-white rounded-full px-1.5 py-0.5 leading-none">{unread}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] text-primary-soft hover:text-primary transition-colors"
            >
              Marcar todo leído
            </button>
          )}
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 && (
          <p className="px-4 py-6 text-sm text-text-muted text-center">Sin notificaciones</p>
        )}
        {notifications.map((n) => {
          const Icon = NOTIF_ICONS[n.type];
          const color = NOTIF_COLORS[n.type];
          return (
            <button
              key={n.id}
              onClick={() => handleClick(n.id, n.link)}
              className={cn(
                "w-full text-left flex items-start gap-3 px-4 py-3 border-b border-border/50 transition-colors hover:bg-surface-soft",
                !n.read && "bg-primary/4"
              )}
            >
              <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", color)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className={cn("text-xs font-medium truncate", n.read ? "text-text-secondary" : "text-text-primary")}>
                    {n.title}
                  </span>
                  <span className="text-[10px] text-text-muted flex-shrink-0">{relativeTime(n.createdAt)}</span>
                </div>
                <p className="text-[11px] text-text-muted leading-snug line-clamp-2">{n.description}</p>
              </div>
              {!n.read && (
                <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

export function Topbar() {
  const { toggleSidebar } = useUiStore();
  const { user, logout } = useAuthStore();
  const { workspace } = useWorkspaceStore();
  const { hasDemoLoaded, files, dataConnectionStatus, lastProcessedFileName } = useDataSourceStore();
  const { unreadCount } = useNotificationStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  const hasData = hasAnyDataSource({ files, hasDemoLoaded });

  let dataStatus: string;
  if (dataConnectionStatus === "processing") {
    dataStatus = "Procesando archivo…";
  } else if (hasDemoLoaded) {
    dataStatus = `Demo CPG conectada · ${files.length} fuentes`;
  } else if (hasData) {
    const name = lastProcessedFileName ? `${lastProcessedFileName} · ` : "";
    dataStatus = `${name}${files.length} fuente${files.length !== 1 ? "s" : ""} conectada${files.length !== 1 ? "s" : ""}`;
  } else {
    dataStatus = "Sin fuentes conectadas";
  }

  const unread = unreadCount();

  return (
    <header className="h-14 flex-shrink-0 border-b border-border bg-surface flex items-center justify-between px-4 gap-4">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-text-primary truncate">
            {workspace?.name ?? "CPG Growth Team"}
          </span>
          <span className="text-text-muted text-sm flex-shrink-0">/</span>
          <div className={cn(
            "flex items-center gap-1.5 text-xs bg-surface-soft border px-2 py-1 rounded-full flex-shrink-0",
            hasData ? "text-text-secondary border-border" : "text-text-muted border-border/50"
          )}>
            <Zap className={cn("h-3 w-3", hasData ? "text-accent" : "text-text-muted")} />
            {dataStatus}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <Link
          href={ROUTES.DATA_SOURCES}
          className="hidden md:flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-md hover:bg-surface-soft"
          title="Fuentes de datos"
        >
          <Database className="h-4 w-4" />
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifsOpen((v) => !v); setMenuOpen(false); }}
            className="relative text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-md hover:bg-surface-soft"
            aria-label="Notificaciones"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifsOpen && (
              <NotificationsDropdown onClose={() => setNotifsOpen(false)} />
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative ml-1">
          <button
            onClick={() => { setMenuOpen((v) => !v); setNotifsOpen(false); }}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-soft transition-colors"
          >
            <Avatar name={user?.name} size="sm" />
            <span className="hidden md:block text-sm text-text-secondary">{user?.name?.split(" ")[0]}</span>
            <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full mt-2 w-52 bg-surface-elevated border border-border rounded-lg shadow-xl z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    href={ROUTES.SETTINGS}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-soft transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Configuración
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

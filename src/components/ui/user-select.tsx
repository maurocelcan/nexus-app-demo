"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X, UserRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

export interface SelectableMember {
  id: string;
  name: string;
  title?: string;
  department?: string;
}

// ─── UserSelect — single owner ─────────────────────────────────────────────────

interface UserSelectProps {
  label?: string;
  members: SelectableMember[];
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
}

export function UserSelect({ label, members, value, onChange, placeholder = "Sin asignar" }: UserSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = members.find((m) => m.name === value);
  const filtered = query
    ? members.filter((m) =>
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.title?.toLowerCase().includes(query.toLowerCase()) ||
        m.department?.toLowerCase().includes(query.toLowerCase())
      )
    : members;

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <span className="block text-[10px] font-medium uppercase tracking-wide text-text-muted mb-1.5">
          {label}
        </span>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl border bg-surface-elevated px-3 py-2.5 text-left transition-all",
          "hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          open ? "border-primary/50 ring-1 ring-primary/25" : "border-border"
        )}
      >
        {selected ? (
          <>
            <Avatar name={selected.name} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-text-primary">{selected.name}</span>
              {(selected.title || selected.department) && (
                <span className="block truncate text-[10px] text-text-muted">
                  {[selected.title, selected.department].filter(Boolean).join(" · ")}
                </span>
              )}
            </span>
          </>
        ) : (
          <>
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-dashed border-border bg-surface-soft">
              <UserRound className="h-3.5 w-3.5 text-text-muted" />
            </div>
            <span className="flex-1 text-xs text-text-muted">{placeholder}</span>
          </>
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 flex-shrink-0 text-text-muted transition-transform", open && "rotate-180")} />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 top-full z-[200] mt-1.5 w-full min-w-56 overflow-hidden rounded-xl border border-primary/25 bg-surface p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.65),0_2px_8px_rgba(0,0,0,0.3)]"
          >
            {/* Search */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-2.5 py-1.5 mb-1.5 mx-0.5">
              <Search className="h-3 w-3 flex-shrink-0 text-text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar…"
                className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="text-text-muted hover:text-text-primary">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Members list */}
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-3 py-3 text-center text-xs text-text-muted">Sin resultados</p>
              ) : (
                filtered.map((m) => {
                  const isSelected = value === m.name;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => { onChange(m.name); setOpen(false); setQuery(""); }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                        isSelected ? "bg-primary/15 text-primary-soft" : "hover:bg-surface-soft"
                      )}
                    >
                      <Avatar name={m.name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-text-primary">{m.name}</span>
                        {(m.title || m.department) && (
                          <span className="block truncate text-[10px] text-text-muted">
                            {[m.title, m.department].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── UserMultiSelect — team ────────────────────────────────────────────────────

interface UserMultiSelectProps {
  label?: string;
  members: SelectableMember[];
  value: string[];
  onChange: (names: string[]) => void;
  placeholder?: string;
}

export function UserMultiSelect({ label, members, value, onChange, placeholder = "Agregar miembros al equipo..." }: UserMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query
    ? members.filter((m) =>
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.title?.toLowerCase().includes(query.toLowerCase()) ||
        m.department?.toLowerCase().includes(query.toLowerCase())
      )
    : members;

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function toggle(name: string) {
    if (value.includes(name)) {
      onChange(value.filter((n) => n !== name));
    } else {
      onChange([...value, name]);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <span className="block text-[10px] font-medium uppercase tracking-wide text-text-muted mb-1.5">
          {label}
        </span>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl border bg-surface-elevated px-3 py-2.5 text-left transition-all",
          "hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          open ? "border-primary/50 ring-1 ring-primary/25" : "border-border"
        )}
      >
        {value.length > 0 ? (
          <div className="flex flex-1 items-center gap-1.5 overflow-hidden">
            <div className="flex -space-x-1.5 overflow-hidden">
              {value.slice(0, 4).map((name) => (
                <Avatar key={name} name={name} size="xs" className="ring-1 ring-surface" />
              ))}
            </div>
            <span className="ml-1 text-xs font-medium text-text-primary">
              {value.length === 1 ? value[0] : `${value.length} miembros`}
            </span>
          </div>
        ) : (
          <span className="flex-1 text-xs text-text-muted">{placeholder}</span>
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 flex-shrink-0 text-text-muted transition-transform", open && "rotate-180")} />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 top-full z-[200] mt-1.5 w-full min-w-56 overflow-hidden rounded-xl border border-primary/25 bg-surface p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.65),0_2px_8px_rgba(0,0,0,0.3)]"
          >
            {/* Search */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-2.5 py-1.5 mb-1.5 mx-0.5">
              <Search className="h-3 w-3 flex-shrink-0 text-text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar miembros…"
                className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="text-text-muted hover:text-text-primary">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Members list */}
            <div className="max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-3 py-3 text-center text-xs text-text-muted">Sin resultados</p>
              ) : (
                filtered.map((m) => {
                  const isSelected = value.includes(m.name);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggle(m.name)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                        isSelected ? "bg-primary/12 text-primary-soft" : "hover:bg-surface-soft"
                      )}
                    >
                      <span className={cn(
                        "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors",
                        isSelected ? "border-primary bg-primary" : "border-border"
                      )}>
                        {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                      </span>
                      <Avatar name={m.name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-text-primary">{m.name}</span>
                        {(m.title || m.department) && (
                          <span className="block truncate text-[10px] text-text-muted">
                            {[m.title, m.department].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {value.length > 0 && (
              <div className="border-t border-border mt-1 pt-1.5 px-0.5">
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="w-full rounded-lg px-3 py-1.5 text-left text-xs text-danger/70 hover:bg-danger/8 hover:text-danger transition-colors"
                >
                  Quitar todos
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected chips */}
      {value.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {value.map((name) => {
            const member = members.find((m) => m.name === name);
            return (
              <span
                key={name}
                className="flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 py-0.5 pl-1.5 pr-1 text-xs text-primary-soft"
              >
                <Avatar name={name} size="xs" />
                <span className="max-w-28 truncate font-medium">{member?.name ?? name}</span>
                <button
                  type="button"
                  onClick={() => toggle(name)}
                  className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full hover:bg-primary/20 text-primary/60 hover:text-primary transition-colors"
                  title={`Quitar a ${name}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

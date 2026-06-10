"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  /** "sm" = h-8 text-xs, "md" = h-10 text-sm (default) */
  size?: "sm" | "md";
  className?: string;
  /**
   * Custom trigger renderer. Receives whether the panel is open.
   * When provided, the default styled button is replaced by the return value.
   * The container div still handles click, keyboard, and click-outside.
   */
  trigger?: (open: boolean) => React.ReactNode;
}

export function Dropdown({
  options,
  value,
  onChange,
  label,
  error,
  placeholder,
  disabled,
  size = "md",
  className,
  trigger,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder ?? "Seleccionar";
  const mounted = typeof document !== "undefined";

  // Close when clicking outside both trigger and panel
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      const inContainer = containerRef.current?.contains(target) ?? false;
      const inPanel = panelRef.current?.contains(target) ?? false;
      if (!inContainer && !inPanel) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Recompute position on scroll/resize while open
  const computePosition = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const viewH = window.innerHeight;
    const approxH = Math.min(options.length * 36 + 16, 232); // max-h-56 ~ 224px + padding
    const spaceBelow = viewH - rect.bottom;
    const openUpward = spaceBelow < approxH + 8 && rect.top > approxH;

    setPanelStyle({
      position: "fixed",
      left: `${rect.left}px`,
      minWidth: `${rect.width}px`,
      maxWidth: `${Math.min(Math.max(rect.width, 180), 320)}px`,
      ...(openUpward
        ? { bottom: `${viewH - rect.top + 4}px` }
        : { top: `${rect.bottom + 4}px` }),
    });
  }, [options.length]);

  useEffect(() => {
    if (!open) return;
    computePosition();
    window.addEventListener("scroll", computePosition, true);
    window.addEventListener("resize", computePosition);
    return () => {
      window.removeEventListener("scroll", computePosition, true);
      window.removeEventListener("resize", computePosition);
    };
  }, [open, computePosition]);

  function toggle() {
    if (!disabled) {
      if (!open) computePosition();
      setOpen((v) => !v);
    }
  }

  const panel = mounted && open && createPortal(
    <AnimatePresence>
      {open && (
        <motion.ul
          ref={panelRef}
          role="listbox"
          style={panelStyle}
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.12 }}
          className={cn(
            "z-[9999] max-h-56 overflow-y-auto",
            "bg-surface border border-primary/25 rounded-xl p-1.5",
            "shadow-[0_8px_32px_rgba(0,0,0,0.65),0_2px_8px_rgba(0,0,0,0.3)]",
            // Custom scrollbar styling
            "[&::-webkit-scrollbar]:w-1.5",
            "[&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "[&::-webkit-scrollbar-thumb]:bg-border",
          )}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors select-none",
                  size === "sm" ? "text-xs" : "text-sm",
                  isSelected
                    ? "bg-primary/20 text-primary-soft"
                    : "text-text-secondary hover:bg-primary/10 hover:text-text-primary",
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
              </li>
            );
          })}
        </motion.ul>
      )}
    </AnimatePresence>,
    document.body,
  );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <span className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide">
          {label}
        </span>
      )}

      {/* Trigger */}
      {trigger ? (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={toggle}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle()}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="cursor-pointer"
        >
          {trigger(open)}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={toggle}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "flex items-center justify-between gap-2 w-full text-left",
            "bg-surface-elevated border rounded-lg text-text-primary",
            "transition-all cursor-pointer",
            "hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            open && "border-primary/50 ring-1 ring-primary/25",
            error ? "border-danger focus:ring-danger/40" : "border-border",
            disabled && "opacity-50 cursor-not-allowed",
            size === "sm" ? "h-8 px-2.5 text-xs" : "h-10 px-3 text-sm",
          )}
        >
          <span className="truncate flex-1">{selectedLabel}</span>
          <ChevronDown
            className={cn(
              "flex-shrink-0 text-text-muted transition-transform duration-150",
              size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
              open && "rotate-180",
            )}
          />
        </button>
      )}

      {panel}

      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}

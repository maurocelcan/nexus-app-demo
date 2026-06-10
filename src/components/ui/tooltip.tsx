"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface TooltipProps {
  /** Texto del tooltip */
  content: string;
  children: React.ReactNode;
  /** Ancho máximo en px (default 240) */
  maxWidth?: number;
  className?: string;
}

/**
 * Tooltip portal — se renderiza en document.body para evitar clipping por overflow.
 * Se posiciona arriba del trigger; si no hay espacio, se abre abajo.
 * Compatible con dark mode, keyboard focus y mobile tap.
 */
export function Tooltip({ content, children, maxWidth = 240, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);

  const computePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const approxH = 72; // estimado de altura del tooltip

    // Centro horizontal sobre el trigger, con clamp a viewport
    let left = rect.left + rect.width / 2 - maxWidth / 2;
    if (left < 8) left = 8;
    if (left + maxWidth > vw - 8) left = vw - maxWidth - 8;

    // Preferir arriba; si no hay espacio, abrir abajo
    const openBelow = rect.top < approxH + 12;
    setStyle({
      position: "fixed",
      left: `${left}px`,
      width: `${maxWidth}px`,
      ...(openBelow
        ? { top: `${rect.bottom + 8}px` }
        : { top: `${rect.top - 8}px`, transform: "translateY(-100%)" }),
    });
  }, [maxWidth]);

  function show() { computePosition(); setVisible(true); }
  function hide() { setVisible(false); }

  // Cierra al hacer scroll (por si el trigger se mueve)
  useEffect(() => {
    if (!visible) return;
    const onScroll = () => setVisible(false);
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [visible]);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      // Mobile: toggle con tap
      onClick={() => setVisible((v) => !v)}
      className={cn("inline-flex cursor-default", className)}
    >
      {children}

      {visible && createPortal(
        <div style={style} className="z-[9999] pointer-events-none">
          <div className={cn(
            "rounded-lg border border-border/80 bg-surface px-3 py-2",
            "text-[11px] leading-relaxed text-text-secondary",
            "shadow-[0_8px_32px_rgba(0,0,0,0.65),0_2px_8px_rgba(0,0,0,0.3)]",
          )}>
            {content}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

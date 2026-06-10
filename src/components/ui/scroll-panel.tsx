"use client";

import type React from "react";
import { cn } from "@/lib/utils";

export function ScrollPanel({
  children,
  className,
  maxHeight = 360,
}: {
  children: React.ReactNode;
  className?: string;
  maxHeight?: number;
}) {
  return (
    <div
      className={cn(
        "overflow-y-auto pr-1",
        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border",
        className
      )}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
}

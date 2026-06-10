import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  /** Action buttons or controls rendered on the right */
  children?: React.ReactNode;
  className?: string;
  /** Render title as h1-h4 (default: h2) */
  as?: "h1" | "h2" | "h3" | "h4";
}

export function SectionHeader({ title, description, children, className, as: Tag = "h2" }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-5", className)}>
      <div className="min-w-0 flex-1">
        <Tag className="text-sm font-semibold text-text-primary leading-snug">{title}</Tag>
        {description && (
          <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-shrink-0">{children}</div>
      )}
    </div>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "primary" | "accent" | "success" | "warning" | "danger" | "info" | "outline";

const variants: Record<BadgeVariant, string> = {
  default: "bg-surface-soft text-text-secondary border border-border",
  primary: "bg-primary/15 text-primary-soft border border-primary/25",
  accent: "bg-accent/15 text-accent border border-accent/25",
  success: "bg-success/15 text-success border border-success/25",
  warning: "bg-warning/15 text-warning border border-warning/25",
  danger: "bg-danger/15 text-danger border border-danger/25",
  info: "bg-info/15 text-info border border-info/25",
  outline: "border border-border text-text-muted",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

const sizes = { xs: "h-5 w-5 text-[9px]", sm: "h-7 w-7 text-xs", md: "h-9 w-9 text-sm", lg: "h-12 w-12 text-base" };

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

const colors = [
  "bg-primary/20 text-primary-soft",
  "bg-accent/20 text-accent",
  "bg-info/20 text-info",
  "bg-success/20 text-success",
  "bg-warning/20 text-warning",
];

function getColor(name?: string) {
  if (!name) return colors[0];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function Avatar({ name, src, size = "md", className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0 font-medium overflow-hidden",
        sizes[size],
        !src && getColor(name),
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

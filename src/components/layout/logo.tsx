import { cn } from "@/lib/utils";

export function NexusLogo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-6", md: "h-8", lg: "h-10" };
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("relative flex-shrink-0", sizes[size])}>
        <svg viewBox="0 0 32 32" fill="none" className={cn("h-full w-auto")}>
          <defs>
            <linearGradient id="nexus-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8B5CF6" />
              <stop offset="1" stopColor="#00E0B8" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#nexus-grad)" opacity="0.15" />
          <circle cx="16" cy="16" r="3" fill="url(#nexus-grad)" />
          <circle cx="8" cy="10" r="2" fill="url(#nexus-grad)" opacity="0.7" />
          <circle cx="24" cy="10" r="2" fill="url(#nexus-grad)" opacity="0.7" />
          <circle cx="8" cy="22" r="2" fill="url(#nexus-grad)" opacity="0.7" />
          <circle cx="24" cy="22" r="2" fill="url(#nexus-grad)" opacity="0.7" />
          <line x1="16" y1="16" x2="8" y2="10" stroke="url(#nexus-grad)" strokeWidth="1.5" opacity="0.6" />
          <line x1="16" y1="16" x2="24" y2="10" stroke="url(#nexus-grad)" strokeWidth="1.5" opacity="0.6" />
          <line x1="16" y1="16" x2="8" y2="22" stroke="url(#nexus-grad)" strokeWidth="1.5" opacity="0.6" />
          <line x1="16" y1="16" x2="24" y2="22" stroke="url(#nexus-grad)" strokeWidth="1.5" opacity="0.6" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn(
          "font-bold tracking-tight text-text-primary",
          size === "sm" && "text-sm",
          size === "md" && "text-base",
          size === "lg" && "text-xl"
        )}>Nexus</span>
        {size !== "sm" && (
          <span className="text-[10px] text-text-muted uppercase tracking-widest">Cerebro Comercial</span>
        )}
      </div>
    </div>
  );
}

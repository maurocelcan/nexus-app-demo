import Image from "next/image";
import { cn } from "@/lib/utils";

export function NexusLogo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { className: "h-6 w-6", pixels: 24 },
    md: { className: "h-8 w-8", pixels: 32 },
    lg: { className: "h-10 w-10", pixels: 40 },
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("relative flex-shrink-0", sizes[size].className)}>
        <Image
          src="/logo_nexus.svg"
          alt=""
          width={sizes[size].pixels}
          height={sizes[size].pixels}
          className="h-full w-full object-contain"
          priority
          aria-hidden="true"
        />
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

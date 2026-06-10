import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      className={cn(
        "border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block",
        sizes[size],
        className
      )}
    />
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "muted",
  children,
}: {
  className?: string;
  tone?: "muted" | "on" | "off" | "live" | "accent";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tracking-wide",
        tone === "muted" && "bg-surface-2 text-muted",
        tone === "on" && "bg-sage/20 text-sage",
        tone === "off" && "bg-surface-2 text-subtle",
        tone === "live" && "bg-sage/15 text-sage",
        tone === "accent" && "bg-accent/15 text-accent",
        className,
      )}
    >
      {children}
    </span>
  );
}

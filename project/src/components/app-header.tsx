import { Link, useRouterState } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Control" },
  { to: "/guide", label: "Guide" },
] as const;

export function AppHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const cameraStatus = useAppStore((s) => s.cameraStatus);
  const fps = useAppStore((s) => s.fps);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full min-w-0 max-w-7xl items-center gap-2 px-4 py-3 sm:justify-between sm:gap-3 sm:px-6">
        <Link to="/" className="min-w-0 shrink-0 no-underline">
          <span className="text-lg font-semibold tracking-tight text-fg">SignHome</span>
          <span className="ml-2 hidden text-xs uppercase tracking-widest text-subtle sm:inline">ASL control</span>
        </Link>

        <nav className="mx-auto flex items-center gap-1 rounded-md border border-border bg-surface p-1">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-sm px-3 py-1.5 text-sm no-underline transition-colors duration-150",
                  active ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          {cameraStatus === "live" ? (
            <Badge tone="live">
              <span className="size-1.5 rounded-full bg-sage" />
              Live{fps > 0 ? ` · ${fps} fps` : ""}
            </Badge>
          ) : (
            <Badge tone="muted">Offline camera</Badge>
          )}
        </div>
      </div>
    </header>
  );
}

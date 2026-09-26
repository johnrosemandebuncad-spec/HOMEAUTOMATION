import { Fan, Lightbulb, Speaker } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { APPLIANCES, type ApplianceId } from "@/lib/gestures";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const ICONS = {
  light: Lightbulb,
  fan: Fan,
  aux: Speaker,
} as const;

export function ApplianceRail() {
  const light = useAppStore((s) => s.light);
  const fan = useAppStore((s) => s.fan);
  const aux = useAppStore((s) => s.aux);
  const setAppliance = useAppStore((s) => s.setAppliance);
  const states: Record<ApplianceId, boolean> = { light, fan, aux };

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {(Object.keys(APPLIANCES) as ApplianceId[]).map((id) => {
        const a = APPLIANCES[id];
        const on = states[id];
        const Icon = ICONS[id];
        return (
          <article
            key={id}
            className={cn(
              "flex min-w-0 items-center justify-between gap-3 rounded-lg border bg-surface px-4 py-3 shadow-panel transition-colors duration-200",
              on ? "border-sage/40" : "border-border",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-md",
                  on ? "bg-sage/15 text-sage" : "bg-surface-2 text-muted",
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-fg">{a.name}</p>
                <p className="font-mono text-[11px] text-muted">
                  {a.pin} · {a.relay} · {on ? "ON" : "OFF"}
                </p>
              </div>
            </div>
            <Switch checked={on} onCheckedChange={(v) => setAppliance(id, v, "manual")} aria-label={a.name} />
          </article>
        );
      })}
    </section>
  );
}

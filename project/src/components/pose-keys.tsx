import { HandSkeleton } from "@/components/hand-skeleton";
import { GESTURE_LIST } from "@/lib/gestures";
import { POSES } from "@/lib/hand-poses";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function PoseKeys() {
  const applyGesture = useAppStore((s) => s.applyGesture);
  const lastFired = useAppStore((s) => s.lastFired);
  const lastFiredAt = useAppStore((s) => s.lastFiredAt);
  const recent = Date.now() - lastFiredAt < 900;

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-panel">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-subtle">Commands</p>
      <h2 className="mb-3 text-sm font-medium text-fg">Five static ASL poses</h2>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {GESTURE_LIST.map((g) => {
          const active = recent && lastFired === g.id;
          return (
            <li key={g.id} className="min-w-0">
              <button
                type="button"
                onClick={() => applyGesture(g.id, "manual")}
                className={cn(
                  "flex w-full min-w-0 flex-col items-center gap-1 rounded-md border px-1 py-2 text-center transition-colors duration-150",
                  active ? "border-lamp bg-lamp/10" : "border-border bg-surface-2 hover:border-border-strong",
                )}
              >
                <HandSkeleton
                  landmarks={POSES[g.id]}
                  className="h-14 w-14 text-accent"
                  joint="var(--color-lamp)"
                />
                <span className="w-full truncate text-xs font-medium text-fg">{g.pose}</span>
                <span className="font-mono text-xs text-muted">
                  {g.keys} · '{g.serial}'
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

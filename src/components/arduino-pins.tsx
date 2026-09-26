import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const PINS = [
  { pin: "D2", label: "Light", key: "light" as const },
  { pin: "D3", label: "Fan", key: "fan" as const },
  { pin: "D4", label: "Aux", key: "aux" as const },
];

export function ArduinoPins() {
  const light = useAppStore((s) => s.light);
  const fan = useAppStore((s) => s.fan);
  const aux = useAppStore((s) => s.aux);
  const on = { light, fan, aux };

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-panel">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-subtle">Firmware map</p>
      <h2 className="mb-4 text-sm font-medium text-fg">arduino_relay.ino</h2>
      <div className="flex items-stretch gap-3">
        <div className="flex w-16 flex-col items-center justify-between rounded-md bg-[#0c0d11] py-3">
          <span className="font-mono text-[10px] text-subtle">UNO</span>
          <div className="h-16 w-8 rounded-sm bg-accent/20" />
          <span className="font-mono text-[10px] text-subtle">R3</span>
        </div>
        <ul className="flex-1 space-y-2">
          {PINS.map((p) => (
            <li key={p.pin} className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-muted">{p.pin}</span>
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-fg">{p.label}</span>
              <span
                className={cn(
                  "size-2.5 rounded-full",
                  on[p.key] ? "bg-sage" : "bg-subtle/40",
                )}
                aria-hidden
              />
              <span className="w-8 font-mono text-[11px] text-muted tabular-nums">{on[p.key] ? "1" : "0"}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

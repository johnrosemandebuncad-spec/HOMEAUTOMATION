import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function stamp(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function SerialConsole() {
  const logs = useAppStore((s) => s.logs);
  const clearLogs = useAppStore((s) => s.clearLogs);
  const [live, setLive] = useState(false);

  useEffect(() => setLive(true), []);

  return (
    <section className="flex min-h-[220px] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-panel">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-subtle">Serial · 9600</p>
          <h2 className="text-sm font-medium text-fg">Arduino Uno R3 log</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={clearLogs}>
          Clear
        </Button>
      </header>
      <ol className="flex-1 space-y-1 overflow-auto px-3 py-2 font-mono text-xs leading-relaxed">
        {logs.map((row) => (
          <li key={row.id} className="log-row flex min-w-0 gap-3">
            <time className="w-[4.6rem] shrink-0 text-subtle tabular-nums" dateTime={new Date(row.ts).toISOString()}>
              {live ? stamp(row.ts) : "--:--:--"}
            </time>
            <span
              className={cn(
                "w-14 shrink-0 uppercase",
                row.kind === "serial" && "text-lamp",
                row.kind === "gesture" && "text-accent",
                row.kind === "system" && "text-muted",
                row.kind === "error" && "text-danger",
              )}
            >
              {row.kind}
            </span>
            <span className="min-w-0 break-words text-fg">{row.message}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
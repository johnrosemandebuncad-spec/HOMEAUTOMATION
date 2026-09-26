import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { sampleCount } from "@/lib/classifier";
import { useAppStore } from "@/lib/store";

export function SettingsPanel() {
  const confidenceMin = useAppStore((s) => s.confidenceMin);
  const holdMs = useAppStore((s) => s.holdMs);
  const setConfidenceMin = useAppStore((s) => s.setConfidenceMin);
  const setHoldMs = useAppStore((s) => s.setHoldMs);
  const useTrained = useAppStore((s) => s.useTrained);
  const setUseTrained = useAppStore((s) => s.setUseTrained);
  const samples = useAppStore((s) => s.samples);
  const n = sampleCount(samples);

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-panel">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-subtle">Reliability</p>
      <h2 className="mb-4 text-sm font-medium text-fg">Debounce and cutoff</h2>

      <label className="mb-4 block">
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-muted">Minimum confidence</span>
          <span className="font-mono text-fg tabular-nums">{Math.round(confidenceMin * 100)}%</span>
        </div>
        <Slider
          min={0.4}
          max={0.95}
          step={0.01}
          value={[confidenceMin]}
          onValueChange={(v) => setConfidenceMin(v[0] ?? 0.68)}
        />
      </label>

      <label className="mb-4 block">
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-muted">Hold before fire</span>
          <span className="font-mono text-fg tabular-nums">{holdMs} ms</span>
        </div>
        <Slider min={200} max={1200} step={20} value={[holdMs]} onValueChange={(v) => setHoldMs(v[0] ?? 520)} />
      </label>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
        <div>
          <p className="text-sm text-fg">Use calibrated kNN</p>
          <p className="text-xs text-muted">{n} landmark samples stored locally</p>
        </div>
        <Switch checked={useTrained && n > 0} onCheckedChange={setUseTrained} disabled={n === 0} />
      </div>
    </section>
  );
}

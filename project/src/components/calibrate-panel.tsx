import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { sampleCount } from "@/lib/classifier";
import { GESTURE_LIST, type GestureId } from "@/lib/gestures";
import { useAppStore } from "@/lib/store";

const BURST_MS = 1600;

export function CalibratePanel() {
  const cameraStatus = useAppStore((s) => s.cameraStatus);
  const samples = useAppStore((s) => s.samples);
  const addLog = useAppStore((s) => s.addLog);
  const clearSamples = useAppStore((s) => s.clearSamples);
  const setCalibrating = useAppStore((s) => s.setCalibrating);
  const setUseTrained = useAppStore((s) => s.setUseTrained);
  const calibrating = useAppStore((s) => s.calibrating);
  const [busy, setBusy] = useState<GestureId | null>(null);
  const timer = useRef<number>(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function capture(id: GestureId) {
    if (cameraStatus !== "live") {
      addLog("error", "Start the camera before calibrating.");
      return;
    }
    setBusy(id);
    setCalibrating(id);
    addLog("system", `Collecting ${id} samples… hold the pose.`);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setCalibrating(null);
      setBusy(null);
      const n = useAppStore.getState().samples[id].length;
      addLog("system", `Saved buffer for ${id} (${n} total).`);
      if (sampleCount(useAppStore.getState().samples) >= 40) setUseTrained(true);
    }, BURST_MS);
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-panel">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-subtle">Train</p>
      <h2 className="mb-1 text-sm font-medium text-fg">Collect landmarks</h2>
      <p className="mb-3 text-xs text-muted">
        Same flow as train_model.py — hold a pose, save a buffer. Samples stay in this browser.
      </p>
      <ul className="space-y-2">
        {GESTURE_LIST.map((g) => {
          const n = samples[g.id].length;
          const active = calibrating === g.id || busy === g.id;
          return (
            <li key={g.id} className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-fg">{g.pose}</p>
                <p className="font-mono text-[11px] text-muted tabular-nums">{n} samples</p>
              </div>
              <Button variant={active ? "primary" : "secondary"} size="sm" onClick={() => capture(g.id)} disabled={active}>
                {active ? "Holding…" : "Capture"}
              </Button>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex justify-end">
        <Button variant="ghost" size="sm" onClick={clearSamples}>
          Discard samples
        </Button>
      </div>
    </section>
  );
}

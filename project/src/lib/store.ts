import { create } from "zustand";
import { persist } from "zustand/middleware";
import { emptySamples } from "./classifier";
import {
  APPLIANCES,
  COOLDOWN_MS,
  GESTURES,
  type ApplianceId,
  type GestureId,
} from "./gestures";

export type LogKind = "serial" | "system" | "gesture" | "error";

export interface LogEntry {
  id: string;
  ts: number;
  kind: LogKind;
  message: string;
  meta?: string;
}

export type CameraStatus = "idle" | "loading" | "live" | "denied" | "error";

interface Detected {
  gesture: GestureId | null;
  confidence: number;
  source: "geometry" | "knn" | "none";
  holdMs: number;
}

interface AppState {
  light: boolean;
  fan: boolean;
  aux: boolean;
  confidenceMin: number;
  holdMs: number;
  cameraStatus: CameraStatus;
  cameraHint: string;
  detected: Detected;
  logs: LogEntry[];
  samples: Record<GestureId, number[][]>;
  useTrained: boolean;
  lastFiredAt: number;
  lastFired: GestureId | null;
  calibrating: GestureId | null;
  fps: number;
  setCameraStatus: (s: CameraStatus, hint?: string) => void;
  setDetected: (d: Detected) => void;
  setFps: (n: number) => void;
  setConfidenceMin: (n: number) => void;
  setHoldMs: (n: number) => void;
  applyGesture: (g: GestureId, origin: "camera" | "manual") => boolean;
  setAppliance: (id: ApplianceId, on: boolean, origin: "manual") => void;
  addLog: (kind: LogKind, message: string, meta?: string) => void;
  clearLogs: () => void;
  addSamples: (g: GestureId, vectors: number[][]) => void;
  clearSamples: () => void;
  setUseTrained: (v: boolean) => void;
  setCalibrating: (g: GestureId | null) => void;
}

let seq = 0;
function nid(): string {
  seq += 1;
  return `${Date.now().toString(36)}-${seq}`;
}

const MAX_LOGS = 80;
const MAX_SAMPLES = 120;

function serialLine(g: GestureId, nextOn: boolean): { message: string; meta: string } {
  const def = GESTURES[g];
  const pinLevel = nextOn ? "HIGH" : "LOW";
  const verb = def.action === "toggle" ? (nextOn ? "ON" : "OFF") : def.action.toUpperCase();
  return {
    message: `TX  '${def.serial}'  →  ${def.pin} ${pinLevel}  ${APPLIANCES[def.appliance].name} ${verb}`,
    meta: `9600 baud · Uno R3`,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      light: false,
      fan: false,
      aux: false,
      confidenceMin: 0.68,
      holdMs: 520,
      cameraStatus: "idle",
      cameraHint: "",
      detected: { gesture: null, confidence: 0, source: "none", holdMs: 0 },
      logs: [],
      samples: emptySamples(),
      useTrained: false,
      lastFiredAt: 0,
      lastFired: null,
      calibrating: null,
      fps: 0,

      setCameraStatus: (s, hint = "") => set({ cameraStatus: s, cameraHint: hint }),
      setDetected: (d) => set({ detected: d }),
      setFps: (n) => set({ fps: n }),
      setConfidenceMin: (n) => set({ confidenceMin: n }),
      setHoldMs: (n) => set({ holdMs: n }),
      setCalibrating: (g) => set({ calibrating: g }),
      setUseTrained: (v) => {
        set({ useTrained: v });
        get().addLog("system", v ? "Using calibrated kNN model." : "Using geometric classifier.");
      },

      addLog: (kind, message, meta) =>
        set((st) => ({
          logs: [{ id: nid(), ts: Date.now(), kind, message, meta }, ...st.logs].slice(0, MAX_LOGS),
        })),

      clearLogs: () =>
        set({
          logs: [
            {
              id: nid(),
              ts: Date.now(),
              kind: "system",
              message: "Log cleared.",
            },
          ],
        }),

      addSamples: (g, vectors) =>
        set((st) => {
          const next = { ...st.samples, [g]: [...st.samples[g], ...vectors].slice(-MAX_SAMPLES) };
          return { samples: next };
        }),

      clearSamples: () => {
        set({ samples: emptySamples(), useTrained: false });
        get().addLog("system", "Calibration samples discarded.");
      },

      applyGesture: (g, origin) => {
        const st = get();
        const now = Date.now();
        if (now - st.lastFiredAt < COOLDOWN_MS && st.lastFired === g) return false;

        const def = GESTURES[g];
        const current = st[def.appliance];
        let next = current;
        if (def.action === "on") next = true;
        else if (def.action === "off") next = false;
        else next = !current;

        if (def.action !== "toggle" && next === current) {
          if (now - st.lastFiredAt < 2400) return false;
          get().addLog("gesture", `${def.label} held — ${APPLIANCES[def.appliance].name} already ${current ? "ON" : "OFF"}.`);
          set({ lastFiredAt: now, lastFired: g });
          return false;
        }

        const line = serialLine(g, next);
        set({
          [def.appliance]: next,
          lastFiredAt: now,
          lastFired: g,
        } as Partial<AppState>);
        get().addLog("gesture", `${origin === "camera" ? "Recognized" : "Manual"} ${def.pose} (${def.asl})`);
        get().addLog("serial", line.message, line.meta);
        return true;
      },

      setAppliance: (id, on) => {
        const st = get();
        if (st[id] === on) return;
        const pin = APPLIANCES[id].pin;
        const serial = id === "light" ? (on ? "1" : "2") : id === "fan" ? (on ? "3" : "4") : "5";
        set({ [id]: on } as Partial<AppState>);
        get().addLog(
          "serial",
          `TX  '${serial}'  →  ${pin} ${on ? "HIGH" : "LOW"}  ${APPLIANCES[id].name} ${on ? "ON" : "OFF"}`,
          "manual override",
        );
      },
    }),
    {
      name: "signhome.v1",
      skipHydration: true,
      partialize: (s) => ({
        confidenceMin: s.confidenceMin,
        holdMs: s.holdMs,
        samples: s.samples,
        useTrained: s.useTrained,
      }),
    },
  ),
);

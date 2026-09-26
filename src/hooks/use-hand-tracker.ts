import { useCallback, useEffect, useRef, useState } from "react";
import { classifyHand } from "@/lib/classifier";
import { extractFeatures, type Landmark } from "@/lib/landmarks";
import { useAppStore } from "@/lib/store";
import type { GestureId } from "@/lib/gestures";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export function useHandTracker() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<{
    detectForVideo: (video: HTMLVideoElement, ts: number) => {
      landmarks?: Array<Array<{ x: number; y: number; z: number }>>;
    };
    close: () => void;
  } | null>(null);
  const rafRef = useRef<number>(0);
  const holdRef = useRef<{ id: GestureId | null; since: number }>({ id: null, since: 0 });
  const lastTs = useRef(0);
  const frames = useRef(0);
  const fpsTick = useRef(performance.now());

  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);
  const [size, setSize] = useState({ w: 640, h: 480 });

  const setCameraStatus = useAppStore((s) => s.setCameraStatus);
  const setDetected = useAppStore((s) => s.setDetected);
  const setFps = useAppStore((s) => s.setFps);
  const applyGesture = useAppStore((s) => s.applyGesture);
  const addLog = useAppStore((s) => s.addLog);
  const addSamples = useAppStore((s) => s.addSamples);
  const calibrating = useAppStore((s) => s.calibrating);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    try {
      landmarkerRef.current?.close();
    } catch {
      /* ignore */
    }
    landmarkerRef.current = null;
    setLandmarks(null);
    holdRef.current = { id: null, since: 0 };
    setDetected({ gesture: null, confidence: 0, source: "none", holdMs: 0 });
    setCameraStatus("idle");
  }, [setCameraStatus, setDetected]);

  const loop = useCallback(() => {
    const video = videoRef.current;
    const lmkr = landmarkerRef.current;
    if (!video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    const now = performance.now();
    if (now - lastTs.current > 28) {
      lastTs.current = now;
      frames.current += 1;
      if (now - fpsTick.current >= 1000) {
        setFps(frames.current);
        frames.current = 0;
        fpsTick.current = now;
      }

      let pts: Landmark[] | null = null;
      if (lmkr) {
        try {
          const res = lmkr.detectForVideo(video, now);
          const hand = res.landmarks?.[0];
          if (hand && hand.length >= 21) {
            pts = hand.map((p) => ({ x: p.x, y: p.y, z: p.z ?? 0 }));
          }
        } catch {
          pts = null;
        }
      }

      setLandmarks(pts);
      setSize({ w: video.videoWidth || 640, h: video.videoHeight || 480 });

      const st = useAppStore.getState();
      if (st.calibrating && pts) {
        addSamples(st.calibrating, [extractFeatures(pts)]);
        setDetected({ gesture: st.calibrating, confidence: 1, source: "geometry", holdMs: 0 });
      } else if (pts) {
        const hit = classifyHand(pts, st.samples, st.useTrained);
        const pass = hit.gesture && hit.confidence >= st.confidenceMin;
        if (pass && hit.gesture) {
          if (holdRef.current.id !== hit.gesture) {
            holdRef.current = { id: hit.gesture, since: now };
          }
          const held = now - holdRef.current.since;
          setDetected({
            gesture: hit.gesture,
            confidence: hit.confidence,
            source: hit.source,
            holdMs: held,
          });
          if (held >= st.holdMs) {
            applyGesture(hit.gesture, "camera");
            holdRef.current = { id: hit.gesture, since: now + 800 };
          }
        } else {
          holdRef.current = { id: null, since: 0 };
          setDetected({
            gesture: hit.gesture,
            confidence: hit.confidence,
            source: hit.source,
            holdMs: 0,
          });
        }
      } else {
        holdRef.current = { id: null, since: 0 };
        setDetected({ gesture: null, confidence: 0, source: "none", holdMs: 0 });
      }
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [addSamples, applyGesture, setDetected, setFps]);

  const start = useCallback(async () => {
    stop();
    setCameraStatus("loading", "Requesting camera…");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Video element missing");
      video.srcObject = stream;
      await video.play();
      setCameraStatus("loading", "Loading MediaPipe Hands…");

      try {
        const vision = await import("@mediapipe/tasks-vision");
        const fileset = await vision.FilesetResolver.forVisionTasks(WASM_URL);
        const options = {
          runningMode: "VIDEO" as const,
          numHands: 1,
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.6,
        };
        let landmarker;
        try {
          landmarker = await vision.HandLandmarker.createFromOptions(fileset, {
            ...options,
            baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          });
        } catch {
          landmarker = await vision.HandLandmarker.createFromOptions(fileset, {
            ...options,
            baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
          });
        }
        landmarkerRef.current = landmarker;
        addLog("system", "MediaPipe Hands online. 21 landmarks × 3 axes.");
      } catch (err) {
        addLog(
          "error",
          "MediaPipe model could not load. Camera is live — use pose keys 1–5 or retry.",
        );
        console.warn(err);
      }

      setCameraStatus("live");
      rafRef.current = requestAnimationFrame(loop);
    } catch (err) {
      const denied =
        err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "SecurityError");
      setCameraStatus(
        denied ? "denied" : "error",
        denied
          ? "Camera permission blocked. Use the pose keys or allow the camera and retry."
          : "Could not open a camera on this device.",
      );
      addLog("error", denied ? "Camera permission denied." : "Camera failed to start.");
    }
  }, [addLog, loop, setCameraStatus, stop]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  useEffect(() => {
    if (calibrating) holdRef.current = { id: null, since: 0 };
  }, [calibrating]);

  return { videoRef, landmarks, size, start, stop };
}

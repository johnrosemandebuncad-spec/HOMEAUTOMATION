import { useEffect } from "react";
import { GESTURE_LIST } from "@/lib/gestures";
import { useAppStore } from "@/lib/store";

export function useKeys() {
  const applyGesture = useAppStore((s) => s.applyGesture);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const hit = GESTURE_LIST.find((g) => g.keys === e.key);
      if (!hit) return;
      e.preventDefault();
      applyGesture(hit.id, "manual");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyGesture]);
}

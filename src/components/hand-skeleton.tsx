import { useEffect, useRef } from "react";
import { HAND_CONNECTIONS, type Landmark } from "@/lib/landmarks";
import { cn } from "@/lib/utils";

export function HandSkeleton({
  landmarks,
  className,
  stroke = "currentColor",
  joint = "var(--color-lamp)",
}: {
  landmarks: Landmark[];
  className?: string;
  stroke?: string;
  joint?: string;
}) {
  if (landmarks.length < 21) return null;
  return (
    <svg viewBox="0 0 1 1" className={cn("overflow-visible", className)} aria-hidden>
      {HAND_CONNECTIONS.map(([a, b]) => {
        const p = landmarks[a];
        const q = landmarks[b];
        if (!p || !q) return null;
        return (
          <line
            key={`${a}-${b}`}
            x1={p.x}
            y1={p.y}
            x2={q.x}
            y2={q.y}
            stroke={stroke}
            strokeWidth={0.018}
            strokeLinecap="round"
          />
        );
      })}
      {landmarks.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === 0 ? 0.028 : i === 4 || i === 8 || i === 12 || i === 16 || i === 20 ? 0.022 : 0.016}
          fill={i === 0 ? "var(--color-fg)" : joint}
        />
      ))}
    </svg>
  );
}

export function LandmarkCanvas({
  landmarks,
  width,
  height,
}: {
  landmarks: Landmark[] | null;
  width: number;
  height: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    if (!landmarks || landmarks.length < 21) return;

    ctx.lineWidth = 2.4;
    ctx.strokeStyle = "rgba(196, 180, 154, 0.9)";
    ctx.lineCap = "round";
    for (const [a, b] of HAND_CONNECTIONS) {
      const p = landmarks[a];
      const q = landmarks[b];
      if (!p || !q) continue;
      ctx.beginPath();
      ctx.moveTo(p.x * width, p.y * height);
      ctx.lineTo(q.x * width, q.y * height);
      ctx.stroke();
    }
    for (let i = 0; i < landmarks.length; i++) {
      const p = landmarks[i]!;
      ctx.beginPath();
      ctx.fillStyle = i === 0 ? "#ecece8" : "#c4b49a";
      ctx.arc(p.x * width, p.y * height, i === 0 ? 4.2 : 3.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [landmarks, width, height]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}

import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function VirtualHome() {
  const light = useAppStore((s) => s.light);
  const fan = useAppStore((s) => s.fan);
  const aux = useAppStore((s) => s.aux);

  return (
    <section
      aria-label="Virtual home"
      className="relative min-w-0 overflow-hidden rounded-xl border border-border bg-surface shadow-panel"
    >
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-subtle">Virtual home</p>
          <h2 className="text-sm font-medium text-fg">Apartment 4B · simulated relays</h2>
        </div>
        <p className="font-mono text-[11px] text-muted tabular-nums">D2 D3 D4</p>
      </header>

      <div className="relative aspect-video min-h-56 bg-bg sm:min-h-72">
        <svg viewBox="0 0 640 400" className="absolute inset-0 size-full" role="img" aria-label="Two-room apartment">
          <rect width="640" height="400" fill="#0c0d11" />

          {/* Floor */}
          <path d="M40 340 L320 300 L600 340 L600 380 L40 380 Z" fill="#161820" />
          <path d="M40 340 L320 300 L600 340" fill="none" stroke="#262a33" strokeWidth="1.2" />

          {/* Back wall split */}
          <path d="M40 80 L320 50 L320 300 L40 340 Z" fill={light ? "#2a2418" : "#12141a"} />
          <path d="M320 50 L600 80 L600 340 L320 300 Z" fill={fan ? "#161820" : "#12141a"} />
          <line x1="320" y1="50" x2="320" y2="300" stroke="#262a33" strokeWidth="2" />

          {/* Ceiling */}
          <path d="M40 80 L320 50 L600 80 L600 110 L320 78 L40 110 Z" fill="#0e1016" />

          {/* Window — living */}
          <rect x="78" y="118" width="96" height="88" rx="2" fill="#0a0c12" stroke="#3a3f4a" strokeWidth="3" />
          <line x1="126" y1="118" x2="126" y2="206" stroke="#3a3f4a" strokeWidth="2" />
          <line x1="78" y1="162" x2="174" y2="162" stroke="#3a3f4a" strokeWidth="2" />
          <rect x="86" y="126" width="32" height="28" fill={light ? "#e8d5b5" : "#1a2230"} opacity={light ? 0.7 : 0.5} />
          <rect x="134" y="126" width="32" height="28" fill={light ? "#e8d5b5" : "#1a2230"} opacity={light ? 0.55 : 0.4} />

          {/* Sofa */}
          <path d="M70 292 L190 276 L214 300 L90 318 Z" fill="#1c2028" stroke="#2a303a" strokeWidth="1" />
          <path d="M70 268 L190 252 L190 276 L70 292 Z" fill="#222833" />

          {/* Floor lamp */}
          <line x1="236" y1="318" x2="236" y2="168" stroke="#8b8e96" strokeWidth="3" />
          <circle cx="236" cy="324" r="10" fill="#2a303a" />
          <path d="M214 168 L258 168 L248 198 L224 198 Z" fill={light ? "#f3e6cc" : "#3a3f4a"} />
          {light && (
            <>
              <ellipse className="lamp-glow" cx="236" cy="248" rx="110" ry="88" fill="#c4b49a" opacity="0.38" />
              <circle cx="236" cy="186" r="16" fill="#f7edd8" opacity="0.85" />
            </>
          )}

          {/* Bed */}
          <path d="M390 292 L560 272 L572 300 L404 322 Z" fill="#1a1d24" stroke="#2a303a" strokeWidth="1" />
          <path d="M520 276 L560 272 L568 256 L528 260 Z" fill="#2a303a" />

          {/* Ceiling fan */}
          <g transform="translate(460 92)">
            <circle cx="0" cy="0" r="6" fill="#8b8e96" />
            <g className={cn(fan && "fan-spin")} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
              <ellipse cx="0" cy="-32" rx="9" ry="30" fill="#d8cbb6" opacity={fan ? 1 : 0.4} />
              <ellipse cx="0" cy="32" rx="9" ry="30" fill="#d8cbb6" opacity={fan ? 1 : 0.4} />
              <ellipse cx="-32" cy="0" rx="30" ry="9" fill="#b7c2cc" opacity={fan ? 1 : 0.35} />
              <ellipse cx="32" cy="0" rx="30" ry="9" fill="#b7c2cc" opacity={fan ? 1 : 0.35} />
            </g>
            <line x1="0" y1="0" x2="0" y2="-18" stroke="#5c5f68" strokeWidth="2" transform="translate(0 -6)" />
          </g>

          {/* Aux speaker */}
          <g transform="translate(300 248)">
            <rect x="-22" y="0" width="44" height="56" rx="4" fill="#1a1d24" stroke="#3a3f4a" strokeWidth="1.5" />
            <circle cx="0" cy="22" r="10" fill="#0c0d11" stroke="#5c5f68" strokeWidth="1.5" />
            <rect x="-10" y="40" width="20" height="8" rx="1" fill="#0c0d11" />
            {aux && (
              <g transform="translate(0 70)">
                {[ -12, -4, 4, 12 ].map((x, i) => (
                  <rect
                    key={x}
                    className="eq-bar"
                    x={x}
                    y={-14}
                    width="5"
                    height="14"
                    fill="#7d9a7a"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </g>
            )}
          </g>

          {/* Room labels */}
          <text x="120" y="70" fill="#5c5f68" fontSize="11" fontFamily="IBM Plex Sans, sans-serif" letterSpacing="2">
            LIVING
          </text>
          <text x="470" y="70" fill="#5c5f68" fontSize="11" fontFamily="IBM Plex Sans, sans-serif" letterSpacing="2">
            BEDROOM
          </text>
        </svg>

        {light && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 70% at 30% 58%, color-mix(in oklab, var(--color-lamp) 48%, transparent), transparent 72%)",
            }}
          />
        )}
      </div>
    </section>
  );
}

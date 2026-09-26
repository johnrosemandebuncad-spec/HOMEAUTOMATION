import { createFileRoute, Link } from "@tanstack/react-router";
import { HandSkeleton } from "@/components/hand-skeleton";
import { Button } from "@/components/ui/button";
import { GESTURE_LIST } from "@/lib/gestures";
import { POSES } from "@/lib/hand-poses";

export const Route = createFileRoute("/guide")({ component: Guide });

function Guide() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 sm:px-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">User guide</p>
      <h1 className="mt-2 text-3xl font-medium tracking-tight text-fg">Home automation by sign</h1>
      <p className="mt-3 text-base leading-relaxed text-muted">
        Deaf and hard-of-hearing users switch household loads with five static American Sign Language
        handshapes. The original thesis ran MediaPipe and a Random Forest on a laptop, then pushed serial
        bytes to an Arduino Uno R3. This control center is that pipeline in the browser — landmarks stay
        on your device; relays here are simulated.
      </p>

      <div className="mt-6">
        <Button asChild>
          <Link to="/">Open control center</Link>
        </Button>
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-medium text-fg">Pipeline</h2>
        <ol className="mt-4 grid gap-2 font-mono text-xs text-muted sm:grid-cols-5">
          {[
            "Camera",
            "MediaPipe Hands",
            "63 features",
            "Classifier",
            "Relay / home",
          ].map((step, i) => (
            <li key={step} className="rounded-md border border-border bg-surface px-3 py-3">
              <span className="text-subtle">{i + 1}</span>
              <p className="mt-1 text-fg">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-medium text-fg">Supported gestures</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {GESTURE_LIST.map((g) => (
            <li key={g.id} className="flex gap-3 rounded-lg border border-border bg-surface p-3">
              <HandSkeleton landmarks={POSES[g.id]} className="size-20 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium text-fg">
                  {g.label}{" "}
                  <span className="font-mono text-muted">'{g.serial}'</span>
                </p>
                <p className="text-xs text-muted">
                  ASL {g.asl} · {g.pin} · {g.summary}
                </p>
                <p className="mt-1 text-sm text-fg">{g.how}</p>
                <p className="mt-1 font-mono text-[11px] text-subtle">Key {g.keys}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-medium text-fg">How to run a session</h2>
        <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
          <li>
            <span className="text-fg">1. Start the camera.</span> Allow the webcam. MediaPipe Hands loads
            from a local WASM graph — video never leaves the page.
          </li>
          <li>
            <span className="text-fg">2. Hold a pose.</span> Keep the hand steady until the hold ring
            completes. Confidence must stay above the cutoff (default 68%).
          </li>
          <li>
            <span className="text-fg">3. Watch the apartment.</span> Living-room lamp, bedroom fan, and aux
            speaker follow D2 / D3 / D4. The serial console prints the same characters the Uno firmware
            expects: 1–5 at 9600 baud.
          </li>
          <li>
            <span className="text-fg">4. Optional calibrate.</span> Capture buffers per pose to train a
            kNN on your own landmarks — the web stand-in for train_model.py and asl_rf_model.joblib.
          </li>
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-medium text-fg">Hardware map (original build)</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-surface-2 text-xs uppercase tracking-wider text-subtle">
              <tr>
                <th className="px-3 py-2 font-medium">Arduino pin</th>
                <th className="px-3 py-2 font-medium">Relay</th>
                <th className="px-3 py-2 font-medium">Load</th>
              </tr>
            </thead>
            <tbody className="text-fg">
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono">D2</td>
                <td className="px-3 py-2">Relay 1</td>
                <td className="px-3 py-2">Living room light</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono">D3</td>
                <td className="px-3 py-2">Relay 2</td>
                <td className="px-3 py-2">Bedroom fan</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono">D4</td>
                <td className="px-3 py-2">Relay 3</td>
                <td className="px-3 py-2">Aux appliance</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono">5V / GND</td>
                <td className="px-3 py-2">VCC / GND</td>
                <td className="px-3 py-2">Relay module power</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted">
          Always switch mains through the relay module. Never wire household loads to Arduino pins.
        </p>
      </section>

      <section className="mt-12 mb-16">
        <h2 className="text-lg font-medium text-fg">Thesis quality notes</h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
          <li>
            <span className="text-fg">Functional suitability</span> — five defined ASL commands, correct
            appliance mapping.
          </li>
          <li>
            <span className="text-fg">Performance efficiency</span> — per-frame landmarks and classification
            on-device.
          </li>
          <li>
            <span className="text-fg">Interaction capability</span> — live skeleton, confidence cutoff,
            hold ring, serial log.
          </li>
          <li>
            <span className="text-fg">Reliability</span> — debounce, cooldown, and confidence filter.
          </li>
          <li>
            <span className="text-fg">Security</span> — no cloud video or command channel.
          </li>
        </ul>
        <p className="mt-4 text-sm text-muted">
          Scope limit from the original paper: static signs only, one hand, indoor lighting. Continuous
          ASL sentences are out of scope.
        </p>
      </section>
    </main>
  );
}

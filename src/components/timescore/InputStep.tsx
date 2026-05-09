import { useMemo, useState } from "react";
import { CATEGORIES, CategoryKey, DEFAULT_HOURS } from "@/lib/timescore";
import { HourSlider } from "./HourSlider";

interface Props {
  onComplete: (hours: Record<CategoryKey, number>) => void;
  onBack: () => void;
}

export function InputStep({ onComplete, onBack }: Props) {
  const [hours, setHours] = useState<Record<CategoryKey, number>>(DEFAULT_HOURS);

  const total = useMemo(() => Object.values(hours).reduce((a, b) => a + b, 0), [hours]);
  const remaining = +(24 - total).toFixed(1);
  const valid = Math.abs(remaining) < 0.05;

  const setKey = (k: CategoryKey, v: number) => setHours((h) => ({ ...h, [k]: v }));

  const autoBalance = () => {
    // distribute remaining proportionally to leisure/screen/work
    const targets: CategoryKey[] = ["leisure", "screen", "work"];
    const adj = remaining / targets.length;
    const next = { ...hours };
    targets.forEach((k) => (next[k] = Math.max(0, +(next[k] + adj).toFixed(1))));
    setHours(next);
  };

  return (
    <section className="relative min-h-screen px-6 py-12 bg-cosmic">
      <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative max-w-2xl mx-auto">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground mb-6">← back</button>
        <h2 className="text-3xl md:text-4xl font-bold mb-2">A regular day in your life</h2>
        <p className="text-muted-foreground mb-8">Distribute 24 hours across these five buckets. Be honest — nobody sees this but you.</p>

        {/* Total indicator */}
        <div className="glass rounded-2xl p-5 mb-6 flex items-center justify-between sticky top-4 z-10">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Total allocated</div>
            <div className="text-3xl font-display font-semibold tabular-nums">
              {total.toFixed(1)}<span className="text-muted-foreground">/24h</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${valid ? "text-primary" : remaining > 0 ? "text-warning" : "text-danger"}`}>
              {valid ? "Perfect ✓" : remaining > 0 ? `${remaining}h left` : `${Math.abs(remaining)}h over`}
            </div>
            {!valid && (
              <button onClick={autoBalance} className="text-xs text-muted-foreground hover:text-primary underline mt-1">
                auto-balance
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {CATEGORIES.map((c) => (
            <HourSlider key={c.key} category={c} value={hours[c.key]} onChange={(v) => setKey(c.key, v)} />
          ))}
        </div>

        <button
          disabled={!valid}
          onClick={() => onComplete(hours)}
          className="mt-8 w-full py-4 rounded-full bg-mint-magenta text-primary-foreground font-semibold text-lg shadow-glow disabled:opacity-40 disabled:cursor-not-allowed transition-transform hover:enabled:scale-[1.02]"
        >
          {valid ? "Reveal my TimeScore →" : "Adjust to exactly 24h"}
        </button>
      </div>
    </section>
  );
}

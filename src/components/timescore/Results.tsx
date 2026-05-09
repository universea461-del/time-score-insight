import { useEffect, useRef, useState } from "react";
import { CATEGORIES, CategoryKey, ScoreResult } from "@/lib/timescore";
import { SubmitToLeaderboard } from "./SubmitToLeaderboard";

interface Props {
  result: ScoreResult;
  hours: Record<CategoryKey, number>;
  resultId: string;
  onRestart: () => void;
}

const STATUS_META = {
  good: { color: "text-primary", bg: "bg-primary", label: "Good", icon: "✅" },
  warn: { color: "text-warning", bg: "bg-warning", label: "Warning", icon: "⚠️" },
  bad:  { color: "text-danger",  bg: "bg-danger",  label: "Critical", icon: "❌" },
} as const;

export function Results({ result, hours, resultId, onRestart }: Props) {
  const [displayScore, setDisplayScore] = useState(0);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const start = performance.now();
      const dur = 1200;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplayScore(Math.round(result.score * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 200);
    return () => clearTimeout(t);
  }, [result.score]);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/result/${resultId}` : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    // Render via SVG-in-canvas using foreignObject
    const node = cardRef.current;
    const w = node.offsetWidth;
    const h = node.offsetHeight;
    const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">${new XMLSerializer().serializeToString(node)}</div>
      </foreignObject>
    </svg>`;
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timescore-${result.score}.svg`;
    a.click();
  };

  const shareNative = async () => {
    const text = `I scored ${result.score}/100 on TimeScore. Profile: ${result.profile.label} ${result.profile.emoji}. Try yours:`;
    if (navigator.share) {
      try { await navigator.share({ title: "TimeScore", text, url: shareUrl }); } catch {}
    } else {
      copyLink();
    }
  };

  const scoreColor =
    result.score >= 75 ? "text-primary" : result.score >= 50 ? "text-warning" : "text-danger";

  return (
    <section className="relative min-h-screen px-6 py-12 bg-cosmic">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />

      <div className="relative max-w-3xl mx-auto space-y-10 animate-fade-up">
        {/* Score hero card */}
        <div ref={cardRef} className="glass rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-aurora opacity-[0.08] pointer-events-none" />
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">Your TimeScore</div>

          <div className="relative inline-block animate-count">
            <div className={`text-[10rem] md:text-[12rem] font-display font-bold leading-none tabular-nums ${scoreColor}`}>
              {displayScore}
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">/ 100</div>
          </div>

          <div className="mt-8">
            <div className="text-5xl mb-2">{result.profile.emoji}</div>
            <div className="text-2xl md:text-3xl font-display font-semibold text-aurora">{result.profile.label}</div>
            <p className="text-muted-foreground mt-2 italic">"{result.profile.tagline}"</p>
          </div>

          <div className="mt-8 inline-block px-5 py-2.5 rounded-full glass border-accent/40">
            <span className="text-sm">
              You're {result.score >= 50 ? "more balanced than" : "less balanced than"}{" "}
              <span className="font-semibold text-aurora">
                {result.score >= 50 ? 100 - result.percentileWorseThan : result.percentileWorseThan}%
              </span>{" "}
              of users
            </span>
          </div>
        </div>

        {/* Categories */}
        <div className="glass rounded-3xl p-6 md:p-8">
          <h3 className="text-xl font-semibold mb-5">Category breakdown</h3>
          <div className="space-y-4">
            {result.perCategory.map((c) => {
              const cat = CATEGORIES.find((x) => x.key === c.key)!;
              const meta = STATUS_META[c.status];
              const pct = Math.min(100, (c.hours / 12) * 100);
              const idealStart = (cat.ideal[0] / 12) * 100;
              const idealEnd = (cat.ideal[1] / 12) * 100;
              return (
                <div key={c.key}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      <span className="font-medium">{cat.label}</span>
                      <span className={`text-xs ${meta.color}`}>{meta.icon} {meta.label}</span>
                    </div>
                    <div className="tabular-nums text-muted-foreground">
                      {c.hours.toFixed(1)}h <span className="opacity-60">({c.diffPct >= 0 ? "+" : ""}{c.diffPct}%)</span>
                    </div>
                  </div>
                  <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
                    <div className="absolute top-0 bottom-0 bg-primary/15" style={{ left: `${idealStart}%`, width: `${idealEnd - idealStart}%` }} />
                    <div className={`absolute top-0 bottom-0 left-0 ${meta.bg} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="glass rounded-3xl p-6 md:p-8">
          <h3 className="text-xl font-semibold mb-4">What stands out</h3>
          <ul className="space-y-3">
            {result.insights.map((i, idx) => (
              <li key={idx} className="flex gap-3 text-sm md:text-base">
                <span className="text-accent text-lg leading-none mt-0.5">●</span>
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendation */}
        <div className="rounded-3xl p-6 md:p-8 bg-mint-magenta text-primary-foreground shadow-glow">
          <div className="text-xs uppercase tracking-widest opacity-80 mb-2">Smart recommendation</div>
          <h3 className="text-2xl font-display font-semibold mb-5">Here's a better version of your day</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {CATEGORIES.map((c) => {
              const target = result.recommendations[c.key];
              const cur = hours[c.key];
              const delta = +(target - cur).toFixed(1);
              return (
                <div key={c.key} className="rounded-2xl bg-background/20 backdrop-blur p-3 text-center">
                  <div className="text-xl">{c.emoji}</div>
                  <div className="text-xs opacity-80 mt-1">{c.label}</div>
                  <div className="text-lg font-semibold tabular-nums mt-1">{target}h</div>
                  {delta !== 0 && (
                    <div className="text-[10px] opacity-90">{delta > 0 ? `+${delta}h` : `${delta}h`}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Share */}
        <div className="glass rounded-3xl p-6 md:p-8">
          <h3 className="text-xl font-semibold mb-1">I just analyzed my life… this is scary 😳</h3>
          <p className="text-sm text-muted-foreground mb-5">Share your TimeScore. Dare a friend to beat it.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={shareNative} className="px-4 py-3 rounded-full bg-mint-magenta text-primary-foreground font-medium hover:scale-[1.02] transition-transform">
              📲 Share
            </button>
            <button onClick={copyLink} className="px-4 py-3 rounded-full glass font-medium hover:border-primary/40 transition">
              {copied ? "✓ Copied!" : "🔗 Copy link"}
            </button>
            <button onClick={downloadCard} className="px-4 py-3 rounded-full glass font-medium hover:border-primary/40 transition">
              ⬇️ Download card
            </button>
          </div>
          <div className="mt-4 text-xs text-muted-foreground break-all opacity-70">{shareUrl}</div>
        </div>

        <button onClick={onRestart} className="w-full text-sm text-muted-foreground hover:text-foreground py-4">
          ↻ Run another analysis
        </button>
      </div>
    </section>
  );
}

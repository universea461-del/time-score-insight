import { Link } from "@tanstack/react-router";

interface Props { onStart: () => void }

export function Landing({ onStart }: Props) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-cosmic">
      {/* Floating orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative max-w-3xl text-center animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs uppercase tracking-widest text-muted-foreground mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          TimeScore · v1
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6">
          Are you <span className="text-aurora">using</span> your time…
          <br />
          or is time <span className="italic text-muted-foreground">using you?</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
          Analyze your daily routine in 30 seconds. Get a brutally honest score, profile, and a sharper version of your day.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-mint-magenta text-primary-foreground font-semibold text-lg shadow-glow-magenta transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Start Analysis
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
          <Link
            to="/leaderboard"
            className="px-6 py-4 rounded-full glass font-medium text-foreground hover:border-primary/40 transition"
          >
            🏆 Leaderboard
          </Link>
        </div>

        <div className="mt-14 flex items-center justify-center gap-8 text-xs text-muted-foreground">
          <Stat n="30s" label="to complete" />
          <div className="w-px h-8 bg-border" />
          <Stat n="100" label="point score" />
          <div className="w-px h-8 bg-border" />
          <Stat n="∞" label="brutal honesty" />
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-display font-semibold text-foreground">{n}</div>
      <div className="uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

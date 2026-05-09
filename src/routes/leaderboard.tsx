import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getLeaderboard, LeaderEntry } from "@/lib/leaderboard";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "TimeScore Leaderboard — Most Balanced Days" },
      { name: "description", content: "See the most balanced TimeScores. Can you beat the top of the board?" },
      { property: "og:title", content: "TimeScore Leaderboard" },
      { property: "og:description", content: "The most balanced humans on TimeScore. Where do you rank?" },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderEntry[]>([]);

  useEffect(() => { setEntries(getLeaderboard()); }, []);

  return (
    <section className="relative min-h-screen px-6 py-12 bg-cosmic">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
      <div className="relative max-w-2xl mx-auto animate-fade-up">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← home</Link>
          <Link to="/" className="text-sm px-4 py-2 rounded-full bg-mint-magenta text-primary-foreground font-medium">
            Get my score →
          </Link>
        </div>

        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Leaderboard</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            The most <span className="text-aurora">balanced</span> humans
          </h1>
          <p className="text-muted-foreground">Top TimeScores across all players. Higher is better.</p>
        </div>

        {entries.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center text-muted-foreground">No entries yet — be the first.</div>
        ) : (
          <div className="space-y-2">
            {entries.slice(0, 25).map((e, i) => <Row key={e.id} entry={e} rank={i + 1} />)}
          </div>
        )}
      </div>
    </section>
  );
}

const MEDAL = ["🥇", "🥈", "🥉"];

function Row({ entry, rank }: { entry: LeaderEntry; rank: number }) {
  const top = rank <= 3;
  const scoreColor = entry.score >= 75 ? "text-primary" : entry.score >= 50 ? "text-warning" : "text-danger";
  return (
    <div className={`glass rounded-2xl p-4 flex items-center gap-4 transition-all hover:border-primary/30 ${top ? "shadow-glow" : ""}`}>
      <div className="w-10 text-center">
        {top ? <span className="text-2xl">{MEDAL[rank - 1]}</span> : <span className="text-muted-foreground tabular-nums">#{rank}</span>}
      </div>
      <div className="text-2xl">{entry.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{entry.name}</div>
        <div className="text-xs text-muted-foreground truncate">{entry.profile}</div>
      </div>
      <div className={`text-2xl font-display font-semibold tabular-nums ${scoreColor}`}>
        {entry.score}
        <span className="text-xs text-muted-foreground ml-1">/100</span>
      </div>
    </div>
  );
}

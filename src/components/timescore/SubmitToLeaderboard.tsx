import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { submitToLeaderboard } from "@/lib/leaderboard";
import type { CategoryKey } from "@/lib/timescore";

interface Props { hours: Record<CategoryKey, number>; score: number }

export function SubmitToLeaderboard({ hours, score }: Props) {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    submitToLeaderboard(name, hours);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="glass rounded-3xl p-6 md:p-8 text-center">
        <div className="text-4xl mb-2">🏆</div>
        <h3 className="text-xl font-semibold mb-1">You're on the board</h3>
        <p className="text-sm text-muted-foreground mb-5">Score {score} submitted as <span className="text-foreground font-medium">{name || "Anonymous"}</span>.</p>
        <Link to="/leaderboard" className="inline-block px-6 py-3 rounded-full bg-mint-magenta text-primary-foreground font-semibold shadow-glow">
          See leaderboard →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass rounded-3xl p-6 md:p-8">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-xl font-semibold">Join the leaderboard</h3>
        <Link to="/leaderboard" className="text-xs text-muted-foreground hover:text-foreground underline">view board</Link>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Drop a name and pin your score to the global ranking.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          placeholder="Your name or alias"
          className="flex-1 px-5 py-3 rounded-full bg-secondary text-foreground placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
        />
        <button type="submit" className="px-6 py-3 rounded-full bg-mint-magenta text-primary-foreground font-semibold shadow-glow hover:scale-[1.02] transition-transform">
          Submit score
        </button>
      </div>
    </form>
  );
}

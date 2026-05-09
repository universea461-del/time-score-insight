import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Results } from "@/components/timescore/Results";
import { calcScore, CategoryKey, DEFAULT_HOURS } from "@/lib/timescore";
import { getResult } from "@/lib/result-store";

export const Route = createFileRoute("/result/$id")({
  head: () => ({
    meta: [
      { title: "A TimeScore result — see how your day compares" },
      { name: "description", content: "Someone shared their TimeScore. See the breakdown and run yours in 30 seconds." },
      { property: "og:title", content: "Someone just shared their TimeScore 👀" },
      { property: "og:description", content: "Run your own analysis in 30 seconds." },
    ],
  }),
  component: ResultPage,
});

function ResultPage() {
  const { id } = Route.useParams();
  const [hours, setHours] = useState<Record<CategoryKey, number> | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const r = getResult(id);
    if (r) setHours(r.hours);
    else setMissing(true);
  }, [id]);

  if (missing) {
    return (
      <div className="min-h-screen bg-cosmic flex items-center justify-center px-6 text-center">
        <div className="max-w-md animate-fade-up">
          <div className="text-6xl mb-4">🕳️</div>
          <h1 className="text-3xl font-display font-bold mb-2">This result isn't here</h1>
          <p className="text-muted-foreground mb-6">Result links live in the browser they were created in. Run your own — it takes 30 seconds.</p>
          <Link to="/" className="inline-block px-6 py-3 rounded-full bg-mint-magenta text-primary-foreground font-semibold shadow-glow">
            Get my TimeScore →
          </Link>
        </div>
      </div>
    );
  }

  if (!hours) return <div className="min-h-screen bg-cosmic" />;

  return (
    <Results
      result={calcScore(hours)}
      hours={hours}
      resultId={id}
      onRestart={() => { window.location.href = "/"; }}
    />
  );
}

// silence unused import warning if needed
void DEFAULT_HOURS;

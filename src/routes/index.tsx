import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Landing } from "@/components/timescore/Landing";
import { InputStep } from "@/components/timescore/InputStep";
import { Results } from "@/components/timescore/Results";
import { calcScore, CategoryKey } from "@/lib/timescore";
import { saveResult } from "@/lib/result-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TimeScore — Where Does Your Time Go?" },
      { name: "description", content: "Analyze your daily routine in 30 seconds. Get a brutally honest score and a sharper version of your day." },
      { property: "og:title", content: "TimeScore — Where Does Your Time Go?" },
      { property: "og:description", content: "Are you using your time… or is time using you? Get your score." },
    ],
  }),
  component: Index,
});

type Step = "landing" | "input" | "results";

function Index() {
  const [step, setStep] = useState<Step>("landing");
  const [hours, setHours] = useState<Record<CategoryKey, number> | null>(null);
  const [resultId, setResultId] = useState<string>("");

  if (step === "landing") return <Landing onStart={() => setStep("input")} />;
  if (step === "input")
    return (
      <InputStep
        onBack={() => setStep("landing")}
        onComplete={(h) => {
          setHours(h);
          setResultId(saveResult(h));
          setStep("results");
        }}
      />
    );
  if (hours) {
    return (
      <Results
        result={calcScore(hours)}
        hours={hours}
        resultId={resultId}
        onRestart={() => { setHours(null); setStep("landing"); }}
      />
    );
  }
  return null;
}

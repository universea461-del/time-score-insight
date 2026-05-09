export type CategoryKey = "sleep" | "work" | "screen" | "growth" | "leisure";

export interface Category {
  key: CategoryKey;
  label: string;
  emoji: string;
  ideal: [number, number]; // min, max
  weight: number;
  penalty?: number; // extra penalty multiplier when over max
}

export const CATEGORIES: Category[] = [
  { key: "sleep",   label: "Sleep",                  emoji: "😴", ideal: [7, 8],   weight: 1.4 },
  { key: "work",    label: "Work / Study",           emoji: "💼", ideal: [6, 8],   weight: 1.0 },
  { key: "screen",  label: "Screen / Phone",         emoji: "📱", ideal: [2, 3],   weight: 1.6, penalty: 1.8 },
  { key: "growth",  label: "Exercise / Growth",      emoji: "🧠", ideal: [1, 2],   weight: 1.3 },
  { key: "leisure", label: "Leisure / Relax",        emoji: "🎮", ideal: [2, 3],   weight: 0.9 },
];

export const DEFAULT_HOURS: Record<CategoryKey, number> = {
  sleep: 6, work: 8, screen: 5, growth: 1, leisure: 4,
};

export type CatStatus = "good" | "warn" | "bad";

export function statusOf(hours: number, [min, max]: [number, number]): CatStatus {
  if (hours >= min && hours <= max) return "good";
  const dev = hours < min ? min - hours : hours - max;
  return dev > 1.5 ? "bad" : "warn";
}

export function deviation(hours: number, [min, max]: [number, number]): number {
  if (hours >= min && hours <= max) return 0;
  return hours < min ? min - hours : hours - max;
}

export interface ScoreResult {
  score: number;
  totalDeviation: number;
  perCategory: Array<{
    key: CategoryKey;
    hours: number;
    ideal: [number, number];
    status: CatStatus;
    deviation: number;
    diffPct: number; // % vs midpoint of ideal
  }>;
  profile: { label: string; emoji: string; tagline: string };
  percentileWorseThan: number; // % of users you are worse than
  insights: string[];
  recommendations: Record<CategoryKey, number>;
}

export function calcScore(hours: Record<CategoryKey, number>): ScoreResult {
  let weightedDev = 0;
  const per = CATEGORIES.map((c) => {
    const h = hours[c.key];
    const dev = deviation(h, c.ideal);
    const over = h > c.ideal[1];
    const factor = over && c.penalty ? c.penalty : 1;
    weightedDev += dev * c.weight * factor;
    const mid = (c.ideal[0] + c.ideal[1]) / 2;
    return {
      key: c.key,
      hours: h,
      ideal: c.ideal,
      status: statusOf(h, c.ideal),
      deviation: dev,
      diffPct: Math.round(((h - mid) / mid) * 100),
    };
  });

  const score = Math.max(0, Math.min(100, Math.round(100 - weightedDev * 5.5)));

  // Profile labeling
  const screen = hours.screen;
  const sleep = hours.sleep;
  const growth = hours.growth;
  const work = hours.work;

  let profile = { label: "Highly Balanced", emoji: "⚖️", tagline: "You treat your day like an athlete treats a season." };
  if (score >= 80) profile = { label: "Highly Balanced", emoji: "⚖️", tagline: "You treat your day like an athlete treats a season." };
  else if (screen >= 6) profile = { label: "Screen Addict", emoji: "📱", tagline: "Your phone is winning the relationship." };
  else if (work >= 10 && sleep < 6) profile = { label: "Productive but Burned Out", emoji: "🔥", tagline: "Output is high. Battery is at 4%." };
  else if (sleep >= 10) profile = { label: "Low Energy Lifestyle", emoji: "😴", tagline: "Hibernation mode: enabled." };
  else if (growth < 0.5 && leisureHeavy(hours)) profile = { label: "Comfort Seeker", emoji: "🛋️", tagline: "You optimize for cozy, not for growth." };
  else if (score < 40) profile = { label: "Chaotic Routine", emoji: "😵", tagline: "Your schedule was written by a raccoon at 3am." };
  else profile = { label: "Almost There", emoji: "🌗", tagline: "A few small swaps and you're elite." };

  // Mock percentile - lower score => worse than more people
  const percentileWorseThan = Math.max(2, Math.min(98, Math.round(95 - score * 0.85)));

  const insights = buildInsights(hours, per);
  const recommendations = buildRecommendations(hours);

  return { score, totalDeviation: +weightedDev.toFixed(1), perCategory: per, profile, percentileWorseThan, insights, recommendations };
}

function leisureHeavy(h: Record<CategoryKey, number>) {
  return h.leisure + h.screen >= 8;
}

function buildInsights(h: Record<CategoryKey, number>, per: ScoreResult["perCategory"]): string[] {
  const out: string[] = [];
  const screenAvg = 2.5;
  if (h.screen > screenAvg + 1) out.push(`You spend ${(h.screen - screenAvg).toFixed(1)}h more than average on your phone.`);
  if (h.sleep < 7) out.push(`Your sleep is ${Math.round(((7 - h.sleep) / 7) * 100)}% below optimal.`);
  if (h.growth < 1) out.push(`You invest only ${(h.growth * 60).toFixed(0)} minutes in growth — most high-performers do 90+.`);
  if (h.work > 9) out.push(`You work ${(h.work - 8).toFixed(1)}h beyond a healthy ceiling.`);
  if (h.leisure < 1.5) out.push(`Almost zero true downtime — burnout risk.`);
  if (out.length === 0) out.push("Your distribution is unusually balanced. Stay there.");
  return out.slice(0, 4);
}

function buildRecommendations(h: Record<CategoryKey, number>): Record<CategoryKey, number> {
  const target: Record<CategoryKey, number> = {
    sleep: clampToward(h.sleep, 7.5),
    work: clampToward(h.work, 7.5),
    screen: clampToward(h.screen, 2.5),
    growth: clampToward(h.growth, 1.5),
    leisure: clampToward(h.leisure, 2.5),
  };
  // normalize to 24
  const sum = Object.values(target).reduce((a, b) => a + b, 0);
  const factor = 24 / sum;
  (Object.keys(target) as CategoryKey[]).forEach((k) => {
    target[k] = +(target[k] * factor).toFixed(1);
  });
  return target;
}

function clampToward(current: number, ideal: number): number {
  // Move halfway toward ideal so the suggestion feels achievable
  return +(current + (ideal - current) * 0.7).toFixed(1);
}

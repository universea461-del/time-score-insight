import { calcScore, CategoryKey } from "./timescore";

const KEY = "timescore:leaderboard";

export interface LeaderEntry {
  id: string;
  name: string;
  score: number;
  profile: string;
  emoji: string;
  hours: Record<CategoryKey, number>;
  createdAt: number;
}

interface Store { entries: LeaderEntry[] }

function read(): Store {
  if (typeof window === "undefined") return { entries: [] };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw && Array.isArray(raw.entries)) return raw;
  } catch {}
  return { entries: seedEntries() };
}

function write(s: Store) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function getLeaderboard(): LeaderEntry[] {
  return read().entries.slice().sort((a, b) => b.score - a.score);
}

export function submitToLeaderboard(name: string, hours: Record<CategoryKey, number>): LeaderEntry {
  const r = calcScore(hours);
  const entry: LeaderEntry = {
    id: Math.random().toString(36).slice(2, 9),
    name: name.trim().slice(0, 24) || "Anonymous",
    score: r.score,
    profile: r.profile.label,
    emoji: r.profile.emoji,
    hours,
    createdAt: Date.now(),
  };
  const s = read();
  s.entries.push(entry);
  s.entries = s.entries.sort((a, b) => b.score - a.score).slice(0, 100);
  write(s);
  return entry;
}

function seedEntries(): LeaderEntry[] {
  const seeds: Array<[string, Record<CategoryKey, number>]> = [
    ["Aiko",   { sleep: 8,   work: 7,   screen: 2, growth: 2,   leisure: 5 }],
    ["Marcus", { sleep: 7.5, work: 8,   screen: 2, growth: 2,   leisure: 4.5 }],
    ["Lena",   { sleep: 8,   work: 6,   screen: 3, growth: 2,   leisure: 5 }],
    ["Devon",  { sleep: 7,   work: 8,   screen: 3, growth: 1.5, leisure: 4.5 }],
    ["Priya",  { sleep: 7.5, work: 7,   screen: 2.5, growth: 1.5, leisure: 5.5 }],
    ["Theo",   { sleep: 6.5, work: 9,   screen: 3, growth: 1,   leisure: 4.5 }],
    ["Sara",   { sleep: 9,   work: 6,   screen: 2, growth: 1,   leisure: 6 }],
    ["Kenji",  { sleep: 6,   work: 10,  screen: 3, growth: 1,   leisure: 4 }],
  ];
  return seeds.map(([name, hours]) => {
    const r = calcScore(hours);
    return {
      id: Math.random().toString(36).slice(2, 9),
      name, score: r.score, profile: r.profile.label, emoji: r.profile.emoji,
      hours, createdAt: Date.now() - Math.random() * 1e9,
    };
  });
}

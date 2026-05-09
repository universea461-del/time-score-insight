import type { CategoryKey } from "./timescore";

const KEY = "timescore:results";

export interface StoredResult {
  id: string;
  hours: Record<CategoryKey, number>;
  createdAt: number;
}

function read(): Record<string, StoredResult> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

export function saveResult(hours: Record<CategoryKey, number>): string {
  const id = Math.random().toString(36).slice(2, 9);
  const all = read();
  all[id] = { id, hours, createdAt: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(all));
  return id;
}

export function getResult(id: string): StoredResult | null {
  return read()[id] ?? null;
}

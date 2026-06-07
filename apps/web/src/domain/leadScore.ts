// AI lead scoring (heuristic baseline). In production this blends with an LLM
// signal; the deterministic core lives here so it is testable. See docs/07 §9.

export interface LeadSignals {
  productsViewed?: number;
  categoriesViewed?: number;
  dwellMs?: number;
  messages?: number;
  inquiries?: number;
}

export type LeadScore = "hot" | "warm" | "cold";

export function scoreLead(s: LeadSignals): LeadScore {
  let points = 0;
  points += Math.min(s.productsViewed ?? 0, 10);
  points += (s.categoriesViewed ?? 0) * 2;
  points += Math.min((s.dwellMs ?? 0) / 1000 / 30, 10); // up to 10 for ~5 min dwell
  points += (s.messages ?? 0) * 5;
  points += (s.inquiries ?? 0) * 8;

  if (points >= 20) return "hot";
  if (points >= 8) return "warm";
  return "cold";
}

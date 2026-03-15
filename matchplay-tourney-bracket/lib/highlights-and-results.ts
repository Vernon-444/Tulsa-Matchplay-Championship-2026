import type { BracketMatch, DoubleElimMatches, Participant } from "@/lib/bracket-data-64";
import type { MatchResultWithDate } from "@/lib/supabase/admin";
import { getWeekDateRange } from "@/lib/bracket-data-64";

const TOURNAMENT_START = new Date(2026, 2, 8); // March 8, 2026

function ratingAsNumber(p: Participant | undefined): number | null {
  const r = p?.rating;
  if (typeof r === "number" && !Number.isNaN(r)) return r;
  if (typeof r === "string") {
    const n = Number(r);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

/** Combined rating of both participants; 0 if either missing or non-numeric. */
export function getCombinedRating(match: BracketMatch): number {
  const a = ratingAsNumber(match.participants[0]);
  const b = ratingAsNumber(match.participants[1]);
  if (a == null || b == null) return 0;
  return a + b;
}

function allMatches(matches: DoubleElimMatches): BracketMatch[] {
  return [...matches.upper, ...matches.lower];
}

export function findMatchById(matches: DoubleElimMatches, matchId: number): BracketMatch | null {
  return allMatches(matches).find((m) => m.id === matchId) ?? null;
}

/** "Brayden Vernon (876) vs Austin Hoxie (971)" */
export function formatMatchLabel(match: BracketMatch): string {
  const p0 = match.participants[0];
  const p1 = match.participants[1];
  const name0 = p0?.name && p0.name !== "TBD" ? p0.name : "TBD";
  const name1 = p1?.name && p1.name !== "TBD" ? p1.name : "TBD";
  const r0 = ratingAsNumber(p0);
  const r1 = ratingAsNumber(p1);
  const rating0 = r0 != null ? ` (${r0})` : "";
  const rating1 = r1 != null ? ` (${r1})` : "";
  return `${name0}${rating0} vs ${name1}${rating1}`;
}

/** Top n matches by combined rating, excluding given match IDs. */
export function getTopMatchesByCombinedRating(
  matches: DoubleElimMatches,
  excludeMatchIds: number[],
  n: number
): BracketMatch[] {
  const exclude = new Set(excludeMatchIds);
  const withRating = allMatches(matches).filter((m) => {
    if (exclude.has(m.id)) return false;
    return getCombinedRating(m) > 0;
  });
  withRating.sort((a, b) => getCombinedRating(b) - getCombinedRating(a));
  return withRating.slice(0, n);
}

/** Top n matches by combined rating in a specific round only. */
export function getTopMatchesByCombinedRatingForRound(
  matches: DoubleElimMatches,
  roundNumber: number,
  excludeMatchIds: number[],
  n: number
): BracketMatch[] {
  const roundText = String(roundNumber);
  const exclude = new Set(excludeMatchIds);
  const inRound = allMatches(matches).filter((m) => {
    if (m.tournamentRoundText !== roundText) return false;
    if (exclude.has(m.id)) return false;
    return getCombinedRating(m) > 0;
  });
  inRound.sort((a, b) => getCombinedRating(b) - getCombinedRating(a));
  return inRound.slice(0, n);
}

/** Top n matches by combined rating in a specific round and bracket (upper = WB, lower = LB). */
export function getTopMatchesByCombinedRatingForRoundAndBracket(
  matches: DoubleElimMatches,
  roundNumber: number,
  bracket: "upper" | "lower",
  excludeMatchIds: number[],
  n: number
): BracketMatch[] {
  const pool = bracket === "upper" ? matches.upper : matches.lower;
  const roundText = String(roundNumber);
  const exclude = new Set(excludeMatchIds);
  const inRound = pool.filter((m) => {
    if (m.tournamentRoundText !== roundText) return false;
    if (exclude.has(m.id)) return false;
    return getCombinedRating(m) > 0;
  });
  inRound.sort((a, b) => getCombinedRating(b) - getCombinedRating(a));
  return inRound.slice(0, n);
}

/** Week number (1-based) from ISO date string. */
function getWeekNumber(createdAt: string): number {
  const d = new Date(createdAt);
  const start = new Date(TOURNAMENT_START);
  const diffMs = d.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

export interface Upset {
  matchId: number;
  matchName: string;
  winnerName: string;
  loserName: string;
  winnerRating: number;
  loserRating: number;
  ratingGap: number;
}

export interface WeekUpsets {
  weekNumber: number;
  weekLabel: string;
  upsets: Upset[];
}

/** Biggest upsets: winner rated ≥15 points below loser. Grouped by week. */
export function getUpsetsGroupedByWeek(
  matches: DoubleElimMatches,
  resultsWithDates: MatchResultWithDate[]
): WeekUpsets[] {
  const matchById = new Map<number, BracketMatch>();
  for (const m of allMatches(matches)) {
    matchById.set(m.id, m);
  }

  const upsetsByWeek = new Map<number, Upset[]>();

  for (const r of resultsWithDates) {
    const match = matchById.get(r.matchId);
    if (!match) continue;
    const winnerSlot = r.winnerSlot as 0 | 1;
    const loserSlot = 1 - winnerSlot;
    const winner = match.participants[winnerSlot];
    const loser = match.participants[loserSlot];
    const winnerRating = ratingAsNumber(winner);
    const loserRating = ratingAsNumber(loser);
    if (winnerRating == null || loserRating == null) continue;
    if (winnerRating >= loserRating - 15) continue; // not an upset (underdog must be ≥15 lower)
    const winnerName = winner?.name && winner.name !== "TBD" ? winner.name : "TBD";
    const loserName = loser?.name && loser.name !== "TBD" ? loser.name : "TBD";

    const week = getWeekNumber(r.createdAt);
    const list = upsetsByWeek.get(week) ?? [];
    list.push({
      matchId: match.id,
      matchName: match.name,
      winnerName,
      loserName,
      winnerRating,
      loserRating,
      ratingGap: loserRating - winnerRating,
    });
    upsetsByWeek.set(week, list);
  }

  const weeks = Array.from(upsetsByWeek.entries())
    .sort(([a], [b]) => a - b)
    .map(([weekNumber, upsets]) => ({
      weekNumber,
      weekLabel: `Week ${weekNumber} (${getWeekDateRange(weekNumber)})`,
      upsets: upsets.sort((a, b) => b.ratingGap - a.ratingGap),
    }));

  return weeks;
}

import { createClient } from "@supabase/supabase-js";
import type { MatchResult } from "@/lib/bracket-apply-results";

/**
 * Server-side Supabase client with anon key only (no user session).
 * Use for public reads (e.g. GET bracket results) in API routes and server components.
 */
export function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");
  return createClient(url, key);
}

/** Match result with timestamp for grouping by week. */
export interface MatchResultWithDate extends MatchResult {
  createdAt: string;
}

/** Fetch all match results in order (server-side). */
export async function getMatchResults(): Promise<MatchResult[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("match_results")
    .select("match_id, winner_slot")
    .order("id", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    matchId: row.match_id,
    winnerSlot: row.winner_slot as 0 | 1,
  }));
}

/** Fetch match results with created_at for weekly breakdowns. */
export async function getMatchResultsWithDates(): Promise<MatchResultWithDate[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("match_results")
    .select("match_id, winner_slot, created_at")
    .order("id", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    matchId: row.match_id,
    winnerSlot: row.winner_slot as 0 | 1,
    createdAt: (row as { created_at?: string }).created_at ?? new Date().toISOString(),
  }));
}

export interface HighlightMatchIds {
  wb: number[];
  lb: number[];
}

/**
 * Fetch admin-selected highlight match IDs by bracket (WB and LB).
 * Returns { wb: [], lb: [] } if the table does not exist or on any error.
 */
export async function getHighlightMatchIds(): Promise<HighlightMatchIds> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("highlight_matches")
      .select("wb_match_1, wb_match_2, lb_match_1, lb_match_2")
      .eq("id", 1)
      .single();
    if (error || !data) return { wb: [], lb: [] };
    const row = data as { wb_match_1?: number; wb_match_2?: number; lb_match_1?: number; lb_match_2?: number };
    const wb: number[] = [];
    const lb: number[] = [];
    if (typeof row.wb_match_1 === "number") wb.push(row.wb_match_1);
    if (typeof row.wb_match_2 === "number") wb.push(row.wb_match_2);
    if (typeof row.lb_match_1 === "number") lb.push(row.lb_match_1);
    if (typeof row.lb_match_2 === "number") lb.push(row.lb_match_2);
    return { wb, lb };
  } catch {
    return { wb: [], lb: [] };
  }
}

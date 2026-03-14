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

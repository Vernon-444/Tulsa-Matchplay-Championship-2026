import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createAnonClient } from "@/lib/supabase/admin";
import type { MatchResult } from "@/lib/bracket-apply-results";

export const dynamic = "force-dynamic";

/** GET: return all match results in order (public). */
export async function GET() {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("match_results")
      .select("match_id, winner_slot")
      .order("id", { ascending: true });

    if (error) {
      console.error("bracket results GET", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const results: MatchResult[] = (data ?? []).map((row) => ({
      matchId: row.match_id,
      winnerSlot: row.winner_slot as 0 | 1,
    }));
    return NextResponse.json({ results });
  } catch (err) {
    console.error("bracket results GET", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load results" },
      { status: 500 }
    );
  }
}

/** POST: append one result (auth required). */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const matchId = Number(body?.matchId);
  const winnerSlot = body?.winnerSlot;

  if (
    typeof matchId !== "number" ||
    isNaN(matchId) ||
    (winnerSlot !== 0 && winnerSlot !== 1)
  ) {
    return NextResponse.json(
      { error: "Invalid body: need matchId (number) and winnerSlot (0 or 1)" },
      { status: 400 }
    );
  }

  const response = NextResponse.json({});
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("match_results")
    .insert({ match_id: matchId, winner_slot: winnerSlot });

  if (error) {
    console.error("bracket results POST", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: list } = await supabase
    .from("match_results")
    .select("match_id, winner_slot")
    .order("id", { ascending: true });
  const results: MatchResult[] = (list ?? []).map((row) => ({
    matchId: row.match_id,
    winnerSlot: row.winner_slot as 0 | 1,
  }));
  return NextResponse.json({ results }, { headers: response.headers });
}

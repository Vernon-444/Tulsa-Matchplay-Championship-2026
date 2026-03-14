import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { MatchResult } from "@/lib/bracket-apply-results";

export const dynamic = "force-dynamic";

/** DELETE: remove the most recent result (auth required). */
export async function DELETE(request: NextRequest) {
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

  const { data: last } = await supabase
    .from("match_results")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .single();

  if (!last) {
    return NextResponse.json(
      { error: "No results to undo" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("match_results")
    .delete()
    .eq("id", last.id);

  if (error) {
    console.error("bracket results undo", error);
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

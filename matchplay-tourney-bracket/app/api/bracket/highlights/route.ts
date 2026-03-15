import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createAnonClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET: return admin-selected highlight match IDs by bracket (public).
 * Returns { wb: [], lb: [] } if the table does not exist yet.
 */
export async function GET() {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("highlight_matches")
      .select("wb_match_1, wb_match_2, lb_match_1, lb_match_2")
      .eq("id", 1)
      .single();

    if (error) {
      return NextResponse.json({ wb: [], lb: [] });
    }
    const row = data as { wb_match_1?: number; wb_match_2?: number; lb_match_1?: number; lb_match_2?: number };
    const wb: number[] = [];
    const lb: number[] = [];
    if (typeof row.wb_match_1 === "number") wb.push(row.wb_match_1);
    if (typeof row.wb_match_2 === "number") wb.push(row.wb_match_2);
    if (typeof row.lb_match_1 === "number") lb.push(row.lb_match_1);
    if (typeof row.lb_match_2 === "number") lb.push(row.lb_match_2);
    return NextResponse.json({ wb, lb });
  } catch {
    return NextResponse.json({ wb: [], lb: [] });
  }
}

/** PATCH: set highlight match IDs per bracket (auth required). Body: { wb: number[], lb: number[] } */
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const toIds = (arr: unknown): number[] =>
    Array.isArray(arr)
      ? arr
          .map((x: unknown) => (typeof x === "number" && !Number.isNaN(x) ? x : null))
          .filter((x: number | null): x is number => x !== null)
          .slice(0, 2)
      : [];
  const wb = toIds(body?.wb);
  const lb = toIds(body?.lb);
  const [wb1, wb2] = [wb[0] ?? null, wb[1] ?? null];
  const [lb1, lb2] = [lb[0] ?? null, lb[1] ?? null];

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

  const { data: updated, error } = await supabase
    .from("highlight_matches")
    .upsert(
      { id: 1, wb_match_1: wb1, wb_match_2: wb2, lb_match_1: lb1, lb_match_2: lb2 },
      { onConflict: "id" }
    )
    .select("wb_match_1, wb_match_2, lb_match_1, lb_match_2")
    .single();

  if (error) {
    console.error("highlights PATCH", error);
    const msg = String(error.message ?? "");
    const tableMissing =
      /relation.*does not exist|schema cache|could not find.*table/i.test(msg);
    if (tableMissing) {
      return NextResponse.json(
        {
          error:
            "Highlight matches table is not set up. Run supabase-highlight-matches.sql in the Supabase SQL Editor to create it.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/");
  const row = updated as { wb_match_1?: number; wb_match_2?: number; lb_match_1?: number; lb_match_2?: number };
  const savedWb = [row.wb_match_1, row.wb_match_2].filter((x): x is number => typeof x === "number");
  const savedLb = [row.lb_match_1, row.lb_match_2].filter((x): x is number => typeof x === "number");
  return NextResponse.json({ wb: savedWb, lb: savedLb }, { headers: response.headers });
}

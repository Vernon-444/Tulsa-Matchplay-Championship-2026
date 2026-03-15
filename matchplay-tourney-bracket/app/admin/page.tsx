import AdminBracketClient from "@/components/AdminBracketClient";
import AdminHighlightPicker from "@/components/AdminHighlightPicker";
import { TULSA_2026_PLAYERS } from "@/data/tulsa-2026-players";
import { applyAllResults } from "@/lib/bracket-apply-results";
import { generate64PlayerDoubleElimBracket, getCurrentRoundNumber } from "@/lib/bracket-data-64";
import { getHighlightMatchIds, getMatchResults } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let results: Awaited<ReturnType<typeof getMatchResults>> = [];
  let highlightMatchIds: Awaited<ReturnType<typeof getHighlightMatchIds>> = { wb: [], lb: [] };
  try {
    [results, highlightMatchIds] = await Promise.all([
      getMatchResults(),
      getHighlightMatchIds(),
    ]);
  } catch {
    // highlight_matches table may not exist
  }
  const baseBracket = generate64PlayerDoubleElimBracket(TULSA_2026_PLAYERS);
  const matches = applyAllResults(baseBracket, results);
  const currentRound = getCurrentRoundNumber();

  return (
    <div className="mx-auto w-[90vw] max-w-[90vw] px-2 py-8 md:w-full md:max-w-[50vw] md:px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#162B49]">Admin</h1>
          <p className="mt-1 text-sm text-[#162B49]/80">
            Signed in as {user.email}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/"
            className="rounded-lg border-2 border-[#162B49] px-4 py-2 text-sm font-medium text-[#162B49] transition-colors hover:bg-[#162B49]/10"
          >
            View bracket
          </Link>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border-2 border-[#C6202E] px-4 py-2 text-sm font-medium text-[#C6202E] transition-colors hover:bg-[#C6202E]/10"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <AdminHighlightPicker
        matches={matches}
        initialMatchIds={highlightMatchIds}
        currentRound={currentRound}
      />

      <AdminBracketClient
        initialMatches={matches}
        resultsCount={results.length}
      />
    </div>
  );
}

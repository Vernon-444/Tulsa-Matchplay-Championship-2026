import type { DoubleElimMatches } from "@/lib/bracket-data-64";
import { getWeekDateRange } from "@/lib/bracket-data-64";
import type { HighlightMatchIds } from "@/lib/supabase/admin";
import {
  findMatchById,
  formatMatchLabel,
  getTopMatchesByCombinedRatingForRoundAndBracket,
} from "@/lib/highlights-and-results";

interface HighlightMatchesSectionProps {
  matches: DoubleElimMatches;
  adminHighlightMatchIds: HighlightMatchIds;
  currentRound: number;
}

function BracketPool({
  title,
  matches,
  topMatchIds,
  adminMatchIds,
}: {
  title: string;
  matches: DoubleElimMatches;
  topMatchIds: number[];
  adminMatchIds: number[];
}) {
  const topMatches = topMatchIds
    .map((id) => findMatchById(matches, id))
    .filter((m): m is NonNullable<typeof m> => m != null);
  const adminMatches = adminMatchIds
    .map((id) => findMatchById(matches, id))
    .filter((m): m is NonNullable<typeof m> => m != null);
  const list = [...topMatches, ...adminMatches];

  return (
    <div className="min-w-0 rounded-lg border-2 border-[#162B49]/30 bg-[#F8F1E0]/30 p-4">
      <h3 className="mb-3 text-sm font-semibold text-[#162B49]">{title}</h3>
      <ul className="flex flex-col gap-3">
        {list.length === 0 ? (
          <li className="text-sm text-[#162B49]/60">No matches yet.</li>
        ) : (
          list.map((match) => (
            <li
              key={match.id}
              className="rounded-lg border border-[#162B49]/20 bg-[#F8F1E0]/50 px-3 py-2 text-sm text-[#162B49]"
            >
              {match.name} — {formatMatchLabel(match)}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default function HighlightMatchesSection({
  matches,
  adminHighlightMatchIds,
  currentRound,
}: HighlightMatchesSectionProps) {
  const { wb: wbAdmin, lb: lbAdmin } = adminHighlightMatchIds;
  const wbTop3 = getTopMatchesByCombinedRatingForRoundAndBracket(
    matches,
    currentRound,
    "upper",
    wbAdmin,
    3
  );
  const lbTop3 = getTopMatchesByCombinedRatingForRoundAndBracket(
    matches,
    currentRound,
    "lower",
    lbAdmin,
    3
  );
  const wbTopIds = wbTop3.map((m) => m.id);
  const lbTopIds = lbTop3.map((m) => m.id);
  const weekLabel = getWeekDateRange(currentRound);
  const hasAny = wbTopIds.length + lbTopIds.length + wbAdmin.length + lbAdmin.length > 0;

  if (!hasAny) {
    return (
      <section
        id="highlight-matches"
        className="mx-auto w-[90vw] max-w-[90vw] px-2 py-6 md:w-full md:max-w-[50vw] md:px-4"
        aria-labelledby="highlight-matches-heading"
      >
        <h2
          id="highlight-matches-heading"
          className="mb-4 text-xl font-bold text-[#162B49]"
        >
          Highlight Matches
        </h2>
        <p className="text-[#162B49]/80">
          Heavy hitting matches for Round {currentRound} ({weekLabel}). Matches
          will appear here once the bracket is underway. Admins can feature
          matches per bracket from the admin page.
        </p>
      </section>
    );
  }

  return (
    <section
      id="highlight-matches"
      className="mx-auto w-[90vw] max-w-[90vw] px-2 py-6 md:w-full md:max-w-[50vw] md:px-4"
      aria-labelledby="highlight-matches-heading"
    >
      <h2
        id="highlight-matches-heading"
        className="mb-4 text-xl font-bold text-[#162B49]"
      >
        Highlight Matches
      </h2>
      <p className="mb-4 text-sm text-[#162B49]/80">
        Heavy hitting matches for Round {currentRound} ({weekLabel}).
      </p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <BracketPool
          title="Winner's Bracket"
          matches={matches}
          topMatchIds={wbTopIds}
          adminMatchIds={wbAdmin}
        />
        <BracketPool
          title="Loser's Bracket"
          matches={matches}
          topMatchIds={lbTopIds}
          adminMatchIds={lbAdmin}
        />
      </div>
    </section>
  );
}

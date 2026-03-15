import type { Upset, WeekUpsets } from "@/lib/highlights-and-results";

const isWinnersBracket = (matchId: number) => matchId >= 1 && matchId <= 63;

interface ResultsSectionProps {
  weeks: WeekUpsets[];
}

function BracketUpsets({
  title,
  weeks,
  filter,
}: {
  title: string;
  weeks: WeekUpsets[];
  filter: (u: Upset) => boolean;
}) {
  const weeksWithUpsets = weeks
    .map((week) => ({ ...week, upsets: week.upsets.filter(filter) }))
    .filter((week) => week.upsets.length > 0);

  return (
    <div className="min-w-0 rounded-lg border-2 border-[#162B49]/30 bg-[#F8F1E0]/30 p-4">
      {weeksWithUpsets.length === 0 ? (
        <div>
          <p className="text-sm text-[#162B49]/60">Nothing to report yet.</p>
          <p className="text-sm text-[#162B49]/60">Check back next week!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {weeksWithUpsets.map((week) => (
            <div key={week.weekNumber}>
              <h3 className="mb-2 text-sm font-semibold text-[#162B49]">
                {title} — {week.weekLabel}
              </h3>
              <ul className="flex flex-col gap-2">
                {week.upsets.map((u) => (
                  <li
                    key={`${week.weekNumber}-${u.matchId}`}
                    className="text-sm text-[#162B49]"
                  >
                    <strong>{u.winnerName}</strong> ({u.winnerRating}) beat{" "}
                    <strong>{u.loserName}</strong> ({u.loserRating}) —{" "}
                    <span className="text-[#C6202E] font-medium">
                      +{u.ratingGap} pt upset
                    </span>{" "}
                    ({u.matchName})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResultsSection({ weeks }: ResultsSectionProps) {
  const hasAny = weeks.some((w) => w.upsets.length > 0);

  return (
    <section
      id="results"
      className="mx-auto w-[90vw] max-w-[90vw] px-2 py-6 md:w-full md:max-w-[50vw] md:px-4"
      aria-labelledby="results-heading"
    >
      <h2
        id="results-heading"
        className="mb-4 text-xl font-bold text-[#162B49]"
      >
        Results
      </h2>
      <p className="mb-4 text-sm text-[#162B49]/80">
        Weekly breakdown of the biggest upsets (winner rated at least 15 points
        below the loser).
      </p>

      {!hasAny ? (
        <p className="text-[#162B49]/70">No upsets recorded yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <BracketUpsets
            title="Winner's Bracket"
            weeks={weeks}
            filter={(u) => isWinnersBracket(u.matchId)}
          />
          <BracketUpsets
            title="Loser's Bracket"
            weeks={weeks}
            filter={(u) => !isWinnersBracket(u.matchId)}
          />
        </div>
      )}
    </section>
  );
}

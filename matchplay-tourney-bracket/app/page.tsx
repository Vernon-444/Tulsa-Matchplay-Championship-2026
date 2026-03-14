import BracketLoader from "@/components/BracketLoader";
import { TULSA_2026_PLAYERS } from "@/data/tulsa-2026-players";
import { applyAllResults } from "@/lib/bracket-apply-results";
import { generate64PlayerDoubleElimBracket } from "@/lib/bracket-data-64";
import { getMatchResults } from "@/lib/supabase/admin";
import Image from "next/image";
import Link from "next/link";

import bannerImage from "./images/matchplay-banner.jpg";

export default async function Home() {
  const baseBracket = generate64PlayerDoubleElimBracket(TULSA_2026_PLAYERS);
  let results: { matchId: number; winnerSlot: 0 | 1 }[] = [];
  try {
    results = await getMatchResults();
  } catch {
    // Table may not exist yet or Supabase not configured; show bracket without results
  }
  const matches = applyAllResults(baseBracket, results);

  return (
    <>
      <section
        id="hero"
        className="overflow-x-hidden bg-[#162B49] px-4 py-10 text-center"
        aria-label="Hero"
      >
        <div className="mx-auto max-w-4xl">
          

          <div className="mx-auto mt-4 w-full max-w-[1000px] md:w-[60vw]">
            <Image
              src={bannerImage}
              alt="Tulsa Matchplay Championships"
              width={bannerImage.width}
              height={bannerImage.height}
              className="w-full h-auto"
              sizes="(min-width: 768px) 60vw, 100vw"
              priority
            />
          </div>

          <p className="mt-6 text-[#F8F1E0]/90">
            64-player double elimination. Check out the{" "}
            <a
              href="#brackets"
              className="inline-flex rounded border border-[#EBAD21]/60 bg-[#EBAD21]/20 px-2 py-1 font-medium text-[#F8F1E0] transition hover:bg-[#EBAD21]/30"
            >
              brackets
            </a>{" "}
            below and use the{" "}
            <Link
              href="/scorekeeper"
              className="inline-flex rounded border border-[#EBAD21]/60 bg-[#EBAD21]/20 px-2 py-1 font-medium text-[#F8F1E0] transition hover:bg-[#EBAD21]/30"
            >
              Matchplay Score Keeper
            </Link>{" "}
            to track your match.
          </p>

          <div className="mt-10 text-left">
            <h3 className="mb-4 text-center text-lg font-bold uppercase tracking-wide text-[#F8F1E0]">
              Tulsa Matchplay Championships Rules
            </h3>
            <ol className="mx-auto max-w-2xl list-decimal space-y-3 pl-5 pr-2 text-[#F8F1E0]/95">
              <li>The lower rated player picks the course.</li>
              <li>
                <span className="font-semibold">Bonus Strokes:</span>
                <table className="my-2 w-full max-w-xs border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="border-b border-[#EBAD21]/50 px-2 py-1 text-left text-[#F8F1E0]/80">Rating</th>
                      <th className="border-b border-[#EBAD21]/50 px-2 py-1 text-left text-[#F8F1E0]/80">Bonus Strokes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-b border-[#EBAD21]/20 px-2 py-1">{">= 950"}</td>
                      <td className="border-b border-[#EBAD21]/20 px-2 py-1">+0.0</td>
                    </tr>
                    <tr>
                      <td className="border-b border-[#EBAD21]/20 px-2 py-1">925-949</td>
                      <td className="border-b border-[#EBAD21]/20 px-2 py-1">+0.5</td>
                    </tr>
                    <tr>
                      <td className="border-b border-[#EBAD21]/20 px-2 py-1">900-924</td>
                      <td className="border-b border-[#EBAD21]/20 px-2 py-1">+1.5</td>
                    </tr>
                    <tr>
                      <td className="border-b border-[#EBAD21]/20 px-2 py-1">850-899</td>
                      <td className="border-b border-[#EBAD21]/20 px-2 py-1">+2.5</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1">{"=< 849"}</td>
                      <td className="px-2 py-1">+3.5</td>
                    </tr>
                  </tbody>
                </table>
                If you tie, go to a playoff to decide the
                winner. If you&apos;re both in a rating to get strokes, the
                difference between preset strokes will be what the lower rated
                player receives. (Ex: Player A is 940, they start at 0.5, Player
                B is 890, they start at 2.5. Player A gives Player B a 2 point
                head start.)
              </li>
              <li>DECIDE OB RULES BEFORE THE ROUND, DON&apos;T ASSUME.</li>
              <li>
                You must finish the match within the 7 day period. If you
                don&apos;t, both players will be disqualified unless it is
                clearly one player failing to comply. Contact the tournament 
                director if you have any questions.
              </li>
              <li>
                Once the match is over, the winning player needs to message the 
                tournament director a screenshot of the scorecard and I will 
                update the bracket from there.
              </li>
              <li>
                You can play ahead if you know who your next round matchup is, 
                just give the tournament director a heads up.
              </li>
              <li>
                If you ain&apos;t talking trash, don&apos;t come back next year.
                Tulsa, We Ride
              </li>
            </ol>
          </div>
        </div>
      </section>

      <main id="brackets" className="mx-auto w-[90vw] max-w-[90vw] px-2 py-6 md:w-full md:max-w-[75vw] md:px-4">
        <BracketLoader matches={matches} />
      </main>

      <footer className="grid grid-cols-1 items-center gap-4 border-t border-[#162B49]/20 bg-[var(--page-bg)] px-4 py-6 text-[#162B49] md:grid-cols-3">
        <div className="hidden md:block" aria-hidden />
        <p className="text-center text-sm">
          © 2026 · Created by{" "}
          <a
            href="https://www.linkedin.com/in/brayden-vernon"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#162B49] underline decoration-[#EBAD21]/60 underline-offset-2 transition hover:decoration-[#EBAD21]"
          >
            Brayden Vernon
          </a>
        </p>
        <div className="flex items-center justify-center gap-3 md:justify-end">
          <a
            href="https://www.linkedin.com/in/brayden-vernon"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0A66C2] transition hover:opacity-80"
            aria-label="Brayden Vernon on LinkedIn"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a
            href="https://github.com/Vernon-444"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#162B49] transition hover:opacity-80"
            aria-label="Vernon-444 on GitHub"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
        </div>
      </footer>
    </>
  );
}

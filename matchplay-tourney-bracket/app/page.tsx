import BracketLoader from "@/components/BracketLoader";
import { TULSA_2026_PLAYERS } from "@/data/tulsa-2026-players";
import { generate64PlayerDoubleElimBracket } from "@/lib/bracket-data-64";

export default function Home() {
  const matches = generate64PlayerDoubleElimBracket(TULSA_2026_PLAYERS);

  return (
    <>
      <section
        id="hero"
        className="bg-[#162B49] px-4 py-10 text-center"
        aria-label="Hero"
      >
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-[#F8F1E0] sm:text-3xl">
            Tulsa Matchplay Disc Golf Championship 2026
          </h2>
          <p className="mt-2 text-[#F8F1E0]/90">
            64-player double elimination · Scroll below to explore the bracket
          </p>
        </div>
      </section>

      <main id="brackets" className="mx-auto w-[90vw] max-w-[90vw] px-2 py-6 md:w-full md:max-w-[75vw] md:px-4">
        <BracketLoader matches={matches} />
      </main>
    </>
  );
}

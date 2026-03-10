import BracketView from "@/components/BracketView";
import { generate64PlayerDoubleElimBracket } from "@/lib/bracket-data-64";

export default function Home() {
  const matches = generate64PlayerDoubleElimBracket();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <h1 className="text-center text-xl font-semibold text-slate-900">
          Tulsa Matchplay Disc Golf Championship 2026
        </h1>
        <p className="text-center text-sm text-slate-500">
          64-player double elimination bracket
        </p>
      </header>
      <main className="p-4">
        <div className="overflow-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
          <BracketView matches={matches} />
        </div>
      </main>
    </div>
  );
}

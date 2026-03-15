"use client";

import type { BracketMatch, DoubleElimMatches } from "@/lib/bracket-data-64";
import type { HighlightMatchIds } from "@/lib/supabase/admin";
import {
  formatMatchLabel,
  getTopMatchesByCombinedRatingForRoundAndBracket,
} from "@/lib/highlights-and-results";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

/** Matches that have both participants with names (for dropdown). */
function selectableMatches(pool: BracketMatch[]): BracketMatch[] {
  return pool.filter((m) => {
    const a = m.participants[0]?.name;
    const b = m.participants[1]?.name;
    return a && b && a !== "TBD" && b !== "TBD";
  });
}

interface AdminHighlightPickerProps {
  matches: DoubleElimMatches;
  initialMatchIds: HighlightMatchIds;
  currentRound: number;
}

export default function AdminHighlightPicker({
  matches,
  initialMatchIds,
  currentRound,
}: AdminHighlightPickerProps) {
  const router = useRouter();
  const [wb1, setWb1] = useState<number | "">(initialMatchIds.wb[0] ?? "");
  const [wb2, setWb2] = useState<number | "">(initialMatchIds.wb[1] ?? "");
  const [lb1, setLb1] = useState<number | "">(initialMatchIds.lb[0] ?? "");
  const [lb2, setLb2] = useState<number | "">(initialMatchIds.lb[1] ?? "");
  const [saving, setSaving] = useState(false);

  const wbOptions = selectableMatches(matches.upper);
  const lbOptions = selectableMatches(matches.lower);
  const wbIds = [wb1, wb2].filter((x): x is number => typeof x === "number" && !Number.isNaN(x));
  const lbIds = [lb1, lb2].filter((x): x is number => typeof x === "number" && !Number.isNaN(x));

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/bracket/highlights", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wb: wbIds, lb: lbIds }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error ?? "Failed to save highlight matches");
        return;
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  }, [wbIds, lbIds, router]);

  const wbTop3 = getTopMatchesByCombinedRatingForRoundAndBracket(
    matches,
    currentRound,
    "upper",
    wbIds,
    3
  );
  const lbTop3 = getTopMatchesByCombinedRatingForRoundAndBracket(
    matches,
    currentRound,
    "lower",
    lbIds,
    3
  );

  return (
    <div className="mb-8 min-w-0 overflow-hidden rounded-lg border-2 border-[#162B49]/30 bg-[#F8F1E0]/30 p-4">
      <h2 className="mb-2 text-lg font-bold text-[#162B49]">
        Highlight Matches (featured on home)
      </h2>
      <p className="mb-4 text-sm text-[#162B49]/80">
        Pick up to 2 featured matches per bracket. They appear with the
        auto-selected top 3 by rating in each bracket on the main page.
      </p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4">
          <h3 className="text-sm font-semibold text-[#162B49]">
            Winner&apos;s Bracket
          </h3>
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-sm font-medium text-[#162B49]/90">
              Featured 1
            </span>
            <select
              value={wb1 === "" ? "" : wb1}
              onChange={(e) =>
                setWb1(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="min-w-0 rounded border border-[#162B49]/40 bg-white px-3 py-2 text-[#162B49]"
            >
              <option value="">— Select —</option>
              {wbOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}: {formatMatchLabel(m)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-sm font-medium text-[#162B49]/90">
              Featured 2
            </span>
            <select
              value={wb2 === "" ? "" : wb2}
              onChange={(e) =>
                setWb2(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="min-w-0 rounded border border-[#162B49]/40 bg-white px-3 py-2 text-[#162B49]"
            >
              <option value="">— Select —</option>
              {wbOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}: {formatMatchLabel(m)}
                </option>
              ))}
            </select>
          </label>
          {wbTop3.length > 0 && (
            <p className="text-xs text-[#162B49]/70">
              Auto top 3 WB: {wbTop3.map((m) => m.name).join(", ")}
            </p>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <h3 className="text-sm font-semibold text-[#162B49]">
            Loser&apos;s Bracket
          </h3>
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-sm font-medium text-[#162B49]/90">
              Featured 1
            </span>
            <select
              value={lb1 === "" ? "" : lb1}
              onChange={(e) =>
                setLb1(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="min-w-0 rounded border border-[#162B49]/40 bg-white px-3 py-2 text-[#162B49]"
            >
              <option value="">— Select —</option>
              {lbOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}: {formatMatchLabel(m)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-sm font-medium text-[#162B49]/90">
              Featured 2
            </span>
            <select
              value={lb2 === "" ? "" : lb2}
              onChange={(e) =>
                setLb2(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="min-w-0 rounded border border-[#162B49]/40 bg-white px-3 py-2 text-[#162B49]"
            >
              <option value="">— Select —</option>
              {lbOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}: {formatMatchLabel(m)}
                </option>
              ))}
            </select>
          </label>
          {lbTop3.length > 0 && (
            <p className="text-xs text-[#162B49]/70">
              Auto top 3 LB: {lbTop3.map((m) => m.name).join(", ")}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-4 w-full rounded-lg border-2 border-[#162B49] bg-[#162B49] px-4 py-2 text-sm font-medium text-[#F8F1E0] transition hover:bg-[#162B49]/90 disabled:opacity-50 sm:w-auto"
      >
        {saving ? "Saving…" : "Save highlight matches"}
      </button>
    </div>
  );
}

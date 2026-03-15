"use client";

import {
  getHoleWinnerByStrokes,
  getLowestStrokesIndices,
} from "@/lib/scorecard-logic";
import { TULSA_2026_PLAYERS } from "@/data/tulsa-2026-players";
import { useState } from "react";

const HOLES = 18;
const MIN_PLAYERS = 2;

/** Bonus strokes by rating (Tulsa Matchplay rules). */
function getBonusStrokes(rating: number): number {
  if (rating >= 950) return 0;
  if (rating >= 925) return 0.5;
  if (rating >= 900) return 1.5;
  if (rating >= 850) return 2.5;
  return 3.5;
}

const playerList = TULSA_2026_PLAYERS;

const playersSortedForDropdown = [...playerList]
  .map((p, originalIndex) => ({ ...p, originalIndex }))
  .sort((a, b) => {
    const fn = a.firstName.localeCompare(b.firstName);
    return fn !== 0 ? fn : a.lastName.localeCompare(b.lastName);
  });

/** Scorecard: scorecard[holeIndex][playerIndex] = strokes (number) or null. Single source of truth. */
function createEmptyScorecard(numPlayers: number): (number | null)[][] {
  return Array.from({ length: HOLES }, () => Array(numPlayers).fill(null) as (number | null)[]);
}

export default function ScorekeeperPage() {
  const [selectedPlayerIndices, setSelectedPlayerIndices] = useState<number[]>([
    -1,
    -1,
  ]);
  const [scorecard, setScorecard] = useState<(number | null)[][]>(() =>
    createEmptyScorecard(2)
  );

  const numPlayers = selectedPlayerIndices.length;

  const setScore = (holeIndex: number, playerIndex: number, value: number | null) => {
    setScorecard((prev) => {
      const next = prev.map((row) => [...row]);
      const row = next[holeIndex]!;
      if (playerIndex >= row.length) return prev;
      row[playerIndex] = value;
      return next;
    });
  };

  const handleScoreInput = (
    holeIndex: number,
    playerIndex: number,
    raw: string
  ) => {
    const trimmed = raw.trim();
    if (trimmed === "") {
      setScore(holeIndex, playerIndex, null);
      return;
    }
    const n = parseInt(trimmed, 10);
    if (!Number.isNaN(n) && n >= 0) {
      setScore(holeIndex, playerIndex, n);
    }
  };

  const setSelectedPlayer = (columnIndex: number, playerIndex: number) => {
    setSelectedPlayerIndices((prev) => {
      const next = [...prev];
      next[columnIndex] = playerIndex;
      return next;
    });
  };

  const addPlayer = () => {
    setSelectedPlayerIndices((prev) => [...prev, -1]);
    setScorecard((prev) => prev.map((row) => [...row, null]));
  };

  const removePlayer = () => {
    if (numPlayers <= MIN_PLAYERS) return;
    setSelectedPlayerIndices((prev) => prev.slice(0, -1));
    setScorecard((prev) => prev.map((row) => row.slice(0, -1)));
  };

  const bonuses: number[] = selectedPlayerIndices.map((idx) => {
    if (idx == null || idx < 0) return 0;
    const p = playerList[idx];
    return p ? getBonusStrokes(p.rating) : 0;
  });

  const totalStrokes = (playerIndex: number) =>
    scorecard.reduce(
      (sum, row) => sum + (row[playerIndex] ?? 0),
      0
    );

  const holesWon = (playerIndex: number) =>
    scorecard.filter(
      (row) => getHoleWinnerByStrokes(row) === playerIndex
    ).length;

  const points = (playerIndex: number) =>
    holesWon(playerIndex) + (bonuses[playerIndex] ?? 0);

  const displayName = (columnIndex: number) => {
    const idx = selectedPlayerIndices[columnIndex];
    if (idx == null || idx < 0) return `Player ${columnIndex + 1}`;
    const p = playerList[idx];
    return p ? `${p.firstName} ${p.lastName}` : `Player ${columnIndex + 1}`;
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[#162B49]">
        Matchplay Score Keeper
      </h1>
      <p className="mt-1 text-sm text-[#162B49]/70">
        18-hole scorecard. Choose players from the roster; bonus strokes from rating. Nothing is saved.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        {selectedPlayerIndices.map((selectedIdx, i) => (
          <label key={i} className="flex min-w-[180px] flex-col gap-1">
            <span className="text-sm font-medium text-[#162B49]">
              Player {i + 1}
            </span>
            <select
              value={selectedIdx < 0 ? "" : selectedIdx}
              onChange={(e) =>
                setSelectedPlayer(
                  i,
                  e.target.value === "" ? -1 : parseInt(e.target.value, 10)
                )
              }
              className="rounded-lg border-2 border-[#162B49]/30 bg-[var(--page-bg)] px-3 py-2 text-[#162B49] focus:border-[#EBAD21] focus:outline-none focus:ring-2 focus:ring-[#EBAD21]/30"
            >
              <option value="">Select player</option>
              {playersSortedForDropdown.map((p) => (
                <option key={p.originalIndex} value={p.originalIndex}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </label>
        ))}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addPlayer}
            className="rounded-lg border-2 border-[#162B49] bg-[var(--page-bg)] px-3 py-2 text-sm font-medium text-[#162B49] transition-colors hover:bg-[#162B49]/10"
          >
            + Add player
          </button>
          <button
            type="button"
            onClick={removePlayer}
            disabled={numPlayers <= MIN_PLAYERS}
            className="rounded-lg border-2 border-[#C6202E] bg-[var(--page-bg)] px-3 py-2 text-sm font-medium text-[#C6202E] transition-colors hover:bg-[#C6202E]/10 disabled:opacity-50 disabled:pointer-events-none"
          >
            − Remove player
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto overflow-y-hidden rounded-xl border-2 border-[#162B49] bg-[var(--page-bg)] shadow-lg">
        <table className="w-full min-w-[320px] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-[#162B49] bg-[#162B49] text-[#F8F1E0]">
              <th className="w-14 shrink-0 px-3 py-2 text-center text-sm font-semibold">
                Hole
              </th>
              {selectedPlayerIndices.map((_, i) => (
                <th key={i} className="min-w-[80px] px-3 py-2 text-sm font-semibold">
                  {displayName(i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#162B49]/20 bg-[#162B49]/5 font-medium text-[#162B49]">
              <td className="px-3 py-2 text-center text-sm">Bonus strokes</td>
              {bonuses.map((bonus, i) => (
                <td key={i} className="px-3 py-2">
                  {selectedPlayerIndices[i] >= 0 ? bonus : "—"}
                </td>
              ))}
            </tr>
            {scorecard.map((row, holeIndex) => {
              const lowestIndices = getLowestStrokesIndices(row);
              return (
                <tr
                  key={holeIndex}
                  className="border-b border-[#162B49]/20 transition-colors hover:bg-[#162B49]/5"
                >
                  <td className="px-3 py-1.5 text-center text-sm font-medium text-[#162B49]/80">
                    {holeIndex + 1}
                  </td>
                  {row.map((cell, playerIndex) => (
                    <td
                      key={playerIndex}
                      className={`p-0 ${lowestIndices.has(playerIndex) ? "bg-[#7BA3C9]/25" : ""}`}
                    >
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cell === null ? "" : String(cell)}
                        onChange={(e) =>
                          handleScoreInput(holeIndex, playerIndex, e.target.value)
                        }
                        placeholder="—"
                        className={`w-full border-0 bg-transparent px-3 py-2 text-[#162B49] placeholder-[#162B49]/40 focus:outline-none focus:bg-[#162B49]/5 ${
                          lowestIndices.has(playerIndex)
                            ? "focus:bg-[#7BA3C9]/35"
                            : ""
                        }`}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr className="border-t-2 border-[#162B49] bg-[#162B49]/10 font-semibold text-[#162B49]">
              <td className="px-3 py-2 text-center text-sm">Total</td>
              {selectedPlayerIndices.map((_, i) => (
                <td key={i} className="px-3 py-2">
                  {totalStrokes(i) || "—"}
                </td>
              ))}
            </tr>
            <tr className="bg-[#162B49]/10 font-semibold text-[#162B49]">
              <td className="px-3 py-2 text-center text-sm">Points</td>
              {selectedPlayerIndices.map((_, i) => (
                <td key={i} className="px-3 py-2">
                  {points(i)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-[#162B49]/60">
        Hole winner = fewer strokes (tie = no point). Points = num holes won + bonus strokes. Bonus from rating (≥950: 0, 925–949: 0.5, 900–924: 1.5, 850–899: 2.5, ≤849: 3.5).
      </p>
    </main>
  );
}

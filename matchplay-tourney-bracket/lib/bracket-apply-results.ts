import type {
  BracketMatch,
  DoubleElimMatches,
  Participant,
} from "@/lib/bracket-data-64";

export interface MatchResult {
  matchId: number;
  winnerSlot: 0 | 1;
}

/** Build maps: for each match id, which slot in the next match the winner/loser goes to. */
function buildAdvancementMaps(matches: DoubleElimMatches) {
  const winnerMap = new Map<number, { nextMatchId: number; slot: number }>();
  const loserMap = new Map<number, { nextMatchId: number; slot: number }>();

  const allMatches = [...matches.upper, ...matches.lower];
  const byNextWinner = new Map<number, number[]>();
  const byNextLoser = new Map<number, number[]>();

  for (const m of allMatches) {
    if (m.nextMatchId != null) {
      const list = byNextWinner.get(m.nextMatchId) ?? [];
      list.push(m.id);
      byNextWinner.set(m.nextMatchId, list);
    }
    if ("nextLooserMatchId" in m && m.nextLooserMatchId != null) {
      const list = byNextLoser.get(m.nextLooserMatchId) ?? [];
      list.push(m.id);
      byNextLoser.set(m.nextLooserMatchId, list);
    }
  }

  byNextWinner.forEach((feederIds, nextMatchId) => {
    feederIds.sort((a, b) => a - b);
    feederIds.forEach((matchId, index) => {
      winnerMap.set(matchId, { nextMatchId, slot: index });
    });
  });
  byNextLoser.forEach((feederIds, nextMatchId) => {
    feederIds.sort((a, b) => a - b);
    feederIds.forEach((matchId, index) => {
      loserMap.set(matchId, { nextMatchId, slot: index });
    });
  });

  return { winnerMap, loserMap };
}

function findMatch(matches: DoubleElimMatches, matchId: number): BracketMatch | null {
  const inUpper = matches.upper.find((m) => m.id === matchId);
  if (inUpper) return inUpper;
  return matches.lower.find((m) => m.id === matchId) ?? null;
}

function copyParticipant(p: Participant): Participant {
  return {
    id: p.id,
    resultText: p.resultText ?? null,
    isWinner: p.isWinner ?? false,
    status: p.status ?? null,
    name: p.name ?? "TBD",
    rating: p.rating,
  };
}

function deepCloneMatches(matches: DoubleElimMatches): DoubleElimMatches {
  return {
    upper: matches.upper.map((m) => ({
      ...m,
      participants: m.participants.map(copyParticipant),
    })),
    lower: matches.lower.map((m) => ({
      ...m,
      participants: m.participants.map(copyParticipant),
    })),
  };
}

/**
 * Applies a single result: sets winner/loser on the match and advances both to their next matches.
 * Mutates the provided matches object.
 */
export function applyResult(
  matches: DoubleElimMatches,
  result: MatchResult,
  advancement: ReturnType<typeof buildAdvancementMaps>
): void {
  const { winnerMap, loserMap } = advancement;
  const match = findMatch(matches, result.matchId);
  if (!match) return;

  const winnerSlot = result.winnerSlot as 0 | 1;
  const loserSlot = (1 - winnerSlot) as 0 | 1;
  const winner = match.participants[winnerSlot];
  const loser = match.participants[loserSlot];

  if (!winner?.name || winner.name === "TBD") return;

  match.participants[winnerSlot] = {
    ...copyParticipant(winner),
    isWinner: true,
    resultText: "W",
  };
  match.participants[loserSlot] = {
    ...copyParticipant(loser),
    isWinner: false,
    resultText: "L",
  };

  const winnerAdv = winnerMap.get(match.id);
  if (winnerAdv) {
    const nextMatch = findMatch(matches, winnerAdv.nextMatchId);
    if (nextMatch) {
      nextMatch.participants[winnerAdv.slot] = copyParticipant(winner);
    }
  }

  const loserAdv = loserMap.get(match.id);
  if (loserAdv) {
    const nextMatch = findMatch(matches, loserAdv.nextMatchId);
    if (nextMatch) {
      nextMatch.participants[loserAdv.slot] = copyParticipant(loser);
    }
  }
}

/**
 * Returns a new bracket with all results applied in order.
 * Does not mutate the input.
 */
export function applyAllResults(
  matches: DoubleElimMatches,
  results: MatchResult[]
): DoubleElimMatches {
  const clone = deepCloneMatches(matches);
  const advancement = buildAdvancementMaps(clone);
  for (const r of results) {
    applyResult(clone, r, advancement);
  }
  return clone;
}

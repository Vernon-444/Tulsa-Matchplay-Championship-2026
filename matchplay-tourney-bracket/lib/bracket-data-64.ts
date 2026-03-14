/**
 * Generates double elimination bracket match data for 64 players.
 * Upper bracket: 32 → 16 → 8 → 4 → 2 → 1 (63 matches).
 * Lower bracket: 16 → 16 → 8 → 4 → 2 → 1 (47 matches).
 * Grand final is the last upper bracket match (id: 63); LB final (147) feeds into it.
 */

export interface Participant {
  id: string | number;
  resultText?: string | null;
  isWinner?: boolean;
  status?: string | null;
  name?: string;
  /** Displayed on the right side of the match cell when no result yet */
  rating?: number | string;
}

export interface Player {
  firstName: string;
  lastName: string;
  rating: number;
}

export interface BracketMatch {
  id: number;
  name: string;
  nextMatchId: number | null;
  nextLooserMatchId?: number;
  tournamentRoundText: string;
  startTime: string;
  state: string;
  participants: Participant[];
}

export interface DoubleElimMatches {
  upper: BracketMatch[];
  lower: BracketMatch[];
}

const emptyParticipant = (): Participant => ({
  id: "",
  resultText: null,
  isWinner: false,
  status: null,
  name: "TBD",
});

function createMatch(
  id: number,
  name: string,
  roundText: string,
  nextMatchId: number | null,
  nextLooserMatchId?: number
): BracketMatch {
  const participants: Participant[] = [
    { ...emptyParticipant(), id: `m${id}-p0` },
    { ...emptyParticipant(), id: `m${id}-p1` },
  ];
  return {
    id,
    name,
    nextMatchId,
    ...(nextLooserMatchId !== undefined && { nextLooserMatchId }),
    tournamentRoundText: roundText,
    startTime: "",
    state: "SCHEDULED",
    participants,
  };
}

export function generate64PlayerDoubleElimBracket(
  players?: Player[]
): DoubleElimMatches {
  const upper: BracketMatch[] = [];
  const lower: BracketMatch[] = [];

  // Upper bracket: R1 32, R2 16, R3 8, R4 4, R5 2, R6 1
  const UB_R1_COUNT = 32;
  const UB_R2_COUNT = 16;
  const UB_R3_COUNT = 8;
  const UB_R4_COUNT = 4;
  const UB_R5_COUNT = 2;
  const GF_ID = 63;

  let id = 1;

  // Upper R1: 32 matches, winners to R2 (33..48), losers to LB R1 (101..116)
  for (let m = 0; m < UB_R1_COUNT; m++) {
    const r2Match = 33 + Math.floor(m / 2);
    const lb1Match = 101 + Math.floor(m / 2);
    upper.push(
      createMatch(id, `WB R1 M${m + 1}`, "1", r2Match, lb1Match)
    );
    id++;
  }

  // Upper R2: 16 matches -> R3 (49..56), losers -> LB R2 (117..132)
  for (let m = 0; m < UB_R2_COUNT; m++) {
    const r3Match = 49 + Math.floor(m / 2);
    const lb2Match = 117 + Math.floor(m / 2);
    upper.push(
      createMatch(id, `WB R2 M${m + 1}`, "2", r3Match, lb2Match)
    );
    id++;
  }

  // Upper R3: 8 matches -> R4 (57..60), losers -> LB R3 (133..140)
  for (let m = 0; m < UB_R3_COUNT; m++) {
    const r4Match = 57 + Math.floor(m / 2);
    const lb3Match = 133 + Math.floor(m / 2);
    upper.push(
      createMatch(id, `WB R3 M${m + 1}`, "3", r4Match, lb3Match)
    );
    id++;
  }

  // Upper R4: 4 matches -> R5 (61..62), losers -> LB R4 (141..144)
  for (let m = 0; m < UB_R4_COUNT; m++) {
    const r5Match = 61 + Math.floor(m / 2);
    const lb4Match = 141 + Math.floor(m / 2);
    upper.push(
      createMatch(id, `WB R4 M${m + 1}`, "4", r5Match, lb4Match)
    );
    id++;
  }

  // Upper R5: 2 matches -> R6/GF (63), losers -> LB R5 (145..146)
  upper.push(
    createMatch(61, "WB R5 M1", "5", GF_ID, 145),
    createMatch(62, "WB R5 M2", "5", GF_ID, 146)
  );
  id = 63;

  // Grand final (upper R6): no next in upper, loser goes to LB final (147)
  upper.push(
    createMatch(GF_ID, "Grand Final", "6", null, 147)
  );

  // Lower bracket IDs: R1 101..116, R2 117..132, R3 133..140, R4 141..144, R5 145..146, R6 147
  // LB R1: 16 matches, winners to LB R2 (117..132)
  for (let m = 0; m < 16; m++) {
    const next = 117 + Math.floor(m / 2);
    lower.push(
      createMatch(101 + m, `LB R1 M${m + 1}`, "1", next)
    );
  }

  // LB R2: 16 matches -> LB R3 (133..140)
  for (let m = 0; m < 16; m++) {
    const next = 133 + Math.floor(m / 2);
    lower.push(
      createMatch(117 + m, `LB R2 M${m + 1}`, "2", next)
    );
  }

  // LB R3: 8 -> LB R4 (141..144)
  for (let m = 0; m < 8; m++) {
    const next = 141 + Math.floor(m / 2);
    lower.push(
      createMatch(133 + m, `LB R3 M${m + 1}`, "3", next)
    );
  }

  // LB R4: 4 -> LB R5 (145..146)
  for (let m = 0; m < 4; m++) {
    const next = 145 + Math.floor(m / 2);
    lower.push(
      createMatch(141 + m, `LB R4 M${m + 1}`, "4", next)
    );
  }

  // LB R5: 2 -> LB R6 (147)
  lower.push(
    createMatch(145, "LB R5 M1", "5", 147),
    createMatch(146, "LB R5 M2", "5", 147)
  );

  // LB R6 (LB final): winner goes to Grand Final (63)
  lower.push(
    createMatch(147, "LB Final", "6", GF_ID)
  );

  // Optionally seed first round with players (64 slots = UB R1)
  if (players && players.length > 0) {
    for (let i = 0; i < Math.min(64, players.length); i++) {
      const p = players[i];
      const ubMatchIndex = Math.floor(i / 2);
      const slot = i % 2;
      if (upper[ubMatchIndex]?.participants[slot]) {
        upper[ubMatchIndex].participants[slot] = {
          ...emptyParticipant(),
          id: `seed-${i + 1}`,
          name: `${p.firstName} ${p.lastName}`,
          rating: p.rating,
        };
      }
    }
  }

  return { upper, lower };
}

/** Tournament start (first week). Each round gets one week. */
const TOURNAMENT_START = new Date(2026, 2, 8); // March 8, 2026

/**
 * Returns the date range string for a given week (1-based), without year.
 * Week 1 = 03/08 - 03/14, Week 2 = 03/15 - 03/21, etc.
 */
export function getWeekDateRange(weekNumber: number): string {
  const start = new Date(TOURNAMENT_START);
  start.setDate(start.getDate() + (weekNumber - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) =>
    `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  return `${fmt(start)} - ${fmt(end)}`;
}

/**
 * Returns match arrays for separate Winner's and Loser's bracket views.
 * Championship (WB winner vs LB winner) is not included; that will be a separate component.
 * - Winners bracket: upper bracket, with the last match labeled "Winner's Bracket Final"
 * - Losers bracket: lower bracket, with LB Final's nextMatchId set to null so it doesn't point to the championship
 */
export function getWinnersAndLosersBracketMatches(
  matches: DoubleElimMatches
): { winnersBracketMatches: BracketMatch[]; losersBracketMatches: BracketMatch[] } {
  const winnersBracketMatches = matches.upper.map((m) =>
    m.id === 63
      ? { ...m, name: "Winner's Bracket Final" }
      : { ...m }
  );
  const losersBracketMatches = matches.lower.map((m) =>
    m.id === 147
      ? { ...m, nextMatchId: null, name: "Loser's Bracket Final" }
      : { ...m }
  );
  return { winnersBracketMatches, losersBracketMatches };
}

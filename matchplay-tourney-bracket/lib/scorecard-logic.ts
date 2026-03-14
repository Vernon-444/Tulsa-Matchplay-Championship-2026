/**
 * Pure logic for scorecard: hole winner and highlighting by raw strokes.
 * Hole winner = player with fewest strokes (when at least 2 have a score). Tie = no winner.
 * Points row = holes won + that player's bonus strokes.
 */

/**
 * Hole winner = single player with fewest (raw) strokes when at least 2 have a score; null if tie or <2.
 */
export function getHoleWinnerByStrokes(
  strokesOnHole: (number | null)[]
): number | null {
  const withScores: { playerIndex: number; strokes: number }[] = [];
  strokesOnHole.forEach((s, i) => {
    if (s === null || typeof s !== "number" || Number.isNaN(s)) return;
    withScores.push({ playerIndex: i, strokes: s });
  });
  if (withScores.length < 2) return null;
  const minStrokes = Math.min(...withScores.map((x) => x.strokes));
  const withMin = withScores.filter((x) => x.strokes === minStrokes);
  return withMin.length === 1 ? withMin[0]!.playerIndex : null;
}

/**
 * Player indices with the fewest strokes on the hole (for highlighting). Only when at least 2 have a score.
 * Tie = no highlight (empty set).
 */
export function getLowestStrokesIndices(
  strokesOnHole: (number | null)[]
): Set<number> {
  const withScores: { playerIndex: number; strokes: number }[] = [];
  strokesOnHole.forEach((s, i) => {
    if (s === null || typeof s !== "number" || Number.isNaN(s)) return;
    withScores.push({ playerIndex: i, strokes: s });
  });
  if (withScores.length < 2) return new Set();
  const minStrokes = Math.min(...withScores.map((x) => x.strokes));
  const withMin = withScores.filter((x) => x.strokes === minStrokes);
  if (withMin.length > 1) return new Set();
  const indices = new Set<number>();
  indices.add(withMin[0]!.playerIndex);
  return indices;
}

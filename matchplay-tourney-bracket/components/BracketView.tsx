"use client";

import { type ComponentProps, useRef, useState, useEffect } from "react";
import {
  Match,
  SingleEliminationBracket,
  SVGViewer,
  createTheme,
} from "react-tournament-brackets";
import type {
  BracketMatch,
  DoubleElimMatches,
} from "@/lib/bracket-data-64";
import {
  getWeekDateRange,
  getWinnersAndLosersBracketMatches,
} from "@/lib/bracket-data-64";
import BracketWindow from "./DraggableBracketWindow";

/* City of Tulsa: blue #162B49, cream #F8F1E0, yellow #EBAD21, red #C6202E */
const TULSA = {
  blue: "#162B49",
  blueDark: "#0d1f35",
  cream: "#F8F1E0",
  yellow: "#EBAD21",
  red: "#C6202E",
} as const;

const tournamentTheme = createTheme({
  textColor: { main: TULSA.blue, highlighted: TULSA.blue, dark: TULSA.blue },
  matchBackground: { wonColor: "#e8e4dc", lostColor: TULSA.cream },
  score: {
    background: { wonColor: "#e8e4dc", lostColor: TULSA.cream },
    text: { highlightedWonColor: TULSA.red, highlightedLostColor: TULSA.blue },
  },
  border: {
    color: TULSA.blue,
    highlightedColor: TULSA.red,
  },
  roundHeaders: { background: TULSA.blue },
  canvasBackground: TULSA.cream,
});

export interface AdminControls {
  onSetWinner: (matchId: number, winnerSlot: 0 | 1) => void;
  onUndo: () => void;
  canUndo: boolean;
}

/** Wraps Match and dims non-current rounds. In admin mode, clicking a player sets them as winner. */
function matchWithRoundFocus(
  currentRound: string,
  adminControls?: AdminControls
) {
  return function MatchWithRoundFocus(props: ComponentProps<typeof Match>) {
    const { match } = props;
    const isCurrentRound =
      match.tournamentRoundText === currentRound;
    const opacity = isCurrentRound ? 1 : 0.35;
    const p0 = match.participants[0];
    const p1 = match.participants[1];
    const bothFilled =
      p0?.name && p1?.name && p0.name !== "TBD" && p1.name !== "TBD";
    const noResult =
      bothFilled &&
      p0?.isWinner !== true &&
      p1?.isWinner !== true;
    const clickToSetWinner = adminControls && noResult;

    const handlePartyClick =
      clickToSetWinner && adminControls
        ? (party: { id?: string | number }, _partyWon: boolean) => {
            const slot = match.participants[0]?.id === party?.id ? 0 : 1;
            adminControls.onSetWinner(Number(match.id), slot as 0 | 1);
          }
        : props.onPartyClick;

    return (
      <div
        style={{
          opacity,
          cursor: clickToSetWinner ? "pointer" : undefined,
        }}
      >
        <Match {...props} onPartyClick={handlePartyClick} />
      </div>
    );
  };
}

/** Round header height when showing two lines (round + date range). */
const ROUND_HEADER_HEIGHT = 52;

const winnersBracketOptions = {
  style: {
    roundHeader: {
      backgroundColor: TULSA.blue,
      fontColor: TULSA.cream,
      height: ROUND_HEADER_HEIGHT,
      roundTextGenerator: (roundOneBased: number) =>
        `Round ${roundOneBased}\n${getWeekDateRange(roundOneBased)}`,
    },
    connectorColor: TULSA.blue,
    connectorColorHighlight: TULSA.red,
  },
};

const losersBracketOptions = {
  style: {
    roundHeader: {
      backgroundColor: TULSA.blue,
      fontColor: TULSA.cream,
      height: ROUND_HEADER_HEIGHT,
      roundTextGenerator: (roundOneBased: number) =>
        `Round ${roundOneBased}\n${getWeekDateRange(roundOneBased + 1)}`,
    },
    connectorColor: TULSA.blue,
    connectorColorHighlight: TULSA.red,
  },
};

/** Fallback viewport size before container is measured. */
const DEFAULT_VIEWPORT = { width: 900, height: 500 };

interface BracketViewProps {
  matches: DoubleElimMatches;
  /** Current round number as string (e.g. "1"). This round stays bright; others are dimmed. */
  currentRound?: string;
  /** When set, shows "Top wins" / "Bottom wins" on each match and enables undo. */
  adminControls?: AdminControls;
}

interface ResponsiveBracketProps {
  title: string;
  matches: BracketMatch[];
  options: typeof winnersBracketOptions;
  sharedBracketProps: {
    matchComponent: ReturnType<typeof matchWithRoundFocus>;
    theme: ReturnType<typeof createTheme>;
    currentRound: string;
  };
}

/** One bracket panel with a viewer that fills its container (bracket-window-scroll). */
function ResponsiveBracket({
  title,
  matches,
  options,
  sharedBracketProps,
}: ResponsiveBracketProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setViewport({
        width: Math.max(1, Math.round(width)),
        height: Math.max(1, Math.round(height)),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const svgWrapper = ({
    children,
    bracketWidth,
    bracketHeight,
    startAt,
    ...rest
  }: {
    children: React.ReactNode;
    bracketWidth: number;
    bracketHeight: number;
    startAt: number[];
    [key: string]: unknown;
  }) => (
    <SVGViewer
      background={TULSA.cream}
      SVGBackground={TULSA.cream}
      width={viewport.width}
      height={viewport.height}
      bracketWidth={bracketWidth}
      bracketHeight={bracketHeight}
      startAt={startAt}
      {...rest}
    >
      {children}
    </SVGViewer>
  );

  return (
    <BracketWindow title={title}>
      <div
        ref={containerRef}
        className="h-full w-full min-h-[500px]"
        style={{ minHeight: 500 }}
      >
        <SingleEliminationBracket
          matches={matches}
          {...sharedBracketProps}
          options={options}
          svgWrapper={svgWrapper}
        />
      </div>
    </BracketWindow>
  );
}

export default function BracketView({
  matches,
  currentRound = "1",
  adminControls,
}: BracketViewProps) {
  const { winnersBracketMatches, losersBracketMatches } =
    getWinnersAndLosersBracketMatches(matches);

  const sharedBracketProps = {
    matchComponent: matchWithRoundFocus(currentRound, adminControls),
    theme: tournamentTheme,
    currentRound,
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {adminControls && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={adminControls.onUndo}
            disabled={!adminControls.canUndo}
            className="rounded-lg border-2 border-[#C6202E] px-4 py-2 text-sm font-medium text-[#C6202E] transition-colors hover:bg-[#C6202E]/10 disabled:opacity-50 disabled:pointer-events-none"
          >
            Undo last result
          </button>
          <span className="text-sm text-[#162B49]/70">
            Click a player in a match to set them as the winner (saves immediately). Undo removes the most recent result.
          </span>
        </div>
      )}
      <ResponsiveBracket
        title="Winner's Bracket"
        matches={winnersBracketMatches}
        options={winnersBracketOptions}
        sharedBracketProps={sharedBracketProps}
      />
      <ResponsiveBracket
        title="Loser's Bracket"
        matches={losersBracketMatches}
        options={losersBracketOptions}
        sharedBracketProps={sharedBracketProps}
      />
    </div>
  );
}

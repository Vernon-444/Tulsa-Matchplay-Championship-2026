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
  textColor: { main: TULSA.cream, highlighted: TULSA.cream, dark: TULSA.cream },
  matchBackground: { wonColor: "#1e3658", lostColor: TULSA.blue },
  score: {
    background: { wonColor: "#1e3658", lostColor: TULSA.blue },
    text: { highlightedWonColor: TULSA.red, highlightedLostColor: TULSA.cream },
  },
  border: {
    color: TULSA.yellow,
    highlightedColor: TULSA.red,
  },
  roundHeaders: { background: TULSA.blue },
  canvasBackground: TULSA.blue,
});

/** Wraps Match and dims non-current rounds so the current round stays yellow/bright. */
function matchWithRoundFocus(currentRound: string) {
  return function MatchWithRoundFocus(props: ComponentProps<typeof Match>) {
    const isCurrentRound =
      props.match.tournamentRoundText === currentRound;
    const opacity = isCurrentRound ? 1 : 0.35;
    return (
      <div style={{ opacity }}>
        <Match {...props} />
      </div>
    );
  };
}

/** Round header height when showing two lines (round + date range). */
const ROUND_HEADER_HEIGHT = 52;

const winnersBracketOptions = {
  style: {
    roundHeader: {
      backgroundColor: TULSA.blueDark,
      fontColor: TULSA.cream,
      height: ROUND_HEADER_HEIGHT,
      roundTextGenerator: (roundOneBased: number) =>
        `Round ${roundOneBased}\n${getWeekDateRange(roundOneBased)}`,
    },
    connectorColor: TULSA.yellow,
    connectorColorHighlight: TULSA.red,
  },
};

const losersBracketOptions = {
  style: {
    roundHeader: {
      backgroundColor: TULSA.blueDark,
      fontColor: TULSA.cream,
      height: ROUND_HEADER_HEIGHT,
      roundTextGenerator: (roundOneBased: number) =>
        `Round ${roundOneBased}\n${getWeekDateRange(roundOneBased + 1)}`,
    },
    connectorColor: TULSA.yellow,
    connectorColorHighlight: TULSA.red,
  },
};

/** Fallback viewport size before container is measured. */
const DEFAULT_VIEWPORT = { width: 900, height: 500 };

interface BracketViewProps {
  matches: DoubleElimMatches;
  /** Current round number as string (e.g. "1"). This round stays bright; others are dimmed. */
  currentRound?: string;
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
      background={TULSA.blue}
      SVGBackground={TULSA.blue}
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
}: BracketViewProps) {
  const { winnersBracketMatches, losersBracketMatches } =
    getWinnersAndLosersBracketMatches(matches);

  const sharedBracketProps = {
    matchComponent: matchWithRoundFocus(currentRound),
    theme: tournamentTheme,
    currentRound,
  };

  return (
    <div className="flex w-full flex-col gap-6">
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

"use client";

import { useEffect, useState } from "react";
import {
  DoubleEliminationBracket,
  Match,
  SVGViewer,
  createTheme,
} from "react-tournament-brackets";
import type { DoubleElimMatches } from "@/lib/bracket-data-64";

function useWindowSize(): [number, number] {
  const [size, setSize] = useState<[number, number]>([1200, 800]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () =>
      setSize([window.innerWidth, window.innerHeight]);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

const tournamentTheme = createTheme({
  textColor: { main: "#1a1a1a", highlighted: "#0f172a", dark: "#64748b" },
  matchBackground: { wonColor: "#e0f2fe", lostColor: "#f1f5f9" },
  score: {
    background: { wonColor: "#7dd3fc", lostColor: "#cbd5e1" },
    text: { highlightedWonColor: "#0ea5e9", highlightedLostColor: "#94a3b8" },
  },
  border: {
    color: "#cbd5e1",
    highlightedColor: "#0ea5e9",
  },
  roundHeaders: { background: "#0f172a" },
  canvasBackground: "#f8fafc",
});

interface BracketViewProps {
  matches: DoubleElimMatches;
}

export default function BracketView({ matches }: BracketViewProps) {
  const [width, height] = useWindowSize();
  const bracketWidth = Math.max(width - 48, 800);
  const bracketHeight = Math.max(height - 120, 600);

  return (
    <DoubleEliminationBracket
      matches={matches}
      matchComponent={Match}
      theme={tournamentTheme}
      options={{
        style: {
          roundHeader: {
            backgroundColor: "#0f172a",
            fontColor: "#f8fafc",
          },
          connectorColor: "#94a3b8",
          connectorColorHighlight: "#0ea5e9",
        },
      }}
      svgWrapper={({ children, ...props }) => (
        <SVGViewer
          background="#f8fafc"
          SVGBackground="#f8fafc"
          width={bracketWidth}
          height={bracketHeight}
          {...props}
        >
          {children}
        </SVGViewer>
      )}
    />
  );
}

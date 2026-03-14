"use client";

import dynamic from "next/dynamic";
import type { DoubleElimMatches } from "@/lib/bracket-data-64";

const BracketView = dynamic(() => import("@/components/BracketView"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center text-[var(--foreground)]/70">
      Loading bracket…
    </div>
  ),
});

interface BracketLoaderProps {
  matches: DoubleElimMatches;
}

export default function BracketLoader({ matches }: BracketLoaderProps) {
  return <BracketView matches={matches} />;
}

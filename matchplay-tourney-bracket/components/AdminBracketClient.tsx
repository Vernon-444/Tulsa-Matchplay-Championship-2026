"use client";

import BracketView, { type AdminControls } from "@/components/BracketView";
import type { DoubleElimMatches } from "@/lib/bracket-data-64";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

interface AdminBracketClientProps {
  initialMatches: DoubleElimMatches;
  resultsCount: number;
}

export default function AdminBracketClient({
  initialMatches,
  resultsCount,
}: AdminBracketClientProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [count, setCount] = useState(resultsCount);

  const onSetWinner = useCallback(
    async (matchId: number, winnerSlot: 0 | 1) => {
      if (pending) return;
      setPending(true);
      try {
        const res = await fetch("/api/bracket/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matchId, winnerSlot }),
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(data?.error ?? "Failed to save result");
          return;
        }
        const data = await res.json();
        setCount(data.results?.length ?? count + 1);
        router.refresh();
      } finally {
        setPending(false);
      }
    },
    [pending, count, router]
  );

  const onUndo = useCallback(async () => {
    if (pending || count <= 0) return;
    setPending(true);
    try {
      const res = await fetch("/api/bracket/results/undo", {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error ?? "Failed to undo");
        return;
      }
      const data = await res.json();
      setCount(data.results?.length ?? count - 1);
      router.refresh();
    } finally {
      setPending(false);
    }
  }, [pending, count, router]);

  const adminControls: AdminControls = {
    onSetWinner,
    onUndo,
    canUndo: count > 0,
  };

  return (
    <div className="w-full">
      <BracketView
        matches={initialMatches}
        adminControls={adminControls}
      />
    </div>
  );
}

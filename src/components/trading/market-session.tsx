"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { MarketSession } from "@/data/market";

function statusTone(status: MarketSession["status"]) {
  switch (status) {
    case "Open":
      return {
        card: "border-emerald-500/30 bg-emerald-500/[0.10]",
        dot: "bg-emerald-300",
        time: "text-emerald-100",
      };
    case "Pre-market":
      return {
        card: "border-amber-500/25 bg-amber-500/[0.08]",
        dot: "bg-amber-300",
        time: "text-amber-100",
      };
    case "Closed":
      return {
        card: "border-white/10 bg-gradient-to-b from-white/[0.03] to-white/[0.015]",
        dot: "bg-zinc-300",
        time: "text-zinc-100",
      };
  }
}

export function MarketSessionPill({ session }: { session: MarketSession }) {
  const tone = statusTone(session.status);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl border px-3 py-2 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]",
        tone.card,
      )}
    >
      <div className="min-w-20 flex-1">
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground">
          {session.name.toUpperCase()}
        </div>
        <div className={cn("text-sm font-semibold tabular-nums tracking-tight", tone.time)}>
          {session.localTime}
        </div>
      </div>

      <span className={cn("ml-auto h-2 w-2 rounded-full", tone.dot)} />
    </div>
  );
}

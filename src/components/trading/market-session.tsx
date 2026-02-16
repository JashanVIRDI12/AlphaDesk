"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { MarketSession } from "@/data/market";

function statusTone(status: MarketSession["status"]) {
  switch (status) {
    case "Open":
      return {
        dot: "bg-emerald-300",
        text: "text-emerald-200",
        chip: "border-emerald-500/20 bg-emerald-500/10",
      };
    case "Pre-market":
      return {
        dot: "bg-amber-300",
        text: "text-amber-200",
        chip: "border-amber-500/20 bg-amber-500/10",
      };
    case "Closed":
      return {
        dot: "bg-zinc-300",
        text: "text-zinc-200",
        chip: "border-white/10 bg-white/[0.02]",
      };
  }
}

export function MarketSessionPill({ session }: { session: MarketSession }) {
  const tone = statusTone(session.status);

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-white/[0.015] px-3 py-2 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-colors hover:border-white/15 hover:bg-white/[0.03]">
      <div className="min-w-20">
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground">
          {session.name.toUpperCase()}
        </div>
        <div className="text-sm font-semibold tabular-nums tracking-tight">
          {session.localTime}
        </div>
      </div>

      <div
        className={cn(
          "ml-auto inline-flex items-center gap-2 rounded-full border px-2.5 py-1",
          tone.chip,
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
        <span className={cn("text-[11px] font-medium tracking-wide", tone.text)}>
          {session.status.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

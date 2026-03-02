"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, ArrowRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InstrumentData } from "@/components/trading/instrument-card";

/* ── Tiny radial confidence ring ── */
function Ring({ value, bullish, bearish }: { value: number; bullish: boolean; bearish: boolean }) {
    const size = 40;
    const r = (size - 6) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (Math.min(100, Math.max(0, value)) / 100) * circ;
    const stroke = bullish ? "stroke-emerald-400" : bearish ? "stroke-rose-400" : "stroke-zinc-400";
    const glow = bullish
        ? "drop-shadow(0 0 4px rgba(52,211,153,0.5))"
        : bearish
            ? "drop-shadow(0 0 4px rgba(248,113,113,0.5))"
            : "drop-shadow(0 0 3px rgba(161,161,170,0.3))";

    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90" style={{ filter: glow }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={3} />
                <circle
                    cx={size / 2} cy={size / 2} r={r} fill="none"
                    className={stroke} strokeWidth={3} strokeLinecap="round"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold tabular-nums text-zinc-200">{value}</span>
            </div>
        </div>
    );
}

const PAIR_ACCENT: Record<string, { bar: string; glow: string }> = {
    EURUSD: { bar: "from-blue-500", glow: "bg-blue-500/[0.06]" },
    GBPUSD: { bar: "from-violet-500", glow: "bg-violet-500/[0.06]" },
    XAUUSD: { bar: "from-amber-500", glow: "bg-amber-500/[0.06]" },
    USDJPY: { bar: "from-teal-500", glow: "bg-teal-500/[0.06]" },
};

export function InstrumentSummaryCard({
    instrument,
}: {
    instrument: InstrumentData;
}) {
    const bullish = instrument.bias === "Bullish";
    const bearish = instrument.bias === "Bearish";
    const accent = PAIR_ACCENT[instrument.symbol] ?? { bar: "from-zinc-500", glow: "bg-zinc-500/[0.06]" };

    const biasBg = bullish
        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
        : bearish
            ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
            : "border-zinc-500/20 bg-zinc-500/10 text-zinc-300";

    const sideLine = bullish
        ? "from-emerald-500/90 to-emerald-500/10"
        : bearish
            ? "from-rose-500/90 to-rose-500/10"
            : "from-zinc-500/90 to-zinc-500/10";

    return (
        <Link
            href={`/dashboard/instruments/${instrument.symbol}`}
            className="group relative flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#0d0d0f] px-4 py-3.5 transition-all duration-200 hover:border-white/[0.12] hover:bg-[#111115] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        >
            {/* Left bias-colored strip */}
            <div className={cn("absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-gradient-to-b opacity-80", sideLine)} />

            {/* Pair identity */}
            <div className="min-w-0 flex-1 pl-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-bold tracking-tight text-zinc-100">{instrument.symbol}</span>
                    <span className="text-[9px] text-zinc-600 hidden sm:inline">{instrument.displayName}</span>
                    {/* Bias pill */}
                    <div className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[8px] font-bold tracking-widest", biasBg)}>
                        {bullish ? <ArrowUpRight className="h-2.5 w-2.5" /> : bearish ? <ArrowDownRight className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />}
                        {instrument.bias.toUpperCase()}
                    </div>
                </div>
                {/* One-line summary */}
                <p className="text-[11px] leading-snug text-zinc-500 line-clamp-1 group-hover:text-zinc-400 transition-colors">
                    {instrument.summary || "AI analysis loading…"}
                </p>
            </div>

            {/* Right: confidence ring + CTA */}
            <div className="flex shrink-0 items-center gap-3">
                <div className="flex flex-col items-center gap-0.5">
                    <Ring value={instrument.confidence} bullish={bullish} bearish={bearish} />
                    <span className="text-[7px] font-semibold uppercase tracking-widest text-zinc-700">Conv.</span>
                </div>
                <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.06] transition-all duration-200",
                    "group-hover:border-white/[0.15] group-hover:bg-white/[0.05]"
                )}>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                </div>
            </div>

            {/* Subtle pair-colored back glow */}
            <div className={cn("pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity", accent.glow)} />
        </Link>
    );
}

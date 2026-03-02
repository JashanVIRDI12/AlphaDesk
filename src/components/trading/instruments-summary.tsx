"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import { InstrumentSummaryCard } from "@/components/trading/instrument-summary-card";
import { useInstruments } from "@/hooks/use-dashboard-data";
import type { InstrumentData } from "@/components/trading/instrument-card";

export function InstrumentsSummary() {
    const { data, isLoading } = useInstruments();

    if (isLoading) {
        return (
            <div className="space-y-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-[72px] animate-pulse rounded-2xl border border-white/[0.04] bg-white/[0.02]" />
                ))}
            </div>
        );
    }

    if (!data?.instruments || data.instruments.length === 0) {
        return (
            <div className="py-8 text-center text-sm text-zinc-600">
                Analysis loading…
            </div>
        );
    }

    const timeLabel = data.generatedAt
        ? new Date(data.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : null;

    return (
        <div className="space-y-3">
            {/* Summary cards */}
            <div className="space-y-2">
                {data.instruments.map((inst: InstrumentData) => (
                    <InstrumentSummaryCard key={inst.symbol} instrument={inst} />
                ))}
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between pt-1">
                {timeLabel && (
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-700">
                        <span className="inline-block h-1 w-1 rounded-full bg-emerald-500/60 animate-pulse" />
                        AI · {timeLabel}
                    </div>
                )}
                <Link
                    href="/dashboard/instruments/EURUSD"
                    className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                    View all analysis <ArrowRight className="h-3 w-3" />
                </Link>
            </div>
        </div>
    );
}

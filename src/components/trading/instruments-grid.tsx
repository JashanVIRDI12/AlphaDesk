"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { InstrumentCard, type InstrumentData } from "@/components/trading/instrument-card";
import { useInstruments } from "@/hooks/use-dashboard-data";

export function InstrumentsGrid() {
    const { data, isLoading } = useInstruments();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-3 py-14">
                <div className="relative">
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                    <div className="absolute inset-0 animate-ping">
                        <Loader2 className="h-5 w-5 text-zinc-700" />
                    </div>
                </div>
                <span className="text-[13px] font-medium text-zinc-500">
                    AI analysing instruments…
                </span>
            </div>
        );
    }

    if (!data?.instruments || data.instruments.length === 0) {
        return (
            <div className="py-14 text-center text-sm text-zinc-500">
                No instrument data available.
            </div>
        );
    }

    // Format the time nicely
    const timeLabel = data.generatedAt
        ? new Date(data.generatedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })
        : null;

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.instruments.map((inst: InstrumentData) => (
                    <InstrumentCard key={inst.symbol} instrument={inst} />
                ))}
            </div>
            {timeLabel && (
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                    <span className="inline-block h-1 w-1 rounded-full bg-emerald-500/60 animate-pulse" />
                    AI-generated · {timeLabel}
                </div>
            )}
        </div>
    );
}

"use client";

import * as React from "react";
import { InstrumentCard, type InstrumentData } from "@/components/trading/instrument-card";
import { useInstruments } from "@/hooks/use-dashboard-data";

/* ── Skeleton card — mirrors the real InstrumentCard layout ── */
function InstrumentCardSkeleton({ delay = 0 }: { delay?: number }) {
    return (
        <div
            className="rounded-2xl border border-white/[0.05] bg-white/[0.015] p-5 space-y-4"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Header: icon + name + bias badge */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="sk h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                        <div className="sk h-2.5 w-14 rounded" />
                        <div className="sk h-5 w-20 rounded" />
                    </div>
                </div>
                <div className="sk h-7 w-20 rounded-lg" />
            </div>

            {/* Confidence bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="sk h-2 w-20 rounded" />
                    <div className="sk h-2 w-8 rounded" />
                </div>
                <div className="flex gap-[3px]">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className="sk h-2 flex-1 rounded-sm"
                            style={{ opacity: i < 13 ? 1 : 0.3 }}
                        />
                    ))}
                </div>
            </div>

            {/* Summary text */}
            <div className="space-y-2">
                <div className="sk h-3 w-full rounded" />
                <div className="sk h-3 w-4/5 rounded" />
            </div>

            {/* Bottom actions */}
            <div className="flex items-center gap-2 border-t border-white/[0.04] pt-3">
                <div className="sk h-7 flex-1 rounded-lg" />
                <div className="sk h-7 w-7 rounded-lg" />
                <div className="sk h-7 w-7 rounded-lg" />
            </div>
        </div>
    );
}

export function InstrumentsGrid() {
    const { data, isLoading } = useInstruments();

    if (isLoading) {
        return (
            <div className="space-y-3">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <InstrumentCardSkeleton key={i} delay={i * 80} />
                    ))}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-700">
                    <div className="sk h-2 w-2 rounded-full" />
                    <div className="sk h-2 w-32 rounded" />
                </div>
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

    const timeLabel = data.generatedAt
        ? new Date(data.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : null;

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.instruments.map((inst: InstrumentData) => (
                    <InstrumentCard key={inst.symbol} instrument={inst} generatedAt={data.generatedAt} />
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

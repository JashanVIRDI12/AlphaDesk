"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { InstrumentCard, type InstrumentData } from "@/components/trading/instrument-card";

export function InstrumentsGrid() {
    const [instruments, setInstruments] = React.useState<InstrumentData[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [generatedAt, setGeneratedAt] = React.useState<string | null>(null);
    const [cached, setCached] = React.useState(false);

    React.useEffect(() => {
        let cancelled = false;

        async function fetchInstruments() {
            try {
                const res = await fetch("/api/instruments");
                if (!res.ok) throw new Error("API error");
                const data = await res.json();
                if (!cancelled) {
                    setInstruments(data.instruments ?? []);
                    setGeneratedAt(data.generatedAt ?? null);
                    setCached(data.cached ?? false);
                    setLoading(false);
                }
            } catch (err) {
                console.error("[InstrumentsGrid] Fetch failed:", err);
                if (!cancelled) setLoading(false);
            }
        }

        fetchInstruments();
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
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

    if (instruments.length === 0) {
        return (
            <div className="py-14 text-center text-sm text-zinc-500">
                No instrument data available.
            </div>
        );
    }

    // Format the time nicely
    const timeLabel = generatedAt
        ? `${cached ? "cached" : "fresh"} · ${new Date(generatedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })}`
        : null;

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {instruments.map((inst) => (
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

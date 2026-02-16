"use client";

import * as React from "react";
import { Newspaper, ExternalLink, Radio } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Headline = {
    title: string;
    source: string;
    url: string;
    publishedAt: string;
    ago: string;
};

const SOURCE_COLORS: Record<string, string> = {
    USD: "text-sky-400/90",
    EUR: "text-indigo-400/90",
    GBP: "text-violet-400/90",
    JPY: "text-teal-400/90",
    GEO: "text-amber-400/90",
    FX: "text-zinc-400/90",
};

export function NewsHeadlines() {
    const [headlines, setHeadlines] = React.useState<Headline[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await fetch("/api/news", { cache: "no-store" });
                if (!res.ok) throw new Error(`${res.status}`);
                const data = await res.json();
                if (!cancelled) {
                    setHeadlines(data.headlines ?? []);
                    setError(null);
                }
            } catch (e) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : "Failed to load");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        const id = window.setInterval(load, 5 * 60 * 1000);
        return () => {
            cancelled = true;
            window.clearInterval(id);
        };
    }, []);

    return (
        <Card className="relative overflow-hidden border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_80px_rgba(0,0,0,0.5)]">
            {/* Top edge highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

            <CardHeader className="px-4 pb-2 pt-3.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.05] bg-white/[0.02]">
                            <Newspaper className="h-3 w-3 text-zinc-500" />
                        </div>
                        <span className="text-[13px] font-semibold tracking-tight text-zinc-200">
                            Headlines
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {loading ? (
                            <span className="text-[9px] tracking-wide text-zinc-600">
                                loading…
                            </span>
                        ) : (
                            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/[0.04] px-2 py-0.5">
                                <div className="relative h-1.5 w-1.5">
                                    <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" style={{ animationDuration: "2s" }} />
                                    <div className="relative h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                                </div>
                                <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-emerald-400/80">
                                    Live
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-4 pb-3.5 pt-0">
                {error && !loading ? (
                    <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-2 text-[10px] text-zinc-600">
                        News unavailable
                    </div>
                ) : null}

                {!loading && headlines.length === 0 && !error ? (
                    <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-2 text-[10px] text-zinc-600">
                        No headlines available
                    </div>
                ) : null}

                <div className="space-y-px">
                    {headlines.slice(0, 6).map((h, i) => (
                        <a
                            key={`${h.publishedAt}-${i}`}
                            href={h.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "group relative flex items-start gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-300",
                                "hover:bg-white/[0.03]",
                                i === 0 && "bg-white/[0.02] border border-white/[0.04]",
                                i !== 0 && "border border-transparent",
                            )}
                        >
                            {/* Left accent line for first item */}
                            {i === 0 && (
                                <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-sky-400/40 via-sky-400/20 to-transparent" />
                            )}

                            <div className="min-w-0 flex-1">
                                <div
                                    className={cn(
                                        "text-[11px] leading-[1.5] tracking-tight",
                                        i === 0
                                            ? "font-semibold text-zinc-200"
                                            : "font-medium text-zinc-400",
                                    )}
                                >
                                    {h.title}
                                </div>
                                <div className="mt-1 flex items-center gap-1.5 text-[9px]">
                                    <span
                                        className={cn(
                                            "font-semibold tracking-wide",
                                            SOURCE_COLORS[h.source] ?? "text-zinc-500",
                                        )}
                                    >
                                        {h.source}
                                    </span>
                                    <span className="text-zinc-700">·</span>
                                    <span className="text-zinc-600">{h.ago}</span>
                                </div>
                            </div>
                            <ExternalLink className="mt-1 h-3 w-3 shrink-0 text-zinc-700 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-zinc-500" />
                        </a>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-1.5 pt-1">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex flex-col gap-1.5 px-2.5 py-2">
                                <div className="h-3 w-full animate-pulse rounded bg-white/[0.03]" />
                                <div className="h-2 w-1/3 animate-pulse rounded bg-white/[0.02]" />
                            </div>
                        ))}
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}

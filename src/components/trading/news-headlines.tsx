"use client";

import * as React from "react";
import { Newspaper, ExternalLink, Radio } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNews } from "@/hooks/use-dashboard-data";

type Headline = {
    title: string;
    source: string;
    topic?: string;
    url: string;
    publishedAt: string;
    ago: string;
};

type NewsFilter = "ALL" | "USD" | "JPY" | "GBP" | "FED";

const FILTERS: NewsFilter[] = ["ALL", "USD", "JPY", "GBP", "FED"];
const HIGH_IMPACT_TERMS = [
    "cpi",
    "inflation",
    "nfp",
    "nonfarm",
    "fomc",
    "federal reserve",
    "fed",
    "boj",
    "bank of japan",
    "boe",
    "bank of england",
    "ecb",
    "interest rate",
    "rate decision",
    "intervention",
    "payroll",
    "gdp",
    "pmi",
];

function isFedHeadline(h: Headline): boolean {
    const title = h.title.toLowerCase();
    return (
        h.topic === "USD" ||
        title.includes("federal reserve") ||
        title.includes("fed") ||
        title.includes("fomc")
    );
}

function isHighImpactHeadline(h: Headline): boolean {
    const title = h.title.toLowerCase();
    return HIGH_IMPACT_TERMS.some((term) => title.includes(term));
}

const SOURCE_COLORS: Record<string, string> = {
    USD: "text-sky-400/90",
    EUR: "text-indigo-400/90",
    GBP: "text-violet-400/90",
    JPY: "text-teal-400/90",
    GEO: "text-amber-400/90",
    FX: "text-zinc-400/90",
};

export function NewsHeadlines() {
    const { data, isLoading, error } = useNews();
    const [, forceTick] = React.useState(0);
    const [activeFilter, setActiveFilter] = React.useState<NewsFilter>("ALL");
    const [highImpactOnly, setHighImpactOnly] = React.useState(false);
    const [showAll, setShowAll] = React.useState(false);

    React.useEffect(() => {
        try {
            const storedFilter = window.localStorage.getItem("news-filter") as NewsFilter | null;
            if (storedFilter && FILTERS.includes(storedFilter)) {
                setActiveFilter(storedFilter);
            }
            setHighImpactOnly(window.localStorage.getItem("news-high-impact") === "1");
        } catch {
            // ignore localStorage issues
        }
    }, []);

    React.useEffect(() => {
        try {
            window.localStorage.setItem("news-filter", activeFilter);
        } catch {
            // ignore localStorage issues
        }
    }, [activeFilter]);

    React.useEffect(() => {
        try {
            window.localStorage.setItem("news-high-impact", highImpactOnly ? "1" : "0");
        } catch {
            // ignore localStorage issues
        }
    }, [highImpactOnly]);

    const filterCounts = React.useMemo(() => {
        const headlines = data?.headlines ?? [];
        return {
            ALL: headlines.length,
            USD: headlines.filter((h: Headline) => h.topic === "USD").length,
            JPY: headlines.filter((h: Headline) => h.topic === "JPY").length,
            GBP: headlines.filter((h: Headline) => h.topic === "GBP").length,
            FED: headlines.filter((h: Headline) => isFedHeadline(h)).length,
        } as Record<NewsFilter, number>;
    }, [data?.headlines]);

    const filteredHeadlines = React.useMemo(() => {
        const headlines = [...(data?.headlines ?? [])];
        const byFilter =
            activeFilter === "ALL"
                ? headlines
                : activeFilter === "FED"
                    ? headlines.filter((h: Headline) => isFedHeadline(h))
                    : headlines.filter((h: Headline) => h.topic === activeFilter);

        const byImpact = highImpactOnly ? byFilter.filter((h: Headline) => isHighImpactHeadline(h)) : byFilter;

        return byImpact.sort(
            (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
        );
    }, [data?.headlines, activeFilter, highImpactOnly]);

    const updatedLabel = React.useMemo(() => {
        if (!data?.generatedAt) return null;
        const diff = Date.now() - new Date(data.generatedAt).getTime();
        if (!Number.isFinite(diff)) return null;
        const mins = Math.floor(diff / 60_000);
        if (mins < 1) return "Last updated just now";
        if (mins < 60) return `Last updated ${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        return `Last updated ${hrs}h ago`;
    }, [data?.generatedAt, forceTick]);

    React.useEffect(() => {
        const ticker = window.setInterval(() => forceTick((v) => (v + 1) % 10_000), 60 * 1000);
        return () => window.clearInterval(ticker);
    }, []);

    return (
        <Card className="relative overflow-hidden border-white/[0.08] bg-gradient-to-b from-indigo-500/[0.08] via-purple-500/[0.04] to-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_22px_80px_rgba(0,0,0,0.5)]">
            {/* Top edge highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/25 to-transparent" />

            <CardHeader className="px-3 pb-2 pt-3 sm:px-4 sm:pt-3.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.05] bg-white/[0.02]">
                            <Newspaper className="h-3 w-3 text-zinc-500" />
                        </div>
                        <span className="text-[12px] font-semibold tracking-tight text-zinc-200 sm:text-[13px]">
                            Headlines
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {isLoading ? (
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
                {!isLoading && !error && updatedLabel ? (
                    <div className="mt-1 text-[9px] tracking-wide text-zinc-600">
                        {updatedLabel}
                    </div>
                ) : null}
            </CardHeader>

            <CardContent className="px-3 pb-3 pt-0 sm:px-4 sm:pb-3.5">
                <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => setActiveFilter(f)}
                            className={cn(
                                "rounded-full border px-2 py-0.5 text-[7px] font-semibold tracking-[0.12em] transition-all duration-200 sm:text-[8px]",
                                activeFilter === f
                                    ? "border-indigo-400/35 bg-indigo-500/[0.12] text-indigo-200"
                                    : "border-white/[0.08] bg-white/[0.02] text-zinc-500 hover:border-white/[0.14] hover:text-zinc-300",
                            )}
                        >
                            {f} ({filterCounts[f] ?? 0})
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setHighImpactOnly((v) => !v)}
                        className={cn(
                            "ml-auto rounded-full border px-2 py-0.5 text-[7px] font-semibold tracking-[0.12em] transition-all duration-200 sm:text-[8px]",
                            highImpactOnly
                                ? "border-amber-400/35 bg-amber-500/[0.14] text-amber-200"
                                : "border-white/[0.08] bg-white/[0.02] text-zinc-500 hover:border-white/[0.14] hover:text-zinc-300",
                        )}
                    >
                        HIGH IMPACT
                    </button>
                </div>

                {error && !isLoading ? (
                    <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-2 text-[10px] text-zinc-600">
                        News unavailable
                    </div>
                ) : null}

                {!isLoading && filteredHeadlines.length === 0 && !error ? (
                    <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-2 text-[10px] text-zinc-600">
                        No headlines available
                    </div>
                ) : null}

                <div className="space-y-px">
                    {filteredHeadlines.slice(0, showAll ? 10 : 4).map((h: Headline, i: number) => (
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
                                            SOURCE_COLORS[h.topic ?? h.source] ?? "text-zinc-500",
                                        )}
                                    >
                                        {h.topic ?? h.source}
                                    </span>
                                    {isHighImpactHeadline(h) ? (
                                        <span className="rounded-full border border-amber-400/25 bg-amber-500/[0.12] px-1.5 py-[1px] text-[7px] font-semibold tracking-[0.12em] text-amber-200">
                                            HIGH
                                        </span>
                                    ) : null}
                                    <span className="text-zinc-700">·</span>
                                    <span className="text-zinc-600">{h.ago}</span>
                                </div>
                            </div>
                            <ExternalLink className="mt-1 h-3 w-3 shrink-0 text-zinc-700 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-zinc-500" />
                        </a>
                    ))}
                </div>

                {filteredHeadlines.length > 4 ? (
                    <button
                        type="button"
                        onClick={() => setShowAll((v) => !v)}
                        className="mt-2 w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-[10px] font-medium tracking-wide text-zinc-400 transition-all hover:border-white/[0.14] hover:text-zinc-200"
                    >
                        {showAll ? "Show less" : `Show more (${filteredHeadlines.length - 4})`}
                    </button>
                ) : null}

                {isLoading ? (
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

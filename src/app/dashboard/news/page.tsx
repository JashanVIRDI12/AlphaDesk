"use client";

import * as React from "react";
import Link from "next/link";
import {
    ArrowLeft, ExternalLink, RefreshCw,
    Newspaper, TrendingUp, Globe, Zap, Search, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNews } from "@/hooks/use-dashboard-data";
import { DashboardShell } from "@/components/trading/dashboard-shell";
import { AuthGate } from "@/components/auth/auth-gate";

/* ── Types ── */
type Headline = {
    title: string;
    source: string;
    topic?: string;
    url: string;
    publishedAt: string;
    ago: string;
};

type TopicFilter = "ALL" | "USD" | "EUR" | "GBP" | "JPY" | "GEO" | "FX";

/* ── Config ── */
const TOPIC_CONFIG: Record<string, {
    label: string; color: string; bg: string; border: string; dot: string; icon: React.ElementType;
}> = {
    USD: { label: "US Dollar", color: "text-sky-300", bg: "bg-sky-500/10", border: "border-sky-500/20", dot: "bg-sky-400", icon: TrendingUp },
    EUR: { label: "Euro", color: "text-indigo-300", bg: "bg-indigo-500/10", border: "border-indigo-500/20", dot: "bg-indigo-400", icon: TrendingUp },
    GBP: { label: "Sterling", color: "text-violet-300", bg: "bg-violet-500/10", border: "border-violet-500/20", dot: "bg-violet-400", icon: TrendingUp },
    JPY: { label: "Yen", color: "text-teal-300", bg: "bg-teal-500/10", border: "border-teal-500/20", dot: "bg-teal-400", icon: TrendingUp },
    GEO: { label: "Geopolitics", color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-400", icon: Globe },
    FX: { label: "Forex", color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-400", icon: Zap },
};

const HIGH_IMPACT_TERMS = [
    "cpi", "inflation", "nfp", "nonfarm", "fomc", "federal reserve", "fed",
    "boj", "bank of japan", "boe", "bank of england", "ecb", "interest rate",
    "rate decision", "intervention", "payroll", "gdp", "pmi",
];

function isHighImpact(title: string): boolean {
    const lower = title.toLowerCase();
    return HIGH_IMPACT_TERMS.some((t) => lower.includes(t));
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

/* ── Featured card (hero) ── */
function FeaturedCard({ headline }: { headline: Headline }) {
    const topic = headline.topic ?? "FX";
    const cfg = TOPIC_CONFIG[topic] ?? TOPIC_CONFIG.FX;
    const high = isHighImpact(headline.title);

    return (
        <a
            href={headline.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col justify-end overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0d0d10] to-[#131318] p-6 sm:p-8 transition-all duration-300 hover:border-white/[0.14] hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-0.5"
        >
            {/* Background glow */}
            <div className={cn("pointer-events-none absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-30", cfg.bg)} />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />

            {/* Top meta */}
            <div className="mb-auto flex items-center gap-2 pb-6">
                <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase", cfg.border, cfg.bg, cfg.color)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                    {cfg.label}
                </div>
                {high && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/20 px-2.5 py-1 text-[9px] font-bold tracking-widest text-amber-300 uppercase">
                        <Zap className="h-2.5 w-2.5" /> HIGH IMPACT
                    </span>
                )}
            </div>

            {/* Title */}
            <div>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-100 leading-snug group-hover:text-white transition-colors mb-3">
                    {headline.title}
                </h2>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px] text-zinc-600">
                        <span className="font-semibold text-zinc-500">{headline.source}</span>
                        <span>·</span>
                        <span>{formatDate(headline.publishedAt)}</span>
                        <span>·</span>
                        <span>{headline.ago} ago</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        </a>
    );
}

/* ── Standard news card ── */
function NewsCard({ headline, index }: { headline: Headline; index: number }) {
    const topic = headline.topic ?? "FX";
    const cfg = TOPIC_CONFIG[topic] ?? TOPIC_CONFIG.FX;
    const high = isHighImpact(headline.title);

    return (
        <a
            href={headline.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d0d10] p-4 sm:p-5 transition-all duration-200 hover:border-white/[0.12] hover:bg-[#111115] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/50"
        >
            {/* Left accent strip */}
            <div className={cn("absolute left-0 top-4 bottom-4 w-[2px] rounded-r-full opacity-70", cfg.bg.replace("bg-", "bg-").replace("/10", "/60"))} />

            {/* Tags */}
            <div className="flex items-center gap-2 pl-1">
                <div className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase", cfg.border, cfg.bg, cfg.color)}>
                    <span className={cn("h-1 w-1 rounded-full", cfg.dot)} />
                    {cfg.label}
                </div>
                {high && (
                    <span className="rounded-md bg-amber-500/10 border border-amber-500/15 px-1.5 py-0.5 text-[8px] font-bold text-amber-400 uppercase tracking-wider">
                        HIGH
                    </span>
                )}
                <span className="ml-auto text-[10px] text-zinc-700">{headline.ago}</span>
            </div>

            {/* Title */}
            <h3 className="text-[13px] font-semibold leading-snug tracking-tight text-zinc-300 group-hover:text-zinc-100 transition-colors pl-1">
                {headline.title}
            </h3>

            {/* Footer */}
            <div className="flex items-center justify-between pl-1">
                <span className="text-[10px] text-zinc-600">{headline.source} · {formatTime(headline.publishedAt)}</span>
                <ExternalLink className="h-3 w-3 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </a>
    );
}

/* ── Topic pill ── */
function TopicPill({ topic, active, count, onClick }: {
    topic: string; active: boolean; count: number; onClick: () => void;
}) {
    const cfg = topic === "ALL" ? null : TOPIC_CONFIG[topic];
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold tracking-wide transition-all duration-150",
                active
                    ? cfg
                        ? `${cfg.border} ${cfg.bg} ${cfg.color}`
                        : "border-white/20 bg-white/10 text-white"
                    : "border-white/[0.07] bg-white/[0.02] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300"
            )}
        >
            {cfg && <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />}
            {topic === "ALL" ? "All" : cfg?.label ?? topic}
            <span className={cn("rounded-full px-1 py-0.5 text-[8px] tabular-nums", active ? "bg-white/10" : "bg-white/[0.04]")}>
                {count}
            </span>
        </button>
    );
}

/* ════════════ MAIN PAGE ════════════ */
export default function NewsPage() {
    const { data, isLoading, refetch, isFetching } = useNews();
    const [activeFilter, setActiveFilter] = React.useState<TopicFilter>("ALL");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [highImpactOnly, setHighImpactOnly] = React.useState(false);

    const headlines = (data?.headlines ?? []) as Headline[];

    /* filter */
    const filtered = React.useMemo(() => {
        let list = [...headlines];
        if (activeFilter !== "ALL") list = list.filter((h) => h.topic === activeFilter);
        if (highImpactOnly) list = list.filter((h) => isHighImpact(h.title));
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter((h) =>
                h.title.toLowerCase().includes(q) || (h.source ?? "").toLowerCase().includes(q)
            );
        }
        return list;
    }, [headlines, activeFilter, highImpactOnly, searchQuery]);

    /* topic counts */
    const topicCounts = React.useMemo(() => {
        const counts: Record<string, number> = { ALL: headlines.length };
        for (const h of headlines) {
            const t = h.topic ?? "FX";
            counts[t] = (counts[t] ?? 0) + 1;
        }
        return counts;
    }, [headlines]);

    const featured = filtered[0];
    const rest = filtered.slice(1);

    const lastUpdated = data?.generatedAt
        ? new Date(data.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : null;

    return (
        <DashboardShell>
            <AuthGate>
                {/* ── Sticky top nav ── */}
                <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#080809]/95 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[11px] font-semibold text-zinc-400 transition-all hover:border-white/[0.12] hover:text-zinc-200"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Dashboard
                        </Link>
                        <div className="h-4 w-px bg-white/[0.07]" />
                        <div className="flex items-center gap-2">
                            <Newspaper className="h-3.5 w-3.5 text-zinc-600" />
                            <span className="text-[11px] font-bold text-zinc-300">Live News</span>
                        </div>
                        {lastUpdated && (
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-700">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500/70 animate-pulse" />
                                Updated {lastUpdated}
                            </div>
                        )}
                        <button
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="ml-auto flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold text-zinc-500 transition-all hover:text-zinc-300 disabled:opacity-40"
                        >
                            <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin")} />
                            Refresh
                        </button>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">

                    {/* ── Page title ── */}
                    <div className="mb-6 flex flex-col gap-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">Live Feed</p>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Forex Market News</h1>
                        <p className="text-[12px] text-zinc-600">Filtered & ranked headlines across USD · EUR · GBP · JPY · Geopolitics · FX</p>
                    </div>

                    {/* ── Controls ── */}
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        {/* Topic pills */}
                        <div className="flex flex-wrap gap-1.5">
                            {(["ALL", "USD", "EUR", "GBP", "JPY", "GEO", "FX"] as TopicFilter[]).map((t) => (
                                <TopicPill
                                    key={t}
                                    topic={t}
                                    active={activeFilter === t}
                                    count={topicCounts[t] ?? 0}
                                    onClick={() => setActiveFilter(t)}
                                />
                            ))}
                            <button
                                onClick={() => setHighImpactOnly((v) => !v)}
                                className={cn(
                                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold tracking-wide transition-all",
                                    highImpactOnly
                                        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                        : "border-white/[0.07] bg-white/[0.02] text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                <Zap className="h-3 w-3" /> HIGH IMPACT
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative flex-shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
                            <input
                                type="text"
                                placeholder="Search headlines…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-52 rounded-xl border border-white/[0.07] bg-white/[0.03] pl-8 pr-3 py-2 text-[11px] text-zinc-300 placeholder-zinc-700 outline-none transition-all focus:border-white/[0.14] focus:bg-white/[0.04]"
                            />
                        </div>
                    </div>

                    {/* ── Loading skeleton ── */}
                    {isLoading && (
                        <div className="space-y-4">
                            <div className="h-56 animate-pulse rounded-3xl bg-white/[0.03]" />
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-36 animate-pulse rounded-2xl bg-white/[0.02]" style={{ animationDelay: `${i * 80}ms` }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Empty state ── */}
                    {!isLoading && filtered.length === 0 && (
                        <div className="flex flex-col items-center gap-3 py-24 text-center">
                            <Filter className="h-10 w-10 text-zinc-800" />
                            <p className="text-sm font-medium text-zinc-500">No headlines match your filter</p>
                            <button
                                onClick={() => { setActiveFilter("ALL"); setSearchQuery(""); setHighImpactOnly(false); }}
                                className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-[11px] text-zinc-400 hover:text-zinc-200"
                            >
                                Reset filters
                            </button>
                        </div>
                    )}

                    {/* ── News grid ── */}
                    {!isLoading && featured && (
                        <div className="space-y-4">
                            {/* Featured hero card */}
                            <FeaturedCard headline={featured} />

                            {/* Rest as grid */}
                            {rest.length > 0 && (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {rest.map((h, i) => (
                                        <NewsCard key={`${h.url}-${i}`} headline={h} index={i} />
                                    ))}
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-center gap-2 pt-4 text-[10px] text-zinc-700">
                                <span className="inline-block h-1 w-1 rounded-full bg-emerald-500/50 animate-pulse" />
                                {filtered.length} headlines · sourced from Google News RSS · AI-filtered for market relevance
                            </div>
                        </div>
                    )}

                </main>
            </AuthGate>
        </DashboardShell>
    );
}

"use client";

import * as React from "react";
import { MessageSquare, ArrowUp, ExternalLink, RefreshCw, AlertCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRedditPosts } from "@/hooks/use-dashboard-data";
import type { RedditPost } from "@/hooks/use-dashboard-data";

/* ── Pair filter config ── */
type PairFilter = "ALL" | "EURUSD" | "GBPUSD" | "XAUUSD" | "USDJPY";

const PAIR_FILTERS: PairFilter[] = ["ALL", "EURUSD", "GBPUSD", "XAUUSD", "USDJPY"];

const PAIR_CFG: Record<PairFilter, { active: string; badge: string; dot: string; label: string }> = {
    ALL: { active: "border-orange-500/30 bg-orange-500/10 text-orange-300", badge: "", dot: "bg-orange-400", label: "All" },
    EURUSD: { active: "border-blue-500/30 bg-blue-500/10 text-blue-300", badge: "text-blue-400 bg-blue-400/10 border-blue-400/20", dot: "bg-blue-400", label: "EUR/USD" },
    GBPUSD: { active: "border-violet-500/30 bg-violet-500/10 text-violet-300", badge: "text-violet-400 bg-violet-400/10 border-violet-400/20", dot: "bg-violet-400", label: "GBP/USD" },
    XAUUSD: { active: "border-amber-500/30 bg-amber-500/10 text-amber-300", badge: "text-amber-400 bg-amber-400/10 border-amber-400/20", dot: "bg-amber-400", label: "XAU/USD" },
    USDJPY: { active: "border-teal-500/30 bg-teal-500/10 text-teal-300", badge: "text-teal-400 bg-teal-400/10 border-teal-400/20", dot: "bg-teal-400", label: "USD/JPY" },
};

function fmtScore(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
}

function PostCard({ post, rank }: { post: RedditPost; rank: number }) {
    const pairFilter = post.pair as PairFilter;
    const cfg = PAIR_CFG[pairFilter] ?? PAIR_CFG.ALL;
    const isTop = rank === 0;
    return (
        <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "group relative flex gap-2.5 rounded-xl border p-3 transition-all duration-200",
                "hover:border-white/[0.1] hover:bg-white/[0.03] active:scale-[0.99]",
                isTop
                    ? "border-orange-500/15 bg-orange-500/[0.04]"
                    : "border-white/[0.04] bg-white/[0.01]"
            )}
        >
            {/* Rank / score col */}
            <div className="flex w-7 shrink-0 flex-col items-center gap-0.5">
                <ArrowUp className={cn(
                    "h-3 w-3 transition-colors",
                    isTop ? "text-orange-400" : "text-zinc-700 group-hover:text-orange-400"
                )} />
                <span className={cn(
                    "text-[9px] font-mono font-bold tabular-nums transition-colors",
                    isTop ? "text-orange-400" : "text-zinc-600 group-hover:text-orange-400"
                )}>
                    {fmtScore(post.score)}
                </span>
            </div>

            {/* Body */}
            <div className="min-w-0 flex-1 space-y-1">
                {/* Pair badge + flair */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {post.pair !== "GENERAL" && (
                        <span className={cn("inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[7px] font-bold tracking-widest", cfg.badge)}>
                            <span className={cn("h-1 w-1 rounded-full", cfg.dot)} />
                            {post.pair}
                        </span>
                    )}
                    {post.flair && (
                        <span className="rounded border border-white/[0.05] bg-white/[0.02] px-1.5 py-0.5 text-[7px] font-medium text-zinc-600 tracking-wide truncate max-w-[90px]">
                            {post.flair}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h5 className={cn(
                    "text-[11px] leading-[1.45] tracking-tight transition-colors line-clamp-2",
                    isTop ? "font-semibold text-zinc-100" : "font-medium text-zinc-400 group-hover:text-zinc-200"
                )}>
                    {post.title}
                </h5>

                {/* Meta row */}
                <div className="flex items-center gap-2 text-[9px] text-zinc-700">
                    <span>u/{post.author}</span>
                    <span className="flex items-center gap-0.5">
                        <MessageSquare className="h-2.5 w-2.5" />
                        {post.numComments}
                    </span>
                    <span className="ml-auto">{post.ago}</span>
                </div>
            </div>

            {/* External link */}
            <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100 self-start" />
        </a>
    );
}

function SkeletonCard() {
    return (
        <div className="flex gap-2.5 rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 animate-pulse">
            <div className="flex w-7 shrink-0 flex-col items-center gap-1">
                <div className="h-3 w-3 rounded bg-white/[0.06]" />
                <div className="h-2 w-5 rounded bg-white/[0.04]" />
            </div>
            <div className="flex-1 space-y-2">
                <div className="h-2 w-16 rounded bg-white/[0.05]" />
                <div className="h-3 w-4/5 rounded bg-white/[0.06]" />
                <div className="h-2 w-3/5 rounded bg-white/[0.04]" />
                <div className="h-2 w-1/2 rounded bg-white/[0.03]" />
            </div>
        </div>
    );
}

/* Pair selector pill */
function PairTab({ filter, active, count, onClick }: {
    filter: PairFilter; active: boolean; count: number; onClick: () => void;
}) {
    const cfg = PAIR_CFG[filter];
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[9px] font-bold tracking-wider transition-all duration-150",
                active
                    ? cfg.active
                    : "border-white/[0.06] bg-white/[0.02] text-zinc-600 hover:text-zinc-400 hover:border-white/[0.1]"
            )}
        >
            {filter !== "ALL" && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />}
            {filter === "ALL" ? "ALL" : filter}
            {count > 0 && (
                <span className={cn(
                    "rounded px-1 py-0.5 text-[7px] font-semibold tabular-nums",
                    active ? "bg-white/20 text-current" : "bg-white/[0.04] text-zinc-600"
                )}>
                    {count}
                </span>
            )}
        </button>
    );
}

/* ── Main panel ── */
export function RedditPanel() {
    const { data, isLoading, error, refetch, isFetching } = useRedditPosts();
    const [activeFilter, setActiveFilter] = React.useState<PairFilter>("ALL");

    const counts = React.useMemo(() => {
        const all = data?.posts ?? [];
        const result: Record<PairFilter, number> = { ALL: all.length, EURUSD: 0, GBPUSD: 0, XAUUSD: 0, USDJPY: 0 };
        for (const p of all) {
            if (p.pair in result) result[p.pair as PairFilter]++;
        }
        return result;
    }, [data?.posts]);

    const filtered = React.useMemo(() => {
        if (!data?.posts) return [];
        if (activeFilter === "ALL") return data.posts;
        return data.posts.filter((p) => p.pair === activeFilter);
    }, [data?.posts, activeFilter]);

    const displayPosts = filtered.slice(0, 12);

    return (
        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0e0d0f] to-[#0c0c0e] shadow-2xl">
            {/* orange glow */}
            <div className="pointer-events-none absolute -top-24 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-orange-500/[0.07] blur-[60px]" />

            {/* ── Header ── */}
            <div className="relative z-10 border-b border-white/[0.04] px-4 py-3.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        {/* Reddit snoo SVG */}
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/[0.08] shrink-0">
                            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-orange-400" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm5.74 9.28a1.3 1.3 0 0 1 .26.78 1.3 1.3 0 0 1-1.3 1.3 1.29 1.29 0 0 1-.82-.29c-.8.54-1.87.88-3.04.93l.52-2.43 1.68.36a.89.89 0 0 0 .88.87.89.89 0 0 0 .89-.89.89.89 0 0 0-.89-.89.89.89 0 0 0-.8.5l-1.88-.4a.12.12 0 0 0-.14.09l-.57 2.7c-1.2-.04-2.3-.38-3.12-.94a1.29 1.29 0 0 1-.82.29A1.3 1.3 0 0 1 5.3 9.28a1.3 1.3 0 0 1 1.3-1.3c.27 0 .52.08.73.22.73-.5 1.72-.82 2.8-.87L10.8 5.9a.12.12 0 0 1 .14-.09l1.98.42a.89.89 0 0 1 .83-.56.89.89 0 0 1 .89.89.89.89 0 0 1-.89.89.89.89 0 0 1-.88-.88l-1.77-.38-.44 2.08c1.08.05 2.05.37 2.77.86.21-.13.46-.2.73-.2a1.3 1.3 0 0 1 1.3 1.3zM8.05 10.5a.67.67 0 0 0-.67.67.67.67 0 0 0 .67.67.67.67 0 0 0 .67-.67.67.67 0 0 0-.67-.67zm3.9 0a.67.67 0 0 0-.67.67.67.67 0 0 0 .67.67.67.67 0 0 0 .67-.67.67.67 0 0 0-.67-.67zm-.94 2.42c-.44.44-1.28.48-1.52.48s-1.08-.04-1.52-.48a.12.12 0 0 0-.17.17c.56.56 1.56.6 1.69.6.13 0 1.13-.04 1.69-.6a.12.12 0 0 0-.17-.17z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-600">Community Pulse</p>
                            <h3 className="text-[13px] font-semibold leading-tight text-zinc-100">r/Forex</h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {!isLoading && !error && (
                            <div className="flex items-center gap-1 rounded-full border border-orange-500/10 bg-orange-500/[0.04] px-2 py-0.5">
                                <div className="relative h-1.5 w-1.5">
                                    <div className="absolute inset-0 animate-ping rounded-full bg-orange-400/50" style={{ animationDuration: "2s" }} />
                                    <div className="relative h-1 w-1 rounded-full bg-orange-400" />
                                </div>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-orange-400">Live</span>
                            </div>
                        )}
                        <button
                            onClick={() => refetch()}
                            disabled={isFetching}
                            title="Refresh posts"
                            className="rounded-lg p-1.5 text-zinc-600 hover:bg-white/[0.06] hover:text-zinc-300 disabled:opacity-30 transition-all"
                        >
                            <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin")} />
                        </button>
                    </div>
                </div>

                {/* Pair tabs */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {PAIR_FILTERS.map((f) => (
                        <PairTab
                            key={f}
                            filter={f}
                            active={f === activeFilter}
                            count={counts[f]}
                            onClick={() => setActiveFilter(f)}
                        />
                    ))}
                </div>
            </div>

            {/* ── Content ── */}
            <div className="relative z-10 flex-1">
                {/* Error */}
                {error && (
                    <div className="flex flex-col items-center gap-2.5 py-10 text-center">
                        <AlertCircle className="h-5 w-5 text-zinc-700" />
                        <p className="text-[11px] text-zinc-500">Could not load Reddit posts</p>
                        <button onClick={() => refetch()} className="text-[10px] text-orange-400 hover:text-orange-300 underline underline-offset-2">
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading */}
                {isLoading && !error && (
                    <div className="space-y-2 p-3">
                        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                )}

                {/* Empty */}
                {!isLoading && !error && displayPosts.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                        <TrendingUp className="h-5 w-5 text-zinc-700" />
                        <p className="text-[11px] text-zinc-600">
                            No posts found for <span className="text-zinc-400">{activeFilter}</span>
                        </p>
                    </div>
                )}

                {/* Posts feed */}
                {!isLoading && !error && displayPosts.length > 0 && (
                    <div className="space-y-1.5 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-white/[0.08] scrollbar-track-transparent"
                        style={{ maxHeight: "calc(100vh - 420px)", minHeight: 300 }}>
                        {displayPosts.map((post, idx) => (
                            <PostCard key={post.id} post={post} rank={idx} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Footer ── */}
            {!isLoading && !error && displayPosts.length > 0 && (
                <div className="relative z-10 flex items-center justify-between border-t border-white/[0.04] px-4 py-2.5">
                    <span className="text-[8px] text-zinc-700 tabular-nums">
                        {filtered.length} posts · feeds AI analysis
                    </span>
                    <a
                        href={`https://www.reddit.com/r/Forex/${activeFilter !== "ALL" ? `search/?q=${activeFilter}&sort=new&restrict_sr=1` : "new/"}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[9px] text-zinc-600 hover:text-orange-400 transition-colors"
                    >
                        Open Reddit <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                </div>
            )}
        </div>
    );
}
